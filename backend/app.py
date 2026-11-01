import asyncio
import hashlib
import hmac
import json
import logging
import os
import re
import secrets
import time
import unicodedata
from collections import deque
from contextlib import asynccontextmanager
from pathlib import Path

import httpx
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field, field_validator

from . import db, exa, notify
from .bolna import Bolna
from .languages import DEFAULT_LANGUAGE, LANGUAGES, asked, greeting, in_script
from .stacks import DEFAULT_STACK, STACKS, Session, pick_stack, stack_for_agent
from .verdict import CHILD_CONFIRMED, CHILD_SAFE, NOT_CONFIRMED, SEALED, decide, normalize_word, seal_word, word_key

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
log = logging.getLogger("asli")


class DropQuery(logging.Filter):
    # Tap links carry the family's key and /lookup carries a phone number, both in the query string.
    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.args, tuple) and len(record.args) >= 3:
            args = list(record.args)
            args[2] = str(args[2]).split("?", 1)[0]
            record.args = tuple(args)
        return True


logging.getLogger("uvicorn.access").addFilter(DropQuery())

WEB_DIR = Path(__file__).resolve().parent.parent / "web"
RETAP_WINDOW_S = 30
RESCUES_PER_HOUR = 10
PRESSES_PER_HOUR = 20
RESCUES_PER_NUMBER_PER_HOUR = 15
CHECKS_PER_NUMBER_PER_HOUR = 40
NAME_MAX = 40
INVITE_FAILURES_MAX = 100
INVITE_FAILURES_PER_CLIENT = 10
INVITE_FAILURE_WINDOW_S = 15 * 60
MAX_BODY_BYTES = 64 * 1024
SECURITY_HEADERS = {
    "Content-Security-Policy": (
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; object-src 'none'; "
        "base-uri 'none'; form-action 'self'; frame-ancestors 'none'"
    ),
    # Tap links carry the family's key in the query string, so no page may pass its URL on.
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
    "Strict-Transport-Security": "max-age=31536000",
}
DRILL_WINDOW_S = 30 * 60
UNREACHED = {"no-answer", "busy", "failed", "canceled", "error", "balance-low"}
CHECK_FINAL = UNREACHED | {"completed", "stopped"}
PARENT_ENDED = CHECK_FINAL | {"call-disconnected"}
MAYBE_SENT = (httpx.ReadTimeout, httpx.WriteTimeout)
ALERT_CLAIMS = {"authority", "paid"}
RESCUE_RETRIES = 12
RESCUE_RETRY_S = 5.0
DRILL_EXPECTED = {1: CHILD_SAFE, 2: CHILD_SAFE, 3: "authority", 4: "authority"}
AUTHORITY_MARK = "डिजिटल अरेस्ट नाम की कोई चीज़"
PAID_MARK = "अभी तुरंत 1930 पर कॉल कीजिए"
PLACEHOLDER = re.compile(r"^%\(\w+\)s$")


class Runtime:
    def __init__(self):
        self.bolna = None
        self.sender = None
        self.timers: dict[str, asyncio.Task] = {}
        self.tasks: set[asyncio.Task] = set()
        self.invite_failures: deque[tuple[float, str]] = deque()

    def spawn(self, coro) -> asyncio.Task:
        task = asyncio.create_task(coro)
        self.tasks.add(task)
        task.add_done_callback(self._reap)
        return task

    def _reap(self, task: asyncio.Task) -> None:
        self.tasks.discard(task)
        if not task.cancelled() and task.exception():
            log.error("background task failed", exc_info=task.exception())


rt = Runtime()


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.init_db()
    seal_stored_words()
    rt.invite_failures.clear()
    owned = rt.bolna is None
    if owned:
        rt.bolna = Bolna()
    owned_sender = rt.sender is None
    if owned_sender:
        rt.sender = notify.from_env(rt.bolna)
    rearm_timers()
    yield
    for task in list(rt.tasks):
        task.cancel()
    rt.timers.clear()
    if owned_sender:
        rt.sender = None
    if owned:
        await rt.bolna.aclose()
        rt.bolna = None


app = FastAPI(title="Asli hai?", lifespan=lifespan, docs_url=None, redoc_url=None, openapi_url=None)


class BodyLimit:
    """Counts request bytes as they arrive, so a chunked body with no Content-Length can't slip past the cap."""

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)
        length = dict(scope["headers"]).get(b"content-length")
        if length and (not length.isdigit() or int(length) > MAX_BODY_BYTES):
            return await JSONResponse({"detail": "Request too large"}, status_code=413)(scope, receive, send)
        seen = 0

        async def counted():
            nonlocal seen
            message = await receive()
            seen += len(message.get("body", b""))
            if seen > MAX_BODY_BYTES:
                raise HTTPException(413, "Request too large")
            return message

        await self.app(scope, counted, send)


app.add_middleware(BodyLimit)


@app.middleware("http")
async def guard(request: Request, call_next):
    response = await call_next(request)
    response.headers.update(SECURITY_HEADERS)
    if not request.url.path.startswith("/web/"):
        response.headers["Cache-Control"] = "no-store"
    return response


