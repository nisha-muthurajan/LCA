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
        <div className="container">
            <div className="page-header">
                <div>
                    <h2 className="page-title h4">Administration</h2>
                    <p className="page-subtitle">Overview of assessments run on the platform.</p>
                </div>
            </div>

            <div className="card p-3">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead>
                            <tr>
                                <th>Project</th>
                                <th>Industry</th>
                                <th>Carbon (kg CO₂e)</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.length > 0 ? projects.map((p, i) => (
                                <tr key={i}>
                                    <td className="fw-semibold">{p.name}</td>
                                    <td>{p.industry_type}</td>
                                    <td className="metric-value">{p.carbon_footprint}</td>
                                    <td><span className="badge bg-success">Completed</span></td>
                                </tr>
                            )) : (
                                <tr><td colSpan="4" className="text-center text-muted py-4">No projects found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;