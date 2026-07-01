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

## VPS Target

Ubuntu 24.04 LTS, Docker, Docker Compose, Nginx, SSL, PostgreSQL, Redis.

The current Laravel app remains untouched until this v2 app is production-ready.