def require_secret(request: Request) -> None:
    expected = os.getenv("TOOL_SECRET", "")
    auth = request.headers.get("authorization", "")
    given = auth[7:] if auth.lower().startswith("bearer ") else ""
    if not expected or not hmac.compare_digest(given.encode(), expected.encode()):
        raise HTTPException(401, "Bad or missing secret")


async def payload(request: Request) -> dict:
    try:
        body = await request.json()
    except (ValueError, RecursionError):
        return {}
    return body if isinstance(body, dict) else {}


def clean(value) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    if not text or text.lower() in {"none", "null", "undefined"} or PLACEHOLDER.match(text):
        return None
    return text


def parse_amount(value) -> float | None:
    digits = re.sub(r"[^\d.]", "", clean(value) or "")
    try:
        return float(digits) if digits else None
    except ValueError:
        return None


def to_e164(raw: str) -> str:
    digits = re.sub(r"\D", "", raw or "")
    if len(digits) == 11 and digits.startswith("0"):
        digits = digits[1:]
    if len(digits) == 10:
        digits = "91" + digits
    if len(digits) != 12 or not digits.startswith("91") or digits[2] not in "6789":
        raise ValueError(raw)
    return "+" + digits


def tokens(text: str | None) -> set[str]:
    return {t for t in re.split(r"[^\wऀ-ॿ]+", (text or "").lower()) if t}


def contact_order(contacts: list[dict], claimed_name: str | None) -> list[dict]:
    ordered = sorted(contacts, key=lambda c: c["priority"])
    said = tokens(claimed_name)
    match = next((c for c in ordered if said & tokens(f"{c['name']} {c['relation'] or ''}")), None)
    if match is None:
        return ordered
    return [match] + [c for c in ordered if c is not match]


def tag(family_id: str) -> str:
    # family_id unlocks the parent's button, so logs carry only a short fingerprint of it.
    return hashlib.sha256(family_id.encode()).hexdigest()[:8]


def plain_name(value: str) -> str:
    # Names are spoken aloud and put into agent prompts, so only letters, marks, spaces and . ' - get through.
    value = " ".join(value.split())
    if not all(unicodedata.category(ch)[0] in "LM" or ch in " .'-" for ch in value):
        raise ValueError("Use only letters and spaces")
    return value


def seal_stored_words() -> None:
    if not word_key():
        log.warning("WORD_KEY and TOOL_SECRET are unset; family words stay as stored")
        return
    rows = db.all_rows("SELECT id, family_word_latin, family_word_native FROM families WHERE family_word_latin NOT LIKE ?", SEALED + "%")
    for row in rows:
        db.execute("UPDATE families SET family_word_latin = ?, family_word_native = ? WHERE id = ?",
                   seal_word(row["family_word_latin"]), seal_word(row["family_word_native"]), row["id"])
    if rows:
        log.info("sealed family words families=%d", len(rows))


def reserve_call(phone: str, kind: str, cap: int, family_id: str | None = None) -> int | None:
    """Claims one of a number's hourly call slots, or None when they're used up.

    Rescue calls are capped per number across every family, which never blocks a check. Check and alert calls are
    capped per family and number, so no other family's traffic can ever stop a real family's check.
    Check and claim are one statement, so concurrent presses can't overshoot.
    """
    now = time.time()
    with db.connect() as conn:
        cur = conn.execute(
            "INSERT INTO outbound (phone, at, kind, family_id) SELECT ?, ?, ?, ?"
            " WHERE (SELECT COUNT(*) FROM outbound WHERE phone = ? AND kind = ? AND at > ?"
            " AND (? IS NULL OR family_id = ?)) < ?",
            (phone, now, kind, family_id, phone, kind, now - 3600, family_id, family_id, cap),
        )
        if cur.rowcount:
            return cur.lastrowid
    log.warning("%s cap reached for a contact number", kind)
    return None


def release_call(slot: int) -> None:
    db.execute("DELETE FROM outbound WHERE rowid = ?", slot)


def client_ip(request: Request) -> str:
    # Cloudflare in front of Render sets CF-Connecting-IP and overwrites any value a client sends.
    return request.headers.get("cf-connecting-ip") or (request.client.host if request.client else "")


def new_id(prefix: str) -> str:
    return f"{prefix}_{secrets.token_urlsafe(8)}"


def get_session(session_id: str | None) -> dict:
    session = db.one("SELECT * FROM sessions WHERE id = ?", session_id) if session_id else None
    if not session:
        raise HTTPException(404, "Unknown session")
    return session


def family_contacts(family_id: str) -> list[dict]:
    return db.all_rows("SELECT * FROM contacts WHERE family_id = ? ORDER BY priority", family_id)


def claim_from_execution(data: dict) -> str | None:
    extracted = {**(data.get("extracted_data") or {}), **(data.get("node_extracted_data") or {})}
    transcript = str(data.get("transcript") or "")
    if extracted.get("claimed_authority") or AUTHORITY_MARK in transcript:
        return "authority"
    if extracted.get("paid_amount") is not None or PAID_MARK in transcript:
        return "paid"
    return None


