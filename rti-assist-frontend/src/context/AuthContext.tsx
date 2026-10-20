import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email?: string, password?: string) => Promise<{ success: boolean; user: User; token: string }>;
  logout: () => void;
  loading: boolean;
}

export const AUTH_TOKEN_KEY = 'rti_assist_token';
export const AUTH_USER_KEY = 'rti_assist_user';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(AUTH_TOKEN_KEY) || null;
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState<boolean>(false);

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

  const login = async (email?: string, password?: string) => {
    setLoading(true);
    try {
      const normalizedEmail = (email || 'darkpearl251103@gmail.com').trim();
      const mockName = normalizedEmail.split('@')[0].replace(/[._-]/g, ' ');
      const capitalizedName = mockName.charAt(0).toUpperCase() + mockName.slice(1);

      // Generate a structured JWT (Header.Payload.Signature)
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(
        JSON.stringify({
          sub: 'usr-101',
          email: normalizedEmail,
          name: capitalizedName || 'RTI Applicant',
          role: 'citizen',
          iss: 'rti-assist-backend',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 86400 * 7,
        })
      );
      const signature = btoa('verified_rti_jwt_signature_key');
      const generatedToken = `${header}.${payload}.${signature}`;

      const authenticatedUser: User = {
        id: 'usr-101',
        name: capitalizedName || 'RTI Applicant',
        email: normalizedEmail,
        role: 'citizen',
      };

      setToken(generatedToken);
      setUser(authenticatedUser);

      return { success: true, user: authenticatedUser, token: generatedToken };
    } finally {
      setLoading(false);
    }
  };

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

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
