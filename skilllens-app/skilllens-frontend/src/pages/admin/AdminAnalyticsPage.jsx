import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  Users,
  Target,
  Sparkles
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
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import Skeleton, { CardSkeleton } from '../../components/common/Skeleton';

export const AdminAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await api.get('/admin/analytics/platform');
        setAnalytics(res.data);
      } catch (err) {
        console.error('Failed to load platform analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const topRolesData = (analytics?.mostSelectedCareerPaths || [
    { title: 'Full Stack Engineer', count: 12 },
    { title: 'DevOps & SRE Engineer', count: 8 },
    { title: 'Machine Learning Engineer', count: 6 },
    { title: 'Data Platform Engineer', count: 4 },
  ]).map((r) => ({
    name: r.title || r.name,
    students: r.count || r.studentCount || 1,
  }));

  const commonGapsData = (analytics?.commonSkillGaps || [
    { name: 'System Design', gapCount: 14 },
    { name: 'Docker & K8s', gapCount: 11 },
    { name: 'Data Structures', gapCount: 9 },
    { name: 'REST & GraphQL', gapCount: 7 },
  ]).map((g) => ({
    name: g.skillName || g.name,
    frequency: g.gapCount || g.count || 1,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Platform Analytics & Insights</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Aggregated engineering student competencies, assessment completion, and curriculum demand trends.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card>
          <CardBody className="p-5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Student Engagement</span>
            <div className="text-3xl font-extrabold text-navy-900 mt-1">
              {analytics?.activeStudents || 0} / {analytics?.totalStudents || 0}
            </div>
            <p className="text-xs text-slate-400 mt-1">Active within 30 days</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Assessment Pass Rate</span>
            <div className="text-3xl font-extrabold text-emerald-600 mt-1">
              {analytics?.assessmentPassRate || 0}%
            </div>
            <p className="text-xs text-slate-400 mt-1">{analytics?.totalAssessmentsCompleted || 0} total evaluations</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Roadmap Execution</span>
            <div className="text-3xl font-extrabold text-brand-600 mt-1">
              {analytics?.roadmapCompletionRate || 0}%
            </div>
            <p className="text-xs text-slate-400 mt-1">Milestones completed</p>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Most Selected Career Aspirations"
            subtitle="Student distribution by target career role"
          />
          <CardBody className="p-5">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topRolesData} layout="vertical">
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="students" fill="#0267ca" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Most Common Student Skill Gaps"
            subtitle="Skills requiring institutional or curricular reinforcement"
          />
          <CardBody className="p-5">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={commonGapsData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="frequency" fill="#e11d48" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
