// Dados compartilhados entre as rotas da API
export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  role: "admin" | "user";
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  image_url: string | null;
  author_id: string;
  author_username: string;
  author_email: string;
  author_role: string;
  created_at: string;
  likes: number;
  status: "pending" | "approved" | "rejected";
  rejected_reason?: string;
}

// Armazenamento em memória (em produção, usar banco de dados)
export const users: User[] = [];
export const posts: Post[] = [];

// Funções para gerenciar dados
export const addUser = (user: User) => {
  users.push(user);
};

export const findUserByEmail = (email: string): User | undefined => {
  return users.find((user) => user.email === email);
};

export const findUserById = (id: string): User | undefined => {
  return users.find((user) => user.id === id);
};

export const addPost = (post: Post) => {
  posts.push(post);
};

export const findPostById = (id: string): Post | undefined => {
  return posts.find((post) => post.id === id);
};

export const updatePostStatus = (
  id: string,
  status: Post["status"],
  rejected_reason?: string
) => {
  const postIndex = posts.findIndex((post) => post.id === id);
  if (postIndex !== -1) {
    posts[postIndex].status = status;
    if (rejected_reason) {
      posts[postIndex].rejected_reason = rejected_reason;
    }
  }
};

export const getAllPosts = (status?: string): Post[] => {
  if (status) {
    return posts.filter((post) => post.status === status);
  }
  return posts;
};
