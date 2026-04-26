import React, { createContext, useState, useEffect, ReactNode } from "react";
import * as api from "@/services/api";

export interface UserDto {
  id: number;
  userName: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  email?: string;
  phoneNumber?: string;
  locationId: number;
  roles: string[];
  loyaltyPoints: number;
}

export interface AuthContextType {
  user: UserDto | null;
  isGuest: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<UserDto>;
  register: (username: string, password: string, displayName?: string) => Promise<UserDto>;
  logout: () => Promise<void>;
  continueAsGuest: () => void;
  checkAuth: (silent?: boolean) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
      }
      setError(null);
      const userData = await api.getCurrentUser();
      setUser(userData);
    } catch (err: any) {
      const status = typeof err?.status === 'number' ? err.status : undefined;
      const isUnauthorized = status === 401 || status === 403;

      if (!silent || isUnauthorized) {
        setUser(null);
      }
      setError(null);
      console.log("No active session");
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  };

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const userData = await api.login(username, password);
      setUser(userData);
      setIsGuest(false);
      return userData;
    } catch (err: any) {
      const errorMessage = err.message || "Login failed";
      setError(errorMessage);
      setUser(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, password: string, displayName?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const userData = await api.register({
        userName: username,
        password,
        displayName,
      });

      setUser(userData);
      setIsGuest(false);
      return userData;
    } catch (err: any) {
      const errorMessage = err.message || "Registration failed";
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
      if (!isGuest) {
        await api.logout();
      }
    } catch (err: any) {
      console.log("Logout error:", err);
    } finally {
      setUser(null);
      setIsGuest(false);
      setIsLoading(false);
    }
  };

  const continueAsGuest = async () => {
    try {
      await api.logout();
    } catch {}
    setIsGuest(true);
    setUser(null);
    setError(null);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isGuest,
    isLoading,
    error,
    login,
    register,
    logout,
    continueAsGuest,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};