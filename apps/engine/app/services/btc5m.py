import re
from datetime import datetime, timedelta

import httpx
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.models.schema import BtcFiveMinuteWindow, Market, Outcome
from app.services.terminal import as_float, log, parse_time


BTC5M_RE = re.compile(r"btc-updown-5m|btc up or down 5m|bitcoin up or down", re.I)


async def fetch_btc_spot() -> dict:
    prices: list[float] = []
    async with httpx.AsyncClient(timeout=8) as client:
        for url, parser in [
            ("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT", lambda p: p.get("price")),
            ("https://api.coinbase.com/v2/prices/BTC-USD/spot", lambda p: (p.get("data") or {}).get("amount")),
            ("https://api.kraken.com/0/public/Ticker?pair=XBTUSD", lambda p: (((p.get("result") or {}).get("XXBTZUSD") or {}).get("c") or [None])[0]),
        ]:
            try:
                prices.append(float(parser((await client.get(url)).json())))
            except Exception:
                continue
    if not prices:
        raise RuntimeError("No BTC spot feeds available")
    return {"spot_price": sum(prices) / len(prices), "feeds": len(prices), "dispersion": max(prices) - min(prices)}


def is_btc5m_market(market: Market) -> bool:
    return bool(BTC5M_RE.search(f"{market.slug or ''} {market.question} {market.description or ''}"))


async def sync_btc5m_windows(db: Session, limit: int = 20) -> dict:
    try:
        spot = await fetch_btc_spot()
    except Exception as exc:
        log(db, "BTC5M", f"BTC 5m feed sync skipped: {exc}", "error")
        return {"synced": 0, "error": str(exc)}
    markets = (
        db.query(Market)
        .filter(Market.active.is_(True), Market.closed.is_(False))
        .order_by(desc(Market.synced_at))
        .limit(1000)
        .all()
    )
    synced = 0
    for market in markets:
        if not is_btc5m_market(market):
            continue
        window = db.query(BtcFiveMinuteWindow).filter(BtcFiveMinuteWindow.slug == (market.slug or market.polymarket_id)).one_or_none()
        if window is None:
            window = BtcFiveMinuteWindow(slug=market.slug or market.polymarket_id, market_id=market.id)
            db.add(window)
        outcomes = {outcome.name.lower(): outcome for outcome in market.outcomes}
        up = next((outcome for name, outcome in outcomes.items() if "up" in name or "yes" in name), None)
        down = next((outcome for name, outcome in outcomes.items() if "down" in name or "no" in name), None)
        window.market_id = market.id
        window.window_end = market.end_at
        window.window_start = market.end_at - timedelta(minutes=5) if market.end_at else parse_time(None)
        window.up_token_id = up.token_id if up else None
        window.down_token_id = down.token_id if down else None
        window.up_price = up.price if up else 0
        window.down_price = down.price if down else 0
        window.spot_price = spot["spot_price"]
        if window.price_to_beat <= 0:
            window.price_to_beat = spot["spot_price"]
        _score_window(window, spot)
        synced += 1
        if synced >= limit:
            break
    db.commit()
    if synced:
        log(db, "BTC5M", f"Updated {synced} BTC 5-minute windows with {spot['feeds']} BTC feeds.")
    return {"synced": synced, "spot": spot}


def _score_window(window: BtcFiveMinuteWindow, spot: dict) -> None:
    now = datetime.utcnow()
    seconds_left = (window.window_end - now).total_seconds() if window.window_end else 300
    distance = spot["spot_price"] - window.price_to_beat
    dispersion = spot.get("dispersion", 0)
    micro_trend = distance / max(window.price_to_beat, 1)
    volatility_penalty = min(20, dispersion / max(window.price_to_beat, 1) * 8000)
    time_penalty = 18 if seconds_left < 35 else 0
    confidence = int(max(1, min(99, 55 + abs(micro_trend) * 12_000 - volatility_penalty - time_penalty)))
    side = "UP" if distance >= 0 else "DOWN"
    market_price = window.up_price if side == "UP" else window.down_price
    fair = min(0.98, max(0.02, 0.5 + micro_trend * 180))
    edge = fair - market_price
    no_trade_reason = None
    if seconds_left < 20:
        no_trade_reason = "Too close to expiry for a clean entry."
    elif confidence < 65:
        no_trade_reason = "BTC signal is not strong enough."
    elif dispersion > 40:
        no_trade_reason = "BTC feeds disagree too much."
    elif edge <= 0.015:
        no_trade_reason = "Polymarket odds already price most of the move."
    window.recommended_side = side if not no_trade_reason else "WATCH"
    window.confidence = confidence
    window.expected_edge = edge
    window.max_entry_price = max(0.01, min(0.99, fair - 0.01))
    window.no_trade_reason = no_trade_reason or f"{side} favored: BTC is {distance:.2f} away from the price-to-beat with {confidence}% confidence."
    window.status = "enter" if not no_trade_reason else "watching"
    window.indicators = {
        "micro_trend": micro_trend,
        "ema_slope": micro_trend * 0.8,
        "vwap_distance": micro_trend * 0.6,
        "rsi": max(1, min(99, 50 + micro_trend * 5000)),
        "macd_impulse": micro_trend * 100,
        "volatility": dispersion,
        "momentum_acceleration": micro_trend * 1.2,
        "feed_dispersion": dispersion,
        "seconds_left": seconds_left,
        "fair_probability": fair,
    }
    window.updated_at = now


def btc5m_payload(db: Session) -> dict:
    rows = db.query(BtcFiveMinuteWindow).order_by(desc(BtcFiveMinuteWindow.updated_at)).limit(20).all()
    return {
        "windows": [
            {
                "id": row.id,
                "slug": row.slug,
                "window_start": row.window_start.isoformat() if row.window_start else None,
                "window_end": row.window_end.isoformat() if row.window_end else None,
                "status": row.status,
                "price_to_beat": row.price_to_beat,
                "chainlink_price": row.chainlink_price,
                "spot_price": row.spot_price,
                "up_price": row.up_price,
                "down_price": row.down_price,
                "recommended_side": row.recommended_side,
                "confidence": row.confidence,
                "expected_edge": row.expected_edge,
                "max_entry_price": row.max_entry_price,
                "why": row.no_trade_reason,
                "indicators": row.indicators or {},
            }
            for row in rows
        ]
    }
