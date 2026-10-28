import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Cpu, 
  Briefcase, 
  BookMarked, 
  Globe, 
  LineChart, 
  FileText,
  ShieldCheck
} from 'lucide-react';

const adminNavItems = [
  { name: 'Admin Overview', path: '/admin', icon: BarChart3 },
  { name: 'Students Directory', path: '/admin/students', icon: Users },
  { name: 'Skills Taxonomy', path: '/admin/skills', icon: Cpu },
  { name: 'Careers & Roles', path: '/admin/careers', icon: Briefcase },
  { name: 'Curated Resources', path: '/admin/resources', icon: BookMarked },
  { name: 'Opportunities', path: '/admin/opportunities', icon: Globe },
  { name: 'Deep Analytics', path: '/admin/analytics', icon: LineChart },
  { name: 'Audit Logs', path: '/admin/logs', icon: FileText },
];

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-white min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0 hidden md:flex">
      <div>
        <div className="flex items-center gap-2 px-3 mb-4">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Governance & Audit
          </span>
        </div>
        <nav className="space-y-1">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0 text-blue-400" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
        <p className="text-[11px] font-semibold text-slate-300">Auditor Status</p>
        <p className="text-[10px] text-slate-400 mt-0.5">
          Role-governed verification workflow with audit log traceability.
        </p>
      </div>
    </aside>
  );
}
