import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';

const Recommendations = () => {
    const location = useLocation();
    const [result, setResult] = useState(() => location.state?.results || null);

    // Hydrate if someone opens this page directly
    useEffect(() => {
        if (!result) {
            const cached = localStorage.getItem('lastResult');
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    setResult(parsed.results || parsed);
                } catch (err) {
                    console.error('Failed to parse cached result', err);
                }
            }
        }
    }, [result]);

    const recommendations = useMemo(() => {
        if (!result) return [];
        if (Array.isArray(result.recommendations)) return result.recommendations;
        if (Array.isArray(result.results?.recommendations)) return result.results.recommendations;
        // Legacy single-string recommendation
        if (result.recommendation) return [{ recommendation: result.recommendation }];
        return [];
    }, [result]);

    if (!result) {
        return (
            <div className="container mt-5 text-center">
                <h3>No analysis data found.</h3>
                <p>Please run an assessment first to generate AI insights.</p>
                <Link to="/create-project" className="btn btn-primary">Start Analysis</Link>
            </div>
        );
    }

    const carbonDisplay = Number(result.carbon_footprint ?? result.total_carbon ?? 0).toFixed(2);

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">💡 AI-Driven Recommendations</h2>
                <Link to="/dashboard" className="btn btn-outline-primary">Back to Dashboard</Link>
            </div>

            {recommendations.length === 0 ? (
                <div className="alert alert-secondary">No AI recommendations available for this run.</div>
            ) : (
                <div className="row g-3">
                    {recommendations.map((rec, idx) => (
                        <div className="col-md-6" key={idx}>
                            <div className="card h-100 shadow-sm border-0">
                                <div className="card-body">
                                    <div className="d-flex align-items-start mb-2">
                                        <span style={{ fontSize: '1.5rem', marginRight: '12px' }}>🤖</span>
                                        <div>
                                            <h5 className="card-title mb-1">{rec.process_stage || 'Process insight'}</h5>
                                            <small className="text-muted">Confidence impact: {rec.impact_reduction || 'Model-estimated'}</small>
                                        </div>
                                    </div>
                                    <p className="card-text mb-0">{rec.recommendation || 'Model suggestion unavailable.'}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="card mt-4 p-4 shadow-sm">
                <h4 className="mb-2">Context Snapshot</h4>
                <p className="mb-1">Estimated carbon footprint: <strong>{carbonDisplay} kg CO2e</strong></p>
                {result.circularity_score !== undefined && (
                    <p className="mb-0">Circularity score: <strong>{result.circularity_score}/100</strong></p>
                )}
            </div>
        </div>
    );
};

export default Recommendations;