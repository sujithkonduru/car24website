import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getToken, setToken as persistToken } from "../api.js";

export function decodeToken(token) {
  if (!token) return null;
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => getToken());
  const [user, setUser] = useState(() => decodeToken(getToken()));

  const login = useCallback((newToken) => {
    persistToken(newToken);
    setTokenState(newToken);
    setUser(decodeToken(newToken));
  }, []);

  const logout = useCallback(() => {
    persistToken(null);
    setTokenState(null);
    setUser(null);
  }, []);

  // Sync across browser tabs
  useEffect(() => {
    const onStorage = () => {
      const t = getToken();
      setTokenState(t);
      setUser(decodeToken(t));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const role = user?.role || null;
  const isUser = role === "user";
  const isOwner = role === "owner";
  const isBranchHead = role === "branch_head";
  const isSubAdmin = role === "sub_admin";
  const isStaff = ["staff"].includes(role);
  const isAdmin = ["admin", "superadmin"].includes(role);
  const isManagement = ["staff", "sub_admin", "branch_head", "admin", "superadmin"].includes(role);

  return (
    <AuthContext.Provider
      value={{ token, user, role, login, logout, isUser, isOwner, isBranchHead, isSubAdmin, isStaff, isAdmin, isManagement }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
