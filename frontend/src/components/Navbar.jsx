import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar navbar-expand-lg fixed-top app-navbar">
      <div className="container-fluid px-4">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/" onClick={() => setOpen(false)}>
          <span className="d-flex align-items-center justify-content-center rounded-circle" 
                style={{ 
                  width: '36px', 
                  height: '36px', 
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: '800'
                }}>
            🌿
          </span>
          <span style={{ color: '#0f172a' }}>
            <span className="eco" style={{ color: '#10b981' }}>Eco</span>Mine
          </span>
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          aria-controls="navbarMain"
          aria-expanded={open}
          aria-label="Toggle navigation"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className={`collapse navbar-collapse ${open ? 'show' : ''}`} id="navbarMain">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-1">
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/" onClick={() => setOpen(false)}>
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/create-project" onClick={() => setOpen(false)}>
                New Assessment
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/dashboard" onClick={() => setOpen(false)}>
                Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/reports" onClick={() => setOpen(false)}>
                Reports
              </NavLink>
            </li>

            <li className="nav-item ms-lg-3">
              <NavLink className="btn btn-success px-4" to="/login" onClick={() => setOpen(false)}>
                Sign in
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;