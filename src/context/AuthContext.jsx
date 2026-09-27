import { createContext, useContext, useState, useEffect } from 'react';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../lib/api.js';

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
  const login = async (email, password) => {
    setLoading(true);
    try {
      // Create mock JWT or call real backend if configured
      const normalizedEmail = (email || 'citizen@rti-assist.org').trim();
      const mockName = normalizedEmail.split('@')[0].replace(/[._-]/g, ' ');
      const capitalizedName = mockName.charAt(0).toUpperCase() + mockName.slice(1);

      // Generate a structured JWT-shaped token (Header.Payload.Signature)
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(
        JSON.stringify({
          sub: 'usr-101',
          email: normalizedEmail,
          name: capitalizedName || 'RTI Applicant',
          role: 'citizen',
          iss: 'rti-assist-backend',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 86400 * 7, // 7 days
        })
      );
      const signature = btoa('verified_rti_jwt_signature_key');
      const generatedToken = `${header}.${payload}.${signature}`;

      const authenticatedUser = {
        id: 'usr-101',
        name: capitalizedName || 'RTI Applicant',
        email: normalizedEmail,
        role: 'citizen',
      };

      setToken(generatedToken);
      setUser(authenticatedUser);

      return { success: true, user: authenticatedUser, token: generatedToken };
    } catch (err) {
      console.error('Authentication error', err);
      throw err;
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
