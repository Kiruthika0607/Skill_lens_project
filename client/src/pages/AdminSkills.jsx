import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Cpu, TrendingUp, Briefcase, BarChart2 } from 'lucide-react';
import { SkeletonLoader, StatusBadge, EmptyState } from '../components/UIState';

export default function AdminSkills() {
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    async function fetchSkills() {
      setLoading(true);
      try {
        const res = await axios.get('/admin/skills');
        setSkills(res.data.skills || []);
        setCategories(res.data.categories || []);
      } catch (err) {
        console.error('Failed to load skills', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSkills();
  }, []);

  const filtered = selectedCategory === 'ALL'
    ? skills
    : skills.filter((s) => s.category === selectedCategory);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100">
            Engineering Taxonomy
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 mt-2">
            Skills Taxonomy Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Normalized skill categories, demand scores, and job frequency mapping
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${selectedCategory === 'ALL' ? 'bg-brand-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            All ({skills.length})
          </button>
          {categories.map((c, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCategory(c.category)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${selectedCategory === c.category ? 'bg-brand-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              {c.category} ({c.count})
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6"><SkeletonLoader count={5} className="h-12" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-8"><EmptyState title="No skills found" description="The skills taxonomy is empty." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Skill Name</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Demand Score</th>
                  <th className="py-3.5 px-6">Job Occurrences</th>
                  <th className="py-3.5 px-6">Career Roles</th>
                  <th className="py-3.5 px-6">Frequency %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6 font-bold text-slate-900">{s.name}</td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 text-xs font-semibold border border-blue-100">
                        {s.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-brand-700 h-full rounded-full" style={{ width: `${s.demand_score || 75}%` }} />
                        </div>
                        <span className="font-bold text-slate-700 text-xs">{s.demand_score || 75}/100</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-700">{s.job_occurrences || 0}</td>
                    <td className="py-4 px-6 font-semibold text-slate-700">{s.career_roles_count || 0}</td>
                    <td className="py-4 px-6 font-semibold text-emerald-700">{s.job_frequency_pct || 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
