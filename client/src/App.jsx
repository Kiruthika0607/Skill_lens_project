import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AdminSidebar from './components/AdminSidebar';

// Public pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// Student pages
import StudentDashboard from './pages/StudentDashboard';
import ProfilePage from './pages/ProfilePage';
import SkillsPage from './pages/SkillsPage';
import CareersPage from './pages/CareersPage';
import SkillGapPage from './pages/SkillGapPage';
import RoadmapPage from './pages/RoadmapPage';
import ResourcesPage from './pages/ResourcesPage';
import OpportunitiesPage from './pages/OpportunitiesPage';
import ChatPage from './pages/ChatPage';
import ProgressPage from './pages/ProgressPage';

// Admin pages
import AdminOverview from './pages/AdminOverview';
import AdminStudents from './pages/AdminStudents';
import AdminSkills from './pages/AdminSkills';
import AdminCareers from './pages/AdminCareers';
import AdminResources from './pages/AdminResources';
import AdminOpportunities from './pages/AdminOpportunities';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminLogs from './pages/AdminLogs';

// ──────────────────────────────────────────────────────────────────────────────
// Protected Route Wrappers
// ──────────────────────────────────────────────────────────────────────────────

function ProtectedRoute({ requiredRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F7FF]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-brand-700 border-t-transparent animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Authenticating session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate home
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return <Outlet />;
}

// Student Layout – Navbar + left Sidebar + content area
function StudentLayout() {
  return (
    <div className="min-h-screen bg-[#F0F7FF] flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Admin Layout – Navbar + dark AdminSidebar + content area
function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#F0F7FF] flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Public Layout – Navbar only (no sidebar)
function PublicLayout() {
  return (
    <div className="min-h-screen bg-[#F0F7FF] flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// App Routes
// ──────────────────────────────────────────────────────────────────────────────

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public landing page (no sidebar) */}
      <Route path="/" element={<><Navbar /><LandingPage /></>} />

      {/* Auth pages (no sidebar) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* ── Student Protected Routes ── */}
      <Route element={<ProtectedRoute requiredRole="student" />}>
        <Route element={<StudentLayout />}>
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/skills" element={<SkillsPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/skill-gap" element={<SkillGapPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/opportunities" element={<OpportunitiesPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/progress" element={<ProgressPage />} />
        </Route>
      </Route>

      {/* ── Admin Protected Routes ── */}
      <Route element={<ProtectedRoute requiredRole="admin" />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminOverview />} />
          <Route path="/admin/students" element={<AdminStudents />} />
          <Route path="/admin/skills" element={<AdminSkills />} />
          <Route path="/admin/careers" element={<AdminCareers />} />
          <Route path="/admin/resources" element={<AdminResources />} />
          <Route path="/admin/opportunities" element={<AdminOpportunities />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/logs" element={<AdminLogs />} />
        </Route>
      </Route>

      {/* Catch-all redirect */}
      <Route
        path="*"
        element={
          user
            ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
            : <Navigate to="/" replace />
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
