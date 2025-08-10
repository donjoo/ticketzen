// ProtectedRoute.jsx
import { useAuth } from '@/context/useAuth';
import { Navigate } from 'react-router-dom';
// import { useAuth } from '../context/useAuth';





export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is defined, check if user matches
  if (allowedRoles && !allowedRoles.includes(getUserRole(user))) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Helper to determine role string from user flags
function getUserRole(user) {
  if (user.is_superuser) return "admin";
  if (user.is_staff) return "staff";
  return "user";
}





// export function LoggedOutRoute({ children }) {
//   const { isAuthenticated } = useAuth();
//   const tokens = JSON.parse(localStorage.getItem("authTokens"));
//   const token = tokens?.access;
//   if (isAuthenticated || token) {
//     return <Navigate to="/dashboard" replace />;
//   }
//   return children;
// }


export const LoggedOutRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : children;
};