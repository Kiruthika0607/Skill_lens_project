import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Shield, Clock } from 'lucide-react';
import { SkeletonLoader, StatusBadge, EmptyState } from '../components/UIState';

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      try {
        const res = await axios.get('/admin/logs?limit=50');
        setLogs(res.data.logs || []);
      } catch (err) {
        console.error('Failed to load logs', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  const getActionColor = (action = '') => {
    const norm = action.toUpperCase();
    if (norm.includes('APPROVED') || norm.includes('CREATE')) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (norm.includes('REJECTED') || norm.includes('DELETE')) return 'text-rose-700 bg-rose-50 border-rose-200';
    if (norm.includes('UPDATE') || norm.includes('SEED')) return 'text-blue-700 bg-blue-50 border-blue-200';
    return 'text-slate-700 bg-slate-100 border-slate-200';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100">
            Immutable Audit Records
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 mt-2">
            System Audit Log Trail
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete history of administrative and automated verification actions with full accountability
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-600" />
          <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
            {logs.length} Log Entries
          </span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6"><SkeletonLoader count={6} className="h-14" /></div>
        ) : logs.length === 0 ? (
          <div className="p-8"><EmptyState title="Audit Log Empty" description="No system audit events have been recorded yet." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-6">Action Event</th>
                  <th className="py-3.5 px-6">Entity Type</th>
                  <th className="py-3.5 px-6">Details</th>
                  <th className="py-3.5 px-6">Actor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-700">{log.entity}</td>
                    <td className="py-4 px-6 text-slate-600 max-w-sm">
                      <p className="truncate">{log.details}</p>
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-mono text-[11px]">
                      {log.actor_email || log.actor_id || 'System'}
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
