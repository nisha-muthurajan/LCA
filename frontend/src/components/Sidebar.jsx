import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    return (
        <aside className="app-sidebar" aria-label="Primary">
            <div className="px-3 pt-3 pb-2">
                <div className="text-uppercase small text-muted fw-semibold">Workspace</div>
            </div>

            <nav className="px-2 pb-3">
                <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                    Dashboard
                </NavLink>
                <NavLink to="/create-project" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                    New Assessment
                </NavLink>
                <NavLink to="/recommendations" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                    AI Insights
                </NavLink>
                <NavLink to="/reports" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                    Reports
                </NavLink>

                <div className="sidebar-divider" />
                <div className="px-2 pt-2 text-uppercase small text-muted fw-semibold">Administration</div>
                <NavLink to="/admin-panel" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                    Admin Panel
                </NavLink>
            </nav>
        </aside>
    );
};

export default Sidebar;