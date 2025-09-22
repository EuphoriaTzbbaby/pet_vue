<template>
  <div class="login-container">
    <!-- 遮罩层，让背景更柔和 -->
    <div class="overlay"></div>

    <div class="login-card">
      <h2 class="title">用户登录</h2>

      <el-form
        ref="loginForm"
        :model="form"
        :rules="rules"
        label-position="top"
        class="login-form"
      >
        <!-- 邮箱 -->
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="form.email"
            placeholder="请输入邮箱"
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

        <!-- 记住我 -->
        <div class="remember-row">
          <el-checkbox v-model="rememberMe">记住我</el-checkbox>
        </div>

        <!-- 登录按钮 -->
        <el-form-item>
          <el-button
            type="primary"
            class="login-btn"
            @click="onLogin"
            block
          >
            登录
          </el-button>
        </el-form-item>

        <!-- 注册按钮 -->
        <el-form-item>
          <el-button
            type="success"
            class="register-btn"
            @click="goRegister"
            block
          >
            注册
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useUserStore } from '../stores/user'
import router from '../router'

// 使用 Pinia store
const userStore = useUserStore()
const loginForm = ref<FormInstance>()
const rememberMe = ref(false)

const form = reactive({
  email: '',
  password: ''
})

// 邮箱验证规则
const validateEmail = (_rule: any, value: string, callback: any) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!value) {
    callback(new Error('请输入邮箱地址'))
  } else if (!emailRegex.test(value)) {
    callback(new Error('请输入有效的邮箱地址'))
  } else {
    callback()
  }
}
// 密码验证规则
const validatePassword = (_rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入密码'))
  } else if (value.length < 6) {
    callback(new Error('密码长度不能少于6位'))
  } else {
    callback()
  }
}

const rules: FormRules = {
  email: [
    { validator: validateEmail, trigger: 'blur' }
  ],
  password: [
    { validator: validatePassword, trigger: 'blur' }
  ]
}

const onLogin = async () => {
  if (!loginForm.value) return
  
  await loginForm.value.validate(async (valid) => {
    if (valid) {
      try {
        const result = await userStore.login({
          email: form.email,
          password: form.password
        })
        
        if (result.success) {
          // 处理记住我功能
          if (rememberMe.value) {
            userStore.setRememberedEmail(form.email)
          } else {
            userStore.clearRememberedEmail()
          }
          
          // 根据用户角色跳转
          const userData = result.user
          if (userData.role === 'organization') {
            router.push('/organization/community')
          } else if (userData.role === 'adopter') {
            router.push('/adopter/pets')
          } else {
            router.push('/admin/dashboard')
          }
        } else {
          ElMessage.error(result.error || '登录失败，请检查账号密码')
        }
      } catch (error) {
        console.error('登录失败:', error)
        ElMessage.error('登录出错，请稍后重试')
      }
    }
  })
}

// 注册跳转
const goRegister = () => {
  router.push('/register')
}

// 页面加载时检查是否有记住的邮箱
onMounted(() => {
  const rememberedEmail = userStore.getRememberedEmail()
  if (rememberedEmail) {
    form.email = rememberedEmail
    rememberMe.value = true
  }
})
</script>

<style scoped>
.login-container {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: url("https://cwwdka.oss-cn-beijing.aliyuncs.com/e_learning/%E5%88%BB%E6%99%B4%20%E6%B6%82%E9%B8%A6%E5%A2%99%E8%83%8C%E6%99%AF%204K%E5%A3%81%E7%BA%B8%203840x2160_%E5%BD%BC%E5%B2%B8%E5%9B%BE%E7%BD%91.jpg")
    no-repeat center center / cover;
}

/* 遮罩层，保证表单可见性 */
.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
}
.login-card {
  margin-top: 250px;
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.6); /* 透明度调低一点 */
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(15px); /* 增加磨砂玻璃效果 */
  border: 1px solid rgba(255, 255, 255, 0.4); /* 添加边框，让卡片更立体 */
}

.title {
  text-align: center;
  font-size: 1.6rem;
  margin-bottom: 1.5rem;
  font-weight: bold;
  color: #222; /* 深色字体，保证对比度 */
}

.login-form :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.7); /* 输入框半透明 */
  border-radius: 8px;
}

.login-form :deep(.el-button) {
  font-weight: bold;
  letter-spacing: 1px;
}


.remember-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.login-btn,
.register-btn {
  width: 100%;
}
</style>
