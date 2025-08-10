"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  MoreHorizontal,
  Calendar,
  Clock,
  Edit,
  Trash2,
} from "lucide-react";
import { Button, Card } from "@/components/ui";
import { Post } from "@/types";
import { formatDate, formatDateTime } from "@/lib/utils";
import { usePosts } from "@/contexts/PostsContext";
import OptimizedImage from "./OptimizedImage";
import { useAuth } from "@/contexts/AuthContext";
import EditPostModal from "./EditPostModal";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { likePost, deletePost, updatePost } = usePosts();
  const { user } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  // Fechar menu quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const handleLike = () => {
    if (!liked) {
      likePost(post.id);
      setLiked(true);
    }
  };

  const handleSave = () => {
    setSaved(!saved);
  };

  const handleEdit = () => {
    setShowEditModal(true);
    setShowMenu(false);
  };

  const handleSaveEdit = async (
    updatedPost: Partial<Post>
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const success = await updatePost(post.id, updatedPost, user.id);

      if (success) {
        setShowEditModal(false);
        return true;
      } else {
        alert("Erro ao atualizar post. Verifique suas permissões.");
        return false;
      }
    } catch (error) {
      console.error("Erro ao atualizar post:", error);
      alert("Erro ao atualizar post.");
      return false;
    }
  };

  const handleDelete = async () => {
    if (!user) return;

    if (confirm("Tem certeza que deseja excluir este post?")) {
      try {
        // Se o usuário é admin, usar adminId, senão usar userId
        const userId = user.role === "ADMIN" ? user.id : user.id;

        const success = await deletePost(post.id, userId);

        if (!success) {
          alert("Erro ao excluir post. Verifique suas permissões.");
        }

        setShowMenu(false);
      } catch (error) {
        console.error("Erro ao excluir post:", error);
        alert("Erro ao excluir post.");
      }
    }
  };

  const canEditPost =
    !!user &&
    (user.id === post.authorId ||
      (user.role === "ADMIN" && post.author.role === "USER"));

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <Card className="glass-effect border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <motion.img
              src={post.author.avatar}
              alt={post.author.username}
              className="w-10 h-10 rounded-full border-2 border-neon-cyan"
              whileHover={{ scale: 1.1 }}
            />
            <div>
              <h4 className="font-semibold text-white">
                {post.author.username}
              </h4>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Calendar className="w-3 h-3" />
                <span>{formatDateTime(post.createdAt)}</span>
                <span>•</span>
                <Clock className="w-3 h-3" />
                <span>{formatDate(post.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="relative" ref={menuRef}>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreHorizontal className="w-5 h-5" />
            </Button>

            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-[9998]"
              >
                {canEditPost && (
                  <>
                    <button
                      onClick={handleEdit}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-300 hover:bg-gray-800 transition-colors rounded-t-lg"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Editar</span>
                    </button>
                    <div className="border-t border-gray-700" />
                  </>
                )}

                {canEditPost && (
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-400 hover:bg-red-500/10 transition-colors rounded-b-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Excluir</span>
                  </button>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-3">
          <h3 className="text-xl font-bold text-neon-cyan mb-1">
            {post.title}
          </h3>
          {post.subtitle && (
            <h4 className="text-lg text-neon-purple mb-3">{post.subtitle}</h4>
          )}
          <p className="text-gray-300 leading-relaxed">{post.content}</p>
        </div>

        {/* Image */}
        {post.image && (
          <OptimizedImage
            src={post.image}
            alt={post.title}
            className="w-full object-cover"
            width={800}
            height={600}
            quality="auto"
            format="auto"
          />
        )}

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-800">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center gap-2 ${
                liked
                  ? "text-red-400 hover:text-red-300"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
              <span>{post.likes + (liked ? 1 : 0)}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-gray-400 hover:text-white"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{post.comments.length}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-gray-400 hover:text-white"
            >
              <Share className="w-4 h-4" />
              <span>Compartilhar</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className={`flex items-center gap-2 ${
              saved
                ? "text-neon-yellow hover:text-yellow-300"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Bookmark className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
            <span>{saved ? "Salvo" : "Salvar"}</span>
          </Button>
        </div>
      </Card>

      {/* Edit Modal */}
      {showEditModal && (
        <EditPostModal
          post={post}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveEdit}
        />
      )}
    </motion.div>
  );
}
