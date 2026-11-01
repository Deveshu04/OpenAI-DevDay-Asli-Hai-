import argparse
import json
import os
import sys
from pathlib import Path

import httpx
from dotenv import set_key

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

import backend  # noqa: E402,F401  loads .env
from backend.bolna import API_BASE  # noqa: E402
from scripts.render_agents import AGENTS, UNPICKED, render  # noqa: E402

ENV_FILE = ROOT / ".env"


def env_key(name: str) -> str:
    role, stack = name.split(".")
    return f"AGENT_ID_{role.upper()}_{stack.upper()}"


def push(client: httpx.Client, body: dict, agent_id: str | None) -> str:
    res = client.put(f"/v2/agent/{agent_id}", json=body) if agent_id else client.post("/v2/agent", json=body)
    if res.is_error:
        raise RuntimeError(f"{res.status_code}: {res.text[:500]}")
    return agent_id or res.json()["agent_id"]


def main() -> None:
    parser = argparse.ArgumentParser(description="Create or update the Bolna agents from agents/*.json; new ids go into .env.")
    parser.add_argument("names", nargs="*", help="e.g. parent.sarvam check.sarvam (default: all)")
    args = parser.parse_args()

    base_url, secret, api_key = os.getenv("PUBLIC_BASE_URL"), os.getenv("TOOL_SECRET"), os.getenv("BOLNA_API_KEY")
    if not (base_url and secret and api_key):
        sys.exit("Set BOLNA_API_KEY, TOOL_SECRET and PUBLIC_BASE_URL in .env first.")
    if not base_url.startswith("https://"):
        sys.exit("PUBLIC_BASE_URL must be https://; Bolna calls it from the internet.")
    if "example.com" in base_url:
        print(f"Note: PUBLIC_BASE_URL is still {base_url}; tools and webhooks won't reach the backend until you re-run this with the real URL.")

    names = args.names or sorted(p.stem for p in AGENTS.glob("*.json"))
    client = httpx.Client(base_url=API_BASE, headers={"Authorization": f"Bearer {api_key}"}, timeout=60)
    failed = False
    for name in names:
        text = render((AGENTS / f"{name}.json").read_text(encoding="utf-8"), base_url, secret)
        if UNPICKED in text:
            sys.exit(f"{name} still has {UNPICKED}; pick the voice first.")
        key = env_key(name)
        existing = os.getenv(key) or None
        try:
            agent_id = push(client, json.loads(text), existing)
        except RuntimeError as exc:
            print(f"{name}: failed {str(exc).replace(secret, '<TOOL_SECRET>')}")
            failed = True
            continue
        if not existing:
            set_key(ENV_FILE, key, agent_id, quote_mode="never")
        print(f"{name}: {'updated' if existing else 'created'} {agent_id} ({key})")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
