import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Briefcase, TrendingUp, Users, Milestone } from 'lucide-react';
import { SkeletonLoader, EmptyState } from '../components/UIState';

export default function AdminCareers() {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCareers() {
      setLoading(true);
      try {
        const res = await axios.get('/admin/careers');
        setCareers(res.data.careers || []);
      } catch (err) {
        console.error('Failed to load careers', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCareers();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100">
          Role Registry
        </span>
        <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 mt-2">
          Career Roles & Market Alignment
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Catalogue of industry roles with demand signals, salary benchmarks, and milestone coverage
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <><div className="md:col-span-2"><SkeletonLoader count={4} className="h-32" /></div></>
        ) : careers.length === 0 ? (
          <div className="md:col-span-2"><EmptyState title="No career roles found" description="Add career roles to the database." /></div>
        ) : (
          careers.map((c) => (
            <div key={c.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{c.category || 'Software Engineering'}</span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">{c.title}</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Students Targeting</span>
                  <span className="text-sm font-black text-brand-900 flex items-center gap-1 mt-0.5">
                    <Users className="w-3.5 h-3.5 text-brand-600" />
                    {c.students_targeting || 0}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Milestones</span>
                  <span className="text-sm font-black text-indigo-700 flex items-center gap-1 mt-0.5">
                    <Milestone className="w-3.5 h-3.5 text-indigo-600" />
                    {c.milestone_count || 0}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Demand</span>
                  <span className="text-sm font-black text-emerald-700 flex items-center gap-1 mt-0.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    {c.demand_score || 80}/100
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{c.description || 'Design and deploy enterprise-grade software solutions matching top industry specifications.'}</p>
              {c.salary_range && (
                <div className="mt-3 text-xs font-bold text-emerald-700">
                  Entry CTC Range: {c.salary_range}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
