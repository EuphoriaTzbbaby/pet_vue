import { get, post, put, del } from '../utils/axios';

// 帖子类型
export interface Posts {
  postId?: number;
  userId: number;
  title: string;
  content: string;
  tags: string;
  createdAt?: string;
  updatedAt?: string;
}

// 新增帖子
export const createPost = (data: Posts) => {
  return post('/posts', data);
}

// 获取帖子详情
export const getPostById = (id: number) => {
  return get<Posts>(`/posts/${id}`);
}

// 获取全部帖子
export const getAllPosts = () => {
  return get<Posts[]>('/posts');
}

// 更新帖子
export const updatePost = (data: Posts) => {
  return put('/posts/update', data);
}

// 删除帖子
export const deletePost = (id: number) => {
  return del(`/posts/${id}`);
}
