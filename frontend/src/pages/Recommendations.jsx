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
      <div className="fade-in">
        <div className="card p-5 text-center">
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
          <h3 style={{ fontWeight: '700', marginBottom: '8px' }}>No Analysis Data Found</h3>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>Run an assessment to generate AI recommendations.</p>
          <Link to="/create-project" className="btn btn-success btn-lg px-4 mx-auto" style={{ maxWidth: '250px' }}>
            <span>🚀</span> Start Assessment
          </Link>
        </div>
      </div>
    );
  }

  const ai = result.ai_recommendation || {};
  const explanations = ai.explanation || [];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">AI Insights</h2>
          <p className="page-subtitle">Recommendations with context and explainability signals.</p>
        </div>
        <Link to="/dashboard" className="btn btn-outline-secondary">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Main Recommendation Card */}
      <div className="card mb-4" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '1px solid #bbf7d0' }}>
        <div className="card-body p-4">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{ 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
              color: '#fff', 
              width: '40px', 
              height: '40px', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              🎯
            </span>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#059669' }}>
                Primary Recommendation
              </div>
            </div>
          </div>
          <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#166534', margin: '0 0 12px 0' }}>
            {ai.recommendation || 'No recommendation generated'}
          </p>
          <span className="badge bg-success" style={{ fontSize: '13px', padding: '8px 16px' }}>
            Confidence: {ai.confidence || 'N/A'}%
          </span>
        </div>
      </div>

      {/* Explainability Section */}
      <div className="card mb-4">
        <div className="card-body p-4">
          <h5 style={{ fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>🧠</span> Why This Recommendation?
          </h5>

          {explanations.length === 0 ? (
            <div className="text-center py-4" style={{ color: '#64748b' }}>
              <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>📊</span>
              Explainability data not available for this assessment.
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {explanations.map((item, index) => (
                <div key={index} className="d-flex align-items-center gap-3 p-3" 
                     style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ 
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
                    color: '#fff', 
                    width: '36px', 
                    height: '36px', 
                    borderRadius: '10px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: '700',
                    flexShrink: 0
                  }}>
                    #{index + 1}
                  </div>
                  <div>
                    <span style={{ fontWeight: '600', color: '#0f172a' }}>{item.feature}</span>
                    <span style={{ color: '#64748b' }}> had high impact</span>
                    <span className="badge" style={{ 
                      marginLeft: '10px', 
                      background: '#e0e7ff', 
                      color: '#4f46e5',
                      fontWeight: '600'
                    }}>
                      Impact: {item.impact}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Context Snapshot */}
      <div className="card">
        <div className="card-body p-4">
          <h5 style={{ fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>📋</span> Context Snapshot
          </h5>
          <div className="row g-3">
            <div className="col-md-6">
              <div className="p-3" style={{ background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', borderRadius: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#b91c1c', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Carbon Footprint
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ef4444' }}>
                  {result.carbon_footprint ?? 0} <span style={{ fontSize: '14px', fontWeight: '500' }}>kg CO₂e</span>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="p-3" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderRadius: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#166534', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Circularity Score
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#10b981' }}>
                  {result.circularity_score ?? 'N/A'} <span style={{ fontSize: '14px', fontWeight: '500' }}>/ 100</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
