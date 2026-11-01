"""Copies the product's real wording (tap page, fixed safety lines, greetings, signup questions) into the film."""
import json
import re
import sys
from pathlib import Path

# Run from anywhere: the repo root is two levels up from video/scripts.
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
from backend.languages import ALERTS, LANGUAGES, asked, greeting  # noqa: E402

out = {}

# Tap page copy, straight from tap.html's COPY object.
tap = (ROOT / "web/tap.html").read_text(encoding="utf-8")
copy = {}
for lang in ("hi", "en", "ta", "bn", "pa", "hi-Latn"):
    key = json.dumps(lang) if "-" in lang else lang
    m = re.search(r"\n      " + re.escape(key) + r": (\{.*?\}),\n", tap)
    obj = m.group(1)
    fields = dict(re.findall(r'(\w+): "((?:[^"\\]|\\.)*)"', obj))
    copy[lang] = fields
out["tap"] = copy
brand = re.search(r"const BRAND = (\{.*?\});", tap).group(1)
out["brand"] = dict(re.findall(r'"?([\w-]+)"?: "((?:[^"\\]|\\.)*)"', brand))


def static(agent, node_id):
    body = json.loads((ROOT / f"agents/{agent}.json").read_text(encoding="utf-8"))
    nodes = body["agent_config"]["tasks"][0]["tools_config"]["llm_agent"]["llm_config"]["nodes"]
    msg = next(n for n in nodes if n["id"] == node_id)["static_message"]
    return {"hi": msg["hi"], "en": msg["en"]}


out["saathi"] = {k: static("parent.sarvam", k) for k in ("verdict_fake", "verdict_unconfirmed", "authority_scam", "already_paid", "closing")}
out["check"] = {k: static("check.sarvam", k) for k in ("rescue_thanks", "rescue_timeout", "alert_done", "thanks")}
parent = json.loads((ROOT / "agents/parent.sarvam.json").read_text(encoding="utf-8"))
tools = parent["agent_config"]["tasks"][0]["tools_config"]["api_tools"]["tools"]
pre = next(t for t in tools if t["name"] == "start_verification")["pre_call_message"]
out["saathi"]["calling_family"] = {"hi": pre["hi"], "en": pre["en"]}

names = {"hi": {"parent": "सुनीता", "child": "राहुल"}, "en": {"parent": "Sunita", "child": "Rahul"}}
lines = {}
for lang in ("hi", "en"):
    n = names[lang]
    lines[lang] = {
        "parent_greeting": greeting(lang, "parent", parent_name=n["parent"]),
        "rescue_greeting": greeting(lang, "rescue", child_name=n["child"], parent_name=n["parent"]),
        "verify": greeting(lang, "verify", parent_name=n["parent"], claimed_name=n["child"]),
        "update_unreachable": greeting(lang, "update_unreachable", parent_name=n["parent"]),
        "update_authority": ALERTS[lang][0].format(parent_name=n["parent"]),
        "update_paid": ALERTS[lang][1].format(parent_name=n["parent"]),
    }
out["lines"] = lines

i18n = {}
keys = ["ob.title", "ob.intro", "ob.q.parentName", "ob.q.parentPhone", "ob.q.language", "ob.q.first", "ob.q.firstPhone", "ob.q.word",
        "ob.h.word", "ob.q.review", "ob.next", "ob.step", "signup.done", "signup.doneBody", "signup.addAnother", "signup.profiles",
        "signup.copy", "lang.hi", "lang.ta", "lang.bn", "lang.pa", "lang.en", "prefs.language", "prefs.larger"]
for lang in ("en", "hi"):
    data = json.loads((ROOT / f"web/i18n/{lang}.json").read_text(encoding="utf-8"))
    i18n[lang] = {k: data[k] for k in keys if k in data}
    missing = [k for k in keys if k not in data]
    if missing:
        print("missing", lang, missing)
out["i18n"] = i18n
out["languages"] = [{"code": c, "native": v["native"], "name": v["name"]} for c, v in LANGUAGES.items()]

dest = ROOT / "video/src/data/copy.json"
dest.parent.mkdir(parents=True, exist_ok=True)
dest.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
print("wrote", dest)
