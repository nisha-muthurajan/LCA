import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/authService'; // Import the service

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState({ type: null, message: '' });
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            setStatus({ type: null, message: '' });
            // Service handles the API call AND saving the token
            await login(username, password);
            
            setStatus({ type: 'success', message: 'Signed in successfully.' });
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
            setStatus({ type: 'danger', message: 'Invalid credentials. Please try again.' });
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
                           background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                           fontSize: '28px'
                         }}>
                        🔐
                    </div>
                    <h2 className="page-title" style={{ fontSize: '1.75rem' }}>Welcome back</h2>
                    <p className="page-subtitle">Sign in to access your assessments and reports.</p>
                </div>

                <div className="card card-elevated p-4">
                    {status.type && (
                        <div className={`alert alert-${status.type} mb-4`} role="alert">
                            {status.message}
                        </div>
                    )}

                    <form onSubmit={handleLogin}>
                        <div className="mb-3">
                            <label className="form-label">Username</label>
                            <input 
                                className="form-control" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)} 
                                autoComplete="username"
                                placeholder="Enter your username"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="form-label">Password</label>
                            <input 
                                type="password" 
                                className="form-control" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)} 
                                autoComplete="current-password"
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                        <button className="btn btn-success w-100 btn-lg" disabled={submitting}>
                            {submitting ? (
                                <span><span className="spinner-border spinner-border-sm me-2" />Signing in…</span>
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </form>

                    <div className="text-center mt-4 pt-3" style={{ borderTop: '1px solid #e2e8f0' }}>
                        <span style={{ color: '#64748b', fontSize: '14px' }}>Don't have an account? </span>
                        <Link to="/register" style={{ color: '#10b981', fontWeight: '600', fontSize: '14px', textDecoration: 'none' }}>
                            Create one
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;