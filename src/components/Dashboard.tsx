"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  User,
  LogOut,
  Settings,
  Home,
  Search,
  Bell,
  Menu,
  Shield,
  Crown,
  AlertCircle,
  Target,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { usePosts } from "@/contexts/PostsContext";
import PostCard from "./PostCard";
import CreatePostModal from "./CreatePostModal";
import AdminPanel from "./AdminPanel";
import GoalMeter from "./GoalMeter";
import { AdminStats } from "@/types";

export default function Dashboard() {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<AdminStats>({
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
  });

  const {
    user,
    logout,
    isAuthenticated,
    isLoading: authLoading,
    isAdmin,
    getAdminStats,
  } = useAuth();
  const { posts, isLoading, pendingPosts } = usePosts();

  // Load admin stats
  useEffect(() => {
    if (isAdmin()) {
      getAdminStats().then(setStats);
    }
  }, [isAdmin, getAdminStats, posts]); // Adicionar posts como dependência

  // Proteção de rota - redirecionar se não estiver autenticado
  if (authLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-neon-blue border-t-transparent rounded-full mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.h2
            className="text-2xl font-bold text-neon-cyan neon-text"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            VERIFICANDO AUTENTICAÇÃO
          </motion.h2>
          <p className="text-gray-400">Conectando-se ao sistema...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // Redirecionar para landing page
    window.location.href = "/";
    return null;
  }

  const sidebarItems = [
    { icon: <Home className="w-5 h-5" />, label: "Feed", active: true },
    { icon: <Target className="w-5 h-5" />, label: "Metas", active: false },
    { icon: <Search className="w-5 h-5" />, label: "Explorar", active: false },
    {
      icon: <Bell className="w-5 h-5" />,
      label: "Notificações",
      active: false,
    },
    { icon: <User className="w-5 h-5" />, label: "Perfil", active: false },
    {
      icon: <Settings className="w-5 h-5" />,
      label: "Configurações",
      active: false,
    },
  ];

  // Adicionar item do painel admin se o usuário for admin
  if (isAdmin()) {
    sidebarItems.push({
      icon: <Shield className="w-5 h-5" />,
      label: "Painel Admin",
      active: false,
    });
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 cyber-grid opacity-10" />
      <div className="fixed inset-0 scan-lines opacity-20" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 glass-effect border-b border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-neon-cyan"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="w-6 h-6" />
            </Button>
            <motion.h1
              className="text-xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
            >
              FUTURISTIC
            </motion.h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Stats for Admin */}
            {isAdmin() && (
              <motion.div
                className="hidden md:flex items-center gap-4 px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-1 text-sm">
                  <User className="w-4 h-4 text-neon-blue" />
                  <span className="text-neon-blue font-medium">
                    {stats.totalUsers}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <BarChart3 className="w-4 h-4 text-neon-green" />
                  <span className="text-neon-green font-medium">
                    {stats.totalPosts}
                  </span>
                </div>
                {pendingPosts.length > 0 && (
                  <div className="flex items-center gap-1 text-sm">
                    <AlertCircle className="w-4 h-4 text-neon-yellow" />
                    <span className="text-neon-yellow font-medium">
                      {pendingPosts.length}
                    </span>
                  </div>
                )}
              </motion.div>
            )}

            {/* Admin Panel Button */}
            {isAdmin() && (
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="neon"
                  size="sm"
                  onClick={() => setShowAdminPanel(true)}
                  className="bg-gradient-to-r from-neon-purple to-neon-pink hidden sm:flex"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  ADMIN
                </Button>

                {/* Notification badge for pending posts */}
                {pendingPosts.length > 0 && (
                  <motion.div
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    {pendingPosts.length}
                  </motion.div>
                )}
              </motion.div>
            )}

            <Button
              variant="neon"
              size="sm"
              onClick={() => setShowCreatePost(true)}
              className="hidden sm:flex"
            >
              <Plus className="w-4 h-4 mr-2" />
              NOVO POST
            </Button>

            {/* User Avatar */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <img
                  src={user?.avatar}
                  alt={user?.username}
                  className="w-8 h-8 rounded-full border-2 border-neon-cyan"
                />
                {isAdmin() && (
                  <motion.div
                    className="absolute -bottom-1 -right-1 bg-neon-purple p-1 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Crown className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </div>
              <div className="hidden sm:block">
                <span className="text-sm text-neon-cyan">{user?.username}</span>
                {isAdmin() && (
                  <div className="text-xs text-neon-purple flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Admin
                  </div>
                )}
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-gray-400 hover:text-red-400"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed top-16 left-0 bottom-0 w-64 glass-effect border-r border-gray-800 z-30 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300`}
        initial={{ x: -256 }}
        animate={{ x: sidebarOpen || window.innerWidth >= 1024 ? 0 : -256 }}
      >
        <div className="p-4 space-y-2">
          {sidebarItems.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant={item.active ? "neon" : "ghost"}
                className={`w-full justify-start gap-3 ${
                  item.active
                    ? "bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 border-neon-blue"
                    : "text-gray-400 hover:text-white"
                }`}
                onClick={() => {
                  if (item.label === "Painel Admin") {
                    setShowAdminPanel(true);
                    setSidebarOpen(false);
                  }
                }}
              >
                <div className="relative">
                  {item.icon}
                  {item.label === "Painel Admin" && pendingPosts.length > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 w-2 h-2 rounded-full" />
                  )}
                </div>
                {item.label}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          <Button
            variant="neon"
            className="w-full sm:hidden"
            onClick={() => {
              setShowCreatePost(true);
              setSidebarOpen(false);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            NOVO POST
          </Button>

          {/* Admin Panel Button Mobile */}
          {isAdmin() && (
            <Button
              variant="neon"
              className="w-full sm:hidden bg-gradient-to-r from-neon-purple to-neon-pink"
              onClick={() => {
                setShowAdminPanel(true);
                setSidebarOpen(false);
              }}
            >
              <Shield className="w-4 h-4 mr-2" />
              PAINEL ADMIN
              {pendingPosts.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {pendingPosts.length}
                </span>
              )}
            </Button>
          )}

          {/* User info in sidebar */}
          <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700">
            <div className="flex items-center gap-3">
              <img
                src={user?.avatar}
                alt={user?.username}
                className="w-10 h-10 rounded-full border-2 border-neon-cyan"
              />
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">
                  {user?.username}
                </p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                {isAdmin() && (
                  <div className="flex items-center gap-1 mt-1">
                    <Crown className="w-3 h-3 text-neon-purple" />
                    <span className="text-xs text-neon-purple">
                      Administrator
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="pt-16 lg:pl-64 min-h-screen">
        <div className="max-w-4xl mx-auto p-4 space-y-6">
          {/* Welcome Message */}
          <motion.div
            className="glass-effect p-6 rounded-lg border border-neon-cyan"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-neon-cyan mb-2 flex items-center gap-2">
              Bem-vindo ao Futuro, {user?.username}!
              {isAdmin() && <Crown className="w-6 h-6 text-neon-purple" />}
            </h2>
            <p className="text-gray-400 mb-4">
              {isAdmin()
                ? "Você tem poderes administrativos para gerenciar a plataforma e moderar conteúdo."
                : "Compartilhe suas ideias revolucionárias e conecte-se com outros visionários digitais."}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-neon-green">
                <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
                <span>
                  {isAdmin()
                    ? `Administrador logado • ${pendingPosts.length} posts pendentes`
                    : "Autenticado e pronto para criar posts"}
                </span>
              </div>

              {isAdmin() && pendingPosts.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAdminPanel(true)}
                  className="border-orange-500 text-orange-400 hover:bg-orange-500/10"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Revisar Posts
                </Button>
              )}
            </div>

            {/* Admin Stats Preview */}
            {isAdmin() && (
              <motion.div
                className="mt-4 p-4 bg-gray-800/50 rounded-lg"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ delay: 0.5 }}
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-neon-blue">
                      {stats.totalUsers}
                    </div>
                    <div className="text-xs text-gray-400">Usuários</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-neon-purple">
                      {stats.totalPosts}
                    </div>
                    <div className="text-xs text-gray-400">Posts</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-neon-yellow">
                      {stats.pendingPosts}
                    </div>
                    <div className="text-xs text-gray-400">Pendentes</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-neon-green">
                      {stats.totalLikes}
                    </div>
                    <div className="text-xs text-gray-400">Curtidas</div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Goal Meter Section - MELHOR POSIÇÃO */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <GoalMeter />
          </motion.div>

          {/* Quick Actions Bar */}
          <motion.div
            className="glass-effect p-4 rounded-lg border border-gray-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <TrendingUp className="w-4 h-4 text-neon-green" />
                  <span>
                    {posts.length} posts ativos •{" "}
                    {isLoading ? "Carregando..." : "Atualizado"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="border-gray-600 text-gray-400 hover:text-white"
                >
                  Atualizar Feed
                </Button>
                <Button
                  variant="neon"
                  size="sm"
                  onClick={() => setShowCreatePost(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Post
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Posts Feed */}
          <div className="space-y-6">
            <motion.div
              className="flex items-center justify-between"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <h3 className="text-xl font-bold text-neon-green flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Feed de Posts
              </h3>
              <div className="text-sm text-gray-400">
                {posts.length} {posts.length === 1 ? "post" : "posts"} aprovados
              </div>
            </motion.div>

            <AnimatePresence>
              {isLoading ? (
                // Loading Skeleton
                Array.from({ length: 3 }).map((_, index) => (
                  <motion.div
                    key={`skeleton-${index}`}
                    className="glass-effect p-6 rounded-lg border border-gray-800"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="animate-pulse space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-700 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-700 rounded w-1/4" />
                          <div className="h-3 bg-gray-700 rounded w-1/6" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-700 rounded w-3/4" />
                        <div className="h-4 bg-gray-700 rounded w-1/2" />
                      </div>
                      <div className="h-48 bg-gray-700 rounded" />
                    </div>
                  </motion.div>
                ))
              ) : posts.length > 0 ? (
                posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <PostCard post={post} />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  className="text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="text-6xl mb-4">🚀</div>
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">
                    Nenhum post encontrado
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Seja o primeiro a compartilhar algo revolucionário!
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-neon-green mb-6">
                    <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
                    <span>
                      Logado como {user?.username} {isAdmin() && "(Admin)"}
                    </span>
                  </div>
                  <Button
                    variant="neon"
                    onClick={() => setShowCreatePost(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeiro Post
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showCreatePost && (
          <CreatePostModal onClose={() => setShowCreatePost(false)} />
        )}

        {showAdminPanel && (
          <AdminPanel onClose={() => setShowAdminPanel(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
