import axiosInstance from "../axios";
import { Params } from "../types";
import { getQueryParams } from "../utils";

const postAdminBlog = async (title: string, content: string, files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  formData.append("title", title);
  formData.append("content", content);

  return axiosInstance.post("/posts/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

const getPosts = async (filters: Params) => {
  return axiosInstance.get(`/posts?${getQueryParams(filters)}`);
};

const getCommentsPost = async (postId: string) => {
  return axiosInstance.get(`/posts/comments/${postId}`);
};

const getCommentsReply = async (commentId: string) => {
  return axiosInstance.get(`/posts/comments/replies/${commentId}`);
};

const deletePost = async (postId: string) => {
  return axiosInstance.delete(`/posts/${postId}/`);
};

const deleteComment = async (commentId: string) => {
  return axiosInstance.delete(`/posts/comments/${commentId}`);
};

const addComment = async (
  postId: string,
  parentId: string | null,
  comment: string
) => {
  return axiosInstance.post("/posts/comments/send", {
    postId,
    parentId,
    comment,
  });
};

const reactPost = async (postId: string) => {
  return axiosInstance.post(`/posts/reacts/${postId}`);
};

export default {
  postAdminBlog,
  getPosts,
  getCommentsPost,
  getCommentsReply,
  deletePost,
  deleteComment,
  addComment,
  reactPost,
};
