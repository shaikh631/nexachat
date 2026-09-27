import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('nexachat_token') || null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'

  // Fetch current user on mount if token exists
  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await authApi.getMe();
          setUser(res.user);
        } catch (err) {
          console.warn('Failed to verify token:', err.message);
          localStorage.removeItem('nexachat_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await authApi.login(email, password);
    localStorage.setItem('nexachat_token', res.token);
    setToken(res.token);
    setUser(res.user);
    setAuthModalOpen(false);
    return res.user;
  };

  const register = async (name, email, password) => {
    const res = await authApi.register(name, email, password);
    localStorage.setItem('nexachat_token', res.token);
    setToken(res.token);
    setUser(res.user);
    setAuthModalOpen(false);
    return res.user;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      // ignore
    }
    localStorage.removeItem('nexachat_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await authApi.updateProfile(data);
    setUser(res.user);
    return res.user;
  };

  const openAuthModal = (mode = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        authModalOpen,
        authMode,
        login,
        register,
        logout,
        updateProfile,
        openAuthModal,
        closeAuthModal,
        setAuthMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
