"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Users,
  FileText,
  AlertCircle,
  Crown,
  Shield,
  ArrowUp,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Eye,
  Ban,
  Settings,
  BarChart3,
  UserPlus,
  UserMinus,
  Heart,
  TrendingUp,
  Activity,
  Loader2,
} from "lucide-react";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Textarea,
} from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { usePosts } from "@/contexts/PostsContext";
import { Post, User, AdminStats } from "@/types";
import { formatDate, formatDateTime } from "@/lib/utils";
import EditPostModal from "./EditPostModal";

interface AdminPanelProps {
  onClose: () => void;
}

type AdminView = "dashboard" | "users" | "posts" | "pending";

type ActionKind = "promote" | "demote" | null;

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const [view, setView] = useState<AdminView>("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [allUsers, setAllUsers] = useState<User[]>([]);
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
  const [isLoading, setIsLoading] = useState(true);

  // UI feedback states
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [actionKind, setActionKind] = useState<ActionKind>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState<"success" | "error">(
    "success"
  );

  // Edit/Delete posts UI state
  const [showEditPostModal, setShowEditPostModal] = useState(false);
  const [postBeingEdited, setPostBeingEdited] = useState<Post | null>(null);
  const [updatingPostId, setUpdatingPostId] = useState<string | null>(null);
  const [postActionKind, setPostActionKind] = useState<
    "delete" | "edit" | null
  >(null);

  const { user, promoteToAdmin, demoteFromAdmin, getAllUsers, getAdminStats } =
    useAuth();
  const {
    getAllPostsForAdmin,
    approvePost,
    rejectPost,
    deletePost,
    updatePost,
  } = usePosts();

  // Carregar dados quando o componente montar
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [usersData, statsData] = await Promise.all([
          getAllUsers(),
          getAdminStats(),
        ]);
        setAllUsers(usersData);
        setStats(statsData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        showToast("Erro ao carregar dados do Admin", "error");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [getAllUsers, getAdminStats]); // Remover allPosts da dependência

  // Toast helper
  const showToast = (message: string, variant: "success" | "error") => {
    setToastMessage(message);
    setToastVariant(variant);
    setToastOpen(true);
    window.clearTimeout((showToast as any)._t);
    (showToast as any)._t = window.setTimeout(() => setToastOpen(false), 2500);
  };

  // Recarregar dados quando necessário
  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [usersData, statsData] = await Promise.all([
        getAllUsers(),
        getAdminStats(),
      ]);
      setAllUsers(usersData);
      setStats(statsData);
    } catch (error) {
      console.error("Erro ao recarregar dados:", error);
      showToast("Erro ao atualizar dados", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="glass-effect p-8 rounded-lg border border-red-500 max-w-md mx-4">
          <h3 className="text-xl font-bold text-red-400 mb-4">Acesso Negado</h3>
          <p className="text-gray-300 mb-6">
            Apenas administradores podem acessar este painel.
          </p>
          <Button variant="neon" onClick={onClose} className="w-full">
            Fechar
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="glass-effect p-8 rounded-lg border border-neon-cyan max-w-md mx-4 text-center">
          <div className="w-16 h-16 border-4 border-neon-cyan border-t-transparent rounded-full mx-auto animate-spin mb-4" />
          <h3 className="text-xl font-bold text-neon-cyan mb-2">
            Carregando Painel Admin
          </h3>
          <p className="text-gray-300">Preparando dados administrativos...</p>
        </div>
      </div>
    );
  }

  const allPosts = getAllPostsForAdmin();

  const filteredUsers = allUsers.filter(
    (u) =>
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPosts = allPosts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.author.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePromoteUser = async (userId: string) => {
    setUpdatingUserId(userId);
    setActionKind("promote");
    try {
      const ok = await promoteToAdmin(userId);
      if (ok) {
        showToast("Usuário promovido a ADMIN", "success");
        await refreshData();
      } else {
        showToast("Não foi possível promover o usuário", "error");
      }
    } finally {
      setUpdatingUserId(null);
      setActionKind(null);
    }
  };

  const handleDemoteUser = async (userId: string) => {
    setUpdatingUserId(userId);
    setActionKind("demote");
    try {
      const ok = await demoteFromAdmin(userId);
      if (ok) {
        showToast("Usuário rebaixado para USER", "success");
        await refreshData();
      } else {
        showToast("Não foi possível rebaixar o usuário", "error");
      }
    } finally {
      setUpdatingUserId(null);
      setActionKind(null);
    }
  };

  const handleApprovePost = async (postId: string) => {
    if (user) {
      await approvePost(postId, user.id);
      await refreshData(); // Recarregar dados após mudança
    }
  };

  const openEditPost = (post: Post) => {
    setPostBeingEdited(post);
    setShowEditPostModal(true);
  };

  const handleSaveEditPost = async (
    updatedPost: Partial<Post>
  ): Promise<boolean> => {
    if (!user || !postBeingEdited) return false;
    setUpdatingPostId(postBeingEdited.id);
    setPostActionKind("edit");
    try {
      const ok = await updatePost(postBeingEdited.id, updatedPost, user.id);
      if (ok) {
        showToast("Post atualizado com sucesso", "success");
        setShowEditPostModal(false);
        setPostBeingEdited(null);
        await refreshData();
        return true;
      } else {
        showToast("Não foi possível atualizar o post", "error");
        return false;
      }
    } finally {
      setUpdatingPostId(null);
      setPostActionKind(null);
    }
  };

  const handleAdminDeletePost = async (postId: string) => {
    if (!user) return;
    if (!confirm("Tem certeza que deseja excluir este post?")) return;
    setUpdatingPostId(postId);
    setPostActionKind("delete");
    try {
      const ok = await deletePost(postId, user.id);
      if (ok) {
        showToast("Post excluído com sucesso", "success");
        await refreshData();
      } else {
        showToast("Não foi possível excluir o post", "error");
      }
    } finally {
      setUpdatingPostId(null);
      setPostActionKind(null);
    }
  };

  const handleRejectPost = async () => {
    if (selectedPost && user) {
      await rejectPost(selectedPost.id, user.id, rejectReason);
      setShowRejectModal(false);
      setSelectedPost(null);
      setRejectReason("");
      await refreshData(); // Recarregar dados após mudança
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-effect p-6 rounded-lg border border-neon-blue"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total de Usuários</p>
              <p className="text-2xl font-bold text-neon-blue">
                {stats.totalUsers}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUp className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-400">
                  +{stats.usersToday} hoje
                </span>
              </div>
            </div>
            <Users className="w-8 h-8 text-neon-blue" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-effect p-6 rounded-lg border border-neon-purple"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total de Posts</p>
              <p className="text-2xl font-bold text-neon-purple">
                {stats.totalPosts}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUp className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-400">
                  +{stats.postsToday} hoje
                </span>
              </div>
            </div>
            <FileText className="w-8 h-8 text-neon-purple" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-effect p-6 rounded-lg border border-neon-yellow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Posts Pendentes</p>
              <p className="text-2xl font-bold text-neon-yellow">
                {stats.pendingPosts}
              </p>
              {stats.pendingPosts > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3 text-orange-400" />
                  <span className="text-xs text-orange-400">
                    Requer atenção
                  </span>
                </div>
              )}
            </div>
            <Clock className="w-8 h-8 text-neon-yellow" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-effect p-6 rounded-lg border border-neon-green"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total de Curtidas</p>
              <p className="text-2xl font-bold text-neon-green">
                {stats.totalLikes}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <Heart className="w-3 h-3 text-red-400" />
                <span className="text-xs text-gray-400">Engajamento</span>
              </div>
            </div>
            <TrendingUp className="w-8 h-8 text-neon-green" />
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-effect border-gray-800">
          <CardHeader>
            <CardTitle className="text-neon-cyan flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Estatísticas de Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Aprovados</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-neon-green"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${
                          (stats.approvedPosts / stats.totalPosts) * 100
                        }%`,
                      }}
                      transition={{ delay: 0.5, duration: 1 }}
                    />
                  </div>
                  <span className="text-neon-green font-semibold">
                    {stats.approvedPosts}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Pendentes</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-neon-yellow"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${
                          (stats.pendingPosts / stats.totalPosts) * 100
                        }%`,
                      }}
                      transition={{ delay: 0.7, duration: 1 }}
                    />
                  </div>
                  <span className="text-neon-yellow font-semibold">
                    {stats.pendingPosts}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Rejeitados</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-red-500"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${
                          (stats.rejectedPosts / stats.totalPosts) * 100
                        }%`,
                      }}
                      transition={{ delay: 0.9, duration: 1 }}
                    />
                  </div>
                  <span className="text-red-400 font-semibold">
                    {stats.rejectedPosts}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-gray-800">
          <CardHeader>
            <CardTitle className="text-neon-purple flex items-center gap-2">
              <Users className="w-5 h-5" />
              Distribuição de Usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Administradores
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-neon-purple"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${
                          (stats.adminUsers / stats.totalUsers) * 100
                        }%`,
                      }}
                      transition={{ delay: 0.5, duration: 1 }}
                    />
                  </div>
                  <span className="text-neon-purple font-semibold">
                    {stats.adminUsers}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Usuários Regulares
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-neon-blue"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${
                          (stats.regularUsers / stats.totalUsers) * 100
                        }%`,
                      }}
                      transition={{ delay: 0.7, duration: 1 }}
                    />
                  </div>
                  <span className="text-neon-blue font-semibold">
                    {stats.regularUsers}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="glass-effect border-gray-800">
        <CardHeader>
          <CardTitle className="text-neon-green flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3"></div>
        </CardContent>
      </Card>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-neon-blue">Gerenciar Usuários</h3>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-dark-card border-gray-600 text-white"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredUsers.map((userItem) => (
          <motion.div
            key={userItem.id}
            className="glass-effect p-6 rounded-lg border border-gray-800"
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={userItem.avatar}
                  alt={userItem.username}
                  className="w-12 h-12 rounded-full border-2 border-neon-cyan"
                />
                <div>
                  <h4 className="font-semibold text-white flex items-center gap-2">
                    {userItem.username}
                    {userItem.role === "ADMIN" && (
                      <Shield className="w-4 h-4 text-neon-purple" />
                    )}
                  </h4>
                  <p className="text-gray-400 text-sm">{userItem.email}</p>
                  <p className="text-gray-500 text-xs">
                    Membro desde {formatDateTime(userItem.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    userItem.role === "ADMIN"
                      ? "bg-neon-purple/20 text-neon-purple"
                      : "bg-gray-700 text-gray-300"
                  }`}
                >
                  {userItem.role === "ADMIN" ? "ADMIN" : "USUÁRIO"}
                </span>

                {userItem.id !== user?.id && (
                  <div className="flex gap-2">
                    {userItem.role === "USER" ? (
                      <Button
                        size="sm"
                        variant="neon"
                        onClick={() => handlePromoteUser(userItem.id)}
                        className="bg-gradient-to-r from-neon-purple to-neon-pink"
                        disabled={
                          updatingUserId === userItem.id &&
                          actionKind === "promote"
                        }
                      >
                        {updatingUserId === userItem.id &&
                        actionKind === "promote" ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Promovendo...
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 mr-1" />
                            Promover
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDemoteUser(userItem.id)}
                        className="border-orange-500 text-orange-400 hover:bg-orange-500/10"
                        disabled={
                          updatingUserId === userItem.id &&
                          actionKind === "demote"
                        }
                      >
                        {updatingUserId === userItem.id &&
                        actionKind === "demote" ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Rebaixando...
                          </>
                        ) : (
                          <>
                            <UserMinus className="w-4 h-4 mr-1" />
                            Rebaixar
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderPosts = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-neon-purple">Todos os Posts</h3>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-dark-card border-gray-600 text-white"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredPosts.map((post) => (
          <motion.div
            key={post.id}
            className="glass-effect p-6 rounded-lg border border-gray-800"
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={post.author.avatar}
                    alt={post.author.username}
                    className="w-8 h-8 rounded-full border border-neon-cyan"
                  />
                  <div>
                    <h4 className="font-semibold text-white">{post.title}</h4>
                    <p className="text-gray-400 text-sm">
                      Por {post.author.username} •{" "}
                      {formatDateTime(post.createdAt)}
                    </p>
                  </div>
                </div>

                <p className="text-gray-300 mb-3 line-clamp-2">
                  {post.content}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {post.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    {formatDate(post.createdAt)} atrás
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    post.status === "APPROVED"
                      ? "bg-green-500/20 text-green-400"
                      : post.status === "PENDING"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {post.status === "APPROVED" && "APROVADO"}
                  {post.status === "PENDING" && "PENDENTE"}
                  {post.status === "REJECTED" && "REJEITADO"}
                </span>

                {/* Admin actions: Edit / Delete */}
                {post.author.role === "USER" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditPost(post)}
                      disabled={
                        updatingPostId === post.id && postActionKind === "edit"
                      }
                      className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10"
                    >
                      {updatingPostId === post.id &&
                      postActionKind === "edit" ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Editando...
                        </>
                      ) : (
                        <>
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAdminDeletePost(post.id)}
                      disabled={
                        updatingPostId === post.id &&
                        postActionKind === "delete"
                      }
                      className="border-red-500 text-red-400 hover:bg-red-500/10"
                    >
                      {updatingPostId === post.id &&
                      postActionKind === "delete" ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Excluindo...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-1" />
                          Excluir
                        </>
                      )}
                    </Button>
                  </>
                )}

                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderPending = () => {
    const pendingPosts = allPosts.filter((post) => post.status === "PENDING");

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-neon-yellow flex items-center gap-2">
            <Clock className="w-6 h-6" />
            Posts Pendentes ({pendingPosts.length})
          </h3>
        </div>

        {pendingPosts.length === 0 ? (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <CheckCircle className="w-16 h-16 text-neon-green mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neon-green mb-2">
              Tudo em dia!
            </h3>
            <p className="text-gray-400">
              Não há posts pendentes de aprovação no momento.
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            {pendingPosts.map((post) => (
              <motion.div
                key={post.id}
                className="glass-effect p-6 rounded-lg border border-neon-yellow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-start gap-4">
                  <img
                    src={post.author.avatar}
                    alt={post.author.username}
                    className="w-12 h-12 rounded-full border-2 border-neon-cyan"
                  />

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-white text-lg">
                        {post.title}
                      </h4>
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                        PENDENTE
                      </span>
                    </div>

                    {post.subtitle && (
                      <h5 className="text-neon-purple mb-2">{post.subtitle}</h5>
                    )}

                    <p className="text-gray-400 text-sm mb-3">
                      Por {post.author.username} •{" "}
                      {formatDateTime(post.createdAt)}
                    </p>

                    <p className="text-gray-300 mb-4">{post.content}</p>

                    {post.image && (
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full max-h-64 object-cover rounded-lg mb-4"
                      />
                    )}

                    <div className="flex items-center gap-3">
                      <Button
                        variant="neon"
                        onClick={() => handleApprovePost(post.id)}
                        className="bg-gradient-to-r from-green-500 to-green-600"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Aprovar
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedPost(post);
                          setShowRejectModal(true);
                        }}
                        className="border-red-500 text-red-400 hover:bg-red-500/10"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Rejeitar
                      </Button>

                      {/* Edit / Delete also available in pending */}
                      {post.author.role === "USER" && (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => openEditPost(post)}
                            disabled={
                              updatingPostId === post.id &&
                              postActionKind === "edit"
                            }
                            className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10"
                          >
                            {updatingPostId === post.id &&
                            postActionKind === "edit" ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Editando...
                              </>
                            ) : (
                              <>
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </>
                            )}
                          </Button>

                          <Button
                            variant="outline"
                            onClick={() => handleAdminDeletePost(post.id)}
                            disabled={
                              updatingPostId === post.id &&
                              postActionKind === "delete"
                            }
                            className="border-red-500 text-red-400 hover:bg-red-500/10"
                          >
                            {updatingPostId === post.id &&
                            postActionKind === "delete" ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Excluindo...
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                              </>
                            )}
                          </Button>
                        </>
                      )}

                      <Button variant="ghost" size="icon">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="h-full flex">
        {/* Sidebar */}
        <motion.div
          className="w-80 glass-effect border-r border-gray-800 p-6"
          initial={{ x: -320 }}
          animate={{ x: 0 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-neon-purple flex items-center gap-2">
              <Shield className="w-8 h-8" />
              ADMIN PANEL
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-6 h-6" />
            </Button>
          </div>

          <nav className="space-y-2">
            {[
              {
                id: "dashboard",
                label: "Dashboard",
                icon: <Activity className="w-5 h-5" />,
                count: null,
              },
              {
                id: "users",
                label: "Usuários",
                icon: <Users className="w-5 h-5" />,
                count: stats.totalUsers,
              },
              {
                id: "posts",
                label: "Posts",
                icon: <FileText className="w-5 h-5" />,
                count: stats.totalPosts,
              },
              {
                id: "pending",
                label: "Pendentes",
                icon: <Clock className="w-5 h-5" />,
                count: stats.pendingPosts,
              },
            ].map((item) => (
              <motion.button
                key={item.id}
                onClick={() => setView(item.id as AdminView)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                  view === item.id
                    ? "bg-neon-purple/20 border border-neon-purple text-neon-purple"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.count !== null && (
                  <span className="bg-gray-700 text-white text-xs px-2 py-1 rounded-full">
                    {item.count}
                  </span>
                )}
              </motion.button>
            ))}
          </nav>

          <div className="mt-8 p-4 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <img
                src={user?.avatar}
                alt={user?.username}
                className="w-8 h-8 rounded-full border border-neon-cyan"
              />
              <div>
                <p className="text-white font-medium">{user?.username}</p>
                <p className="text-neon-purple text-xs flex items-center gap-1">
                  Administrador
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          className="flex-1 p-8 overflow-y-auto"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {view === "dashboard" && renderDashboard()}
              {view === "users" && renderUsers()}
              {view === "posts" && renderPosts()}
              {view === "pending" && renderPending()}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass-effect p-6 rounded-lg border border-red-500 max-w-md w-full mx-4"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                <X className="w-6 h-6" />
                Rejeitar Post
              </h3>
              <p className="text-gray-300 mb-4">
                Você está prestes a rejeitar o post &quot;{selectedPost?.title}
                &quot;. Por favor, forneça um motivo para a rejeição.
              </p>
              <Textarea
                placeholder="Motivo da rejeição..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="bg-dark-card border-gray-600 text-white mb-4"
                rows={3}
              />
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedPost(null);
                    setRejectReason("");
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  variant="neon"
                  onClick={handleRejectPost}
                  disabled={!rejectReason.trim()}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600"
                >
                  <X className="w-4 h-4 mr-2" />
                  Rejeitar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toastOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`fixed top-4 right-4 z-[1000001] px-4 py-3 rounded-md border neon-border glass-effect ${
              toastVariant === "success"
                ? "text-neon-green border-neon-green"
                : "text-red-400 border-red-500"
            }`}
          >
            <div className="flex items-center gap-2">
              {toastVariant === "success" ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Post Modal */}
      {showEditPostModal && postBeingEdited && (
        <EditPostModal
          post={postBeingEdited}
          onClose={() => {
            setShowEditPostModal(false);
            setPostBeingEdited(null);
          }}
          onSave={handleSaveEditPost}
        />
      )}
    </motion.div>
  );
}
