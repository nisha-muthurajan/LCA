import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const Recommendations = () => {
    // This assumes you navigated here from the Dashboard with state. 
    // If accessed directly, it shows a placeholder.
    const location = useLocation();
    const results = location.state?.results;

    if (!results) {
        return (
            <div className="container mt-5 text-center">
                <h3>No analysis data found.</h3>
                <p>Please run an assessment first to generate AI insights.</p>
                <Link to="/create-project" className="btn btn-primary">Start Analysis</Link>
            </div>
        );
    }

    const recs = results.recommendation ? [results.recommendation] : [];

    return (
        <div className="container mt-5">
            <h2 className="mb-4">💡 AI-Driven Circularity Insights</h2>
            
            <div className="row">
                <div className="col-md-8">
                    {recs.length > 0 ? (
                        recs.map((rec, index) => (
                            <div key={index} className="alert alert-success d-flex align-items-center" role="alert">
                                <span style={{ fontSize: '1.5rem', marginRight: '15px' }}>♻️</span>
                                <div>
                                    <h5>Optimization Opportunity</h5>
                                    <p className="mb-0">{rec}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No specific high-impact warnings found. Good job!</p>
                    )}

                    <div className="card mt-4 p-4">
                        <h4>General Industry Benchmarks</h4>
                        <ul>
                            <li>Average Mining CO2/ton: <strong>2.5 kg</strong></li>
                            <li>Your Project: <strong>{(results.carbon_footprint / 1000).toFixed(2)} kg (Est.)</strong></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Recommendations;