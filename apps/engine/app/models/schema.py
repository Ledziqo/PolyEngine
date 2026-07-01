from datetime import datetime
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, JSON, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Market(Base):
    __tablename__ = "markets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    polymarket_id: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    question: Mapped[str] = mapped_column(String(500))
    category: Mapped[str | None] = mapped_column(String(120), nullable=True)
    section: Mapped[str | None] = mapped_column(String(120), nullable=True, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    slug: Mapped[str | None] = mapped_column(String(240), nullable=True, index=True)
    volume: Mapped[float] = mapped_column(Float, default=0.0)
    liquidity: Mapped[float] = mapped_column(Float, default=0.0)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    closed: Mapped[bool] = mapped_column(Boolean, default=False)
    rating: Mapped[str] = mapped_column(String(40), default="Watch")
    preferred_pick: Mapped[str | None] = mapped_column(String(160), nullable=True)
    bot_action: Mapped[str] = mapped_column(String(40), default="Watch")
    score_breakdown: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    end_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    synced_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    outcomes: Mapped[list["Outcome"]] = relationship(back_populates="market")


class Outcome(Base):
    __tablename__ = "outcomes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    market_id: Mapped[int] = mapped_column(ForeignKey("markets.id"))
    name: Mapped[str] = mapped_column(String(120))
    token_id: Mapped[str | None] = mapped_column(String(160), nullable=True, index=True)
    price: Mapped[float] = mapped_column(Float, default=0.0)
    fair_probability: Mapped[float] = mapped_column(Float, default=0.0)
    edge: Mapped[float] = mapped_column(Float, default=0.0)
    confidence: Mapped[int] = mapped_column(Integer, default=0)
    rating: Mapped[str] = mapped_column(String(40), default="Watch")
    bot_action: Mapped[str] = mapped_column(String(40), default="Watch")
    score_breakdown: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    liquidity: Mapped[float] = mapped_column(Float, default=0.0)
    spread: Mapped[float] = mapped_column(Float, default=0.0)
    price_synced_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    market: Mapped[Market] = relationship(back_populates="outcomes")

    __table_args__ = (UniqueConstraint("market_id", "name", name="uq_outcome_market_name"),)


class PriceSnapshot(Base):
    __tablename__ = "price_snapshots"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    outcome_id: Mapped[int] = mapped_column(ForeignKey("outcomes.id"), index=True)
    price: Mapped[float] = mapped_column(Float, default=0.0)
    bid: Mapped[float] = mapped_column(Float, default=0.0)
    ask: Mapped[float] = mapped_column(Float, default=0.0)
    spread: Mapped[float] = mapped_column(Float, default=0.0)
    liquidity: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)


class OrderBookSnapshot(Base):
    __tablename__ = "order_book_snapshots"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    outcome_id: Mapped[int] = mapped_column(ForeignKey("outcomes.id"), index=True)
    best_bid: Mapped[float] = mapped_column(Float, default=0.0)
    best_ask: Mapped[float] = mapped_column(Float, default=0.0)
    spread: Mapped[float] = mapped_column(Float, default=0.0)
    depth: Mapped[float] = mapped_column(Float, default=0.0)
    raw_book: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)