async def finish(session_id: str, event: str, properties: dict, reason: str) -> bool:
    now = time.time()
    if not db.execute("UPDATE sessions SET verdict = ?, verdict_at = ? WHERE id = ? AND verdict IS NULL", event, now, session_id):
        return False
    timer = rt.timers.pop(session_id, None)
    if timer and timer is not asyncio.current_task():
        timer.cancel()

    session = db.one("SELECT * FROM sessions WHERE id = ?", session_id)
    if session["parent_run_id"]:
        try:
            await rt.bolna.fire_event(session["parent_run_id"], event, properties)
        except Exception:
            log.exception("fire_event failed session=%s event=%s", session_id, event)

    seconds = round(now - session["started_at"], 1)
    log.info("verdict session=%s stack=%s event=%s reason=%s seconds_to_verdict=%.1f",
             session_id, session["stack"], event, reason, seconds)
    if session["drill_id"]:
        record_drill(session["drill_id"], event, seconds)
    if session["parent_ended_at"]:
        send_summary(session_id)
    return True


def record_drill(drill_id: int, outcome: str | None, seconds: float | None) -> None:
    drill = db.one("SELECT script FROM drills WHERE id = ?", drill_id)
    correct = int(DRILL_EXPECTED.get(drill["script"]) == outcome) if drill else None
    db.execute("UPDATE drills SET seconds_to_verdict = ?, verdict_correct = ? WHERE id = ?", seconds, correct, drill_id)


def verdict_timeout_s() -> float:
    return float(os.getenv("VERDICT_TIMEOUT_S", "75"))


async def verdict_timeout(session_id: str, delay: float) -> None:
    await asyncio.sleep(delay)
    rt.timers.pop(session_id, None)
    await finish(session_id, NOT_CONFIRMED, {}, "timeout")


def arm_timer(session_id: str) -> None:
    old = rt.timers.pop(session_id, None)
    if old:
        old.cancel()
    rt.timers[session_id] = rt.spawn(verdict_timeout(session_id, verdict_timeout_s()))


def rearm_timers() -> None:
    now = time.time()
    pending = db.all_rows(
        "SELECT id, verification_started_at FROM sessions WHERE verdict IS NULL AND verification_started_at > ?",
        now - 10 * 60,
    )
    for row in pending:
        delay = max(0.0, row["verification_started_at"] + verdict_timeout_s() - now)
        rt.timers[row["id"]] = rt.spawn(verdict_timeout(row["id"], delay))


def check_user_data(session: dict, family: dict, contact: dict, mode: str) -> dict:
    claimed_name = session["claimed_name"] or contact["name"]
    kind = {"verify": "check", "alert": f"alert_{session['claim_type']}"}.get(mode, mode)
    return {
        "session_id": session["id"],
        "child_name": contact["name"],
        "parent_name": family["parent_name"],
        "claimed_name": claimed_name,
        "amount_asked": session["amount"] or 0,
        "did_call": "Unsure",
        "spoken_word": "",
        "agent_language": family["language"],
        "mode": mode,
        "greeting": greeting(family["language"], kind, child_name=contact["name"], parent_name=family["parent_name"], claimed_name=claimed_name),
    }


async def dial(session_id: str, start: int) -> None:
    session = db.one("SELECT * FROM sessions WHERE id = ?", session_id)
    family = db.one("SELECT parent_name, language FROM families WHERE id = ?", session["family_id"])
    alert = bool(session["alert_started_at"])
    order = contact_order(family_contacts(session["family_id"]), session["claimed_name"])
    agent_id = STACKS.get(session["stack"], {}).get("check")
    if not agent_id:
        log.error("no check agent for stack=%s", session["stack"])
        order = []

    for contact in order[start:]:
        if db.one("SELECT verdict FROM sessions WHERE id = ?", session_id)["verdict"]:
            return
        slot = reserve_call(contact["phone"], "check", CHECKS_PER_NUMBER_PER_HOUR, session["family_id"])
        if slot is None:
            continue
        try:
            run_id = await rt.bolna.place_call(agent_id, contact["phone"], check_user_data(session, family, contact, "alert" if alert else "verify"))
        except MAYBE_SENT:
            # Bolna may already be ringing this contact; dialing the next would ring two phones at once.
            log.error("check call timed out session=%s priority=%s; leaving it to the timer", session_id, contact["priority"])
            return
        except Exception:
            release_call(slot)
            log.exception("check call failed session=%s priority=%s", session_id, contact["priority"])
            continue
        db.execute("UPDATE sessions SET check_run_id = ?, contact_priority = ? WHERE id = ?", run_id, contact["priority"], session_id)
        log.info("%s call session=%s priority=%s run=%s", "alert" if alert else "check", session_id, contact["priority"], run_id)
        return

    if alert:
        log.warning("alert reached no one session=%s", session_id)
        return
    await finish(session_id, NOT_CONFIRMED, {}, "no contact reachable")


