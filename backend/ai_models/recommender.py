import logging
import os
from typing import Any, Dict, Optional

import joblib
import numpy as np
import pandas as pd

# --------------------------------------------------
# Load Model & Encoder (labels)
# --------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "saved_models", "recommendation_model.pkl")
ENCODER_PATH = os.path.join(BASE_DIR, "saved_models", "recommendation_encoder.pkl")


def _load_artifact(path: str, label: str):
    try:
        return joblib.load(path)
    except Exception as exc:
        logging.error("Failed to load %s from %s: %s", label, path, exc)
        return None


model = _load_artifact(MODEL_PATH, "recommendation model")
encoder = _load_artifact(ENCODER_PATH, "recommendation encoder")

_explainer = None


def _get_shap_explainer():
    """Return a cached SHAP explainer, or None if SHAP isn't available."""

    global _explainer
    if _explainer is not None:
        return _explainer

    if model is None:
        return None

    try:
        import shap  # optional dependency
    except ModuleNotFoundError:
        return None

    try:
        _explainer = shap.TreeExplainer(model)
    except Exception:
        # SHAP may not support every model type.
        return None

    return _explainer


def _to_float(value: Any, default: float = 0.0) -> float:
    try:
        if value is None:
            return default
        return float(value)
    except (TypeError, ValueError):
        return default


def _normalize_input(input_data: Any, args: tuple, kwargs: dict) -> Dict[str, Any]:
    """Accept dict or legacy positional args and normalize into a feature dict."""

    if isinstance(input_data, dict):
        return input_data

    # Legacy: get_ai_recommendation(carbon_footprint, energy_consumption, industry_type)
    carbon_footprint = input_data
    energy_consumption = args[0] if len(args) > 0 else kwargs.get("energy_consumption")
    industry_type = args[1] if len(args) > 1 else kwargs.get("industry_type")

    # Also allow a tuple/list form: (a, b, c)
    if isinstance(input_data, (tuple, list)):
        items = list(input_data)
        carbon_footprint = items[0] if len(items) > 0 else None
        energy_consumption = items[1] if len(items) > 1 else energy_consumption
        industry_type = items[2] if len(items) > 2 else industry_type

    return {
        "carbon_footprint": carbon_footprint,
        "energy_consumption": energy_consumption,
        "industry_type": industry_type,
    }


def _to_model_features(raw_features: Dict[str, Any]) -> Dict[str, float]:
    """Map incoming feature names to the model's trained feature schema."""

    # The recommender model in saved_models was trained on these columns.
    # We accept multiple incoming names and map them onto the trained schema.
    aliases = {
        "energy_kwh": ["energy_kwh", "energy_consumption", "energy"],
        "water_liters": ["water_liters", "water_usage", "water"],
        "raw_material_tons": ["raw_material_tons", "raw_material_qty", "material", "material_qty"],
        "co2_kg": ["co2_kg", "co2_emission", "carbon_footprint", "co2"],
        "waste_kg": ["waste_kg", "waste_generated", "waste"],
        "impact_score": ["impact_score", "sustainability_score", "average_score"],
    }

    out: Dict[str, float] = {}
    for target, candidates in aliases.items():
        value = None
        for key in candidates:
            if key in raw_features and raw_features.get(key) is not None:
                value = raw_features.get(key)
                break
        out[target] = _to_float(value, 0.0)

    return out


def _encode_label(pred: Any) -> str:
    """Convert model output to a user-facing label using encoder when available."""

    # If model already predicts a string label, use it.
    if isinstance(pred, str):
        return pred

    # If an encoder exists (LabelEncoder-like), try to decode.
    if encoder is not None and hasattr(encoder, "inverse_transform"):
        try:
            decoded = encoder.inverse_transform([pred])[0]
            return str(decoded)
        except Exception:
            pass

    return str(pred)


def _fmt_feature_name(name: str) -> str:
    return str(name).replace("_", " ").strip()


