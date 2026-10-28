import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  Search, 
  GraduationCap, 
  Building2, 
  ChevronLeft, 
  ChevronRight,
  Shield,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { SkeletonLoader, StatusBadge, EmptyState } from '../components/UIState';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchStudents = async (page = 1, searchQuery = search) => {
    setLoading(true);
    try {
      const res = await axios.get(`/admin/students?page=${page}&limit=10&search=${encodeURIComponent(searchQuery)}`);
      setStudents(res.data.students || []);
      setPagination(res.data.pagination || { page, limit: 10, total: 0, totalPages: 1 });
    } catch (err) {
      console.error('Failed to load students', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(1, search);
  }, [search]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100">
            Cohort Directory
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 mt-2">
            Engineering Students Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search, inspect calibrated proficiencies, and review individual career path mappings
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, college..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-600 shadow-sm transition"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6">
            <SkeletonLoader count={5} className="h-14" />
          </div>
        ) : students.length === 0 ? (
          <div className="p-8">
            <EmptyState title="No students found" description="Try a different search query." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Student Name & Email</th>
                  <th className="py-3.5 px-6">College & Discipline</th>
                  <th className="py-3.5 px-6">Graduation Year</th>
                  <th className="py-3.5 px-6">Target Career</th>
                  <th className="py-3.5 px-6">Assessed Skills</th>
                  <th className="py-3.5 px-6">Readiness</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900">{s.full_name}</p>
                      <span className="text-[11px] text-slate-500">{s.email}</span>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-800">{s.college}</p>
                      <span className="text-[11px] text-slate-500">{s.discipline}</span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-700">
                      Class of {s.graduation_year || 2026}
                    </td>
                    <td className="py-4 px-6 font-semibold text-brand-900">
                      {s.target_career || s.preferred_domain || 'Full Stack Engineer'}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-bold text-xs border border-blue-100">
                        {s.assessed_skills_count || 4} Assessed
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status="ACTIVE" label="In Progress" size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing page {pagination.page} of {Math.max(1, pagination.totalPages)} ({pagination.total} total students)
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchStudents(pagination.page - 1)}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchStudents(pagination.page + 1)}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
