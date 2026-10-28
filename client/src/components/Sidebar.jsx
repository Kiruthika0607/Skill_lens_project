import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  CheckSquare, 
  Briefcase, 
  GitCompare, 
  Milestone, 
  BookOpen, 
  Sparkles, 
  MessageSquare, 
  TrendingUp 
} from 'lucide-react';

const studentNavItems = [
  { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Profile & Resume', path: '/profile', icon: User },
  { name: 'Skills & Assessments', path: '/skills', icon: CheckSquare },
  { name: 'Career Recommendations', path: '/careers', icon: Briefcase },
  { name: 'Skill Gap Analysis', path: '/skill-gap', icon: GitCompare },
  { name: 'Learning Roadmap', path: '/roadmap', icon: Milestone },
  { name: 'Resources Catalog', path: '/resources', icon: BookOpen },
  { name: 'Opportunities', path: '/opportunities', icon: Sparkles },
  { name: 'AI Skill Advisor', path: '/chat', icon: MessageSquare },
  { name: 'Progress & Reports', path: '/progress', icon: TrendingUp },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0 hidden md:flex">
      <div>
        <div className="px-3 mb-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Student Navigation
          </span>
        </div>
        <nav className="space-y-1">
          {studentNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-50 text-brand-800 border border-brand-100 shadow-sm'
                      : 'text-slate-600 hover:text-brand-900 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0 text-brand-700" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-3.5 bg-[#F0F7FF] rounded-2xl border border-blue-100">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-bold text-brand-900">SkillLens Intelligence</span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          Grounding academic learning to real-world job demand data across tech clusters.
        </p>
      </div>
    </aside>
  );
}
