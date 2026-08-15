import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string) => Promise<User>;
  customerLogin: (email: string) => Promise<User>;
  adminLogin: (credential: string, secretKey: string) => Promise<User>;
  register: (data: { email: string; name: string; phone?: string; address?: User['address'] }) => Promise<User>;
  logout: () => void;
  isAdmin: boolean;
  loginAsDemoCustomer: () => Promise<User>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    const savedUserId = localStorage.getItem('aura_user_id');
    if (savedUserId) {
      try {
        const u = await api.getMe();
        setUser(u);
      } catch {
        localStorage.removeItem('aura_user_id');
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchCurrentUser().finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string) => {
    const u = await api.login(email);
    localStorage.setItem('aura_user_id', u.id);
    setUser(u);
    return u;
  };

  const customerLogin = async (email: string) => {
    const u = await api.customerLogin(email);
    localStorage.setItem('aura_user_id', u.id);
    setUser(u);
    return u;
  };

  const adminLogin = async (credential: string, secretKey: string) => {
    const u = await api.adminLogin(credential, secretKey);
    localStorage.setItem('aura_user_id', u.id);
    setUser(u);
    return u;
  };

  const register = async (data: { email: string; name: string; phone?: string; address?: User['address'] }) => {
    const u = await api.register(data);
    localStorage.setItem('aura_user_id', u.id);
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('aura_user_id');
    setUser(null);
  };

  const loginAsDemoCustomer = async () => {
    return customerLogin('demo@markoaz.com');
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        customerLogin,
        adminLogin,
        register,
        logout,
        isAdmin: user?.role === 'admin',
        loginAsDemoCustomer,
        refreshUser
      }}
    >
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
