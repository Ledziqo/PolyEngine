import asyncio
import json
from datetime import datetime
from typing import Generator

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.database import SessionLocal, create_tables
from app.services.polymarket import PolymarketClient
from app.services.terminal import (
    bot_settings,
    copy_signals_payload,
    ensure_defaults,
    live_status_payload,
    logs_payload,
    market_payload,
    markets_payload,
    opportunities_payload,
    portfolio_payload,
    refresh_portfolio,
    run_bot,
    score_all,
    sync_markets,
    sync_order_books,
    reset_trading_state,
    traders_payload,
)
from app.services.backtesting import backtest_detail_payload, backtest_payload, run_backtest
from app.services.btc5m import btc5m_payload, sync_btc5m_windows
from app.services.live_trading import live_ready
from app.services.credential_store import credential_status, save_live_credentials
from app.services.ml_model import active_model, train_short_edge_model
from app.services.trader_intel import sync_trader_intel, trader_positions_payload
from app.workers.live_engine import LiveEngine
from app.models.schema import BacktestRun, LiveOrderAudit, Market

router = APIRouter()
engine = LiveEngine()


class BotControlRequest(BaseModel):
    action: str


class BotSettingsRequest(BaseModel):
    execution_mode: str | None = None
    risk_mode: str | None = None
    minimum_rating: str | None = None
    max_trade_amount: float | None = None
    max_total_exposure: float | None = None
    min_liquidity: float | None = None
    max_spread: float | None = None
    take_profit: float | None = None
    stop_loss: float | None = None
    max_live_trade_amount: float | None = None
    max_live_daily_spend: float | None = None
    max_live_daily_loss: float | None = None
    max_live_open_positions: int | None = None
    btc5m_enabled: bool | None = None
    btc5m_max_trade_amount: float | None = None
    btc5m_min_confidence: int | None = None


class BacktestRequest(BaseModel):
    strategy: str = "normal"
    starting_balance: float = 10000
    risk_mode: str = "Balanced"


class LiveCredentialsRequest(BaseModel):
    polymarket_private_key: str | None = None
    polymarket_funder_address: str | None = None
    polymarket_api_key: str | None = None
    polymarket_api_secret: str | None = None
    polymarket_api_passphrase: str | None = None


class ResetRequest(BaseModel):
    starting_balance: float = 10000
    wipe_markets: bool = False


def get_db() -> Generator[Session, None, None]:
    create_tables()
    db = SessionLocal()
    try:
        ensure_defaults(db)
        yield db
    finally:
        db.close()


@router.get("/health")
def health(db: Session = Depends(get_db)) -> dict:
    return {"ok": True, "service": "polyengine-engine", "time": datetime.utcnow().isoformat(), "markets": db.query(Market).count()}


@router.get("/live/status")
def live_status(db: Session = Depends(get_db)) -> dict:
    return live_status_payload(db)


@router.post("/live/tick")
async def live_tick(db: Session = Depends(get_db)) -> dict:
    await sync_order_books(db, limit=80)
    score_all(db, limit=300)
    result = run_bot(db)
    return {"checked_at": datetime.utcnow().isoformat(), **result}


@router.get("/bot/status")
def bot_status(db: Session = Depends(get_db)) -> dict:
    settings = bot_settings(db)
    return {
        "state": settings.state,
        "enabled": settings.state == "enabled",
        "execution_mode": settings.execution_mode,
        "risk_mode": settings.risk_mode,
        "minimum_rating": settings.minimum_rating,
        "max_trade_amount": settings.max_trade_amount,
        "max_total_exposure": settings.max_total_exposure,
        "min_liquidity": settings.min_liquidity,
        "max_spread": settings.max_spread,
        "take_profit": settings.take_profit,
        "stop_loss": settings.stop_loss,
        "emergency_stop": settings.emergency_stop,
        "max_live_trade_amount": settings.max_live_trade_amount,
        "max_live_daily_spend": settings.max_live_daily_spend,
        "max_live_daily_loss": settings.max_live_daily_loss,
        "max_live_open_positions": settings.max_live_open_positions,
        "btc5m_enabled": settings.btc5m_enabled,
        "btc5m_max_trade_amount": settings.btc5m_max_trade_amount,
        "btc5m_min_confidence": settings.btc5m_min_confidence,
        "live_trading": live_ready(db),
        "message": "Autonomous bot is enabled." if settings.state == "enabled" else "Bot is paused.",
    }


