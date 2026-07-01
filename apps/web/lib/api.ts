import {
  botLogs,
  botState,
  marketSections,
  markets,
  opportunities,
  topTraders,
  traderPositions
} from "./demo-data";

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
  const fallback = markets.map((item, index) => ({
    id: index + 1,
    question: item.market,
    rating: item.rating,
    preferred_pick: item.preferredPick,
    bot_action: item.botAction,
    liquidity: Number(item.liquidity.replace(/[$kM,]/g, "")) || 0,
    best_outcome: {
      name: item.preferredPick,
      price: Number(item.price.split(" ")[0]) || 0,
      fair_probability: Number(item.fairProbability.replace("%", "")) / 100,
      edge: Number(item.edge.replace("%", "")) / 100,
      confidence: item.confidence,
      rating: item.rating,
      bot_action: item.botAction,
      liquidity: 0,
      spread: Number(item.spread.replace("%", "")) / 100,
      score_breakdown: item.scores
    }
  }));
  return getJson<ApiMarket[]>("/api/markets", fallback);
}

export async function getOpportunities(mode?: "easy" | "fast") {
  const path = mode === "easy" ? "/api/opportunities/easy-wins" : mode === "fast" ? "/api/opportunities/fast-wins" : "/api/opportunities";
  const fallback = opportunities.map((item) => ({
    name: item.preferredPick,
    market: item.market,
    price: item.price,
    fair_probability: item.fair,
    edge: item.edge / 100,
    confidence: item.confidence,
    rating: item.rating,
    bot_action: item.botAction,
    liquidity: item.liquidity,
    spread: item.spread / 100,
    why: item.why
  }));
  return getJson<ApiOutcome[]>(path, fallback);
}

export async function getLiveStatus() {
  return getJson("/api/live/status", { markets: 0, open_positions: 0, stale: true, bot: botState });
}

export async function getPortfolio() {
  return getJson("/api/portfolio", { balance: 10000, realized_pnl: 0, unrealized_pnl: 0, exposure: 0, positions: [], trades: [] });
}

export async function getLogs() {
  return getJson("/api/bot-log", botLogs.map(([time, type, message, tone], id) => ({ id, created_at: time, type, message, level: tone })));
}

export async function getMarketSections() {
  return getJson("/api/market-sections", marketSections);
}

export async function getSectionMarkets(slug: string) {
  const payload = await getJson<{ section: string; markets: ApiMarket[] }>(`/api/market-sections/${slug}`, { section: slug, markets: [] });
  return payload.markets;
}

export async function getTraders() {
  const fallback = { period: "monthly", traders: topTraders.map((item) => ({ ...item, win_rate: item.winRate, gain_loss: item.gainLoss, active_value: item.activeValue, copy_score: item.copyScore, source_quality: "estimated" })) };
  return getJson("/api/traders", fallback);
}

export async function getCopySignals() {
  return getJson("/api/copy-signals", traderPositions.map(([trader, market, side, size, entry, current, pnl, status]) => ({ trader, market, side, size, entry, current, pnl, status, copy_score: 75, source_quality: "estimated" })));
}

export async function getBtc5m() {
  return getJson("/api/btc-5m", { windows: [] });
}

export async function getBacktests() {
  return getJson("/api/backtests", []);
}

export async function getModelStatus() {
  return getJson("/api/model/status", { active: false, version: "rule-fallback", training_rows: 0, validation_auc: 0, precision: 0, recall: 0 });
}

export async function getLiveOrders() {
  return getJson("/api/live-orders", []);
}
