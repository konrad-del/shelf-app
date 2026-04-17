import { createContext, useContext, useState, useEffect } from "react";
import { apiRequest } from "./queryClient";

interface AuthUser {
  id: number;
  username: string;
  email: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const data = await apiRequest("GET", "/api/auth/me");
      const u = await data.json();
      setUser(u);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    const resp = await apiRequest("POST", "/api/auth/login", { username, password });
    if (!resp.ok) {
      const err = await resp.json();
      throw new Error(err.error || "Login failed");
    }
    const u = await resp.json();
    setUser(u);
  };

  const register = async (username: string, email: string, password: string, displayName?: string) => {
    const resp = await apiRequest("POST", "/api/auth/register", { username, email, password, displayName });
    if (!resp.ok) {
      const err = await resp.json();
      throw new Error(err.error || "Registration failed");
    }
    const u = await resp.json();
    setUser(u);
  };

  const logout = async () => {
    await apiRequest("POST", "/api/auth/logout");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
