import React, { useState } from 'react';
import { Bar, Radar, Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';
import axios from 'axios';

const CompareIndustries = () => {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [industry1Name, setIndustry1Name] = useState('');
  const [industry2Name, setIndustry2Name] = useState('');
  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e, setFile) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setError('');
    }
  };

  const handleCompare = async () => {
    if (!file1 || !file2) {
      setError('Please upload both datasets to compare');
      return;
    }
    if (!industry1Name || !industry2Name) {
      setError('Please enter names for both industries');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file1', file1);
    formData.append('file2', file2);
    formData.append('industry1_name', industry1Name);
    formData.append('industry2_name', industry2Name);

    try {
      const response = await axios.post(
        'http://localhost:8000/api/projects/compare/',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setComparison(response.data);
    } catch (err) {
      console.error('Comparison error:', err);
      setError(err.response?.data?.error || 'Failed to compare datasets. Please check file formats.');
    } finally {
      setLoading(false);
    }
  };

  const resetComparison = () => {
    setFile1(null);
    setFile2(null);
    setIndustry1Name('');
    setIndustry2Name('');
    setComparison(null);
    setError('');
  };

  // Chart configurations
  const getBarChartData = () => {
    if (!comparison) return null;
    const { industry1, industry2 } = comparison;
    
    return {
      labels: ['Carbon Footprint (kg CO₂e)', 'Energy (kWh)', 'Water (L)', 'Circularity Score'],
      datasets: [
        {
          label: industry1.name,
          data: [
            industry1.metrics.carbon_footprint,
            industry1.metrics.energy_consumption / 100,
            industry1.metrics.water_usage / 1000,
            industry1.metrics.circularity_score
          ],
          backgroundColor: 'rgba(239, 68, 68, 0.7)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 2,
          borderRadius: 8,
        },
        {
          label: industry2.name,
          data: [
            industry2.metrics.carbon_footprint,
            industry2.metrics.energy_consumption / 100,
            industry2.metrics.water_usage / 1000,
            industry2.metrics.circularity_score
          ],
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 2,
          borderRadius: 8,
        }
      ]
    };
  };

  const getRadarChartData = () => {
    if (!comparison) return null;
    const { industry1, industry2 } = comparison;
    
    // Normalize values to 0-100 scale for radar chart
    const maxCarbon = Math.max(industry1.metrics.carbon_footprint, industry2.metrics.carbon_footprint);
    const maxEnergy = Math.max(industry1.metrics.energy_consumption, industry2.metrics.energy_consumption);
    const maxWater = Math.max(industry1.metrics.water_usage, industry2.metrics.water_usage);
    const maxMaterial = Math.max(industry1.metrics.raw_material_qty, industry2.metrics.raw_material_qty);
    
    return {
      labels: ['Carbon Efficiency', 'Energy Efficiency', 'Water Efficiency', 'Material Efficiency', 'Circularity'],
      datasets: [
        {
          label: industry1.name,
          data: [
            100 - (industry1.metrics.carbon_footprint / maxCarbon * 100),
            100 - (industry1.metrics.energy_consumption / maxEnergy * 100),
            100 - (industry1.metrics.water_usage / maxWater * 100),
            100 - (industry1.metrics.raw_material_qty / maxMaterial * 100),
            industry1.metrics.circularity_score
          ],
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(239, 68, 68, 1)',
        },
        {
          label: industry2.name,
          data: [
            100 - (industry2.metrics.carbon_footprint / maxCarbon * 100),
            100 - (industry2.metrics.energy_consumption / maxEnergy * 100),
            100 - (industry2.metrics.water_usage / maxWater * 100),
            100 - (industry2.metrics.raw_material_qty / maxMaterial * 100),
            industry2.metrics.circularity_score
          ],
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(16, 185, 129, 1)',
        }
      ]
    };
  };

  const getDifferenceData = () => {
    if (!comparison) return null;
    const diff = comparison.differences;
    
    return {
      labels: ['Carbon', 'Energy', 'Water', 'Material', 'Circularity'],
      datasets: [{
        data: [
          Math.abs(diff.carbon_footprint_diff),
          Math.abs(diff.energy_diff) / 100,
          Math.abs(diff.water_diff) / 1000,
          Math.abs(diff.material_diff) / 10,
          Math.abs(diff.circularity_diff)
        ],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
        ],
        borderWidth: 0,
      }]
    };
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">🔄 Industry Comparison</h2>
          <p className="page-subtitle">Compare environmental impact between two industries</p>
        </div>
        {comparison && (
          <button onClick={resetComparison} className="btn btn-outline-secondary">
            ← New Comparison
          </button>
        )}
      </div>

      {!comparison ? (
        <>
          {/* Upload Section */}
          <div className="row g-4 mb-4">
            {/* Industry 1 Upload */}
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center gap-3 mb-4">
                    <div style={{ 
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '12px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '24px',
                      color: '#fff'
                    }}>
                      🏭
                    </div>
                    <div>
                      <h5 style={{ fontWeight: '700', margin: 0 }}>Industry 1</h5>
                      <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Upload first dataset</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Industry Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g., Coal Mining"
                      value={industry1Name}
                      onChange={(e) => setIndustry1Name(e.target.value)}
                    />
                  </div>

                  <div 
                    className="upload-zone"
                    onClick={() => document.getElementById('file1-input').click()}
                    style={{ 
                      border: file1 ? '2px solid #10b981' : '2px dashed #e2e8f0',
                      background: file1 ? '#f0fdf4' : '#f8fafc'
                    }}
                  >
                    <input 
                      id="file1-input"
                      type="file" 
                      accept=".csv,.xlsx,.xls" 
                      onChange={(e) => handleFileChange(e, setFile1)}
                      style={{ display: 'none' }}
                    />
                    {file1 ? (
                      <div className="text-center">
                        <span style={{ fontSize: '48px' }}>✅</span>
                        <p style={{ fontWeight: '600', color: '#166534', margin: '12px 0 4px' }}>{file1.name}</p>
                        <p style={{ fontSize: '13px', color: '#64748b' }}>Click to change file</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <span style={{ fontSize: '48px' }}>📁</span>
                        <p style={{ fontWeight: '600', margin: '12px 0 4px' }}>Drop CSV/Excel file here</p>
                        <p style={{ fontSize: '13px', color: '#64748b' }}>or click to browse</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Industry 2 Upload */}
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center gap-3 mb-4">
                    <div style={{ 
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '12px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '24px',
                      color: '#fff'
                    }}>
                      🏢
                    </div>
                    <div>
                      <h5 style={{ fontWeight: '700', margin: 0 }}>Industry 2</h5>
                      <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Upload second dataset</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Industry Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g., Solar Energy"
                      value={industry2Name}
                      onChange={(e) => setIndustry2Name(e.target.value)}
                    />
                  </div>

                  <div 
                    className="upload-zone"
                    onClick={() => document.getElementById('file2-input').click()}
                    style={{ 
                      border: file2 ? '2px solid #10b981' : '2px dashed #e2e8f0',
                      background: file2 ? '#f0fdf4' : '#f8fafc'
                    }}
                  >
                    <input 
                      id="file2-input"
                      type="file" 
                      accept=".csv,.xlsx,.xls" 
                      onChange={(e) => handleFileChange(e, setFile2)}
                      style={{ display: 'none' }}
                    />
                    {file2 ? (
                      <div className="text-center">
                        <span style={{ fontSize: '48px' }}>✅</span>
                        <p style={{ fontWeight: '600', color: '#166534', margin: '12px 0 4px' }}>{file2.name}</p>
                        <p style={{ fontSize: '13px', color: '#64748b' }}>Click to change file</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <span style={{ fontSize: '48px' }}>📁</span>
                        <p style={{ fontWeight: '600', margin: '12px 0 4px' }}>Drop CSV/Excel file here</p>
                        <p style={{ fontSize: '13px', color: '#64748b' }}>or click to browse</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger mb-4">
              <strong>⚠️ Error:</strong> {error}
            </div>
          )}

          {/* Compare Button */}
          <div className="text-center">
            <button 
              className="btn btn-success btn-lg px-5"
              onClick={handleCompare}
              disabled={loading || !file1 || !file2}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Analyzing...
                </>
              ) : (
                <>
                  <span>🔍</span> Compare Industries
                </>
              )}
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Comparison Results */}
          
          {/* Summary Cards */}
          <div className="row g-4 mb-4">
            <div className="col-md-4">
              <div className="card h-100" style={{ background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', border: '1px solid #fecaca' }}>
                <div className="card-body p-4 text-center">
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#b91c1c', marginBottom: '8px' }}>
                    🏭 {comparison.industry1.name}
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: '#ef4444' }}>
                    {comparison.industry1.metrics.carbon_footprint.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '13px', color: '#991b1b' }}>kg CO₂e Total</div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '1px solid #bfdbfe' }}>
                <div className="card-body p-4 text-center">
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af', marginBottom: '8px' }}>
                    📊 Difference
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: '#3b82f6' }}>
                    {comparison.differences.carbon_footprint_diff > 0 ? '+' : ''}{comparison.differences.carbon_footprint_diff.toFixed(1)}%
                  </div>
                  <div style={{ fontSize: '13px', color: '#1e40af' }}>Carbon Impact Gap</div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '1px solid #bbf7d0' }}>
                <div className="card-body p-4 text-center">
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#166534', marginBottom: '8px' }}>
                    🏢 {comparison.industry2.name}
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: '#10b981' }}>
                    {comparison.industry2.metrics.carbon_footprint.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '13px', color: '#166534' }}>kg CO₂e Total</div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="row g-4 mb-4">
            {/* Bar Chart */}
            <div className="col-lg-8">
              <div className="card h-100">
                <div className="card-body p-4">
                  <h5 style={{ fontWeight: '700', marginBottom: '20px' }}>📊 Metrics Comparison</h5>
                  <div style={{ height: '350px' }}>
                    <Bar 
                      data={getBarChartData()} 
                      options={{ 
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { 
                            position: 'bottom',
                            labels: { usePointStyle: true, padding: 20, font: { weight: '600' } }
                          }
                        },
                        scales: {
                          x: { grid: { display: false } },
                          y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }
                        }
                      }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Difference Doughnut */}
            <div className="col-lg-4">
              <div className="card h-100">
                <div className="card-body p-4">
                  <h5 style={{ fontWeight: '700', marginBottom: '20px' }}>🎯 Impact Distribution</h5>
                  <div style={{ height: '350px' }}>
                    <Doughnut 
                      data={getDifferenceData()} 
                      options={{ 
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { 
                            position: 'bottom',
                            labels: { usePointStyle: true, padding: 15, font: { size: 11 } }
                          }
                        },
                        cutout: '60%'
                      }} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Radar Chart */}
          <div className="row g-4 mb-4">
            <div className="col-lg-6">
              <div className="card h-100">
                <div className="card-body p-4">
                  <h5 style={{ fontWeight: '700', marginBottom: '20px' }}>🎯 Efficiency Comparison</h5>
                  <div style={{ height: '350px' }}>
                    <Radar 
                      data={getRadarChartData()} 
                      options={{ 
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { 
                            position: 'bottom',
                            labels: { usePointStyle: true, padding: 20 }
                          }
                        },
                        scales: {
                          r: {
                            beginAtZero: true,
                            max: 100,
                            ticks: { stepSize: 20 }
                          }
                        }
                      }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Differences */}
            <div className="col-lg-6">
              <div className="card h-100">
                <div className="card-body p-4">
                  <h5 style={{ fontWeight: '700', marginBottom: '20px' }}>📈 Detailed Differences</h5>
                  <div className="d-flex flex-column gap-3">
                    {[
                      { 
                        label: 'Carbon Footprint', 
                        diff: comparison.differences.carbon_footprint_diff,
                        icon: '🔥',
                        better: comparison.better_performer.carbon
                      },
                      { 
                        label: 'Energy Consumption', 
                        diff: comparison.differences.energy_diff,
                        icon: '⚡',
                        better: comparison.better_performer.energy
                      },
                      { 
                        label: 'Water Usage', 
                        diff: comparison.differences.water_diff,
                        icon: '💧',
                        better: comparison.better_performer.water
                      },
                      { 
                        label: 'Material Efficiency', 
                        diff: comparison.differences.material_diff,
                        icon: '📦',
                        better: comparison.better_performer.material
                      },
                      { 
                        label: 'Circularity Score', 
                        diff: comparison.differences.circularity_diff,
                        icon: '♻️',
                        better: comparison.better_performer.circularity
                      },
                    ].map((item, idx) => (
                      <div key={idx} className="d-flex align-items-center justify-content-between p-3" 
                           style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div className="d-flex align-items-center gap-3">
                          <span style={{ fontSize: '20px' }}>{item.icon}</span>
                          <span style={{ fontWeight: '600' }}>{item.label}</span>
                        </div>
                        <div className="text-end">
                          <div style={{ 
                            fontWeight: '700', 
                            color: item.diff > 0 ? '#ef4444' : '#10b981'
                          }}>
                            {item.diff > 0 ? '+' : ''}{item.diff.toFixed(1)}%
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            Better: <span style={{ fontWeight: '600', color: '#10b981' }}>{item.better}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="card mb-4">
            <div className="card-body p-4">
              <h5 style={{ fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ 
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
                  color: '#fff', 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>🤖</span>
                AI Recommendations for Lower Environmental Impact
              </h5>
              
              <div className="row g-4">
                {/* Industry 1 Suggestions */}
                <div className="col-md-6">
                  <div className="p-4" style={{ 
                    background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', 
                    borderRadius: '16px',
                    border: '1px solid #fecaca'
                  }}>
                    <h6 style={{ fontWeight: '700', color: '#b91c1c', marginBottom: '16px' }}>
                      🏭 {comparison.industry1.name} - Improvements
                    </h6>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {comparison.suggestions.industry1.map((suggestion, idx) => (
                        <li key={idx} style={{ marginBottom: '10px', color: '#7f1d1d', lineHeight: '1.5' }}>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Industry 2 Suggestions */}
                <div className="col-md-6">
                  <div className="p-4" style={{ 
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', 
                    borderRadius: '16px',
                    border: '1px solid #bbf7d0'
                  }}>
                    <h6 style={{ fontWeight: '700', color: '#166534', marginBottom: '16px' }}>
                      🏢 {comparison.industry2.name} - Improvements
                    </h6>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {comparison.suggestions.industry2.map((suggestion, idx) => (
                        <li key={idx} style={{ marginBottom: '10px', color: '#14532d', lineHeight: '1.5' }}>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* General Recommendations */}
              <div className="mt-4 p-4" style={{ 
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', 
                borderRadius: '16px',
                border: '1px solid #bfdbfe'
              }}>
                <h6 style={{ fontWeight: '700', color: '#1e40af', marginBottom: '16px' }}>
                  💡 Key Insights & Actions
                </h6>
                <div className="row">
                  {comparison.suggestions.general.map((insight, idx) => (
                    <div key={idx} className="col-md-6 mb-3">
                      <div className="d-flex align-items-start gap-2">
                        <span style={{ color: '#3b82f6', fontWeight: '700' }}>•</span>
                        <span style={{ color: '#1e3a8a', lineHeight: '1.5' }}>{insight}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Winner Summary */}
          <div className="card" style={{ 
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
            border: 'none',
            color: '#fff'
          }}>
            <div className="card-body p-4">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h5 style={{ fontWeight: '700', marginBottom: '12px' }}>🏆 Overall Environmental Performance</h5>
                  <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '16px' }}>
                    Based on AI analysis of carbon footprint, energy efficiency, water usage, and circularity metrics
                  </p>
                  <div className="d-flex flex-wrap gap-3">
                    <div style={{ background: 'rgba(16,185,129,0.2)', padding: '8px 16px', borderRadius: '20px' }}>
                      <span style={{ color: '#10b981', fontWeight: '700' }}>🥇 Best Overall: {comparison.overall_winner}</span>
                    </div>
                    <div style={{ background: 'rgba(251,191,36,0.2)', padding: '8px 16px', borderRadius: '20px' }}>
                      <span style={{ color: '#fbbf24', fontWeight: '600' }}>
                        {Math.abs(comparison.differences.carbon_footprint_diff).toFixed(1)}% carbon difference
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 text-center mt-3 mt-md-0">
                  <div style={{ fontSize: '64px' }}>🌱</div>
                  <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                    Lower impact = Better for environment
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CompareIndustries;
