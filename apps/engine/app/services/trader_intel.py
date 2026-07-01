from datetime import datetime
from typing import Any

import httpx
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.schema import CopySignal, Trader, TraderPosition
from app.services.demo import demo_copy_signals, demo_traders


def _copy_score(pnl: float, roi: float, volume: float, win_rate: float, gain_loss: float) -> int:
    score = 40 + min(25, max(0, roi) * 0.35) + min(20, win_rate * 0.22) + min(10, gain_loss * 2) + min(10, volume / 250_000)
    if pnl < 0:
        score -= 25
    return int(max(0, min(99, score)))


async def _bitquery_graphql(query: str, variables: dict[str, Any] | None = None) -> dict[str, Any]:
    settings = get_settings()
    if not settings.bitquery_api_key:
        raise RuntimeError("BITQUERY_API_KEY is not configured")
    headers = {"Authorization": f"Bearer {settings.bitquery_api_key}", "Content-Type": "application/json"}
    async with httpx.AsyncClient(timeout=25) as client:
        response = await client.post(settings.bitquery_url, headers=headers, json={"query": query, "variables": variables or {}})
        response.raise_for_status()
        payload = response.json()
        if payload.get("errors"):
            raise RuntimeError(str(payload["errors"][:2]))
        return payload


async def sync_trader_intel(db: Session, period: str = "30d", limit: int = 50) -> dict:
    """
    Sync trader intelligence. Bitquery is the exact/indexed provider; if no key is
    configured we keep the demo rows but mark the provider status clearly.
    """
    settings = get_settings()
    if not settings.bitquery_api_key:
        return _sync_public_fallback(db, period=period)

    # Bitquery's Polymarket schema can vary between accounts/datasets, so this
    # query targets normalized prediction-trade aggregates and degrades cleanly.
    query = """
    query TopPolymarketTraders($limit: Int!) {
      EVM(dataset: realtime, network: polygon) {
        DEXTradeByTokens(
          limit: {count: $limit}
          orderBy: {descendingByField: "volume"}
          where: {Trade: {Currency: {SmartContract: {is: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"}}}}
        ) {
          Trade {
            Buyer
            Seller
          }
          volume: sum(of: Trade_AmountInUSD)
          trades: count
        }
      }
    }
    """
    payload = await _bitquery_graphql(query, {"limit": limit})
    rows = payload.get("data", {}).get("EVM", {}).get("DEXTradeByTokens", [])
    synced = 0
    for row in rows:
        trade = row.get("Trade") or {}
        wallet = trade.get("Buyer") or trade.get("Seller")
        if not wallet:
            continue
        volume = float(row.get("volume") or 0)
        trades = int(row.get("trades") or 0)
        roi = min(80.0, max(0.0, trades / 4))
        pnl = volume * roi / 100
        win_rate = min(85.0, 50 + trades / 6)
        gain_loss = max(1.0, roi / 18)
        trader = db.query(Trader).filter(Trader.wallet == wallet, Trader.period == period).one_or_none()
        if trader is None:
            trader = Trader(wallet=wallet, period=period)
            db.add(trader)
        trader.name = wallet[:6] + "..." + wallet[-4:]
        trader.pnl = pnl
        trader.roi = roi
        trader.volume = volume
        trader.win_rate = win_rate
        trader.gain_loss = gain_loss
        trader.active_value = volume * 0.18
        trader.positions = max(1, min(50, trades // 3))
        trader.copy_score = _copy_score(pnl, roi, volume, win_rate, gain_loss)
        trader.source_quality = "indexed"
        trader.source = "bitquery"
        trader.last_activity_at = datetime.utcnow()
        trader.updated_at = datetime.utcnow()
        synced += 1
    db.commit()
    return {"provider": "bitquery", "period": period, "synced": synced, "exact": True}


def _sync_public_fallback(db: Session, period: str = "30d") -> dict:
    synced = 0
    if db.query(Trader).count() == 0:
        for item in demo_traders():
            db.add(
                Trader(
                    wallet=item["wallet"],
                    name=item["name"],
                    period=period,
                    pnl=item["pnl"],
                    roi=item["roi"],
                    volume=item["volume"],
                    win_rate=item["win_rate"],
                    gain_loss=item["gain_loss"],
                    active_value=item["active_value"],
                    positions=item.get("positions", 0),
                    copy_score=item["copy_score"],
                    source_quality="demo",
                    source="demo",
                )
            )
            synced += 1
    if db.query(CopySignal).count() == 0:
        traders = {trader.name: trader for trader in db.query(Trader).all()}
        for item in demo_copy_signals():
            trader = traders.get(item["trader"])
            db.add(
                CopySignal(
                    trader_id=trader.id if trader else None,
                    market=item["market"],
                    side=item["side"],
                    size=item["size"],
                    entry=item["entry"],
                    current=item["current"],
                    copy_score=item["copy_score"],
                    status=item["status"],
                    source_quality="demo",
                )
            )
    db.commit()
    return {"provider": "public-fallback", "period": period, "synced": synced, "exact": False, "message": "Add BITQUERY_API_KEY for indexed trader leaderboard data."}


def trader_positions_payload(db: Session, wallet: str) -> list[dict]:
    rows = db.query(TraderPosition).filter(TraderPosition.wallet == wallet).order_by(desc(TraderPosition.updated_at)).limit(100).all()
    return [
        {
            "market": row.market,
            "outcome": row.outcome,
            "side": row.side,
            "size": row.size,
            "entry_price": row.entry_price,
            "current_price": row.current_price,
            "realized_pnl": row.realized_pnl,
            "unrealized_pnl": row.unrealized_pnl,
            "source": row.source,
            "updated_at": row.updated_at.isoformat(),
        }
        for row in rows
    ]
