import asyncio
import json
from datetime import datetime

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.services.demo import demo_copy_signals, demo_market_sections, demo_opportunities, demo_status, demo_traders
from app.services.polymarket import PolymarketClient
from app.workers.live_engine import LiveEngine

router = APIRouter()
engine = LiveEngine()


@router.get("/health")
def health() -> dict:
    return {"ok": True, "service": "polyengine-engine", "time": datetime.utcnow().isoformat()}


@router.get("/live/status")
def live_status() -> dict:
    return demo_status()


@router.post("/live/tick")
async def live_tick() -> dict:
    return await engine.tick()


@router.get("/opportunities")
def opportunities() -> list[dict]:
    return demo_opportunities()


@router.get("/market-sections")
def market_sections() -> list[dict]:
    return demo_market_sections()


@router.get("/traders")
def traders(period: str = "monthly") -> dict:
    return {"period": period, "traders": demo_traders()}


@router.get("/traders/{wallet}")
def trader(wallet: str) -> dict:
    matches = [item for item in demo_traders() if item["wallet"] == wallet]
    return {"trader": matches[0] if matches else None, "copy_signals": demo_copy_signals()}


@router.get("/copy-signals")
def copy_signals() -> list[dict]:
    return demo_copy_signals()


@router.get("/polymarket/markets")
async def polymarket_markets(limit: int = 25) -> dict:
    client = PolymarketClient()
    markets = await client.get_markets(limit=limit)
    return {"count": len(markets), "markets": markets}


async def event_stream():
    events = [
        ("SCAN", "Checked active high-volume markets"),
        ("SIGNAL", "Fed rate cut YES scored 87% confidence"),
        ("CHECK", "Liquidity OK, spread 1.2%, edge +16.0%"),
        ("ENTER", "Paper buy $48.00 at 0.42 simulated fill"),
        ("WATCH", "Position moved +3.8%, take-profit still pending"),
        ("SKIP", "Election market skipped because spread exceeded max"),
    ]
    index = 0
    while True:
        event_type, message = events[index % len(events)]
        payload = {
            "time": datetime.utcnow().isoformat(),
            "type": event_type,
            "message": message,
        }
        yield f"data: {json.dumps(payload)}\n\n"
        index += 1
        await asyncio.sleep(2)


@router.get("/bot-log/stream")
async def bot_log_stream() -> StreamingResponse:
    return StreamingResponse(event_stream(), media_type="text/event-stream")
