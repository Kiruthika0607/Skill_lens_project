import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, Mail, Lock, User, GraduationCap, Building2, BookOpen, ArrowRight, AlertCircle } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    college: 'Anna University, Chennai',
    discipline: 'Computer Science and Engineering',
    graduationYear: 2026,
    preferredDomain: 'Full Stack Web Development'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ ...formData, role: 'student' });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to complete registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-800 text-white flex items-center justify-center shadow-lg shadow-brand-900/20">
            <Compass className="w-7 h-7" />
          </div>
          <span className="font-display font-extrabold text-2xl text-slate-900">SkillLens</span>
        </Link>
        <h2 className="text-2xl font-bold text-slate-900">Create your Student Profile</h2>
        <p className="mt-1 text-xs text-slate-500">
          Join thousands of engineering graduates preparing for high-growth tech careers
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 shadow-xl sm:rounded-3xl sm:px-10 border border-slate-200">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Kavitha Raman"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 text-sm outline-none transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="kavitha@annauniv.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 text-sm outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 text-sm outline-none transition"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  College / University
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    placeholder="Anna University"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 text-sm outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Discipline / Branch
                </label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.discipline}
                    onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
                    placeholder="Computer Science"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 text-sm outline-none transition"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Graduation Year
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <select
                    value={formData.graduationYear}
                    onChange={(e) => setFormData({ ...formData, graduationYear: parseInt(e.target.value) })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 text-sm outline-none bg-white transition"
                  >
                    <option value={2025}>2025</option>
                    <option value={2026}>2026</option>
                    <option value={2027}>2027</option>
                    <option value={2028}>2028</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Target Domain
                </label>
                <select
                  value={formData.preferredDomain}
                  onChange={(e) => setFormData({ ...formData, preferredDomain: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 text-sm outline-none bg-white transition"
                >
                  <option value="Full Stack Web Development">Full Stack Web Development</option>
                  <option value="Cloud & DevOps Engineering">Cloud & DevOps Engineering</option>
                  <option value="Data Science & AI/ML">Data Science & AI/ML</option>
                  <option value="Mobile App Development">Mobile App Development</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 px-4 rounded-xl bg-brand-800 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-900/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {loading ? 'Creating Profile...' : 'Complete Registration'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-brand-700 hover:text-brand-900">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
