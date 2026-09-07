import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Compass, CheckCircle2, AlertCircle, ArrowRight, DollarSign, Activity, Star } from 'lucide-react';
import { Modal, ProgressBar } from '../../components/common/UIComponents';

const CareerExplorer = () => {
  const [occupations, setOccupations] = useState([]);
  const [selectedOccupation, setSelectedOccupation] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchOccupations();
  }, []);

  const fetchOccupations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/occupations');
      if (res.data.success) {
        setOccupations(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching occupations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInspect = async (occ) => {
    setSelectedOccupation(occ);
    setModalOpen(true);
    setCalculating(true);
    try {
      const res = await api.get(`/careers/${occ.id}/match`);
      if (res.data.success) {
        setMatchData(res.data.data);
      }
    } catch (err) {
      console.error('Error calculating career match:', err);
    } finally {
      setCalculating(false);
    }
  };

  const handleSetTarget = async (occId) => {
    try {
      await api.put('/student/profile', { targetOccupationId: occId });
      setModalOpen(false);
      navigate('/student/dashboard');
    } catch (err) {
      console.error('Error setting target career:', err);
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
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Career Explorer & Match Analyzer</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Explore key engineering pathways and analyze your personal skill match against industry standards.
        </p>
      </div>

      <div className="grid-3">
        {occupations.map((occ) => (
          <div key={occ.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span className={`badge ${
                occ.industryDemand === 'CRITICAL' ? 'badge-danger' :
                occ.industryDemand === 'HIGH' ? 'badge-warning' : 'badge-primary'
              }`}>
                <Activity size={12} /> {occ.industryDemand} DEMAND
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {occ.careerLevel.replace('_', ' ')}
              </span>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              {occ.title}
            </h3>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', flex: 1, marginBottom: '1.25rem' }}>
              {occ.description}
            </p>

            <div style={{
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Salary Range:</span>
                <span style={{ fontWeight: '600', color: '#38bdf8' }}>{occ.averageSalary}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Skill Requirements:</span>
                <span style={{ fontWeight: '600' }}>
                  {occ.requiredSkillCount} Core · {occ.optionalSkillCount} Elective
                </span>
              </div>
            </div>

            <button
              onClick={() => handleInspect(occ)}
              className="btn btn-primary btn-sm"
              style={{ width: '100%' }}
            >
              Analyze Skill Match <ArrowRight size={15} />
            </button>
          </div>
        ))}
      </div>

      {/* Match Detail Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedOccupation ? `Career Match: ${selectedOccupation.title}` : 'Career Match'}
        footer={
          selectedOccupation && (
            <>
              <button onClick={() => setModalOpen(false)} className="btn btn-secondary btn-sm">
                Close
              </button>
              <button
                onClick={() => handleSetTarget(selectedOccupation.id)}
                className="btn btn-primary btn-sm"
              >
                <Star size={15} /> Set as My Target Career
              </button>
            </>
          )
        }
      >
        {calculating ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="loading-spinner" />
            <div style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Calculating weighted skill match & gap analysis...
            </div>
          </div>
        ) : matchData ? (
          <div>
            {/* Score Badges */}
            <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
              <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Weighted Match</div>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: '#818cf8', margin: '0.25rem 0' }}>
                  {matchData.matchPercentage}%
                </div>
                <ProgressBar percentage={matchData.matchPercentage} height={6} />
              </div>

              <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Readiness Score</div>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--success)', margin: '0.25rem 0' }}>
                  {matchData.readinessScore}%
                </div>
                <ProgressBar percentage={matchData.readinessScore} height={6} color="success" />
              </div>
            </div>

            {/* Matched Skills */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '700', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success)' }}>
                <CheckCircle2 size={16} /> Skills You Already Possess ({matchData.matchedSkills?.length || 0})
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {matchData.matchedSkills?.length > 0 ? (
                  matchData.matchedSkills.map((s, idx) => (
                    <span key={idx} className="badge badge-success">{s}</span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None yet</span>
                )}
              </div>
            </div>

            {/* Missing Skills */}
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '700', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--danger)' }}>
                <AlertCircle size={16} /> Missing Skills to Acquire ({matchData.missingSkills?.length || 0})
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {matchData.missingSkills?.length > 0 ? (
                  matchData.missingSkills.map((s, idx) => (
                    <span key={idx} className="badge badge-danger">{s}</span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>All prerequisites fulfilled!</span>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default CareerExplorer;
