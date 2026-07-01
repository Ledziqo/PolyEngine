export const opportunities = [
  {
    grade: "Strong Entry",
    market: "Fed rate cut by September?",
    outcome: "Yes",
    price: 0.42,
    fair: 0.58,
    edge: 16.0,
    confidence: 87,
    liquidity: 182400,
    spread: 1.2,
    ends: "18h",
    why: "High volume, tight spread, fair probability above market price."
  },
  {
    grade: "Easy Win",
    market: "Will BTC close above $120k Friday?",
    outcome: "No",
    price: 0.63,
    fair: 0.74,
    edge: 11.0,
    confidence: 82,
    liquidity: 94000,
    spread: 1.7,
    ends: "42h",
    why: "Momentum fading with strong order-book support."
  },
  {
    grade: "Watch",
    market: "Premier League winner",
    outcome: "Arsenal",
    price: 0.31,
    fair: 0.37,
    edge: 6.0,
    confidence: 71,
    liquidity: 231000,
    spread: 2.9,
    ends: "64d",
    why: "Good depth, but edge is still forming."
  }
];

export const botLogs = [
  ["14:08:22", "SCAN", "Checked 128 active high-volume markets", "cyan"],
  ["14:08:24", "SIGNAL", "Fed rate cut YES scored 87% confidence", "violet"],
  ["14:08:25", "CHECK", "Liquidity OK, spread 1.2%, edge +16.0%", "green"],
  ["14:08:26", "ENTER", "Paper buy $48.00 at 0.42 simulated fill", "green"],
  ["14:09:10", "WATCH", "Position moved +3.8%, take-profit still pending", "cyan"],
  ["14:12:02", "SKIP", "Election market skipped: spread 7.4% above max", "amber"],
  ["14:13:41", "ERROR", "Wallet signal sync delayed by API rate limit", "red"]
];

export const pnlCurve = [
  { t: "09:00", value: 10000 },
  { t: "10:00", value: 10084 },
  { t: "11:00", value: 10046 },
  { t: "12:00", value: 10132 },
  { t: "13:00", value: 10218 },
  { t: "14:00", value: 10291 }
];

export const markets = [
  ["Fed rate cut by September?", "Yes/No", "0.42 / 0.59", "$182.4k", "1.2%", "Live"],
  ["BTC above $120k Friday?", "Yes/No", "0.36 / 0.63", "$94.0k", "1.7%", "Live"],
  ["US CPI below forecast?", "Yes/No", "0.51 / 0.50", "$71.5k", "2.1%", "Syncing"],
  ["Premier League winner", "Multi", "0.31 best", "$231.0k", "2.9%", "Live"]
];
