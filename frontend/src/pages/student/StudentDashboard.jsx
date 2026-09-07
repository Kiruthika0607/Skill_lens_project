import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import DashboardCard from '../../components/common/DashboardCard';
import { ProgressBar, EmptyState } from '../../components/common/UIComponents';
import {
  Award,
  Layers,
  GitPullRequest,
  Briefcase,
  TrendingUp,
  ArrowRight,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [gapAnalysis, setGapAnalysis] = useState(null);
  const [recommendedCareers, setRecommendedCareers] = useState([]);
  const [trends, setTrends] = useState([]);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [profRes, gapRes, recRes, trendRes, roadRes] = await Promise.all([
        api.get('/student/profile'),
        api.get('/skill-gap'),
        api.get('/careers/recommended'),
        api.get('/trends?limit=5'),
        api.get('/roadmap'),
      ]);

      if (profRes.data.success) setProfile(profRes.data.data);
      if (gapRes.data.success) setGapAnalysis(gapRes.data.data);
      if (recRes.data.success) setRecommendedCareers(recRes.data.data);
      if (trendRes.data.success) setTrends(trendRes.data.data);
      if (roadRes.data.success) setRoadmap(roadRes.data.data);
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
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

  const readinessScore = gapAnalysis?.careerReadinessScore || 0;
  const matchScore = gapAnalysis?.careerMatchScore || 0;
  const currentSkillsCount = profile?.skills?.length || 0;
  const missingSkillsCount = gapAnalysis?.missingSkillCount || 0;
  const targetTitle = profile?.targetOccupationTitle || 'Full Stack Developer';

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span className="badge badge-primary">Target Career: {targetTitle}</span>
            <span className="badge badge-info">{profile?.college}</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>
            Welcome back, {profile?.fullName || user?.fullName}
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.35rem', maxWidth: '650px' }}>
            Your career readiness score is calculated from deterministic skill weighting against verified industry requisites.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/student/skills" className="btn btn-secondary btn-sm">
            <Layers size={15} /> Update Skills
          </Link>
          <Link to="/student/skill-gap" className="btn btn-primary btn-sm">
            View Skill Gap <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <DashboardCard
          title="Career Readiness"
          value={`${readinessScore}%`}
          subtitle="Required core skills readiness"
          icon={Award}
          color="var(--success)"
          badgeText="Weighted Score"
        />
        <DashboardCard
          title="Overall Skill Match"
          value={`${matchScore}%`}
          subtitle="Match against target career"
          icon={Compass}
          color="var(--accent-primary)"
          badgeText="All Skills"
        />
        <DashboardCard
          title="Verified Skills"
          value={currentSkillsCount}
          subtitle="In your technical profile"
          icon={Layers}
          color="var(--accent-secondary)"
          badgeText="Active"
        />
        <DashboardCard
          title="Identified Skill Gaps"
          value={missingSkillsCount}
          subtitle="Missing for target career"
          icon={GitPullRequest}
          color="var(--danger)"
          badgeText="Priority Gaps"
        />
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        {/* Left Column: Skill Gap Breakdown */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <GitPullRequest size={18} color="var(--danger)" />
              Priority Skill Gaps for {targetTitle}
            </h3>
            <Link to="/student/skill-gap" className="btn btn-secondary btn-sm">
              Full Matrix
            </Link>
          </div>

          {gapAnalysis?.highPrioritySkills?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {gapAnalysis.highPrioritySkills.slice(0, 4).map((gap) => (
                <div key={gap.skillId} style={{
                  padding: '1rem',
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{gap.skillName}</span>
                      <span className="badge badge-danger">HIGH PRIORITY</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      {gap.reason}
                    </p>
                  </div>
                  <Link to="/student/courses" className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }}>
                    Learn
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={36} color="var(--success)" style={{ margin: '0 auto 0.75rem' }} />
              <div style={{ fontWeight: '700' }}>No Critical Skill Gaps!</div>
              <p style={{ fontSize: '0.85rem' }}>You meet the core prerequisite skills for this occupation.</p>
            </div>
          )}
        </div>

        {/* Right Column: Automated Learning Roadmap Progress */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <TrendingUp size={18} color="var(--accent-primary)" />
              Automated Learning Roadmap
            </h3>
            <Link to="/student/roadmap" className="btn btn-secondary btn-sm">
              View Roadmap
            </Link>
          </div>

          {roadmap && (
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Overall Roadmap Completion</span>
                  <span style={{ fontWeight: '700', color: '#818cf8' }}>{roadmap.overallProgress}%</span>
                </div>
                <ProgressBar percentage={Number(roadmap.overallProgress)} height={10} color="primary" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {roadmap.items?.slice(0, 4).map((item) => (
                  <div key={item.id} style={{
                    padding: '0.85rem 1rem',
                    background: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: '600' }}>
                        {item.phaseName}
                      </div>
                      <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{item.skillName}</div>
                    </div>
                    <span className={`badge ${
                      item.status === 'COMPLETED' ? 'badge-success' :
                      item.status === 'IN_PROGRESS' ? 'badge-warning' : 'badge-primary'
                    }`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recommended Careers & Live Industry Trends */}
      <div className="grid-2">
        {/* Recommended Careers */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Award size={18} color="var(--warning)" />
              Top Career Recommendations
            </h3>
            <Link to="/student/recommendations" className="btn btn-secondary btn-sm">
              All Careers
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {recommendedCareers.map((car) => (
              <div key={car.occupationId} style={{
                padding: '1rem',
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: '700', fontSize: '1rem' }}>{car.occupationTitle}</div>
                  <span className="badge badge-success">{car.matchPercentage}% Match</span>
                </div>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  {car.description}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {car.matchedSkills?.slice(0, 3).map((s, idx) => (
                    <span key={idx} className="badge badge-primary">{s}</span>
                  ))}
                  {car.missingSkills?.length > 0 && (
                    <span className="badge badge-warning">+{car.missingSkills.length} skills to learn</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Industry Trends */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <TrendingUp size={18} color="var(--accent-secondary)" />
              Verified In-Demand Skills
            </h3>
            <Link to="/student/trends" className="btn btn-secondary btn-sm">
              Explore Trends
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {trends.map((trend) => (
              <div key={trend.skillId} style={{
                padding: '0.85rem 1rem',
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{trend.skillName}</span>
                  <span style={{ fontWeight: '700', color: '#818cf8', fontSize: '0.85rem' }}>
                    {trend.demandPercentage}% of Jobs
                  </span>
                </div>
                <ProgressBar percentage={Number(trend.demandPercentage)} height={6} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
