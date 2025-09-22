<template>
  <div class="admin-layout">
    <!-- 顶部导航栏 -->
    <header class="top-header">
      <div class="header-container">
        <!-- Logo区域 -->
        <div class="logo-section">
          <router-link to="/admin" class="logo-link">
            <div class="logo">
              <span class="logo-icon">🛡️</span>
              <span class="logo-text">管理后台</span>
            </div>
          </router-link>
        </div>
        <!-- 全局操作区域 -->
        <div class="global-actions">
          <!-- 快捷搜索 -->
          <el-input
            v-model="searchKeyword"
            placeholder="搜索用户、宠物、订单..."
            class="search-input"
            clearable
            @keyup.enter="handleGlobalSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          
          <!-- 快捷操作按钮 -->
          <el-button-group class="quick-actions">
            <el-button type="primary" size="small" @click="handleQuickAdd">
              <el-icon><Plus /></el-icon>
              快速添加
            </el-button>
            <el-button type="success" size="small" @click="handleExport">
              <el-icon><Download /></el-icon>
              导出数据
            </el-button>
          </el-button-group>
        </div>
        <!-- 用户区域 -->
        <div class="user-section">
          <!-- 通知中心 -->
          <el-badge :value="notificationCount" :hidden="notificationCount === 0" class="notification-badge">
            <el-button circle size="small" class="notification-btn">
              <el-icon><Bell /></el-icon>
            </el-button>
          </el-badge>
          <!-- 用户下拉菜单 -->
          <el-dropdown trigger="click" @command="handleCommand">
            <div class="user-avatar">
              <img :src="currentUser?.avatarUrl || '/assets/avatar.png'" alt="管理员头像" class="avatar-img" />
              <span class="admin-badge">管理员</span>
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
                <el-dropdown-item command="logs">
                  <el-icon><Document /></el-icon>
                  操作日志
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

    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <el-button 
          circle 
          size="small" 
          @click="toggleSidebar"
          class="collapse-btn"
        >
          <el-icon><Fold v-if="!sidebarCollapsed" /><Expand v-else /></el-icon>
        </el-button>
      </div>
      <el-menu
        class="sidebar-menu"
        router
        :default-active="$route.path"
        :collapse="sidebarCollapsed"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/admin/dashboard">
          <el-icon><DataBoard /></el-icon>
          <span>数据看板</span>
        </el-menu-item>
        
        <el-sub-menu index="users">
          <template #title>
            <el-icon><UserFilled /></el-icon>
            <span>用户管理</span>
          </template>
          <el-menu-item index="/admin/users/list">用户列表</el-menu-item>
          <el-menu-item index="/admin/users/roles">角色权限</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="pets">
          <template #title>
            <el-icon><Shop /></el-icon>
            <span>宠物管理</span>
          </template>
          <el-menu-item index="/admin/pets/list">宠物列表</el-menu-item>
          <el-menu-item index="/admin/pets/categories">分类管理</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="adoption">
          <template #title>
            <el-icon><House /></el-icon>
            <span>领养管理</span>
          </template>
          <el-menu-item index="/admin/adoption/applications">申请审核</el-menu-item>
          <el-menu-item index="/admin/adoption/contracts">合同管理</el-menu-item>
          <el-menu-item index="/admin/adoption/statistics">统计报表</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="products">
          <template #title>
            <el-icon><Box /></el-icon>
            <span>商品管理</span>
          </template>
          <el-menu-item index="/admin/products/list">商品列表</el-menu-item>
          <el-menu-item index="/admin/products/orders">订单管理</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="community">
          <template #title>
            <el-icon><ChatDotRound /></el-icon>
            <span>社区管理</span>
          </template>
          <el-menu-item index="/admin/community/posts">帖子管理</el-menu-item>
          <el-menu-item index="/admin/community/comments">评论管理</el-menu-item>
          <el-menu-item index="/admin/community/reports">举报处理</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="system">
          <template #title>
            <el-icon><Tools /></el-icon>
            <span>系统设置</span>
          </template>
          <el-menu-item index="/admin/system/config">系统配置</el-menu-item>
          <el-menu-item index="/admin/system/logs">系统日志</el-menu-item>
          <el-menu-item index="/admin/system/backup">数据备份</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </aside>

    <!-- 主内容区域 -->
    <main class="main-content" :class="{ expanded: sidebarCollapsed }">
      <!-- 面包屑导航 -->
      <div class="breadcrumb-container">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/admin' }">管理后台</el-breadcrumb-item>
          <el-breadcrumb-item v-for="item in breadcrumbItems" :key="item.path" :to="item.path">
            {{ item.name }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      
      <!-- 页面内容 -->
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
        <p>© 2025 心宠家园管理后台 - 系统管理员专用</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  DataBoard,
  UserFilled,
  Shop,
  House,
  Box,
  ChatDotRound,
  Tools,
  Bell,
  User,
  Setting,
  Document,
  SwitchButton,
  ArrowDown,
  Fold,
  Expand,
  Search,
  Plus,
  Download
} from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 响应式数据
const sidebarCollapsed = ref(false)
const notificationCount = ref(3)
const searchKeyword = ref('') // 模拟通知数量

// 计算属性
const currentUser = computed(() => userStore.currentUser)

// 面包屑导航
const breadcrumbItems = computed(() => {
  const pathSegments = route.path.split('/').filter(Boolean)
  const items = []
  
  for (let i = 1; i < pathSegments.length; i++) {
    const path = '/' + pathSegments.slice(0, i + 1).join('/')
    const name = getBreadcrumbName(pathSegments[i])
    items.push({ path, name })
  }
  
  return items
})

