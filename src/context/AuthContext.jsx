import { createContext, useContext, useState, useEffect } from 'react';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY, api, isMockEnabled } from '../lib/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(AUTH_TOKEN_KEY) || null;
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // Sync token to localStorage
  useEffect(() => {
    try {
      if (token) {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
      } else {
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }
    } catch (e) {
      console.warn('Failed to sync auth token to localStorage', e);
    }
  }, [token]);

  // Sync user to localStorage
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_USER_KEY);
      }
    } catch (e) {
      console.warn('Failed to sync auth user to localStorage', e);
    }
  }, [user]);

  /**
   * Login function providing real or mock JWT authentication
   */
  /**
   * Login function using email and password
   */
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res?.token && res?.user) {
        localStorage.setItem(AUTH_TOKEN_KEY, res.token);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.user));
        setToken(res.token);
        setUser(res.user);
        return { success: true, user: res.user, token: res.token };
      }
      throw new Error(res?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Send Brevo OTP code
   */
  const sendOtp = async (email, name) => {
    setLoading(true);
    try {
      const res = await api.sendOtp(email, name);
      return res;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verify Brevo OTP code and complete login/registration
   */
  const verifyOtp = async (email, otp, name) => {
    setLoading(true);
    try {
      const res = await api.verifyOtp(email, otp, name);
      if (res?.token && res?.user) {
        localStorage.setItem(AUTH_TOKEN_KEY, res.token);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.user));
        setToken(res.token);
        setUser(res.user);
        return {
          success: true,
          user: res.user,
          token: res.token,
          requiresPasswordSetup: Boolean(res.requiresPasswordSetup),
        };
      }
      throw new Error(res?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Set citizen account password
   */
  const setPassword = async (newPassword, emailFallback) => {
    setLoading(true);
    try {
      const targetEmail = emailFallback || user?.email;
      const res = await api.setPassword(newPassword, targetEmail);
      if (res?.user) {
        const mergedUser = { ...user, ...res.user, hasPassword: true };
        setUser(mergedUser);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(mergedUser));
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout function
   */
  const logout = () => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
    } catch (e) {
      console.warn('Failed to clear auth from localStorage', e);
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    login,
    logout,
    sendOtp,
    verifyOtp,
    setPassword,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
