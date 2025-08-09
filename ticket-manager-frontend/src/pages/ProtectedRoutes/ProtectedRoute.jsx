// ProtectedRoute.jsx
import { useAuth } from '@/context/useAuth';
import { Navigate } from 'react-router-dom';
// import { useAuth } from '../context/useAuth';

export function LoggedOutRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const tokens = JSON.parse(localStorage.getItem("authTokens"));
  const token = tokens?.access;
  if (isAuthenticated || token) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
