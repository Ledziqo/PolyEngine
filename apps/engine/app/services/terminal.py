import json
from datetime import datetime, timedelta
from math import isfinite
from typing import Any

from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from app.models.schema import (
    BotLog,
    BotSetting,
    CopySignal,
    Market,
    OrderBookSnapshot,
    Outcome,
    PaperTrade,
    Portfolio,
    Position,
    PriceSnapshot,
    Trader,
)
from app.services.live_trading import execute_live_order
from app.services.live_trading import live_ready
from app.services.ml_model import predict_outcome
from app.services.demo import demo_copy_signals, demo_traders
from app.services.polymarket import PolymarketClient
from app.services.ratings import bot_action_for_rating, rating_from_score

SECTION_KEYWORDS = {
    "world-cup": ["world cup", "fifa"],
    "breaking": ["breaking", "today", "headline", "ceasefire"],
    "politics": ["election", "president", "senate", "congress", "trump", "biden", "politic"],
    "sports": ["nba", "nfl", "mlb", "nhl", "soccer", "football", "ufc", "tennis"],
    "crypto": ["bitcoin", "btc", "ethereum", "eth", "crypto", "solana", "xrp"],
    "esports": ["esports", "league of legends", "valorant", "cs2", "counter-strike"],
    "iran": ["iran", "tehran"],
    "finance": ["fed", "rate", "stock", "s&p", "nasdaq", "finance", "market"],
    "geopolitics": ["war", "russia", "ukraine", "israel", "china", "geopolitic"],
    "tech": ["ai", "openai", "apple", "tesla", "microsoft", "nvidia", "tech"],
    "culture": ["movie", "music", "celebrity", "culture", "art"],
    "economy": ["cpi", "inflation", "gdp", "recession", "economy"],
    "weather": ["weather", "hurricane", "temperature", "rain", "snow"],
    "mentions": ["mention", "tweet", "post", "say"],
    "elections": ["election", "primary", "poll"],
}

PRIMARY_SECTION_KEYWORDS = {
    "crypto": ["bitcoin", "btc", "ethereum", "eth", "crypto", "solana", "xrp"],
    "elections": ["election", "primary", "poll"],
    "finance": ["fed", "rate", "stock", "s&p", "nasdaq", "finance", "market"],
    "geopolitics": ["war", "russia", "ukraine", "israel", "china", "geopolitic"],
}


def as_float(value: Any, default: float = 0.0) -> float:
    try:
        if value is None or value == "":
            return default
        parsed = float(value)
        return parsed if isfinite(parsed) else default
    except (TypeError, ValueError):
        return default


def parse_jsonish(value: Any) -> list[Any]:
    if isinstance(value, list):
        return value
    if isinstance(value, str):
        try:
            parsed = json.loads(value)
            return parsed if isinstance(parsed, list) else []
        except json.JSONDecodeError:
            return []
    return []


def parse_time(value: Any) -> datetime | None:
    if not value:
        return None
    if isinstance(value, datetime):
        return value
    if isinstance(value, str):
        try:
            return datetime.fromisoformat(value.replace("Z", "+00:00")).replace(tzinfo=None)
        except ValueError:
            return None
    return None


def section_for_market(question: str, category: str | None) -> str:
    question_text = question.lower()
    for slug, keywords in PRIMARY_SECTION_KEYWORDS.items():
        if any(keyword in question_text for keyword in keywords):
            return slug
    haystack = f"{question} {category or ''}".lower()
    for slug, keywords in SECTION_KEYWORDS.items():
        if any(keyword in haystack for keyword in keywords):
            return slug
    return "trending"


def log(db: Session, event_type: str, message: str, level: str = "info", market: str | None = None) -> None:
    db.add(BotLog(level=level, event_type=event_type, message=message, market=market))
    db.commit()


