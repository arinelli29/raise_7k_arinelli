"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, LoginData, RegisterData } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthContextType extends AuthState {
  login: (data: LoginData) => Promise<AuthResult>;
  register: (data: RegisterData) => Promise<AuthResult>;
  logout: () => void;
  isAdmin: () => boolean;
  getAllUsers: () => Promise<User[]>;
  promoteToAdmin: (userId: string) => Promise<boolean>;
  demoteFromAdmin: (userId: string) => Promise<boolean>;
  getAdminStats: () => Promise<AdminStats>;
}

interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  pendingPosts: number;
  approvedPosts: number;
  rejectedPosts: number;
  totalLikes: number;
  adminUsers: number;
  regularUsers: number;
  postsToday: number;
  usersToday: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Verificar se há usuário logado no localStorage
    const savedUser = localStorage.getItem("futuristic_user");
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setAuthState({
          user: {
            ...user,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt),
          },
          isAuthenticated: true,
          isLoading: false,
        });
      } catch {
        localStorage.removeItem("futuristic_user");
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (data: LoginData): Promise<AuthResult> => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const user = result.user;
        console.log("Login bem-sucedido:", user);
        localStorage.setItem("futuristic_user", JSON.stringify(user));
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
        console.log("Estado de autenticação atualizado (login):", {
          user,
          isAuthenticated: true,
        });
        return { success: true };
      } else {
        console.warn("Erro no login (esperado):", result.error);
        // Mensagem amigável
        const message = result?.error || "Email ou senha incorretos";
        return { success: false, error: message };
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      return { success: false, error: "Erro ao conectar. Tente novamente." };
    } finally {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const register = async (data: RegisterData): Promise<AuthResult> => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const user = result.user;
        console.log("Registro bem-sucedido:", user);
        localStorage.setItem("futuristic_user", JSON.stringify(user));
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
        return { success: true };
      } else {
        console.warn("Erro no registro (esperado):", result.error);
        const message = result?.error || "Não foi possível criar a conta";
        return { success: false, error: message };
      }
    } catch (error) {
      console.error("Erro ao fazer registro:", error);
      return { success: false, error: "Erro ao conectar. Tente novamente." };
    } finally {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const logout = () => {
    localStorage.removeItem("futuristic_user");
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const isAdmin = (): boolean => {
    return authState.user?.role === "ADMIN";
  };

  const getAllUsers = async (): Promise<User[]> => {
    if (!authState.user?.id) return [];

    try {
      const response = await fetch(`/api/users?admin_id=${authState.user.id}`);
      if (response.ok) {
        const raw = await response.json();
        // Converter datas para Date para evitar erros no cliente
        return (raw as any[]).map((u) => ({
          ...u,
          createdAt: new Date(u.createdAt),
          updatedAt: new Date(u.updatedAt),
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    }
    return [];
  };

  const promoteToAdmin = async (userId: string): Promise<boolean> => {
    if (!authState.user?.id) return false;

    try {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: "ADMIN",
          adminId: authState.user.id,
        }),
      });

      if (response.ok) {
        // Atualizar usuário logado se necessário
        if (authState.user.id === userId) {
          const updatedUser = { ...authState.user, role: "ADMIN" as const };
          localStorage.setItem("futuristic_user", JSON.stringify(updatedUser));
          setAuthState((prev) => ({ ...prev, user: updatedUser }));
        }
        return true;
      }
    } catch (error) {
      console.error("Erro ao promover usuário:", error);
    }
    return false;
  };

  const demoteFromAdmin = async (userId: string): Promise<boolean> => {
    if (!authState.user?.id) return false;

    try {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: "USER",
          adminId: authState.user.id,
        }),
      });

      if (response.ok) {
        // Atualizar usuário logado se necessário
        if (authState.user.id === userId) {
          const updatedUser = { ...authState.user, role: "USER" as const };
          localStorage.setItem("futuristic_user", JSON.stringify(updatedUser));
          setAuthState((prev) => ({ ...prev, user: updatedUser }));
        }
        return true;
      }
    } catch (error) {
      console.error("Erro ao rebaixar usuário:", error);
    }
    return false;
  };

  const getAdminStats = async (): Promise<AdminStats> => {
    if (!authState.user?.id) {
      return {
        totalUsers: 0,
        totalPosts: 0,
        pendingPosts: 0,
        approvedPosts: 0,
        rejectedPosts: 0,
        totalLikes: 0,
        adminUsers: 0,
        regularUsers: 0,
        postsToday: 0,
        usersToday: 0,
      };
    }

    try {
      // Buscar usuários e posts em paralelo
      const [usersResponse, postsResponse] = await Promise.all([
        fetch(`/api/users?admin_id=${authState.user.id}`),
        fetch("/api/posts"),
      ]);

      let users: User[] = [];
      let posts: any[] = [];

      if (usersResponse.ok) {
        users = await usersResponse.json();
      }

      if (postsResponse.ok) {
        posts = await postsResponse.json();
      }

      // Calcular estatísticas
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const postsToday = posts.filter((post) => {
        const postDate = new Date(post.createdAt);
        return postDate >= today;
      }).length;

      const usersToday = users.filter((user) => {
        const userDate = new Date(user.createdAt);
        return userDate >= today;
      }).length;

      const totalLikes = posts.reduce(
        (sum, post) => sum + (post.likes || 0),
        0
      );

      const stats: AdminStats = {
        totalUsers: users.length,
        totalPosts: posts.length,
        pendingPosts: posts.filter((post) => post.status === "PENDING").length,
        approvedPosts: posts.filter((post) => post.status === "APPROVED")
          .length,
        rejectedPosts: posts.filter((post) => post.status === "REJECTED")
          .length,
        totalLikes,
        adminUsers: users.filter((user) => user.role === "ADMIN").length,
        regularUsers: users.filter((user) => user.role === "USER").length,
        postsToday,
        usersToday,
      };

      return stats;
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      return {
        totalUsers: 0,
        totalPosts: 0,
        pendingPosts: 0,
        approvedPosts: 0,
        rejectedPosts: 0,
        totalLikes: 0,
        adminUsers: 0,
        regularUsers: 0,
        postsToday: 0,
        usersToday: 0,
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
        isAdmin,
        getAllUsers,
        promoteToAdmin,
        demoteFromAdmin,
        getAdminStats,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
