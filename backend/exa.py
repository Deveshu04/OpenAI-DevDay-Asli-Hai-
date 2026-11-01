"""Small, privacy-conscious Exa search client for the live safety call."""

import re

import httpx

EXA_SEARCH_URL = "https://api.exa.ai/search"
OFFICIAL_DOMAINS = ["cybercrime.gov.in", "rbi.org.in", "pib.gov.in", "mha.gov.in", "india.gov.in"]


def safe_query(value: object, private_terms: list[str] | None = None) -> str:
    """Keep only the caller's general claim; never send contact or account identifiers to Exa."""
    query = str(value or "")[:500]
    query = re.sub(r"https?://\S+|\b\S+@\S+\b", " ", query)
    for term in sorted((t for t in (private_terms or []) if len(t.strip()) >= 2), key=len, reverse=True):
        query = re.sub(re.escape(term.strip()), " ", query, flags=re.IGNORECASE)
    query = re.sub(r"(?<!\w)(?:\+?\d[\d\s().-]{5,}\d)(?!\w)", " ", query)
    query = re.sub(r"\b\d{4,}\b", " ", query)
    return " ".join(query.split())[:240]


async def search(api_key: str, query: str) -> list[dict]:
    async with httpx.AsyncClient(timeout=httpx.Timeout(4.0, connect=2.0)) as client:
        response = await client.post(
            EXA_SEARCH_URL,
            headers={"x-api-key": api_key, "Content-Type": "application/json"},
            json={
                "query": query,
                "type": "lite",
                "numResults": 3,
                "includeDomains": OFFICIAL_DOMAINS,
                "contents": {"highlights": True},
            },
        )
        response.raise_for_status()
        data = response.json()

    results = []
    for item in data.get("results", [])[:3]:
        url = item.get("url", "")
        if not isinstance(url, str) or not url.startswith("https://"):
            continue
        highlights = item.get("highlights") or []
        snippet = " ".join(str(part) for part in highlights if part) or item.get("text", "")
        results.append({
            "title": str(item.get("title") or "Official source")[:160],
            "url": url[:500],
            "snippet": str(snippet)[:350],
        })
    return results
