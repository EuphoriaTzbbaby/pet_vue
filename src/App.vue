<template>
      <!-- 全局宠物组件 -->
    <GlobalChat />
    
    <!-- 主内容区域 -->
    <router-view />
</template>

<script setup lang="ts">
import GlobalChat  from './components/cwwChat.vue'
import { onMounted } from 'vue'
import { useUserStore } from './stores/user'

// 初始化用户认证状态
const userStore = useUserStore()

onMounted(() => {
  // 应用启动时初始化认证状态
  userStore.initializeAuth()
})
</script>

<style>
html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}

* {
  box-sizing: border-box;
}
</style>