@router.post("/bot/control")
def bot_control(payload: BotControlRequest, db: Session = Depends(get_db)) -> dict:
    settings = bot_settings(db)
    if payload.action == "enable":
        settings.state = "enabled"
        settings.emergency_stop = False
    elif payload.action == "pause":
        settings.state = "paused"
    elif payload.action == "emergency_stop":
        settings.state = "stopped"
        settings.emergency_stop = True
    settings.updated_at = datetime.utcnow()
    db.commit()
    return bot_status(db)


@router.put("/bot/settings")
def update_bot_settings(payload: BotSettingsRequest, db: Session = Depends(get_db)) -> dict:
    settings = bot_settings(db)
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(settings, field, value)
    settings.updated_at = datetime.utcnow()
    db.commit()
    return bot_status(db)


@router.post("/sync/all")
async def sync_all_route(db: Session = Depends(get_db)) -> dict:
    markets_result = await sync_markets(db, limit=1000)
    books_result = await sync_order_books(db, limit=300)
    try:
        btc_result = await sync_btc5m_windows(db, limit=20)
    except Exception as exc:
        btc_result = {"synced": 0, "error": str(exc)}
    try:
        trader_result = await sync_trader_intel(db)
    except Exception as exc:
        trader_result = {"synced": 0, "error": str(exc)}
    score_result = score_all(db, limit=500)
    portfolio_result = refresh_portfolio(db)
    return {"markets": markets_result, "order_books": books_result, "btc5m": btc_result, "traders": trader_result, "score": score_result, "portfolio": portfolio_result}


@router.post("/reset")
def reset_route(payload: ResetRequest, db: Session = Depends(get_db)) -> dict:
    return reset_trading_state(db, starting_balance=payload.starting_balance, wipe_markets=payload.wipe_markets)


@router.post("/sync/markets")
async def sync_markets_route(limit: int = 250, db: Session = Depends(get_db)) -> dict:
    return await sync_markets(db, limit=limit)


@router.post("/sync/order-books")
async def sync_order_books_route(limit: int = 100, db: Session = Depends(get_db)) -> dict:
    return await sync_order_books(db, limit=limit)


@router.post("/score")
def score_route(limit: int = 500, db: Session = Depends(get_db)) -> dict:
    return score_all(db, limit=limit)


@router.post("/model/train")
def train_model_route(horizon: str = "1h", db: Session = Depends(get_db)) -> dict:
    return train_short_edge_model(db, horizon=horizon)


@router.get("/model/status")
def model_status(db: Session = Depends(get_db)) -> dict:
    model = active_model(db)
    return {
        "active": bool(model),
        "version": model.version if model else "rule-fallback",
        "trained_at": model.trained_at.isoformat() if model else None,
        "training_rows": model.training_rows if model else 0,
        "validation_auc": model.validation_auc if model else 0,
        "precision": model.precision if model else 0,
        "recall": model.recall if model else 0,
    }


@router.post("/bot/run")
def run_bot_route(db: Session = Depends(get_db)) -> dict:
    return run_bot(db)


@router.get("/opportunities")
def opportunities(db: Session = Depends(get_db)) -> list[dict]:
    return opportunities_payload(db)


@router.get("/opportunities/easy-wins")
def easy_wins(db: Session = Depends(get_db)) -> list[dict]:
    return opportunities_payload(db, mode="easy")


@router.get("/opportunities/fast-wins")
def fast_wins(db: Session = Depends(get_db)) -> list[dict]:
    return opportunities_payload(db, mode="fast")


@router.get("/market-sections")
def market_sections(db: Session = Depends(get_db)) -> list[dict]:
    sections = {}
    for market in markets_payload(db, limit=1000):
        section = market["section"] or "trending"
        item = sections.setdefault(section, {"name": section.replace("-", " ").title(), "slug": section, "markets": 0, "volume": 0, "pulse": 0, "signal": "Live data"})
        item["markets"] += 1
        item["volume"] += market["volume"] or 0
    return list(sections.values())


@router.get("/market-sections/{slug}")
def market_section(slug: str, db: Session = Depends(get_db)) -> dict:
    return {"section": slug, "markets": markets_payload(db, section=slug)}


@router.get("/markets")
def markets(section: str | None = None, db: Session = Depends(get_db)) -> list[dict]:
    return markets_payload(db, section=section)


@router.get("/markets/{market_id}")
def market(market_id: int, db: Session = Depends(get_db)) -> dict:
    row = db.get(Market, market_id)
    return market_payload(row) if row else {}


