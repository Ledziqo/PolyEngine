# PolyEngine v2

Fresh VPS-ready rebuild of PolyEngine.

## Stack

- `apps/web`: Next.js, TypeScript, Tailwind CSS, AI-terminal UI.
- `apps/engine`: Python FastAPI engine, live log stream, Polymarket-ready services.
- `postgres`: production database target.
- `redis`: queues, cache, live event stream.

## Local Development

```bash
cd polyengine-v2
npm install
npm run dev
```

Engine:

```bash
cd polyengine-v2/apps/engine
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Docker:

```bash
docker compose up --build
```

## Production Notes

- Set `ENGINE_INTERNAL_URL=http://engine:8000` for Docker server-side rendering.
- Set `NEXT_PUBLIC_ENGINE_URL=https://polyengine.io` after Nginx proxies `/api` to the engine.
- The `worker` service runs the 24/7 paper-trading loop: market sync, order books, scoring, bot tick, portfolio refresh.
- The app defaults to paper mode. Live-money trading is locked unless `LIVE_TRADING_ENABLED=true`, Polymarket credentials are configured, dry-run is disabled, and live caps pass inside Settings.
- Set a permanent `APP_SECRET_KEY` before saving live credentials. If this key changes, encrypted credentials cannot be decrypted.
- Add `BITQUERY_API_KEY` to unlock indexed trader leaderboard and wallet intelligence.
- BTC 5m has its own terminal page and worker sync for recurring Bitcoin Up/Down 5-minute markets.

## VPS Target

Ubuntu 24.04 LTS, Docker, Docker Compose, Nginx, SSL, PostgreSQL, Redis.

The current Laravel app remains untouched until this v2 app is production-ready.

## First VPS Run

After DNS/SSL and `docker compose up --build -d`:

```bash
docker compose ps
docker compose logs -f worker
```

Then open the private terminal and use Settings -> Sync Polymarket Now. The worker also keeps syncing automatically every loop.

Health checks:

```bash
curl https://polyengine.io/api/health
curl https://polyengine.io/api/live/status
```
