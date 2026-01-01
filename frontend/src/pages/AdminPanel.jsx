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
        <div className="container mt-5">
            <h2>⚙️ System Administration</h2>
            <p className="text-muted">Overview of all assessments run on the platform.</p>
            
            <div className="table-responsive">
                <table className="table table-hover table-bordered">
                    <thead className="table-dark">
                        <tr>
                            <th>Project Name</th>
                            <th>Industry</th>
                            <th>CO2 Score</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.length > 0 ? projects.map((p, i) => (
                            <tr key={i}>
                                <td>{p.name}</td>
                                <td>{p.industry_type}</td>
                                <td>{p.carbon_footprint}</td>
                                <td><span className="badge bg-success">Completed</span></td>
                            </tr>
                        )) : (
                            <tr><td colSpan="4" className="text-center">No projects found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPanel;