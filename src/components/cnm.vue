<template>
  <div class="home-page">
    <el-card class="welcome-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>欢迎使用宠物管理系统</span>
        </div>
      </template>
      <div class="welcome-content">
        <h2>🐾 宠物管理系统</h2>
        <p>管理您的宠物信息，浏览社区动态，购买宠物用品</p>
        <el-button type="primary" @click="goToOrganization">开始使用</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goToOrganization = () => {
  router.push('/organization')
}
</script>
<style scoped>
.home-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.welcome-card {
  max-width: 500px;
  width: 100%;
}

.card-header {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
}

.welcome-content {
  text-align: center;
  padding: 20px 0;
}

.welcome-content h2 {
  color: #409EFF;
  margin-bottom: 16px;
}

.welcome-content p {
  color: #666;
  margin-bottom: 24px;
  line-height: 1.6;
}
</style>
