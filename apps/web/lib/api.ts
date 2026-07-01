const ENGINE_URL = process.env.ENGINE_INTERNAL_URL || process.env.NEXT_PUBLIC_ENGINE_URL || "http://localhost:8000";

async function getJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${ENGINE_URL}${path}`, { cache: "no-store" });
    if (!response.ok) return fallback;
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

export type ApiMarket = {
  id?: number;
  question: string;
  category?: string | null;
  section?: string | null;
  volume?: number;
  liquidity?: number;
  rating: string;
  preferred_pick?: string | null;
  bot_action?: string | null;
  score_breakdown?: Record<string, number> | null;
  best_outcome?: ApiOutcome | null;
  outcomes?: ApiOutcome[];
};

export type ApiOutcome = {
  id?: number;
  name: string;
  market?: string;
  price: number;
  fair_probability: number;
  edge: number;
  confidence: number;
  rating: string;
  bot_action: string;
  liquidity: number;
  spread: number;
  score_breakdown?: Record<string, number> | null;
  why?: string;
};

export async function getMarkets() {
  return getJson<ApiMarket[]>("/api/markets", []);
}

export async function getOpportunities(mode?: "easy" | "fast") {
  const path = mode === "easy" ? "/api/opportunities/easy-wins" : mode === "fast" ? "/api/opportunities/fast-wins" : "/api/opportunities";
  return getJson<ApiOutcome[]>(path, []);
}

export async function getLiveStatus() {
  return getJson<Record<string, any>>("/api/live/status", { markets: 0, open_positions: 0, stale: true, bot: { enabled: false, state: "paused", risk_mode: "Balanced", minimum_rating: "Strong" } });
}

export async function getPortfolio() {
  return getJson<Record<string, any>>("/api/portfolio", { balance: 10000, realized_pnl: 0, unrealized_pnl: 0, exposure: 0, positions: [], trades: [] });
}

export async function getLogs() {
  return getJson<Array<Record<string, any>>>("/api/bot-log", []);
}

export async function getMarketSections() {
  return getJson<Array<Record<string, any>>>("/api/market-sections", []);
}

export async function getSectionMarkets(slug: string) {
  const payload = await getJson<{ section: string; markets: ApiMarket[] }>(`/api/market-sections/${slug}`, { section: slug, markets: [] });
  return payload.markets;
}

export async function getTraders() {
  return getJson<Record<string, any>>("/api/traders", { period: "monthly", traders: [] });
}

export async function getCopySignals() {
  return getJson<Array<Record<string, any>>>("/api/copy-signals", []);
}

export async function getBtc5m() {
  return getJson<Record<string, any>>("/api/btc-5m", { windows: [] });
}

export async function getBacktests() {
  return getJson<Array<Record<string, any>>>("/api/backtests", []);
}

export async function getModelStatus() {
  return getJson<Record<string, any>>("/api/model/status", { active: false, version: "rule-fallback", training_rows: 0, validation_auc: 0, precision: 0, recall: 0 });
}

export async function getLiveOrders() {
  return getJson<Array<Record<string, any>>>("/api/live-orders", []);
}
