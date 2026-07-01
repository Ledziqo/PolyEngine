from datetime import datetime, timedelta


def demo_status() -> dict:
    now = datetime.utcnow()
    return {
        "mode": "demo",
        "live": True,
        "markets": 128,
        "outcomes": 312,
        "open_positions": 2,
        "latest_market_sync": (now - timedelta(seconds=42)).isoformat(),
        "latest_price_sync": (now - timedelta(seconds=8)).isoformat(),
        "latest_signal_score": (now - timedelta(seconds=13)).isoformat(),
        "latest_bot_decision": (now - timedelta(seconds=5)).isoformat(),
        "stale": False,
        "bot": {
            "state": "paused",
            "enabled": False,
            "risk_mode": "Balanced",
            "minimum_rating": "Strong",
            "message": "Owner can start autonomous bot trading when ready.",
        },
    }


def demo_opportunities() -> list[dict]:
    return [
        {
            "grade": "Strong Entry",
            "market": "Fed rate cut by September?",
            "outcome": "Yes",
            "price": 0.42,
            "fair_probability": 0.58,
            "edge": 16.0,
            "confidence": 87,
            "rating": "Best",
            "preferred_pick": "YES",
            "bot_action": "Enter",
            "scores": {"liquidity": 92, "spread": 94, "expiry": 82, "momentum": 78, "depth": 91, "wallet": 66, "risk": 84},
            "liquidity": 182400,
            "spread": 1.2,
            "ends": "18h",
            "why": "High volume, tight spread, and fair probability above market price.",
        },
        {
            "grade": "Easy Win",
            "market": "Will BTC close above $120k Friday?",
            "outcome": "No",
            "price": 0.63,
            "fair_probability": 0.74,
            "edge": 11.0,
            "confidence": 82,
            "rating": "Strong",
            "preferred_pick": "NO",
            "bot_action": "Enter",
            "scores": {"liquidity": 84, "spread": 88, "expiry": 76, "momentum": 71, "depth": 80, "wallet": 72, "risk": 79},
            "liquidity": 94000,
            "spread": 1.7,
            "ends": "42h",
            "why": "Strong depth with short expiry and positive edge.",
        },
    ]


def demo_market_sections() -> list[dict]:
    return [
        {"name": "Trending", "slug": "trending", "markets": 42, "volume": 18400000, "pulse": 18, "signal": "Hot movers"},
        {"name": "World Cup", "slug": "world-cup", "markets": 28, "volume": 7100000, "pulse": 9, "signal": "Sports depth"},
        {"name": "Breaking", "slug": "breaking", "markets": 19, "volume": 11800000, "pulse": 31, "signal": "News shock"},
        {"name": "Politics", "slug": "politics", "markets": 86, "volume": 24500000, "pulse": 12, "signal": "Whale active"},
        {"name": "Sports", "slug": "sports", "markets": 74, "volume": 16900000, "pulse": 22, "signal": "Live games"},
        {"name": "Crypto", "slug": "crypto", "markets": 51, "volume": 13200000, "pulse": 15, "signal": "Fast odds"},
        {"name": "Esports", "slug": "esports", "markets": 17, "volume": 1400000, "pulse": 4, "signal": "Low spread"},
        {"name": "Iran", "slug": "iran", "markets": 12, "volume": 9600000, "pulse": 27, "signal": "Geopolitical"},
        {"name": "Finance", "slug": "finance", "markets": 39, "volume": 8800000, "pulse": 8, "signal": "Macro edge"},
        {"name": "Geopolitics", "slug": "geopolitics", "markets": 44, "volume": 14700000, "pulse": 20, "signal": "Headline risk"},
        {"name": "Tech", "slug": "tech", "markets": 21, "volume": 3200000, "pulse": 6, "signal": "AI names"},
        {"name": "Culture", "slug": "culture", "markets": 33, "volume": 2700000, "pulse": 3, "signal": "Social flow"},
        {"name": "Economy", "slug": "economy", "markets": 24, "volume": 6400000, "pulse": 10, "signal": "Data prints"},
        {"name": "Weather", "slug": "weather", "markets": 16, "volume": 2300000, "pulse": 11, "signal": "Expiry soon"},
        {"name": "Mentions", "slug": "mentions", "markets": 14, "volume": 1800000, "pulse": 5, "signal": "Media count"},
        {"name": "Elections", "slug": "elections", "markets": 58, "volume": 21000000, "pulse": 19, "signal": "Deep books"},
    ]


def demo_traders() -> list[dict]:
    return [
        {"rank": 1, "name": "mooseborzoi", "wallet": "0x9a6...62db", "pnl": 784057, "roi": 38.4, "volume": 3511904, "win_rate": 71, "gain_loss": 2.8, "positions": 18, "active_value": 776193, "copy_score": 94, "specialty": "Sports"},
        {"rank": 2, "name": "GoalLineGhost", "wallet": "0x42c...91aa", "pnl": 656675, "roi": 44.1, "volume": 2347117, "win_rate": 76, "gain_loss": 3.2, "positions": 11, "active_value": 857455, "copy_score": 96, "specialty": "Football"},
        {"rank": 3, "name": "surfandturf", "wallet": "0x8f1...ac40", "pnl": 562550, "roi": 29.6, "volume": 1517842, "win_rate": 68, "gain_loss": 2.1, "positions": 23, "active_value": 955292, "copy_score": 87, "specialty": "Live sports"},
    ]


def demo_copy_signals() -> list[dict]:
    return [
        {"trader": "mooseborzoi", "market": "Mexico vs. Ecuador", "side": "YES", "size": 379097, "entry": 0.58, "current": 0.66, "copy_score": 94, "status": "open"},
        {"trader": "GoalLineGhost", "market": "Mexico vs. Ecuador", "side": "YES", "size": 857455, "entry": 0.51, "current": 0.72, "copy_score": 96, "status": "open"},
        {"trader": "CandleHammerDrums", "market": "Fed rate cut by September?", "side": "YES", "size": 48000, "entry": 0.42, "current": 0.45, "copy_score": 82, "status": "watching"},
    ]

