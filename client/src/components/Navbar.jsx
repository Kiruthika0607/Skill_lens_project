import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Compass, 
  User, 
  LogOut, 
  Shield, 
  Menu, 
  X, 
  Bell, 
  Briefcase, 
  CheckCircle2, 
  Layers, 
  Bot, 
  Award,
  ChevronDown
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navLinks = isAdmin
    ? [
        { label: 'Admin Overview', path: '/admin' },
        { label: 'Students', path: '/admin/students' },
        { label: 'Skills Taxonomy', path: '/admin/skills' },
        { label: 'Careers', path: '/admin/careers' },
        { label: 'Opportunities', path: '/admin/opportunities' },
        { label: 'Analytics', path: '/admin/analytics' },
        { label: 'Audit Logs', path: '/admin/logs' },
      ]
    : [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Skills & Assessments', path: '/skills' },
        { label: 'Career Roles', path: '/careers' },
        { label: 'Gap Analysis', path: '/skill-gap' },
        { label: 'Roadmap', path: '/roadmap' },
        { label: 'Opportunities', path: '/opportunities' },
        { label: 'AI Advisor', path: '/chat' },
        { label: 'Progress', path: '/progress' },
      ];

  return (
    <header className="bg-[#0B192C] border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link to={user ? (isAdmin ? '/admin' : '/dashboard') : '/'} className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition duration-200">
                <Compass className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-xl tracking-tight text-white group-hover:text-blue-300 transition">
                  SkillLens
                </span>
                <span className="text-[10px] tracking-wider text-blue-300 font-semibold uppercase -mt-1">
                  Career Intelligence
                </span>
              </div>
            </Link>

            {/* Role indicator tag */}
            {user && (
              <span className={`hidden md:inline-flex items-center gap-1 ml-3 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                isAdmin ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              }`}>
                {isAdmin ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                {isAdmin ? 'Admin Console' : 'Engineering Student'}
              </span>
            )}
          </div>

          {/* Desktop Navigation */}
          {user && (
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.slice(0, 6).map((link) => {
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                      active
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right Action Menu */}
          <div className="flex items-center gap-3">
            {!user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 transition"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3 relative">
                {/* Switcher button for admin or student */}
                {isAdmin && (
                  <Link
                    to="/dashboard"
                    className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-blue-300 rounded-lg border border-slate-700 transition"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    Student View
                  </Link>
                )}

                {/* Profile Pill */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left transition"
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase">
                      {user.email ? user.email.charAt(0) : 'U'}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-xs font-bold text-white leading-none truncate max-w-[120px]">
                        {user.email?.split('@')[0]}
                      </p>
                      <p className="text-[10px] text-slate-400 capitalize mt-0.5">{user.role}</p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-slate-800 animate-fade-in">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-900 truncate">{user.email}</p>
                        <p className="text-[11px] text-slate-500 capitalize">{user.role} Account</p>
                      </div>

                      {user.role === 'student' && (
                        <>
                          <Link
                            to="/profile"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-medium hover:bg-slate-50 text-slate-700"
                          >
                            <User className="w-4 h-4 text-blue-600" />
                            My Profile & Resume
                          </Link>
                          <Link
                            to="/progress"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-medium hover:bg-slate-50 text-slate-700"
                          >
                            <Award className="w-4 h-4 text-emerald-600" />
                            Progress & Reports
                          </Link>
                        </>
                      )}

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium hover:bg-slate-50 text-slate-700"
                        >
                          <Shield className="w-4 h-4 text-amber-600" />
                          Admin Console
                        </Link>
                      )}

                      <div className="border-t border-slate-100 my-1" />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 text-left transition"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile menu button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && user && (
          <div className="lg:hidden border-t border-slate-800 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive(link.path)
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:bg-slate-800 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
