import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Compass, LogOut, User as UserIcon, Shield, Bell } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={{
      background: 'rgba(17, 24, 39, 0.85)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border-card)',
      padding: '0.85rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Link to={isAuthenticated ? (isAdmin ? "/admin/dashboard" : "/student/dashboard") : "/"} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <div style={{
            background: 'var(--accent-gradient)',
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)'
          }}>
            <Compass size={22} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.03em', color: '#fff' }}>
            Skill<span style={{ color: '#818cf8' }}>Lens</span>
          </span>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {isAuthenticated ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className={`badge ${isAdmin ? 'badge-danger' : 'badge-primary'}`}>
                {isAdmin ? <Shield size={12} /> : <UserIcon size={12} />}
                {user.role}
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                {user.fullName}
              </span>
            </div>

            <button 
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
              title="Logout"
              id="logout-btn"
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/login" className="btn btn-secondary btn-sm" id="nav-login-btn">Log In</Link>
            <Link to="/register" className="btn btn-primary btn-sm" id="nav-register-btn">Get Started</Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
