import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Award,
  Search,
  Plus,
  Play,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  X,
  TrendingUp,
  BarChart3,
  Sparkles,
  FileText,
  UploadCloud
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Skeleton, { CardSkeleton } from '../../components/common/Skeleton';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import EmptyState from '../../components/common/EmptyState';

export const SkillsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'assessments' ? 'assessments' : 'inventory';
  const [activeTab, setActiveTab] = useState(initialTab); // inventory | assessments
  const [studentSkills, setStudentSkills] = useState([]);
  const [catalogSkills, setCatalogSkills] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [resumeProfile, setResumeProfile] = useState(null);
  const [generatingAssessment, setGeneratingAssessment] = useState(false);
  const [generateMessage, setGenerateMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add Skill Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [selectedProficiency, setSelectedProficiency] = useState(1);
  const [addingSkill, setAddingSkill] = useState(false);
  const [addError, setAddError] = useState('');

  // Assessment Quiz State
  const [activeQuiz, setActiveQuiz] = useState(null); // { attemptId, assessment, questions, currentIndex, answers, timeRemainingSeconds }
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  const fetchSkillsAndAssessments = async () => {
    setLoading(true);
    try {
      const [skillsRes, catalogRes, assessRes, profileRes] = await Promise.all([
        api.get('/skills/my'),
        api.get('/skills?page=0&size=100'),
        api.get('/assessments'),
        api.get('/assessments/resume-profile').catch(() => ({ data: null })),
      ]);
      setStudentSkills(skillsRes.data || []);
      setCatalogSkills(catalogRes.data?.content || []);
      setAssessments(assessRes.data || []);
      setResumeProfile(profileRes.data || null);
    } catch (err) {
      console.error('Failed to load skills:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkillsAndAssessments();
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'assessments') {
      setActiveTab('assessments');
    } else if (tabParam === 'inventory') {
      setActiveTab('inventory');
    }
  }, [searchParams]);

  const handleGenerateResumeAssessment = async () => {
    setGeneratingAssessment(true);
    setGenerateMessage('');
    try {
      const res = await api.post('/assessments/resume-generate');
      setGenerateMessage('Assessment questions successfully generated from your resume credentials!');
      await fetchSkillsAndAssessments();
      setTimeout(() => setGenerateMessage(''), 5000);
      if (res.data) {
        handleStartAssessment(res.data);
      }
    } catch (err) {
      console.error('Failed to generate resume assessment:', err);
      alert(err.response?.data?.message || 'Failed to generate assessment. Please ensure a resume is uploaded in Profile.');
    } finally {
      setGeneratingAssessment(false);
    }
  };

  // Timer countdown for active assessment
  useEffect(() => {
    if (!activeQuiz || activeQuiz.timeRemainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setActiveQuiz((prev) => {
        if (!prev) return null;
        if (prev.timeRemainingSeconds <= 1) {
          clearInterval(timer);
          // Auto submit when time runs out
          handleForceSubmit(prev);
          return { ...prev, timeRemainingSeconds: 0 };
        }
        return { ...prev, timeRemainingSeconds: prev.timeRemainingSeconds - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeQuiz]);

  const handleStartAssessment = async (assessment) => {
    try {
      let res;
      try {
        res = await api.post(`/assessments/${assessment.id}/start`);
      } catch (postErr) {
        res = await api.post(`/assessments/${assessment.id}/attempts`);
      }
      const attempt = res.data;
      let questions = attempt.questions || [];
      if (!questions || questions.length === 0) {
        const detailRes = await api.get(`/assessments/${assessment.id}`);
        questions = detailRes.data?.questions || [];
      }

      setActiveQuiz({
        attemptId: attempt.id,
        assessment,
        questions,
        currentIndex: 0,
        answers: {}, // questionId -> [selectedOptionIds]
        timeRemainingSeconds: (assessment.durationMinutes || assessment.timeLimitMinutes || 15) * 60,
      });
      setQuizResult(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start assessment. Please try again.');
    }
  };

  const handleSelectOption = (questionId, optionId, isMultiple = false) => {
    setActiveQuiz((prev) => {
      if (!prev) return null;
      const current = prev.answers[questionId] || [];
      let updated;
      if (isMultiple) {
        updated = current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId];
      } else {
        updated = [optionId];
      }
      return {
        ...prev,
        answers: { ...prev.answers, [questionId]: updated },
      };
    });
  };

  const handleForceSubmit = async (quizState) => {
    setQuizSubmitting(true);
    try {
      const payloadAnswers = Object.entries(quizState.answers).map(([qId, optIds]) => ({
        questionId: Number(qId),
        selectedOptionIds: optIds,
      }));

      const res = await api.post(`/assessments/attempts/${quizState.attemptId}/submit`, {
        answers: payloadAnswers,
      });

      setQuizResult(res.data);
      setActiveQuiz(null);
      setSubmitModalOpen(false);
      fetchSkillsAndAssessments();
    } catch (err) {
      console.error('Submit assessment error:', err);
      alert('Failed to submit assessment answers. Please verify your connection.');
    } finally {
      setQuizSubmitting(false);
    }
  };

  const handleAddSelfReportedSkill = async (e) => {
    e.preventDefault();
    if (!selectedSkillId) return;
    setAddingSkill(true);
    setAddError('');
    try {
      await api.post('/skills/my', {
        skillId: Number(selectedSkillId),
        selfReportedProficiency: Number(selectedProficiency),
      });
      setAddModalOpen(false);
      setSelectedSkillId('');
      fetchSkillsAndAssessments();
    } catch (err) {
      setAddError(err.response?.data?.message || 'Skill already in your inventory.');
    } finally {
      setAddingSkill(false);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getProficiencyLabel = (lvl) => {
    switch (lvl) {
      case 4: return 'Expert';
      case 3: return 'Advanced';
      case 2: return 'Intermediate';
      case 1: return 'Beginner';
      default: return 'Unassessed';
    }
  };

  // Filter skills by search
  const filteredSkills = studentSkills.filter((s) =>
    s.skillName?.toLowerCase().includes(search.toLowerCase()) ||
    s.categoryName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Skills & Assessments</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Validate technical mastery through server-scored assessments and maintain your verified competency inventory.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            icon={Plus}
            onClick={() => {
              setAddError('');
              setAddModalOpen(true);
            }}
          >
            Add Self-Reported Skill
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'inventory'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          My Skill Inventory ({studentSkills.length})
        </button>
        <button
          onClick={() => setActiveTab('assessments')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'assessments'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Available Assessments ({assessments.length})
        </button>
      </div>

      {/* TAB 1: Skill Inventory */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by skill name or category..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : filteredSkills.length === 0 ? (
            <EmptyState
              title="No skills found"
              description="Add your first engineering skill or take an assessment to build your portfolio."
              actionLabel="Add Skill"
              onAction={() => setAddModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSkills.map((sk) => {
                const effectiveLevel = sk.assessedProficiency || sk.selfReportedProficiency || 1;
                const isVerified = sk.assessedProficiency != null;
                const percent = (effectiveLevel / 4) * 100;

                return (
                  <Card key={sk.id} hover className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs text-slate-400 font-medium block">
                          {sk.categoryName || 'Technical Skill'}
                        </span>
                        <h3 className="text-base font-bold text-navy-900 mt-0.5">{sk.skillName}</h3>
                      </div>
                      <Badge
                        status={isVerified ? 'VERIFIED' : 'PENDING'}
                        label={isVerified ? 'VERIFIED' : 'SELF-REPORTED'}
                        size="sm"
                      />
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-500 font-medium">
                          {getProficiencyLabel(effectiveLevel)} (Level {effectiveLevel}/4)
                        </span>
                        <span className="font-bold text-navy-900">{percent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            isVerified ? 'bg-emerald-500' : 'bg-brand-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {!isVerified && (
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-amber-600 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Unverified
                        </span>
                        <button
                          onClick={() => setActiveTab('assessments')}
                          className="text-xs font-semibold text-brand-600 hover:text-brand-800"
                        >
                          Verify with Quiz →
                        </button>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Assessments Catalog */}
      {activeTab === 'assessments' && (
        <div className="space-y-6">
          {searchParams.get('skillId') && (
            <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-900">
              Showing assessments for the selected roadmap skill. Pass an assessment to unlock its milestone.
            </div>
          )}
          {/* Resume Personalization Banner */}
          <div className="bg-gradient-to-r from-navy-900 via-brand-900 to-indigo-900 rounded-2xl p-6 text-white shadow-elevated border border-brand-500/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-400/30">
                  <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                  <span>Resume-Tailored Assessment Engine</span>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Questions Tailored Directly to Your Uploaded Resume
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  {resumeProfile?.hasResume
                    ? `SkillLens parsed "${resumeProfile.resumeFilename}" and extracted your technologies, qualifications, and project background. All evaluations below are aligned to your document.`
                    : 'Upload your resume in Profile to automatically calibrate assessment questions to your specific technologies, qualifications, and project experience.'}
                </p>
                {resumeProfile?.skills && resumeProfile.skills.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-xs text-brand-300 font-semibold mr-1">Detected in Resume:</span>
                    {resumeProfile.skills.slice(0, 6).map((s, idx) => (
                      <span key={idx} className="text-[11px] bg-white/10 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-400/30 font-medium">
                        {s.skillName || s}
                      </span>
                    ))}
                    {resumeProfile.skills.length > 6 && (
                      <span className="text-[11px] text-slate-400">+{resumeProfile.skills.length - 6} more</span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <Button
                  variant="primary"
                  icon={Sparkles}
                  loading={generatingAssessment}
                  onClick={handleGenerateResumeAssessment}
                  className="bg-brand-500 hover:bg-brand-400 text-white shadow-sm font-semibold whitespace-nowrap"
                >
                  Generate Resume Assessment
                </Button>
              </div>
            </div>

            {generateMessage && (
              <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{generateMessage}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {assessments
              .filter((assessment) => !searchParams.get('skillId')
                || String(assessment.skillId) === searchParams.get('skillId'))
              .map((a) => {
              const isPersonalized = Boolean(a.isResumePersonalized);
              return (
                <Card
                  key={a.id}
                  hover
                  className={`flex flex-col justify-between transition-all ${
                    isPersonalized
                      ? 'border-2 border-brand-500 shadow-md ring-2 ring-brand-400/20 bg-gradient-to-b from-brand-50/30 to-white'
                      : ''
                  }`}
                >
                  <CardBody className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${
                        isPersonalized
                          ? 'text-brand-800 bg-brand-100 border-brand-300'
                          : 'text-brand-700 bg-brand-50 border-brand-200'
                      }`}>
                        {a.categoryName || 'Engineering Assessment'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isPersonalized ? (
                          <span className="text-[10px] font-bold text-brand-700 bg-brand-100 px-2 py-0.5 rounded-full border border-brand-300 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-brand-600" />
                            Resume Personalized
                          </span>
                        ) : a.isResumeSkill ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Resume Skill
                          </span>
                        ) : null}
                        <Badge status="ACTIVE" label="ACTIVE" size="sm" />
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-navy-900 mb-2">{a.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4">
                      {a.description || 'Evaluate your core understanding and earn verified server-scored proficiency levels.'}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {a.durationMinutes || 15} Mins
                      </span>
                      <span className="flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                        {a.questionCount || 10} Questions
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-slate-400" />
                        Pass: {a.passingScore || 70}%
                      </span>
                    </div>
                  </CardBody>

                  <div className="p-4 bg-slate-50 rounded-b-xl border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {isPersonalized ? 'Calibrated to Resume' : 'Timed attempt'}
                    </span>
                    <Button
                      variant={isPersonalized ? 'primary' : 'secondary'}
                      size="sm"
                      icon={Play}
                      onClick={() => handleStartAssessment(a)}
                    >
                      Start Assessment
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ACTIVE QUIZ MODAL OVERLAY */}
      {activeQuiz && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-elevated border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Quiz Top Header */}
            <div className="p-4 sm:p-5 bg-navy-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs text-brand-300 font-semibold tracking-wider uppercase block">
                  SkillLens Assessment Session
                </span>
                <h2 className="text-base sm:text-lg font-bold">{activeQuiz.assessment?.title}</h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-lg bg-navy-800 border border-navy-700 flex items-center gap-2 font-mono text-sm font-bold text-amber-400">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(activeQuiz.timeRemainingSeconds)}</span>
                </div>
              </div>
            </div>

            {/* Progress Bar & Question Nav Bar */}
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">
                Question {activeQuiz.currentIndex + 1} of {activeQuiz.questions.length}
              </span>
              <div className="flex gap-1.5 overflow-x-auto py-1">
                {activeQuiz.questions.map((q, idx) => {
                  const isAnswered = (activeQuiz.answers[q.id] || []).length > 0;
                  const isCurrent = idx === activeQuiz.currentIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setActiveQuiz({ ...activeQuiz, currentIndex: idx })}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-navy-900 text-white ring-2 ring-brand-500'
                          : isAnswered
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question Body */}
            {activeQuiz.questions.length > 0 && (
              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                {(() => {
                  const currentQ = activeQuiz.questions[activeQuiz.currentIndex];
                  const selectedOpts = activeQuiz.answers[currentQ.id] || [];

                  return (
                    <div className="space-y-4">
                      <div className="text-base sm:text-lg font-semibold text-navy-900 leading-snug">
                        {currentQ.questionText}
                      </div>

                      <div className="space-y-3 pt-2">
                        {currentQ.options?.map((opt) => {
                          const isSelected = selectedOpts.includes(opt.id);
                          return (
                            <div
                              key={opt.id}
                              onClick={() => handleSelectOption(currentQ.id, opt.id, false)}
                              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                                isSelected
                                  ? 'border-brand-600 bg-brand-50/70 shadow-xs'
                                  : 'border-slate-200 hover:border-slate-300 bg-white'
                              }`}
                            >
                              <div
                                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? 'border-brand-600 bg-brand-600 text-white'
                                    : 'border-slate-300 bg-white'
                                }`}
                              >
                                {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                              </div>
                              <span className="text-sm text-slate-800">{opt.optionText}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Quiz Action Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <Button
                variant="secondary"
                size="sm"
                icon={ArrowLeft}
                disabled={activeQuiz.currentIndex === 0}
                onClick={() => setActiveQuiz({ ...activeQuiz, currentIndex: activeQuiz.currentIndex - 1 })}
              >
                Previous
              </Button>

              <div className="flex gap-2">
                {activeQuiz.currentIndex < activeQuiz.questions.length - 1 ? (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={ArrowRight}
                    iconPosition="right"
                    onClick={() => setActiveQuiz({ ...activeQuiz, currentIndex: activeQuiz.currentIndex + 1 })}
                  >
                    Next Question
                  </Button>
                ) : (
                  <Button
                    variant="brand"
                    size="sm"
                    onClick={() => setSubmitModalOpen(true)}
                  >
                    Submit Assessment
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBMIT CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        onConfirm={() => handleForceSubmit(activeQuiz)}
        title="Submit Skill Assessment?"
        message="Are you ready to submit your answers? The server will immediately grade your attempt and establish your verified proficiency band."
        confirmText="Yes, Submit Answers"
        variant="primary"
        loading={quizSubmitting}
      />

      {/* QUIZ RESULT MODAL */}
      {quizResult && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-elevated border border-slate-200 w-full max-w-xl p-6 sm:p-8 animate-in zoom-in-95 duration-150">
            <div className="text-center">
              <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 ${
                quizResult.passed ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
              }`}>
                {quizResult.passed ? <CheckCircle2 className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
              </div>

              <h2 className="text-2xl font-bold text-navy-900">
                {quizResult.passed ? 'Assessment Completed!' : 'Assessment Finished'}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Your score has been verified and registered with SkillLens.
              </p>
            </div>

            {/* Score & Proficiency Box */}
            <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-4 text-center">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Raw Score</span>
                <span className="text-2xl font-extrabold text-navy-900">
                  {quizResult.score} / {quizResult.maxScore}
                </span>
                <span className="text-xs text-slate-500 block">
                  ({Math.round((quizResult.score / (quizResult.maxScore || 1)) * 100)}%)
                </span>
              </div>
              <div className="border-l border-slate-200">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Assessed Band</span>
                <span className="text-2xl font-extrabold text-brand-600">
                  Level {quizResult.assessedProficiency}
                </span>
                <span className="text-xs text-slate-500 block">
                  {getProficiencyLabel(quizResult.assessedProficiency)}
                </span>
              </div>
            </div>

            {/* Bar Chart of Result */}
            <div className="mt-6">
              <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Performance Comparison</h4>
              <div className="h-36 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Your Score', value: quizResult.score },
                    { name: 'Passing Goal', value: Math.ceil((quizResult.maxScore || 10) * 0.7) },
                    { name: 'Max Score', value: quizResult.maxScore },
                  ]}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0267ca" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <Button
                variant="primary"
                size="md"
                onClick={() => setQuizResult(null)}
                className="w-full sm:w-auto"
              >
                Close & View Updated Inventory
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ADD SELF-REPORTED SKILL MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-elevated border border-slate-200 max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-navy-900">Add Self-Reported Skill</h3>
              <button onClick={() => setAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {addError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleAddSelfReportedSkill} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Catalog Skill *
                </label>
                <select
                  required
                  value={selectedSkillId}
                  onChange={(e) => setSelectedSkillId(e.target.value)}
                  className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">-- Choose a skill --</option>
                  {catalogSkills.map((sk) => (
                    <option key={sk.id} value={sk.id}>
                      {sk.name} ({sk.categoryName || 'General'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Your Current Self-Reported Proficiency
                </label>
                <select
                  value={selectedProficiency}
                  onChange={(e) => setSelectedProficiency(e.target.value)}
                  className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="1">Level 1 - Beginner (Foundational syntax)</option>
                  <option value="2">Level 2 - Intermediate (Built small projects)</option>
                  <option value="3">Level 3 - Advanced (Production experience)</option>
                  <option value="4">Level 4 - Expert (System design & architecture)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2.5">
                <Button variant="secondary" size="sm" onClick={() => setAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" loading={addingSkill}>
                  Add Skill
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsPage;
