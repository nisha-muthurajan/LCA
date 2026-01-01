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
        <div className="container mt-4">
            <h2>📑 Project Reports Archive</h2>
            <p className="text-muted">Access and download historical assessment reports.</p>

            <div className="list-group">
                {projects.length > 0 ? (
                    projects.map((project) => (
                        <div key={project.id} className="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                                <h5 className="mb-1">{project.name}</h5>
                                <small className="text-muted">
                                    {project.industry_type} | {new Date(project.created_at).toLocaleDateString()}
                                </small>
                            </div>
                            <div>
                                <button 
                                    className="btn btn-outline-danger btn-sm me-2"
                                    onClick={() => handleDownload(project, 'pdf')}
                                >
                                    PDF 📄
                                </button>
                                <button 
                                    className="btn btn-outline-success btn-sm"
                                    onClick={() => handleDownload(project, 'excel')}
                                >
                                    Excel 📊
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="alert alert-warning">No reports found. Create a project first!</div>
                )}
            </div>
        </div>
    );
};

export default Reports;