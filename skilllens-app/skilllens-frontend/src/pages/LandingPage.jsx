import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  Target,
  FileText,
  GitCompare,
  Milestone,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  BrainCircuit,
  Award
} from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Button from '../components/common/Button';
import Card, { CardBody } from '../components/common/Card';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-brand-50/60 via-white to-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100/60 text-brand-800 text-xs font-semibold mb-6 border border-brand-200">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Engineered For Next-Gen Engineering Students</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-900 tracking-tight leading-[1.15]">
              Bridge the Gap Between Campus & Your <span className="text-brand-600">Dream Career</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              SkillLens analyzes your resume, objectively quantifies your skill gaps using industry role benchmarks, generates personalized learning pathways, and matches you with verified opportunities.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right" className="w-full sm:w-auto shadow-md">
                  Get Started Free
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Explore Demo Account
                </Button>
              </Link>
            </div>

            {/* Platform Metrics Bar */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-10 border-t border-slate-200/80">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-navy-900">100%</div>
                <div className="text-xs text-slate-500 mt-1 font-medium">Objective Server-Side Scoring</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-brand-600">v1.2</div>
                <div className="text-xs text-slate-500 mt-1 font-medium">Weighted Skill Gap Formula</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-navy-900">4-in-1</div>
                <div className="text-xs text-slate-500 mt-1 font-medium">Jobs, Internships, Grants, Hackathons</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-brand-600">AI</div>
                <div className="text-xs text-slate-500 mt-1 font-medium">Career Advisor with Fact Verification</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section id="features" className="py-20 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-bold tracking-wider text-brand-600 mb-2">
              End-to-End Capabilities
            </h2>
            <p className="text-3xl font-bold text-navy-900 tracking-tight">
              Everything Needed to Accelerate Technical Placement
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card hover className="p-2">
              <CardBody className="p-6">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-600 border border-blue-100 flex items-center justify-center mb-5">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-navy-900 mb-2">Automated Resume Parsing</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Upload PDF or DOCX resumes. Apache Tika extracts technical skills, education, and internship experiences, mapping them directly to industry catalogs.
                </p>
              </CardBody>
            </Card>

            <Card hover className="p-2">
              <CardBody className="p-6">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center mb-5">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-navy-900 mb-2">Skill Assessments</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Timed multiple-choice evaluations that establish verified proficiency levels (1–4) computed strictly server-side to guarantee integrity.
                </p>
              </CardBody>
            </Card>

            <Card hover className="p-2">
              <CardBody className="p-6">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-5">
                  <GitCompare className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-navy-900 mb-2">Weighted Gap Analysis</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Mathematically compares your assessed proficiency against target role demands using $g_i = \max(0, R_i - S_i) / R_i$ with full formula transparency.
                </p>
              </CardBody>
            </Card>

            <Card hover className="p-2">
              <CardBody className="p-6">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center mb-5">
                  <Milestone className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-navy-900 mb-2">Dynamic Career Roadmaps</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Automatically prioritizes your largest deficiencies first, ordering milestones, dependencies, and capstone projects with real-time completion tracking.
                </p>
              </CardBody>
            </Card>

            <Card hover className="p-2">
              <CardBody className="p-6">
                <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mb-5">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-navy-900 mb-2">Verified Opportunity Feed</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Aggregates technical jobs, internships, scholarships, and hackathons with verified source links and automated skill-match scoring.
                </p>
              </CardBody>
            </Card>

            <Card hover className="p-2">
              <CardBody className="p-6">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center mb-5">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-navy-900 mb-2">AI Career Advisor</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Context-aware assistant that references your assessed skills and roadmap progress. Visually separates verified factual answers from strategic suggestions.
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-bold tracking-wider text-brand-600 mb-2">
              Simple 4-Step Pathway
            </h2>
            <p className="text-3xl font-bold text-navy-900 tracking-tight">
              From Baseline Assessment to Career Offer
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-200 text-brand-700 font-bold text-xl flex items-center justify-center mx-auto mb-4 shadow-xs">
                01
              </div>
              <h3 className="text-base font-bold text-navy-900 mb-2">Create Profile & Resume</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Upload your engineering resume to auto-populate your skill inventory in seconds.
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-200 text-brand-700 font-bold text-xl flex items-center justify-center mx-auto mb-4 shadow-xs">
                02
              </div>
              <h3 className="text-base font-bold text-navy-900 mb-2">Take Skill Assessments</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Validate your capabilities through server-scored quizzes to earn certified proficiency bands.
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-200 text-brand-700 font-bold text-xl flex items-center justify-center mx-auto mb-4 shadow-xs">
                03
              </div>
              <h3 className="text-base font-bold text-navy-900 mb-2">Review Gap Analysis</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Select your target career role to see exactly which competencies require immediate focus.
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-200 text-brand-700 font-bold text-xl flex items-center justify-center mx-auto mb-4 shadow-xs">
                04
              </div>
              <h3 className="text-base font-bold text-navy-900 mb-2">Execute & Apply</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Complete targeted milestones, track progress, and apply to high-match opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <footer className="mt-auto bg-navy-950 text-slate-400 py-12 border-t border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Skill<span className="text-brand-400">Lens</span>
            </span>
          </div>
          <div className="text-xs text-slate-400 text-center md:text-right">
            &copy; {new Date().getFullYear()} SkillLens Platform. All rights reserved. Strictly for engineering career excellence.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
