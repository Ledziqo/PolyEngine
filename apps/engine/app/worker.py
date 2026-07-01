import asyncio
from datetime import datetime

from app.core.database import SessionLocal, create_tables
from app.services.btc5m import sync_btc5m_windows
from app.services.terminal import ensure_defaults, log, refresh_portfolio, run_bot, score_all, sync_markets, sync_order_books
from app.services.trader_intel import sync_trader_intel


async def main() -> None:
    create_tables()
    db = SessionLocal()
    try:
        ensure_defaults(db)
        log(db, "WORKER", "PolyEngine worker started.")
    finally:
        db.close()

    last_market_sync: datetime | None = None
    last_trader_sync: datetime | None = None
    while True:
        db = SessionLocal()
        try:
            now = datetime.utcnow()
            if last_market_sync is None or (now - last_market_sync).total_seconds() >= 600:
                await sync_markets(db, limit=1000)
                last_market_sync = now
            await sync_order_books(db, limit=300)
            await sync_btc5m_windows(db, limit=20)
            score_all(db, limit=500)
            run_bot(db)
            refresh_portfolio(db)
            if last_trader_sync is None or (now - last_trader_sync).total_seconds() >= 900:
                await sync_trader_intel(db)
                log(db, "TRADERS", "Trader intelligence refresh completed.")
                last_trader_sync = now
        except Exception as exc:
            try:
                log(db, "ERROR", f"Worker loop failed: {exc}", "error")
            except Exception:
                pass
        finally:
            db.close()
        await asyncio.sleep(15)


if __name__ == "__main__":
    asyncio.run(main())
