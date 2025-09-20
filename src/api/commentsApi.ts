import { get, post, put, del } from '../utils/axios';

// 评论类型
export interface Comments {
  commentId?: number;
  postId: number;
  userId: number;
  parentId?: number;
  replyToUserId?: number;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

// 新增评论
export const createComment = (data: Comments) => {
  return post('/comments', data);
}

// 根据 ID 获取评论
export const getCommentById = (id: number) => {
  return get<Comments>(`/comments/${id}`);
}

// 获取某个帖子的评论
export const getCommentsByPostId = (postId: number) => {
  return get<Comments[]>(`/comments/post/${postId}`);
}

// 获取某个父评论的子评论（回复）
export const getCommentsByParentId = (parentId: number) => {
  return get<Comments[]>(`/comments/parent/${parentId}`);
}

// 获取所有评论
export const getAllComments = () => {
  return get<Comments[]>('/comments');
}

// 更新评论
export const updateComment = (data: Comments) => {
  return put('/comments/update', data);
}

// 删除评论
export const deleteComment = (id: number) => {
  return del(`/comments/${id}`);
}
