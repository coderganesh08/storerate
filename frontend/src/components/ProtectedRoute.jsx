import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { homePathFor } from '../utils/roles.js';

// Any signed-in user. Everyone else is sent to the login page.
export function RequireLogin() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p className="page-loading">Loading…</p>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}

// Only the listed roles. Someone with the wrong role is sent to their own home page.
// This is a convenience for the UI; the API enforces the same rules on every request.
export function RequireRole({ roles }) {
  const { user } = useAuth();
  if (!roles.includes(user.role)) return <Navigate to={homePathFor(user.role)} replace />;
  return <Outlet />;
}
