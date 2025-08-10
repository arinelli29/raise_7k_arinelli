"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Image as ImageIcon, AlertCircle } from "lucide-react";
import { Button, Input, Label, Textarea } from "@/components/ui";
import { Post } from "@/types";
import ImageUpload from "./ImageUpload";

interface EditPostModalProps {
  post: Post;
  onClose: () => void;
  onSave: (updatedPost: Partial<Post>) => Promise<boolean>;
}

export default function EditPostModal({
  post,
  onClose,
  onSave,
}: EditPostModalProps) {
  const [title, setTitle] = useState(post.title);
  const [subtitle, setSubtitle] = useState(post.subtitle || "");
  const [content, setContent] = useState(post.content);
  const [image, setImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !content.trim()) {
      setError("Título e conteúdo são obrigatórios");
      return;
    }

    setIsLoading(true);

    try {
      const updatedPost = {
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        content: content.trim(),
      };

      const success = await onSave(updatedPost);
      if (success) {
        onClose();
      } else {
        setError("Erro ao salvar post");
      }
    } catch (error) {
      setError("Erro interno do servidor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            <motion.div
              className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ pointerEvents: "auto" }}
            >
              <motion.div
                className="glass-effect w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border border-neon-cyan modal-content"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                style={{ pointerEvents: "auto" }}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-neon-cyan/20 rounded-lg">
                      <FileText className="w-6 h-6 text-neon-cyan" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        Editar Post
                      </h2>
                      <p className="text-gray-400 text-sm">
                        Atualize as informações do seu post
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                    >
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <span className="text-red-400 text-sm">{error}</span>
                    </motion.div>
                  )}

                  {/* Title */}
                  <div className="space-y-2">
                    <Label className="text-neon-cyan">
                      <FileText className="w-4 h-4 inline mr-2" />
                      Título *
                    </Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Digite o título do post..."
                      className="bg-dark-card border-gray-600 text-white"
                      required
                    />
                  </div>

                  {/* Subtitle */}
                  <div className="space-y-2">
                    <Label className="text-neon-purple">
                      <FileText className="w-4 h-4 inline mr-2" />
                      Subtítulo (opcional)
                    </Label>
                    <Input
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="Digite um subtítulo..."
                      className="bg-dark-card border-gray-600 text-white"
                    />
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <Label className="text-neon-green">
                      <FileText className="w-4 h-4 inline mr-2" />
                      Conteúdo *
                    </Label>
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Digite o conteúdo do post..."
                      className="bg-dark-card border-gray-600 text-white min-h-[120px]"
                      required
                    />
                  </div>

                  {/* Image */}
                  <div className="space-y-2">
                    <Label className="text-neon-yellow">
                      <ImageIcon className="w-4 h-4 inline mr-2" />
                      Nova Imagem (opcional)
                    </Label>
                    <ImageUpload
                      onImageSelect={setImage}
                      selectedImage={image}
                    />
                    {post.image && !image && (
                      <div className="mt-2">
                        <p className="text-gray-400 text-sm mb-2">
                          Imagem atual:
                        </p>
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full max-h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      className="flex-1"
                      disabled={isLoading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      variant="neon"
                      className="flex-1 bg-gradient-to-r from-neon-cyan to-neon-blue"
                      disabled={isLoading}
                    >
                      {isLoading ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
