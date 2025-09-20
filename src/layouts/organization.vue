	<template>
	  <div class="organization-layout">
	    <!-- 顶部导航栏 -->
	    <header class="top-header">
	      <div class="header-container">
	        <!-- Logo区域 -->
	        <div class="logo-section">
	          <router-link to="/organization" class="logo-link">
	            <div class="logo">
	              <span class="logo-icon">🐾</span>
	              <span class="logo-text">cwwdka</span>
	            </div>
	          </router-link>
	        </div>
	        <!-- 导航菜单 -->
	        <nav class="main-nav">
	          <el-menu
	            class="nav-menu"
	            router
	            :default-active="$route.path"
	            background-color="transparent"
	            text-color="#ffffff"
	            active-text-color="#409EFF"
	            mode="horizontal"
	            @select="handleMenuSelect"
	          >
	            <el-menu-item index="/organization/pets" class="nav-item">
	              <el-icon><Shop /></el-icon>
	              <span class="nav-text">宠物管理</span>
	            </el-menu-item>
	            <el-menu-item index="/organization/products" class="nav-item">
	              <el-icon><Box /></el-icon>
	              <span class="nav-text">用品管理</span>
	            </el-menu-item>
	            <el-menu-item index="/organization/adoption" class="nav-item">
	              <el-icon><House /></el-icon>
	              <span class="nav-text">领养管理</span>
	            </el-menu-item>
	            <el-menu-item index="/organization/community" class="nav-item">
	              <el-icon><ChatDotRound /></el-icon>
	              <span class="nav-text">社区</span>
	            </el-menu-item>
	          </el-menu>
	        </nav>
	        <!-- 用户区域 -->
	        <div class="user-section">
	          <el-dropdown trigger="click" @command="handleCommand">
	            <div class="user-avatar">
	              <img :src="currentUser?.avatarUrl || '/assets/avatar.png'"  alt="用户头像" class="avatar-img" />
	              <el-icon class="arrow-icon"><ArrowDown /></el-icon>
	            </div>
	            <template #dropdown>
	              <el-dropdown-menu>
	                <el-dropdown-item command="profile">
	                  <el-icon><User /></el-icon>
	                  个人中心
	                </el-dropdown-item>
	                <el-dropdown-item command="settings">
	                  <el-icon><Setting /></el-icon>
	                  账号设置
	                </el-dropdown-item>
	                <el-dropdown-item divided command="logout">
	                  <el-icon><SwitchButton /></el-icon>
	                  退出登录
	                </el-dropdown-item>
	              </el-dropdown-menu>
	            </template>
	          </el-dropdown>
	        </div>
	      </div>
	    </header>
	    <!-- 主内容区域 -->
	    <main class="main-content">
	      <div class="content-container">
	        <router-view v-slot="{ Component }">
	          <transition name="fade" mode="out-in">
	            <component :is="Component" />
	          </transition>
	        </router-view>
	      </div>
	    </main>
	    <!-- 底部信息 -->
	    <footer class="footer">
	      <div class="footer-content">
	        <p>© 2025 心宠家园宠物领养系统 - 让每个宠物都有温暖的家</p>
	      </div>
	    </footer>
	  </div>
	</template>
	<script setup lang="ts">
	import { ref, onMounted } from 'vue'
	import { useRouter, useRoute } from 'vue-router'
	import {
	  Shop,
	  Box,
	  House,
	  ChatDotRound,
	  User,
	  Setting,
	  SwitchButton,
	  ArrowDown
	} from '@element-plus/icons-vue'
	import type { Users } from '../api/usersApi'
	// 获取屏幕宽度
	// 从 localStorage 获取当前用户信息
	const storedUser = localStorage.getItem('user')
	const currentUser: Users | null = storedUser ? JSON.parse(storedUser) : null
	const router = useRouter()
	const route = useRoute()
	// 当前选中的菜单项
	const activeMenu = ref(route.path)
	// 处理菜单选择
	const handleMenuSelect = (index: string) => {
	  activeMenu.value = index
	  router.push(index)
	}
	// 处理下拉菜单命令
	const handleCommand = (command: string) => {
	  switch (command) {
	    case 'profile':
	      router.push('/organization/profile')
	      break
	    case 'settings':
	      router.push('/organization/settings')
	      break
	    case 'logout':
	      // 执行退出登录逻辑
	      localStorage.removeItem('token')
	      router.push('/login')
	      break
	  }
	}
	// 页面加载时设置当前活动菜单
	onMounted(() => {
	  activeMenu.value = route.path
	  console.log("当前屏幕宽度:", screen.width)
	  console.log(currentUser);
	})
	</script>
	<style scoped>
	.organization-layout {
	  display: flex;
	  flex-direction: column;
	  min-height: 100vh;
	  background-color: #f5f7fa;
	}
	/* 顶部导航栏 */
	.top-header {
	  position: sticky;
	  top: 0;
	  z-index: 1000;
	  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
	  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}
	.header-container {
	  max-width: 1400px;
	  margin: 0 auto;
	  padding: 0 20px;
	  display: flex;
	  align-items: center;
	  justify-content: space-between;
	  height: 70px;
	}
	/* Logo区域 */
	.logo-section {
	  flex-shrink: 0;
	}
	.logo-link {
	  text-decoration: none;
	  display: flex;
	  align-items: center;
	}
	.logo {
	  display: flex;
	  align-items: center;
	  gap: 10px;
	  color: #ffffff;
	  font-size: 24px;
	  font-weight: 700;
	  letter-spacing: 1px;
	}
	.logo-icon {
	  font-size: 28px;
	}
	.logo-text {
	  background: linear-gradient(to right, #ffffff, #a3c2ff);
	  -webkit-background-clip: text;
	  background-clip: text;
	  color: transparent;
	}
	/* 导航菜单 */
	.main-nav {
	  flex-grow: 1;
	  margin: 0 40px;
	}
	.nav-menu {
	  border: none;
	  background: transparent;
	}
	.nav-item {
	  height: 70px;
	  display: flex;
	  align-items: center;
	  gap: 8px;
	  padding: 0 15px;
	  font-size: 16px;
	  font-weight: 500;
	  border-radius: 6px;
	  transition: all 0.3s ease;
	}
	.nav-item:hover {
	  background-color: rgba(255, 255, 255, 0.1);
	}
	.nav-item.is-active {
	  background-color: rgba(255, 255, 255, 0.2);
	  border-bottom: 3px solid #409EFF;
	}
	.nav-text {
	  color: #ffffff;
	}
	/* 用户区域 */
	.user-section {
	  flex-shrink: 0;
	}
	.user-avatar {
	  display: flex;
	  align-items: center;
	  gap: 8px;
	  padding: 8px 12px;
	  border-radius: 50px;
	  cursor: pointer;
	  transition: all 0.3s ease;
	}
	.user-avatar:hover {
	  background-color: rgba(255, 255, 255, 0.1);
	}
	.avatar-img {
	  width: 36px;
	  height: 36px;
	  border-radius: 50%;
	  border: 2px solid rgba(255, 255, 255, 0.8);
	  object-fit: cover;
	}
	.arrow-icon {
	  color: #ffffff;
	  font-size: 14px;
	}
	/* 主内容区域 */
	.main-content {
	  flex: 1;
	  padding: 30px;
	  background-color: #f5f7fa;
	}
	.content-container {
	  max-width: 1400px;
	  margin: 0 auto;
	  background-color: #ffffff;
	  border-radius: 12px;
	  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
	  padding: 30px;
	  min-height: calc(100vh - 200px);
	}
	/* 页面切换动画 */
	.fade-enter-active,
	.fade-leave-active {
	  transition: opacity 0.3s ease;
	}
	.fade-enter-from,
	.fade-leave-to {
	  opacity: 0;
	}
	/* 底部信息 */
	.footer {
	  background-color: #2c3e50;
	  color: #ecf0f1;
	  padding: 20px 0;
	  margin-top: auto;
	}
	.footer-content {
	  max-width: 1400px;
	  margin: 0 auto;
	  text-align: center;
	  padding: 0 20px;
	}
	/* 响应式设计 */
	@media (max-width: 768px) {
	  .header-container {
	    flex-wrap: wrap;
	    height: auto;
	    padding: 10px;
	  }
	  .logo {
	    font-size: 20px;
	    margin-bottom: 10px;
	  }
	  .main-nav {
	    width: 100%;
	    margin: 10px 0;
	    order: 3;
	  }
	  .nav-menu {
	    flex-wrap: wrap;
	    justify-content: center;
	  }
	  .nav-item {
	    padding: 10px;
	  }
	  .user-section {
	    order: 2;
	    width: 100%;
	    display: flex;
	    justify-content: center;
	    margin-bottom: 10px;
	  }
	  .main-content {
	    padding: 20px 15px;
	  }
	  .content-container {
	    padding: 20px;
	  }
	}
	/* Element Plus 样式覆盖 */
	:deep(.el-menu) {
	  border: none;
	  background: transparent;
	}
	:deep(.el-menu-item) {
	  color: rgba(255, 255, 255, 0.8);
	  border-bottom: none;
	}
	:deep(.el-menu-item:hover) {
	  background-color: rgba(255, 255, 255, 0.1);
	}
	:deep(.el-menu-item.is-active) {
	  color: #409EFF;
	  background-color: rgba(255, 255, 255, 0.2);
	}
	:deep(.el-dropdown-menu__item) {
	  padding: 10px 20px;
	  font-size: 14px;
	}
	:deep(.el-dropdown-menu__item i) {
	  margin-right: 8px;
	}
	</style>