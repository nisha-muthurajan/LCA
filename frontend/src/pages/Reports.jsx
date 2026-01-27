import React, { useEffect, useState } from 'react';
import { getProjects } from '../services/api';
import axios from 'axios';
import Loader from '../components/Loader';

const Reports = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        const data = await getProjects();
        setProjects(data);
        setLoading(false);
    };

    const handleDownload = async (project, type) => {
        const endpoint = type === 'pdf' ? 'report/pdf/' : 'report/excel/';
        try {
            // We need to reconstruct the "results" object slightly for the report generator
            // In a real app, you'd store the full results JSON in the DB. 
            // Here we re-construct the basic needed fields from the Project model.
            const mockResults = {
                carbon_footprint: project.carbon_footprint,
                circularity_score: project.circularity_score,
                recommendations: ["View dashboard for full AI insights."] 
            };

            const response = await axios.post(
                `http://localhost:8000/api/projects/${endpoint}`,
                { project_data: project, results: mockResults },
                { responseType: 'blob' }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Report_${project.name}.${type === 'pdf' ? 'pdf' : 'xlsx'}`);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            alert("Error downloading file.");
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Reports</h2>
                    <p className="page-subtitle">Download historical assessment reports.</p>
                </div>
            </div>

            <div className="card">
                {projects.length > 0 ? (
                    <div className="list-group list-group-flush">
                        {projects.map((project) => (
                            <div key={project.id} className="list-group-item d-flex justify-content-between align-items-center flex-wrap gap-3 p-4">
                                <div className="d-flex align-items-center gap-3">
                                    <div style={{ 
                                        width: '48px', 
                                        height: '48px', 
                                        borderRadius: '12px', 
                                        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '20px'
                                    }}>
                                        📊
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '700', fontSize: '15px', color: '#0f172a' }}>{project.name}</div>
                                        <div style={{ color: '#64748b', fontSize: '13px' }}>
                                            <span className="badge" style={{ background: '#e2e8f0', color: '#475569', marginRight: '8px', fontWeight: '500' }}>
                                                {project.industry_type}
                                            </span>
                                            {new Date(project.created_at).toLocaleDateString('en-US', { 
                                                year: 'numeric', 
                                                month: 'short', 
                                                day: 'numeric' 
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex gap-2">
                                    <button 
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={() => handleDownload(project, 'pdf')}
                                    >
                                        <span style={{ marginRight: '4px' }}>📄</span> PDF
                                    </button>
                                    <button 
                                        className="btn btn-outline-success btn-sm"
                                        onClick={() => handleDownload(project, 'excel')}
                                    >
                                        <span style={{ marginRight: '4px' }}>📊</span> Excel
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-5">
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>📁</div>
                        <h4 style={{ fontWeight: '700', marginBottom: '8px' }}>No Reports Yet</h4>
                        <p style={{ color: '#64748b' }}>Create a project assessment to generate your first report.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;