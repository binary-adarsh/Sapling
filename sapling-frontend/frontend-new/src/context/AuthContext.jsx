import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { registerUnauthorizedHandler } from "../lib/api";
import { saveToken, getToken, clearToken, decodeToken, isTokenExpired } from "../lib/auth";

const AuthContext = createContext(null);

function buildUser(token) {
  const payload = decodeToken(token);
  if (!payload || isTokenExpired(payload)) return null;
  return {
    email: payload.sub || payload.email,
    role: payload.role,
    name: payload.name,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = getToken();
    return token ? buildUser(token) : null;
  });
  const [ready] = useState(true);
  const navigate = useNavigate();

  const logout = useCallback(
    (opts = {}) => {
      clearToken();
      setUser(null);
      if (!opts.silent) navigate("/login");
    },
    [navigate]
  );

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      setUser(null);
      navigate("/login");
    });
  }, [navigate]);

  const login = useCallback(async ({ email, password }) => {
    const { data } = await api.post("/auth/login", { email, password });
    if (!data?.token) throw new Error("Token not received from server.");
    saveToken(data.token);
    const nextUser = buildUser(data.token);
    setUser(nextUser);
    return nextUser;
  }, []);

  const register = useCallback(async ({ name, email, password, role }) => {
    const { data } = await api.post("/auth/register", { name, email, password, role });
    return data;
  }, []);

  const value = useMemo(
    () => ({ user, ready, login, register, logout, setUser }),
    [user, ready, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
