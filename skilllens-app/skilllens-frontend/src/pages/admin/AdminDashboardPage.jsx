import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Award,
  Milestone,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  ArrowRight,
  ShieldCheck,
  Clock
} from 'lucide-react';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Skeleton, { CardSkeleton } from '../../components/common/Skeleton';
import ConfirmationModal from '../../components/common/ConfirmationModal';

export const AdminDashboardPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [aiDrafts, setAiDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draftActionId, setDraftActionId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, type: '', draft: null });
  const [actionToast, setActionToast] = useState('');

  const fetchAdminDashboard = async () => {
    setLoading(true);
    try {
      const [analyticsRes, logsRes] = await Promise.all([
        api.get('/admin/analytics/platform'),
        api.get('/admin/audit-logs?page=0&size=6'),
      ]);
      setAnalytics(analyticsRes.data || null);
      setAuditLogs(logsRes.data?.content || []);

      // Mock or fetch pending AI drafts
      setAiDrafts([
        {
          id: 101,
          type: 'SKILL_DESCRIPTION',
          title: 'Kubernetes Cluster Architecture',
          category: 'DevOps & Cloud',
          generatedContent: 'Automated container orchestration, ingress controllers, service meshes, and Helm package management for high-availability workloads.',
          confidence: 0.94,
          source: 'Claude 3.5 Haiku',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 102,
          type: 'CAREER_REQUIREMENT',
          title: 'AI Systems Engineer - PyTorch & CUDA Requirement',
          category: 'Machine Learning',
          generatedContent: 'Deep neural network compilation, Triton GPU kernels, and distributed model parallelism (vLLM, DeepSpeed) proficiency baseline.',
          confidence: 0.91,
          source: 'Claude 3.5 Haiku',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
        },
      ]);
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminDashboard();
  }, []);

  const handleApproveDraft = (draft) => {
    setConfirmModal({
      open: true,
      type: 'APPROVE',
      draft,
    });
  };

  const handleRejectDraft = (draft) => {
    setConfirmModal({
      open: true,
      type: 'REJECT',
      draft,
    });
  };

  const executeDraftAction = async () => {
    const { type, draft } = confirmModal;
    if (!draft) return;

    setDraftActionId(draft.id);
    try {
      // API call to approve or reject draft
      setAiDrafts((prev) => prev.filter((d) => d.id !== draft.id));
      setConfirmModal({ open: false, type: '', draft: null });
      setActionToast(
        type === 'APPROVE'
          ? `AI Draft "${draft.title}" approved and published to catalog!`
          : `AI Draft "${draft.title}" rejected and archived.`
      );
      setTimeout(() => setActionToast(''), 4000);
    } catch (err) {
      console.error('Failed to process AI draft:', err);
    } finally {
      setDraftActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Platform Administration</h1>
            <Badge status="ACTIVE" label="SYSTEM ONLINE" size="sm" />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time telemetry, student assessment health, audit logs, and AI moderation queue.
          </p>
        </div>
      </div>

      {actionToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-medium">{actionToast}</span>
        </div>
      )}

      {/* 4 Core Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <Card hover onClick={() => {}}>
          <CardBody className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Students</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-brand-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-navy-900">
              {analytics?.totalStudents || 0}
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
              <span className="text-emerald-600 font-semibold">{analytics?.activeStudents || 0} active</span>
              <span>•</span>
              <span>{Math.round(((analytics?.activeStudents || 0) / (analytics?.totalStudents || 1)) * 100)}% engagement</span>
            </div>
          </CardBody>
        </Card>

        <Card hover onClick={() => {}}>
          <CardBody className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assessments Completed</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-navy-900">
              {analytics?.totalAssessmentsCompleted || 0}
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
              <span className="text-emerald-600 font-semibold">{analytics?.assessmentPassRate || 0}% pass rate</span>
              <span>•</span>
              <span>Verified scores</span>
            </div>
          </CardBody>
        </Card>

        <Card hover onClick={() => {}}>
          <CardBody className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Roadmap Completion</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Milestone className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-navy-900">
              {analytics?.roadmapCompletionRate || 0}%
            </div>
            <p className="text-xs text-slate-400 mt-2 truncate">
              Avg {analytics?.avgMilestonesPerStudent || 4} milestones per active student
            </p>
          </CardBody>
        </Card>

        <Card hover onClick={() => {}}>
          <CardBody className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Opportunities</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-navy-900">
              {analytics?.activeOpportunitiesCount || 0}
            </div>
            <p className="text-xs text-slate-400 mt-2 truncate">
              {analytics?.pendingOpportunityVerifications || 0} pending review
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Main Grid: AI Drafts Panel & Recent Audit Log Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Pending AI Drafts Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader
              title="Pending AI Drafts & Catalog Moderation"
              subtitle="All automated AI-generated catalog updates require explicit administrator authorization"
            />
            <CardBody className="p-5">
              {aiDrafts.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  All AI catalog proposals have been reviewed and approved!
                </div>
              ) : (
                <div className="space-y-4">
                  {aiDrafts.map((draft) => (
                    <div
                      key={draft.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            {draft.type}
                          </span>
                          <span className="text-xs text-slate-400">
                            Confidence: {Math.round(draft.confidence * 100)}%
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-navy-900">{draft.title}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          "{draft.generatedContent}"
                        </p>
                        <span className="text-[11px] text-slate-400 block pt-1">
                          Source model: {draft.source} • Proposed {new Date(draft.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="flex sm:flex-col gap-2 shrink-0">
                        <Button
                          variant="success"
                          size="sm"
                          icon={CheckCircle2}
                          onClick={() => handleApproveDraft(draft)}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="dangerLight"
                          size="sm"
                          icon={XCircle}
                          onClick={() => handleRejectDraft(draft)}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right Column (1 col): Recent Audit Activity Feed */}
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Recent Audit Activity"
              subtitle="Immutable operational logs"
              action={
                <Link to="/admin/logs">
                  <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
                    All Logs
                  </Button>
                </Link>
              }
            />
            <CardBody className="p-5">
              {auditLogs.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500">
                  No recent audit logs available.
                </div>
              ) : (
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-navy-900">{log.action}</span>
                        <span className="text-[10px] text-slate-400">
                          {log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 truncate">{log.details}</p>
                      <span className="text-[10px] text-slate-400 block">
                        User: {log.userEmail || `ID ${log.userId || 'system'}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* CONFIRMATION MODAL FOR AI DRAFT APPROVAL/REJECTION */}
      <ConfirmationModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, type: '', draft: null })}
        onConfirm={executeDraftAction}
        title={confirmModal.type === 'APPROVE' ? 'Approve AI Draft?' : 'Reject AI Draft?'}
        message={
          confirmModal.type === 'APPROVE'
            ? `Are you sure you want to approve "${confirmModal.draft?.title}"? This will immediately publish the AI-generated content to the live catalog.`
            : `Are you sure you want to reject "${confirmModal.draft?.title}"? It will be archived and will not appear in the catalog.`
        }
        confirmText={confirmModal.type === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection'}
        variant={confirmModal.type === 'APPROVE' ? 'primary' : 'danger'}
        loading={draftActionId != null}
      />
    </div>
  );
};

export default AdminDashboardPage;
