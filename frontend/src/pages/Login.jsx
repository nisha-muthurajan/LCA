import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-12 col-md-6 col-lg-4">
                    <div className="card p-4 mt-4">
                        <div className="page-header">
                            <div>
                                <h3 className="page-title h4">Sign in</h3>
                                <p className="page-subtitle">Access your assessments and reports.</p>
                            </div>
                        </div>

                        {status.type && (
                            <div className={`alert alert-${status.type}`} role="alert">
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
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input 
                            type="password" 
                            className="form-control" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)} 
                            autoComplete="current-password"
                            required
                        />
                    </div>
                    <button className="btn btn-success w-100" disabled={submitting}>
                        {submitting ? (
                            <span><span className="spinner-border spinner-border-sm me-2" />Signing in…</span>
                        ) : (
                            'Sign in'
                        )}
                    </button>
                </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;