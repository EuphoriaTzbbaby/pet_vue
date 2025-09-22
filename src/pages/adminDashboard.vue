<template>
  <div class="admin-dashboard">
    <!-- 页面标题 -->
    <div class="dashboard-header">
      <h1 class="dashboard-title">管理员仪表板</h1>
      <p class="dashboard-subtitle">欢迎回来，管理员！这里是系统概览和快捷操作中心。</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon users-icon">
          <UserGroupIcon class="icon" />
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ stats.totalUsers }}</h3>
          <p class="stat-label">总用户数</p>
          <span class="stat-change positive">+{{ stats.newUsersThisMonth }} 本月新增</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon pets-icon">
          <HeartIcon class="icon" />
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ stats.totalPets }}</h3>
          <p class="stat-label">宠物总数</p>
          <span class="stat-change positive">+{{ stats.newPetsThisMonth }} 本月新增</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon applications-icon">
          <DocumentTextIcon class="icon" />
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ stats.totalApplications }}</h3>
          <p class="stat-label">领养申请</p>
          <span class="stat-change pending">{{ stats.pendingApplications }} 待处理</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon success-icon">
          <CheckCircleIcon class="icon" />
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ stats.successfulAdoptions }}</h3>
          <p class="stat-label">成功领养</p>
          <span class="stat-change positive">{{ stats.adoptionRate }}% 成功率</span>
        </div>
      </div>
    </div>

    <!-- 快捷操作 -->
    <div class="quick-actions">
      <h2 class="section-title">快捷操作</h2>
      <div class="actions-grid">
        <router-link to="/admin/users/list" class="action-card">
          <UserGroupIcon class="action-icon" />
          <h3>用户管理</h3>
          <p>管理用户账户和权限</p>
        </router-link>

        <router-link to="/admin/pets/list" class="action-card">
          <HeartIcon class="action-icon" />
          <h3>宠物管理</h3>
          <p>添加、编辑宠物信息</p>
        </router-link>

        <router-link to="/admin/adoption/applications" class="action-card">
          <DocumentTextIcon class="action-icon" />
          <h3>申请审核</h3>
          <p>处理领养申请</p>
        </router-link>

        <router-link to="/admin/community/reports" class="action-card">
          <ExclamationTriangleIcon class="action-icon" />
          <h3>举报处理</h3>
          <p>处理用户举报内容</p>
        </router-link>

        <router-link to="/admin/system/config" class="action-card">
          <CogIcon class="action-icon" />
          <h3>系统设置</h3>
          <p>配置系统参数</p>
        </router-link>

        <router-link to="/admin/system/logs" class="action-card">
          <DocumentIcon class="action-icon" />
          <h3>系统日志</h3>
          <p>查看系统运行日志</p>
        </router-link>
      </div>
    </div>

    <!-- 最近活动 -->
    <div class="recent-activities">
      <h2 class="section-title">最近活动</h2>
      <div class="activity-list">
        <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
          <div class="activity-icon" :class="activity.type">
            <component :is="getActivityIcon(activity.type)" class="icon" />
          </div>
          <div class="activity-content">
            <p class="activity-text">{{ activity.description }}</p>
            <span class="activity-time">{{ formatTime(activity.timestamp) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import {
  UserGroupIcon,
  HeartIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CogIcon,
  DocumentIcon,
  ClockIcon,
  PlusIcon
} from '@heroicons/vue/24/outline'

// 统计数据
const stats = ref({
  totalUsers: 0,
  newUsersThisMonth: 0,
  totalPets: 0,
  newPetsThisMonth: 0,
  totalApplications: 0,
  pendingApplications: 0,
  successfulAdoptions: 0,
  adoptionRate: 0
})

// 最近活动
const recentActivities = ref([])

// 加载统计数据
const loadStats = async () => {
  try {
    // 这里应该调用实际的API获取统计数据
    // 暂时使用模拟数据
    stats.value = {
      totalUsers: 1248,
      newUsersThisMonth: 89,
      totalPets: 456,
      newPetsThisMonth: 23,
      totalApplications: 234,
      pendingApplications: 12,
      successfulAdoptions: 189,
      adoptionRate: 81
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 加载最近活动
const loadRecentActivities = async () => {
  try {
    // 这里应该调用实际的API获取最近活动
    // 暂时使用模拟数据
    recentActivities.value = [
      {
        id: 1,
        type: 'user',
        description: '新用户 张三 注册了账户',
        timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30分钟前
      },
      {
        id: 2,
        type: 'pet',
        description: '新宠物 "小白" 被添加到系统',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2小时前
      },
      {
        id: 3,
        type: 'application',
        description: '李四提交了领养申请',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4) // 4小时前
      },
      {
        id: 4,
        type: 'success',
        description: '王五成功领养了宠物 "小黑"',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6) // 6小时前
      },
      {
        id: 5,
        type: 'report',
        description: '收到新的用户举报',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8) // 8小时前
      }
    ]
  } catch (error) {
    console.error('加载最近活动失败:', error)
  }
}

// 获取活动图标
const getActivityIcon = (type) => {
  const iconMap = {
    user: UserGroupIcon,
    pet: HeartIcon,
    application: DocumentTextIcon,
    success: CheckCircleIcon,
    report: ExclamationTriangleIcon
  }
  return iconMap[type] || ClockIcon
}

// 格式化时间
const formatTime = (timestamp) => {
  const now = new Date()
  const diff = now - timestamp
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else {
    return `${days}天前`
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadStats()
  loadRecentActivities()
})
</script>

<style scoped>
.admin-dashboard {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 32px;
}

.dashboard-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.dashboard-subtitle {
  font-size: 1.1rem;
  color: #6b7280;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon .icon {
  width: 24px;
  height: 24px;
  color: white;
}

.users-icon {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.pets-icon {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.applications-icon {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.success-icon {
  background: linear-gradient(135deg, #10b981, #059669);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 8px 0;
}

.stat-change {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 12px;
}

.stat-change.positive {
  background: #dcfce7;
  color: #166534;
}

.stat-change.pending {
  background: #fef3c7;
  color: #92400e;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 24px;
}

.quick-actions {
  margin-bottom: 48px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.action-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
  text-align: center;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  text-decoration: none;
}

.action-icon {
  width: 32px;
  height: 32px;
  color: #3b82f6;
  margin: 0 auto 12px;
}

.action-card h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.action-card p {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.recent-activities {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-icon .icon {
  width: 16px;
  height: 16px;
  color: white;
}

.activity-icon.user {
  background: #3b82f6;
}

.activity-icon.pet {
  background: #ef4444;
}

.activity-icon.application {
  background: #f59e0b;
}

.activity-icon.success {
  background: #10b981;
}

.activity-icon.report {
  background: #ef4444;
}

.activity-content {
  flex: 1;
}

.activity-text {
  font-size: 0.875rem;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.activity-time {
  font-size: 0.75rem;
  color: #9ca3af;
}

@media (max-width: 768px) {
  .admin-dashboard {
    padding: 16px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  
  .dashboard-title {
    font-size: 1.5rem;
  }
}
</style>