def ensure_defaults(db: Session) -> None:
    if db.query(BotSetting).count() == 0:
        db.add(BotSetting())
    if db.query(Portfolio).count() == 0:
        db.add(Portfolio())
    existing_wallets = {row.wallet for row in db.query(Trader).all()}
    if len(existing_wallets) < 20:
        for trader in demo_traders():
            if trader["wallet"] in existing_wallets:
                continue
            db.add(
                Trader(
                    wallet=trader["wallet"],
                    name=trader["name"],
                    pnl=trader["pnl"],
                    roi=trader["roi"],
                    volume=trader["volume"],
                    win_rate=trader["win_rate"],
                    gain_loss=trader["gain_loss"],
                    active_value=trader["active_value"],
                    copy_score=trader["copy_score"],
                    source_quality="estimated",
                )
            )
            existing_wallets.add(trader["wallet"])
        db.flush()
    if db.query(CopySignal).count() == 0:
        traders = {trader.name: trader for trader in db.query(Trader).all()}
        for signal in demo_copy_signals():
            trader = traders.get(signal["trader"])
            db.add(
                CopySignal(
                    trader_id=trader.id if trader else None,
                    market=signal["market"],
                    side=signal["side"],
                    size=signal["size"],
                    entry=signal["entry"],
                    current=signal["current"],
                    copy_score=signal["copy_score"],
                    status=signal["status"],
                    source_quality="estimated",
                )
            )
    db.commit()


def bot_settings(db: Session) -> BotSetting:
    ensure_defaults(db)
    return db.query(BotSetting).first()


async def sync_markets(db: Session, limit: int = 250) -> dict:
    client = PolymarketClient()
    rows = await client.get_markets(limit=limit)
    synced = 0
    now = datetime.utcnow()
    for row in rows:
        question = row.get("question") or row.get("title") or row.get("slug") or "Untitled market"
        polymarket_id = str(row.get("id") or row.get("conditionId") or row.get("slug") or question)
        category = row.get("category") or row.get("groupItemTitle")
        market = db.query(Market).filter(Market.polymarket_id == polymarket_id).one_or_none()
        if market is None:
            market = Market(polymarket_id=polymarket_id, question=question)
            db.add(market)
        market.question = question[:500]
        market.category = category
        market.section = section_for_market(question, category)
        market.description = row.get("description")
        market.slug = row.get("slug")
        market.volume = as_float(row.get("volume") or row.get("volumeNum"))
        market.liquidity = as_float(row.get("liquidity") or row.get("liquidityNum"))
        market.active = bool(row.get("active", True))
        market.closed = bool(row.get("closed", False))
        market.end_at = parse_time(row.get("endDate") or row.get("endDateIso"))
        market.synced_at = now
        db.flush()

        outcome_names = parse_jsonish(row.get("outcomes")) or ["Yes", "No"]
        outcome_prices = parse_jsonish(row.get("outcomePrices"))
        token_ids = parse_jsonish(row.get("clobTokenIds"))
        for index, name in enumerate(outcome_names):
            outcome = db.query(Outcome).filter(Outcome.market_id == market.id, Outcome.name == str(name)).one_or_none()
            if outcome is None:
                outcome = Outcome(market=market, name=str(name)[:120])
                db.add(outcome)
            outcome.token_id = str(token_ids[index]) if index < len(token_ids) else outcome.token_id
            outcome.price = as_float(outcome_prices[index], outcome.price) if index < len(outcome_prices) else outcome.price
            outcome.liquidity = market.liquidity
        synced += 1
    db.commit()
    log(db, "SYNC", f"Synced {synced} Polymarket markets from Gamma.")
    return {"synced": synced, "source": "gamma"}


def _orders_depth(orders: list[dict], levels: int = 10) -> float:
    total = 0.0
    for order in orders[:levels]:
        total += as_float(order.get("size") or order.get("quantity"))
    return total