async def start_alert(session_id: str, claim: str) -> bool:
    if not db.execute(
        "UPDATE sessions SET alert_started_at = ?, claim_type = COALESCE(claim_type, ?)"
        " WHERE id = ? AND alert_started_at IS NULL AND verification_started_at IS NULL",
        time.time(), claim, session_id,
    ):
        return False
    log.info("alerting family session=%s claim=%s", session_id, claim)
    session = db.one("SELECT * FROM sessions WHERE id = ?", session_id)
    family = db.one("SELECT parent_name, language FROM families WHERE id = ?", session["family_id"])
    if not await tell_rescue(session_id, "rescue_update", rescue_story(session, family, f"update_{claim}")):
        rt.spawn(dial(session_id, 0))
    return True


def rescue_enabled() -> bool:
    # The rescue call runs alongside the parent's, so it needs a Bolna concurrency of at least 2.
    return os.getenv("RESCUE_CALLS", "on").lower() not in {"off", "0", "false", "no"}


def rescue_capped(family_id: str, now: float) -> bool:
    # The tap link is the only key. Past the cap a press still reaches the parent; it just stops ringing the family.
    rescues = db.one("SELECT COUNT(*) AS n FROM sessions WHERE family_id = ? AND started_at > ? AND rescue_requested_at IS NOT NULL",
                     family_id, now - 3600)["n"]
    if rescues >= RESCUES_PER_HOUR:
        log.warning("rescue cap reached family=%s", tag(family_id))
        return True
    return False


def rescue_live(session: dict) -> bool:
    return bool(session["rescue_run_id"]) and not session["rescue_ended_at"]


def rescue_story(session: dict, family: dict, kind: str) -> dict:
    lang = family["language"]
    return {"update": greeting(lang, kind, parent_name=family["parent_name"], claimed_name=session["claimed_name"] or "", asked=asked(lang, session["amount"]))}


async def start_rescue(session_id: str, after_priority: int = 0) -> None:
    session = db.one("SELECT * FROM sessions WHERE id = ?", session_id)
    family = db.one("SELECT parent_name, language FROM families WHERE id = ?", session["family_id"])
    agent_id = STACKS.get(session["stack"], {}).get("check")
    if not agent_id:
        log.error("no check agent for stack=%s", session["stack"])
        return
    for contact in family_contacts(session["family_id"]):
        if contact["priority"] <= after_priority:
            continue
        slot = reserve_call(contact["phone"], "rescue", RESCUES_PER_NUMBER_PER_HOUR)
        if slot is None:
            continue
        try:
            run_id = await rt.bolna.place_call(agent_id, contact["phone"], check_user_data(session, family, contact, "rescue"))
        except MAYBE_SENT:
            log.error("rescue call timed out session=%s priority=%s", session_id, contact["priority"])
            return
        except Exception:
            release_call(slot)
            log.exception("rescue call failed session=%s priority=%s", session_id, contact["priority"])
            continue
        db.execute("UPDATE sessions SET rescue_run_id = ?, rescue_priority = ?, rescue_ended_at = NULL WHERE id = ?",
                   run_id, contact["priority"], session_id)
        log.info("rescue call session=%s priority=%s run=%s", session_id, contact["priority"], run_id)
        return
    log.warning("rescue reached no one session=%s", session_id)


async def tell_rescue(session_id: str, event: str, properties: dict) -> bool:
    """Queues the story for the live rescue call; False when there is none to tell."""
    if not db.execute(
        "UPDATE sessions SET rescue_pending = ? WHERE id = ? AND rescue_run_id IS NOT NULL"
        " AND rescue_ended_at IS NULL AND rescue_pending IS NULL",
        json.dumps({"event": event, "properties": properties}, ensure_ascii=False), session_id,
    ):
        return False
    if not await deliver_rescue(session_id):
        rt.spawn(keep_telling_rescue(session_id))
    return True


async def deliver_rescue(session_id: str) -> bool:
    # Claiming first stops the in-progress webhook and a retry from both firing the event.
    if not db.execute(
        "UPDATE sessions SET rescue_told_at = ? WHERE id = ? AND rescue_pending IS NOT NULL"
        " AND rescue_told_at IS NULL AND rescue_ended_at IS NULL",
        time.time(), session_id,
    ):
        return False
    session = db.one("SELECT * FROM sessions WHERE id = ?", session_id)
    pending = json.loads(session["rescue_pending"])
    try:
        await rt.bolna.fire_event(session["rescue_run_id"], pending["event"], pending["properties"])
    except Exception:
        db.execute("UPDATE sessions SET rescue_told_at = NULL WHERE id = ?", session_id)
        log.info("rescue call not connected yet session=%s event=%s", session_id, pending["event"])
        return False
    log.info("rescue told session=%s event=%s", session_id, pending["event"])
    return True


async def keep_telling_rescue(session_id: str) -> None:
    # Bolna rejects events until the contact picks up, and the in-progress webhook can be missed.
    for _ in range(RESCUE_RETRIES):
        await asyncio.sleep(RESCUE_RETRY_S)
        session = db.one("SELECT * FROM sessions WHERE id = ?", session_id)
        if session["rescue_told_at"] or not rescue_live(session) or await deliver_rescue(session_id):
            return


