import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    return (
        <aside className="app-sidebar" aria-label="Primary">
            <div className="sidebar-header">
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: '600', letterSpacing: '0.05em' }}>
                    NAVIGATION
                </div>
            </div>

            <nav className="py-2">
                <p className="sidebar-section-title">Workspace</p>
                
                <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                    <span className="icon">📊</span>
                    Dashboard
                </NavLink>
                <NavLink to="/create-project" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                    <span className="icon">➕</span>
                    New Assessment
                </NavLink>
                <NavLink to="/recommendations" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                    <span className="icon">🤖</span>
                    AI Insights
                </NavLink>
                <NavLink to="/reports" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                    <span className="icon">📄</span>
                    Reports
                </NavLink>

                <div className="sidebar-divider" />
                
                <p className="sidebar-section-title">Administration</p>
                <NavLink to="/admin-panel" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                    <span className="icon">⚙️</span>
                    Admin Panel
                </NavLink>
            </nav>

            <div style={{ 
                position: 'absolute', 
                bottom: '20px', 
                left: '20px', 
                right: '20px',
                padding: '16px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '12px',
                textAlign: 'center'
            }}>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginBottom: '4px' }}>
                    Powered by AI
                </div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>
                    EcoMine LCA v2.0
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;