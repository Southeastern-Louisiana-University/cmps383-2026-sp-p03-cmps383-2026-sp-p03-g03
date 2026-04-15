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
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: (silent?: boolean) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserDto | null>(null);
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

      // Silent refresh should not wipe a valid session because of transient
      // network/server issues. Only clear user when auth is actually invalid.
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

      void api.getCurrentUser()
        .then((freshUser) => setUser(freshUser))
        .catch(() => {
          // best-effort refresh; login already returned user data
        });
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

      void api.getCurrentUser()
        .then((freshUser) => setUser(freshUser))
        .catch(() => {
          // best-effort refresh; register already returned user data
        });
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
      await api.logout();
    } catch (err: any) {
      console.log("Logout error:", err);
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
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};