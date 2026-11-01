import os
from dataclasses import dataclass

STACKS = {
    "sarvam":  {"parent": os.getenv("AGENT_ID_PARENT_SARVAM"),  "check": os.getenv("AGENT_ID_CHECK_SARVAM")},
    "compare": {"parent": os.getenv("AGENT_ID_PARENT_COMPARE"), "check": os.getenv("AGENT_ID_CHECK_COMPARE")},
}
DEFAULT_STACK = os.getenv("VOICE_STACK", "sarvam")


@dataclass
class Session:
    drill_id: int | None = None

    @property
    def is_drill(self) -> bool:
        return self.drill_id is not None

    @property
    def drill_number(self) -> int | None:
        return self.drill_id


def pick_stack(session):
    if session.is_drill:
        return "sarvam" if session.drill_number % 2 == 0 else "compare"
    return DEFAULT_STACK


def stack_for_agent(agent_id: str | None) -> str | None:
    return next((name for name, ids in STACKS.items() if agent_id and agent_id in ids.values()), None)
