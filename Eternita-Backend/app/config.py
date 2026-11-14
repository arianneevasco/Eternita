import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


def required_env(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise RuntimeError(f"Missing environment variable: {name}")
    return value


def firebase_key_path() -> Path:
    path = Path(required_env("FIREBASE_KEY_PATH"))
    return path if path.is_absolute() else BASE_DIR / path