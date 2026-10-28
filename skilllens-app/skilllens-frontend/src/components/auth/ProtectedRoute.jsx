import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * Route guard component.
 *
 * Usage in App.jsx:
 *   <Route element={<ProtectedRoute requiredRole="STUDENT"><StudentLayout /></ProtectedRoute>}>
 *     <Route path="/dashboard" element={<DashboardPage />} />
 *   </Route>
 *
 * When `children` is provided it is rendered (the Layout wraps <Outlet />).
 * When used without children it falls back to rendering <Outlet /> directly.
 */
export const ProtectedRoute = ({ requiredRole, allowedRole, children }) => {
  const { isAuthenticated, role, loading } = useAuth();

  // Support legacy `allowedRole` prop as alias
  const needed = requiredRole || allowedRole;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          <p className="text-sm font-medium text-slate-500">Authenticating session…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (needed && role !== needed) {
    return <Navigate to={role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
  }

  // If a layout was passed as children, render it (it must include <Outlet /> internally)
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
