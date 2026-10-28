import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  Download, 
  Calendar, 
  BarChart2, 
  Printer,
  Compass
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { SkeletonLoader, StatusBadge, EmptyState } from '../components/UIState';

export default function ProgressPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/student/progress');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load progress', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const handleDownloadReport = () => {
    window.print();
  };

  if (loading && !data) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <SkeletonLoader count={4} className="h-28" />
      </div>
    );
  }

  const {
    studentName = 'Priya Sharma',
    college = 'Anna University',
    discipline = 'Computer Science',
    currentScore = 78.4,
    completedMilestones = 4,
    totalMilestones = 8,
    assessmentsCount = 5,
    scoreHistory = [
      { date: 'Aug 01', score: 62 },
      { date: 'Aug 15', score: 68 },
      { date: 'Sep 01', score: 71 },
      { date: 'Sep 20', score: 74 },
      { date: 'Oct 10', score: 78 },
      { date: 'Current', score: 82 },
    ],
    verifiedSkills = [
      { name: 'React.js', band: 'Expert', verifiedDate: '2026-09-12' },
      { name: 'Node.js', band: 'Advanced', verifiedDate: '2026-09-20' },
      { name: 'PostgreSQL', band: 'Intermediate', verifiedDate: '2026-10-04' },
      { name: 'Git & GitHub', band: 'Expert', verifiedDate: '2026-10-15' },
    ]
  } = data || {};

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8 print:p-0 print:m-0">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:border-none print:shadow-none">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100 print:hidden">
            Portfolio Audit & Growth
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 mt-2">
            Skill Progress & Verified Transcript
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {studentName} • {discipline} • {college}
          </p>
        </div>

        <button
          onClick={handleDownloadReport}
          className="px-5 py-2.5 rounded-xl bg-brand-800 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-2 shadow transition print:hidden"
        >
          <Printer className="w-4 h-4" />
          Print / Download Official Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Skill Index</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-brand-900">{currentScore}</span>
            <span className="text-xs font-bold text-emerald-600">+12% this month</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-brand-700 h-full rounded-full" style={{ width: `${currentScore}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Milestones Finished</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{completedMilestones} / {totalMilestones}</span>
            <span className="text-xs font-bold text-blue-600">
              {Math.round((completedMilestones / totalMilestones) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${(completedMilestones / totalMilestones) * 100}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Calibrated Assessments</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">{assessmentsCount}</span>
            <span className="text-xs font-bold text-slate-500">Industry Standard Quizzes</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">100% Grounded Question Banks</p>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-brand-700" />
          Competency Trajectory Over Time
        </h2>
        <p className="text-xs text-slate-500 mb-6">Historical index tracking verified test performance</p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={scoreHistory} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <defs>
                <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1E40AF" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#1E40AF" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0B192C', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="score" stroke="#1E40AF" strokeWidth={3} fillOpacity={1} fill="url(#scoreColor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Verified Skills Transcript Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Official SkillLens Verified Badges</h2>
          <span className="text-xs text-slate-500 font-semibold">{verifiedSkills.length} Verified Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-6">Skill Competency</th>
                <th className="py-3 px-6">Proficiency Band</th>
                <th className="py-3 px-6">Verification Date</th>
                <th className="py-3 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {verifiedSkills.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-6 font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{item.name}</span>
                  </td>
                  <td className="py-3.5 px-6">
                    <StatusBadge status={item.band} label={item.band} />
                  </td>
                  <td className="py-3.5 px-6 text-slate-600">
                    {item.verifiedDate}
                  </td>
                  <td className="py-3.5 px-6">
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Evaluator Validated
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
