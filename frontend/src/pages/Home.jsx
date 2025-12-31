import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="text-center mt-5">
      <h1 className="display-4">Sustainable Mining & Metallurgy</h1>
      <p className="lead">AI-Powered Life Cycle Assessment (LCA) Tool</p>
      <hr className="my-4" />
      <p>Analyze emissions, optimize energy, and improve circularity with one click.</p>
      <Link to="/create-project" className="btn btn-primary btn-lg">
        Create New Project 🚀
      </Link>
    </div>
  );
};

export default Home;