async def sync_order_books(db: Session, limit: int = 100) -> dict:
    client = PolymarketClient()
    outcomes = (
        db.query(Outcome)
        .filter(Outcome.token_id.isnot(None))
        .join(Market)
        .filter(Market.active.is_(True), Market.closed.is_(False))
        .order_by(desc(Market.volume), desc(Market.liquidity))
        .limit(limit)
        .all()
    )
    synced = 0
    for outcome in outcomes:
        try:
            book = await client.get_order_book(outcome.token_id or "")
        except Exception as exc:
            log(db, "ERROR", f"Order book sync failed for {outcome.name}: {exc}", "error", outcome.market.question)
            continue
        bids = book.get("bids") or []
        asks = book.get("asks") or []
        best_bid = max([as_float(order.get("price")) for order in bids], default=0.0)
        best_ask = min([as_float(order.get("price")) for order in asks if as_float(order.get("price")) > 0], default=0.0)
        midpoint = (best_bid + best_ask) / 2 if best_bid and best_ask else outcome.price
        spread = max(0.0, best_ask - best_bid) if best_bid and best_ask else outcome.spread
        depth = _orders_depth(bids) + _orders_depth(asks)
        outcome.price = midpoint or outcome.price
        outcome.spread = spread
        outcome.liquidity = max(outcome.liquidity, depth)
        outcome.price_synced_at = datetime.utcnow()
        db.add(OrderBookSnapshot(outcome_id=outcome.id, best_bid=best_bid, best_ask=best_ask, spread=spread, depth=depth, raw_book=book))
        db.add(PriceSnapshot(outcome_id=outcome.id, price=outcome.price, bid=best_bid, ask=best_ask, spread=spread, liquidity=outcome.liquidity))
        synced += 1
    db.commit()
    if synced:
        log(db, "SYNC", f"Synced {synced} order books from CLOB.")
    return {"synced": synced, "source": "clob"}


def score_all(db: Session, limit: int = 500) -> dict:
    settings = bot_settings(db)
    outcomes = (
        db.query(Outcome)
        .join(Market)
        .filter(Market.active.is_(True), Market.closed.is_(False))
        .order_by(desc(Market.volume), desc(Market.liquidity))
        .limit(limit)
        .all()
    )
    scored = 0
    grouped: dict[int, list[Outcome]] = {}
    for outcome in outcomes:
        price = min(max(outcome.price or 0.5, 0.01), 0.99)
        liquidity_score = min(100, (outcome.liquidity / max(settings.min_liquidity, 1)) * 70)
        spread_score = max(0, 100 - (outcome.spread / max(settings.max_spread, 0.001)) * 45)
        expiry_score = 70
        hours = None
        if outcome.market.end_at:
            hours = (outcome.market.end_at - datetime.utcnow()).total_seconds() / 3600
            expiry_score = 90 if 2 <= hours <= 72 else 45 if hours < 2 else 65
        momentum_score = min(100, 45 + outcome.market.volume / 100_000)
        depth_score = min(100, 45 + outcome.liquidity / 5000)
        wallet_score = 50
        risk_score = min(100, (liquidity_score + spread_score) / 2)
        model_signal = predict_outcome(db, outcome)
        model_probability = model_signal["probability"]
        model_edge = model_probability - price
        execution_edge = max(0.0, min(0.025, (liquidity_score - 55) / 1800 + (spread_score - 70) / 2500))
        fair = min(max(price + model_edge * 0.45 + execution_edge, 0.01), 0.99)
        edge = fair - price
        extreme_price_penalty = 14 if price < 0.06 or price > 0.94 else 0
        long_expiry_penalty = 10 if hours is not None and hours > 24 * 90 else 0
        stale_penalty = 10 if not outcome.price_synced_at or outcome.price_synced_at < datetime.utcnow() - timedelta(minutes=10) else 0
        fallback_cap = 62 if model_signal["version"] == "rule-fallback" else 88
        confidence = int(
            min(
                fallback_cap,
                max(
                    5,
                    model_signal["confidence"] * 0.58
                    + max(edge, 0) * 180
                    + liquidity_score * 0.08
                    + spread_score * 0.06
                    + expiry_score * 0.04
                    - extreme_price_penalty
                    - long_expiry_penalty
                    - stale_penalty,
                ),
            )
        )
        score = (
            confidence * 0.32
            + max(edge * 100, 0) * 1.2
            + liquidity_score * 0.14
            + spread_score * 0.14
            + expiry_score * 0.08
            + momentum_score * 0.08
            + depth_score * 0.10
            + wallet_score * 0.04
            + risk_score * 0.16
        )
        score = min(100, max(0, score))
        if confidence < 66 or edge < 0.015 or liquidity_score < 55 or spread_score < 60:
            score = min(score, 71)
        if price < 0.06 and model_signal["version"] == "rule-fallback":
            score = min(score, 57)
        rating = rating_from_score(score)
        action = bot_action_for_rating(rating, settings.risk_mode)
        outcome.fair_probability = fair
        outcome.edge = max(edge, model_probability - price)
        outcome.confidence = confidence
        outcome.rating = rating
        outcome.bot_action = action
        outcome.score_breakdown = {
            "overall": round(score, 2),
            "liquidity": round(liquidity_score, 2),
            "spread": round(spread_score, 2),
            "expiry": round(expiry_score, 2),
            "momentum": round(momentum_score, 2),
            "depth": round(depth_score, 2),
            "wallet": wallet_score,
            "risk": round(risk_score, 2),
            "model_probability": round(model_probability, 4),
            "model_version": model_signal["version"],
        }
        grouped.setdefault(outcome.market_id, []).append(outcome)
        scored += 1

    for market_id, market_outcomes in grouped.items():
        best = max(market_outcomes, key=lambda item: (item.score_breakdown or {}).get("overall", 0))
        market = best.market
        market.rating = best.rating
        market.preferred_pick = best.name
        market.bot_action = best.bot_action
        market.score_breakdown = best.score_breakdown
    db.commit()
    if scored:
        log(db, "SCORE", f"Rated {scored} outcomes and selected preferred picks.")
    return {"scored": scored}


