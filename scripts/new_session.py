import argparse
import csv
import os
import sys
import time
from datetime import datetime
from pathlib import Path

import httpx

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from backend import db  # noqa: E402
from backend.stacks import STACKS, Session, pick_stack  # noqa: E402

LOG = ROOT / "test_runs.csv"
OUTCOMES = ["child_safe", "child_confirmed", "not_confirmed", "authority", "paid"]


def arm_drill(family_id: str, script: int) -> int:
    return db.insert("INSERT INTO drills (family_id, script, ran_at) VALUES (?, ?, ?)", family_id, script, time.time())


def wait_for_outcome(session_id: str, timeout: float) -> dict | None:
    deadline = time.time() + timeout
    while time.time() < deadline:
        row = db.one("SELECT * FROM sessions WHERE id = ?", session_id)
        if row and (row["verdict"] or row["parent_ended_at"]):
            return row
        time.sleep(0.5)
    return db.one("SELECT * FROM sessions WHERE id = ?", session_id)


def log_run(row: dict, expect: str | None) -> None:
    outcome = row["verdict"] or row["claim_type"] or "none"
    seconds = round(row["verdict_at"] - row["started_at"], 1) if row["verdict_at"] else ""
    passed = "" if expect is None else int(outcome == expect)
    new = not LOG.exists()
    with LOG.open("a", newline="", encoding="utf-8") as fh:
        writer = csv.writer(fh)
        if new:
            writer.writerow(["at", "session_id", "stack", "expected", "outcome", "seconds_to_verdict", "passed"])
        writer.writerow([datetime.now().isoformat(timespec="seconds"), row["id"], row["stack"], expect or "", outcome, seconds, passed])
    print(f"outcome={outcome} seconds_to_verdict={seconds or '-'}" + ("" if expect is None else f" {'PASS' if passed else 'FAIL'}"))

    with LOG.open(encoding="utf-8") as fh:
        results = [r["passed"] for r in csv.DictReader(fh) if r["passed"] != ""]
    streak = 0
    for result in reversed(results):
        if result != "1":
            break
        streak += 1
    print(f"passing streak: {streak}/10")


def main() -> None:
    parser = argparse.ArgumentParser(description="Start a test session: places a real call to the family's parent.")
    parser.add_argument("family_id")
    parser.add_argument("--expect", choices=OUTCOMES, help="Outcome this test should reach; logged to test_runs.csv")
    parser.add_argument("--drill", type=int, choices=[1, 2, 3, 4], help="Log this session as a drill using that script")
    parser.add_argument("--arm", action="store_true", help="With --drill: only arm it; the parent's next tap links to it")
    parser.add_argument("--base", default=os.getenv("PUBLIC_BASE_URL", "http://localhost:8000"))
    parser.add_argument("--wait", type=float, default=180, help="Seconds to wait for the outcome")
    parser.add_argument("--yes", action="store_true", help="Skip the confirmation prompt")
    args = parser.parse_args()

    db.init_db()
    family = db.one("SELECT * FROM families WHERE id = ?", args.family_id)
    if not family:
        sys.exit(f"No family {args.family_id} in {db.db_path()}")

    drill_id = arm_drill(args.family_id, args.drill) if args.drill else None
    if args.arm:
        if not drill_id:
            parser.error("--arm needs --drill")
        print(f"Drill {drill_id} armed for {family['parent_name']}; a tap in the next 30 minutes links to it.")
        return

    stack = pick_stack(Session(drill_id))
    agent_id = STACKS[stack]["parent"]
    contacts = db.all_rows("SELECT name, phone FROM contacts WHERE family_id = ? ORDER BY priority", args.family_id)
    print(f"Calls {family['parent_name']} at {family['parent_phone']} with parent agent {agent_id} (stack {stack}).")
    print("Then checks with: " + ", ".join(f"{c['name']} {c['phone']}" for c in contacts) + f" via {STACKS[stack]['check']}")
    if os.getenv("SUMMARY_WORKFLOW_ID"):
        print("Then WhatsApps the summary to: " + ", ".join(c["phone"] for c in contacts))
    if not args.yes and input("Place this real call? [y/N] ").strip().lower() != "y":
        if drill_id:
            db.execute("DELETE FROM drills WHERE id = ?", drill_id)
        sys.exit("Cancelled.")

    res = httpx.post(f"{args.base.rstrip('/')}/trigger", json={"family_id": args.family_id, "drill_id": drill_id}, timeout=20)
    res.raise_for_status()
    session_id = res.json()["session_id"]
    print(f"session {session_id} started; waiting up to {args.wait:.0f}s")

    row = wait_for_outcome(session_id, args.wait)
    log_run(row, args.expect)


if __name__ == "__main__":
    main()
