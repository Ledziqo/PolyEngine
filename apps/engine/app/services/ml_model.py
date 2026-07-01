from __future__ import annotations

from datetime import datetime
from pathlib import Path

import joblib
import numpy as np
from sqlalchemy import desc
from sqlalchemy.orm import Session
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import precision_score, recall_score, roc_auc_score
from sklearn.model_selection import train_test_split

from app.models.schema import ModelPrediction, Outcome, PredictionModel, PriceSnapshot

MODEL_DIR = Path("/tmp/polyengine-models")
FEATURES = ["price", "spread", "liquidity", "volume", "hours_to_expiry", "depth", "wallet", "volatility"]


def feature_vector(outcome: Outcome) -> dict[str, float]:
    market = outcome.market
    hours = 720.0
    if market.end_at:
        hours = max(0.0, (market.end_at - datetime.utcnow()).total_seconds() / 3600)
    breakdown = outcome.score_breakdown or {}
    return {
        "price": float(outcome.price or 0.5),
        "spread": float(outcome.spread or 0.0),
        "liquidity": float(outcome.liquidity or 0.0),
        "volume": float(market.volume or 0.0),
        "hours_to_expiry": hours,
        "depth": float(breakdown.get("depth", 50)),
        "wallet": float(breakdown.get("wallet", 50)),
        "volatility": _recent_volatility(outcome),
    }


def _recent_volatility(outcome: Outcome) -> float:
    prices = [snap.price for snap in sorted(getattr(outcome, "_recent_snapshots", []) or [], key=lambda s: s.created_at)]
    if len(prices) < 3:
        return 0.0
    return float(np.std(np.diff(prices[-12:])))


def _matrix(rows: list[Outcome]) -> np.ndarray:
    return np.array([[feature_vector(row)[name] for name in FEATURES] for row in rows], dtype=float)


def train_short_edge_model(db: Session, horizon: str = "1h", limit: int = 5000) -> dict:
    outcomes = db.query(Outcome).order_by(desc(Outcome.price_synced_at)).limit(limit).all()
    usable: list[Outcome] = []
    labels: list[int] = []
    for outcome in outcomes:
        snaps = db.query(PriceSnapshot).filter(PriceSnapshot.outcome_id == outcome.id).order_by(PriceSnapshot.created_at).limit(80).all()
        if len(snaps) < 2:
            continue
        outcome._recent_snapshots = snaps
        first, last = snaps[0].price, snaps[-1].price
        usable.append(outcome)
        labels.append(1 if last > first else 0)
    if len(usable) < 40 or len(set(labels)) < 2:
        return {"trained": False, "reason": "Need at least 40 outcomes with price history and both up/down labels.", "rows": len(usable)}

    x = _matrix(usable)
    y = np.array(labels, dtype=int)
    x_train, x_val, y_train, y_val = train_test_split(x, y, test_size=0.25, random_state=42, stratify=y)
    model = GradientBoostingClassifier(random_state=42)
    try:
        model.fit(x_train, y_train)
    except Exception:
        model = LogisticRegression(max_iter=500)
        model.fit(x_train, y_train)
    proba = model.predict_proba(x_val)[:, 1]
    pred = (proba >= 0.55).astype(int)
    auc = float(roc_auc_score(y_val, proba)) if len(set(y_val)) > 1 else 0.5
    precision = float(precision_score(y_val, pred, zero_division=0))
    recall = float(recall_score(y_val, pred, zero_division=0))
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    version = f"short-edge-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    artifact = MODEL_DIR / f"{version}.joblib"
    joblib.dump({"model": model, "features": FEATURES}, artifact)
    for existing in db.query(PredictionModel).filter(PredictionModel.model_type == "short_edge").all():
        existing.status = "inactive"
    db.add(
        PredictionModel(
            model_type="short_edge",
            version=version,
            artifact_path=str(artifact),
            training_rows=len(usable),
            validation_auc=auc,
            precision=precision,
            recall=recall,
            feature_names=FEATURES,
        )
    )
    db.commit()
    return {"trained": True, "version": version, "rows": len(usable), "validation_auc": auc, "precision": precision, "recall": recall}


def active_model(db: Session) -> PredictionModel | None:
    return db.query(PredictionModel).filter(PredictionModel.model_type == "short_edge", PredictionModel.status == "active").order_by(desc(PredictionModel.trained_at)).first()


def predict_outcome(db: Session, outcome: Outcome) -> dict:
    model_row = active_model(db)
    features = feature_vector(outcome)
    if not model_row or not Path(model_row.artifact_path).exists():
        probability = min(0.98, max(0.02, 0.5 + max(outcome.edge, -0.2) + ((outcome.score_breakdown or {}).get("risk", 50) - 50) / 250))
        version = "rule-fallback"
    else:
        artifact = joblib.load(model_row.artifact_path)
        vector = np.array([[features[name] for name in artifact["features"]]], dtype=float)
        probability = float(artifact["model"].predict_proba(vector)[0][1])
        version = model_row.version
    confidence = int(max(1, min(99, abs(probability - 0.5) * 180 + 50)))
    db.add(ModelPrediction(outcome_id=outcome.id, model_version=version, horizon="1h", probability=probability, confidence=confidence, features=features))
    return {"probability": probability, "confidence": confidence, "version": version, "features": features}
