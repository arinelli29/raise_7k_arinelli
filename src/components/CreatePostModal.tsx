"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  Loader2,
  Sparkles,
  FileText,
  Type,
  Shield,
  Clock,
  CheckCircle,
} from "lucide-react";
import {
  Button,
  Input,
  Label,
  Textarea,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { usePosts } from "@/contexts/PostsContext";
import ImageUpload from "./ImageUpload";

interface CreatePostModalProps {
  onClose: () => void;
}

export default function CreatePostModal({ onClose }: CreatePostModalProps) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { user, isAuthenticated, isAdmin } = useAuth();
  const { createPost } = usePosts();

  // Verificar se o usuário está autenticado
  if (!isAuthenticated || !user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="glass-effect p-8 rounded-lg border border-red-500 max-w-md mx-4">
          <h3 className="text-xl font-bold text-red-400 mb-4">Acesso Negado</h3>
          <p className="text-gray-300 mb-6">
            Você precisa estar logado para criar posts.
          </p>
          <Button variant="neon" onClick={onClose} className="w-full">
            Fechar
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !content.trim()) {
      setError("Título e conteúdo são obrigatórios");
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await createPost(
        {
          title: title.trim(),
          subtitle: subtitle.trim(),
          content: content.trim(),
          image: image || undefined,
        },
        user
      );

      if (success) {
        setShowSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError("Erro ao criar post. Tente novamente.");
      }
    } catch (error) {
      setError("Erro inesperado. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <motion.div
          className="glass-effect p-8 rounded-lg border border-neon-green max-w-md mx-4 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <CheckCircle className="w-16 h-16 text-neon-green mx-auto mb-4" />
          <h3 className="text-xl font-bold text-neon-green mb-2">
            Post Criado com Sucesso!
          </h3>
          <p className="text-gray-300">
            {isAdmin()
              ? "Seu post foi publicado diretamente no feed."
              : "Seu post foi enviado para aprovação."}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        className="glass-effect w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border border-neon-cyan"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <Card className="border-0 bg-transparent">
          <CardHeader className="border-b border-gray-800">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-neon-cyan flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Criar Novo Post
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-sm text-gray-400">
              {isAdmin()
                ? "Como administrador, seus posts são publicados automaticamente."
                : "Seus posts serão revisados antes da publicação."}
            </p>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Título */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-neon-blue">
                  <Type className="w-4 h-4 inline mr-2" />
                  Título *
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Digite o título do seu post..."
                  className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-neon-blue"
                  maxLength={100}
                />
                <div className="text-xs text-gray-500 text-right">
                  {title.length}/100
                </div>
              </div>

              {/* Subtítulo */}
              <div className="space-y-2">
                <Label htmlFor="subtitle" className="text-neon-purple">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Subtítulo (opcional)
                </Label>
                <Input
                  id="subtitle"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Um subtítulo para complementar..."
                  className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-neon-purple"
                  maxLength={150}
                />
                <div className="text-xs text-gray-500 text-right">
                  {subtitle.length}/150
                </div>
              </div>

              {/* Conteúdo */}
              <div className="space-y-2">
                <Label htmlFor="content" className="text-neon-green">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Conteúdo *
                </Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Compartilhe suas ideias revolucionárias..."
                  className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-neon-green min-h-[120px]"
                  maxLength={2000}
                />
                <div className="text-xs text-gray-500 text-right">
                  {content.length}/2000
                </div>
              </div>

              {/* Upload de Imagem */}
              <div className="space-y-2">
                <Label className="text-neon-yellow">
                  <Shield className="w-4 h-4 inline mr-2" />
                  Imagem (opcional)
                </Label>
                <ImageUpload onImageSelect={setImage} selectedImage={image} />
              </div>

              {/* Status do Post */}
              <div className="flex items-center gap-2 p-3 bg-gray-800/30 rounded-lg border border-gray-700">
                {isAdmin() ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-neon-green" />
                    <span className="text-sm text-neon-green">
                      Post será publicado automaticamente
                    </span>
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 text-neon-yellow" />
                    <span className="text-sm text-neon-yellow">
                      Post será enviado para aprovação
                    </span>
                  </>
                )}
              </div>

              {/* Erro */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Botões */}
              <div className="flex items-center gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 border-gray-600 text-gray-400 hover:text-white"
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="neon"
                  className="flex-1"
                  disabled={isSubmitting || !title.trim() || !content.trim()}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Criar Post
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
