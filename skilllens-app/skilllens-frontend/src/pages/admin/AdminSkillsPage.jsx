import React, { useState, useEffect } from 'react';
import {
  Award,
  Search,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Tag
} from 'lucide-react';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import Skeleton, { TableSkeleton } from '../../components/common/Skeleton';

export const AdminSkillsPage = () => {
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Add Skill Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchSkillsAndCategories = async () => {
    setLoading(true);
    try {
      const [skillsRes, catRes] = await Promise.all([
        api.get(`/skills?page=${page}&size=10&search=${encodeURIComponent(search)}`),
        api.get('/skills/categories'),
      ]);
      setSkills(skillsRes.data?.content || []);
      setTotalPages(skillsRes.data?.totalPages || 1);
      setTotalElements(skillsRes.data?.totalElements || 0);
      setCategories(catRes.data || []);
      if (catRes.data?.length > 0 && !categoryId) {
        setCategoryId(catRes.data[0].id.toString());
      }
    } catch (err) {
      console.error('Failed to load skills:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkillsAndCategories();
  }, [page, search]);

  const handleCreateSkill = async (e) => {
    e.preventDefault();
    if (!name || !categoryId) return;
    setSubmitting(true);
    setError('');
    try {
      await api.post('/admin/skills', {
        name,
        categoryId: Number(categoryId),
        description,
      });
      setModalOpen(false);
      setName('');
      setDescription('');
      setSuccess(`Skill "${name}" added to catalog.`);
      setTimeout(() => setSuccess(''), 4000);
      fetchSkillsAndCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create skill.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Engineering Skill Catalog</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Maintain technical competencies, category definitions, and benchmark taxonomies.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => {
            setError('');
            setModalOpen(true);
          }}
        >
          Add Catalog Skill
        </Button>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <Card>
        <CardHeader
          title="Catalog Inventory"
          subtitle={`${totalElements} engineering skills indexed`}
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
                placeholder="Search skills..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          }
        />

        <CardBody className="p-0">
          {loading ? (
            <TableSkeleton rows={6} cols={4} />
          ) : skills.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No skills found matching search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-5">Skill Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {skills.map((sk) => (
                    <tr key={sk.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-navy-900">
                        {sk.name}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200 text-[11px]">
                          {sk.categoryName || 'General'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 max-w-sm truncate">
                        {sk.description || 'Core engineering competency.'}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge status="ACTIVE" label="ACTIVE" size="sm" />
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

      {/* ADD SKILL MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-elevated border border-slate-200 max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-navy-900">Add New Catalog Skill</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateSkill} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Skill Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Apache Kafka"
                  className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category *
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Core concepts, framework usage, and proficiency criteria..."
                  className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2.5">
                <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" loading={submitting}>
                  Save Skill
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSkillsPage;
