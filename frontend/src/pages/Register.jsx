import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/authService'; // Import the service

const Register = () => {
    const [formData, setFormData] = useState({ 
        username: '', 
        email: '', 
        password: '' 
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            // Cleaner service call
            await register(formData);
            
            alert("Registration Successful! Please Login.");
            navigate('/login');
        } catch (error) {
            console.error(error);
            alert("Error registering user. Please try again.");
        }
    };

    return (
        <div className="container mt-5 col-md-4">
            <div className="card p-4">
                <h3 className="text-center">📝 Register</h3>
                <form onSubmit={handleRegister}>
                    <div className="mb-3">
                        <label>Username</label>
                        <input 
                            name="username"
                            className="form-control" 
                            onChange={handleChange} 
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label>Email</label>
                        <input 
                            name="email"
                            type="email" 
                            className="form-control" 
                            onChange={handleChange} 
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label>Password</label>
                        <input 
                            name="password"
                            type="password" 
                            className="form-control" 
                            onChange={handleChange} 
                            required
                        />
                    </div>
                    <button className="btn btn-primary w-100">Sign Up</button>
                </form>
            </div>
        </div>
    );
};

export default Register;