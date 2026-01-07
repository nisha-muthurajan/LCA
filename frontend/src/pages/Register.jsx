import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-12 col-md-6 col-lg-4">
                    <div className="card p-4 mt-4">
                        <div className="page-header">
                            <div>
                                <h3 className="page-title h4">Create account</h3>
                                <p className="page-subtitle">Set up your profile to save assessments.</p>
                            </div>
                        </div>

                        {status.type && (
                            <div className={`alert alert-${status.type}`} role="alert">
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
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input 
                            name="password"
                            type="password" 
                            className="form-control" 
                            onChange={handleChange} 
                            autoComplete="new-password"
                            required
                        />
                    </div>
                    <button className="btn btn-success w-100" disabled={submitting}>
                        {submitting ? (
                            <span><span className="spinner-border spinner-border-sm me-2" />Creating…</span>
                        ) : (
                            'Create account'
                        )}
                    </button>
                </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;