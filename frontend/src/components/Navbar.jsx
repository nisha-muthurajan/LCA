import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom fixed-top app-navbar">
      <div className="container-fluid px-3 px-lg-4">
        <Link className="navbar-brand fw-semibold text-success" to="/" onClick={() => setOpen(false)}>
          EcoMine LCA
        </Link>

        <button
          className="navbar-toggler"
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

            <li className="nav-item ms-lg-2">
              <NavLink className="btn btn-success btn-sm px-3" to="/login" onClick={() => setOpen(false)}>
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