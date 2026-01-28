import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/authService';
import axios from 'axios';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState({
    industry_name: '',
    industry_location: '',
    products: '',
    company_size: '',
    established_year: '',
    website: '',
    description: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    
    // Load saved profile data from localStorage
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setProfileData(JSON.parse(savedProfile));
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save to localStorage
      localStorage.setItem('userProfile', JSON.stringify(profileData));
      setMessage('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  if (!user) {
    return (
      <div className="fade-in text-center py-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">👤 Profile</h2>
          <p className="page-subtitle">Manage your account and industry information</p>
        </div>
        <button onClick={handleLogout} className="btn btn-outline-danger">
          <span>🚪</span> Sign Out
        </button>
      </div>

      {message && (
        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-danger'} mb-4`}>
          {message}
        </div>
      )}

      {/* Profile Header Card */}
      <div className="card mb-4" style={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
        border: 'none',
        color: '#fff'
      }}>
        <div className="card-body p-4">
          <div className="d-flex align-items-center gap-4">
            <div style={{ 
              width: '100px', 
              height: '100px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              fontWeight: '800',
              color: '#fff',
              boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)'
            }}>
              {getInitial(user.username)}
            </div>
            <div>
              <h3 style={{ fontWeight: '800', marginBottom: '4px' }}>{user.username}</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0 }}>{user.email || 'No email provided'}</p>
              <div className="mt-2">
                <span style={{ 
                  background: 'rgba(16,185,129,0.2)', 
                  color: '#10b981', 
                  padding: '4px 12px', 
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  ✓ Verified Account
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Industry Information */}
        <div className="col-lg-8">
          <div className="card">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 style={{ fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ 
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
                    color: '#fff', 
                    width: '36px', 
                    height: '36px', 
                    borderRadius: '10px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '18px'
                  }}>🏭</span>
                  Industry Information
                </h5>
                <button 
                  className={`btn ${isEditing ? 'btn-success' : 'btn-outline-secondary'} btn-sm`}
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm"></span>
                  ) : isEditing ? (
                    <><span>💾</span> Save Changes</>
                  ) : (
                    <><span>✏️</span> Edit</>
                  )}
                </button>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Industry / Company Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="industry_name"
                    value={profileData.industry_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="e.g., GreenTech Mining Co."
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-control"
                    name="industry_location"
                    value={profileData.industry_location}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="e.g., Mumbai, Maharashtra, India"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Products / Services</label>
                  <input
                    type="text"
                    className="form-control"
                    name="products"
                    value={profileData.products}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="e.g., Copper, Iron Ore, Coal"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Company Size</label>
                  <select
                    className="form-select"
                    name="company_size"
                    value={profileData.company_size}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  >
                    <option value="">Select size</option>
                    <option value="1-50">1-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501-1000">501-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Established Year</label>
                  <input
                    type="number"
                    className="form-control"
                    name="established_year"
                    value={profileData.established_year}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="e.g., 1995"
                    min="1900"
                    max="2026"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Website</label>
                  <input
                    type="url"
                    className="form-control"
                    name="website"
                    value={profileData.website}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="https://www.example.com"
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={profileData.description}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows="3"
                    placeholder="Brief description of your industry operations, sustainability goals, etc."
                  />
                </div>
              </div>

              {isEditing && (
                <div className="mt-3 text-end">
                  <button 
                    className="btn btn-outline-secondary me-2"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="col-lg-4">
          <div className="card mb-4">
            <div className="card-body p-4">
              <h5 style={{ fontWeight: '700', marginBottom: '20px' }}>📊 Quick Stats</h5>
              
              <div className="d-flex flex-column gap-3">
                <div className="p-3" style={{ background: '#f0fdf4', borderRadius: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#166534', fontWeight: '600', marginBottom: '4px' }}>
                    Total Assessments
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#10b981' }}>
                    {localStorage.getItem('lastResult') ? '1+' : '0'}
                  </div>
                </div>
                
                <div className="p-3" style={{ background: '#eff6ff', borderRadius: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#1e40af', fontWeight: '600', marginBottom: '4px' }}>
                    Account Type
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: '700', color: '#3b82f6' }}>
                    Standard User
                  </div>
                </div>
                
                <div className="p-3" style={{ background: '#fef3c7', borderRadius: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#92400e', fontWeight: '600', marginBottom: '4px' }}>
                    Member Since
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: '700', color: '#d97706' }}>
                    January 2026
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-body p-4">
              <h5 style={{ fontWeight: '700', marginBottom: '20px' }}>⚡ Quick Actions</h5>
              
              <div className="d-flex flex-column gap-2">
                <button 
                  className="btn btn-outline-secondary text-start"
                  onClick={() => navigate('/create-project')}
                >
                  <span className="me-2">➕</span> New Assessment
                </button>
                <button 
                  className="btn btn-outline-secondary text-start"
                  onClick={() => navigate('/dashboard')}
                >
                  <span className="me-2">📊</span> View Dashboard
                </button>
                <button 
                  className="btn btn-outline-secondary text-start"
                  onClick={() => navigate('/reports')}
                >
                  <span className="me-2">📄</span> View Reports
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
