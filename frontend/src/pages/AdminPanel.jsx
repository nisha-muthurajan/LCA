import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loader from '../components/Loader';

const AdminPanel = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // This endpoint needs to be created in Django or use the existing list view
        const fetchProjects = async () => {
            try {
                // Assuming you add a generic GET /api/projects/ endpoint
                const res = await axios.get('http://localhost:8000/api/projects/analyze/'); 
                // Note: The URL above depends on how you configure the list view in Django
                setProjects(res.data || []);
            } catch (err) {
                console.error("Failed to fetch projects");
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    if (loading) return <Loader />;

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Administration</h2>
                    <p className="page-subtitle">Overview of assessments run on the platform.</p>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <span style={{ 
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                        color: '#fff', 
                        padding: '8px 16px', 
                        borderRadius: '20px', 
                        fontSize: '13px', 
                        fontWeight: '600' 
                    }}>
                        {projects.length} Total Projects
                    </span>
                </div>
            </div>

            <div className="card">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead>
                            <tr>
                                <th style={{ paddingLeft: '24px' }}>Project</th>
                                <th>Industry</th>
                                <th>Carbon (kg CO₂e)</th>
                                <th>Circularity</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.length > 0 ? projects.map((p, i) => (
                                <tr key={i}>
                                    <td style={{ paddingLeft: '24px' }}>
                                        <div className="d-flex align-items-center gap-3">
                                            <div style={{ 
                                                width: '40px', 
                                                height: '40px', 
                                                borderRadius: '10px', 
                                                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '16px'
                                            }}>
                                                {p.industry_type === 'Mining' ? '⛏️' : '🔧'}
                                            </div>
                                            <span style={{ fontWeight: '600' }}>{p.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="badge" style={{ 
                                            background: p.industry_type === 'Mining' ? '#fef3c7' : '#e0e7ff', 
                                            color: p.industry_type === 'Mining' ? '#b45309' : '#4f46e5',
                                            fontWeight: '600'
                                        }}>
                                            {p.industry_type}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="metric-value" style={{ fontSize: '1rem', color: '#ef4444' }}>
                                            {p.carbon_footprint?.toLocaleString() || '—'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <div style={{ 
                                                width: '60px', 
                                                height: '6px', 
                                                background: '#e2e8f0', 
                                                borderRadius: '3px', 
                                                overflow: 'hidden' 
                                            }}>
                                                <div style={{ 
                                                    width: `${p.circularity_score || 0}%`, 
                                                    height: '100%', 
                                                    background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)' 
                                                }}></div>
                                            </div>
                                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#10b981' }}>
                                                {p.circularity_score || 0}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="badge bg-success">Completed</span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-5">
                                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
                                        <div style={{ color: '#64748b' }}>No projects found.</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;