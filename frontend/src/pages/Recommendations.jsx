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
      <div className="container">
        <div className="card p-4 mt-3 text-center">
          <h3 className="h5 mb-2">No analysis data found</h3>
          <p className="text-muted mb-3">Run an assessment to generate recommendations.</p>
          <Link to="/create-project" className="btn btn-success">
            Start assessment
          </Link>
        </div>
      </div>
    );
  }

  const ai = result.ai_recommendation || {};
  const explanations = ai.explanation || [];

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h2 className="page-title h4">AI insights</h2>
          <p className="page-subtitle">Recommendations with context and explainability signals.</p>
        </div>
        <Link to="/dashboard" className="btn btn-outline-secondary">
          Back to dashboard
        </Link>
      </div>

      {/* Main Recommendation */}
      <div className="card mb-4">
        <div className="card-body">
          <h4 className="h6 text-muted mb-2">Primary recommendation</h4>
          <p className="fs-5 mb-1">
            <strong>{ai.recommendation || 'No recommendation generated'}</strong>
          </p>
          <span className="badge bg-success">
            Confidence: {ai.confidence || 'N/A'}%
          </span>
        </div>
      </div>

      {/* Explainability (SHAP) */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="h6 mb-3">Why this recommendation?</h5>

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
      <div className="card p-4">
        <h5 className="h6 mb-2">Context snapshot</h5>
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
