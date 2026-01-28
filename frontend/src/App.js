import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar'; // Import Sidebar
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateProject from './pages/CreateProject';
import Dashboard from './pages/Dashboard';
import Recommendations from './pages/Recommendations';
import CompareIndustries from './pages/CompareIndustries';
import AdminPanel from './pages/AdminPanel';
import Reports from './pages/Reports';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/main.css';

function App() {
  return (
    <Router>
      <Navbar />
      
      {/* Main Layout Container */}
      <div className="app-shell">
        
        {/* Sidebar */}
        <Sidebar />

        {/* Content Area */}
        <main className="app-main" role="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/create-project" element={<CreateProject />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/compare" element={<CompareIndustries />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/admin-panel" element={<AdminPanel />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;