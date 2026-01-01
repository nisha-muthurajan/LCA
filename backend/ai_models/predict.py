import pandas as pd
import numpy as np
from .model_loader import lca_model

def analyze_dataset(df: pd.DataFrame):
    """
    AI-driven LCA analysis
    """

    # 1️⃣ Handle missing values (AI-friendly)
    numeric_cols = df.select_dtypes(include=np.number).columns
    df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].mean())

    # 2️⃣ Predict sustainability score
    predictions = lca_model.predict(df[numeric_cols])
    df["sustainability_score"] = predictions

    # 3️⃣ Identify high-impact stages (lower score = higher impact)
    hotspots = df.sort_values(
        by="sustainability_score", ascending=True
    ).head(3)

    # 4️⃣ Benchmark comparison (statistical, not rule-based)
    avg_score = float(np.mean(predictions))
    percentile = float(np.percentile(predictions, 50))

    return {
        "average_score": round(avg_score, 2),
        "median_benchmark": round(percentile, 2),
        "hotspots": hotspots.to_dict(orient="records"),
        "full_results": df.to_dict(orient="records")
    }
