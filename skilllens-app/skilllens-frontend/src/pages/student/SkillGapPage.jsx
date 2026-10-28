import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  GitCompare,
  Target,
  BookOpen,
  Info,
  CheckCircle2,
  AlertTriangle,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingDown,
  Sparkles
} from 'lucide-react';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Skeleton, { TableSkeleton } from '../../components/common/Skeleton';

export const SkillGapPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [careers, setCareers] = useState([]);
  const [selectedCareerId, setSelectedCareerId] = useState(searchParams.get('careerId') || '');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // 1. Load career list
  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const res = await api.get('/careers');
        const list = res.data || [];
        setCareers(list);
        if (!selectedCareerId && list.length > 0) {
          // If query param didn't specify careerId, check if student has a goal or default to first
          try {
            const goalRes = await api.get('/student/career-goals');
            if (goalRes.data?.careerRoleId) {
              setSelectedCareerId(goalRes.data.careerRoleId.toString());
              return;
            }
          } catch {
            // fallback to list[0]
          }
          setSelectedCareerId(list[0].id.toString());
        }
      } catch (err) {
        console.error('Failed to load careers:', err);
      }
    };
    fetchCareers();
  }, []);

  // 2. Fetch skill gap report for selectedCareerId
  useEffect(() => {
    if (!selectedCareerId) return;
    const fetchGapReport = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/skill-gaps/careers/${selectedCareerId}`);
        setReport(res.data);
      } catch (err) {
        console.error('Failed to load gap report:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGapReport();
  }, [selectedCareerId]);

  const handleCareerChange = (id) => {
    setSelectedCareerId(id);
    setSearchParams({ careerId: id });
  };

  const getStatusBadge = (item) => {
    const gapPercentage = item.normalizedGap == null ? null : item.normalizedGap * 100;
    if (item.currentProficiency == null || item.assessmentStatus === 'NOT_ASSESSED') {
      return <Badge status="NOT_ASSESSED" label="NOT ASSESSED" size="sm" />;
    }
    if (gapPercentage === 0 || item.assessmentStatus === 'MET') {
      return <Badge status="COMPLETED" label="MET (0% GAP)" size="sm" />;
    }
    if (gapPercentage >= 50) {
      return <Badge status="ERROR" label={`CRITICAL (${Math.round(gapPercentage)}% GAP)`} size="sm" />;
    }
    return <Badge status="WARNING" label={`PARTIAL (${Math.round(gapPercentage)}% GAP)`} size="sm" />;
  };

  const filteredItems = (report?.gapItems || []).filter((item) =>
    item.skillName?.toLowerCase().includes(search.toLowerCase())
  );
  const readiness = report?.overallGapPercentage == null
    ? null
    : Math.round(100 - report.overallGapPercentage);

  return (
    <div className="space-y-6">
      {/* Top Header & Role Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Skill Gap Analysis</h1>
            {report?.isDemoData && (
              <Badge status="SAMPLE" label="DEMO DATA" size="sm" />
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Skill levels from assessments and resume/profile self-reports are compared with industry role benchmarks.
          </p>
        </div>

        {/* Career Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">
            Target Role:
          </span>
          <select
            value={selectedCareerId}
            onChange={(e) => handleCareerChange(e.target.value)}
            className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-2xs"
          >
            {careers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Formula Transparency Callout Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-brand-50/70 border border-brand-200 text-brand-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-100 border border-brand-200 text-brand-700 flex items-center justify-center shrink-0 mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-800">
                Algorithm Transparency
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-brand-200/60 text-brand-900 border border-brand-300/60">
                Version: weighted, assessed-first
              </span>
            </div>
            <p className="text-xs text-brand-900/80 mt-1">
                Per-skill deficiency: <code className="font-mono font-bold bg-white/60 px-1.5 py-0.5 rounded text-navy-900">g_i = max(0, R_i - S_i) / R_i</code>. Assessed skills take precedence; self-reported skills from your profile or resume are used when no assessment exists. Skills without data are excluded.
            </p>
          </div>
        </div>

        {/* Overall Readiness Pill */}
        <div className="bg-white rounded-xl px-4 py-2.5 border border-brand-200 shadow-2xs shrink-0 text-center sm:text-right w-full sm:w-auto">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
            Readiness (known skills)
          </span>
          <span className="text-xl font-extrabold text-navy-900">
            {readiness == null ? '—' : `${readiness}%`}
          </span>
        </div>
      </div>

      {/* Skill Gaps Breakdown Table Card */}
      <Card>
        <CardHeader
          title={`Required Competencies for ${report?.careerTitle || 'Target Career'}`}
          subtitle={`${filteredItems.length} required skills evaluated against your profile`}
          action={
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search skills..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          }
        />

        <CardBody className="p-0">
          {loading ? (
            <TableSkeleton rows={5} cols={5} />
          ) : filteredItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No skills found matching your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-5">Skill & Category</th>
                    <th className="py-3 px-4">Current Level</th>
                    <th className="py-3 px-4">Required</th>
                    <th className="py-3 px-4">Weight</th>
                    <th className="py-3 px-4">Status & Gap %</th>
                    <th className="py-3 px-5">Recommended Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      {/* Skill Name */}
                      <td className="py-3.5 px-5">
                        <span className="font-bold text-navy-900 block">{item.skillName}</span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {item.categoryName || 'Technical'}
                        </span>
                      </td>

                      {/* Current Level */}
                      <td className="py-3.5 px-4 font-medium">
                        {item.currentProficiency != null ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                            Level {item.currentProficiency}
                            <span className="text-[10px] text-slate-400">
                              ({item.proficiencySource === 'ASSESSMENT' ? 'assessed' : 'self-reported'})
                            </span>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Not Assessed</span>
                        )}
                      </td>

                      {/* Required Level */}
                      <td className="py-3.5 px-4 font-semibold text-navy-900">
                        Level {item.requiredProficiency}
                      </td>

                      {/* Weight */}
                      <td className="py-3.5 px-4 text-slate-500 font-mono">
                        {(item.weight || 1.0).toFixed(1)}x
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(item)}
                      </td>

                      {/* Recommended Action & Resource Link */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-slate-600 max-w-xs truncate" title={item.recommendedAction}>
                            {item.currentProficiency == null
                              ? 'Complete an assessment or add this skill to your profile'
                              : `Build proficiency to level ${item.requiredProficiency}`}
                          </span>
                          <Link
                            to={`/resources?search=${encodeURIComponent(item.skillName)}`}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-800 shrink-0"
                          >
                            <span>Resources</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default SkillGapPage;
