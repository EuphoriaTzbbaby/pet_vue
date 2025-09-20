import { get, post, put, del } from '../utils/axios';
import type { Pet } from '../stores/types';  // 导入统一的类型

// 删除重复的 Pets 接口定义，直接使用 Pet 类型

// 新增宠物
export const createPet = (data: Pet) => {
  return post('/pets', data);
}

// 获取宠物详情
export const getPetById = (id: number) => {
  return get<Pet>(`/pets/${id}`);
}

// 获取全部宠物
export const getAllPets = () => {
  return get<Pet[]>('/pets');
}

// 更新宠物
export const updatePet = (data: Pet) => {
  return put('/pets/update', data);
}

// 删除宠物
export const deletePet = (id: number) => {
  return del(`/pets/${id}`);
}