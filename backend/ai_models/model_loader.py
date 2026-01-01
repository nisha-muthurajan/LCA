import logging
import os
import pickle
from typing import Any

import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MODEL_PATH = os.path.join(
    BASE_DIR,
    'ai_models',
    'saved_models',
    'lca_model.pkl'
)


class _FallbackModel:
    """Simple fallback to keep the app running when the pickle cannot load."""

    def predict(self, X: Any):
        # Return a neutral score so downstream code keeps working.
        rows = getattr(X, "shape", [0, 0])[0] if X is not None else 0
        return np.zeros(rows)


def _load_model():
    try:
        with open(MODEL_PATH, 'rb') as f:
            # encoding='latin1' makes older pickles more permissive across Python versions.
            return pickle.load(f, encoding='latin1')
    except Exception as exc:  # broad so we catch pickle protocol issues
        logging.error("Failed to load LCA model from %s: %s", MODEL_PATH, exc)
        return _FallbackModel()


lca_model = _load_model()
