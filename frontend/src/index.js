import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/main.css'; // Your custom CSS
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);