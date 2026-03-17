import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");

      if (token) {
        try {
          const res = await api.get("/user/profile");
          const userData = res.data.user;

          if (userData.role === "Admin" && localStorage.getItem("token")) {
            localStorage.clear();
            sessionStorage.setItem("token", token);
          }

          setUser(userData);
          setIsAuthenticated(true);
        } catch (err) {
          sessionStorage.clear();
          localStorage.clear();
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = (userData, token) => {
    if (userData.role === "Admin") {
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("role", userData.role);
    } else {
      localStorage.setItem("token", token);
      localStorage.setItem("role", userData.role);
    }
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    const token =
      sessionStorage.getItem("token") || localStorage.getItem("token");

    sessionStorage.clear();
    localStorage.clear();

    setUser(null);
    setIsAuthenticated(false);

    if (token) {
      api.post("/logout").catch(() => {});
    }

    window.location.replace("/");
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
