import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';

const Recommendations = () => {
  const location = useLocation();
  const [result, setResult] = useState(null);

  // -------------------------------
  // Load data (router OR localStorage)
  // -------------------------------
  useEffect(() => {
    if (location.state?.result) {
      setResult(location.state.result);
      localStorage.setItem('lastResult', JSON.stringify(location.state.result));
    } else {
      const cached = localStorage.getItem('lastResult');
      if (cached) {
        try {
          setResult(JSON.parse(cached));
        } catch (err) {
          console.error('Failed to parse cached result', err);
        }
      }
    }
  }, [location.state]);

  if (!result) {
    return (
      <div className="container mt-5 text-center">
        <h3>No analysis data found</h3>
        <p>Please run an assessment first.</p>
        <Link to="/create-project" className="btn btn-primary">
          Start Analysis
        </Link>
      </div>
    );
  }

  const ai = result.ai_recommendation || {};
  const explanations = ai.explanation || [];

  return (
    <div className="container mt-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>💡 AI-Driven Recommendations</h2>
        <Link to="/dashboard" className="btn btn-outline-primary">
          Back to Dashboard
        </Link>
      </div>

      {/* Main Recommendation */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h4 className="mb-2">🤖 Primary Recommendation</h4>
          <p className="fs-5 mb-1">
            <strong>{ai.recommendation || 'No recommendation generated'}</strong>
          </p>
          <span className="badge bg-success">
            Confidence: {ai.confidence || 'N/A'}%
          </span>
        </div>
      </div>

      {/* Explainability (SHAP) */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h5 className="mb-3">🔍 Why this recommendation?</h5>

          {explanations.length === 0 ? (
            <p className="text-muted">Explainability data not available.</p>
          ) : (
            <ul className="list-group list-group-flush">
              {explanations.map((item, index) => (
                <li key={index} className="list-group-item">
                  <strong>{item.feature}</strong> had high impact
                  <span className="text-muted ms-2">
                    (importance: {item.impact})
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Context Snapshot */}
      <div className="card p-4 shadow-sm">
        <h5 className="mb-2">📊 Context Snapshot</h5>
        <p className="mb-1">
          Carbon Footprint:{' '}
          <strong>{result.carbon_footprint ?? 0} kg CO₂e</strong>
        </p>
        <p className="mb-0">
          Circularity Score:{' '}
          <strong>{result.circularity_score ?? 'N/A'} / 100</strong>
        </p>
      </div>
    </div>
  );
};

export default Recommendations;
