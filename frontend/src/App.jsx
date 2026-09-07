import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import SkillProfile from './pages/student/SkillProfile';
import CareerExplorer from './pages/student/CareerExplorer';
import SkillGapAnalysis from './pages/student/SkillGapAnalysis';
import JobMarket from './pages/student/JobMarket';
import SavedJobs from './pages/student/SavedJobs';
import TechnologyTrends from './pages/student/TechnologyTrends';
import CareerRecommendations from './pages/student/CareerRecommendations';
import LearningRoadmap from './pages/student/LearningRoadmap';

// Route guard for authenticated students
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#0b0f19', color: '#f8fafc',
        fontSize: '1.1rem', gap: '12px'
      }}>
        <div style={{
          width: 32, height: 32, border: '3px solid #6366f1',
          borderTopColor: 'transparent', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        Loading SkillLens…
      </div>
    );
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Route guard to redirect logged-in users away from auth pages
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Protected student routes */}
      <Route path="/dashboard" element={<PrivateRoute><StudentDashboard /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><StudentProfile /></PrivateRoute>} />
      <Route path="/skills" element={<PrivateRoute><SkillProfile /></PrivateRoute>} />
      <Route path="/careers" element={<PrivateRoute><CareerExplorer /></PrivateRoute>} />
      <Route path="/skill-gap" element={<PrivateRoute><SkillGapAnalysis /></PrivateRoute>} />
      <Route path="/jobs" element={<PrivateRoute><JobMarket /></PrivateRoute>} />
      <Route path="/saved-jobs" element={<PrivateRoute><SavedJobs /></PrivateRoute>} />
      <Route path="/trends" element={<PrivateRoute><TechnologyTrends /></PrivateRoute>} />
      <Route path="/recommendations" element={<PrivateRoute><CareerRecommendations /></PrivateRoute>} />
      <Route path="/roadmap" element={<PrivateRoute><LearningRoadmap /></PrivateRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
