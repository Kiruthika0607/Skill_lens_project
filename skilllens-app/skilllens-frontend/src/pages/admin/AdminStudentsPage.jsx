import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  UserX,
  Mail,
  Calendar
} from 'lucide-react';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import Skeleton, { TableSkeleton } from '../../components/common/Skeleton';
import ConfirmationModal from '../../components/common/ConfirmationModal';

export const AdminStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Status toggle confirmation modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [toggling, setToggling] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/admin/users?role=STUDENT&page=${page}&size=10&search=${encodeURIComponent(search)}`
      );
      setStudents(res.data?.content || []);
      setTotalPages(res.data?.totalPages || 1);
      setTotalElements(res.data?.totalElements || 0);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, search]);

  const handleOpenStatusModal = (student) => {
    setSelectedStudent(student);
    setModalOpen(true);
  };

  const handleConfirmToggleStatus = async () => {
    if (!selectedStudent) return;
    setToggling(true);
    const newStatus = !selectedStudent.enabled;

    try {
      await api.patch(`/admin/users/${selectedStudent.id}/status`, { enabled: newStatus });
      setStudents((prev) =>
        prev.map((s) => (s.id === selectedStudent.id ? { ...s, enabled: newStatus } : s))
      );
      setModalOpen(false);
    } catch (err) {
      console.error('Failed to toggle student account status:', err);
    } finally {
      setToggling(false);
      setSelectedStudent(null);
    }
  };

  const filtered = students.filter((s) => {
    if (statusFilter === 'active' && !s.enabled) return false;
    if (statusFilter === 'inactive' && s.enabled) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Student Accounts Management</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review enrolled engineering students, verified profiles, and account statuses.
        </p>
      </div>

      <Card>
        <CardHeader
          title="Registered Students"
          subtitle={`${totalElements} registered student accounts`}
          action={
            <div className="flex items-center gap-3">
              <div className="relative w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0);
                  }}
                  placeholder="Search by name or email..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Suspended Only</option>
              </select>
            </div>
          }
        />

        <CardBody className="p-0">
          {loading ? (
            <TableSkeleton rows={6} cols={5} />
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No students found matching your criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-5">Student User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Created Date</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-5">
                        <span className="font-bold text-navy-900 block">
                          {s.firstName ? `${s.firstName} ${s.lastName || ''}` : s.email.split('@')[0]}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">{s.email}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-600">
                        {s.role}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          status={s.enabled ? 'ACTIVE' : 'EXPIRED'}
                          label={s.enabled ? 'ACTIVE' : 'SUSPENDED'}
                          size="sm"
                        />
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <Button
                          variant={s.enabled ? 'dangerLight' : 'secondary'}
                          size="sm"
                          icon={s.enabled ? UserX : UserCheck}
                          onClick={() => handleOpenStatusModal(s)}
                        >
                          {s.enabled ? 'Deactivate' : 'Reactivate'}
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

      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmToggleStatus}
        title={selectedStudent?.enabled ? 'Suspend Student Account?' : 'Reactivate Student Account?'}
        message={
          selectedStudent?.enabled
            ? `Are you sure you want to suspend account for ${selectedStudent?.email}? The student will not be able to log in until reactivated.`
            : `Reactivate login permissions for ${selectedStudent?.email}?`
        }
        confirmText={selectedStudent?.enabled ? 'Suspend Account' : 'Reactivate'}
        variant={selectedStudent?.enabled ? 'danger' : 'primary'}
        loading={toggling}
      />
    </div>
  );
};

export default AdminStudentsPage;
