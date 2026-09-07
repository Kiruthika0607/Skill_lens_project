import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Award, CheckCircle2, AlertCircle, ArrowRight, Star, Sparkles, Activity } from 'lucide-react';
import { ProgressBar } from '../../components/common/UIComponents';

const CareerRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settingTarget, setSettingTarget] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/careers/recommended');
      if (res.data.success) {
        setRecommendations(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching career recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTarget = async (occupationId) => {
    setSettingTarget(occupationId);
    try {
      await api.put('/student/profile', { targetOccupationId: occupationId });
      navigate('/student/dashboard');
    } catch (err) {
      console.error('Error setting target occupation:', err);
    } finally {
      setSettingTarget(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <span className="badge badge-primary">
            <Sparkles size={12} /> Deterministic Recommendation Engine
          </span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Top Recommended Careers</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Personalized career suggestions generated from your verified skill profile, stated interests, and current hiring velocity.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {recommendations.map((car, index) => (
          <div key={car.occupationId} className="card" style={{
            border: index === 0 ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid var(--border-card)',
            background: index === 0 ? 'linear-gradient(180deg, rgba(99, 102, 241, 0.08) 0%, rgba(17, 24, 39, 1) 100%)' : 'var(--bg-card)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                  <span className="badge badge-primary" style={{ fontWeight: '800' }}>
                    #{index + 1} TOP RECOMMENDATION
                  </span>
                  <span className="badge badge-warning">
                    <Activity size={12} /> {car.industryDemand} DEMAND
                  </span>
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{car.occupationTitle}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '650px', marginTop: '0.25rem' }}>
                  {car.description}
                </p>
              </div>

              <div style={{ textAlign: 'right', minWidth: '130px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Weighted Match</div>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: '#818cf8' }}>
                  {car.matchPercentage}%
                </div>
                <div style={{ width: '120px', marginTop: '0.25rem' }}>
                  <ProgressBar percentage={car.matchPercentage} height={6} />
                </div>
              </div>
            </div>

            {/* Existing Skills vs Missing Skills */}
            <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
              <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--success)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CheckCircle2 size={15} /> Your Existing Skills ({car.matchedSkills?.length || 0})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {car.matchedSkills?.length > 0 ? (
                    car.matchedSkills.map((s, idx) => (
                      <span key={idx} className="badge badge-success">{s}</span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None matched yet</span>
                  )}
                </div>
              </div>

              <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--danger)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <AlertCircle size={15} /> Missing Required Skills ({car.missingSkills?.length || 0})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {car.missingSkills?.length > 0 ? (
                    car.missingSkills.map((s, idx) => (
                      <span key={idx} className="badge badge-danger">{s}</span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>All skills fulfilled!</span>
                  )}
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => handleSelectTarget(car.occupationId)}
                className="btn btn-primary"
                disabled={settingTarget === car.occupationId}
              >
                <Star size={16} /> Set as Target Career & Generate Roadmap
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CareerRecommendations;
