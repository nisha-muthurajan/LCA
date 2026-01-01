import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService'; // Import the service

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Service handles the API call AND saving the token
            await login(username, password);
            
            alert("Login Successful!");
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
            alert("Invalid Credentials");
        }
    };

    return (
        <div className="container mt-5 col-md-4">
            <div className="card p-4">
                <h3 className="text-center">🔐 User Login</h3>
                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label>Username</label>
                        <input 
                            className="form-control" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)} 
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label>Password</label>
                        <input 
                            type="password" 
                            className="form-control" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)} 
                            required
                        />
                    </div>
                    <button className="btn btn-success w-100">Login</button>
                </form>
            </div>
        </div>
    );
};

export default Login;