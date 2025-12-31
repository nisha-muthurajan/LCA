import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bar } from 'react-chartjs-2'; // Requires: npm install chart.js react-chartjs-2
import 'chart.js/auto'; // Essential for Chart.js 3+

const Dashboard = () => {
  const location = useLocation();
  const data = location.state?.result?.results || { carbon_footprint: 0, circularity_score: 0 };

  const chartData = {
    labels: ['Carbon Footprint', 'Circularity Score'],
    datasets: [
      {
        label: 'Impact Analysis',
        data: [data.carbon_footprint, data.circularity_score],
        backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(75, 192, 192, 0.6)'],
      },
    ],
  };

  return (
    <div className="container mt-5">
      <h2>📊 Sustainability Dashboard</h2>
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
        <strong>🤖 AI Recommendation:</strong> {data.recommendation}
      </div>
    </div>
  );
};

export default Dashboard;