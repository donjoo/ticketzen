// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
// import Dashboard from "./pages/Dashboard"; // optional for now
import { useAuth } from "./context/useAuth";
import Dashboard from "./pages/dashboard";
import './App.css'
import TicketDetail from "./pages/TicketDetail";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUserManagement from "./pages/admin/UserManagment";
import StaffDashboard from "./pages/staff/StaffDashboard";
import { LoggedOutRoute , ProtectedRoute} from "./pages/ProtectedRoutes/ProtectedRoute";


const App = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="*" element={<Navigate to="/login" />} />
      <Route path="/login" element={ <LoggedOutRoute><Login /></LoggedOutRoute>} />
      <Route path="/signup" element={ <LoggedOutRoute> <Signup /> </LoggedOutRoute>} />
      <Route
        path="/dashboard"
        element= {<ProtectedRoute allowedRoles={["staff","user"]}><Dashboard /></ProtectedRoute>}
      />
      
      <Route path="/tickets/:ticketId" element={<ProtectedRoute allowedRoles={["staff", "admin","user"]} ><TicketDetail /></ProtectedRoute>} />
      <Route path="/admindashboard" element={ <ProtectedRoute allowedRoles={["admin"]}>
          <AdminDashboard />
        </ProtectedRoute>} />
      <Route path ='admin-usermanagement' element={ <ProtectedRoute allowedRoles={["admin"]}>
          <AdminUserManagement />
        </ProtectedRoute>} />
      <Route path="/staff" element={ <ProtectedRoute allowedRoles={["staff", "admin"]}>
          <StaffDashboard />
        </ProtectedRoute>} />
    </Routes>
  );
};

export default App;
