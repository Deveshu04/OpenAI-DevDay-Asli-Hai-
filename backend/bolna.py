import asyncio
import logging
import os

import httpx

API_BASE = "https://api.bolna.ai"
FIRE_ATTEMPTS = 5
log = logging.getLogger("asli.bolna")


class BolnaError(RuntimeError):
    pass


class Bolna:
    def __init__(self, api_key: str | None = None, from_number: str | None = None, transport: httpx.AsyncBaseTransport | None = None):
        self.from_number = from_number if from_number is not None else os.getenv("BOLNA_FROM_NUMBER")
        self.client = httpx.AsyncClient(
            base_url=API_BASE,
            timeout=httpx.Timeout(10.0),
            headers={"Authorization": f"Bearer {api_key or os.getenv('BOLNA_API_KEY', '')}"},
            transport=transport,
        )

    async def aclose(self) -> None:
        await self.client.aclose()

    async def place_call(self, agent_id: str, phone: str, user_data: dict) -> str:
        body = {"agent_id": agent_id, "recipient_phone_number": phone, "user_data": user_data}
        if self.from_number:
            body["from_phone_number"] = self.from_number
        res = await self.client.post("/call", json=body)
        if res.is_error:
            raise BolnaError(f"place_call {res.status_code}: {res.text[:300]}")
        data = res.json()
        run_id = data.get("execution_id") or data.get("run_id")
        if not run_id:
            raise BolnaError(f"place_call returned no execution_id: {data}")
        return run_id

    async def get_execution(self, run_id: str) -> dict:
        res = await self.client.get(f"/executions/{run_id}")
        if res.is_error:
            raise BolnaError(f"get_execution {res.status_code}: {res.text[:300]}")
        return res.json()

    async def fire_event(self, run_id: str, event: str, properties: dict | None = None) -> None:
        what = f"fire_event {event}"
        res = await self._post_retrying(f"/v1/call/{run_id}/events", {"event": event, "properties": properties or {}}, what)
        if res.is_error:
            raise BolnaError(f"{what} {res.status_code}: {res.text[:300]}")

    async def run_workflow(self, workflow_id: str, contact: dict) -> str:
        res = await self._post_retrying(f"/workflows/{workflow_id}/run", contact, "run_workflow")
        try:
            data = res.json()
        except ValueError:
            data = {}
        data = data if isinstance(data, dict) else {}
        detail = data.get("detail") if isinstance(data.get("detail"), dict) else {}
        # A retry after a lost response lands here; the reference_id already ran, so this is the original run.
        if res.status_code == 409 and detail.get("code") == "duplicate_run" and detail.get("execution_id"):
            return detail["execution_id"]
        if res.is_error or not data.get("execution_id"):
            raise BolnaError(f"run_workflow {res.status_code}: {res.text[:300]}")
        return data["execution_id"]

    async def _post_retrying(self, path: str, body: dict, what: str) -> httpx.Response:
        last = None
        for attempt in range(FIRE_ATTEMPTS):
            try:
                res = await self.client.post(path, json=body)
                if res.status_code < 500:
                    return res
                last = BolnaError(f"{what} {res.status_code}")
            except httpx.TransportError as exc:
                last = exc
            if attempt < FIRE_ATTEMPTS - 1:
                await asyncio.sleep(min(0.5 * 2 ** attempt, 4.0))
        raise BolnaError(f"{what} failed after retries: {last}")
