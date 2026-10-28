import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CheckSquare, 
  Clock, 
  Award, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  RotateCcw,
  BarChart2,
  TrendingUp,
  HelpCircle
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { SkeletonLoader, StatusBadge, ConfirmationDialog, EmptyState } from '../components/UIState';

export default function SkillsPage() {
  const [assessmentState, setAssessmentState] = useState('LIST'); // 'LIST' | 'IN_PROGRESS' | 'RESULT'
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch available assessments
  useEffect(() => {
    async function loadAssessments() {
      setLoading(true);
      try {
        const res = await axios.get('/assessment/list');
        setAssessments(res.data.assessments || []);
      } catch (err) {
        console.error('Error fetching assessments', err);
      } finally {
        setLoading(false);
      }
    }
    loadAssessments();
  }, []);

  // Timer countdown
  useEffect(() => {
    let timer;
    if (assessmentState === 'IN_PROGRESS' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitAssessment();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [assessmentState, timeLeft]);

  const handleStartAssessment = async (assessment) => {
    try {
      setLoading(true);
      const res = await axios.get(`/assessment/${assessment.id}`);
      setSelectedAssessment(res.data.assessment);
      setCurrentQuestionIdx(0);
      setAnswers({});
      setTimeLeft(res.data.assessment.duration_minutes ? res.data.assessment.duration_minutes * 60 : 600);
      setAssessmentState('IN_PROGRESS');
    } catch (err) {
      alert('Failed to load assessment questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionIdx) => {
    setAnswers({ ...answers, [questionId]: optionIdx });
  };

  const handleSubmitAssessment = async () => {
    setShowSubmitModal(false);
    setSubmitting(true);
    try {
      const res = await axios.post(`/assessment/${selectedAssessment.id}/submit`, {
        answers
      });
      setResult(res.data);
      setAssessmentState('RESULT');
    } catch (err) {
      alert('Error submitting assessment.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading && assessmentState === 'LIST') {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <SkeletonLoader count={3} className="h-28" />
      </div>
    );
  }

  // RENDER: QUIZ IN PROGRESS
  if (assessmentState === 'IN_PROGRESS' && selectedAssessment) {
    const questions = selectedAssessment.questions || [];
    const currentQ = questions[currentQuestionIdx];
    const answeredCount = Object.keys(answers).length;
    const progressPct = Math.round((answeredCount / Math.max(1, questions.length)) * 100);

    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        {/* Sticky Header with Timer & Progress */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between gap-4 sticky top-20 z-20">
          <div>
            <h2 className="text-base font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
              {selectedAssessment.title}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-500 font-semibold">
                Question {currentQuestionIdx + 1} of {questions.length}
              </span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs font-bold text-brand-700">{progressPct}% Answered</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold border ${
              timeLeft < 120 ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse' : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              <Clock className="w-4 h-4 text-slate-500" />
              <span>{formatTimer(timeLeft)}</span>
            </div>

            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow transition"
            >
              Submit Quiz
            </button>
          </div>
        </div>

        {/* Question Navigation Bubbles */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap gap-2">
          {questions.map((q, idx) => {
            const isAnswered = answers[q.id] !== undefined;
            const isCurrent = currentQuestionIdx === idx;
            return (
              <button
                key={q.id || idx}
                onClick={() => setCurrentQuestionIdx(idx)}
                className={`w-9 h-9 rounded-xl text-xs font-bold transition flex items-center justify-center border ${
                  isCurrent
                    ? 'bg-brand-800 text-white border-brand-900 shadow-md'
                    : isAnswered
                    ? 'bg-blue-100 text-blue-900 border-blue-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Current Question Card */}
        {currentQ && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div>
              <span className="text-[11px] font-bold text-brand-700 uppercase tracking-wider bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100">
                Question #{currentQuestionIdx + 1}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-3 leading-relaxed">
                {currentQ.question_text || currentQ.question}
              </h3>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {(currentQ.options || []).map((opt, optIdx) => {
                const isSelected = answers[currentQ.id] === optIdx;
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(currentQ.id, optIdx)}
                    className={`w-full p-4 rounded-2xl text-left text-xs sm:text-sm font-semibold transition flex items-center justify-between border ${
                      isSelected
                        ? 'bg-brand-50 border-brand-600 text-brand-900 shadow-sm ring-2 ring-brand-100'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                        isSelected ? 'bg-brand-800 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-brand-700 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                disabled={currentQuestionIdx === 0}
                onClick={() => setCurrentQuestionIdx((p) => p - 1)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 transition flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              {currentQuestionIdx < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIdx((p) => p + 1)}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-800 hover:bg-brand-700 transition flex items-center gap-1 shadow"
                >
                  Next Question <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition flex items-center gap-1 shadow"
                >
                  Review & Submit
                </button>
              )}
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={showSubmitModal}
          title="Submit Assessment"
          message={`You have answered ${answeredCount} of ${questions.length} questions. Are you ready to submit and calculate your proficiency band?`}
          confirmText={submitting ? 'Submitting...' : 'Yes, Submit Now'}
          onConfirm={handleSubmitAssessment}
          onCancel={() => setShowSubmitModal(false)}
        />
      </div>
    );
  }

  // RENDER: RESULTS VIEW
  if (assessmentState === 'RESULT' && result) {
    const { 
      scorePercentage = 80, 
      proficiencyBand = 'Advanced', 
      strengths = ['Core Algorithms', 'State Management'], 
      weaknesses = ['System Scaling', 'Database Indexing'], 
      nextSteps = ['Complete Module 4 on DB Indexing', 'Build a production microservice'],
      skillScores = [
        { skill: 'React.js', score: 85 },
        { skill: 'Node.js', score: 75 },
        { skill: 'PostgreSQL', score: 65 },
        { skill: 'System Design', score: 70 },
      ]
    } = result;

    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Assessment Completed
          </span>
          <h1 className="text-3xl font-display font-black text-slate-900 mt-3">
            Your Score: {scorePercentage}%
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Proficiency Band: <strong className="text-brand-900">{proficiencyBand}</strong>
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => {
                setAssessmentState('LIST');
                setSelectedAssessment(null);
              }}
              className="px-5 py-2.5 rounded-xl bg-brand-800 hover:bg-brand-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <RotateCcw className="w-4 h-4" />
              Take Another Assessment
            </button>
          </div>
        </div>

        {/* Skill Scores Bar Chart */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-brand-700" />
            Skill Breakdown Score Chart
          </h2>
          <p className="text-xs text-slate-500 mb-6">Comparative score distribution across tested competencies</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillScores} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="skill" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B192C', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="score" fill="#1E40AF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strengths & Weaknesses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Demonstrated Strengths
            </h3>
            <ul className="space-y-2">
              {strengths.map((str, idx) => (
                <li key={idx} className="p-2.5 rounded-xl bg-emerald-50 text-xs font-semibold text-emerald-900 border border-emerald-100">
                  {str}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-rose-800 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              Identified Focus Areas (Gaps)
            </h3>
            <ul className="space-y-2">
              {weaknesses.map((w, idx) => (
                <li key={idx} className="p-2.5 rounded-xl bg-rose-50 text-xs font-semibold text-rose-900 border border-rose-100">
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Next Steps Card */}
        <div className="bg-[#F0F7FF] rounded-3xl p-6 border border-blue-200 shadow-sm">
          <h3 className="text-sm font-bold text-brand-900 mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-700" />
            Recommended Next Steps
          </h3>
          <ul className="space-y-2">
            {nextSteps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-700 mt-1.5 shrink-0" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // RENDER: LIST OF AVAILABLE ASSESSMENTS
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100">
            Skill Verification Engine
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 mt-2">
            Interactive Skill Assessments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Calibrate your skill proficiency band with timed industry assessments and grounded questions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assessments.map((a) => (
          <div key={a.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <StatusBadge status="ACTIVE" label={a.category || 'Engineering'} />
                <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {a.duration_minutes || 10} Mins
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">{a.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                {a.description || 'Test your foundational principles, runtime nuances, and problem-solving patterns.'}
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-600 mb-6 font-semibold">
                <CheckSquare className="w-4 h-4 text-brand-600" />
                <span>{a.questions_count || 5} Questions</span>
              </div>
            </div>

            <button
              onClick={() => handleStartAssessment(a)}
              className="w-full py-2.5 rounded-xl bg-brand-800 hover:bg-brand-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow transition"
            >
              Start Assessment
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