async def check_on_rescue(session_id: str, order: list[dict]) -> bool:
    """Routes a family claim through the live rescue call; True means don't dial now."""
    session = db.one("SELECT * FROM sessions WHERE id = ?", session_id)
    if not rescue_live(session) or not order:
        return False
    family = db.one("SELECT parent_name, language FROM families WHERE id = ?", session["family_id"])
    claimed = session["claimed_name"] or order[0]["name"]
    if order[0]["priority"] != session["rescue_priority"]:
        # The claimed person is dialled once the rescue call ends, so two family calls never overlap.
        return await tell_rescue(session_id, "rescue_update", rescue_story(session, family, "update_other"))
    db.execute("UPDATE sessions SET check_run_id = rescue_run_id, contact_priority = rescue_priority WHERE id = ?", session_id)
    verify = {
        "verify_line": greeting(family["language"], "verify", parent_name=family["parent_name"], claimed_name=claimed),
        "claimed_name": claimed,
        "amount_asked": session["amount"] or 0,
    }
    if await tell_rescue(session_id, "rescue_verify", verify):
        return True
    db.execute("UPDATE sessions SET check_run_id = NULL, contact_priority = NULL WHERE id = ?", session_id)
    return False


def summary_text(session: dict, family: dict) -> str:
    who = session["claimed_name"] or "someone"
    asked = f" asking for Rs {session['amount']:,.0f}" if session["amount"] else ""
    outcomes = {
        CHILD_SAFE: f"The family said they did not call. Saathi told {family['parent_name']} it was fake and not to pay.",
        CHILD_CONFIRMED: f"The family confirmed the call with the family word. Saathi told {family['parent_name']} it was genuine.",
        NOT_CONFIRMED: f"Saathi could not reach the family in time and told {family['parent_name']} not to pay until they speak to you.",
        "authority": f"The caller claimed to be police or an official. Saathi told {family['parent_name']} to hang up and not pay.",
        "paid": f"{family['parent_name']} may have already sent money or an OTP. Saathi told them to call 1930 and their bank. Please call them now.",
    }
    outcome = outcomes.get(session["verdict"] or session["claim_type"], f"{family['parent_name']} used the line; no verdict was reached.")
    return f"{family['parent_name']} got a call from {who}{asked}. {outcome}"


def send_summary(session_id: str) -> None:
    if not db.execute("UPDATE sessions SET summary_sent_at = ? WHERE id = ? AND summary_sent_at IS NULL", time.time(), session_id):
        return
    if rt.sender is None:
        log.warning("no summary sender configured (SUMMARY_WORKFLOW_ID) session=%s", session_id)
        return
    session = db.one("SELECT * FROM sessions WHERE id = ?", session_id)
    family = db.one("SELECT * FROM families WHERE id = ?", session["family_id"])
    contacts = family_contacts(session["family_id"])
    # Spawned so a slow or failing provider never holds up the verdict or the webhook reply.
    rt.spawn(notify.deliver(rt.sender, session_id, contacts, summary_text(session, family)))


def parent_user_data(session_id: str, family: dict) -> dict:
    return {
        "session_id": session_id,
        "parent_name": family["parent_name"],
        "timezone": "Asia/Kolkata",
        "agent_language": family["language"],
        "greeting": greeting(family["language"], "parent", parent_name=family["parent_name"]),
    }


class ContactIn(BaseModel):
    name: str = Field(min_length=1, max_length=NAME_MAX)
    relation: str = Field("", max_length=NAME_MAX)
    phone: str = Field(max_length=20)

    _names = field_validator("name", "relation")(plain_name)


class FamilyIn(BaseModel):
    parent_name: str = Field(min_length=1, max_length=NAME_MAX)
    parent_phone: str = Field(max_length=20)
    language: str = Field(DEFAULT_LANGUAGE, max_length=10)
    contacts: list[ContactIn] = Field(min_length=1, max_length=2)
    family_word_latin: str = Field(min_length=1, max_length=60)
    family_word_native: str = Field("", max_length=60)
    invite_code: str = ""

    _names = field_validator("parent_name")(plain_name)


class TriggerIn(BaseModel):
    family_id: str = Field(max_length=40)
    drill_id: int | None = None