def portfolio(db: Session) -> Portfolio:
    ensure_defaults(db)
    return db.query(Portfolio).first()


def refresh_portfolio(db: Session) -> dict:
    port = portfolio(db)
    positions = db.query(Position).filter(Position.status == "open").all()
    exposure = 0.0
    unrealized = 0.0
    for position in positions:
        outcome = db.get(Outcome, position.outcome_id)
        if not outcome:
            continue
        position.current_price = outcome.price
        position.unrealized_pnl = (outcome.price - position.avg_price) * position.quantity
        exposure += position.cost_basis
        unrealized += position.unrealized_pnl
    port.exposure = exposure
    port.unrealized_pnl = unrealized
    port.updated_at = datetime.utcnow()
    db.commit()
    return portfolio_payload(db)


def _position_size(settings: BotSetting, port: Portfolio, outcome: Outcome) -> float:
    remaining = max(settings.max_total_exposure - port.exposure, 0)
    rating_multiplier = {"Best": 1.0, "Strong": 0.75, "Good": 0.45}.get(outcome.rating, 0)
    return max(0.0, min(settings.max_trade_amount * rating_multiplier, remaining))


def run_bot(db: Session) -> dict:
    settings = bot_settings(db)
    if settings.state != "enabled" or settings.emergency_stop:
        return {"state": settings.state, "entered": 0, "exited": 0}
    port = portfolio(db)
    entered = 0
    exited = 0

    for position in db.query(Position).filter(Position.status == "open").all():
        outcome = db.get(Outcome, position.outcome_id)
        if not outcome:
            continue
        hold_minutes = (datetime.utcnow() - position.opened_at).total_seconds() / 60 if position.opened_at else 999
        pnl_pct = ((outcome.price - position.avg_price) / position.avg_price) if position.avg_price else 0
        exit_reason = None
        if hold_minutes < 30:
            exit_reason = None
        elif pnl_pct >= settings.take_profit:
            exit_reason = "take profit"
        elif pnl_pct <= -settings.stop_loss:
            exit_reason = "stop loss"
        elif outcome.rating in {"Avoid", "Weak"}:
            exit_reason = "rating decay"
        if exit_reason:
            amount = position.quantity * outcome.price
            pnl = amount - position.cost_basis
            position.status = "closed"
            position.closed_at = datetime.utcnow()
            port.balance += amount
            port.realized_pnl += pnl
            db.add(PaperTrade(outcome_id=outcome.id, position_id=position.id, action="EXIT", quantity=position.quantity, price=outcome.price, amount=amount, pnl=pnl, explanation=f"Exited on {exit_reason}."))
            log(db, "EXIT", f"Exited {outcome.market.question} {outcome.name} on {exit_reason}; paper PnL {pnl:.2f}.", market=outcome.market.question)
            exited += 1

    allowed = {"Safe": {"Best"}, "Balanced": {"Strong", "Best"}, "Aggressive": {"Good", "Strong", "Best"}}.get(settings.risk_mode, {"Strong", "Best"})
    candidates = (
        db.query(Outcome)
        .join(Market)
        .filter(Market.active.is_(True), Market.closed.is_(False), Outcome.rating.in_(allowed), Outcome.liquidity >= settings.min_liquidity, Outcome.spread <= settings.max_spread, Outcome.confidence >= 68, Outcome.edge >= 0.015)
        .order_by(desc(Outcome.confidence), desc(Outcome.edge), desc(Outcome.liquidity))
        .limit(10)
        .all()
    )
    for outcome in candidates:
        existing = db.query(Position).filter(Position.outcome_id == outcome.id, Position.status == "open").one_or_none()
        if existing:
            continue
        if outcome.price < 0.01 or outcome.price > 0.99:
            continue
        if outcome.price < 0.06 and (outcome.score_breakdown or {}).get("model_version") == "rule-fallback":
            log(db, "SKIP", f"Skipped {outcome.market.question} {outcome.name}: cheap long-shot without trained-model support.", market=outcome.market.question)
            continue
        recent_exit = (
            db.query(PaperTrade)
            .filter(PaperTrade.outcome_id == outcome.id, PaperTrade.action == "EXIT", PaperTrade.created_at >= datetime.utcnow() - timedelta(hours=6))
            .first()
        )
        if recent_exit:
            log(db, "SKIP", f"Skipped {outcome.market.question} {outcome.name}: cooldown after recent exit.", market=outcome.market.question)
            continue
        market_position = (
            db.query(Position)
            .join(Outcome, Position.outcome_id == Outcome.id)
            .filter(Outcome.market_id == outcome.market_id, Position.status == "open")
            .one_or_none()
        )
        if market_position:
            continue
        port = refresh_portfolio_object(db)
        amount = _position_size(settings, port, outcome)
        if amount <= 0:
            continue
        fill_price = min(0.99, outcome.price + min(outcome.spread / 2, 0.03))
        if settings.execution_mode == "live_capped":
            live_amount = min(amount, settings.max_live_trade_amount)
            live_result = execute_live_order(db, settings, outcome, live_amount, fill_price)
            log(db, "LIVE_ORDER", f"Live order {live_result['status']} for {outcome.market.question} {outcome.name}: {live_result.get('reason') or live_result.get('order_id') or 'submitted'}.", market=outcome.market.question)
            if not live_result.get("placed") and live_result.get("status") not in {"dry_run"}:
                continue
        quantity = amount / max(fill_price, 0.01)
        position = Position(outcome_id=outcome.id, quantity=quantity, avg_price=fill_price, current_price=outcome.price, cost_basis=amount)
        db.add(position)
        db.flush()
        port.balance -= amount
        db.add(PaperTrade(outcome_id=outcome.id, position_id=position.id, action="ENTER", quantity=quantity, price=fill_price, amount=amount, explanation=f"Entered {outcome.rating}: {outcome.market.question} — {outcome.name}. Confidence {outcome.confidence}%, edge {outcome.edge:.2%}."))
        log(db, "ENTER", f"Paper entered {outcome.market.question} — {outcome.name} for ${amount:.2f} at {fill_price:.2f}.", market=outcome.market.question)
        entered += 1
        if entered >= 2:
            break
    db.commit()
    refresh_portfolio(db)
    return {"state": settings.state, "entered": entered, "exited": exited}


