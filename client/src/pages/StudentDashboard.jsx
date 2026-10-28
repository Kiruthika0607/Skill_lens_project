import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  CheckSquare, 
  Briefcase, 
  GitCompare, 
  Milestone, 
  Sparkles, 
  Upload, 
  ArrowRight, 
  Calendar, 
  Clock, 
  Award, 
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { SkeletonLoader, StatusBadge, ErrorState, EmptyState } from '../components/UIState';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/student/dashboard');
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load your dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <SkeletonLoader count={4} className="h-32" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <ErrorState title="Dashboard Error" message={error} onRetry={fetchDashboard} />
      </div>
    );
  }

  const {
    profileCompletion = 75,
    topCareer,
    roadmapProgress,
    upcomingDeadlines = [],
    recommendedOpportunities = [],
    recentAssessments = [],
    currentSkills = [],
    skillLevels: rawSkillLevels,
    skillGapSummary
  } = data || {};

  const roadmapPct = typeof roadmapProgress === 'number' 
    ? roadmapProgress 
    : (roadmapProgress?.progressPct ?? 35);

  const skillLevels = rawSkillLevels || currentSkills || [];
  const studentName = data?.student?.full_name || data?.student?.fullName || user?.email?.split('@')[0] || 'Student';
  const targetCareerTitle = topCareer?.roleTitle || topCareer?.title || 'Frontend Engineer';
  const targetCareerScore = topCareer?.compositeScore || topCareer?.matchScore || 78;
  const criticalGapsCount = skillGapSummary?.missingGapsCount ?? 3;
  const partialGapsCount = skillGapSummary?.partialSkillsCount ?? 1;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner / Welcome & Quick Actions */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100">
              Active Session
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">Academic Year 2025-2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 tracking-tight">
            Welcome back, {studentName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {data?.student?.discipline || 'Engineering'} • {data?.student?.college || 'Anna University'}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/profile"
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Upload className="w-4 h-4 text-slate-600" />
            Upload Resume
          </Link>
          <Link
            to="/skills"
            className="px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <CheckSquare className="w-4 h-4 text-blue-600" />
            Take Assessment
          </Link>
          <Link
            to="/skill-gap"
            className="px-4 py-2.5 rounded-xl bg-brand-800 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-900/20 transition"
          >
            <GitCompare className="w-4 h-4" />
            View Gap Analysis
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Profile Completion */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Profile Status</span>
            <User className="w-4 h-4 text-brand-600" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{profileCompletion}%</span>
              <span className="text-xs text-emerald-600 font-semibold">Ready for matching</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2.5 overflow-hidden">
              <div 
                className="bg-brand-700 h-full rounded-full transition-all duration-500"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>
        </div>

        {/* Top Recommended Career */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Career</span>
            <Briefcase className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-base font-bold text-slate-900 truncate">
              {targetCareerTitle}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status="ACTIVE" label={topCareer ? 'Target Set' : 'Recommended'} />
              <span className="text-xs font-semibold text-slate-500">
                {targetCareerScore}% Match
              </span>
            </div>
          </div>
        </div>

        {/* Skill Gap Summary */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Skill Gaps</span>
            <GitCompare className="w-4 h-4 text-rose-600" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{criticalGapsCount}</span>
              <span className="text-xs font-semibold text-rose-600">
                {criticalGapsCount} Missing • {partialGapsCount} Partial
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Calculated against market requirements</p>
          </div>
        </div>

        {/* Roadmap Progress */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Roadmap Progress</span>
            <Milestone className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{roadmapPct}%</span>
              <span className="text-xs font-semibold text-emerald-600">On Track</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2.5 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${roadmapPct}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Middle Section: Current Skill Levels & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Skill Levels (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Assessed Skill Proficiencies</h2>
              <p className="text-xs text-slate-500">Benchmark scores validated through SkillLens assessments</p>
            </div>
            <Link to="/skills" className="text-xs font-bold text-brand-700 hover:text-brand-900 flex items-center gap-1">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {skillLevels.length === 0 ? (
            <EmptyState 
              title="No assessed skills yet" 
              description="Complete an interactive assessment to calibrate your proficiency scores."
              action={
                <Link to="/skills" className="px-4 py-2 bg-brand-800 text-white rounded-xl text-xs font-bold">
                  Take Assessment
                </Link>
              }
            />
          ) : (
            <div className="space-y-4">
              {skillLevels.slice(0, 5).map((s, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{s.skillName || s.name}</p>
                    <span className="text-[11px] text-slate-500">{s.category || 'Engineering'}</span>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="w-32 bg-slate-200 h-2 rounded-full overflow-hidden hidden sm:block">
                      <div 
                        className="bg-brand-700 h-full rounded-full" 
                        style={{ width: `${(((s.proficiencyLevel || s.proficiency_level || 3)) / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-700 w-12 text-right">
                      {s.proficiencyLevel || s.proficiency_level || 3}/5.0
                    </span>
                    <StatusBadge status={s.proficiencyBand || 'INTERMEDIATE'} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Deadlines (1 col) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">Upcoming Deadlines</h2>
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-3">
              {upcomingDeadlines.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No urgent deadlines recorded.</p>
              ) : (
                upcomingDeadlines.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 text-xs font-bold">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{item.title}</p>
                      <p className="text-[11px] text-slate-500">{item.organization || item.type}</p>
                      <span className="text-[10px] font-semibold text-rose-600">
                        Due: {new Date(item.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            to="/opportunities"
            className="w-full mt-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold text-center block transition"
          >
            Explore Opportunities Calendar
          </Link>
        </div>
      </div>

      {/* Bottom Section: Recommended Opportunities & Recent Assessments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended Opportunities */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Target Opportunities</h2>
              <p className="text-xs text-slate-500">Verified campus jobs, internships, scholarships & hackathons</p>
            </div>
            <Link to="/opportunities" className="text-xs font-bold text-brand-700 hover:text-brand-900 flex items-center gap-1">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recommendedOpportunities.slice(0, 3).map((opp, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#F0F7FF] border border-blue-100 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={opp.type} />
                    <StatusBadge status={opp.status} />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 truncate">{opp.title}</h3>
                  <p className="text-[11px] text-slate-600">{opp.organization} • {opp.location} ({opp.work_mode})</p>
                </div>
                <a
                  href={opp.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-brand-800 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shrink-0 transition"
                >
                  Apply
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Assessments */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Assessments</h2>
              <p className="text-xs text-slate-500">Performance and proficiency bands</p>
            </div>
            <Link to="/skills" className="text-xs font-bold text-brand-700 hover:text-brand-900 flex items-center gap-1">
              Take Quiz <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentAssessments.length === 0 ? (
              <EmptyState
                title="No test history"
                description="Take a quick quiz to discover your strengths and weaknesses."
                action={
                  <Link to="/skills" className="px-3.5 py-1.5 bg-brand-800 text-white rounded-lg text-xs font-bold">
                    Start Test
                  </Link>
                }
              />
            ) : (
              recentAssessments.slice(0, 3).map((a, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{a.assessment_title || a.skill_name || a.title || 'Technical Assessment'}</h3>
                    <p className="text-[11px] text-slate-500">
                      Completed {new Date(a.created_at || a.assessed_at || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-brand-900">{a.score_percentage || a.score || 85}%</span>
                    <div className="mt-0.5">
                      <StatusBadge status={a.proficiency_band || a.evidence_notes?.replace('Proficiency Band: ', '') || 'ADVANCED'} size="sm" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
