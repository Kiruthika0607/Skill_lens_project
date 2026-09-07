import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  User,
  Layers,
  Compass,
  GitPullRequest,
  Briefcase,
  TrendingUp,
  Award,
  Map,
  BookOpen,
  FolderGit2,
  Bookmark,
  Settings,
  Users,
  Database,
  BarChart3,
  FileText
} from 'lucide-react';

const Sidebar = () => {
  const { isAdmin } = useAuth();

  const studentLinks = [
    { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/student/profile', icon: User, label: 'My Profile' },
    { to: '/student/skills', icon: Layers, label: 'My Skills' },
    { to: '/student/careers', icon: Compass, label: 'Career Explorer' },
    { to: '/student/skill-gap', icon: GitPullRequest, label: 'Skill Gap Analysis' },
    { to: '/student/recommendations', icon: Award, label: 'Recommendations' },
    { to: '/student/jobs', icon: Briefcase, label: 'Job Market' },
    { to: '/student/saved-jobs', icon: Bookmark, label: 'Saved Jobs' },
    { to: '/student/trends', icon: TrendingUp, label: 'Tech Trends' },
    { to: '/student/roadmap', icon: Map, label: 'Learning Roadmap' },
    { to: '/student/courses', icon: BookOpen, label: 'Courses' },
    { to: '/student/projects', icon: FolderGit2, label: 'Projects' },
    { to: '/student/certifications', icon: Award, label: 'Certifications' },
    { to: '/student/settings', icon: Settings, label: 'Settings' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Admin Dashboard' },
    { to: '/admin/students', icon: Users, label: 'Students' },
    { to: '/admin/skills', icon: Layers, label: 'Skill Taxonomy' },
    { to: '/admin/occupations', icon: Compass, label: 'Occupations' },
    { to: '/admin/jobs', icon: Briefcase, label: 'Job Postings' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Industry Analytics' },
    { to: '/admin/datasets', icon: Database, label: 'Datasets Status' },
    { to: '/admin/logs', icon: FileText, label: 'System Logs' },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <aside style={{
      width: '260px',
      background: 'var(--bg-card)',
      borderRight: '1px solid var(--border-card)',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 'calc(100vh - 65px)',
      padding: '1.25rem 0.75rem',
      flexShrink: 0
    }}>
      <div style={{
        fontSize: '0.75rem',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--text-muted)',
        padding: '0 0.75rem 0.75rem',
        marginBottom: '0.5rem',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        {isAdmin ? 'Administration Portal' : 'Student Career Portal'}
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1 }}>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.625rem 0.875rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: isActive ? '700' : '500',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent-gradient)' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '0 2px 10px rgba(99, 102, 241, 0.35)' : 'none'
              })}
            >
              <Icon size={18} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div style={{
        marginTop: 'auto',
        padding: '0.85rem',
        background: 'var(--bg-subtle)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        textAlign: 'center'
      }}>
        <div>SkillLens Architecture v1.0</div>
        <div style={{ fontSize: '0.7rem', color: '#818cf8', marginTop: '0.2rem' }}>React · Spring Boot · MySQL</div>
      </div>
    </aside>
  );
};

export default Sidebar;
