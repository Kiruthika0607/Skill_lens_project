import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Map, CheckCircle2, Clock, Circle, ArrowRight, ExternalLink, Sparkles } from 'lucide-react';
import { ProgressBar } from '../../components/common/UIComponents';

const LearningRoadmap = () => {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      const res = await api.get('/roadmap');
      if (res.data.success) {
        setRoadmap(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching roadmap:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (itemId, currentStatus) => {
    let nextStatus = 'IN_PROGRESS';
    if (currentStatus === 'NOT_STARTED') nextStatus = 'IN_PROGRESS';
    else if (currentStatus === 'IN_PROGRESS') nextStatus = 'COMPLETED';
    else if (currentStatus === 'COMPLETED') nextStatus = 'NOT_STARTED';

    setUpdatingId(itemId);
    try {
      const res = await api.put(`/roadmap/items/${itemId}/status?status=${nextStatus}`);
      if (res.data.success) {
        setRoadmap(res.data.data);
      }
    } catch (err) {
      console.error('Error updating milestone status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  const { occupationTitle = 'Target Career', overallProgress = 0, completedCount = 0, totalCount = 0, items = [] } = roadmap || {};

  // Group items by phase
  const phases = [
    { number: 1, name: 'Phase 1: Engineering Foundations' },
    { number: 2, name: 'Phase 2: Core Architecture & Tools' },
    { number: 3, name: 'Phase 3: Advanced Systems & Integration' },
    { number: 4, name: 'Phase 4: Production & Deployment' },
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <span className="badge badge-primary">
            <Sparkles size={12} /> Automated 4-Phase Roadmap
          </span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>
          {occupationTitle} Career Roadmap
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Sequential milestone curriculum tailored to close your verified skill gaps. Click any badge to update your study progress.
        </p>
      </div>

      {/* Progress Overview Card */}
      <div className="card" style={{ marginBottom: '2.5rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(17, 24, 39, 1) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>
              Overall Roadmap Progress
            </span>
            <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#818cf8', marginTop: '0.25rem' }}>
              {overallProgress}%
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="badge badge-success" style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}>
              {completedCount} of {totalCount} Milestones Completed
            </span>
          </div>
        </div>
        <ProgressBar percentage={Number(overallProgress)} height={10} color="primary" />
      </div>

      {/* 4 Phases Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {phases.map((phase) => {
          const phaseItems = items.filter(i => i.phaseNumber === phase.number);
          if (phaseItems.length === 0) return null;

          return (
            <div key={phase.number} className="card">
              <div className="card-header" style={{ marginBottom: '1.25rem' }}>
                <h3 className="card-title" style={{ fontSize: '1.15rem' }}>
                  <Map size={18} color="var(--accent-primary)" />
                  {phase.name}
                </h3>
                <span className="badge badge-primary">{phaseItems.length} Milestones</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {phaseItems.map((item) => (
                  <div key={item.id} style={{
                    padding: '1rem 1.25rem',
                    background: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ fontWeight: '700', fontSize: '1rem' }}>{item.skillName}</span>
                        <span className="badge badge-primary">{item.categoryName}</span>
                        <span className={`badge ${
                          item.priorityLevel === 'HIGH' ? 'badge-danger' :
                          item.priorityLevel === 'MEDIUM' ? 'badge-warning' : 'badge-primary'
                        }`}>
                          {item.priorityLevel} PRIORITY
                        </span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                        {item.recommendedResource}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <button
                        onClick={() => handleStatusChange(item.id, item.status)}
                        className={`btn btn-sm ${
                          item.status === 'COMPLETED' ? 'btn-primary' :
                          item.status === 'IN_PROGRESS' ? 'btn-secondary' : 'btn-secondary'
                        }`}
                        style={{
                          background: item.status === 'COMPLETED' ? 'var(--success)' :
                                      item.status === 'IN_PROGRESS' ? 'var(--warning-bg)' : 'var(--bg-surface)',
                          borderColor: item.status === 'IN_PROGRESS' ? 'var(--warning)' : 'var(--border-subtle)',
                          color: item.status === 'IN_PROGRESS' ? 'var(--warning)' : '#fff'
                        }}
                        disabled={updatingId === item.id}
                      >
                        {item.status === 'COMPLETED' ? (
                          <><CheckCircle2 size={14} /> COMPLETED</>
                        ) : item.status === 'IN_PROGRESS' ? (
                          <><Clock size={14} /> IN PROGRESS</>
                        ) : (
                          <><Circle size={14} /> NOT STARTED</>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LearningRoadmap;
