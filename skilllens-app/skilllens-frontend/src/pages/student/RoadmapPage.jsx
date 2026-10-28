import React, { useState, useEffect } from 'react';
import {
  Milestone,
  CheckCircle2,
  Lock,
  Unlock,
  Clock,
  Plus,
  ArrowRight,
  Sparkles,
  Award,
  AlertCircle,
  BookOpen,
  ExternalLink,
} from 'lucide-react';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Skeleton, { CardSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

export const RoadmapPage = () => {
  const [roadmaps, setRoadmaps] = useState([]);
  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingMilestoneId, setUpdatingMilestoneId] = useState(null);
  const [updatingResourceId, setUpdatingResourceId] = useState(null);
  const [resourceError, setResourceError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [careers, setCareers] = useState([]);
  const [selectedCareerId, setSelectedCareerId] = useState('');
  const [generateModalOpen, setGenerateModalOpen] = useState(false);

  const fetchRoadmaps = async () => {
    setLoading(true);
    try {
      const [roadmapsRes, careersRes] = await Promise.all([
        api.get('/student/roadmaps'),
        api.get('/careers'),
      ]);
      const list = roadmapsRes.data || [];
      setRoadmaps(list);
      setCareers(careersRes.data || []);
      if (careersRes.data?.length > 0) {
        setSelectedCareerId(careersRes.data[0].id.toString());
      }
      if (list.length > 0) {
        // fetch full details for first roadmap
        const full = await api.get(`/student/roadmaps/${list[0].id}`);
        setActiveRoadmap(full.data);
      } else {
        setActiveRoadmap(null);
      }
    } catch (err) {
      console.error('Failed to load roadmaps:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const handleSelectRoadmap = async (id) => {
    try {
      const res = await api.get(`/student/roadmaps/${id}`);
      setActiveRoadmap(res.data);
    } catch (err) {
      console.error('Failed to fetch roadmap details:', err);
    }
  };

  const handleToggleMilestone = async (milestone) => {
    if (!activeRoadmap) return;
    const isCompleted = milestone.status === 'COMPLETED';
    const nextStatus = isCompleted ? 'IN_PROGRESS' : 'COMPLETED';

    setUpdatingMilestoneId(milestone.id);
    try {
      const res = await api.patch(
        `/student/roadmaps/${activeRoadmap.id}/milestones/${milestone.id}`,
        { status: nextStatus }
      );
      // Backend returns updated roadmap response
      setActiveRoadmap(res.data);
    } catch (err) {
      console.error('Failed to update milestone:', err);
    } finally {
      setUpdatingMilestoneId(null);
    }
  };

  const handleCompleteResource = async (resourceId) => {
    if (!activeRoadmap) return;
    setUpdatingResourceId(resourceId);
    setResourceError('');
    try {
      await api.put(`/student/resources/${resourceId}/progress`, { progressPercent: 100 });
      const res = await api.get(`/student/roadmaps/${activeRoadmap.id}`);
      setActiveRoadmap(res.data);
    } catch (err) {
      console.error('Failed to update learning resource progress:', err);
      setResourceError(err.response?.data?.message || 'Could not save course completion. Please try again.');
    } finally {
      setUpdatingResourceId(null);
    }
  };

  const handleGenerateRoadmap = async (e) => {
    e.preventDefault();
    if (!selectedCareerId) return;
    setGenerating(true);
    try {
      const res = await api.post('/student/roadmaps/generate', {
        careerRoleId: Number(selectedCareerId),
      });
      setGenerateModalOpen(false);
      setActiveRoadmap(res.data);
      setRoadmaps((prev) => [res.data, ...prev]);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate roadmap.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const milestones = activeRoadmap?.milestones || [];
  const percent = Math.round(activeRoadmap?.completionPercentage || 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Personalized Career Pathway</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Dynamic milestones ordered to prioritize closing your critical skill gaps first.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {roadmaps.length > 1 && (
            <select
              value={activeRoadmap?.id || ''}
              onChange={(e) => handleSelectRoadmap(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {roadmaps.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
          )}

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setGenerateModalOpen(true)}
          >
            Generate New Roadmap
          </Button>
        </div>
      </div>

      {!activeRoadmap ? (
        <EmptyState
          icon={Milestone}
          title="No career roadmaps yet"
          description="Generate your first personalized engineering pathway tailored to your target position."
          actionLabel="Generate Career Roadmap"
          onAction={() => setGenerateModalOpen(true)}
        />
      ) : (
        <div className="space-y-6">
          {/* Active Roadmap Hero Card with Progress */}
          <Card className="bg-gradient-to-r from-navy-900 to-navy-800 text-white p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge
                    status={activeRoadmap.status}
                    label={activeRoadmap.status}
                    size="sm"
                  />
                  <span className="text-xs text-brand-300 font-medium">
                    {activeRoadmap.careerRoleTitle || 'Engineering Role'}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold">{activeRoadmap.title}</h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                  {activeRoadmap.description}
                </p>
              </div>

              {/* Progress Ring / Bar */}
              <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-2xl p-5 min-w-[200px] text-center">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Completion Progress
                </span>
                <span className="text-3xl font-extrabold text-white mt-1 block">
                  {percent}%
                </span>
                <div className="w-full bg-white/20 rounded-full h-2 mt-3 overflow-hidden">
                  <div
                    className="bg-brand-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="text-[11px] text-slate-300 mt-2 block">
                  {activeRoadmap.completedMilestones || 0} of {activeRoadmap.totalMilestones || 0} milestones completed
                </span>
              </div>
            </div>
          </Card>

          {/* Ordered Milestones Checklist */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-navy-900 tracking-tight flex items-center gap-2">
              <Milestone className="w-4 h-4 text-brand-600" />
              <span>Milestone Sequence</span>
            </h3>

            <div className="space-y-3">
              {milestones.map((m, idx) => {
                const isCompleted = m.status === 'COMPLETED';
                const isLocked = idx > 0 && milestones[idx - 1].status !== 'COMPLETED';
                const isCurrent = !isCompleted && !isLocked;

                return (
                  <Card
                    key={m.id}
                    className={`transition-all ${
                      isCompleted
                        ? 'border-emerald-200 bg-emerald-50/20'
                        : isCurrent
                        ? 'border-brand-500 shadow-card-hover'
                        : 'border-slate-200 bg-white opacity-85'
                    }`}
                  >
                    <CardBody className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {/* Checkbox button */}
                        <button
                          type="button"
                          disabled={updatingMilestoneId === m.id || (!isCompleted && !m.completionReady)}
                          onClick={() => handleToggleMilestone(m)}
                          title={!isCompleted && !m.completionReady
                            ? (m.completionBlockers || []).join(' ')
                            : undefined}
                          className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                            isCompleted
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'bg-white border-slate-300 hover:border-brand-500 text-transparent'
                          }`}
                          aria-label={`Mark milestone ${m.title} as ${isCompleted ? 'incomplete' : 'complete'}`}
                        >
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </button>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-mono font-bold text-slate-400">
                              #{m.milestoneOrder || idx + 1}
                            </span>
                            <h4 className={`text-sm font-bold ${isCompleted ? 'text-slate-500 line-through' : 'text-navy-900'}`}>
                              {m.title}
                            </h4>
                            {isCompleted ? (
                              <Badge status="COMPLETED" label="COMPLETED" size="sm" />
                            ) : isLocked ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                <Lock className="w-3 h-3" /> Locked
                              </span>
                            ) : (
                              <Badge status="IN_PROGRESS" label="IN PROGRESS" size="sm" />
                            )}
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                            {m.description}
                          </p>
                          {m.targetSkillName && (
                            <div className="mt-3 space-y-3">
                              <div className="grid gap-3 lg:grid-cols-2">
                                <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="text-xs font-bold uppercase tracking-wide text-slate-700">
                                      Required courses
                                    </p>
                                    <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                                      {m.completedResourceCount || 0}/{m.requiredResourceCount || 0} complete
                                    </span>
                                  </div>
                                  {m.learningResources?.length ? (
                                    <ul className="mt-3 space-y-2">
                                      {m.learningResources.map((resource) => (
                                        <li key={resource.id} className="rounded-lg border border-slate-200 bg-white p-3">
                                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="min-w-0">
                                              <a
                                                href={resource.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-900"
                                              >
                                                <BookOpen className="h-4 w-4 shrink-0" />
                                                <span>{resource.title}</span>
                                                <ExternalLink className="h-3 w-3 shrink-0" />
                                              </a>
                                              <p className="mt-1 text-xs text-slate-500">
                                                {resource.completed
                                                  ? 'Course completed'
                                                  : `${resource.progressPercent || 0}% complete`}
                                              </p>
                                            </div>
                                            {resource.completed ? (
                                              <span className="inline-flex items-center gap-1 self-start rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 sm:self-auto">
                                                <CheckCircle2 className="h-4 w-4" />
                                                Completed
                                              </span>
                                            ) : (
                                              <div className="flex shrink-0 flex-wrap gap-2">
                                                <a
                                                  href={resource.url}
                                                  target="_blank"
                                                  rel="noreferrer"
                                                  className="inline-flex items-center justify-center gap-1 rounded-lg border border-brand-200 bg-white px-3 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                                                >
                                                  Open course
                                                  <ExternalLink className="h-3 w-3" />
                                                </a>
                                                <button
                                                  type="button"
                                                  disabled={updatingResourceId === resource.id}
                                                  onClick={() => handleCompleteResource(resource.id)}
                                                  className="inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                                                >
                                                  <CheckCircle2 className="h-4 w-4" />
                                                  {updatingResourceId === resource.id ? 'Saving…' : 'Mark course complete'}
                                                </button>
                                              </div>
                                            )}
                                          </div>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs font-medium text-amber-800">
                                      No courses are assigned yet. This skill cannot be completed until a course is added.
                                    </p>
                                  )}
                                </section>
                                <section className="rounded-xl border border-brand-100 bg-brand-50/50 p-4">
                                  <p className="text-xs font-bold uppercase tracking-wide text-slate-700">
                                    Final skill assignment
                                  </p>
                                  <p className="mt-1 text-xs text-slate-600">
                                    Complete the course(s), then pass an assignment to finish this skill.
                                  </p>
                                  {m.assessments?.length ? (
                                    <ul className="mt-3 space-y-2">
                                      {m.assessments.map((assessment) => (
                                        <li key={assessment.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-brand-100 bg-white p-3">
                                          <a
                                            href={`/skills?tab=assessments&skillId=${m.targetSkillId}`}
                                            className="text-sm font-semibold text-brand-700 hover:text-brand-900"
                                          >
                                            {assessment.title}
                                          </a>
                                          {assessment.passed ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                              <CheckCircle2 className="h-3.5 w-3.5" />
                                              Passed
                                            </span>
                                          ) : (
                                            <a
                                              href={`/skills?tab=assessments&skillId=${m.targetSkillId}`}
                                              className="inline-flex items-center rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700"
                                            >
                                              Start assignment
                                            </a>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="mt-3 rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-700">
                                      No active assignment is available yet. This skill cannot be completed until one is added.
                                    </p>
                                  )}
                                </section>
                              </div>
                              {resourceError && (
                                <p role="alert" className="text-xs font-medium text-rose-700">
                                  {resourceError}
                                </p>
                              )}
                              {!m.completionReady && m.completionBlockers?.length > 0 && (
                                <p className="text-xs font-medium text-amber-700">
                                  To unlock completion: {m.completionBlockers.join(' ')}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Timeline & Estimated Weeks */}
                      <div className="flex items-center gap-4 shrink-0 sm:border-l sm:border-slate-100 sm:pl-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          {m.estimatedWeeks || 2} Weeks
                        </span>
                        {m.targetSkillName && (
                          <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            {m.targetSkillName}
                          </span>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* GENERATE ROADMAP MODAL */}
      {generateModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-elevated border border-slate-200 max-w-md w-full p-6">
            <h3 className="text-base font-bold text-navy-900 mb-2">Generate Dynamic Roadmap</h3>
            <p className="text-xs text-slate-500 mb-4">
              Select an engineering role to auto-construct an ordered pathway that addresses your largest competency deficiencies first.
            </p>

            <form onSubmit={handleGenerateRoadmap} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Career Role
                </label>
                <select
                  required
                  value={selectedCareerId}
                  onChange={(e) => setSelectedCareerId(e.target.value)}
                  className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {careers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2.5">
                <Button variant="secondary" size="sm" onClick={() => setGenerateModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" loading={generating}>
                  Generate Pathway
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadmapPage;
