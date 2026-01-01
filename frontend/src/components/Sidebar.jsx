import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
    return (
        <div className="d-flex flex-column flex-shrink-0 p-3 bg-light" style={{ width: '250px', height: '100vh', position: 'fixed', top: 56, left: 0 }}>
            <ul className="nav nav-pills flex-column mb-auto">
                <li className="nav-item">
                    <Link to="/dashboard" className="nav-link link-dark">
                        📊 Dashboard
                    </Link>
                </li>
                <li>
                    <Link to="/create-project" className="nav-link link-dark">
                        ➕ New Assessment
                    </Link>
                </li>
                <li>
                    <Link to="/recommendations" className="nav-link link-dark">
                        💡 AI Insights
                    </Link>
                </li>
                <li>
                    <Link to="/reports" className="nav-link link-dark">
                        📑 Reports
                    </Link>
                </li>
                <hr />
                <li>
                    <Link to="/admin-panel" className="nav-link link-dark">
                        ⚙️ Admin
                    </Link>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;