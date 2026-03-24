import React, { createContext, useState, useEffect, ReactNode } from 'react';
import * as api from '@/services/api';

export interface UserDto {
  id: number;
  userName: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  email?: string;
  phoneNumber?: string;
  roles: string[];
  loyaltyPoints: number;
}

export interface AuthContextType {
  user: UserDto | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const userData = await api.getCurrentUser();
      setUser(userData);
    } catch (err: any) {
      setUser(null);
      console.log('No active session');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      
      const userData = await api.login(username, password);

      setUser(userData);
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      setUser(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  
  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await api.logout();
    } catch (err: any) {
      console.log('Logout error:', err);
    } finally {
      setUser(null);
      setIsLoading(false);
    } 
  };


  useEffect(() => {
    checkAuth();
  }, []); 
  const value: AuthContextType = {
    user,
    isLoading,
    error,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};