import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/authService'; // Import the service

const Register = () => {
    const [formData, setFormData] = useState({ 
        username: '', 
        email: '', 
        password: '' 
    });
    const [status, setStatus] = useState({ type: null, message: '' });
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            setStatus({ type: null, message: '' });
            // Cleaner service call
            await register(formData);
            
            setStatus({ type: 'success', message: 'Account created. Redirecting to sign in…' });
            navigate('/login');
        } catch (error) {
            console.error(error);
            setStatus({ type: 'danger', message: 'Could not create account. Please try again.' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center fade-in" style={{ minHeight: 'calc(100vh - 200px)' }}>
            <div style={{ width: '100%', maxWidth: '420px' }}>
                <div className="text-center mb-4">
                    <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" 
                         style={{ 
                           width: '64px', 
                           height: '64px', 
                           background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                           fontSize: '28px'
                         }}>
                        ✨
                    </div>
                    <h2 className="page-title" style={{ fontSize: '1.75rem' }}>Create Account</h2>
                    <p className="page-subtitle">Set up your profile to save assessments and reports.</p>
                </div>

                <div className="card card-elevated p-4">
                    {status.type && (
                        <div className={`alert alert-${status.type} mb-4`} role="alert">
                            {status.message}
                        </div>
                    )}

                    <form onSubmit={handleRegister}>
                        <div className="mb-3">
                            <label className="form-label">Username</label>
                            <input 
                                name="username"
                                className="form-control" 
                                onChange={handleChange} 
                                autoComplete="username"
                                placeholder="Choose a username"
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input 
                                name="email"
                                type="email" 
                                className="form-control" 
                                onChange={handleChange} 
                                autoComplete="email"
                                placeholder="your@email.com"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="form-label">Password</label>
                            <input 
                                name="password"
                                type="password" 
                                className="form-control" 
                                onChange={handleChange} 
                                autoComplete="new-password"
                                placeholder="Create a strong password"
                                required
                            />
                        </div>
                        <button className="btn btn-primary w-100 btn-lg" disabled={submitting}>
                            {submitting ? (
                                <span><span className="spinner-border spinner-border-sm me-2" />Creating…</span>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    <div className="text-center mt-4 pt-3" style={{ borderTop: '1px solid #e2e8f0' }}>
                        <span style={{ color: '#64748b', fontSize: '14px' }}>Already have an account? </span>
                        <Link to="/login" style={{ color: '#10b981', fontWeight: '600', fontSize: '14px', textDecoration: 'none' }}>
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;