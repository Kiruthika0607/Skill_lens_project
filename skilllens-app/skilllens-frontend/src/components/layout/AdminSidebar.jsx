import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Award,
  Briefcase,
  BookOpen,
  Sparkles,
  BarChart3,
  FileText,
  ShieldCheck,
  X
} from 'lucide-react';

export const AdminSidebar = ({ isOpen, onClose }) => {
  const adminNavItems = [
    { label: 'Admin Overview', to: '/admin', end: true, icon: LayoutDashboard },
    { label: 'Student Accounts', to: '/admin/students', icon: Users },
    { label: 'Skill Catalog', to: '/admin/skills', icon: Award },
    { label: 'Career Roles', to: '/admin/careers', icon: Briefcase },
    { label: 'Learning Resources', to: '/admin/resources', icon: BookOpen },
    { label: 'Opportunities Feed', to: '/admin/opportunities', icon: Sparkles },
    { label: 'Platform Analytics', to: '/admin/analytics', icon: BarChart3 },
    { label: 'Audit Trail Logs', to: '/admin/logs', icon: FileText },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Admin Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-navy-950 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-navy-800">
          <NavLink to="/admin" className="flex items-center gap-3" onClick={onClose}>
            <div className="w-8 h-8 rounded-lg bg-brand-700 flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">
                Skill<span className="text-brand-400">Lens</span>
              </span>
              <span className="block text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                Admin Console
              </span>
            </div>
          </NavLink>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Administration
          </div>
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:bg-navy-900 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-navy-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-medium">Server Status: Normal</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Audit Logging Active (HIPAA/SOC2)</p>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
