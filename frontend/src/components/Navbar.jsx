import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/authService';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = () => {
      const currentUser = getCurrentUser();
      setUser(currentUser);
    };
    
    checkUser();
    window.addEventListener('storage', checkUser);
    window.addEventListener('userUpdated', checkUser);
    
    return () => {
      window.removeEventListener('storage', checkUser);
      window.removeEventListener('userUpdated', checkUser);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    setDropdownOpen(false);
    navigate('/');
    window.dispatchEvent(new Event('userUpdated'));
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

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

            {/* Profile / Sign In */}
            <li className="nav-item ms-lg-3" ref={dropdownRef}>
              {user ? (
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      border: 'none',
                      borderRadius: '50px',
                      padding: '6px 16px 6px 6px',
                      cursor: 'pointer',
                      color: '#fff',
                      fontWeight: '600',
                      fontSize: '14px',
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '14px'
                    }}>
                      {getInitial(user.username)}
                    </span>
                    <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.username}
                    </span>
                    <span style={{ fontSize: '10px' }}>▼</span>
                  </button>

                  {dropdownOpen && (
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      background: '#fff',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                      border: '1px solid #e2e8f0',
                      minWidth: '200px',
                      zIndex: 1000,
                      overflow: 'hidden'
                    }}>
                      <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                        <div style={{ fontWeight: '700', color: '#0f172a' }}>{user.username}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{user.email || 'No email'}</div>
                      </div>
                      <div style={{ padding: '8px' }}>
                        <button
                          onClick={() => { navigate('/profile'); setDropdownOpen(false); setOpen(false); }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            width: '100%',
                            padding: '10px 12px',
                            border: 'none',
                            background: 'transparent',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            color: '#334155',
                            textAlign: 'left'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
                          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <span>👤</span> My Profile
                        </button>
                        <button
                          onClick={() => { navigate('/dashboard'); setDropdownOpen(false); setOpen(false); }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            width: '100%',
                            padding: '10px 12px',
                            border: 'none',
                            background: 'transparent',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            color: '#334155',
                            textAlign: 'left'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
                          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <span>📊</span> Dashboard
                        </button>
                        <div style={{ height: '1px', background: '#e2e8f0', margin: '8px 0' }}></div>
                        <button
                          onClick={handleLogout}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            width: '100%',
                            padding: '10px 12px',
                            border: 'none',
                            background: 'transparent',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            color: '#ef4444',
                            textAlign: 'left'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = '#fef2f2'}
                          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <span>🚪</span> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <NavLink className="btn btn-success px-4" to="/login" onClick={() => setOpen(false)}>
                  Sign in
                </NavLink>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;