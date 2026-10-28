import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Target,
  CheckCircle2,
  TrendingUp,
  Award,
  GitCompare,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Skeleton, { CardSkeleton } from '../../components/common/Skeleton';

export const CareersPage = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [targetGoal, setTargetGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settingGoalId, setSettingGoalId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchCareersAndGoal = async () => {
    setLoading(true);
    try {
      const [recRes, goalRes] = await Promise.all([
        api.post('/student/career-recommendations/generate'),
        api.get('/student/career-goals'),
      ]);
      setRecommendations(recRes.data || []);
      setTargetGoal(goalRes.data || null);
    } catch (err) {
      console.error('Failed to load career recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCareersAndGoal();
  }, []);

  const handleSetTargetCareer = async (careerId, title) => {
    setSettingGoalId(careerId);
    setSuccessMsg('');
    try {
      const res = await api.post('/student/career-goals', { careerRoleId: careerId });
      setTargetGoal(res.data);
      setSuccessMsg(`Target career set to "${title}". Your roadmap and skill gaps have been dynamically updated.`);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      console.error('Failed to set career goal:', err);
    } finally {
      setSettingGoalId(null);
    }
  };

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Career Recommendations</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Recommendations use your assessment and resume-imported skills, with your profile career preference prioritized.
          </p>
        </div>

        {targetGoal && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-50 border border-brand-200 text-xs font-semibold text-brand-800">
            <Target className="w-4 h-4 text-brand-600" />
            <span>Target Role: {targetGoal.careerRoleTitle || 'Full Stack Engineer'}</span>
          </div>
        )}
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.map((rec) => {
          const isTarget = targetGoal?.careerRoleId === rec.careerId;
          const matchPercent = Math.round(rec.matchScore || 0);

          return (
            <Card
              key={rec.careerId}
              className={`flex flex-col justify-between transition-all ${
                isTarget ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-card-hover' : ''
              }`}
            >
              <CardBody className="p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                      {rec.industry || 'Engineering Pathway'}
                    </span>
                    <h3 className="text-lg font-bold text-navy-900 mt-0.5">{rec.title}</h3>
                    {rec.profilePreferred && (
                      <span className="mt-1 inline-flex text-[10px] font-semibold text-brand-700">
                        Matches your profile preference
                      </span>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-2xl font-extrabold text-brand-600 block leading-tight">
                      {matchPercent}%
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Skill Match</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {rec.description}
                </p>

                {/* Match Progress Bar */}
                <div className="mb-4">
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        matchPercent >= 75
                          ? 'bg-emerald-500'
                          : matchPercent >= 50
                          ? 'bg-brand-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${matchPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 font-medium">
                    <span>{rec.matchedSkillCount || 0} of {rec.totalRequiredSkills || 0} required skills met</span>
                    <span>{matchPercent >= 75 ? 'Strong' : matchPercent >= 50 ? 'Developing' : 'Emerging'}</span>
                  </div>
                </div>

                {/* Explainable Recommendation Reason */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1 mb-4">
                  <div className="flex items-center gap-1.5 font-semibold text-navy-900">
                    <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                    <span>Why This Matches You</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{rec.explanation}</p>
                </div>

                {/* Key Required Skills Badges */}
              </CardBody>

              {/* Action Footer */}
              <div className="p-4 bg-slate-50/70 border-t border-slate-100 rounded-b-xl flex items-center justify-between gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={GitCompare}
                  onClick={() => navigate(`/skill-gap?careerId=${rec.careerId}`)}
                >
                  View Gap Details
                </Button>

                {isTarget ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4" />
                    Active Target Role
                  </span>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Target}
                    loading={settingGoalId === rec.careerId}
                    onClick={() => handleSetTargetCareer(rec.careerId, rec.title)}
                  >
                    Set As Target Role
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CareersPage;
