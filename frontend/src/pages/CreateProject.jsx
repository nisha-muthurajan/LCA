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
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h2 className="page-title">New Assessment</h2>
                    <p className="page-subtitle">Enter project parameters or upload a dataset to analyze.</p>
                </div>
            </div>

            <div className="card p-4">
                {status.type && (
                    <div className={`alert alert-${status.type} mb-4`} role="alert">
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
                <span style={{ marginRight: '8px' }}>📝</span> Manual Entry
            </button>
            <button 
                className={`btn ${mode === 'upload' ? 'btn-success' : 'btn-outline-secondary'}`}
                onClick={() => setMode('upload')}
                type="button"
            >
                <span style={{ marginRight: '8px' }}>📂</span> Upload File
            </button>
        </div>

        <form onSubmit={handleSubmit}>
          
          {/* --- MANUAL FORM --- */}
          {mode === 'manual' && (
            <>
                <div className="mb-4">
                    <label className="form-label">Project Name</label>
                    <input 
                        name="name" 
                        className="form-control" 
                        onChange={handleChange} 
                        placeholder="e.g., Copper Mine Assessment Q1"
                        required 
                    />
                    <div className="form-text">Use a clear name for reports and archiving.</div>
                </div>
                <div className="row g-4">
                    <div className="col-md-6">
                        <label className="form-label">Industry Type</label>
                        <select name="industry_type" className="form-select" onChange={handleChange}>
                            <option value="Mining">⛏️ Mining</option>
                            <option value="Metallurgy">🔧 Metallurgy</option>
                        </select>
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Raw Material (Tons)</label>
                        <input 
                            name="raw_material_qty" 
                            type="number" 
                            className="form-control" 
                            onChange={handleChange} 
                            placeholder="e.g., 1000"
                            required 
                        />
                    </div>
                </div>
                <div className="row g-4 mt-1">
                    <div className="col-md-6">
                        <label className="form-label">Energy Consumption (kWh)</label>
                        <input 
                            name="energy_consumption" 
                            type="number" 
                            className="form-control" 
                            onChange={handleChange} 
                            placeholder="e.g., 50000"
                            required 
                        />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Water Usage (Liters)</label>
                        <input 
                            name="water_usage" 
                            type="number" 
                            className="form-control" 
                            onChange={handleChange} 
                            placeholder="e.g., 200000"
                            required 
                        />
                    </div>
                </div>
            </>
          )}

          {/* --- FILE UPLOAD FORM --- */}
          {mode === 'upload' && (
                        <div className="upload-zone mb-4">
                            <div className="mb-3">
                                <span style={{ fontSize: '48px' }}>📁</span>
                            </div>
                            <h4 style={{ fontWeight: '700', marginBottom: '8px' }}>Upload Dataset</h4>
                            <p style={{ color: '#64748b', marginBottom: '20px' }}>Drag and drop or click to select</p>
                            <input 
                                type="file" 
                                className="form-control" 
                                accept=".csv, .xlsx" 
                                onChange={handleFileChange} 
                                required 
                                style={{ maxWidth: '400px', margin: '0 auto' }}
                            />
                            <div className="mt-4 p-3" style={{ background: '#f1f5f9', borderRadius: '10px', display: 'inline-block' }}>
                                <div style={{ fontWeight: '600', fontSize: '13px', color: '#334155' }}>Expected columns:</div>
                                <div style={{ color: '#64748b', fontSize: '12px' }}>name, industry, energy, water, material</div>
                            </div>
                        </div>
          )}

          {/* Submit Button */}
          <button type="submit" className="btn btn-primary w-100 btn-lg mt-4" disabled={loading}>
            {loading ? (
                 <span><span className="spinner-border spinner-border-sm me-2"></span>Processing...</span>
            ) : (
                <>
                    <span>🚀</span>
                    {mode === 'upload' ? ' Analyze File' : ' Run Assessment'}
                </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
};

export default CreateProject;