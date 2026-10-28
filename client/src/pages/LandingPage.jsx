import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Compass, 
  ArrowRight, 
  TrendingUp, 
  CheckCircle2, 
  Target, 
  Layers, 
  ShieldCheck, 
  Cpu, 
  Users, 
  Award, 
  BookOpen, 
  Sparkles 
} from 'lucide-react';

export default function LandingPage() {
  const { user, demoLogin } = useAuth();

  return (
    <div className="min-h-screen bg-[#F0F7FF] text-slate-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Smart India Hackathon • Engineering Graduate Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-slate-900 tracking-tight leading-tight">
              Bridge the Gap Between <span className="text-brand-700">Academics</span> and <span className="text-brand-900">Industry Reality</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed">
              <strong className="text-slate-800">SkillLens</strong> analyzes real-time job demand signals across engineering sectors, quantifies personal skill gaps, and generates step-by-step career roadmaps with verified opportunities.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-brand-800 hover:bg-brand-700 text-white font-bold text-sm shadow-xl shadow-brand-900/20 flex items-center justify-center gap-2 transition"
                >
                  Go to Student Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-brand-800 hover:bg-brand-700 text-white font-bold text-sm shadow-xl shadow-brand-900/20 flex items-center justify-center gap-2 transition"
                  >
                    Start Free Student Assessment
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => demoLogin('student')}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-brand-900 font-semibold text-sm border border-slate-300 shadow-sm flex items-center justify-center gap-2 transition"
                  >
                    Demo Student Login
                  </button>

                  <button
                    onClick={() => demoLogin('admin')}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-sm flex items-center justify-center gap-2 transition"
                  >
                    Demo Admin Console
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Quick Metrics Banner */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
              <p className="text-3xl font-display font-black text-brand-900">1,250+</p>
              <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Live Job Signals Analyzed</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
              <p className="text-3xl font-display font-black text-emerald-600">48</p>
              <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Standardized Tech Skills</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
              <p className="text-3xl font-display font-black text-brand-700">14</p>
              <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Verified Opportunities</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
              <p className="text-3xl font-display font-black text-indigo-600">100%</p>
              <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Explainable Gap Formula</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Intelligence Pipeline */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">
              Grounded End-to-End Architecture
            </span>
            <h2 className="text-3xl font-display font-bold text-slate-900 mt-2">
              How SkillLens Connects Real Signals to Real Action
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-[#F0F7FF] border border-blue-100 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold mb-4 shadow">
                  1
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Demand Aggregation</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ingests job descriptions from top employers (Zoho, TCS, Amazon, Swiggy) to track active skill frequencies.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-200/60 flex items-center gap-1.5 text-xs font-semibold text-blue-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Raw signal deduplication
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#F0F7FF] border border-blue-100 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold mb-4 shadow">
                  2
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Skill Normalization</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Maps messy keywords to an engineering taxonomy with minimum proficiency thresholds and weights.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-200/60 flex items-center gap-1.5 text-xs font-semibold text-blue-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Taxonomy mapping
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#F0F7FF] border border-blue-100 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-brand-800 text-white flex items-center justify-center font-bold mb-4 shadow">
                  3
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Weighted Gap Analysis</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Calculates student gap percentages per career using transparent mathematical formulations without black-box guesswork.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-200/60 flex items-center gap-1.5 text-xs font-semibold text-blue-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Versioned gap formula
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#F0F7FF] border border-blue-100 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold mb-4 shadow">
                  4
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Actionable Roadmaps</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sequences milestone dependencies, links curated free resources, and surfaces verified jobs, internships, & hackathons.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-200/60 flex items-center gap-1.5 text-xs font-semibold text-blue-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Interactive checklist API
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience Cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-6">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">For Engineering Students</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Know exactly what Tamil Nadu and Indian tech employers demand. Upload your resume, verify your skill levels via interactive quizzes, and unlock a step-by-step career roadmap.
                </p>
                <ul className="space-y-2.5 text-xs font-semibold text-slate-700 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Interactive timed assessments with proficiency band scoring
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Real-time gap quantification per dream career role
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Direct links to Naan Mudhalvan grants, SIH, and campus drives
                  </li>
                </ul>
              </div>
              <Link
                to="/register"
                className="w-full py-3 bg-brand-800 hover:bg-brand-700 text-white text-center text-xs font-bold rounded-xl shadow transition"
              >
                Join as Student
              </Link>
            </div>

            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 text-white shadow-xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-slate-800 text-amber-400 flex items-center justify-center mb-6">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">For Academic Evaluators & Admins</h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  Institutional visibility into curriculum gaps, aggregate cohort readiness, emerging industry skill spikes, and full audit logs for AI suggestions.
                </p>
                <ul className="space-y-2.5 text-xs font-semibold text-slate-300 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    Approval & verification panel for AI drafts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    Departmental and college-wide skill benchmark reports
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    Immutable audit logs tracking system actions
                  </li>
                </ul>
              </div>
              <button
                onClick={() => demoLogin('admin')}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-center text-xs font-bold rounded-xl shadow transition"
              >
                Launch Admin Review Console
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0B192C] text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-400" />
            <span className="font-display font-bold text-white text-base">SkillLens</span>
            <span className="text-xs text-slate-500 ml-2">© 2026 Industry Skill Intelligence</span>
          </div>
          <div className="text-xs text-slate-400">
            Smart India Hackathon Prototype • Pure JavaScript JSX Implementation
          </div>
        </div>
      </footer>
    </div>
  );
}
