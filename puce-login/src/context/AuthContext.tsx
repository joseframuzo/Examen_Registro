import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchPuceList, PuceRecord } from "../services/api";

type SessionUser = PuceRecord & { cedulaIngresada: string }; // guardamos la cedula usada al loguear

type AuthContextType = {
  user: SessionUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({} as any);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  async function login(username: string, password: string) {
    const list = await fetchPuceList();

    const uname = username.trim().toLowerCase();
    const pass = password.trim();

    const match = list.find(
      (r) => r.user.trim().toLowerCase() === uname && r.id.trim() === pass
    );

    if (!match) throw new Error("Usuario o contraseña incorrectos.");

    const sessionUser: SessionUser = { ...match, cedulaIngresada: pass };
    setUser(sessionUser);
    localStorage.setItem("user", JSON.stringify(sessionUser));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("user");
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
