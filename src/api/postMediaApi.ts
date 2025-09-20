import { get, post, put, del } from '../utils/axios';

// 帖子媒体类型
export interface PostMedia {
  mediaId?: number;
  postId: number;
  mediaType: string;
  url: string;
  uploadedAt?: string;
}

// 新增媒体
export const createPostMedia = (data: PostMedia) => {
  return post('/postMedia', data);
}

// 根据 ID 获取媒体
export const getPostMediaById = (id: number) => {
  return get<PostMedia>(`/postMedia/${id}`);
}

// 获取某个帖子的全部媒体
export const getMediaByPostId = (postId: number) => {
  return get<PostMedia[]>(`/postMedia/post/${postId}`);
}

// 获取全部媒体
export const getAllPostMedia = () => {
  return get<PostMedia[]>('/postMedia');
}

// 更新媒体
export const updatePostMedia = (data: PostMedia) => {
  return put('/postMedia/update', data);
}

// 删除媒体
export const deletePostMedia = (id: number) => {
  return del(`/postMedia/${id}`);
}
