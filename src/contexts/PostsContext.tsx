"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Post, CreatePostData, User } from "@/types";

interface PostsContextType {
  posts: Post[];
  allPosts: Post[];
  pendingPosts: Post[];
  isLoading: boolean;
  createPost: (data: CreatePostData, author: User) => Promise<boolean>;
  updatePost: (
    postId: string,
    data: Partial<Post>,
    userId: string
  ) => Promise<boolean>;
  likePost: (postId: string) => void;
  refreshPosts: () => void;
  approvePost: (postId: string, adminId: string) => Promise<boolean>;
  rejectPost: (
    postId: string,
    adminId: string,
    reason: string
  ) => Promise<boolean>;
  deletePost: (postId: string, adminId: string) => Promise<boolean>;
  getAllPostsForAdmin: () => Post[];
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export function PostsProvider({ children }: { children: React.ReactNode }) {
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Função para buscar posts da API
  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/posts");

      if (response.ok) {
        const posts = await response.json();
        // Converter as datas de string para Date
        const postsWithDates = posts.map((post: any) => ({
          id: post.id,
          title: post.title,
          subtitle: post.subtitle,
          content: post.content,
          image: post.imageUrl, // Mapear imageUrl para image
          authorId: post.authorId,
          createdAt: new Date(post.createdAt),
          updatedAt: new Date(post.updatedAt),
          likes: post.likes || 0,
          comments: post.comments || [],
          status: post.status,
          rejectedReason: post.rejectedReason,
          author: {
            id: post.author.id,
            username: post.author.username,
            email: post.author.email,
            avatar:
              post.author.avatar ||
              `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face`,
            role: post.author.role,
            createdAt: new Date(post.author.createdAt),
            updatedAt: new Date(post.author.updatedAt),
          },
        }));
        setAllPosts(postsWithDates);
      } else {
        console.error("Erro ao buscar posts:", response.statusText);
        setAllPosts([]);
      }
    } catch (error) {
      console.error("Erro ao conectar com a API:", error);
      setAllPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Posts visíveis para usuários normais (apenas aprovados)
  const posts = allPosts.filter((post) => post.status === "APPROVED");

  // Posts pendentes de aprovação
  const pendingPosts = allPosts.filter((post) => post.status === "PENDING");

  const createPost = async (
    data: CreatePostData,
    author: User
  ): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Criar FormData para enviar dados e imagem
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("subtitle", data.subtitle);
      formData.append("content", data.content);
      formData.append("author_id", author.id);
      formData.append("author_username", author.username);
      formData.append("author_email", author.email);
      formData.append("author_role", author.role);

      if (data.image) {
        formData.append("image", data.image);
      }

      const response = await fetch("/api/posts", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        // Recarregar posts após criar um novo
        await fetchPosts();
        return true;
      } else {
        console.error("Erro ao criar post:", response.statusText);
        return false;
      }
    } catch (error) {
      console.error("Erro ao criar post:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePost = async (
    postId: string,
    data: Partial<Post>,
    userId: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Criar FormData para enviar dados e imagem
      const formData = new FormData();
      formData.append("title", data.title || "");
      formData.append("subtitle", data.subtitle || "");
      formData.append("content", data.content || "");

      // Se há uma nova imagem, adicionar ao FormData
      if (
        data.image &&
        typeof data.image === "object" &&
        "size" in data.image
      ) {
        formData.append("image", data.image as File);
      }

      const response = await fetch(`/api/posts/${postId}?user_id=${userId}`, {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        await fetchPosts();
        return true;
      } else {
        const errorData = await response.json();
        console.error("Erro ao atualizar post:", errorData.error);
        return false;
      }
    } catch (error) {
      console.error("Erro ao atualizar post:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const likePost = (postId: string) => {
    // Implementar like via API quando necessário
    const updatedPosts = allPosts.map((post) =>
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    );
    setAllPosts(updatedPosts);
  };

  const approvePost = async (
    postId: string,
    adminId: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(
        `/api/posts/${postId}/approve?admin_id=${adminId}`,
        {
          method: "PUT",
        }
      );

      if (response.ok) {
        await fetchPosts(); // Recarregar posts
        return true;
      } else {
        console.error("Erro ao aprovar post:", response.statusText);
        return false;
      }
    } catch (error) {
      console.error("Erro ao aprovar post:", error);
      return false;
    }
  };

  const rejectPost = async (
    postId: string,
    adminId: string,
    reason: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(
        `/api/posts/${postId}/reject?admin_id=${adminId}&reason=${encodeURIComponent(
          reason
        )}`,
        {
          method: "PUT",
        }
      );

      if (response.ok) {
        await fetchPosts(); // Recarregar posts
        return true;
      } else {
        console.error("Erro ao rejeitar post:", response.statusText);
        return false;
      }
    } catch (error) {
      console.error("Erro ao rejeitar post:", error);
      return false;
    }
  };

  const deletePost = async (
    postId: string,
    adminId: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/posts/${postId}?admin_id=${adminId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchPosts(); // Recarregar posts
        return true;
      } else {
        const errorData = await response.json();
        console.error("Erro ao deletar post:", response.status, errorData);
        return false;
      }
    } catch (error) {
      console.error("Erro ao deletar post:", error);
      return false;
    }
  };

  const getAllPostsForAdmin = (): Post[] => {
    return allPosts;
  };

  const refreshPosts = () => {
    fetchPosts();
  };

  return (
    <PostsContext.Provider
      value={{
        posts, // Apenas posts aprovados
        allPosts, // Todos os posts
        pendingPosts,
        isLoading,
        createPost,
        updatePost,
        likePost,
        refreshPosts,
        approvePost,
        rejectPost,
        deletePost,
        getAllPostsForAdmin,
      }}
    >
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostsContext);
  if (context === undefined) {
    throw new Error("usePosts must be used within a PostsProvider");
  }
  return context;
}