@app.get("/")
def home():
    return RedirectResponse("/web/")


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/families")
def register_family(body: FamilyIn, request: Request):
    code = os.getenv("SIGNUP_CODE")
    failures, now, ip = rt.invite_failures, time.time(), client_ip(request)
    while failures and failures[0][0] < now - INVITE_FAILURE_WINDOW_S:
        failures.popleft()
    # Per client, so one guesser can't lock out real families; the global ceiling only stops a distributed guess.
    if code and (len(failures) >= INVITE_FAILURES_MAX or sum(who == ip for _, who in failures) >= INVITE_FAILURES_PER_CLIENT):
        raise HTTPException(429, "Too many wrong invite codes. Try again in a few minutes.")
    if code and not hmac.compare_digest(body.invite_code.strip().encode(), code.encode()):
        failures.append((now, ip))
        raise HTTPException(403, "That invite code isn't valid. Ask the pilot team for yours.")
    try:
        parent_phone = to_e164(body.parent_phone)
        phones = [to_e164(c.phone) for c in body.contacts]
    except ValueError:
        raise HTTPException(400, "Use a 10-digit Indian mobile number for every phone.")
    if body.language not in LANGUAGES:
        raise HTTPException(400, "Pick one of the listed languages.")
    native = body.family_word_native.strip() or body.family_word_latin.strip()
    if not normalize_word(body.family_word_latin) or not in_script(native, body.language):
        raise HTTPException(400, f"Type the family word in English letters and in {LANGUAGES[body.language]['name']} letters.")
    if db.one("SELECT 1 FROM families WHERE parent_phone = ?", parent_phone):
        raise HTTPException(409, "This parent's number is already registered.")

    family_id = new_id("f")
    with db.connect() as conn:
        conn.execute(
            "INSERT INTO families (id, parent_name, parent_phone, language, family_word_latin, family_word_native) VALUES (?, ?, ?, ?, ?, ?)",
            (family_id, body.parent_name, parent_phone, body.language, seal_word(body.family_word_latin), seal_word(native)),
        )
        conn.executemany(
            "INSERT INTO contacts (family_id, name, relation, phone, priority) VALUES (?, ?, ?, ?, ?)",
            [(family_id, c.name, c.relation, phone, i) for i, (c, phone) in enumerate(zip(body.contacts, phones), 1)],
        )
    log.info("family registered family=%s contacts=%d", tag(family_id), len(phones))
    return {"family_id": family_id, "tap_url": f"/web/tap.html?f={family_id}&l={body.language}"}


@app.post("/trigger")
async def trigger(body: TriggerIn):
    family = db.one("SELECT * FROM families WHERE id = ?", body.family_id)
    if not family:
        raise HTTPException(404, "Unknown family")
    now = time.time()
    recent = db.one(
        "SELECT id FROM sessions WHERE family_id = ? AND started_at > ? AND parent_ended_at IS NULL ORDER BY started_at DESC LIMIT 1",
        family["id"], now - RETAP_WINDOW_S,
    )
    if recent:
        return {"session_id": recent["id"], "repeat": True}
    # Generous enough that a frightened parent never hits it; a leaked link can't place calls without end.
    if db.one("SELECT COUNT(*) AS n FROM sessions WHERE family_id = ? AND started_at > ?", family["id"], now - 3600)["n"] >= PRESSES_PER_HOUR:
        log.warning("press cap reached family=%s", tag(family["id"]))
        raise HTTPException(429, "Too many presses in the last hour")

    drill = db.one(
        "SELECT id FROM drills d WHERE family_id = ? AND (id = ? OR (? IS NULL AND ran_at > ?))"
        " AND NOT EXISTS (SELECT 1 FROM sessions s WHERE s.drill_id = d.id) ORDER BY ran_at DESC LIMIT 1",
        family["id"], body.drill_id, body.drill_id, now - DRILL_WINDOW_S,
    )
    drill_id = drill["id"] if drill else None
    # The comparison speech stack only speaks Hindi; Cerebras uses Sarvam speech and works in every language.
    if family["language"] == DEFAULT_LANGUAGE:
        stack = pick_stack(Session(drill_id))
    else:
        stack = DEFAULT_STACK if DEFAULT_STACK != "compare" else "sarvam"
    agent_id = STACKS.get(stack, {}).get("parent")
    if not agent_id:
        raise HTTPException(503, f"No parent agent configured for stack {stack}")

    session_id = new_id("s")
    db.execute("INSERT INTO sessions (id, family_id, stack, started_at, drill_id) VALUES (?, ?, ?, ?, ?)",
               session_id, family["id"], stack, now, drill_id)
    if drill_id:
        db.execute("UPDATE drills SET used_line = 1, stack = ? WHERE id = ?", stack, drill_id)

    try:
        run_id = await rt.bolna.place_call(agent_id, family["parent_phone"], parent_user_data(session_id, family))
    except Exception as exc:
        log.exception("parent call failed session=%s", session_id)
        if not isinstance(exc, MAYBE_SENT):
            db.execute("UPDATE sessions SET parent_ended_at = ? WHERE id = ?", time.time(), session_id)
        raise HTTPException(502, "Could not place the call")
    db.execute("UPDATE sessions SET parent_run_id = ? WHERE id = ?", run_id, session_id)
    log.info("session started id=%s stack=%s drill=%s run=%s", session_id, stack, drill_id, run_id)
    # Drills are timed rehearsals, so they leave the family's phones alone.
    if rescue_enabled() and not drill_id and not rescue_capped(family["id"], now):
        db.execute("UPDATE sessions SET rescue_requested_at = ? WHERE id = ?", now, session_id)
        rt.spawn(start_rescue(session_id))
    return {"session_id": session_id}


