import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookMarked, Star, ExternalLink } from 'lucide-react';
import { SkeletonLoader, StatusBadge, EmptyState } from '../components/UIState';

export default function AdminResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResources() {
      setLoading(true);
      try {
        const res = await axios.get('/admin/resources');
        setResources(res.data.resources || []);
      } catch (err) {
        console.error('Failed to load resources', err);
      } finally {
        setLoading(false);
      }
    }
    fetchResources();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100">
          Curated Catalog
        </span>
        <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 mt-2">
          Learning Resources Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Administrator view of all approved learning resources linked to skill taxonomy
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6"><SkeletonLoader count={5} className="h-12" /></div>
        ) : resources.length === 0 ? (
          <div className="p-8"><EmptyState title="No resources found" description="Add learning resources via the admin API." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Title & Provider</th>
                  <th className="py-3.5 px-6">Skill</th>
                  <th className="py-3.5 px-6">Type</th>
                  <th className="py-3.5 px-6">Rating</th>
                  <th className="py-3.5 px-6">Cost</th>
                  <th className="py-3.5 px-6">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {resources.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900 max-w-xs">{r.title}</p>
                      <span className="text-[11px] text-slate-500">{r.provider || 'Open Source'}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 text-xs font-semibold border border-blue-100">
                        {r.skill_name || 'General'}
                      </span>
                    </td>
                    <td className="py-4 px-6 capitalize font-semibold text-slate-700">{r.type?.toLowerCase() || 'course'}</td>
                    <td className="py-4 px-6">
                      <span className="flex items-center gap-1 font-bold text-amber-700">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        {r.rating || 4.8}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge
                        status={r.cost === 0 || r.cost === '0' ? 'VERIFIED' : 'PENDING'}
                        label={r.cost === 0 || r.cost === '0' ? 'Free' : `₹${r.cost}`}
                        size="sm"
                      />
                    </td>
                    <td className="py-4 px-6">
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-brand-700 hover:text-brand-900 font-semibold text-xs"
                      >
                        Open Link <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
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
