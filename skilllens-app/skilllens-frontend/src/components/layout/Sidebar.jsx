import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Award,
  Briefcase,
  GitCompare,
  Milestone,
  BookOpen,
  Sparkles,
  MessageSquare,
  TrendingUp,
  Compass,
  CheckCircle2,
  X
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    { label: 'Overview', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Profile & Resume', to: '/profile', icon: User },
    { label: 'Skill Inventory', to: '/skills?tab=inventory', icon: Award },
    { label: 'Take Assessment', to: '/skills?tab=assessments', icon: CheckCircle2, badge: 'Resume' },
    { label: 'Career Recommendations', to: '/careers', icon: Briefcase },
    { label: 'Skill Gap Analysis', to: '/skill-gap', icon: GitCompare },
    { label: 'Career Roadmap', to: '/roadmap', icon: Milestone },
    { label: 'Learning Resources', to: '/resources', icon: BookOpen },
    { label: 'Opportunities', to: '/opportunities', icon: Sparkles },
    { label: 'AI Advisor', to: '/chat', icon: MessageSquare, badge: 'AI' },
    { label: 'Progress Reports', to: '/progress', icon: TrendingUp },
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

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-navy-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-navy-800">
          <NavLink to="/dashboard" className="flex items-center gap-3" onClick={onClose}>
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-sm">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Skill<span className="text-brand-400">Lens</span>
            </span>
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
            Career Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-brand-500/20 text-brand-300 border border-brand-400/30">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Info */}
        <div className="p-4 border-t border-navy-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-300 font-medium">SkillLens Platform Active</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Engineered for Engineering Students</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
