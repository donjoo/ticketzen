import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [authTokens, setAuthTokens] = useState(() =>
    localStorage.getItem("authTokens")
      ? JSON.parse(localStorage.getItem("authTokens"))
      : null
  );

  const [user, setUser] = useState(() =>
    localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user"))
      : null
  );

  const loginUser = async (username, password) => {
    try {
      const response = await fetch("http://localhost:8000/api/token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setAuthTokens(data);
        setUser(data.user);
        localStorage.setItem("authTokens", JSON.stringify(data));
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard", { replace: true });
      } else {
        let message = "Invalid credentials"
        toast.error(message, {
          duration: 4000, // optional: how long the toast stays
          position: "top-center" // optional: position of the toast
        });
      }
    } catch (error) {
      console.error("Login error:", error);
          toast.error("Server error. Please try again later.", {
      duration: 4000,
      position: "top-center",
    });
    }
  };

  const logoutUser = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem("authTokens");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <AuthContext.Provider
      value={{ user, authTokens, loginUser, logoutUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
