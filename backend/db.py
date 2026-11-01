import os
import sqlite3
from contextlib import contextmanager

SCHEMA = """
CREATE TABLE IF NOT EXISTS families (
    id TEXT PRIMARY KEY,
    parent_name TEXT NOT NULL,
    parent_phone TEXT NOT NULL UNIQUE,
    language TEXT NOT NULL DEFAULT 'hi',
    family_word_latin TEXT NOT NULL,
    family_word_native TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS contacts (
    family_id TEXT NOT NULL REFERENCES families(id),
    name TEXT NOT NULL,
    relation TEXT,
    phone TEXT NOT NULL,
    priority INTEGER NOT NULL,
    PRIMARY KEY (family_id, priority)
);

CREATE TABLE IF NOT EXISTS drills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    family_id TEXT NOT NULL REFERENCES families(id),
    stack TEXT,
    script INTEGER NOT NULL,
    ran_at REAL NOT NULL,
    used_line INTEGER NOT NULL DEFAULT 0,
    seconds_to_verdict REAL,
    verdict_correct INTEGER
);

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    family_id TEXT NOT NULL REFERENCES families(id),
    parent_run_id TEXT,
    stack TEXT NOT NULL,
    claimed_name TEXT,
    amount REAL,
    claim_type TEXT,
    verdict TEXT,
    started_at REAL NOT NULL,
    verdict_at REAL,
    story TEXT,
    drill_id INTEGER REFERENCES drills(id),
    verification_started_at REAL,
    check_run_id TEXT,
    contact_priority INTEGER,
    parent_ended_at REAL,
    alert_started_at REAL,
    rescue_requested_at REAL,
    rescue_run_id TEXT,
    rescue_priority INTEGER,
    rescue_ended_at REAL,
    rescue_pending TEXT,
    rescue_told_at REAL,
    retried_at REAL,
    summary_sent_at REAL
);

CREATE TABLE IF NOT EXISTS outbound (
    phone TEXT NOT NULL,
    at REAL NOT NULL,
    kind TEXT NOT NULL DEFAULT 'rescue',
    family_id TEXT
);

CREATE INDEX IF NOT EXISTS sessions_parent_run ON sessions(parent_run_id);
CREATE INDEX IF NOT EXISTS sessions_check_run ON sessions(check_run_id);
"""


def db_path() -> str:
    return os.getenv("DB_PATH", "asli.db")


@contextmanager
def connect():
    conn = sqlite3.connect(db_path(), timeout=10)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        with conn:
            yield conn
    finally:
        conn.close()


ADDED_COLUMNS = [
    ("sessions", "alert_started_at", "REAL"),
    ("sessions", "rescue_requested_at", "REAL"),
    ("sessions", "rescue_run_id", "TEXT"),
    ("sessions", "rescue_priority", "INTEGER"),
    ("sessions", "rescue_ended_at", "REAL"),
    ("sessions", "rescue_pending", "TEXT"),
    ("sessions", "rescue_told_at", "REAL"),
    ("sessions", "retried_at", "REAL"),
    ("outbound", "kind", "TEXT NOT NULL DEFAULT 'rescue'"),
    ("outbound", "family_id", "TEXT"),
]


def init_db() -> None:
    with connect() as conn:
        conn.executescript(SCHEMA)
        for table, column, kind in ADDED_COLUMNS:
            if column not in {row["name"] for row in conn.execute(f"PRAGMA table_info({table})")}:
                conn.execute(f"ALTER TABLE {table} ADD COLUMN {column} {kind}")
        conn.execute("CREATE INDEX IF NOT EXISTS sessions_rescue_run ON sessions(rescue_run_id)")
        conn.execute("DROP INDEX IF EXISTS outbound_phone")
        conn.execute("CREATE INDEX IF NOT EXISTS outbound_phone_kind ON outbound(phone, kind, at)")


def one(sql: str, *args) -> dict | None:
    with connect() as conn:
        row = conn.execute(sql, args).fetchone()
    return dict(row) if row else None


def all_rows(sql: str, *args) -> list[dict]:
    with connect() as conn:
        return [dict(r) for r in conn.execute(sql, args).fetchall()]


def execute(sql: str, *args) -> int:
    with connect() as conn:
        return conn.execute(sql, args).rowcount


def insert(sql: str, *args) -> int:
    with connect() as conn:
        return conn.execute(sql, args).lastrowid
