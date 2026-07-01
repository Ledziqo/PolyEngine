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
            "liquidity": 94000,
            "spread": 1.7,
            "ends": "42h",
            "why": "Strong depth with short expiry and positive edge.",
        },
    ]
