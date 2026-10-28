import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import Skeleton, { TableSkeleton } from '../../components/common/Skeleton';

export const AdminResourcesPage = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/resources?page=${page}&size=10&search=${encodeURIComponent(search)}`);
      setResources(res.data?.content || []);
      setTotalPages(res.data?.totalPages || 1);
      setTotalElements(res.data?.totalElements || 0);
    } catch (err) {
      console.error('Failed to load resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [page, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Curated Learning Resources</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage tutorials, textbooks, and documentation linked to student skill gap mitigation.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader
          title="Resource Inventory"
          subtitle={`${totalElements} learning resources indexed`}
          action={
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                placeholder="Search resources..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          }
        />

        <CardBody className="p-0">
          {loading ? (
            <TableSkeleton rows={6} cols={5} />
          ) : resources.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No learning resources found matching your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-5">Title & Provider</th>
                    <th className="py-3 px-4">Skill Target</th>
                    <th className="py-3 px-4">Format</th>
                    <th className="py-3 px-4">Cost</th>
                    <th className="py-3 px-5 text-right">Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {resources.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-5">
                        <span className="font-bold text-navy-900 block">{r.title}</span>
                        <span className="text-[11px] text-slate-400">{r.provider || 'Self-Paced'}</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-brand-700">
                        {r.skillName || 'General'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                          {r.resourceType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          status={r.costType === 'FREE' ? 'ACTIVE' : 'SAMPLE'}
                          label={r.costType}
                          size="sm"
                        />
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        {r.url && (
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-800 font-semibold"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="px-5">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={10}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default AdminResourcesPage;
