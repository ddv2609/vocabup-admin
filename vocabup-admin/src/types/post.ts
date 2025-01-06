import { FullName, User } from "./members";

export interface Author {
  _id: string;
  fullName: FullName;
  role: "admin" | "user";
  avatar: string | null;
}

export interface MediaFile {
  _id: string;
  fileId: string;
  fileUrl: string;
  fileType: "VIDEO" | "AUDIO" | "IMAGE";
}

export interface Post {
  _id: string;
  author: Author;
  title: string;
  content: string;
  mediaFiles: MediaFile[];
  reacts: number;
  reacted: boolean;
  views: number;
  commentAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  postId: string;
  author: Partial<User>;
  comment: string;
  createdAt: string;
  updatedAt: string;
  replies: number;
  parentId?: string;
}