def refresh_portfolio_object(db: Session) -> Portfolio:
    refresh_portfolio(db)
    return portfolio(db)


def reset_trading_state(db: Session, starting_balance: float = 10000.0, wipe_markets: bool = False) -> dict:
    db.query(PaperTrade).delete()
    db.query(Position).delete()
    db.query(BotLog).delete()
    if wipe_markets:
        db.query(PriceSnapshot).delete()
        db.query(OrderBookSnapshot).delete()
        db.query(Outcome).delete()
        db.query(Market).delete()
    port = portfolio(db)
    port.balance = max(0.0, starting_balance)
    port.realized_pnl = 0.0
    port.unrealized_pnl = 0.0
    port.exposure = 0.0
    port.updated_at = datetime.utcnow()
    settings = bot_settings(db)
    settings.state = "paused"
    settings.emergency_stop = False
    settings.updated_at = datetime.utcnow()
    db.commit()
    log(db, "RESET", f"Reset trading state. Paper balance set to ${port.balance:,.2f}.")
    return {"ok": True, "starting_balance": port.balance, "wipe_markets": wipe_markets}


def market_payload(market: Market) -> dict:
    best = max(market.outcomes, key=lambda outcome: (outcome.score_breakdown or {}).get("overall", 0), default=None)
    return {
        "id": market.id,
        "question": market.question,
        "category": market.category,
        "section": market.section or "trending",
        "volume": market.volume,
        "liquidity": market.liquidity,
        "active": market.active,
        "closed": market.closed,
        "rating": market.rating,
        "preferred_pick": market.preferred_pick,
        "bot_action": market.bot_action,
        "score_breakdown": market.score_breakdown,
        "end_at": market.end_at.isoformat() if market.end_at else None,
        "outcomes": [outcome_payload(outcome) for outcome in market.outcomes],
        "best_outcome": outcome_payload(best) if best else None,
    }


