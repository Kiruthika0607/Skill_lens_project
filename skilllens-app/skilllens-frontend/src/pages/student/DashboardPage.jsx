import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  UploadCloud,
  Award,
  GitCompare,
  ArrowRight,
  Target,
  Briefcase,
  Milestone,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Skeleton, { CardSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    setLoading(false);
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/student/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError(err.response?.data?.message || 'Unable to load your career dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <Skeleton className="h-8 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <div className="space-y-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-rose-200 text-center shadow-card max-w-xl mx-auto my-12">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-navy-900">Dashboard Unavailable</h3>
        <p className="text-sm text-slate-500 mt-1 mb-5">{error}</p>
        <Button variant="primary" size="sm" icon={RefreshCw} onClick={fetchDashboard}>
          Retry Connection
        </Button>
      </div>
    );
  }

  const profile = data?.profile;
  const targetCareer = data?.targetCareer;
  const skillOverview = data?.skillOverview;
  const skillGapSummary = data?.skillGapSummary;
  const activeRoadmap = data?.activeRoadmap;
  const recentAssessments = data?.recentAssessments || [];
  const recommendedOpportunities = data?.recommendedOpportunities || [];
  const upcomingDeadlines = data?.upcomingDeadlines || [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-brand-900 rounded-2xl p-6 sm:p-8 text-white shadow-elevated flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold mb-3 border border-brand-400/30">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Engineering Career Pathway Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {profile?.firstName || 'Student'}!
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
            {profile?.university ? `${profile.university} • ${profile.major || 'Engineering'}` : 'Track your career readiness, quantify skill gaps, and achieve placement milestones.'}
          </p>
        </div>

        {/* Quick-action buttons: Upload Resume, Take Assessment, View Gap Analysis */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            icon={UploadCloud}
            onClick={() => navigate('/profile')}
            className="bg-white/10 text-white border-white/20 hover:bg-white/20"
          >
            Upload Resume
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={Award}
            onClick={() => navigate('/skills?tab=assessments')}
            className="bg-white/10 text-white border-white/20 hover:bg-white/20"
          >
            Take Assessment
          </Button>
          <Button
            variant="brand"
            size="sm"
            icon={GitCompare}
            onClick={() => navigate('/skill-gap')}
            className="shadow-sm"
          >
            View Gap Analysis
          </Button>
        </div>
      </div>

      {/* 4 Core Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Profile Completion */}
        <Card hover onClick={() => navigate('/profile')}>
          <CardBody className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Profile Completion</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-brand-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-navy-900">
              {profile?.profileCompletionPercentage || 0}%
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-brand-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${profile?.profileCompletionPercentage || 0}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              {profile?.hasResume ? 'Resume uploaded & analyzed' : 'Upload resume to reach 100%'}
            </p>
          </CardBody>
        </Card>

        {/* Current Skill Levels */}
        <Card hover onClick={() => navigate('/skills')}>
          <CardBody className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Skill Inventory</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-navy-900">
              {skillOverview?.totalSkills || 0}{' '}
              <span className="text-xs font-medium text-slate-400">Skills Total</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="font-semibold text-emerald-700">{skillOverview?.verifiedSkills || 0} verified</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">{(skillOverview?.totalSkills || 0) - (skillOverview?.verifiedSkills || 0)} self-reported</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              {skillOverview?.expertCount || 0} Expert, {skillOverview?.advancedCount || 0} Advanced
            </p>
          </CardBody>
        </Card>

        {/* Top Recommended Career / Target */}
        <Card hover onClick={() => navigate('/careers')}>
          <CardBody className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Target Career Role</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div className="text-base font-bold text-navy-900 truncate" title={targetCareer?.title || 'None Selected'}>
              {targetCareer?.title || 'Select Target Role'}
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <Badge
                status={targetCareer?.matchPercentage >= 70 ? 'ACTIVE' : 'IN_PROGRESS'}
                label={`${targetCareer?.matchPercentage || 0}% Role Match`}
                size="sm"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              {targetCareer?.matchedSkillsCount || 0} of {targetCareer?.totalSkillsCount || 0} requirements met
            </p>
          </CardBody>
        </Card>

        {/* Roadmap Progress */}
        <Card hover onClick={() => navigate('/roadmap')}>
          <CardBody className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Roadmap Progress</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Milestone className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-navy-900">
              {activeRoadmap?.progressPercentage || 0}%
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${activeRoadmap?.progressPercentage || 0}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2 truncate">
              {activeRoadmap?.nextMilestoneTitle ? `Next: ${activeRoadmap.nextMilestoneTitle}` : 'Milestones in progress'}
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Main Grid: 2 columns left, 1 column right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Skill Gap Summary + Recommended Opportunities */}
        <div className="lg:col-span-2 space-y-6">
          {/* Skill Gap Summary Card */}
          <Card>
            <CardHeader
              title="Skill Gap Summary"
              subtitle={`Formula-calculated deficiencies for ${skillGapSummary?.targetCareerTitle || targetCareer?.title || 'Target Role'}`}
              action={
                <Link to="/skill-gap">
                  <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
                    Full Analysis
                  </Button>
                </Link>
              }
            />
            <CardBody className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-brand-50/50 border border-brand-100 mb-4">
                <div>
                  <div className="text-xs font-semibold text-brand-800 uppercase tracking-wider">
                    Overall Career Readiness
                  </div>
                  <div className="text-2xl font-extrabold text-navy-900 mt-0.5">
                    {skillGapSummary?.overallReadinessScore || 0}%
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Computed via $g_i = \max(0, R_i - S_i) / R_i$ weighted algorithm
                  </p>
                </div>
                <div className="text-right sm:border-l sm:border-brand-200 sm:pl-6">
                  <div className="text-xs font-semibold text-slate-600">Active Skill Gaps</div>
                  <div className="text-2xl font-bold text-rose-600">
                    {skillGapSummary?.totalGapCount || 0}
                  </div>
                  <p className="text-[11px] text-slate-400">Requires targeted learning</p>
                </div>
              </div>

              {skillGapSummary?.criticalGapSkills?.length > 0 ? (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
                    Highest Priority Gaps To Bridge
                  </h4>
                  <div className="space-y-2">
                    {skillGapSummary.criticalGapSkills.map((gap, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          <span className="text-sm font-semibold text-navy-900">{gap.skillName}</span>
                          <span className="text-xs text-slate-400">
                            Current: {gap.currentLevel > 0 ? `Lvl ${gap.currentLevel}` : 'Not Assessed'} vs Target: Lvl {gap.requiredLevel}
                          </span>
                        </div>
                        <Badge
                          status="WARNING"
                          label={`${Math.round(gap.gapPercentage)}% Gap`}
                          size="sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-slate-500">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                  No critical gaps identified for your current role. Keep advancing your mastery!
                </div>
              )}
            </CardBody>
          </Card>

          {/* Recommended Opportunities */}
          <Card>
            <CardHeader
              title="Recommended Opportunities"
              subtitle="Scored and ranked specifically against your verified skill profile"
              action={
                <Link to="/opportunities">
                  <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
                    View All
                  </Button>
                </Link>
              }
            />
            <CardBody className="p-5">
              {recommendedOpportunities.length === 0 ? (
                <EmptyState
                  title="No opportunity matches yet"
                  description="Complete skill assessments to unlock ranked job and internship matches."
                  actionLabel="Take Assessment"
                  onAction={() => navigate('/skills')}
                />
              ) : (
                <div className="space-y-3">
                  {recommendedOpportunities.slice(0, 4).map((opp) => (
                    <div
                      key={opp.id}
                      className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-card transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge status={opp.type} label={opp.type} size="sm" />
                          <Badge status="VERIFIED" label="VERIFIED" size="sm" />
                          <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                            {opp.matchPercentage || 100}% Match
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-navy-900">{opp.title}</h4>
                        <p className="text-xs text-slate-500">
                          {opp.organization} • {opp.location || 'Remote'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {opp.applicationUrl && (
                          <a
                            href={opp.applicationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex"
                          >
                            <Button variant="secondary" size="sm" icon={ExternalLink} iconPosition="right">
                              Apply
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Upcoming Deadlines + Recent Assessment Results */}
        <div className="space-y-6">
          {/* Upcoming Deadlines Card */}
          <Card>
            <CardHeader
              title="Upcoming Deadlines"
              subtitle="Expiring opportunities & assessment dates"
            />
            <CardBody className="p-5">
              {upcomingDeadlines.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">
                  No immediate application deadlines within the next 14 days.
                </p>
              ) : (
                <div className="space-y-3">
                  {upcomingDeadlines.slice(0, 4).map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-3"
                    >
                      <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-navy-900 truncate">{item.title}</p>
                        <p className="text-[11px] text-slate-500">
                          Deadline: {item.deadline ? new Date(item.deadline).toLocaleDateString() : 'Rolling'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Recent Assessments Card */}
          <Card>
            <CardHeader
              title="Recent Assessments"
              subtitle="Verified server-scored attempts"
              action={
                <Link to="/skills">
                  <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
                    Assessments
                  </Button>
                </Link>
              }
            />
            <CardBody className="p-5">
              {recentAssessments.length === 0 ? (
                <div className="text-center py-6">
                  <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 mb-3">No verified assessment records found.</p>
                  <Button variant="secondary" size="sm" onClick={() => navigate('/skills')}>
                    Take First Assessment
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentAssessments.slice(0, 4).map((att) => (
                    <div
                      key={att.id}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-navy-900">{att.assessmentTitle || 'Skill Assessment'}</p>
                        <p className="text-[11px] text-slate-400">
                          Score: {att.score}/{att.maxScore} ({Math.round((att.score / (att.maxScore || 1)) * 100)}%)
                        </p>
                      </div>
                      <Badge
                        status={att.passed ? 'VERIFIED' : 'PENDING'}
                        label={att.passed ? `Proficiency Lvl ${att.assessedProficiency}` : 'Needs Practice'}
                        size="sm"
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
