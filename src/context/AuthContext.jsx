import React, { createContext, useState, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout, getUsuario } from '../api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(() => getUsuario());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing session on mount
    const stored = getUsuario();
    setUsuario(stored);
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await apiLogin(email, password);
    setUsuario(res.usuario ?? null);
    return res;
  };

  const logout = () => {
    apiLogout();
    setUsuario(null);
  };

  const isAuthenticated = () => !!usuario;

  const hasRole = (role) => {
    if (!usuario) return false;
    const roles = usuario.roles || [];
    // roles may be array of objects or array of strings
    return roles.some((r) => (typeof r === 'string' ? r === role : r.nombre === role || r.name === role));
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout, isAuthenticated, hasRole, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
