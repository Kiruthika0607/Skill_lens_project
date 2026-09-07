import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { TrendingUp, BarChart2, Compass, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { ProgressBar } from '../../components/common/UIComponents';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TechnologyTrends = () => {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    try {
      setLoading(true);
      const res = await api.get('/trends?limit=15');
      if (res.data.success) {
        setTrends(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching trends:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  // Handle insufficient data per user requirement
  if (trends.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
        <AlertCircle size={48} color="var(--warning)" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Insufficient Data</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0.5rem auto' }}>
          Insufficient job postings have been ingested to establish statistically sound technology demand trends.
        </p>
      </div>
    );
  }

  const chartData = {
    labels: trends.map(t => t.skillName),
    datasets: [
      {
        label: 'Market Demand (% of Job Postings)',
        data: trends.map(t => Number(t.demandPercentage)),
        backgroundColor: 'rgba(99, 102, 241, 0.85)',
        borderColor: '#6366f1',
        borderWidth: 1,
        borderRadius: 6,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#94a3b8',
          font: { family: 'Plus Jakarta Sans', size: 12 }
        }
      },
      tooltip: {
        backgroundColor: '#111827',
        titleColor: '#f8fafc',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context) => ` Demand: ${context.parsed.y}% of analyzed job postings`
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans' } },
        grid: { color: 'rgba(255, 255, 255, 0.04)' }
      },
      y: {
        ticks: { color: '#94a3b8', callback: (value) => `${value}%` },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        max: 100,
        min: 0,
      }
    }
  };

  const growing = trends.filter(t => t.trendDirection === 'GROWING');
  const emerging = trends.filter(t => t.trendDirection === 'EMERGING');

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Industry Technology Demand & Trends</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Calculated strictly from active job postings in MySQL. Zero fabricated or artificial estimates.
        </p>
      </div>

      {/* Primary Demand Chart */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">
            <BarChart2 size={20} color="var(--accent-primary)" />
            Top Demanded Skills Across Engineering Job Postings
          </h3>
          <span className="badge badge-primary">Dynamic Aggregation</span>
        </div>
        <div style={{ height: '360px', width: '100%' }}>
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Trajectory Breakdown Grid */}
      <div className="grid-2">
        {/* Growing Technologies */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ color: 'var(--success)' }}>
              <ArrowUpRight size={20} /> High-Demand Foundation Skills
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Consistently required in &gt; 50% of software and data engineering job listings.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {growing.map(t => (
              <div key={t.skillId} style={{
                padding: '0.85rem 1rem',
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: '700' }}>{t.skillName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.categoryName}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-success">
                    {t.demandPercentage}% Demand
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emerging Technologies */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ color: 'var(--accent-secondary)' }}>
              <TrendingUp size={20} /> Emerging High-Growth Skills
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Accelerating hiring signals in modern infrastructure and scalable application teams.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {emerging.map(t => (
              <div key={t.skillId} style={{
                padding: '0.85rem 1rem',
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: '700' }}>{t.skillName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.categoryName}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-info">
                    {t.demandPercentage}% Demand
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnologyTrends;
