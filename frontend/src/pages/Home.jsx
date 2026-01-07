import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="card p-4 p-lg-5">
            <div className="page-header">
              <div>
                <h1 className="page-title h2">Sustainable Mining & Metallurgy</h1>
                <p className="page-subtitle">
                  AI-powered Life Cycle Assessment (LCA) to quantify emissions, benchmark circularity, and generate actionable recommendations.
                </p>
              </div>
              <div className="d-flex gap-2 flex-wrap">
                <Link to="/create-project" className="btn btn-success px-4">
                  Start assessment
                </Link>
                <Link to="/dashboard" className="btn btn-outline-secondary px-4">
                  View dashboard
                </Link>
              </div>
            </div>

            <div className="row g-3 mt-2">
              <div className="col-12 col-md-4">
                <div className="border rounded-3 p-3 h-100 bg-light">
                  <div className="fw-semibold">Carbon footprint</div>
                  <div className="text-muted small">Estimate kg CO₂e based on energy, water, and materials.</div>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="border rounded-3 p-3 h-100 bg-light">
                  <div className="fw-semibold">Circularity score</div>
                  <div className="text-muted small">Measure efficiency and recycling potential on a 0–100 scale.</div>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="border rounded-3 p-3 h-100 bg-light">
                  <div className="fw-semibold">AI insights</div>
                  <div className="text-muted small">Get recommendations with explainability for key drivers.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;