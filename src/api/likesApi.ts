import { get, post, del } from '../utils/axios';

// 点赞类型
export interface Likes {
  likeId?: number;
  postId: number;
  userId: number;
  createdAt?: string;
}

// 新增点赞
export const createLike = (data: Likes) => {
  return post('/likes', data);
}

// 根据 ID 获取点赞
export const getLikeById = (id: number) => {
  return get<Likes>(`/likes/${id}`);
}

// 获取某个帖子的所有点赞
export const getLikesByPostId = (postId: number) => {
  return get<Likes[]>(`/likes/post/${postId}`);
}

// 获取某个用户的所有点赞
export const getLikesByUserId = (userId: number) => {
  return get<Likes[]>(`/likes/user/${userId}`);
}

// 获取所有点赞
export const getAllLikes = () => {
  return get<Likes[]>('/likes');
}

// 删除点赞（通过 likeId）
export const deleteLike = (id: number) => {
  return del(`/likes/${id}`);
}

// 删除点赞（通过 postId 和 userId）
export const deleteLikeByPostAndUser = (postId: number, userId: number) => {
  return del(`/likes/post/${postId}/user/${userId}`);
}
