import { get, post, put, del } from '../utils/axios';

// 合同类型
export interface AdoptionContracts {
  contractId?: number;
  applicationId: number;
  contractText: string;
  signedAt?: string;
  unsignedAt?: string;
}

// 新增合同
export const createContract = (data: AdoptionContracts) => {
  return post('/contracts', data);
}

// 根据 ID 获取合同
export const getContractById = (id: number) => {
  return get<AdoptionContracts>(`/contracts/${id}`);
}

// 根据申请 ID 获取合同
export const getContractByApplicationId = (applicationId: number) => {
  return get<AdoptionContracts>(`/contracts/application/${applicationId}`);
}

// 获取所有合同
export const getAllContracts = () => {
  return get<AdoptionContracts[]>('/contracts');
}

// 获取已签署合同数量
export const countSignedContracts = () => {
  return get<number>('/contracts/count/signed');
}

// 更新合同
export const updateContract = (data: AdoptionContracts) => {
  return put('/contracts', data);
}

// 删除合同
export const deleteContract = (id: number) => {
  return del(`/contracts/${id}`);
}
