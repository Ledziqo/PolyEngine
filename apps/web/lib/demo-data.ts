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

export const marketSections = [
  { name: "Trending", slug: "trending", pulse: "+18%", markets: 42, volume: "$18.4M", signal: "Hot movers" },
  { name: "World Cup", slug: "world-cup", pulse: "+9%", markets: 28, volume: "$7.1M", signal: "Sports depth" },
  { name: "Breaking", slug: "breaking", pulse: "+31%", markets: 19, volume: "$11.8M", signal: "News shock" },
  { name: "Politics", slug: "politics", pulse: "+12%", markets: 86, volume: "$24.5M", signal: "Whale active" },
  { name: "Sports", slug: "sports", pulse: "+22%", markets: 74, volume: "$16.9M", signal: "Live games" },
  { name: "Crypto", slug: "crypto", pulse: "+15%", markets: 51, volume: "$13.2M", signal: "Fast odds" },
  { name: "Esports", slug: "esports", pulse: "+4%", markets: 17, volume: "$1.4M", signal: "Low spread" },
  { name: "Iran", slug: "iran", pulse: "+27%", markets: 12, volume: "$9.6M", signal: "Geopolitical" },
  { name: "Finance", slug: "finance", pulse: "+8%", markets: 39, volume: "$8.8M", signal: "Macro edge" },
  { name: "Geopolitics", slug: "geopolitics", pulse: "+20%", markets: 44, volume: "$14.7M", signal: "Headline risk" },
  { name: "Tech", slug: "tech", pulse: "+6%", markets: 21, volume: "$3.2M", signal: "AI names" },
  { name: "Culture", slug: "culture", pulse: "+3%", markets: 33, volume: "$2.7M", signal: "Social flow" },
  { name: "Economy", slug: "economy", pulse: "+10%", markets: 24, volume: "$6.4M", signal: "Data prints" },
  { name: "Weather", slug: "weather", pulse: "+11%", markets: 16, volume: "$2.3M", signal: "Expiry soon" },
  { name: "Mentions", slug: "mentions", pulse: "+5%", markets: 14, volume: "$1.8M", signal: "Media count" },
  { name: "Elections", slug: "elections", pulse: "+19%", markets: 58, volume: "$21.0M", signal: "Deep books" }
];

export const sectionMarkets = [
  {
    section: "Trending",
    market: "Will the next Fed decision include a rate cut?",
    price: "42c",
    change: "+7.4%",
    liquidity: "$182.4k",
    volume: "$1.9M",
    confidence: 87,
    whale: "$84k YES"
  },
  {
    section: "Breaking",
    market: "Will the ceasefire headline be confirmed today?",
    price: "61c",
    change: "+14.2%",
    liquidity: "$94.7k",
    volume: "$840k",
    confidence: 79,
    whale: "$31k NO"
  },
  {
    section: "Crypto",
    market: "Will Bitcoin close above $120k on Friday?",
    price: "36c",
    change: "-5.8%",
    liquidity: "$126.0k",
    volume: "$2.2M",
    confidence: 82,
    whale: "$52k NO"
  },
  {
    section: "Politics",
    market: "Who will win the next national election?",
    price: "49c",
    change: "+3.1%",
    liquidity: "$411.5k",
    volume: "$7.8M",
    confidence: 73,
    whale: "$118k split"
  }
];

export const topTraders = [
  {
    rank: 1,
    name: "mooseborzoi",
    wallet: "0x9a6...62db",
    pnl: 784057,
    roi: 38.4,
    volume: 3511904,
    winRate: 71,
    gainLoss: 2.8,
    positions: 18,
    activeValue: 776193,
    copyScore: 94,
    period: "Monthly",
    specialty: "Sports",
    lastTrade: "Mexico vs. Ecuador YES +$379k exposure"
  },
  {
    rank: 2,
    name: "GoalLineGhost",
    wallet: "0x42c...91aa",
    pnl: 656675,
    roi: 44.1,
    volume: 2347117,
    winRate: 76,
    gainLoss: 3.2,
    positions: 11,
    activeValue: 857455,
    copyScore: 96,
    period: "Monthly",
    specialty: "Football",
    lastTrade: "Mexico vs. Ecuador underpriced favorite"
  },
  {
    rank: 3,
    name: "surfandturf",
    wallet: "0x8f1...ac40",
    pnl: 562550,
    roi: 29.6,
    volume: 1517842,
    winRate: 68,
    gainLoss: 2.1,
    positions: 23,
    activeValue: 955292,
    copyScore: 87,
    period: "Monthly",
    specialty: "Live sports",
    lastTrade: "Added into second-half liquidity"
  },
  {
    rank: 4,
    name: "CandleHammerDrums",
    wallet: "0xd7e...2b09",
    pnl: 443021,
    roi: 51.7,
    volume: 523000,
    winRate: 63,
    gainLoss: 2.9,
    positions: 7,
    activeValue: 413000,
    copyScore: 82,
    period: "Monthly",
    specialty: "Macro",
    lastTrade: "Rate cut YES into tight spread"
  },
  {
    rank: 5,
    name: "Oneger",
    wallet: "0xe9a...27b",
    pnl: 178000,
    roi: 24.2,
    volume: 312279,
    winRate: 66,
    gainLoss: 1.9,
    positions: 14,
    activeValue: 134280,
    copyScore: 78,
    period: "Monthly",
    specialty: "Geopolitics",
    lastTrade: "Scaled out before expiry"
  }
];

export const traderPositions = [
  ["mooseborzoi", "Mexico vs. Ecuador", "YES", "$379,097", "0.58", "0.66", "+13.8%", "Open"],
  ["GoalLineGhost", "Mexico vs. Ecuador", "YES", "$857,455", "0.51", "0.72", "+41.2%", "Open"],
  ["surfandturf", "Mexico vs. Ecuador - More Markets", "Over", "$955,292", "0.44", "0.59", "+34.1%", "Open"],
  ["CandleHammerDrums", "Fed rate cut by September?", "YES", "$48,000", "0.42", "0.45", "+7.1%", "Watching"],
  ["Oneger", "Will the Iranian regime fall?", "NO", "$134,280", "0.67", "0.71", "+6.0%", "Open"]
];
