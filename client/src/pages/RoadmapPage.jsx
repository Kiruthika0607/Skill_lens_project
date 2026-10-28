import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Milestone, 
  CheckCircle2, 
  Lock, 
  Unlock, 
  Clock, 
  BookOpen, 
  Award, 
  ArrowRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { SkeletonLoader, StatusBadge, EmptyState } from '../components/UIState';

export default function RoadmapPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  const fetchRoadmap = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/roadmap');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load roadmap', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleToggleStep = async (stepId, currentStatus) => {
    setTogglingId(stepId);
    try {
      const nextStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      const res = await axios.post('/roadmap/toggle-step', {
        stepId,
        status: nextStatus
      });

      // Update local state with returned milestones and progress
      setData((prev) => ({
        ...prev,
        progressPercentage: res.data.progressPercentage,
        completedCount: res.data.completedCount,
        milestones: res.data.milestones || prev.milestones
      }));
    } catch (err) {
      alert('Failed to update step status.');
    } finally {
      setTogglingId(null);
    }
  };

  if (loading && !data) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <SkeletonLoader count={4} className="h-28" />
      </div>
    );
  }

  const {
    careerTitle = 'Full Stack Software Engineer',
    progressPercentage = 35,
    milestones = []
  } = data || {};

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100">
            Sequential Learning Roadmap
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 mt-2">
            Career Milestone Progression: {careerTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Ordered dependencies calibrated from basic prerequisites to complex full-stack deployment
          </p>
        </div>

        {/* Progress Circular / Bar Indicator */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 min-w-[200px] shrink-0">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
            <span>Overall Completion</span>
            <span className="text-brand-800">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-brand-700 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Milestones List */}
      <div className="space-y-4">
        {milestones.length === 0 ? (
          <EmptyState title="No milestones configured" description="Select a target career on the Careers page to generate a milestone track." />
        ) : (
          milestones.map((m, idx) => {
            const isCompleted = m.status === 'COMPLETED';
            const isLocked = m.is_locked;
            const isToggling = togglingId === m.id;

            return (
              <div
                key={m.id || idx}
                className={`rounded-3xl p-6 border transition-all ${
                  isCompleted
                    ? 'bg-emerald-50/40 border-emerald-200 shadow-sm'
                    : isLocked
                    ? 'bg-slate-100/60 border-slate-200 opacity-70'
                    : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Checkbox / Lock Icon */}
                    <div className="mt-1">
                      {isLocked ? (
                        <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center">
                          <Lock className="w-4 h-4" />
                        </div>
                      ) : (
                        <button
                          onClick={() => handleToggleStep(m.id, m.status)}
                          disabled={isToggling}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center transition border ${
                            isCompleted
                              ? 'bg-emerald-600 border-emerald-700 text-white shadow-sm'
                              : 'bg-white hover:bg-brand-50 border-slate-300 text-transparent hover:text-brand-600'
                          }`}
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    {/* Step Details */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Step {idx + 1}
                        </span>
                        {isLocked && <StatusBadge status="PENDING" label="Locked: Complete Prerequisites" size="sm" />}
                        {isCompleted && <StatusBadge status="COMPLETED" label="Milestone Completed" size="sm" />}
                      </div>

                      <h3 className={`text-base font-bold ${isCompleted ? 'text-emerald-950 line-through opacity-80' : 'text-slate-900'}`}>
                        {m.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">
                        {m.description}
                      </p>

                      {/* Estimated time & deliverables */}
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          Est. Duration: {m.estimated_duration || '2 Weeks'}
                        </span>
                        {m.required_skill && (
                          <span className="flex items-center gap-1 font-semibold text-brand-800">
                            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                            Target Skill: {m.required_skill}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Action */}
                  <div className="flex items-center gap-2 sm:self-center shrink-0">
                    {!isLocked && (
                      <button
                        onClick={() => handleToggleStep(m.id, m.status)}
                        disabled={isToggling}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                          isCompleted
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            : 'bg-brand-800 hover:bg-brand-700 text-white shadow'
                        }`}
                      >
                        {isToggling ? 'Updating...' : isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
