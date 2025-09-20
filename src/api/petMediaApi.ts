import { get, post, put, del } from '../utils/axios';

// 宠物媒体
export interface PetMedia {
  mediaId?: number;
  petId?: number;
  mediaType?: string;
  url?: string;
  uploadedAt?: string;
}

// 新增宠物媒体
export const createPetMedia = (data: PetMedia) => {
  return post('/petMedia/create', data);
}

// 获取宠物媒体详情（根据 mediaId）
export const getPetMediaById = (id: number) => {
  return get<PetMedia>(`/petMedia/read/${id}`);
}

// 根据宠物 ID 获取媒体列表
export const getPetMediaByPetId = (petId: number) => {
  return get<PetMedia[]>(`/petMedia/read/byPet/${petId}`);
}

// 获取全部宠物媒体
export const getAllPetMedia = () => {
  return get<PetMedia[]>('/petMedia/read/all');
}

// 更新宠物媒体
export const updatePetMedia = (data: PetMedia) => {
  return put('/petMedia/update', data);
}

// 删除宠物媒体（根据 mediaId）
export const deletePetMedia = (id: number) => {
  return del(`/petMedia/delete/${id}`);
}

// 删除某只宠物的全部媒体
export const deletePetMediaByPetId = (petId: number) => {
  return del(`/petMedia/delete/byPet/${petId}`);
}

// 统计某只宠物的媒体数量
export const countPetMediaByPetId = (petId: number) => {
  return get<number>(`/petMedia/read/count/${petId}`);
}