// 方法
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

// const handleMenuSelect = (index: string) => {
//   console.log('选择菜单:', index)
// }

const handleGlobalSearch = () => {
  if (searchKeyword.value.trim()) {
    ElMessage.info(`搜索: ${searchKeyword.value}`)
    // 这里可以实现全局搜索逻辑
  }
}

const handleQuickAdd = () => {
  ElMessage.info('快速添加功能')
  // 这里可以打开快速添加对话框
}

const handleExport = () => {
  ElMessage.info('导出数据功能')
  // 这里可以实现数据导出逻辑
}

const handleCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/admin/profile')
      break
    case 'settings':
      router.push('/admin/settings')
      break
    case 'logs':
      router.push('/admin/system/logs')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        await userStore.logout()
        ElMessage.success('退出登录成功')
        router.push('/login')
      } catch {
        // 用户取消操作
      }
      break
  }
}

const getBreadcrumbName = (segment: string): string => {
  const nameMap: Record<string, string> = {
    'dashboard': '数据看板',
    'users': '用户管理',
    'pets': '宠物管理',
    'adoption': '领养管理',
    'products': '商品管理',
    'community': '社区管理',
    'system': '系统设置',
    'list': '列表',
    'roles': '角色权限',
    'categories': '分类管理',
    'applications': '申请审核',
    'contracts': '合同管理',
    'statistics': '统计报表',
    'orders': '订单管理',
    'posts': '帖子管理',
    'comments': '评论管理',
    'reports': '举报处理',
    'config': '系统配置',
    'logs': '系统日志',
    'backup': '数据备份'
  }
  return nameMap[segment] || segment
}

// 生命周期
onMounted(() => {
  // 检查管理员权限
  if (currentUser.value?.role !== 'admin') {
    ElMessage.error('您没有管理员权限')
    router.push('/login')
  }
})

// 监听路由变化
watch(() => route.path, () => {
  // 可以在这里添加路由变化的处理逻辑
})
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background: #f0f2f5;
  display: flex;
  flex-direction: column;
}

/* 顶部导航栏 */
.top-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 60px;
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.logo-section {
  min-width: 0;
  flex-shrink: 0;
}

.logo-link {
  text-decoration: none;
  display: block;
}

.logo-section .logo {
  display: flex;
  align-items: center;
  color: white;
  text-decoration: none;
  font-weight: bold;
  font-size: 18px;
  white-space: nowrap;
}

.logo-icon {
  font-size: 24px;
  margin-right: 8px;
  flex-shrink: 0;
}

.logo-text {
  flex-shrink: 0;
}

.global-actions {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  max-width: 600px;
}

.search-input {
  width: 300px;
}

.search-input :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: none;
}

.search-input :deep(.el-input__inner) {
  color: white;
}

.search-input :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.6);
}

.search-input :deep(.el-icon) {
  color: rgba(255, 255, 255, 0.6);
}

.quick-actions {
  flex-shrink: 0;
}

.quick-actions .el-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.quick-actions .el-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.user-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.notification-badge {
  cursor: pointer;
}

.notification-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
}

.user-avatar {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.3s ease;
}

.user-avatar:hover {
  background: rgba(255, 255, 255, 0.1);
}

.avatar-img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 8px;
}

.admin-badge {
  background: #f56c6c;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  margin-right: 8px;
}

.arrow-icon {
  color: white;
  font-size: 12px;
}

/* 侧边栏 */
.sidebar {
  position: fixed;
  left: 0;
  top: 60px;
  bottom: 0;
  width: 200px;
  background: #304156;
  transition: width 0.3s ease;
  z-index: 999;
  overflow-x: hidden;
}

.sidebar.collapsed {
  width: 64px;
}

.sidebar-header {
  padding: 16px;
  text-align: center;
  border-bottom: 1px solid #434a54;
}

.collapse-btn {
  background: #409EFF;
  border: none;
  color: white;
}

.sidebar-menu {
  border: none;
  height: calc(100vh - 120px);
  overflow-y: auto;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 200px;
}

/* 主内容区域 */
.main-content {
  margin-left: 200px;
  margin-top: 60px;
  transition: margin-left 0.3s ease;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.main-content.expanded {
  margin-left: 64px;
}

.breadcrumb-container {
  background: white;
  padding: 16px 24px;
  border-bottom: 1px solid #e6e6e6;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.content-container {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

/* 底部 */
.footer {
  background: white;
  border-top: 1px solid #e6e6e6;
  padding: 16px 0;
  text-align: center;
  color: #666;
  font-size: 14px;
  margin-left: 200px;
  transition: margin-left 0.3s ease;
}

.sidebar.collapsed ~ .main-content ~ .footer {
  margin-left: 64px;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-container {
    padding: 0 16px;
  }
  
  .logo-section {
    flex: 1;
  }
  
  .global-actions {
    display: none;
  }
  
  .user-section {
    flex-shrink: 0;
  }
  
  .sidebar {
    transform: translateX(-100%);
    z-index: 1001;
  }
  
  .sidebar.collapsed {
    transform: translateX(0);
    width: 100%;
  }
  
  .main-content {
    margin-left: 0;
  }
  
  .footer {
    margin-left: 0;
  }
}

/* 滚动条样式 */
.sidebar-menu::-webkit-scrollbar {
  width: 6px;
}

.sidebar-menu::-webkit-scrollbar-track {
  background: #2c3e50;
}

.sidebar-menu::-webkit-scrollbar-thumb {
  background: #409EFF;
  border-radius: 3px;
}

.sidebar-menu::-webkit-scrollbar-thumb:hover {
  background: #66b1ff;
}
</style>