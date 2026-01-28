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
  
  // Get form data - try multiple sources
  const originalFormData = location.state?.formData || JSON.parse(localStorage.getItem('lastFormData') || '{}');

  // Build complete project data for reports
  const getProjectData = () => {
    return {
      name: originalFormData.name || data.name || 'LCA Assessment Report',
      industry_type: originalFormData.industry_type || data.industry_type || 'Mining',
      energy_consumption: originalFormData.energy_consumption || data.energy_consumption || 0,
      water_usage: originalFormData.water_usage || data.water_usage || 0,
      raw_material_qty: originalFormData.raw_material_qty || data.raw_material_qty || 0,
      waste_generated: originalFormData.waste_generated || data.waste_generated || 0,
      co2_emission: originalFormData.co2_emission || carbonValue || 0,
      date: new Date().toISOString().split('T')[0]
    };
  };

  // Build complete results data for reports
  const getResultsData = () => {
    return {
      carbon_footprint: carbonValue,
      circularity_score: circularityValue,
      recommendations: recommendations.map(rec => 
        typeof rec === 'object' ? (rec.recommendation || rec.label || JSON.stringify(rec)) : rec
      )
    };
  };

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
        const projectData = getProjectData();
        const resultsData = getResultsData();
        
        console.log('Sending PDF request with:', { project_data: projectData, results: resultsData });
        
        const response = await axios.post(
            'http://localhost:8000/api/projects/report/pdf/', 
            { project_data: projectData, results: resultsData }, 
            { responseType: 'blob' }
        );
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'LCA_Report.pdf');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error downloading PDF", error);
        alert("Failed to download PDF. Please ensure an assessment has been run first.");
    }
  };

  // Excel Download Handler
  const downloadExcel = async () => {
    try {
        const projectData = getProjectData();
        const resultsData = getResultsData();
        
        console.log('Sending Excel request with:', { project_data: projectData, results: resultsData });
        
        const response = await axios.post(
            'http://localhost:8000/api/projects/report/excel/', 
            { project_data: projectData, results: resultsData }, 
            { responseType: 'blob' }
        );
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'LCA_Report.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error downloading Excel", error);
        alert("Failed to download Excel file. Please ensure an assessment has been run first.");
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
          <div className="d-flex flex-column gap-3">
            {recommendations.map((rec, idx) => {
              // Parse the recommendation object or string
              const recData = typeof rec === 'object' ? rec : { recommendation: rec };
              const details = recData.details || {};
              const featureAnalysis = details.feature_analysis || [];
              const alternatives = details.alternatives || [];
              const modelProbabilities = details.model_probabilities || {};
              
              return (
                <div key={idx} className="p-4" 
                     style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '16px', color: '#fff' }}>
                  
                  {/* Header with AI Label */}
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <span style={{ 
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                      color: '#fff', 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: '700',
                      flexShrink: 0
                    }}>
                      {idx + 1}
                    </span>
                    <div>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.6)' }}>
                        AI Recommendation
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: '700' }}>
                        {recData.label || details.primary_recommendation || 'Process Optimization'}
                      </div>
                    </div>
                    {recData.confidence && (
                      <div style={{ marginLeft: 'auto', background: 'rgba(16,185,129,0.2)', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
                        {Math.round(recData.confidence * 100)}% Confidence
                      </div>
                    )}
                  </div>

                  {/* Overall Assessment */}
                  {details.overall_status && (
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px' }}>
                      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginBottom: '4px' }}>Overall Assessment</div>
                      <div style={{ fontWeight: '600' }}>
                        {details.overall_status} · Score: {details.sustainability_score}
                      </div>
                    </div>
                  )}

                  {/* Feature Analysis - SHAP Based */}
                  {featureAnalysis.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: 'rgba(255,255,255,0.8)' }}>
                        🔬 AI Feature Impact Analysis
                      </div>
                      <div className="d-flex flex-column gap-2">
                        {featureAnalysis.slice(0, 4).map((feature, fIdx) => (
                          <div key={fIdx} style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 14px', borderRadius: '8px' }}>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <span style={{ fontWeight: '500', fontSize: '14px' }}>{feature.feature}</span>
                              <span style={{ 
                                fontSize: '12px', 
                                fontWeight: '600',
                                color: feature.direction === 'increases' ? '#f97316' : '#10b981'
                              }}>
                                {feature.direction === 'increases' ? '↑' : '↓'} {feature.importance}% impact
                              </span>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                              <div style={{ 
                                width: `${Math.min(feature.importance * 2, 100)}%`, 
                                height: '100%', 
                                background: feature.direction === 'increases' ? 'linear-gradient(90deg, #f97316, #fb923c)' : 'linear-gradient(90deg, #10b981, #34d399)',
                                borderRadius: '4px'
                              }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Model Probabilities */}
                  {Object.keys(modelProbabilities).length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: 'rgba(255,255,255,0.8)' }}>
                        📊 Model Class Probabilities
                      </div>
                      <div className="d-flex flex-wrap gap-2">
                        {Object.entries(modelProbabilities).slice(0, 4).map(([cls, prob], pIdx) => (
                          <div key={pIdx} style={{ 
                            background: pIdx === 0 ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)', 
                            padding: '8px 14px', 
                            borderRadius: '8px',
                            fontSize: '13px'
                          }}>
                            <span style={{ textTransform: 'capitalize' }}>{cls.replace(/_/g, ' ')}</span>
                            <span style={{ fontWeight: '700', marginLeft: '8px' }}>{prob}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Alternative Suggestions */}
                  {alternatives.length > 0 && (
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: 'rgba(255,255,255,0.8)' }}>
                        💡 Alternative AI Suggestions
                      </div>
                      <div className="d-flex flex-wrap gap-2">
                        {alternatives.map((alt, aIdx) => (
                          <span key={aIdx} style={{ 
                            background: 'rgba(99,102,241,0.2)', 
                            padding: '6px 12px', 
                            borderRadius: '6px', 
                            fontSize: '13px' 
                          }}>
                            {alt.label} ({alt.probability})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fallback for simple text recommendations */}
                  {!details.overall_status && !featureAnalysis.length && (
                    <div style={{ color: 'rgba(255,255,255,0.9)', lineHeight: '1.6' }}>
                      {recData.recommendation || rec}
                    </div>
                  )}
                </div>
              );
            })}
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