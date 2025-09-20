import { get, post, put, del } from '../utils/axios'

// 用户类型
export interface Users {
  userId?: number
  username: string
  password: string
  email?: string
  phone?: string
  role?: string
  avatarUrl?: string
  status?: string
  createdAt?: string
  updatedAt?: string
}

// 新增用户
export const createUser = (data: Users) => {
  return post('/users', data)
}

// 获取用户详情
export const getUserById = (id: number) => {
  return get<Users>(`/users/${id}`)
}

// 获取全部用户
export const getAllUsers = () => {
  return get<Users[]>('/users')
}

// 更新用户
export const updateUser = (data: Users) => {
  return put('/users', data)
}

// 删除用户
export const deleteUser = (id: number) => {
  return del(`/users/${id}`)
}

// 登录
export const loginWithEmail = (data: { email: string; password: string }) => {
  return post('/users/login', data)
}
