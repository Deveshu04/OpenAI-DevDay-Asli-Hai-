import argparse
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

import backend  # noqa: E402,F401  loads .env

AGENTS = ROOT / "agents"
OUT = ROOT / "build" / "agents"
UNPICKED = "PICK_A_HINDI_VOICE"


def render(text: str, base_url: str, tool_secret: str) -> str:
    return text.replace("https://YOUR-BACKEND", base_url.rstrip("/")).replace("YOUR_TOOL_SECRET", tool_secret)


def main() -> None:
    parser = argparse.ArgumentParser(description="Fill backend URL and tool secret into agents/*.json, writing build/agents/.")
    parser.add_argument("names", nargs="*", help="e.g. parent.sarvam check.sarvam (default: all)")
    args = parser.parse_args()

    base_url, secret = os.getenv("PUBLIC_BASE_URL"), os.getenv("TOOL_SECRET")
    if not base_url or not secret:
        sys.exit("Set PUBLIC_BASE_URL and TOOL_SECRET in .env first.")
    if not base_url.startswith("https://"):
        sys.exit("PUBLIC_BASE_URL must be https://; Bolna calls it from the internet.")

    OUT.mkdir(parents=True, exist_ok=True)
    sources = [AGENTS / f"{n}.json" for n in args.names] if args.names else sorted(AGENTS.glob("*.json"))
    for source in sources:
        text = render(source.read_text(encoding="utf-8"), base_url, secret)
        json.loads(text)
        target = OUT / source.name
        target.write_text(text, encoding="utf-8")
        note = f"  (still has {UNPICKED}: set the Cartesia voice first)" if UNPICKED in text else ""
        print(f"{target.relative_to(ROOT)}{note}")


if __name__ == "__main__":
    main()
