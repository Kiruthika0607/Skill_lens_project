import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Download,
  Award,
  CheckCircle2,
  Milestone,
  FileText,
  Target,
  BarChart2,
  Printer
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Skeleton, { CardSkeleton } from '../../components/common/Skeleton';

export const ProgressPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const [anRes, profRes] = await Promise.all([
          api.get('/analytics/student'),
          api.get('/student/profile'),
        ]);
        setAnalytics(anRes.data || null);
        setProfile(profRes.data || null);
      } catch (err) {
        console.error('Failed to load student progress analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleDownloadReport = () => {
    if (!analytics) return;
    const reportText = `================================================================================
SKILLLENS — CAREER READINESS & COMPETENCY PROGRESS REPORT
Generated: ${new Date().toLocaleString()}
Student: ${profile?.firstName || 'Student'} ${profile?.lastName || ''}
University: ${profile?.university || 'Engineering Campus'}
Major: ${profile?.major || 'Computer Science'} | CGPA: ${profile?.gpa || 'N/A'}
================================================================================

1. OVERALL READINESS SCORE
Target Career Role: ${analytics.targetCareerTitle || 'Software Engineer'}
Readiness Score: ${analytics.careerReadinessScore || 0}%
Roadmap Completion: ${analytics.roadmapProgressPercentage || 0}%

2. SKILL INVENTORY BREAKDOWN
Total Skills Tracked: ${analytics.totalSkillsTracked || 0}
- Verified Skills: ${analytics.verifiedSkillsCount || 0}
- Expert Level (Lvl 4): ${analytics.expertSkillsCount || 0}
- Advanced Level (Lvl 3): ${analytics.advancedSkillsCount || 0}
- Intermediate Level (Lvl 2): ${analytics.intermediateSkillsCount || 0}
- Beginner Level (Lvl 1): ${analytics.beginnerSkillsCount || 0}

3. ACTIVE CRITICAL SKILL GAPS
${(analytics.criticalSkillGaps || []).map((g, i) => `${i + 1}. ${g.skillName}: Gap ${Math.round(g.gapPercentage)}% (Current: Lvl ${g.currentLevel || 0} vs Required: Lvl ${g.requiredLevel})`).join('\n') || 'None - all requirements satisfied!'}

4. ASSESSMENT HISTORY
Total Attempts Completed: ${analytics.assessmentsAttempted || 0}
Pass Rate: ${analytics.assessmentPassRate || 0}%

================================================================================
This is an officially verified report from the SkillLens Career Guidance Platform.
Algorithm Version: v1.2-weighted | https://skilllens.com
================================================================================`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SkillLens_Career_Report_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const proficiencyDistribution = [
    { name: 'Beginner', count: analytics?.beginnerSkillsCount || 0, color: '#38bdf8' },
    { name: 'Intermediate', count: analytics?.intermediateSkillsCount || 0, color: '#0284c7' },
    { name: 'Advanced', count: analytics?.advancedSkillsCount || 0, color: '#0267ca' },
    { name: 'Expert', count: analytics?.expertSkillsCount || 0, color: '#0f274a' },
  ];

  const readinessData = [
    { category: 'Verified Skills', score: analytics?.totalSkillsTracked
      ? Math.round((analytics.verifiedSkillsCount / analytics.totalSkillsTracked) * 100)
      : 0 },
    { category: 'Assessments Passed', score: Math.round(analytics?.assessmentPassRate || 0) },
    { category: 'Roadmap Milestones', score: Math.round(analytics?.roadmapProgressPercentage || 0) },
    { category: 'Overall Readiness', score: Math.round(analytics?.careerReadinessScore || 0) },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Progress Tracking & Analytics</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Comprehensive audit of your skill growth velocity, assessment pass rate, and milestone execution.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Download}
          onClick={handleDownloadReport}
        >
          Download Career Readiness Report
        </Button>
      </div>

      {/* 3 Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card>
          <CardBody className="p-5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Overall Career Readiness
            </span>
            <div className="text-3xl font-extrabold text-navy-900 mt-1">
              {analytics?.careerReadinessScore || 0}%
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Target: {analytics?.targetCareerTitle || 'Full Stack Engineer'}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Assessment Pass Rate
            </span>
            <div className="text-3xl font-extrabold text-emerald-600 mt-1">
              {Math.round(analytics?.assessmentPassRate || 0)}%
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {analytics?.assessmentsAttempted || 0} total evaluated attempts
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Roadmap Velocity
            </span>
            <div className="text-3xl font-extrabold text-brand-600 mt-1">
              {Math.round(analytics?.roadmapProgressPercentage || 0)}%
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {analytics?.completedMilestones || 0} milestones certified
            </p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Priority Career Skill Gaps"
          subtitle={`Weighted against ${analytics?.targetCareerTitle || 'your target career'} using your current assessed or self-reported skill levels`}
        />
        <CardBody className="p-5">
          {(analytics?.criticalSkillGaps || []).length === 0 ? (
            <p className="text-sm text-slate-500">
              No current skill gaps found, or no target-career skill requirements are configured yet.
            </p>
          ) : (
            <div className="space-y-3">
              {analytics.criticalSkillGaps.map((gap) => (
                <div key={gap.skillName} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-navy-900">{gap.skillName}</p>
                    <p className="text-xs text-slate-500">
                      Level {gap.currentLevel} of {gap.requiredLevel} required
                    </p>
                  </div>
                  <Badge
                    status={gap.gapPercentage >= 50 ? 'ERROR' : 'WARNING'}
                    label={`${Math.round(gap.gapPercentage)}% gap`}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Proficiency Distribution Chart */}
        <Card>
          <CardHeader
            title="Skill Proficiency Distribution"
            subtitle="Breakdown across Beginner, Intermediate, Advanced, and Expert tiers"
          />
          <CardBody className="p-5">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={proficiencyDistribution}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0267ca" radius={[6, 6, 0, 0]}>
                    {proficiencyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Competency Readiness Pillar Chart */}
        <Card>
          <CardHeader
            title="Placement Readiness Benchmarks"
            subtitle="Aggregated evaluation of skills, assessments, and roadmap execution"
          />
          <CardBody className="p-5">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={readinessData} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
                  <YAxis type="category" dataKey="category" width={130} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#0f274a" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default ProgressPage;
