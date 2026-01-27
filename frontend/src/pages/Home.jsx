import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="fade-in">
      {/* Hero Section */}
      <div className="hero-section mb-4">
        <h1 className="hero-title">
          Sustainable Mining & <span className="text-gradient">Metallurgy</span>
        </h1>
        <p className="hero-subtitle">
          AI-powered Life Cycle Assessment (LCA) to quantify emissions, benchmark circularity, 
          and generate actionable recommendations for your mining operations.
        </p>
        <div className="d-flex gap-3 flex-wrap">
          <Link to="/create-project" className="btn btn-success btn-lg px-4">
            <span>🚀</span> Start Assessment
          </Link>
          <Link to="/dashboard" className="btn btn-outline-secondary btn-lg px-4" style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>
            View Dashboard
          </Link>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="row g-4">
        <div className="col-12 col-md-4">
          <div className="feature-card">
            <div className="feature-icon carbon">🔥</div>
            <h3 className="feature-title">Carbon Footprint</h3>
            <p className="feature-description">
              Estimate kg CO₂e emissions based on energy consumption, water usage, and raw materials processing.
            </p>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="feature-card">
            <div className="feature-icon circular">♻️</div>
            <h3 className="feature-title">Circularity Score</h3>
            <p className="feature-description">
              Measure resource efficiency and recycling potential on a comprehensive 0–100 scale.
            </p>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="feature-card">
            <div className="feature-icon ai">🤖</div>
            <h3 className="feature-title">AI Insights</h3>
            <p className="feature-description">
              Get smart recommendations with explainability signals for key environmental drivers.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="card mt-4 p-4">
        <div className="row text-center">
          <div className="col-4">
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#10b981' }}>95%</div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>Accuracy Rate</div>
          </div>
          <div className="col-4">
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#6366f1' }}>500+</div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>Assessments Run</div>
          </div>
          <div className="col-4">
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#f59e0b' }}>24/7</div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>AI Support</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;