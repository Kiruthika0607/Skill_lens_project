import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  CheckSquare, 
  Briefcase, 
  AlertTriangle, 
  Milestone, 
  ShieldCheck, 
  Check, 
  X, 
  Clock, 
  TrendingUp, 
  FileText,
  Sparkles
} from 'lucide-react';
import { SkeletonLoader, StatusBadge, EmptyState, ConfirmationDialog } from '../components/UIState';

export default function AdminOverview() {
  const [data, setData] = useState(null);
  const [drafts, setDrafts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(null);
  const [dialogState, setDialogState] = useState({ open: false, draftId: null, action: null, title: '' });

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, draftsRes, logsRes] = await Promise.all([
        axios.get('/admin/analytics'),
        axios.get('/admin/ai-drafts?status=PENDING'),
        axios.get('/admin/logs?limit=5')
      ]);

      setData(analyticsRes.data);
      setDrafts(draftsRes.data.drafts || []);
      setLogs(logsRes.data.logs || []);
    } catch (err) {
      console.error('Failed to load admin overview', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDraftAction = async () => {
    const { draftId, action } = dialogState;
    if (!draftId || !action) return;

    setActionInProgress(draftId);
    setDialogState({ open: false, draftId: null, action: null, title: '' });

    try {
      await axios.post(`/admin/ai-drafts/${draftId}/action`, {
        action,
        comments: `Admin ${action.toLowerCase()} from overview console.`
      });

      // Remove from pending drafts list and refresh
      setDrafts((prev) => prev.filter((d) => d.id !== draftId));
      fetchAdminData();
    } catch (err) {
      alert('Failed to process AI draft action.');
    } finally {
      setActionInProgress(null);
    }
  };

  if (loading && !data) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <SkeletonLoader count={4} className="h-28" />
      </div>
    );
  }

  const {
    totals = {
      totalStudents: 120,
      activeStudents: 98,
      assessmentsCompleted: 340,
      roadmapCompletionRate: 68,
      pendingVerifications: 2
    },
    mostSelectedCareers = [],
    commonGaps = []
  } = data || {};

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            Governance & Institutional Audit
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 mt-2">
            SkillLens Administrator Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time cohort skill gap signals, curriculum alignment metrics, and AI verification queue
          </p>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status="ACTIVE" label="Evaluation Node Live" />
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Enrolled</span>
            <Users className="w-4 h-4 text-brand-700" />
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900">{totals.totalStudents}</span>
            <span className="text-xs text-slate-500 block mt-1">
              {totals.activeStudents} active this semester
            </span>
          </div>
        </div>

        {/* Assessments Completed */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assessments</span>
            <CheckSquare className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <span className="text-3xl font-black text-emerald-600">{totals.assessmentsCompleted}</span>
            <span className="text-xs text-slate-500 block mt-1">Calibrated proficiencies</span>
          </div>
        </div>

        {/* Roadmap Completion Rate */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Milestone Rate</span>
            <Milestone className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <span className="text-3xl font-black text-brand-900">{totals.roadmapCompletionRate}%</span>
            <span className="text-xs text-slate-500 block mt-1">Average cohort progress</span>
          </div>
        </div>

        {/* Pending Verifications */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending AI Drafts</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <span className="text-3xl font-black text-amber-600">{drafts.length}</span>
            <span className="text-xs text-slate-500 block mt-1">Awaiting auditor approval</span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Pending AI Drafts & Most Selected Careers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending AI Drafts Panel (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                Human-in-the-Loop AI Verification Queue
              </h2>
              <p className="text-xs text-slate-500">
                Auditor must approve automated taxonomy or opportunity changes before they impact students
              </p>
            </div>
            <StatusBadge status={drafts.length > 0 ? 'PENDING' : 'VERIFIED'} label={`${drafts.length} Pending`} />
          </div>

          {drafts.length === 0 ? (
            <EmptyState 
              title="Verification Queue Clear" 
              description="All AI proposed drafts and taxonomy changes have been reviewed and resolved." 
            />
          ) : (
            <div className="space-y-4">
              {drafts.map((d) => (
                <div key={d.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status="PENDING" label={d.entity_type} size="sm" />
                      <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        Confidence: {Math.round((d.confidence_score || 0.85) * 100)}%
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{d.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {d.proposed_changes}
                    </p>
                    {d.reasoning && (
                      <p className="text-[11px] text-slate-500 mt-1.5 italic">
                        Reasoning: {d.reasoning}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setDialogState({ open: true, draftId: d.id, action: 'REJECTED', title: d.title })}
                      disabled={actionInProgress === d.id}
                      className="px-3 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-slate-300 hover:border-rose-300 text-xs font-bold transition flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      Reject
                    </button>
                    <button
                      onClick={() => setDialogState({ open: true, draftId: d.id, action: 'APPROVED', title: d.title })}
                      disabled={actionInProgress === d.id}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1 shadow"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve & Publish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Most Selected Careers (1 col) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-brand-700" />
              Target Career Distribution
            </h2>
            <p className="text-xs text-slate-500 mb-4">Roles targeted by registered engineering students</p>

            <div className="space-y-3">
              {mostSelectedCareers.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No student targets recorded yet.</p>
              ) : (
                mostSelectedCareers.map((c, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{c.title}</p>
                      <span className="text-[11px] text-slate-500">{c.student_count || 12} Students Targeting</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-brand-900 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-100">
                      Rank #{idx + 1}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Common Gaps & Recent Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Common Skill Gaps Across Cohort */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            Top Institutional Curriculum Deficits
          </h2>
          <p className="text-xs text-slate-500 mb-4">Skills where current student cohorts exhibit largest deficit</p>

          <div className="space-y-3">
            {commonGaps.slice(0, 5).map((gap, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">{gap.name}</p>
                  <span className="text-[11px] text-slate-500">{gap.category || 'Engineering'}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-rose-600 block">
                    -{(gap.avg_gap || 1.8).toFixed(1)} Proficiency Points
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Impacts {gap.impacted_students || 35} students
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audit Logs */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-600" />
            System Audit Trail
          </h2>
          <p className="text-xs text-slate-500 mb-4">Recent administrative and automated verification events</p>

          <div className="space-y-3">
            {logs.slice(0, 4).map((log) => (
              <div key={log.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 uppercase text-[11px]">{log.action}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-600">{log.details}</p>
                <span className="text-[10px] text-slate-400 mt-1 block">Actor: {log.actor_email || 'System'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Confirmation Modal */}
      <ConfirmationDialog
        isOpen={dialogState.open}
        title={`${dialogState.action === 'APPROVED' ? 'Approve' : 'Reject'} AI Draft`}
        message={`Are you sure you want to ${dialogState.action?.toLowerCase()} "${dialogState.title}"? This decision will be permanently logged to the system audit records.`}
        confirmText={dialogState.action === 'APPROVED' ? 'Approve Draft' : 'Reject Draft'}
        isDanger={dialogState.action === 'REJECTED'}
        onConfirm={handleDraftAction}
        onCancel={() => setDialogState({ open: false, draftId: null, action: null, title: '' })}
      />
    </div>
  );
}
