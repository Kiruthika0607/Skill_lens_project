import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Globe, MapPin, Clock, Building2, DollarSign, ExternalLink } from 'lucide-react';
import { SkeletonLoader, StatusBadge, EmptyState } from '../components/UIState';

export default function AdminOpportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOpportunities() {
      setLoading(true);
      try {
        const res = await axios.get('/admin/opportunities');
        setOpportunities(res.data.opportunities || []);
      } catch (err) {
        console.error('Failed to load opportunities', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOpportunities();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100">
            Opportunities Registry
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 mt-2">
            All Opportunities — Admin Review
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Administrative view with verification status and source URL for auditing
          </p>
        </div>
        <span className="text-sm font-bold text-slate-700 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">
          {opportunities.length} Total Listings
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6"><SkeletonLoader count={5} className="h-12" /></div>
        ) : opportunities.length === 0 ? (
          <div className="p-8"><EmptyState title="No opportunities found" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Title & Organization</th>
                  <th className="py-3.5 px-6">Type</th>
                  <th className="py-3.5 px-6">Location & Mode</th>
                  <th className="py-3.5 px-6">Deadline</th>
                  <th className="py-3.5 px-6">Reward</th>
                  <th className="py-3.5 px-6">Verification</th>
                  <th className="py-3.5 px-6">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {opportunities.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6 max-w-xs">
                      <p className="font-bold text-slate-900 truncate">{o.title}</p>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Building2 className="w-3 h-3" />{o.organization}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={o.type} label={o.type} size="sm" />
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-700 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />{o.location}
                      </p>
                      <span className="text-[11px] text-slate-500">{o.work_mode}</span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-rose-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(o.deadline).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 font-semibold text-emerald-700">
                      {o.stipend_or_reward || '—'}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={o.status} label={o.status} size="sm" />
                    </td>
                    <td className="py-4 px-6">
                      <a href={o.source_url} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 text-brand-700 hover:text-brand-900 font-semibold text-xs">
                        Official Link <ExternalLink className="w-3 h-3" />
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