class BotSetting(Base):
    __tablename__ = "bot_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    state: Mapped[str] = mapped_column(String(40), default="paused")
    execution_mode: Mapped[str] = mapped_column(String(40), default="paper")
    risk_mode: Mapped[str] = mapped_column(String(40), default="Balanced")
    minimum_rating: Mapped[str] = mapped_column(String(40), default="Strong")
    max_trade_amount: Mapped[float] = mapped_column(Float, default=50.0)
    max_total_exposure: Mapped[float] = mapped_column(Float, default=1500.0)
    max_live_trade_amount: Mapped[float] = mapped_column(Float, default=10.0)
    max_live_daily_spend: Mapped[float] = mapped_column(Float, default=50.0)
    max_live_daily_loss: Mapped[float] = mapped_column(Float, default=25.0)
    max_live_open_positions: Mapped[int] = mapped_column(Integer, default=3)
    btc5m_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    btc5m_max_trade_amount: Mapped[float] = mapped_column(Float, default=5.0)
    btc5m_min_confidence: Mapped[int] = mapped_column(Integer, default=72)
    min_liquidity: Mapped[float] = mapped_column(Float, default=25000.0)
    max_spread: Mapped[float] = mapped_column(Float, default=0.03)
    take_profit: Mapped[float] = mapped_column(Float, default=0.12)
    stop_loss: Mapped[float] = mapped_column(Float, default=0.08)
    emergency_stop: Mapped[bool] = mapped_column(Boolean, default=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Portfolio(Base):
    __tablename__ = "portfolios"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    balance: Mapped[float] = mapped_column(Float, default=10000.0)
    realized_pnl: Mapped[float] = mapped_column(Float, default=0.0)
    unrealized_pnl: Mapped[float] = mapped_column(Float, default=0.0)
    exposure: Mapped[float] = mapped_column(Float, default=0.0)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Position(Base):
    __tablename__ = "positions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    outcome_id: Mapped[int] = mapped_column(ForeignKey("outcomes.id"), index=True)
    side: Mapped[str] = mapped_column(String(40), default="BUY")
    quantity: Mapped[float] = mapped_column(Float, default=0.0)
    avg_price: Mapped[float] = mapped_column(Float, default=0.0)
    current_price: Mapped[float] = mapped_column(Float, default=0.0)
    cost_basis: Mapped[float] = mapped_column(Float, default=0.0)
    unrealized_pnl: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[str] = mapped_column(String(40), default="open", index=True)
    opened_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class PaperTrade(Base):
    __tablename__ = "paper_trades"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    outcome_id: Mapped[int] = mapped_column(ForeignKey("outcomes.id"), index=True)
    position_id: Mapped[int | None] = mapped_column(ForeignKey("positions.id"), nullable=True)
    action: Mapped[str] = mapped_column(String(40))
    quantity: Mapped[float] = mapped_column(Float, default=0.0)
    price: Mapped[float] = mapped_column(Float, default=0.0)
    amount: Mapped[float] = mapped_column(Float, default=0.0)
    pnl: Mapped[float] = mapped_column(Float, default=0.0)
    explanation: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)


class Trader(Base):
    __tablename__ = "traders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    wallet: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    name: Mapped[str | None] = mapped_column(String(160), nullable=True)
    pnl: Mapped[float] = mapped_column(Float, default=0.0)
    roi: Mapped[float] = mapped_column(Float, default=0.0)
    volume: Mapped[float] = mapped_column(Float, default=0.0)
    win_rate: Mapped[float] = mapped_column(Float, default=0.0)
    gain_loss: Mapped[float] = mapped_column(Float, default=0.0)
    active_value: Mapped[float] = mapped_column(Float, default=0.0)
    positions: Mapped[int] = mapped_column(Integer, default=0)
    period: Mapped[str] = mapped_column(String(40), default="30d", index=True)
    last_activity_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    source: Mapped[str] = mapped_column(String(80), default="demo")
    copy_score: Mapped[int] = mapped_column(Integer, default=0)
    source_quality: Mapped[str] = mapped_column(String(40), default="estimated")
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class CopySignal(Base):
    __tablename__ = "copy_signals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    trader_id: Mapped[int | None] = mapped_column(ForeignKey("traders.id"), nullable=True)
    market: Mapped[str] = mapped_column(String(500))
    side: Mapped[str] = mapped_column(String(80))
    size: Mapped[float] = mapped_column(Float, default=0.0)
    entry: Mapped[float] = mapped_column(Float, default=0.0)
    current: Mapped[float] = mapped_column(Float, default=0.0)
    copy_score: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(40), default="watching")
    source_quality: Mapped[str] = mapped_column(String(40), default="estimated")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)


class TraderPosition(Base):
    __tablename__ = "trader_positions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    trader_id: Mapped[int | None] = mapped_column(ForeignKey("traders.id"), nullable=True, index=True)
    wallet: Mapped[str] = mapped_column(String(160), index=True)
    market: Mapped[str] = mapped_column(String(500))
    outcome: Mapped[str] = mapped_column(String(120))
    side: Mapped[str] = mapped_column(String(40), default="BUY")
    size: Mapped[float] = mapped_column(Float, default=0.0)
    entry_price: Mapped[float] = mapped_column(Float, default=0.0)
    current_price: Mapped[float] = mapped_column(Float, default=0.0)
    realized_pnl: Mapped[float] = mapped_column(Float, default=0.0)
    unrealized_pnl: Mapped[float] = mapped_column(Float, default=0.0)
    source: Mapped[str] = mapped_column(String(80), default="bitquery")
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)


class PredictionModel(Base):
    __tablename__ = "prediction_models"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    model_type: Mapped[str] = mapped_column(String(80), default="short_edge", index=True)
    version: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    artifact_path: Mapped[str] = mapped_column(String(500))
    status: Mapped[str] = mapped_column(String(40), default="active")
    training_rows: Mapped[int] = mapped_column(Integer, default=0)
    validation_auc: Mapped[float] = mapped_column(Float, default=0.0)
    precision: Mapped[float] = mapped_column(Float, default=0.0)
    recall: Mapped[float] = mapped_column(Float, default=0.0)
    backtested_expectancy: Mapped[float] = mapped_column(Float, default=0.0)
    feature_names: Mapped[list | None] = mapped_column(JSON, nullable=True)
    trained_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)


