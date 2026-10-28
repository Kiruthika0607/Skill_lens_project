import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import StudentLayout from './components/layout/StudentLayout.jsx';
import AdminLayout from './components/layout/AdminLayout.jsx';

// Auth guard
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';

// Public pages
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.jsx';

// Student pages
import DashboardPage from './pages/student/DashboardPage.jsx';
import ProfilePage from './pages/student/ProfilePage.jsx';
import SkillsPage from './pages/student/SkillsPage.jsx';
import CareersPage from './pages/student/CareersPage.jsx';
import SkillGapPage from './pages/student/SkillGapPage.jsx';
import RoadmapPage from './pages/student/RoadmapPage.jsx';
import ResourcesPage from './pages/student/ResourcesPage.jsx';
import OpportunitiesPage from './pages/student/OpportunitiesPage.jsx';
import ChatPage from './pages/student/ChatPage.jsx';
import ProgressPage from './pages/student/ProgressPage.jsx';

// Admin pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import AdminStudentsPage from './pages/admin/AdminStudentsPage.jsx';
import AdminSkillsPage from './pages/admin/AdminSkillsPage.jsx';
import AdminCareersPage from './pages/admin/AdminCareersPage.jsx';
import AdminResourcesPage from './pages/admin/AdminResourcesPage.jsx';
import AdminOpportunitiesPage from './pages/admin/AdminOpportunitiesPage.jsx';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage.jsx';

// Tiny full-page spinner shown while lazy chunks load
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading SkillLens…</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── Public ── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* ── Student (authenticated, role = STUDENT) ── */}
        <Route
          element={
            <ProtectedRoute requiredRole="STUDENT">
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/skills" element={<SkillsPage />} />
          <Route path="/assessments" element={<Navigate to="/skills?tab=assessments" replace />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/skill-gap" element={<SkillGapPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/opportunities" element={<OpportunitiesPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          {/* Convenience redirect */}
          <Route index element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* ── Admin (authenticated, role = ADMIN) ── */}
        <Route
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/students" element={<AdminStudentsPage />} />
          <Route path="/admin/skills" element={<AdminSkillsPage />} />
          <Route path="/admin/careers" element={<AdminCareersPage />} />
          <Route path="/admin/resources" element={<AdminResourcesPage />} />
          <Route path="/admin/opportunities" element={<AdminOpportunitiesPage />} />
          <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
        </Route>

        {/* ── Catch-all ── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center">
        <span className="text-4xl">🔍</span>
      </div>
      <h1 className="text-3xl font-bold text-navy-800">404 — Page Not Found</h1>
      <p className="text-slate-500 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <a
        href="/"
        className="px-5 py-2.5 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors"
      >
        Back to Home
      </a>
    </div>
  );
}
