import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Notification } from './types'
import { getAllNotifications } from '../api/notificationsApi'
import { ElMessage } from 'element-plus'

export const useNotificationStore = defineStore('notification', () => {
  // 状态
  const notifications = ref<Notification[]>([])
  const loading = ref(false)

  // 计算属性
  const unreadCount = computed(() => 
    notifications.value.filter(n => !n.isRead).length
  )
  
  const unreadNotifications = computed(() => 
    notifications.value.filter(n => !n.isRead)
  )
  
  const recentNotifications = computed(() => 
    notifications.value.slice(0, 10)
  )

  // 动作
  const fetchNotifications = async () => {
    loading.value = true
    try {
      const response = await getAllNotifications()
      notifications.value = response.data.sort((a, b) => 
        new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      )
      return { success: true }
    } catch (error: any) {
      ElMessage.error('获取通知失败')
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const markAsRead = (id: number) => {
    const notification = notifications.value.find(n => n.notificationId === id)
    if (notification) {
      notification.isRead = 1  // 改为 1 表示已读
    }
  }

  const markAllAsRead = () => {
    notifications.value.forEach(n => {
      n.isRead = 1  // 改为 1 表示已读
    })
  }

  const addNotification = (notification: Omit<Notification, 'notificationId'>) => {
    const newNotification = {
      ...notification,
      notificationId: Date.now() // 简单的ID生成
    }
    notifications.value.unshift(newNotification)
  }

  const removeNotification = (id: number) => {
    notifications.value = notifications.value.filter(n => n.notificationId !== id)
  }

  return {
    // 状态
    notifications,
    loading,
    // 计算属性
    unreadCount,
    unreadNotifications,
    recentNotifications,
    // 动作
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    addNotification,
    removeNotification
  }
})