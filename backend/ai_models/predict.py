import pandas as pd
import numpy as np
import joblib
import os

# --------------------------------------------------
# Load LCA Pipeline Model
# --------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(
    BASE_DIR,
    "saved_models",
    "ai_lca_sustainability_model.pkl"
)

lca_model = joblib.load(MODEL_PATH)


# --------------------------------------------------
# Input Normalization
# --------------------------------------------------
# The trained pipeline expects these feature columns. Uploaded CSVs may use
# shorter names (energy/water/co2/etc). We normalize to keep uploads flexible.
REQUIRED_FEATURE_COLUMNS = [
    "energy_consumption",
    "water_usage",
    "waste_generated",
    "co2_emission",
]


_COLUMN_ALIASES = {
    # energy
    "energy": "energy_consumption",
    "energy_kwh": "energy_consumption",
    "energy (kwh)": "energy_consumption",
    "energy_consumption": "energy_consumption",
    "power": "energy_consumption",
    "kwh": "energy_consumption",

    # water
    "water": "water_usage",
    "water_usage": "water_usage",
    "water (liters)": "water_usage",
    "water_liters": "water_usage",
    "h2o": "water_usage",

    # waste
    "waste": "waste_generated",
    "waste_generated": "waste_generated",
    "waste (kg)": "waste_generated",

    # emissions
    "co2": "co2_emission",
    "co2_emission": "co2_emission",
    "co2 emission": "co2_emission",
    "emission": "co2_emission",
    "emissions": "co2_emission",
    "carbon": "co2_emission",
    "carbon_footprint": "co2_emission",
}


def _normalize_input_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    # Normalize column names to a stable lowercase form.
    df.columns = [str(c).strip().lower().replace("-", "_") for c in df.columns]

    # Apply alias mapping.
    rename_map = {c: _COLUMN_ALIASES[c] for c in df.columns if c in _COLUMN_ALIASES}
    if rename_map:
        df = df.rename(columns=rename_map)

    # Ensure required columns exist.
    for col in REQUIRED_FEATURE_COLUMNS:
        if col not in df.columns:
            df[col] = 0.0

    # Coerce required features to numeric.
    for col in REQUIRED_FEATURE_COLUMNS:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    return df

# --------------------------------------------------
# Core AI LCA Analysis
# --------------------------------------------------
def analyze_dataset(df: pd.DataFrame):
    """
    Fully AI-driven LCA analysis using trained pipeline
    """

    df = _normalize_input_dataframe(df)

    # 1️⃣ Handle missing numeric values (safe + AI-friendly)
    for col in df.select_dtypes(include=np.number).columns:
        df[col] = df[col].fillna(df[col].median())

    # 2️⃣ Predict sustainability score (PIPELINE handles preprocessing)
    predictions = lca_model.predict(df)
    df["sustainability_score"] = predictions

    # 3️⃣ Identify hotspots (lowest score = highest impact)
    hotspots = (
        df.sort_values("sustainability_score", ascending=True)
          .head(3)
    )

    # 4️⃣ Benchmark statistics (data-driven)
    return {
        "average_score": round(float(np.mean(predictions)), 3),
        "min_score": round(float(np.min(predictions)), 3),
        "max_score": round(float(np.max(predictions)), 3),
        "hotspots": hotspots.to_dict(orient="records"),
        "full_results": df.to_dict(orient="records")
    }
