export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: "ADMIN" | "USER";
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  image?: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  comments: Comment[];
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectedReason?: string;
  author: User;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  postId: string;
  authorId: string;
  author: User;
}

export interface Like {
  id: string;
  createdAt: Date;
  postId: string;
  userId: string;
  user: User;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface CreatePostData {
  title: string;
  subtitle: string;
  content: string;
  image?: File;
}

export interface AdminStats {
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

export interface UserManagement {
  users: User[];
  promoteToAdmin: (userId: string) => Promise<boolean>;
  demoteFromAdmin: (userId: string) => Promise<boolean>;
}

export interface PostManagement {
  pendingPosts: Post[];
  approvePost: (postId: string, adminId: string) => Promise<boolean>;
  rejectPost: (
    postId: string,
    adminId: string,
    reason: string
  ) => Promise<boolean>;
}
