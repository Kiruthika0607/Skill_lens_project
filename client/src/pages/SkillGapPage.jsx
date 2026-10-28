import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  GitCompare, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  BookOpen, 
  TrendingUp, 
  Calculator,
  ChevronDown
} from 'lucide-react';
import { SkeletonLoader, StatusBadge, EmptyState } from '../components/UIState';

export default function SkillGapPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');

  const fetchRoles = async () => {
    try {
      const res = await axios.get('/career/roles');
      const roles = res.data.roles || [];
      setAvailableRoles(roles);
      if (roles.length > 0 && !selectedRoleId) {
        setSelectedRoleId(roles[0].id);
      }
    } catch (err) {
      console.error('Failed to load roles', err);
    }
  };

  const fetchGapAnalysis = async (roleId) => {
    setLoading(true);
    try {
      const url = roleId ? `/career/skill-gap?roleId=${roleId}` : '/career/skill-gap';
      const res = await axios.get(url);
      setData(res.data);
    } catch (err) {
      console.error('Failed to load gap analysis', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    if (selectedRoleId) {
      fetchGapAnalysis(selectedRoleId);
    } else {
      fetchGapAnalysis();
    }
  }, [selectedRoleId]);

  if (loading && !data) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <SkeletonLoader count={4} className="h-28" />
      </div>
    );
  }

  const {
    roleTitle = 'Full Stack Software Engineer',
    overallGap = 24.5,
    matchPercentage = 75.5,
    formula = 'Weighted Gap Index = (Sum(w_i * max(0, R_i - C_i)) / Sum(w_i * R_i)) * 100',
    formulaVersion = 'v2.1',
    datasetType = 'SAMPLE / DEMO DATASET',
    gaps = []
  } = data || {};

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100">
              Quantitative Skill Gap Engine
            </span>
            <StatusBadge status="SAMPLE" label={datasetType} size="sm" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 mt-2">
            Skill Gap Breakdown: {roleTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Explicit comparison of target market requirements vs student's calibrated competencies
          </p>
        </div>

        {/* Role Selector Dropdown */}
        <div className="w-full sm:w-auto">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Evaluate Against Role:
          </label>
          <div className="relative">
            <select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className="w-full sm:w-64 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 outline-none focus:border-brand-600 shadow-sm"
            >
              {availableRoles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Mathematical Formula Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white border border-slate-800 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300 flex items-center justify-center shrink-0">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                  Grounded Mathematical Formula ({formulaVersion})
                </span>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 border border-slate-700">
                  Transparent & Auditable
                </span>
              </div>
              <p className="font-mono text-xs sm:text-sm text-slate-200 mt-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                {formula}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Where <code className="text-blue-300">w_i</code> is importance weight, <code className="text-blue-300">R_i</code> is required proficiency, and <code className="text-blue-300">C_i</code> is current proficiency.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-800/80 p-4 rounded-2xl border border-slate-700 shrink-0">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Overall Gap</span>
              <span className="text-2xl font-black text-rose-400">{overallGap}%</span>
            </div>
            <div className="h-8 w-px bg-slate-700" />
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Market Match</span>
              <span className="text-2xl font-black text-emerald-400">{matchPercentage}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Skill Gaps Table / Cards */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Per-Skill Deficit Matrix</h2>
          <span className="text-xs text-slate-500 font-semibold">{gaps.length} Skills Analyzed</span>
        </div>

        {gaps.length === 0 ? (
          <div className="p-8">
            <EmptyState title="No skill gaps detected" description="You satisfy all minimum requirements for this role!" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 sm:px-6">Skill & Category</th>
                  <th className="py-3.5 px-4">Required</th>
                  <th className="py-3.5 px-4">Current</th>
                  <th className="py-3.5 px-4">Importance</th>
                  <th className="py-3.5 px-4">Deficit Gap</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4 sm:px-6">Curated Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {gaps.map((item, idx) => {
                  const req = item.required_proficiency || item.requiredProficiency || 4.0;
                  const curr = item.current_proficiency || item.currentProficiency || 2.0;
                  const gapPct = item.gap_percentage || item.gapPercentage || Math.max(0, Math.round(((req - curr) / req) * 100));
                  const weight = item.importance_weight || item.importanceWeight || 1.0;
                  const priority = gapPct > 40 ? 'CRITICAL' : gapPct > 15 ? 'MEDIUM' : 'LOW';

                  return (
                    <tr key={idx} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-4 sm:px-6">
                        <p className="font-bold text-slate-900">{item.skill_name || item.name}</p>
                        <span className="text-[11px] text-slate-500">{item.category || 'Engineering'}</span>
                      </td>

                      <td className="py-4 px-4 font-semibold text-slate-700">
                        {req.toFixed(1)} / 5.0
                      </td>

                      <td className="py-4 px-4 font-semibold text-slate-700">
                        {curr.toFixed(1)} / 5.0
                      </td>

                      <td className="py-4 px-4 font-semibold text-slate-600">
                        {weight.toFixed(1)}x
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${gapPct > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {gapPct}%
                          </span>
                          <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                            <div 
                              className={`h-full ${gapPct > 35 ? 'bg-rose-500' : gapPct > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min(100, gapPct)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <StatusBadge status={priority} label={priority} size="sm" />
                      </td>

                      <td className="py-4 px-4 sm:px-6">
                        {item.resource ? (
                          <a
                            href={item.resource.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:text-brand-900"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>{item.resource.title}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>
                        ) : (
                          <span className="text-xs text-slate-500 font-medium">Practice standard projects</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
