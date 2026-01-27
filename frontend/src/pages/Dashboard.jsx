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
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderRadius: 8,
        yAxisID: 'y',
      },
      {
        label: 'Circularity Score (/100)',
        data: [null, safeCircularity],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderRadius: 8,
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
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle">Summary of the latest assessment results.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
            <button onClick={downloadPDF} className="btn btn-outline-danger">
              <span>📄</span> Download PDF
            </button>
            <button onClick={downloadExcel} className="btn btn-success">
              <span>📊</span> Download Excel
            </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="metric-card danger">
            <div className="metric-label">🔥 Carbon Footprint</div>
            <div className="d-flex align-items-baseline">
              <span className="metric-value danger">{carbonValue.toLocaleString()}</span>
              <span className="metric-unit">kg CO₂e</span>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="metric-card success">
            <div className="metric-label">♻️ Circularity Score</div>
            <div className="d-flex align-items-baseline">
              <span className="metric-value success">{circularityValue}</span>
              <span className="metric-unit">/ 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="card p-4 mb-4" style={{ height: '380px' }}>
        <h5 style={{ fontWeight: '700', marginBottom: '20px', fontSize: '1rem' }}>📈 Performance Overview</h5>
         <Bar 
           data={chartData} 
           options={{ 
             maintainAspectRatio: false,
             plugins: {
               legend: { 
                 position: 'bottom',
                 labels: {
                   usePointStyle: true,
                   padding: 20,
                   font: { weight: '600' }
                 }
               }
             },
             scales: {
               x: {
                 grid: { display: false },
                 ticks: { font: { weight: '600' } }
               },
               y: {
                 beginAtZero: true,
                 title: { display: true, text: 'kg CO₂e', font: { weight: '600' } },
                 grid: { color: 'rgba(0,0,0,0.05)' }
               },
               y1: {
                 beginAtZero: true,
                 position: 'right',
                 min: 0,
                 max: 100,
                 title: { display: true, text: 'Score (/100)', font: { weight: '600' } },
                 grid: { drawOnChartArea: false }
               }
             }
           }} 
         />
      </div>

      {/* AI Recommendations */}
      <div className="card p-4">
        <h5 style={{ fontWeight: '700', marginBottom: '16px', fontSize: '1rem' }}>🤖 AI Recommendations</h5>
        {Array.isArray(recommendations) && recommendations.length > 0 ? (
          <div className="d-flex flex-column gap-2">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="d-flex align-items-start gap-3 p-3" 
                   style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ 
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                  color: '#fff', 
                  width: '28px', 
                  height: '28px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '700',
                  flexShrink: 0
                }}>
                  {idx + 1}
                </span>
                <span style={{ color: '#334155', fontWeight: '500' }}>{rec.recommendation || rec}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4" style={{ color: '#64748b' }}>
            <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>💡</span>
            {data.recommendation || 'No recommendations available yet. Run an assessment to get AI insights.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;