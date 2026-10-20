import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Loader2 } from 'lucide-react';

/**
 * ProtectedRoute component:
 * Checks for a valid user session & JWT token.
 * Redirects unauthenticated visitors to /login preserving the return location.
 */
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-medium">Verifying security session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
