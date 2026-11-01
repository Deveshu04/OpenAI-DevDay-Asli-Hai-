import asyncio
import logging
import os

log = logging.getLogger("asli.notify")

# WhatsApp template variables can't hold newlines, tabs or runs of spaces, and the whole body caps at 1024 chars.
MAX_SUMMARY = 900


class WorkflowSender:
    """Runs the published summary workflow; its aisensy_whatsapp node sends the approved template."""

    def __init__(self, bolna, workflow_id: str):
        self.bolna = bolna
        self.workflow_id = workflow_id

    async def send(self, phone: str, text: str, ref: str) -> str:
        summary = " ".join(text.split())[:MAX_SUMMARY]
        contact = {"reference_id": ref, "mobile_number": phone, "summary": summary}
        return await self.bolna.run_workflow(self.workflow_id, contact)


def from_env(bolna) -> WorkflowSender | None:
    workflow_id = os.getenv("SUMMARY_WORKFLOW_ID")
    return WorkflowSender(bolna, workflow_id) if workflow_id else None


async def deliver(sender, session_id: str, contacts: list[dict], text: str) -> None:
    await asyncio.gather(*(_send_one(sender, session_id, contact, text) for contact in contacts))


async def _send_one(sender, session_id: str, contact: dict, text: str) -> None:
    try:
        run_id = await sender.send(contact["phone"], text, f"{session_id}-{contact['priority']}")
    except Exception:
        log.exception("summary failed session=%s priority=%s", session_id, contact["priority"])
        return
    log.info("summary sent session=%s priority=%s run=%s", session_id, contact["priority"], run_id)
