from enum import IntEnum


class Rating(IntEnum):
    AVOID = 0
    WEAK = 1
    WATCH = 2
    GOOD = 3
    STRONG = 4
    BEST = 5


RATING_LABELS = {
    Rating.AVOID: "Avoid",
    Rating.WEAK: "Weak",
    Rating.WATCH: "Watch",
    Rating.GOOD: "Good",
    Rating.STRONG: "Strong",
    Rating.BEST: "Best",
}


def rating_from_score(score: float) -> str:
    if score >= 88:
        return "Best"
    if score >= 78:
        return "Strong"
    if score >= 68:
        return "Good"
    if score >= 55:
        return "Watch"
    if score >= 40:
        return "Weak"
    return "Avoid"


def bot_action_for_rating(rating: str, risk_mode: str = "Balanced") -> str:
    allowed = {
        "Safe": {"Best"},
        "Balanced": {"Strong", "Best"},
        "Aggressive": {"Good", "Strong", "Best"},
    }
    if rating in allowed.get(risk_mode, allowed["Balanced"]):
        return "Enter"
    if rating == "Watch":
        return "Watch"
    return "Skip"


def score_market(
    confidence: float,
    edge: float,
    liquidity_score: float,
    spread_score: float,
    expiry_score: float,
    momentum_score: float,
    depth_score: float,
    wallet_score: float,
    risk_score: float,
) -> dict:
    score = (
        confidence * 0.22
        + max(edge, 0) * 1.4
        + liquidity_score * 0.13
        + spread_score * 0.13
        + expiry_score * 0.08
        + momentum_score * 0.08
        + depth_score * 0.12
        + wallet_score * 0.08
        + risk_score * 0.16
    )
    score = min(100, max(0, score))
    rating = rating_from_score(score)
    return {"score": round(score, 2), "rating": rating, "bot_action": bot_action_for_rating(rating)}
