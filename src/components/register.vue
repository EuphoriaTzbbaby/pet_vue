<template>
  <div class="register-container">
    <!-- 背景遮罩 -->
    <div class="overlay"></div>

    <div class="register-card">
      <h2 class="title">用户注册</h2>

      <el-form
        ref="registerForm"
        :model="form"
        :rules="rules"
        label-position="top"
        class="register-form"
      >
        <!-- 用户名 -->
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            clearable
          />
        </el-form-item>

        <!-- 密码 -->
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            placeholder="请输入密码"
            clearable
          />
        </el-form-item>

        <!-- 邮箱 -->
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="form.email"
            placeholder="请输入邮箱"
            clearable
          />
        </el-form-item>

        <!-- 手机号 -->
        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="form.phone"
            placeholder="请输入手机号"
            clearable
          />
        </el-form-item>

        <!-- 角色选择 -->
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="领养人" value="adopter" />
            <el-option label="组织机构" value="organization" />
            <el-option label="客户" value="admin" />
          </el-select>
        </el-form-item>

        <!-- 注册按钮 -->
        <el-form-item>
          <el-button
            type="success"
            class="register-btn"
            @click="onRegister"
            block
          >
            注册
          </el-button>
        </el-form-item>

        <!-- 返回登录 -->
        <el-form-item>
          <el-button
            type="primary"
            class="login-btn"
            @click="() => router.push('/login')"
            block
          >
            返回登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useUserStore } from '../stores/user'
import router from '../router'
import dayjs from 'dayjs'

// 使用 Pinia store
const userStore = useUserStore()

const registerForm = ref()

const form = reactive({
  username: '',
  password: '',
  email: '',
  phone: '',
  role: 'adopter',
  avatarUrl: 'default-avatar.png',
  status: 'active',
  createdAt: '',
  updatedAt: ''
})

const rules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]{3,15}$/, message: '用户名必须为3-15位字母、数字或下划线', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/, message: '密码至少6位，需包含字母和数字', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { pattern: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/, message: '邮箱格式不正确', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
})

const onRegister = async () => {
  registerForm.value.validate(async (valid: boolean) => {
    if (!valid) return

    const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
    form.createdAt = now
    form.updatedAt = now

    try {
      const result = await userStore.register(form)
      if (result.success) {
        router.push('/login')
      }
    } catch (error) {
      console.error('注册失败:', error)
    }
  })
}
</script>

<style scoped>
.register-container {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: url("https://cwwdka.oss-cn-beijing.aliyuncs.com/e_learning/%E5%88%BB%E6%99%B4%20%E6%B6%82%E9%B8%A6%E5%A2%99%E8%83%8C%E6%99%AF%204K%E5%A3%81%E7%BA%B8%203840x2160_%E5%BD%BC%E5%B2%B8%E5%9B%BE%E7%BD%91.jpg")
    no-repeat center center / cover;
}

/* 遮罩层 */
.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
}

.register-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  padding: 2rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
}

.title {
  text-align: center;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #333;
}

.register-form {
  width: 100%;
}

.register-btn,
.login-btn {
  width: 100%;
}
</style>
