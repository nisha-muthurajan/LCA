import React, { useState } from 'react';
import { analyzeLCA } from '../services/api';
import { useNavigate } from 'react-router-dom';

const CreateProject = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    industry_type: 'Mining',
    energy_consumption: '',
    water_usage: '',
    raw_material_qty: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await analyzeLCA(formData);
    // Pass results to Dashboard via state
    navigate('/dashboard', { state: { result } });
  };

  return (
    <div className="container mt-5">
      <h2>🚀 Start New LCA Project</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Project Name</label>
          <input name="name" className="form-control" onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>Energy (kWh)</label>
          <input name="energy_consumption" type="number" className="form-control" onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>Water (Liters)</label>
          <input name="water_usage" type="number" className="form-control" onChange={handleChange} required />
        </div>
        <button type="submit" className="btn btn-primary">Analyze Sustainability</button>
      </form>
    </div>
  );
};

export default CreateProject;