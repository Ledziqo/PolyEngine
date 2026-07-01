from datetime import datetime

from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.models.schema import BacktestRun, BacktestTrade, BtcFiveMinuteWindow, Outcome


def run_backtest(db: Session, strategy: str = "normal", starting_balance: float = 10_000, risk_mode: str = "Balanced") -> dict:
    if strategy == "btc5m":
        return _run_btc5m_backtest(db, starting_balance, risk_mode)
    return _run_normal_backtest(db, starting_balance, risk_mode)


def _run_normal_backtest(db: Session, starting_balance: float, risk_mode: str) -> dict:
    balance = starting_balance
    peak = starting_balance
    max_drawdown = 0.0
    wins = 0
    trades = 0
    skipped = 0
    run = BacktestRun(strategy="normal", risk_mode=risk_mode, starting_balance=starting_balance)
    db.add(run)
    db.flush()
    allowed = {"Safe": {"Best"}, "Balanced": {"Strong", "Best"}, "Aggressive": {"Good", "Strong", "Best"}}.get(risk_mode, {"Strong", "Best"})
    rows = db.query(Outcome).filter(Outcome.rating.in_(allowed)).order_by(desc(Outcome.confidence), desc(Outcome.edge)).limit(300).all()
    for outcome in rows:
        if outcome.spread > 0.08 or outcome.liquidity < 1000 or outcome.price <= 0 or outcome.price >= 0.99:
            skipped += 1
            continue
        amount = min(50.0, balance * 0.02)
        entry = min(0.99, outcome.price + min(outcome.spread / 2, 0.03))
        simulated_exit = min(0.99, max(0.01, entry + outcome.edge * 0.65 - outcome.spread * 0.35))
        pnl = (simulated_exit - entry) * (amount / max(entry, 0.01))
        balance += pnl
        peak = max(peak, balance)
        max_drawdown = min(max_drawdown, (balance - peak) / peak)
        wins += 1 if pnl > 0 else 0
        trades += 1
        db.add(BacktestTrade(run_id=run.id, market=outcome.market.question, outcome=outcome.name, action="SIM", entry_price=entry, exit_price=simulated_exit, amount=amount, pnl=pnl, explanation=f"Simulated {outcome.rating} setup with {outcome.confidence}% confidence."))
    run.ending_balance = balance
    run.pnl = balance - starting_balance
    run.roi = (run.pnl / starting_balance) * 100
    run.win_rate = (wins / trades) * 100 if trades else 0
    run.max_drawdown = abs(max_drawdown) * 100
    run.trade_count = trades
    run.skipped_count = skipped
    run.metrics = {"expectancy": run.pnl / trades if trades else 0, "mode": "historical-snapshot"}
    db.commit()
    return backtest_payload(run)


def _run_btc5m_backtest(db: Session, starting_balance: float, risk_mode: str) -> dict:
    balance = starting_balance
    wins = 0
    trades = 0
    skipped = 0
    run = BacktestRun(strategy="btc5m", risk_mode=risk_mode, starting_balance=starting_balance)
    db.add(run)
    db.flush()
    windows = db.query(BtcFiveMinuteWindow).order_by(desc(BtcFiveMinuteWindow.updated_at)).limit(300).all()
    for window in windows:
        if window.confidence < 68 or window.recommended_side not in {"UP", "DOWN"}:
            skipped += 1
            continue
        amount = min(25.0, balance * 0.01)
        market_price = window.up_price if window.recommended_side == "UP" else window.down_price
        edge = window.expected_edge
        pnl = amount * max(-1.0, min(1.0, edge * 3 - 0.08))
        balance += pnl
        wins += 1 if pnl > 0 else 0
        trades += 1
        db.add(BacktestTrade(run_id=run.id, market=window.slug, outcome=window.recommended_side, action="BTC5M_SIM", entry_price=market_price, exit_price=max(0.01, min(0.99, market_price + edge)), amount=amount, pnl=pnl, explanation=window.no_trade_reason or "BTC 5m historical signal simulation."))
    run.ending_balance = balance
    run.pnl = balance - starting_balance
    run.roi = (run.pnl / starting_balance) * 100
    run.win_rate = (wins / trades) * 100 if trades else 0
    run.trade_count = trades
    run.skipped_count = skipped
    run.metrics = {"expectancy": run.pnl / trades if trades else 0, "windows": len(windows)}
    db.commit()
    return backtest_payload(run)


def backtest_payload(run: BacktestRun) -> dict:
    return {
        "id": run.id,
        "strategy": run.strategy,
        "risk_mode": run.risk_mode,
        "starting_balance": run.starting_balance,
        "ending_balance": run.ending_balance,
        "pnl": run.pnl,
        "roi": run.roi,
        "win_rate": run.win_rate,
        "max_drawdown": run.max_drawdown,
        "trade_count": run.trade_count,
        "skipped_count": run.skipped_count,
        "metrics": run.metrics,
        "created_at": run.created_at.isoformat() if isinstance(run.created_at, datetime) else None,
    }


def backtest_detail_payload(db: Session, run: BacktestRun) -> dict:
    trades = db.query(BacktestTrade).filter(BacktestTrade.run_id == run.id).order_by(desc(BacktestTrade.created_at)).limit(300).all()
    return {
        **backtest_payload(run),
        "trades": [
            {
                "market": trade.market,
                "outcome": trade.outcome,
                "action": trade.action,
                "entry_price": trade.entry_price,
                "exit_price": trade.exit_price,
                "amount": trade.amount,
                "pnl": trade.pnl,
                "explanation": trade.explanation,
                "created_at": trade.created_at.isoformat(),
            }
            for trade in trades
        ],
    }
