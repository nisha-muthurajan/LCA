import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CreateProject from './pages/CreateProject';
import Dashboard from './pages/Dashboard';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap is installed

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create-project" element={<CreateProject />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;