class ModelPrediction(Base):
    __tablename__ = "model_predictions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    outcome_id: Mapped[int | None] = mapped_column(ForeignKey("outcomes.id"), nullable=True, index=True)
    model_version: Mapped[str] = mapped_column(String(80), index=True)
    horizon: Mapped[str] = mapped_column(String(40), default="1h")
    probability: Mapped[float] = mapped_column(Float, default=0.0)
    confidence: Mapped[int] = mapped_column(Integer, default=0)
    features: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)


class BacktestRun(Base):
    __tablename__ = "backtest_runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    strategy: Mapped[str] = mapped_column(String(80), default="normal", index=True)
    risk_mode: Mapped[str] = mapped_column(String(40), default="Balanced")
    starting_balance: Mapped[float] = mapped_column(Float, default=10000.0)
    ending_balance: Mapped[float] = mapped_column(Float, default=10000.0)
    pnl: Mapped[float] = mapped_column(Float, default=0.0)
    roi: Mapped[float] = mapped_column(Float, default=0.0)
    win_rate: Mapped[float] = mapped_column(Float, default=0.0)
    max_drawdown: Mapped[float] = mapped_column(Float, default=0.0)
    trade_count: Mapped[int] = mapped_column(Integer, default=0)
    skipped_count: Mapped[int] = mapped_column(Integer, default=0)
    metrics: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)


class BacktestTrade(Base):
    __tablename__ = "backtest_trades"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    run_id: Mapped[int] = mapped_column(ForeignKey("backtest_runs.id"), index=True)
    market: Mapped[str] = mapped_column(String(500))
    outcome: Mapped[str] = mapped_column(String(120))
    action: Mapped[str] = mapped_column(String(40))
    entry_price: Mapped[float] = mapped_column(Float, default=0.0)
    exit_price: Mapped[float] = mapped_column(Float, default=0.0)
    amount: Mapped[float] = mapped_column(Float, default=0.0)
    pnl: Mapped[float] = mapped_column(Float, default=0.0)
    explanation: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)


class BtcFiveMinuteWindow(Base):
    __tablename__ = "btc_five_minute_windows"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    market_id: Mapped[int | None] = mapped_column(ForeignKey("markets.id"), nullable=True, index=True)
    slug: Mapped[str] = mapped_column(String(240), unique=True, index=True)
    window_start: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    window_end: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, index=True)
    status: Mapped[str] = mapped_column(String(40), default="watching")
    price_to_beat: Mapped[float] = mapped_column(Float, default=0.0)
    chainlink_price: Mapped[float] = mapped_column(Float, default=0.0)
    spot_price: Mapped[float] = mapped_column(Float, default=0.0)
    up_token_id: Mapped[str | None] = mapped_column(String(160), nullable=True)
    down_token_id: Mapped[str | None] = mapped_column(String(160), nullable=True)
    up_price: Mapped[float] = mapped_column(Float, default=0.0)
    down_price: Mapped[float] = mapped_column(Float, default=0.0)
    recommended_side: Mapped[str] = mapped_column(String(40), default="WATCH")
    confidence: Mapped[int] = mapped_column(Integer, default=0)
    expected_edge: Mapped[float] = mapped_column(Float, default=0.0)
    max_entry_price: Mapped[float] = mapped_column(Float, default=0.0)
    no_trade_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    indicators: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)


class LiveOrderAudit(Base):
    __tablename__ = "live_order_audits"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    decision_id: Mapped[str] = mapped_column(String(120), index=True)
    mode: Mapped[str] = mapped_column(String(40), default="paper")
    market: Mapped[str] = mapped_column(String(500))
    outcome: Mapped[str] = mapped_column(String(120))
    side: Mapped[str] = mapped_column(String(40), default="BUY")
    intended_price: Mapped[float] = mapped_column(Float, default=0.0)
    actual_fill_price: Mapped[float] = mapped_column(Float, default=0.0)
    amount: Mapped[float] = mapped_column(Float, default=0.0)
    order_id: Mapped[str | None] = mapped_column(String(160), nullable=True)
    status: Mapped[str] = mapped_column(String(60), default="prepared", index=True)
    rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    raw_response: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)


class LiveCredential(Base):
    __tablename__ = "live_credentials"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    key_name: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    encrypted_value: Mapped[str] = mapped_column(Text)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)


class BotLog(Base):
    __tablename__ = "bot_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    level: Mapped[str] = mapped_column(String(40))
    event_type: Mapped[str] = mapped_column(String(60), index=True)
    message: Mapped[str] = mapped_column(Text)
    market: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
