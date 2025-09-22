import { get, post, put, del } from '../utils/axios';

// 领养申请类型
export interface AdoptionApplications {
  applicationId?: number;
  petId: number;
  userId: number;
  reason: string;
  livingCondition: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 新增领养申请
export const createApplication = (data: AdoptionApplications) => {
  return post('/adoptions', data);
}

// 根据 ID 获取领养申请
export const getApplicationById = (id: number) => {
  return get<AdoptionApplications>(`/adoptions/${id}`);
}

// 获取所有领养申请
export const getAllApplications = () => {
  return get<AdoptionApplications[]>('/adoptions');
}

// 根据用户 ID 获取领养申请
export const getApplicationsByUserId = (userId: number) => {
  return get<AdoptionApplications[]>(`/adoptions/user/${userId}`);
}

// 根据宠物 ID 获取领养申请
export const getApplicationsByPetId = (petId: number) => {
  return get<AdoptionApplications[]>(`/adoptions/pet/${petId}`);
}

// 根据状态统计申请数量
export const countApplicationsByStatus = (status: string) => {
  return get<number>(`/adoptions/count/${status}`);
}

// 更新领养申请
export const updateApplication = (data: AdoptionApplications) => {
  return put('/adoptions', data);
}

// 删除领养申请
export const deleteApplication = (id: number) => {
  return del(`/adoptions/${id}`);
}
