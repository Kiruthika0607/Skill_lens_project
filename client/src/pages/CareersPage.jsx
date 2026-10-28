import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Briefcase, 
  Target, 
  TrendingUp, 
  DollarSign, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Sparkles,
  Search
} from 'lucide-react';
import { SkeletonLoader, StatusBadge, ConfirmationDialog } from '../components/UIState';

export default function CareersPage() {
  const [careers, setCareers] = useState([]);
  const [targetRoleId, setTargetRoleId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchCareers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/career/recommendations');
      setCareers(res.data.recommendations || []);
      setTargetRoleId(res.data.currentTargetRoleId || null);
    } catch (err) {
      console.error('Failed to load career recommendations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCareers();
  }, []);

  const handleSetTarget = async (roleId, roleTitle) => {
    setUpdating(true);
    try {
      await axios.post('/student/target-career', { roleId });
      setTargetRoleId(roleId);
      setSuccessMsg(`"${roleTitle}" is now your designated target career role!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert('Failed to set target career.');
    } finally {
      setUpdating(false);
    }
  };

  const filteredCareers = careers.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <SkeletonLoader count={4} className="h-32" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100">
            Career Role Intelligence
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 mt-2">
            Recommended Career Paths
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Matched to your assessed proficiencies and live industry hiring demand
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roles..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-600 transition"
          />
        </div>
      </div>

      {/* Career Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCareers.map((career) => {
          const isTarget = targetRoleId === career.id;
          const matchPct = career.match_percentage || career.matchScore || 75;

          return (
            <div
              key={career.id}
              className={`rounded-3xl p-6 sm:p-7 border transition flex flex-col justify-between ${
                isTarget
                  ? 'bg-blue-50/50 border-brand-500 ring-2 ring-brand-200 shadow-md'
                  : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {career.category || 'Tech Domain'}
                  </span>
                  {isTarget ? (
                    <StatusBadge status="ACTIVE" label="Current Target" />
                  ) : (
                    <StatusBadge status="SAMPLE" label={`${matchPct}% Match`} />
                  )}
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">{career.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {career.description || 'Design and deploy robust production applications adhering to modern industry architectures.'}
                </p>

                {/* Demand & Salary Metrics */}
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 mb-5">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Market Demand
                    </span>
                    <span className="text-xs font-bold text-brand-900 flex items-center gap-1 mt-0.5">
                      <TrendingUp className="w-3.5 h-3.5 text-brand-600" />
                      {career.demand_score || 88}/100 High
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Entry CTC (Avg)
                    </span>
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1 mt-0.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      {career.salary_range || '₹6 - 14 LPA'}
                    </span>
                  </div>
                </div>

                {/* Key Skills */}
                <div className="mb-6">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
                    Core Prerequisites:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(career.skills_required || career.requiredSkills || ['React', 'Node.js', 'SQL', 'Git']).map((sk, idx) => {
                      const name = typeof sk === 'string' ? sk : sk.name;
                      return (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-medium text-slate-700"
                        >
                          {name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div>
                {isTarget ? (
                  <div className="w-full py-2.5 rounded-xl bg-brand-800 text-white text-xs font-bold text-center flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Target Career Selected
                  </div>
                ) : (
                  <button
                    onClick={() => handleSetTarget(career.id, career.title)}
                    disabled={updating}
                    className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-brand-800 hover:text-white text-brand-900 text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Target className="w-4 h-4" />
                    Set as My Target Career
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
