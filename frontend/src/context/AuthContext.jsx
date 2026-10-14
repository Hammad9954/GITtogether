import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client.js';
import { useToast } from './ToastContext.jsx';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.success && res.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (credentials) => {
    try {
      const res = await api.post('/auth/login', credentials);
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        toast.success(`Welcome back, ${res.data.user.name}!`);
        return { success: true, user: res.data.user };
      }
    } catch (err) {
      toast.error(err.message || 'Login failed');
      return { success: false, error: err.message };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        toast.success('Registration successful! Please verify your college email.');
        return {
          success: true,
          user: res.data.user,
          verificationCode: res.data.verificationCode,
        };
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed');
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout', {});
    } finally {
      setUser(null);
      toast.info('Logged out successfully');
    }
  };

  const verifyEmail = async (params) => {
    try {
      const res = await api.post('/auth/verify-email', params);
      if (res.success) {
        setUser((prev) => (prev ? { ...prev, isVerified: true } : prev));
        toast.success('College email verified successfully!');
        return { success: true };
      }
    } catch (err) {
      toast.error(err.message || 'Verification failed');
      return { success: false, error: err.message };
    }
  };

  const updateProfile = async (updates) => {
    try {
      const res = await api.put('/users/profile', updates);
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        toast.success('Profile updated successfully!');
        return { success: true, user: res.data.user };
      }
    } catch (err) {
      toast.error(err.message || 'Profile update failed');
      return { success: false, error: err.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        verifyEmail,
        updateProfile,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