def outcome_payload(outcome: Outcome | None) -> dict | None:
    if outcome is None:
        return None
    return {
        "id": outcome.id,
        "name": outcome.name,
        "label": f"{outcome.market.question} — {outcome.name}" if outcome.market else outcome.name,
        "token_id": outcome.token_id,
        "price": outcome.price,
        "fair_probability": outcome.fair_probability,
        "edge": outcome.edge,
        "confidence": outcome.confidence,
        "rating": outcome.rating,
        "bot_action": outcome.bot_action,
        "score_breakdown": outcome.score_breakdown,
        "liquidity": outcome.liquidity,
        "spread": outcome.spread,
        "price_synced_at": outcome.price_synced_at.isoformat() if outcome.price_synced_at else None,
    }


def markets_payload(db: Session, section: str | None = None, limit: int = 500) -> list[dict]:
    query = db.query(Market).filter(Market.active.is_(True), Market.closed.is_(False))
    if section:
        query = query.filter(Market.section == section)
    rows = query.order_by(desc(Market.volume), desc(Market.liquidity)).limit(max(limit, 1000)).all()
    rows = sorted(rows, key=lambda row: ((row.score_breakdown or {}).get("overall", 0), row.volume or 0, row.liquidity or 0), reverse=True)[:limit]
    return [market_payload(row) for row in rows]


def opportunities_payload(db: Session, mode: str | None = None, limit: int = 250) -> list[dict]:
    query = db.query(Outcome).join(Market).filter(Market.active.is_(True), Market.closed.is_(False))
    if mode in {"easy", "fast"}:
        query = query.filter(Outcome.rating.in_(["Strong", "Best"]))
    if mode == "fast":
        query = query.filter(Market.end_at >= datetime.utcnow() + timedelta(hours=2), Market.end_at <= datetime.utcnow() + timedelta(hours=72))
    rows = query.order_by(desc(Outcome.confidence), desc(Outcome.edge), desc(Outcome.liquidity)).limit(limit).all()
    return [
        {
            **outcome_payload(row),
            "market": row.market.question,
            "market_id": row.market.id,
            "section": row.market.section,
            "why": f"{row.rating}: {row.market.question} — {row.name}. Confidence {row.confidence}%, edge {row.edge:.2%}, spread {row.spread:.2%}.",
        }
        for row in rows
    ]


