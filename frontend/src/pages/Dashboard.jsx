import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import axios from 'axios'; // Import axios

const Dashboard = () => {
  const location = useLocation();
  const [result, setResult] = useState(() => {
    if (location.state?.result) return location.state.result;
    const cached = localStorage.getItem('lastResult');
    return cached ? JSON.parse(cached) : {};
  });

  const data = result.results || result || { carbon_footprint: 0, circularity_score: 0 };
  const carbonValue = Number(
    data.carbon_footprint ?? data.carbon ?? data.total_carbon ?? 0
  );
  const circularityValue = Number(
    data.circularity_score ?? data.circularity ?? data.avg_circularity ?? 0
  );
  const recommendations = result.results?.recommendations || result.recommendations || [];

  // If page was opened directly, try to hydrate from localStorage once
  useEffect(() => {
    if (!location.state?.result && !result.results) {
      const cached = localStorage.getItem('lastResult');
      if (cached) setResult(JSON.parse(cached));
    }
  }, [location.state, result.results]);
  const originalFormData = location.state?.formData || {}; // You might need to pass formData from CreateProject

  const chartData = {
    labels: ['Carbon Footprint', 'Circularity Score'],
    datasets: [
      {
        label: 'Impact Analysis',
        data: [carbonValue, circularityValue],
        backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(75, 192, 192, 0.6)'],
      },
    ],
  };

  // PDF Download Handler
  const downloadPDF = async () => {
    try {
        const response = await axios.post(
            'http://localhost:8000/api/projects/report/pdf/', 
            { project_data: originalFormData, results: data }, 
            { responseType: 'blob' }
        );
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'LCA_Report.pdf');
        document.body.appendChild(link);
        link.click();
    } catch (error) {
        console.error("Error downloading PDF", error);
        alert("Failed to download PDF");
    }
  };

  // ✅ New Excel Download Handler
  const downloadExcel = async () => {
    try {
        const response = await axios.post(
            'http://localhost:8000/api/projects/report/excel/', 
            { project_data: originalFormData, results: data }, 
            { responseType: 'blob' } // Important: treat response as binary file
        );
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'LCA_Report.xlsx'); // Excel extension
        document.body.appendChild(link);
        link.click();
    } catch (error) {
        console.error("Error downloading Excel", error);
        alert("Failed to download Excel file");
    }
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>📊 Sustainability Dashboard</h2>
        <div>
            <button onClick={downloadPDF} className="btn btn-danger me-2">Download PDF 📄</button>
            <button onClick={downloadExcel} className="btn btn-success">Download Excel 📊</button>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="card p-3">
            <h4>Carbon Footprint</h4>
            <h1 className="text-danger">{data.carbon_footprint} <span className="fs-6">kg CO2e</span></h1>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card p-3">
            <h4>Circularity Score</h4>
            <h1 className="text-success">{data.circularity_score} <span className="fs-6">/ 100</span></h1>
          </div>
        </div>
      </div>

      <div className="mt-4" style={{ height: '300px' }}>
         <Bar data={chartData} options={{ maintainAspectRatio: false }} />
      </div>

      <div className="alert alert-info mt-4">
        <strong>🤖 AI Recommendations:</strong>
        {Array.isArray(recommendations) && recommendations.length > 0 ? (
          <ul className="mb-0 mt-2">
            {recommendations.map((rec, idx) => (
              <li key={idx}>{rec.recommendation || rec}</li>
            ))}
          </ul>
        ) : (
          <span className="ms-2">{data.recommendation || 'No recommendations available yet.'}</span>
        )}
      </div>
    </div>
  );
};

export default Dashboard;