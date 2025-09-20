<template>
  <div class="profile-page">
    <el-card class="profile-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>个人信息</span>
        </div>
      </template>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" label-position="left">
        <el-form-item label="头像">
          <AvatarUploader 
            v-model:avatarUrl="form.avatarUrl"
            :user-info="form"
            @user-updated="handleUserUpdated"
          />
        </el-form-item>

        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" disabled />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" />
        </el-form-item>

        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>

        <el-form-item label="角色" prop="role">
          <el-tag>{{ form.role || '用户' }}</el-tag>
        </el-form-item>

        <el-form-item label="账号状态">
          <el-tag :type="form.status === 'active' ? 'success' : 'danger'">
            {{ form.status === 'active' ? '激活' : '停用' }}
          </el-tag>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="userStore.loading" @click="submit">保存修改</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { useUserStore } from '../stores/user'
import type { Users } from '../api/usersApi'
import AvatarUploader from './AvatarUploader.vue'

// 使用 Pinia store
const userStore = useUserStore()

// 初始化认证状态
userStore.initializeAuth()

if (!userStore.currentUser || !userStore.currentUser.userId) {
  ElMessage.error('用户未登录或信息缺失')
  throw new Error('未找到用户信息')
}

const form = reactive<Users>({
  username: userStore.currentUser.username,
  password: userStore.currentUser.password || '',
  email: userStore.currentUser.email || '',
  phone: userStore.currentUser.phone || '',
  role: userStore.currentUser.role || 'user',
  avatarUrl: userStore.currentUser.avatarUrl || '',
  status: userStore.currentUser.status || 'active',
  createdAt: userStore.currentUser.createdAt || '',
  updatedAt: userStore.currentUser.updatedAt || '',
  userId: userStore.currentUser.userId
})

const rules = {
  email: [{ type: 'email', message: '请输入有效邮箱', trigger: 'blur' }],
  phone: [{ required: false }],
}

const formRef = ref<FormInstance>()

// 处理用户信息更新
const handleUserUpdated = (updatedUser: Users) => {
  Object.assign(form, updatedUser)
  // 更新 store 中的用户信息
  userStore.currentUser = { ...userStore.currentUser, ...updatedUser }
}

const submit = async () => {
  try {
    await formRef.value?.validate()
    const result = await userStore.updateProfile(form)
    if (result.success) {
      // 更新本地表单数据
      Object.assign(form, userStore.currentUser)
    }
  } catch (error) {
    console.error('保存失败:', error)
  }
}

onMounted(() => {
  console.log('当前用户:', userStore.currentUser)
})
</script>

<style scoped>
</style>