def portfolio_payload(db: Session) -> dict:
    port = portfolio(db)
    positions = db.query(Position).filter(Position.status == "open").all()
    trades = db.query(PaperTrade).order_by(desc(PaperTrade.created_at)).limit(100).all()
    return {
        "balance": port.balance,
        "realized_pnl": port.realized_pnl,
        "unrealized_pnl": port.unrealized_pnl,
        "exposure": port.exposure,
        "positions": [
            {
                "id": item.id,
                "market": db.get(Outcome, item.outcome_id).market.question if db.get(Outcome, item.outcome_id) else "Unknown",
                "outcome": db.get(Outcome, item.outcome_id).name if db.get(Outcome, item.outcome_id) else "Unknown",
                "label": f"{db.get(Outcome, item.outcome_id).market.question} — {db.get(Outcome, item.outcome_id).name}" if db.get(Outcome, item.outcome_id) else "Unknown",
                "quantity": item.quantity,
                "avg_price": item.avg_price,
                "current_price": item.current_price,
                "cost_basis": item.cost_basis,
                "unrealized_pnl": item.unrealized_pnl,
                "status": item.status,
            }
            for item in positions
        ],
        "trades": [
            {
                "id": trade.id,
                "action": trade.action,
                "quantity": trade.quantity,
                "price": trade.price,
                "amount": trade.amount,
                "pnl": trade.pnl,
                "explanation": trade.explanation,
                "market": db.get(Outcome, trade.outcome_id).market.question if db.get(Outcome, trade.outcome_id) else "Unknown",
                "outcome": db.get(Outcome, trade.outcome_id).name if db.get(Outcome, trade.outcome_id) else "Unknown",
                "label": f"{db.get(Outcome, trade.outcome_id).market.question} — {db.get(Outcome, trade.outcome_id).name}" if db.get(Outcome, trade.outcome_id) else "Unknown",
                "created_at": trade.created_at.isoformat(),
            }
            for trade in trades
        ],
    }


def traders_payload(db: Session) -> list[dict]:
    ensure_defaults(db)
    return [
        {
            "rank": index + 1,
            "wallet": trader.wallet,
            "name": trader.name or trader.wallet,
            "pnl": trader.pnl,
            "roi": trader.roi,
            "volume": trader.volume,
            "win_rate": trader.win_rate,
            "gain_loss": trader.gain_loss,
            "active_value": trader.active_value,
            "copy_score": trader.copy_score,
            "source_quality": trader.source_quality,
            "source": trader.source,
            "positions": trader.positions,
            "period": trader.period,
            "last_activity_at": trader.last_activity_at.isoformat() if trader.last_activity_at else None,
        }
        for index, trader in enumerate(db.query(Trader).order_by(desc(Trader.copy_score), desc(Trader.pnl)).limit(100).all())
    ]


def copy_signals_payload(db: Session) -> list[dict]:
    ensure_defaults(db)
    rows = db.query(CopySignal).order_by(desc(CopySignal.created_at)).limit(100).all()
    return [
        {
            "trader": db.get(Trader, row.trader_id).name if row.trader_id and db.get(Trader, row.trader_id) else "tracked wallet",
            "market": row.market,
            "side": row.side,
            "label": f"{row.market} — {row.side}",
            "size": row.size,
            "entry": row.entry,
            "current": row.current,
            "copy_score": row.copy_score,
            "status": row.status,
            "source_quality": row.source_quality,
        }
        for row in rows
    ]


def logs_payload(db: Session, limit: int = 100) -> list[dict]:
    return [
        {
            "id": row.id,
            "level": row.level,
            "type": row.event_type,
            "message": row.message,
            "market": row.market,
            "created_at": row.created_at.isoformat(),
        }
        for row in db.query(BotLog).order_by(desc(BotLog.created_at)).limit(limit).all()
    ]


def live_status_payload(db: Session) -> dict:
    settings = bot_settings(db)
    latest_market = db.query(func.max(Market.synced_at)).scalar()
    latest_price = db.query(func.max(Outcome.price_synced_at)).scalar()
    latest_log = db.query(BotLog).order_by(desc(BotLog.created_at)).first()
    return {
        "live": bool(latest_price),
        "markets": db.query(Market).count(),
        "outcomes": db.query(Outcome).count(),
        "open_positions": db.query(Position).filter(Position.status == "open").count(),
        "latest_market_sync": latest_market.isoformat() if latest_market else None,
        "latest_price_sync": latest_price.isoformat() if latest_price else None,
        "latest_bot_decision": latest_log.created_at.isoformat() if latest_log else None,
        "stale": not latest_price or latest_price < datetime.utcnow() - timedelta(minutes=5),
        "bot": {
            "state": settings.state,
            "enabled": settings.state == "enabled",
            "risk_mode": settings.risk_mode,
            "minimum_rating": settings.minimum_rating,
            "execution_mode": settings.execution_mode,
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
        },
    }
