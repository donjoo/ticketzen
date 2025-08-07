// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
// import Dashboard from "./pages/Dashboard"; // optional for now
import { useAuth } from "./context/useAuth";
import Dashboard from "./pages/dashboard";
import './App.css'
import TicketDetail from "./pages/TicketDetail";


const App = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/dashboard"
        element={user ? <Dashboard /> : <Navigate to="/login" />}
      />
      <Route path="*" element={<Navigate to="/login" />} />
      <Route path="/tickets/:ticketId" element={<TicketDetail />} />
    </Routes>
  );
};

export default App;
