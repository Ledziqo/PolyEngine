from datetime import datetime, timedelta
from uuid import uuid4

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.schema import BotSetting, LiveOrderAudit, Outcome
from app.services.credential_store import credential_status, load_live_credentials


def _credential_values(db: Session | None = None) -> dict[str, str | None]:
    settings = get_settings()
    values = {
        "POLYMARKET_PRIVATE_KEY": settings.polymarket_private_key,
        "POLYMARKET_FUNDER_ADDRESS": settings.polymarket_funder_address,
        "POLYMARKET_API_KEY": settings.polymarket_api_key,
        "POLYMARKET_API_SECRET": settings.polymarket_api_secret,
        "POLYMARKET_API_PASSPHRASE": settings.polymarket_api_passphrase,
    }
    if db is not None:
        stored = load_live_credentials(db)
        for key, value in stored.items():
            if value:
                values[key] = value
    return values


def live_ready(db: Session | None = None) -> dict:
    settings = get_settings()
    credentials = _credential_values(db)
    missing = [
        name
        for name, value in credentials.items()
        if not value
    ]
    stored_status = credential_status(db) if db is not None else None
    return {"enabled": settings.live_trading_enabled, "dry_run": settings.live_trading_dry_run, "missing": missing, "ready": settings.live_trading_enabled and not missing, "stored": stored_status}


def preflight_live_order(db: Session, settings: BotSetting, outcome: Outcome, amount: float) -> tuple[bool, str]:
    ready = live_ready(db)
    if not ready["enabled"]:
        return False, "LIVE_TRADING_ENABLED is false."
    if ready["missing"]:
        return False, f"Missing live credentials: {', '.join(ready['missing'])}."
    if settings.execution_mode != "live_capped":
        return False, "Execution mode is not live_capped."
    if settings.emergency_stop or settings.state != "enabled":
        return False, "Bot is paused or emergency stopped."
    if amount > settings.max_live_trade_amount:
        return False, "Amount exceeds max live trade amount."
    since = datetime.utcnow() - timedelta(hours=24)
    spent = db.query(func.sum(LiveOrderAudit.amount)).filter(LiveOrderAudit.created_at >= since, LiveOrderAudit.status.in_(["filled", "placed", "dry_run"])).scalar() or 0
    if spent + amount > settings.max_live_daily_spend:
        return False, "Amount exceeds max live daily spend."
    live_positions = db.query(LiveOrderAudit).filter(LiveOrderAudit.status.in_(["filled", "placed"])).count()
    if live_positions >= settings.max_live_open_positions:
        return False, "Max live open positions reached."
    if not outcome.token_id:
        return False, "Outcome is missing CLOB token id."
    if outcome.spread > settings.max_spread or outcome.liquidity < settings.min_liquidity:
        return False, "Liquidity/spread risk check failed."
    if not outcome.price_synced_at or outcome.price_synced_at < datetime.utcnow() - timedelta(seconds=45):
        return False, "Price data is stale."
    return True, "Live preflight passed."


def execute_live_order(db: Session, settings: BotSetting, outcome: Outcome, amount: float, price: float) -> dict:
    allowed, reason = preflight_live_order(db, settings, outcome, amount)
    audit = LiveOrderAudit(
        decision_id=str(uuid4()),
        mode=settings.execution_mode,
        market=outcome.market.question,
        outcome=outcome.name,
        side="BUY",
        intended_price=price,
        amount=amount,
        status="prepared",
    )
    db.add(audit)
    db.flush()
    if not allowed:
        audit.status = "rejected"
        audit.rejection_reason = reason
        db.commit()
        return {"placed": False, "status": "rejected", "reason": reason, "audit_id": audit.id}

    ready = live_ready(db)
    if ready["dry_run"]:
        audit.status = "dry_run"
        audit.raw_response = {"message": "Dry run: order passed all risk checks but was not sent."}
        db.commit()
        return {"placed": False, "status": "dry_run", "reason": "Dry run enabled.", "audit_id": audit.id}

    try:
        from py_clob_client.client import ClobClient
        from py_clob_client.clob_types import OrderArgs
        from py_clob_client.order_builder.constants import BUY

        creds = _credential_values(db)
        client = ClobClient("https://clob.polymarket.com", key=creds["POLYMARKET_PRIVATE_KEY"], chain_id=137, funder=creds["POLYMARKET_FUNDER_ADDRESS"])
        client.set_api_creds({"apiKey": creds["POLYMARKET_API_KEY"], "secret": creds["POLYMARKET_API_SECRET"], "passphrase": creds["POLYMARKET_API_PASSPHRASE"]})
        order_args = OrderArgs(price=price, size=amount / max(price, 0.01), side=BUY, token_id=outcome.token_id)
        signed = client.create_order(order_args)
        response = client.post_order(signed)
        audit.status = "placed"
        audit.order_id = str(response.get("orderID") or response.get("id") or "")
        audit.raw_response = response
        db.commit()
        return {"placed": True, "status": "placed", "order_id": audit.order_id, "audit_id": audit.id}
    except Exception as exc:
        audit.status = "failed"
        audit.rejection_reason = str(exc)
        audit.raw_response = {"error": str(exc)}
        db.commit()
        return {"placed": False, "status": "failed", "reason": str(exc), "audit_id": audit.id}