@app.post("/tools/search_web", dependencies=[Depends(require_secret)])
async def search_web(request: Request):
    data = await payload(request)
    session = get_session(clean(data.get("session_id")))
    if session["verdict"]:
        return {"available": False, "message": "The safety check has already finished."}
    api_key = os.getenv("EXA_API_KEY", "").strip()
    family = db.one("SELECT parent_name FROM families WHERE id = ?", session["family_id"])
    private_names = [family["parent_name"], session.get("claimed_name")]
    private_names.extend(contact["name"] for contact in family_contacts(session["family_id"]))
    query = exa.safe_query(data.get("query"), private_names)
    if not api_key:
        return {"available": False, "message": "Web search is not configured."}
    if not query:
        return {"available": False, "message": "No searchable claim was provided."}
    try:
        results = await exa.search(api_key, query)
    except httpx.HTTPError:
        log.warning("Exa search unavailable session=%s", session["id"])
        return {"available": False, "message": "Official web search is temporarily unavailable."}
    return {"available": True, "results": results}


@app.post("/tools/start_verification", dependencies=[Depends(require_secret)])
async def start_verification(request: Request):
    data = await payload(request)
    session = get_session(clean(data.get("session_id")))
    claimed_name = clean(data.get("claimed_name"))
    started = db.execute(
        "UPDATE sessions SET verification_started_at = ?, claimed_name = ?, amount = ?, story = ?, claim_type = 'family'"
        " WHERE id = ? AND verification_started_at IS NULL",
        time.time(), claimed_name, parse_amount(data.get("amount_asked")), clean(data.get("story")), session["id"],
    )
    if not started:
        claimed_name = session["claimed_name"]
    order = contact_order(family_contacts(session["family_id"]), claimed_name)
    calling = order[0]["name"] if order else ""
    if not started:
        current = next((c for c in order if c["priority"] == session["contact_priority"]), None)
        log.info("start_verification repeat ignored session=%s", session["id"])
        return {"calling": current["name"] if current else calling}

    arm_timer(session["id"])
    if not await check_on_rescue(session["id"], order):
        rt.spawn(dial(session["id"], 0))
    return {"calling": calling}


@app.post("/tools/alert_family", dependencies=[Depends(require_secret)])
async def alert_family(request: Request):
    data = await payload(request)
    session = get_session(clean(data.get("session_id")))
    claim = clean(data.get("claim"))
    started = await start_alert(session["id"], claim if claim in ALERT_CLAIMS else "authority")
    order = contact_order(family_contacts(session["family_id"]), session["claimed_name"])
    return {"alerting": order[0]["name"] if order and (started or session["alert_started_at"]) else ""}


@app.post("/tools/retry_family", dependencies=[Depends(require_secret)])
async def retry_family(request: Request):
    data = await payload(request)
    session = get_session(clean(data.get("session_id")))
    now = time.time()
    if db.execute(
        "UPDATE sessions SET verdict = NULL, verdict_at = NULL, verification_started_at = ?, retried_at = ?, check_run_id = NULL"
        " WHERE id = ? AND verdict = ? AND retried_at IS NULL",
        now, now, session["id"], NOT_CONFIRMED,
    ):
        log.info("retrying family session=%s", session["id"])
        arm_timer(session["id"])
        rt.spawn(dial(session["id"], 0))
        order = contact_order(family_contacts(session["family_id"]), session["claimed_name"])
        return {"calling": order[0]["name"] if order else ""}
    # Saathi is now waiting for a verdict event, so repeat the one already given rather than leave her hanging.
    verdict = session["verdict"] or (None if session["verification_started_at"] else NOT_CONFIRMED)
    if verdict and session["parent_run_id"]:
        try:
            await rt.bolna.fire_event(session["parent_run_id"], verdict, {})
        except Exception:
            log.exception("fire_event failed session=%s event=%s", session["id"], verdict)
    return {"calling": ""}


@app.post("/tools/report_verdict", dependencies=[Depends(require_secret)])
async def report_verdict(request: Request):
    data = await payload(request)
    session = get_session(clean(data.get("session_id")))
    if session["alert_started_at"]:
        return {"received": True}
    family = db.one("SELECT * FROM families WHERE id = ?", session["family_id"])
    contact = db.one("SELECT name FROM contacts WHERE family_id = ? AND priority = ?", session["family_id"], session["contact_priority"])
    event, properties = decide(clean(data.get("did_call")), clean(data.get("spoken_word")), family, contact["name"] if contact else "")
    await finish(session["id"], event, properties, "report")
    return {"received": True}


@app.post("/webhooks/bolna")
async def bolna_webhook(request: Request):
    run_id = clean((await payload(request)).get("id"))
    session = db.one("SELECT * FROM sessions WHERE check_run_id = ? OR parent_run_id = ? OR rescue_run_id = ?", run_id, run_id, run_id) if run_id else None
    if not session:
        return {"ok": True}
    # Bolna webhooks are unsigned, so act only on the execution as Bolna's API reports it.
    try:
        data = await rt.bolna.get_execution(run_id)
    except Exception:
        log.exception("get_execution failed run=%s", run_id)
        return {"ok": False}
    status = (clean(data.get("status")) or "").lower()
    breach = guardrail_breach(data)
    if breach:
        log.warning("guardrail breach session=%s run=%s rule=%s", session["id"], run_id, breach)
    session = db.one("SELECT * FROM sessions WHERE id = ?", session["id"])
    if session["rescue_run_id"] == run_id:
        await on_rescue_status(session, run_id, status, data)
        session = db.one("SELECT * FROM sessions WHERE id = ?", session["id"])
    if session["check_run_id"] == run_id:
        await on_check_status(session, run_id, status, data)
    elif session["parent_run_id"] == run_id and status in PARENT_ENDED:
        await on_parent_ended(session, status, data)
    return {"ok": True}


