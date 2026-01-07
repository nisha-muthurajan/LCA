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
  const safeCarbon = Number.isFinite(carbonValue) ? carbonValue : 0;
  const safeCircularity = Number.isFinite(circularityValue) ? circularityValue : 0;
  const recommendations = result.results?.recommendations || result.recommendations || [];

  // If page was opened directly, try to hydrate from localStorage once
  useEffect(() => {
    if (!location.state?.result && !result.results) {
      const cached = localStorage.getItem('lastResult');
      if (cached) setResult(JSON.parse(cached));
    }
  }, [location.state, result.results]);
  const originalFormData = location.state?.formData || {}; // You might need to pass formData from CreateProject

  // Use dual y-axes so a tiny circularity bar is still visible alongside large carbon values
  const chartData = {
    labels: ['Carbon Footprint', 'Circularity Score'],
    datasets: [
      {
        label: 'Carbon Footprint (kg CO2e)',
        data: [safeCarbon, null],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        yAxisID: 'y',
      },
      {
        label: 'Circularity Score (/100)',
        data: [null, safeCircularity],
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        yAxisID: 'y1',
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
    <div className="container">
      <div className="page-header">
        <div>
          <h2 className="page-title h4">Dashboard</h2>
          <p className="page-subtitle">Summary of the latest assessment results.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
            <button onClick={downloadPDF} className="btn btn-outline-danger">Download PDF</button>
            <button onClick={downloadExcel} className="btn btn-success">Download Excel</button>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="card p-3">
            <div className="text-muted">Carbon footprint</div>
            <div className="d-flex align-items-end gap-2">
              <div className="h2 mb-0 text-danger metric-value">{carbonValue}</div>
              <div className="text-muted">kg CO₂e</div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card p-3">
            <div className="text-muted">Circularity score</div>
            <div className="d-flex align-items-end gap-2">
              <div className="h2 mb-0 text-success metric-value">{circularityValue}</div>
              <div className="text-muted">/ 100</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-3 mt-4" style={{ height: '360px' }}>
         <Bar 
           data={chartData} 
           options={{ 
             maintainAspectRatio: false,
             scales: {
               y: {
                 beginAtZero: true,
                 title: { display: true, text: 'kg CO2e' }
               },
               y1: {
                 beginAtZero: true,
                 position: 'right',
                 min: 0,
                 max: 100,
                 title: { display: true, text: 'Circularity (/100)' },
                 grid: { drawOnChartArea: false }
               }
             },
             plugins: {
               legend: { position: 'bottom' }
             }
           }} 
         />
      </div>

      <div className="alert alert-info mt-4">
        <strong>AI recommendations</strong>
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