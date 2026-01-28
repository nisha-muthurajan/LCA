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

  // Get results data - check multiple possible locations
  const resultsData = result.results || result || {};
  const carbonFootprint = resultsData.carbon_footprint ?? resultsData.carbon ?? resultsData.total_carbon ?? 0;
  const circularityScore = resultsData.circularity_score ?? resultsData.circularity ?? resultsData.avg_circularity ?? null;

  const ai = result.ai_recommendation || {};
  const details = ai.details || {};
  const weaknesses = details.weaknesses || [];
  const strengths = details.strengths || [];
  const explanations = ai.explanation || [];
  const featureAnalysis = details.feature_analysis || [];
  const alternatives = details.alternatives || [];
  const allProbabilities = details.all_probabilities || {};
  const overallStatus = details.overall_status || 'Unknown';
  const sustainabilityScore = details.sustainability_score || 0;
  const confidenceLevel = details.confidence_level || 'Unknown';
  const confidenceMessage = details.confidence_message || '';
  const primaryRecommendation = details.primary_recommendation || ai.label || 'N/A';

  // Status color mapping
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'excellent': return { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' };
      case 'good': return { bg: '#d1fae5', text: '#047857', border: '#a7f3d0' };
      case 'moderate': return { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' };
      case 'needs improvement': return { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca' };
      default: return { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };
    }
  };

  const statusColors = getStatusColor(overallStatus);

  // Confidence color mapping
  const getConfidenceColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'very high': return '#10b981';
      case 'high': return '#059669';
      case 'moderate': return '#f59e0b';
      case 'low': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">🤖 AI Sustainability Analysis</h2>
          <p className="page-subtitle">Pure AI-driven insights from machine learning model analysis</p>
        </div>
        <Link to="/dashboard" className="btn btn-outline-secondary">
          ← Back to Dashboard
        </Link>
      </div>

      {/* AI Analysis Header Card */}
      <div className="card mb-4" style={{ 
        background: `linear-gradient(135deg, #0f172a 0%, #1e293b 100%)`, 
        border: 'none',
        color: '#fff'
      }}>
        <div className="card-body p-4">
          <div className="row align-items-center">
            <div className="col-md-8">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', 
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '16px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '28px'
                }}>
                  🤖
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)' }}>
                    AI Model Prediction
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>
                    {primaryRecommendation}
                  </div>
                </div>
              </div>
              
              <div className="d-flex flex-wrap gap-3">
                <div style={{ 
                  background: 'rgba(255,255,255,0.1)', 
                  padding: '10px 16px', 
                  borderRadius: '10px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Status: </span>
                  <span style={{ fontWeight: '700', color: statusColors.text === '#166534' ? '#10b981' : statusColors.text === '#047857' ? '#34d399' : '#fbbf24' }}>
                    {overallStatus}
                  </span>
                </div>
                <div style={{ 
                  background: 'rgba(255,255,255,0.1)', 
                  padding: '10px 16px', 
                  borderRadius: '10px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Confidence: </span>
                  <span style={{ fontWeight: '700', color: getConfidenceColor(confidenceLevel) }}>
                    {confidenceLevel} ({ai.confidence}%)
                  </span>
                </div>
              </div>
            </div>
            <div className="col-md-4 text-center mt-3 mt-md-0">
              <div style={{ 
                width: '130px', 
                height: '130px', 
                borderRadius: '50%', 
                background: `conic-gradient(#6366f1 ${sustainabilityScore * 360}deg, rgba(255,255,255,0.1) 0deg)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto'
              }}>
                <div style={{ 
                  width: '105px', 
                  height: '105px', 
                  borderRadius: '50%', 
                  background: '#1e293b',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '1.75rem', fontWeight: '800' }}>
                    {(sustainabilityScore * 100).toFixed(0)}%
                  </span>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>AI Score</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI-Identified Priority Areas */}
      {weaknesses.length > 0 && (
        <div className="card mb-4">
          <div className="card-body p-4">
            <h5 style={{ fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ 
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
                color: '#fff', 
                width: '36px', 
                height: '36px', 
                borderRadius: '10px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '18px'
              }}>🔬</span>
              AI-Identified Priority Areas
              <span className="badge" style={{ background: '#fef3c7', color: '#92400e', marginLeft: '8px' }}>
                Based on SHAP Analysis
              </span>
            </h5>

            <div className="d-flex flex-column gap-4">
              {weaknesses.map((item, index) => (
                <div key={index} className="p-4" style={{ 
                  background: '#fafafa', 
                  borderRadius: '16px', 
                  border: '1px solid #e5e7eb',
                  borderLeft: '4px solid #f59e0b'
                }}>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h6 style={{ fontWeight: '700', color: '#0f172a', margin: 0, fontSize: '1.1rem' }}>
                        {item.area}
                      </h6>
                      <span style={{ 
                        display: 'inline-block',
                        marginTop: '6px',
                        padding: '4px 12px', 
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: item.status === 'HIGH' ? '#fef2f2' : item.status === 'MEDIUM' ? '#fff7ed' : '#fefce8',
                        color: item.status === 'HIGH' ? '#dc2626' : item.status === 'MEDIUM' ? '#ea580c' : '#ca8a04',
                      }}>
                        {item.priority}
                      </span>
                    </div>
                    <div className="text-end">
                      <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>
                        AI Impact Score
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#6366f1' }}>
                        {item.ai_impact_score?.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  
                  {/* AI Impact Bar */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ 
                      height: '8px', 
                      background: '#e2e8f0', 
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        width: `${Math.min(item.ai_impact_score || 0, 100)}%`, 
                        height: '100%',
                        background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
                        borderRadius: '4px',
                        transition: 'width 0.5s ease'
                      }}></div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      Current Value: <strong>{item.current_value?.toLocaleString()}</strong>
                    </div>
                  </div>
                  
                  {item.recommended_actions && item.recommended_actions.length > 0 && (
                    <div style={{ 
                      background: '#fff', 
                      padding: '16px', 
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{ 
                        fontSize: '12px', 
                        fontWeight: '700', 
                        color: '#6366f1', 
                        textTransform: 'uppercase',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span>🤖</span> AI Insight
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        {item.recommended_actions.map((action, actionIndex) => (
                          <li key={actionIndex} style={{ 
                            color: '#374151', 
                            marginBottom: '8px',
                            lineHeight: '1.5'
                          }}>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Feature Importance */}
      {featureAnalysis.length > 0 && (
        <div className="card mb-4">
          <div className="card-body p-4">
            <h5 style={{ fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>📊</span> SHAP Feature Importance
              <span className="badge" style={{ background: '#e0e7ff', color: '#4338ca', marginLeft: '8px' }}>
                ML Explainability
              </span>
            </h5>

            <div className="d-flex flex-column gap-3">
              {featureAnalysis.map((feature, index) => (
                <div key={index} className="d-flex align-items-center gap-3 p-3" 
                     style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ 
                    background: `linear-gradient(135deg, ${index === 0 ? '#6366f1' : index === 1 ? '#8b5cf6' : '#a78bfa'} 0%, ${index === 0 ? '#4f46e5' : index === 1 ? '#7c3aed' : '#8b5cf6'} 100%)`, 
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
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span style={{ fontWeight: '600', color: '#0f172a' }}>
                        {feature.display_name}
                      </span>
                      <span style={{ 
                        fontSize: '13px',
                        fontWeight: '700',
                        color: '#6366f1'
                      }}>
                        {feature.impact_percentage?.toFixed(1)}%
                      </span>
                    </div>
                    <div style={{ 
                      height: '6px', 
                      background: '#e2e8f0', 
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        width: `${Math.min(feature.impact_percentage || 0, 100)}%`, 
                        height: '100%',
                        background: `linear-gradient(90deg, ${index === 0 ? '#6366f1' : index === 1 ? '#8b5cf6' : '#a78bfa'} 0%, ${index === 0 ? '#4f46e5' : index === 1 ? '#7c3aed' : '#8b5cf6'} 100%)`,
                        borderRadius: '3px'
                      }}></div>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                      Value: {feature.value?.toLocaleString()} | 
                      Direction: <span style={{ color: feature.direction === 'increases' ? '#ef4444' : '#10b981' }}>
                        {feature.direction === 'increases' ? '↑' : '↓'} {feature.direction}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Alternative AI Suggestions & Model Probabilities */}
      <div className="row g-4 mb-4">
        {alternatives.length > 0 && (
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-body p-4">
                <h5 style={{ fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>💡</span> Alternative AI Suggestions
                </h5>
                <div className="d-flex flex-column gap-3">
                  {alternatives.map((alt, index) => (
                    <div key={index} className="p-3" style={{ 
                      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', 
                      borderRadius: '12px',
                      border: '1px solid #bbf7d0'
                    }}>
                      <div className="d-flex justify-content-between align-items-center">
                        <span style={{ fontWeight: '600', color: '#166534' }}>{alt.recommendation}</span>
                        <span className="badge" style={{ background: '#dcfce7', color: '#166534' }}>
                          {alt.probability?.toFixed(0)}% likely
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {Object.keys(allProbabilities).length > 0 && (
          <div className={alternatives.length > 0 ? "col-md-6" : "col-12"}>
            <div className="card h-100">
              <div className="card-body p-4">
                <h5 style={{ fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>📈</span> Model Class Probabilities
                </h5>
                <div className="d-flex flex-column gap-2">
                  {Object.entries(allProbabilities).slice(0, 5).map(([label, prob], index) => (
                    <div key={index} className="d-flex align-items-center gap-3">
                      <div style={{ width: '120px', fontSize: '13px', fontWeight: '500', color: '#374151' }}>
                        {label.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </div>
                      <div style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${prob}%`, 
                          height: '100%',
                          background: index === 0 ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)' : '#94a3b8',
                          borderRadius: '4px'
                        }}></div>
                      </div>
                      <div style={{ width: '50px', textAlign: 'right', fontSize: '13px', fontWeight: '600', color: index === 0 ? '#10b981' : '#64748b' }}>
                        {prob?.toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Strengths Section */}
      {strengths.length > 0 && (
        <div className="card mb-4">
          <div className="card-body p-4">
            <h5 style={{ fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                color: '#fff', 
                width: '36px', 
                height: '36px', 
                borderRadius: '10px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '18px'
              }}>✅</span>
              AI-Identified Strengths
            </h5>
            
            <div className="row g-3">
              {strengths.map((strength, index) => (
                <div key={index} className="col-md-6">
                  <div className="p-3" style={{ 
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', 
                    borderRadius: '12px',
                    border: '1px solid #bbf7d0'
                  }}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div style={{ fontWeight: '700', color: '#166534' }}>{strength.area}</div>
                        <div style={{ fontSize: '13px', color: '#047857' }}>
                          Value: {strength.current_value?.toLocaleString()}
                        </div>
                      </div>
                      <span style={{ 
                        background: '#dcfce7', 
                        color: '#166534', 
                        padding: '6px 12px', 
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {strength.status}
                      </span>
                    </div>
                    {strength.ai_assessment && (
                      <div style={{ fontSize: '12px', color: '#047857', marginTop: '8px', fontStyle: 'italic' }}>
                        {strength.ai_assessment}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Assessment Metrics */}
      <div className="card">
        <div className="card-body p-4">
          <h5 style={{ fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>📊</span> Assessment Metrics
          </h5>
          <div className="row g-4">
            <div className="col-md-6">
              <div className="p-4" style={{ 
                background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', 
                borderRadius: '16px',
                border: '1px solid #fecaca'
              }}>
                <div style={{ 
                  fontSize: '12px', 
                  fontWeight: '700', 
                  color: '#b91c1c', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em',
                  marginBottom: '8px' 
                }}>
                  🔥 Carbon Footprint
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: '800', color: '#ef4444' }}>
                    {Number(carbonFootprint).toLocaleString()}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#dc2626' }}>kg CO₂e</span>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="p-4" style={{ 
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', 
                borderRadius: '16px',
                border: '1px solid #bbf7d0'
              }}>
                <div style={{ 
                  fontSize: '12px', 
                  fontWeight: '700', 
                  color: '#166534', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em',
                  marginBottom: '8px' 
                }}>
                  ♻️ Circularity Score
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: '800', color: '#10b981' }}>
                    {circularityScore !== null ? Number(circularityScore).toFixed(1) : 'N/A'}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#059669' }}>/ 100</span>
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
