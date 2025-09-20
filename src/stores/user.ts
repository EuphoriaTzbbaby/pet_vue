import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {User } from './types'
import { loginWithEmail as loginApi, getUserById, updateUser, createUser } from '../api/usersApi'
import type { Users } from '../api/usersApi'  // 导入 API 类型
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', () => {
  // 状态
  const currentUser = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  token.value = "success"
  const loading = ref(false)

  // 计算属性
  const isAuthenticated = computed(() => !!token.value && !!currentUser.value)
  const userRole = computed(() => currentUser.value?.role || 'user')
  const userName = computed(() => currentUser.value?.username || '未登录')
  const userAvatar = computed(() => currentUser.value?.avatarUrl || '/assets/default-avatar.png')

  // 动作
  const login = async (credentials: { email: string; password: string }) => {
    loading.value = true
    try {
      const response = await loginApi(credentials)
      
      // 根据实际 API 响应结构调整
      if (response.data.code === 200) {
        const userData = response.data.data
        
        // 保存用户信息和 token
        currentUser.value = userData
        token.value = userData.token || 'mock-token' // 如果 API 返回 token
        
        localStorage.setItem('user', JSON.stringify(userData))
        if (userData.token) {
          localStorage.setItem('token', userData.token)
        }
        
        ElMessage.success(response.data.msg || '登录成功')
        return { success: true, user: userData }
      } else {
        ElMessage.error(response.data.msg || '登录失败')
        return { success: false, error: response.data.msg }
      }
    } catch (error: any) {
      ElMessage.error(error.response?.data?.msg || '登录失败，请重试')
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    currentUser.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    ElMessage.success('已退出登录')
  }

  const updateProfile = async (userData: Partial<Users>) => {  // 使用 API 类型
    if (!currentUser.value) return { success: false }
    
    loading.value = true
    try {
      const response = await updateUser({ ...currentUser.value, ...userData } as Users)
      currentUser.value = response.data
      localStorage.setItem('user', JSON.stringify(currentUser.value))
      
      ElMessage.success('个人信息更新成功')
      return { success: true }
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '更新失败')
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const fetchUserProfile = async (userId: number) => {
    loading.value = true
    try {
      const response = await getUserById(userId)
      currentUser.value = response.data
      localStorage.setItem('user', JSON.stringify(currentUser.value))
      return { success: true }
    } catch (error: any) {
      ElMessage.error('获取用户信息失败')
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const initializeAuth = () => {
    const savedUser = localStorage.getItem('user')
    if (savedUser && token.value) {
      try {
        currentUser.value = JSON.parse(savedUser)
      } catch (error) {
        console.error('解析用户信息失败:', error)
        logout()
      }
    }
  }

  // 添加记住我功能
  const setRememberedEmail = (email: string) => {
    localStorage.setItem('remembered_email', email)
  }

  const getRememberedEmail = (): string | null => {
    return localStorage.getItem('remembered_email')
  }

  const clearRememberedEmail = () => {
    localStorage.removeItem('remembered_email')
  }

  const register = async (userData: Users) => {
    loading.value = true
    try {
      const response = await createUser(userData)
      if (response.data === 'success') {
        ElMessage.success('注册成功，请登录')
        return { success: true }
      } else {
        ElMessage.error(response.data.msg || '注册失败')
        return { success: false, error: response.data.msg }
      }
    } catch (error: any) {
      ElMessage.error('注册失败，请重试')
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  return {
    // 状态
    currentUser,
    token,
    loading,
    // 计算属性
    isAuthenticated,
    userRole,
    userName,
    userAvatar,
    // 动作
    login,
    logout,
    updateProfile,
    fetchUserProfile,
    initializeAuth,
    setRememberedEmail,
    getRememberedEmail,
    clearRememberedEmail,
    register
  }
})