import React, { createContext, useState, useEffect, useContext } from 'react';
import apiService from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const profileData = await apiService.getProfile();
          setUser({
            id: profileData.user.id,
            email: profileData.user.email,
            role: profileData.user.role,
            fullName: profileData.profile ? profileData.profile.full_name : 'User'
          });
        } catch (error) {
          console.error('Session validation failed:', error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await apiService.login(email, password);
      localStorage.setItem('token', data.token);
      setUser({
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
        fullName: data.user.fullName
      });
      setLoading(false);
      return data.user;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (email, password, fullName, role) => {
    setLoading(true);
    try {
      const data = await apiService.register(email, password, fullName, role);
      localStorage.setItem('token', data.token);
      setUser({
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
        fullName: data.user.fullName
      });
      setLoading(false);
      return data.user;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const profileData = await apiService.getProfile();
      setUser({
        id: profileData.user.id,
        email: profileData.user.email,
        role: profileData.user.role,
        fullName: profileData.profile ? profileData.profile.full_name : 'User'
      });
    } catch (error) {
      console.error('Failed to refresh user context:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
