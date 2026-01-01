import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateProject = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('manual'); // 'manual' or 'upload'
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Manual Data State
  const [formData, setFormData] = useState({
    name: '',
    industry_type: 'Mining',
    energy_consumption: '',
    water_usage: '',
    raw_material_qty: ''
  });

  // Handle Text Inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle File Selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const API_URL = 'http://localhost:8000/api/projects/analyze/';
    
    try {
        let response;

        if (mode === 'upload' && file) {
            // 📂 Prepare File Upload
            const formDataObj = new FormData();
            formDataObj.append('file', file);
            
            response = await axios.post(API_URL, formDataObj, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

        } else {
            // 📝 Prepare Manual JSON
            response = await axios.post(API_URL, formData);
        }

        // Redirect to Dashboard with results
        navigate('/dashboard', { 
            state: { 
                result: response.data,
                formData: mode === 'manual' ? formData : { name: "Batch Upload", industry_type: "Mixed" } 
            } 
        });

    } catch (error) {
        console.error("Error submitting project", error);
        alert("Submission failed. Check your data or file format.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-sm p-4">
        <h2 className="mb-4">🚀 New Sustainability Assessment</h2>

        {/* Toggle Buttons */}
        <div className="btn-group w-100 mb-4">
            <button 
                className={`btn ${mode === 'manual' ? 'btn-success' : 'btn-outline-secondary'}`}
                onClick={() => setMode('manual')}
            >
                📝 Manual Entry
            </button>
            <button 
                className={`btn ${mode === 'upload' ? 'btn-success' : 'btn-outline-secondary'}`}
                onClick={() => setMode('upload')}
            >
                📂 Upload CSV / Excel
            </button>
        </div>

        <form onSubmit={handleSubmit}>
          
          {/* --- MANUAL FORM --- */}
          {mode === 'manual' && (
            <>
                <div className="mb-3">
                    <label className="form-label">Project Name</label>
                    <input name="name" className="form-control" onChange={handleChange} required />
                </div>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Industry Type</label>
                        <select name="industry_type" className="form-select" onChange={handleChange}>
                            <option value="Mining">Mining</option>
                            <option value="Metallurgy">Metallurgy</option>
                        </select>
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Raw Material (Tons)</label>
                        <input name="raw_material_qty" type="number" className="form-control" onChange={handleChange} required />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Energy Consumption (kWh)</label>
                        <input name="energy_consumption" type="number" className="form-control" onChange={handleChange} required />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Water Usage (Liters)</label>
                        <input name="water_usage" type="number" className="form-control" onChange={handleChange} required />
                    </div>
                </div>
            </>
          )}

          {/* --- FILE UPLOAD FORM --- */}
          {mode === 'upload' && (
            <div className="text-center p-5 border rounded bg-light mb-3">
                <div style={{ fontSize: '3rem' }}>📄</div>
                <h4>Upload Dataset</h4>
                <p className="text-muted">Supports .csv or .xlsx</p>
                <input type="file" className="form-control" accept=".csv, .xlsx" onChange={handleFileChange} required />
                <small className="d-block mt-3 text-start">
                    <strong>Expected Columns:</strong> name, industry, energy, water, material
                </small>
            </div>
          )}

          {/* Submit Button */}
          <button type="submit" className="btn btn-primary w-100 btn-lg" disabled={loading}>
            {loading ? (
                 <span><span className="spinner-border spinner-border-sm me-2"></span>Processing...</span>
            ) : (
                mode === 'upload' ? 'Analyze File' : 'Calculate Impact'
            )}
          </button>

        </form>
      </div>
    </div>
  );
};

export default CreateProject;