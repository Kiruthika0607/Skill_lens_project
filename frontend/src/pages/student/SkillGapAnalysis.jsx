import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { GitPullRequest, CheckCircle2, AlertTriangle, AlertCircle, ArrowRight, BookOpen, Layers } from 'lucide-react';
import { ProgressBar } from '../../components/common/UIComponents';

const SkillGapAnalysis = () => {
  const [gapData, setGapData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGapAnalysis();
  }, []);

  const fetchGapAnalysis = async () => {
    try {
      setLoading(true);
      const res = await api.get('/skill-gap');
      if (res.data.success) {
        setGapData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching skill gap:', err);
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

  const {
    targetOccupationTitle,
    careerReadinessScore = 0,
    careerMatchScore = 0,
    currentSkills = [],
    matchedSkills = [],
    missingSkills = [],
    highPrioritySkills = [],
    mediumPrioritySkills = [],
    lowPrioritySkills = [],
  } = gapData || {};

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <span className="badge badge-primary">Target Occupation</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>
          Skill Gap Matrix: {targetOccupationTitle}
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Detailed comparison of your current skills against industry requisites with explainable priority classifications.
        </p>
      </div>

      {/* Metrics Banner */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(17, 24, 39, 1) 100%)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>
            Core Career Readiness Score
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--success)', margin: '0.5rem 0' }}>
            {careerReadinessScore}%
          </div>
          <ProgressBar percentage={careerReadinessScore} height={8} color="success" />
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
            Calculated strictly on mandatory prerequisite skills required for this occupation.
          </p>
        </div>

        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(17, 24, 39, 1) 100%)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>
            Overall Weighted Match Score
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#818cf8', margin: '0.5rem 0' }}>
            {careerMatchScore}%
          </div>
          <ProgressBar percentage={careerMatchScore} height={8} color="primary" />
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
            Incorporates both mandatory core skills (weight 2.0) and elective industry skills (weight 1.0).
          </p>
        </div>
      </div>

      {/* Skills Breakdown Grid */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        {/* Matched Skills */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ color: 'var(--success)' }}>
              <CheckCircle2 size={20} /> Matched Skills ({matchedSkills.length})
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Prerequisites you already possess in your verified portfolio.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {matchedSkills.length > 0 ? (
              matchedSkills.map((s, idx) => (
                <span key={idx} className="badge badge-success" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}>
                  <CheckCircle2 size={13} /> {s}
                </span>
              ))
            ) : (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No skills currently overlap with this role.</span>
            )}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ color: 'var(--danger)' }}>
              <AlertCircle size={20} /> Total Missing Skills ({missingSkills.length})
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Skills required by employers that are absent from your profile.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {missingSkills.length > 0 ? (
              missingSkills.map((s, idx) => (
                <span key={idx} className="badge badge-danger" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}>
                  <AlertCircle size={13} /> {s}
                </span>
              ))
            ) : (
              <span style={{ color: 'var(--success)', fontSize: '0.85rem' }}>You meet all requirements!</span>
            )}
          </div>
        </div>
      </div>

      {/* Prioritized Action Plan */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <GitPullRequest size={20} color="var(--accent-primary)" />
            Prioritized Skill Acquisition Hierarchy
          </h3>
          <Link to="/student/roadmap" className="btn btn-primary btn-sm">
            Launch Learning Roadmap <ArrowRight size={15} />
          </Link>
        </div>

        {/* High Priority */}
        {highPrioritySkills.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span className="badge badge-danger" style={{ padding: '0.35rem 0.85rem' }}>
                <AlertTriangle size={13} /> HIGH PRIORITY GAPS ({highPrioritySkills.length})
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Mandatory core prerequisites with high employer market demand
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {highPrioritySkills.map((gap) => (
                <div key={gap.skillId} style={{
                  padding: '1rem 1.25rem',
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: '800', fontSize: '1rem' }}>{gap.skillName}</span>
                      <span className="badge badge-primary">{gap.categoryName}</span>
                      <span className="badge badge-danger">{gap.demandLevel} DEMAND</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                      {gap.reason}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link to="/student/courses" className="btn btn-secondary btn-sm">
                      <BookOpen size={14} /> Courses
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Medium Priority */}
        {mediumPrioritySkills.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span className="badge badge-warning" style={{ padding: '0.35rem 0.85rem' }}>
                MEDIUM PRIORITY GAPS ({mediumPrioritySkills.length})
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Significant technical electives that boost hireability
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {mediumPrioritySkills.map((gap) => (
                <div key={gap.skillId} style={{
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{gap.skillName}</span>
                      <span className="badge badge-primary">{gap.categoryName}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                      {gap.reason}
                    </p>
                  </div>
                  <Link to="/student/projects" className="btn btn-secondary btn-sm">
                    View Projects
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Low Priority */}
        {lowPrioritySkills.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span className="badge badge-primary" style={{ padding: '0.35rem 0.85rem' }}>
                LOW PRIORITY ELECTIVES ({lowPrioritySkills.length})
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Optional specialized tools
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {lowPrioritySkills.map((gap) => (
                <div key={gap.skillId} style={{
                  padding: '0.85rem 1.25rem',
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ fontWeight: '700' }}>{gap.skillName}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.75rem' }}>
                      {gap.categoryName}
                    </span>
                  </div>
                  <span className="badge badge-primary">{gap.demandLevel}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillGapAnalysis;
