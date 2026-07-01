import base64
import hashlib
from datetime import datetime

from cryptography.fernet import Fernet
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.schema import LiveCredential

LIVE_CREDENTIAL_KEYS = [
    "POLYMARKET_PRIVATE_KEY",
    "POLYMARKET_FUNDER_ADDRESS",
    "POLYMARKET_API_KEY",
    "POLYMARKET_API_SECRET",
    "POLYMARKET_API_PASSPHRASE",
]


def _fernet() -> Fernet:
    secret = get_settings().app_secret_key
    digest = hashlib.sha256(secret.encode("utf-8")).digest()
    return Fernet(base64.urlsafe_b64encode(digest))


def save_live_credentials(db: Session, values: dict[str, str | None]) -> dict:
    saved: list[str] = []
    fernet = _fernet()
    for key in LIVE_CREDENTIAL_KEYS:
        value = values.get(key)
        if value is None or value == "":
            continue
        row = db.query(LiveCredential).filter(LiveCredential.key_name == key).one_or_none()
        if row is None:
            row = LiveCredential(key_name=key, encrypted_value="")
            db.add(row)
        row.encrypted_value = fernet.encrypt(value.encode("utf-8")).decode("utf-8")
        row.updated_at = datetime.utcnow()
        saved.append(key)
    db.commit()
    return {"saved": saved, "configured": credential_status(db)["configured"], "warning": "Keep APP_SECRET_KEY unchanged on the VPS or stored credentials cannot be decrypted."}


def load_live_credentials(db: Session) -> dict[str, str | None]:
    fernet = _fernet()
    values: dict[str, str | None] = {}
    for row in db.query(LiveCredential).all():
        try:
            values[row.key_name] = fernet.decrypt(row.encrypted_value.encode("utf-8")).decode("utf-8")
        except Exception:
            values[row.key_name] = None
    return values


def credential_status(db: Session) -> dict:
    present = {row.key_name for row in db.query(LiveCredential).all()}
    configured = {key: key in present for key in LIVE_CREDENTIAL_KEYS}
    missing = [key for key, ok in configured.items() if not ok]
    return {"configured": configured, "missing": missing, "complete": not missing}