@router.get("/traders")
def traders(period: str = "monthly", db: Session = Depends(get_db)) -> dict:
    return {"period": period, "traders": traders_payload(db)}


@router.post("/traders/sync")
async def traders_sync(period: str = "30d", db: Session = Depends(get_db)) -> dict:
    return await sync_trader_intel(db, period=period)


@router.get("/traders/{wallet}")
def trader(wallet: str, db: Session = Depends(get_db)) -> dict:
    matches = [item for item in traders_payload(db) if item["wallet"] == wallet]
    return {"trader": matches[0] if matches else None, "copy_signals": copy_signals_payload(db), "positions": trader_positions_payload(db, wallet)}


@router.get("/copy-signals")
def copy_signals(db: Session = Depends(get_db)) -> list[dict]:
    return copy_signals_payload(db)


@router.post("/btc-5m/sync")
async def btc5m_sync(db: Session = Depends(get_db)) -> dict:
    return await sync_btc5m_windows(db)


@router.get("/btc-5m")
def btc5m(db: Session = Depends(get_db)) -> dict:
    return btc5m_payload(db)


@router.post("/backtests/run")
def backtests_run(payload: BacktestRequest, db: Session = Depends(get_db)) -> dict:
    return run_backtest(db, strategy=payload.strategy, starting_balance=payload.starting_balance, risk_mode=payload.risk_mode)


@router.get("/backtests")
def backtests(db: Session = Depends(get_db)) -> list[dict]:
    return [backtest_payload(row) for row in db.query(BacktestRun).order_by(BacktestRun.created_at.desc()).limit(50).all()]


@router.get("/backtests/{run_id}")
def backtest(run_id: int, db: Session = Depends(get_db)) -> dict:
    row = db.get(BacktestRun, run_id)
    return backtest_detail_payload(db, row) if row else {}


@router.get("/live-orders")
def live_orders(db: Session = Depends(get_db)) -> list[dict]:
    rows = db.query(LiveOrderAudit).order_by(LiveOrderAudit.created_at.desc()).limit(100).all()
    return [
        {
            "id": row.id,
            "decision_id": row.decision_id,
            "mode": row.mode,
            "market": row.market,
            "outcome": row.outcome,
            "intended_price": row.intended_price,
            "actual_fill_price": row.actual_fill_price,
            "amount": row.amount,
            "order_id": row.order_id,
            "status": row.status,
            "rejection_reason": row.rejection_reason,
            "created_at": row.created_at.isoformat(),
        }
        for row in rows
    ]


@router.get("/live-credentials/status")
def live_credentials_status(db: Session = Depends(get_db)) -> dict:
    return {"credentials": credential_status(db), "live_trading": live_ready(db)}


@router.post("/live-credentials")
def live_credentials_save(payload: LiveCredentialsRequest, db: Session = Depends(get_db)) -> dict:
    values = {
        "POLYMARKET_PRIVATE_KEY": payload.polymarket_private_key,
        "POLYMARKET_FUNDER_ADDRESS": payload.polymarket_funder_address,
        "POLYMARKET_API_KEY": payload.polymarket_api_key,
        "POLYMARKET_API_SECRET": payload.polymarket_api_secret,
        "POLYMARKET_API_PASSPHRASE": payload.polymarket_api_passphrase,
    }
    return save_live_credentials(db, values)


@router.get("/portfolio")
def portfolio(db: Session = Depends(get_db)) -> dict:
    return refresh_portfolio(db)


@router.get("/trades")
def trades(db: Session = Depends(get_db)) -> list[dict]:
    return portfolio_payload(db)["trades"]


@router.get("/bot-log")
def bot_log(db: Session = Depends(get_db)) -> list[dict]:
    return logs_payload(db)


@router.get("/polymarket/markets")
async def polymarket_markets(limit: int = 25) -> dict:
    client = PolymarketClient()
    markets = await client.get_markets(limit=limit)
    return {"count": len(markets), "markets": markets}


async def event_stream():
    while True:
        db = SessionLocal()
        latest = logs_payload(db, limit=1)
        db.close()
        payload = latest[0] if latest else {"time": datetime.utcnow().isoformat(), "type": "WATCH", "message": "Waiting for engine events."}
        yield f"data: {json.dumps(payload)}\n\n"
        await asyncio.sleep(2)


@router.get("/bot-log/stream")
async def bot_log_stream() -> StreamingResponse:
    return StreamingResponse(event_stream(), media_type="text/event-stream")