def guardrail_breach(data: dict) -> str | None:
    # Set by the guardrail_breach disposition in each agent's Safety_Audit category, once Bolna's post-call pass runs.
    for source in (data.get("custom_extractions"), data.get("extracted_data")):
        audit = source.get("Safety_Audit") if isinstance(source, dict) else None
        rule = ((audit or {}).get("guardrail_breach") or {}).get("objective")
        if rule and rule not in {"None", "NA"}:
            return rule
    return None


def not_answered(status: str, data: dict) -> bool:
    if status in UNREACHED or data.get("answered_by_voice_mail"):
        return True
    return status == "completed" and not data.get("conversation_duration")


async def on_check_status(session: dict, run_id: str, status: str, data: dict) -> None:
    unreached = not_answered(status, data)
    if session["verdict"] or not (unreached or status in CHECK_FINAL):
        return
    # Bolna repeats status webhooks; clearing the run id lets exactly one of them advance the session.
    if not db.execute("UPDATE sessions SET check_run_id = NULL WHERE id = ? AND check_run_id = ?", session["id"], run_id):
        return
    if not unreached:
        if not session["alert_started_at"]:
            await finish(session["id"], NOT_CONFIRMED, {}, f"check call {status} without report")
        return
    order = contact_order(family_contacts(session["family_id"]), session["claimed_name"])
    index = next((i for i, c in enumerate(order) if c["priority"] == session["contact_priority"]), len(order))
    log.info("check call unreached session=%s status=%s priority=%s", session["id"], status, session["contact_priority"])
    await dial(session["id"], index + 1)


async def on_rescue_status(session: dict, run_id: str, status: str, data: dict) -> None:
    if status == "in-progress":
        await deliver_rescue(session["id"])
        return
    unreached = not_answered(status, data)
    if not (unreached or status in CHECK_FINAL):
        return
    if not db.execute("UPDATE sessions SET rescue_ended_at = ? WHERE id = ? AND rescue_run_id = ? AND rescue_ended_at IS NULL",
                      time.time(), session["id"], run_id):
        return
    session = db.one("SELECT * FROM sessions WHERE id = ?", session["id"])
    if session["verdict"] or session["check_run_id"] == run_id:
        return
    if session["verification_started_at"] and not session["check_run_id"]:
        log.info("rescue call over, checking the claimed contact session=%s", session["id"])
        arm_timer(session["id"])
        await dial(session["id"], 0)
    elif session["alert_started_at"] and not session["rescue_told_at"]:
        # The alert never reached this call, so it goes out as a call of its own.
        order = contact_order(family_contacts(session["family_id"]), session["claimed_name"])
        index = next((i for i, c in enumerate(order) if c["priority"] == session["rescue_priority"]), -1)
        await dial(session["id"], index + 1 if unreached else 0)
    elif unreached and not session["verification_started_at"]:
        log.info("rescue call unreached session=%s status=%s priority=%s", session["id"], status, session["rescue_priority"])
        await start_rescue(session["id"], session["rescue_priority"])


async def on_parent_ended(session: dict, status: str, data: dict) -> None:
    if not db.execute(
        "UPDATE sessions SET parent_ended_at = ?, claim_type = COALESCE(claim_type, ?) WHERE id = ? AND parent_ended_at IS NULL",
        time.time(), claim_from_execution(data), session["id"],
    ):
        return
    session = db.one("SELECT * FROM sessions WHERE id = ?", session["id"])
    if session["claim_type"] in ALERT_CLAIMS and not session["alert_started_at"]:
        await start_alert(session["id"], session["claim_type"])
    elif not (session["verification_started_at"] or session["alert_started_at"]):
        family = db.one("SELECT parent_name, language FROM families WHERE id = ?", session["family_id"])
        kind = "update_unreachable" if not_answered(status, data) else "update_left"
        await tell_rescue(session["id"], "rescue_update", rescue_story(session, family, kind))
    if session["drill_id"] and not session["verification_started_at"]:
        record_drill(session["drill_id"], session["claim_type"], None)
    if session["verdict"] or not session["verification_started_at"]:
        send_summary(session["id"])


@app.get("/lookup", dependencies=[Depends(require_secret)])
def lookup(contact_number: str = "", agent_id: str = "", execution_id: str = ""):
    try:
        phone = to_e164(contact_number)
    except ValueError:
        phone = None
    family = db.one("SELECT * FROM families WHERE parent_phone = ?", phone) if phone else None
    if not family:
        return {}
    session_id = new_id("s")
    stack = stack_for_agent(agent_id) or DEFAULT_STACK
    db.execute("INSERT INTO sessions (id, family_id, parent_run_id, stack, started_at) VALUES (?, ?, ?, ?, ?)",
               session_id, family["id"], execution_id or None, stack, time.time())
    return parent_user_data(session_id, family)


app.mount("/web", StaticFiles(directory=WEB_DIR, html=True), name="web")
