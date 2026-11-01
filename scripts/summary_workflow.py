import argparse
import json
import os
import sys
from pathlib import Path

import httpx

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

import backend  # noqa: E402,F401  loads .env
from backend.bolna import API_BASE  # noqa: E402

# Submit this body in AiSensy as a Utility template; {{1}} is the backend's summary sentence.
TEMPLATE = (
    "Asli hai? update for your family:\n\n"
    "{{1}}\n\n"
    "This is an automatic message from the Asli hai? safety line. If you are worried, call them on their usual number."
)


def definition(template: str, campaign: str | None, language: str) -> dict:
    return {
        "entry_node_id": "n_start",
        "on_no_match": "n_end",
        "nodes": [
            {
                "id": "n_start",
                "type": "start",
                "config": {
                    "trigger": {"kind": "manual"},
                    "fields": [
                        {"name": "mobile_number", "type": "phone", "required": True},
                        {"name": "summary", "type": "string", "required": True},
                    ],
                },
                "cases": [{"when": {"always": True}, "then": {"to": "n_whatsapp"}}],
            },
            {
                "id": "n_whatsapp",
                "type": "aisensy_whatsapp",
                "name": "Family summary",
                "config": {
                    "template_name": template,
                    "language": language,
                    "campaign_name": campaign,
                    "recipient": {"var": "entry.mobile_number"},
                    "variables": {"1": {"value": "{entry.summary}", "required": True}},
                },
                "cases": [{"when": {"always": True}, "then": {"to": "n_end"}}],
            },
            {"id": "n_end", "type": "end", "config": {"label": "sent", "outcome": "success"}},
        ],
    }


def call(client: httpx.Client, method: str, path: str, body: dict | None = None) -> dict:
    res = client.request(method, path, json=body)
    if res.is_error:
        sys.exit(f"{method} {path} {res.status_code}: {res.text[:500]}")
    return res.json()


def publish(defn: dict, workflow_id: str | None) -> str:
    headers = {"Authorization": f"Bearer {os.getenv('BOLNA_API_KEY', '')}"}
    with httpx.Client(base_url=API_BASE, headers=headers, timeout=20) as client:
        if not workflow_id:
            workflow_id = call(client, "POST", "/workflows", {"name": "Asli hai? family summary"})["id"]
            print(f"created workflow {workflow_id}")
        revision = call(client, "GET", f"/workflows/{workflow_id}/draft")["revision"]
        call(client, "PUT", f"/workflows/{workflow_id}/draft", {"expected_revision": revision, "definition": defn})
        issues = call(client, "POST", f"/workflows/{workflow_id}/validate", {})["issues"]
        for issue in issues:
            print(f"{issue['severity']}: {issue['code']} {issue['message']}")
        if any(i["severity"] == "error" for i in issues):
            sys.exit("Draft saved but not published; fix the errors above.")
        version = call(client, "POST", f"/workflows/{workflow_id}/publish", {})["version"]
        print(f"published version {version}")
    return workflow_id


def main() -> None:
    parser = argparse.ArgumentParser(description="Build the Bolna workflow that WhatsApps the family summary through AiSensy.")
    parser.add_argument("--template", default=os.getenv("AISENSY_TEMPLATE_NAME"), help="Approved AiSensy template name")
    parser.add_argument("--campaign", default=os.getenv("AISENSY_CAMPAIGN_NAME"), help="Live AiSensy API campaign for that template")
    parser.add_argument("--language", default=os.getenv("AISENSY_TEMPLATE_LANGUAGE", "en"), help="Template ISO language code")
    parser.add_argument("--workflow-id", default=os.getenv("SUMMARY_WORKFLOW_ID"), help="Update this workflow instead of creating one")
    parser.add_argument("--publish", action="store_true", help="Create or update the workflow in Bolna; otherwise only print it")
    parser.add_argument("--template-text", action="store_true", help="Print the template body to submit in AiSensy")
    args = parser.parse_args()

    if args.template_text:
        print(TEMPLATE)
        return
    if not args.template:
        parser.error("set AISENSY_TEMPLATE_NAME in .env or pass --template")
    defn = definition(args.template, args.campaign, args.language)
    if not args.publish:
        print(json.dumps(defn, indent=2, ensure_ascii=False))
        return
    if not os.getenv("BOLNA_API_KEY"):
        sys.exit("Set BOLNA_API_KEY in .env first.")
    workflow_id = publish(defn, args.workflow_id)
    print(f"Put SUMMARY_WORKFLOW_ID={workflow_id} in .env and restart the backend.")


if __name__ == "__main__":
    main()
