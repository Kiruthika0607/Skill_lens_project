import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  Building2,
  MapPin,
  Calendar
} from 'lucide-react';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import Skeleton, { TableSkeleton } from '../../components/common/Skeleton';
import ConfirmationModal from '../../components/common/ConfirmationModal';

export const AdminOpportunitiesPage = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // New Opportunity Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    organization: '',
    opportunityType: 'INTERNSHIP',
    location: '',
    isRemote: true,
    description: '',
    applicationUrl: '',
    deadline: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [oppToDelete, setOppToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/opportunities?page=${page}&size=10&search=${encodeURIComponent(search)}`
      );
      setOpportunities(res.data?.content || []);
      setTotalPages(res.data?.totalPages || 1);
      setTotalElements(res.data?.totalElements || 0);
    } catch (err) {
      console.error('Failed to load opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [page, search]);

  const handleCreateOpportunity = async (e) => {
    e.preventDefault();
    if (!form.title || !form.organization) return;
    setSubmitting(true);
    setError('');

    try {
      await api.post('/admin/opportunities', {
        ...form,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
      });
      setModalOpen(false);
      setForm({
        title: '',
        organization: '',
        opportunityType: 'INTERNSHIP',
        location: '',
        isRemote: true,
        description: '',
        applicationUrl: '',
        deadline: '',
      });
      setSuccess('Opportunity published to student feed.');
      setTimeout(() => setSuccess(''), 4000);
      fetchOpportunities();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post opportunity.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!oppToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/opportunities/${oppToDelete.id}`);
      setDeleteModalOpen(false);
      setSuccess(`Opportunity "${oppToDelete.title}" deactivated.`);
      setTimeout(() => setSuccess(''), 4000);
      fetchOpportunities();
    } catch (err) {
      console.error('Failed to deactivate opportunity:', err);
    } finally {
      setDeleting(false);
      setOppToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Opportunity Postings & Verification</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Publish and moderate technical roles, internships, hackathons, and scholarship listings.
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
          Post New Opportunity
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
          title="Aggregated Opportunities"
          subtitle={`${totalElements} active listings indexed`}
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
                placeholder="Search opportunities..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          }
        />

        <CardBody className="p-0">
          {loading ? (
            <TableSkeleton rows={6} cols={5} />
          ) : opportunities.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No opportunities found matching your criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-5">Role & Organization</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Deadline</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {opportunities.map((opp) => (
                    <tr key={opp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-5">
                        <span className="font-bold text-navy-900 block">{opp.title}</span>
                        <span className="text-[11px] text-slate-400 font-medium">{opp.organization}</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-brand-700">
                        {opp.opportunityType}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {opp.isRemote ? 'Remote' : opp.location || 'Hybrid'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {opp.deadline ? new Date(opp.deadline).toLocaleDateString() : 'Rolling'}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          status={opp.isActive ? 'ACTIVE' : 'EXPIRED'}
                          label={opp.isActive ? 'VERIFIED' : 'INACTIVE'}
                          size="sm"
                        />
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <Button
                          variant="dangerLight"
                          size="sm"
                          icon={Trash2}
                          onClick={() => {
                            setOppToDelete(opp);
                            setDeleteModalOpen(true);
                          }}
                        >
                          Deactivate
                        </Button>
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

      {/* POST OPPORTUNITY MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-elevated border border-slate-200 max-w-lg w-full p-6 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-navy-900">Post New Opportunity</h3>
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

            <form onSubmit={handleCreateOpportunity} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Associate Backend Engineer"
                  className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Organization *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.organization}
                    onChange={(e) => setForm({ ...form, organization: e.target.value })}
                    placeholder="e.g. Stripe, Google, Acme"
                    className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Opportunity Type
                  </label>
                  <select
                    value={form.opportunityType}
                    onChange={(e) => setForm({ ...form, opportunityType: e.target.value })}
                    className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="JOB">Job (Full-time)</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="SCHOLARSHIP">Scholarship</option>
                    <option value="HACKATHON">Hackathon</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. San Francisco, CA"
                    className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Application Link (Verified URL)
                </label>
                <input
                  type="url"
                  value={form.applicationUrl}
                  onChange={(e) => setForm({ ...form, applicationUrl: e.target.value })}
                  placeholder="https://..."
                  className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Candidate requirements, eligibility, stipend/salary..."
                  className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" loading={submitting}>
                  Publish Opportunity
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DEACTIVATE MODAL */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Deactivate Opportunity?"
        message={`Are you sure you want to deactivate "${oppToDelete?.title}"? It will no longer appear on student recommendation feeds.`}
        confirmText="Confirm Deactivation"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};

export default AdminOpportunitiesPage;
