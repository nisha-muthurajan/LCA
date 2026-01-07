import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateProject = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('manual'); // 'manual' or 'upload'
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: null, message: '' });
  
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
        setStatus({ type: null, message: '' });

    const API_URL = 'http://localhost:8000/api/projects/analyze/';
    
    try {
        let response;

        if (mode === 'upload' && file) {
            // 📂 Prepare File Upload
            const formDataObj = new FormData();
            formDataObj.append('file', file);
            
            // Let Axios/browser set the multipart boundary header.
            response = await axios.post(API_URL, formDataObj);

        } else {
            // 📝 Prepare Manual JSON
            response = await axios.post(API_URL, formData);
        }

        // Persist last result for refresh fallback and redirect to Dashboard
        localStorage.setItem('lastResult', JSON.stringify(response.data));

        navigate('/dashboard', { 
            state: { 
                result: response.data,
                formData: mode === 'manual' ? formData : { name: "Batch Upload", industry_type: "Mixed" } 
            } 
        });

    } catch (error) {
        console.error("Error submitting project", error);
                const serverMessage =
                    error?.response?.data?.error ||
                    error?.response?.data?.detail ||
                    error?.message;
                setStatus({ type: 'danger', message: `Submission failed. ${serverMessage || 'Check your data or file format.'}` });
    } finally {
        setLoading(false);
    }
  };

  return (
        <div className="container">
            <div className="card p-4 mt-3">
                <div className="page-header">
                    <div>
                        <h2 className="page-title h4">New assessment</h2>
                        <p className="page-subtitle">Enter project parameters or upload a dataset to analyze.</p>
                    </div>
                </div>

                {status.type && (
                    <div className={`alert alert-${status.type}`} role="alert">
                        {status.message}
                    </div>
                )}

        {/* Toggle Buttons */}
        <div className="btn-group w-100 mb-4" role="group" aria-label="Assessment mode">
            <button 
                className={`btn ${mode === 'manual' ? 'btn-success' : 'btn-outline-secondary'}`}
                onClick={() => setMode('manual')}
                type="button"
            >
                Manual entry
            </button>
            <button 
                className={`btn ${mode === 'upload' ? 'btn-success' : 'btn-outline-secondary'}`}
                onClick={() => setMode('upload')}
                type="button"
            >
                Upload CSV / Excel
            </button>
        </div>

        <form onSubmit={handleSubmit}>
          
          {/* --- MANUAL FORM --- */}
          {mode === 'manual' && (
            <>
                <div className="mb-3">
                    <label className="form-label">Project Name</label>
                    <input name="name" className="form-control" onChange={handleChange} required />
                    <div className="form-text">Use a clear name for reports and archiving.</div>
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
                        <div className="p-4 border rounded-3 bg-light mb-3">
                                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                                    <div>
                                        <h4 className="h5 mb-1">Upload dataset</h4>
                                        <p className="text-muted mb-0">Supported formats: .csv or .xlsx</p>
                                    </div>
                                </div>
                <input type="file" className="form-control" accept=".csv, .xlsx" onChange={handleFileChange} required />
                                <div className="mt-3">
                                    <div className="fw-semibold">Expected columns</div>
                                    <div className="text-muted small">name, industry, energy, water, material</div>
                                </div>
            </div>
          )}

          {/* Submit Button */}
          <button type="submit" className="btn btn-primary w-100 btn-lg" disabled={loading}>
            {loading ? (
                 <span><span className="spinner-border spinner-border-sm me-2"></span>Processing...</span>
            ) : (
                                mode === 'upload' ? 'Analyze file' : 'Run assessment'
            )}
          </button>

        </form>
      </div>
    </div>
  );
};

export default CreateProject;