def _generate_recommendation_text(
    *,
    label: str,
    confidence_pct: float,
    feature_values: Dict[str, Any],
    explanation: list,
) -> str:
    """Generate recommendation text dynamically from model explanation.

    No hardcoded recommendation sentences; the model label + top drivers decide the message.
    """

    # Optional: include sustainability score when provided by the analysis pipeline.
    score = feature_values.get("sustainability_score")
    score_part = ""
    if score is not None:
        try:
            score_part = f" Predicted sustainability score: {float(score):.3f}."
        except Exception:
            score_part = f" Predicted sustainability score: {score}."

    if not explanation:
        # SHAP not available; still produce a model-driven message.
        return (
            f"Model recommendation label: {_fmt_feature_name(label)} (confidence {confidence_pct:.2f}%)."
            f"{score_part} Explainability data is not available for this run."
        )

    # explanation is a list of {feature, impact}. Use top 1-3.
    top = explanation[:3]
    top_feature = top[0].get("feature")
    top_feature_name = _fmt_feature_name(top_feature)
    top_value = feature_values.get(top_feature)

    drivers = ", ".join(_fmt_feature_name(x.get("feature")) for x in top if x.get("feature"))
    value_part = ""
    if top_value is not None:
        value_part = f" Current value: {top_value}."

    return (
        f"Model recommendation label: {_fmt_feature_name(label)} (confidence {confidence_pct:.2f}%)."
        f"{score_part} Primary impact driver identified: {top_feature_name}."
        f"{value_part} Top drivers by model explanation: {drivers}. "
        f"Optimization focused on the primary driver may improve sustainability outcomes."
    )


def get_ai_recommendation(input_data: Optional[Any] = None, *args, **kwargs) -> Dict[str, Any]:
    """AI-based recommendation with confidence + optional explainability."""

    if model is None:
        return {
            "recommendation": "AI recommendation model not available",
            "confidence": 0.0,
            "explanation": [],
        }

    raw_features = _normalize_input(input_data, args, kwargs)
    # Use the model's trained feature schema for prediction + SHAP.
    model_features = _to_model_features(raw_features)
    df_raw = pd.DataFrame([raw_features])
    df = pd.DataFrame([model_features])

    # Align to trained feature schema when available.
    feature_names = getattr(model, "feature_names_in_", None)
    if feature_names is not None:
        for col in feature_names:
            if col not in df.columns:
                df[col] = 0.0
        df = df[list(feature_names)]

    # Predict
    pred = model.predict(df)[0]
    label = _encode_label(pred)

    # Confidence
    confidence = 0.0
    if hasattr(model, "predict_proba"):
        try:
            confidence = float(np.max(model.predict_proba(df)))
        except Exception:
            confidence = 0.0

    confidence_pct = round(confidence * 100, 2)

    # Explainability (optional)
    explainer = _get_shap_explainer()
    if explainer is None:
        recommendation = _generate_recommendation_text(
            label=label,
            confidence_pct=confidence_pct,
            feature_values=features,
            explanation=[],
        )
        return {
            "label": label,
            "recommendation": recommendation,
            "confidence": confidence_pct,
            "explanation": [],
        }

    try:
        # TreeExplainer can fail the additivity check for some sklearn configs.
        # We disable the strict check to still surface top drivers.
        shap_values = explainer.shap_values(df, check_additivity=False)

        # Handle multiclass SHAP output
        if isinstance(shap_values, list):
            # If pred is numeric class index, use it; otherwise take first class.
            class_index = int(pred) if isinstance(pred, (int, np.integer)) else 0
            class_index = max(0, min(class_index, len(shap_values) - 1))
            shap_values = shap_values[class_index]
        elif isinstance(shap_values, np.ndarray) and shap_values.ndim == 3:
            # Common shape: (n_samples, n_features, n_classes)
            class_index = int(pred) if isinstance(pred, (int, np.integer)) else 0
            class_index = max(0, min(class_index, shap_values.shape[2] - 1))
            shap_values = shap_values[:, :, class_index]

        feature_importance = np.abs(shap_values[0])
        top_features = sorted(
            zip(df.columns, feature_importance),
            key=lambda x: x[1],
            reverse=True,
        )[:3]

        explanation = [
            {"feature": str(feature), "impact": round(float(score), 4)}
            for feature, score in top_features
        ]
    except Exception:
        explanation = []

    recommendation = _generate_recommendation_text(
        label=label,
        confidence_pct=confidence_pct,
        # Use model features so the driver names match the model schema.
        feature_values={**raw_features, **model_features},
        explanation=explanation,
    )

    return {
        "label": label,
        "recommendation": recommendation,
        "confidence": confidence_pct,
        "explanation": explanation,
    }
