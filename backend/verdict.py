import hashlib
import hmac
import os
import unicodedata

CHILD_SAFE = "child_safe"
CHILD_CONFIRMED = "child_confirmed"
NOT_CONFIRMED = "not_confirmed"
SEALED = "h1:"


def normalize_word(text: str | None) -> str:
    # NFC first: Sarvam may emit nukta letters (क़) as one code point or as क + ़.
    # Keep only letters, marks and digits, so matras survive and ASR punctuation (। . ,) drops.
    text = unicodedata.normalize("NFC", text or "").lower()
    return "".join(ch for ch in text if unicodedata.category(ch)[0] in "LMN")


def word_key() -> bytes | None:
    # WORD_KEY lets TOOL_SECRET rotate without breaking every stored word.
    key = os.getenv("WORD_KEY") or os.getenv("TOOL_SECRET")
    return hashlib.sha256(b"asli-family-word:" + key.encode()).digest() if key else None


def seal_word(text: str | None) -> str:
    """Keyed hash of the normalized word, so a copy of the database never shows anyone's family word."""
    word, key = normalize_word(text), word_key()
    if not key:
        raise RuntimeError("Set WORD_KEY or TOOL_SECRET before storing family words")
    return SEALED + hmac.new(key, word.encode(), hashlib.sha256).hexdigest() if word else ""


def word_matches(spoken: str | None, latin: str, native: str) -> bool:
    heard = normalize_word(spoken)
    stored = [w for w in (latin, native) if w]
    if not heard or not stored:
        return False
    if any(w.startswith(SEALED) for w in stored):
        sealed = seal_word(heard)
        return any(hmac.compare_digest(sealed, w) for w in stored)
    return heard in {normalize_word(w) for w in stored}


def normalize_answer(did_call: str | None) -> str:
    answer = (did_call or "").strip().lower()
    if answer == "yes":
        return "Yes"
    if answer == "no":
        return "No"
    return "Unsure"


def decide(did_call: str | None, spoken_word: str | None, family: dict, child_name: str) -> tuple[str, dict]:
    answer = normalize_answer(did_call)
    if answer == "No":
        return CHILD_SAFE, {}
    if answer == "Yes" and word_matches(spoken_word, family["family_word_latin"], family["family_word_native"]):
        return CHILD_CONFIRMED, {"verified_name": child_name}
    return NOT_CONFIRMED, {}
