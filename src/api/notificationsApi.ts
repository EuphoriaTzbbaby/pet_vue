import { get, post, put, del } from '../utils/axios';

// 通知类型
export interface Notifications {
  notificationId?: number;
  userId?: number;
  otherId?: number;
  type?: string;
  content?: string;
  isRead?: number;
  createdAt?: string;
}

// 新增通知
export const createNotification = (data: Notifications) => {
  return post('/notifications', data);
}

// 获取通知详情
export const getNotificationById = (id: number) => {
  return get<Notifications>(`/notifications/${id}`);
}

// 获取全部通知
export const getAllNotifications = () => {
  return get<Notifications[]>('/notifications');
}

// 更新通知
export const updateNotification = (data: Notifications) => {
  return put('/notifications/update', data);
}

// 删除通知
export const deleteNotification = (id: number) => {
  return del(`/notifications/${id}`);
}
