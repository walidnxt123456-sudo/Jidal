# api/db.py
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from pathlib import Path

# Load env vars from project root
env_path = Path(__file__).resolve().parent.parent / ".env.development.local"
load_dotenv(env_path)

DATABASE_URL = os.getenv("JIDAL_AI_LOGS_DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("JIDAL_AI_LOGS_DATABASE_URL is not set")

def get_connection():
    return psycopg2.connect(
        DATABASE_URL,
        cursor_factory=RealDictCursor
    )
