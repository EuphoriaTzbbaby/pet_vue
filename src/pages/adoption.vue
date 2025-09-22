<template>
  <div class="adoption-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <el-icon class="title-icon"><House /></el-icon>
            领养管理中心
          </h1>
          <p class="page-subtitle">管理宠物领养申请、合同签署和流程跟踪</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="refreshData" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
        </div>
      </div>
    </div>

    <!-- 数据统计卡片 -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card pending">
          <div class="stat-icon">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.pendingApplications }}</div>
            <div class="stat-label">待审核申请</div>
          </div>
          <div class="stat-trend up">
            <el-icon><TrendCharts /></el-icon>
            <span>+12%</span>
          </div>
        </div>

        <div class="stat-card approved">
          <div class="stat-icon">
            <el-icon><Check /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.approvedApplications }}</div>
            <div class="stat-label">已通过申请</div>
          </div>
          <div class="stat-trend up">
            <el-icon><TrendCharts /></el-icon>
            <span>+8%</span>
          </div>
        </div>

        <div class="stat-card contracts">
          <div class="stat-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.signedContracts }}</div>
            <div class="stat-label">已签署合同</div>
          </div>
          <div class="stat-trend up">
            <el-icon><TrendCharts /></el-icon>
            <span>+15%</span>
          </div>
        </div>

        <div class="stat-card success">
          <div class="stat-icon">
            <el-icon><SuccessFilled /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.completedAdoptions }}</div>
            <div class="stat-label">成功领养</div>
          </div>
          <div class="stat-trend up">
            <el-icon><TrendCharts /></el-icon>
            <span>+20%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷操作区域 -->
    <div class="quick-actions">
      <div class="section-title">
        <h2>快捷操作</h2>
        <p>常用功能快速入口</p>
      </div>
      <div class="actions-grid">
        <div class="action-card" @click="navigateTo('/organization/adoption/applications')">
          <div class="action-icon">
            <el-icon><List /></el-icon>
          </div>
          <div class="action-content">
            <h3>申请管理</h3>
            <p>查看和处理领养申请</p>
          </div>
          <div class="action-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>

        <div class="action-card" @click="navigateTo('/organization/adoption/contracts')">
          <div class="action-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="action-content">
            <h3>合同管理</h3>
            <p>管理领养合同和签署</p>
          </div>
          <div class="action-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>

        <div class="action-card" @click="navigateTo('/organization/adoption/analytics')">
          <div class="action-icon">
            <el-icon><DataAnalysis /></el-icon>
          </div>
          <div class="action-content">
            <h3>数据分析</h3>
            <p>查看领养数据统计</p>
          </div>
          <div class="action-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>

        <div class="action-card" @click="navigateTo('/organization/adoption/settings')">
          <div class="action-icon">
            <el-icon><Setting /></el-icon>
          </div>
          <div class="action-content">
            <h3>系统设置</h3>
            <p>配置领养流程参数</p>
          </div>
          <div class="action-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近活动 -->
    <div class="recent-activities">
      <div class="section-title">
        <h2>最近活动</h2>
        <p>最新的领养申请和合同动态</p>
      </div>
      <div class="activities-list">
        <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
          <div class="activity-icon" :class="activity.type">
            <el-icon v-if="activity.type === 'application'"><User /></el-icon>
            <el-icon v-else-if="activity.type === 'contract'"><Document /></el-icon>
            <el-icon v-else><Check /></el-icon>
          </div>
          <div class="activity-content">
            <div class="activity-title">{{ activity.title }}</div>
            <div class="activity-description">{{ activity.description }}</div>
            <div class="activity-time">{{ formatTime(activity.time) }}</div>
          </div>
          <div class="activity-status" :class="activity.status">
            {{ getStatusText(activity.status) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  House,
  Refresh,
  Clock,
  Check,
  Document,
  SuccessFilled,
  TrendCharts,
  List,
  ArrowRight,
  DataAnalysis,
  Setting,
  User
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as adoptionApplicationsApi from '../api/adoptionApplicationsApi'
import * as adoptionContractsApi from '../api/adoptionContractsApi'

const router = useRouter()
const loading = ref(false)

// 统计数据
const stats = ref({
  pendingApplications: 0,
  approvedApplications: 0,
  signedContracts: 0,
  completedAdoptions: 0
})

// 活动数据类型
interface Activity {
  id: string
  type: 'application' | 'contract' | 'approval'
  title: string
  description: string
  time: Date
  status: string
}

// 最近活动
const recentActivities = ref<Activity[]>([])

// 导航到指定页面
const navigateTo = (path: string) => {
  router.push(path)
}

// 格式化时间
const formatTime = (time: Date) => {
  const now = new Date()
  const diff = now.getTime() - time.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  return `${days}天前`
}

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待处理',
    approved: '已通过',
    completed: '已完成',
    rejected: '已拒绝'
  }
  return statusMap[status] || status
}

// 刷新最近活动
const refreshRecentActivities = async () => {
  try {
    const [applications, contracts] = await Promise.all([
      adoptionApplicationsApi.getAllApplications(),
      adoptionContractsApi.getAllContracts()
    ])
    
    const appsData = applications.data || applications || []
    const contractsData = contracts.data || contracts || []
    
    // 重新生成最近活动数据
    recentActivities.value = generateRecentActivities(appsData, contractsData)
  } catch (error) {
    console.error('刷新最近活动失败:', error)
  }
}

// 刷新数据
const refreshData = async () => {
  loading.value = true
  try {
    await initData()
    await refreshRecentActivities()
    ElMessage.success('数据刷新成功')
  } catch (error) {
    console.error('刷新数据失败:', error)
    ElMessage.error('数据刷新失败')
  } finally {
    loading.value = false
  }
}

// 生成最近活动数据
const generateRecentActivities = (applications: any[], contracts: any[]) => {
  const activities: Activity[] = []
  
  // 从申请数据生成活动
  applications.forEach((app, index) => {
    if (app.createdAt) {
      activities.push({
        id: `app-${app.applicationId || index}`,
        type: 'application',
        title: '新的领养申请',
        description: `用户申请领养宠物`,
        time: new Date(app.createdAt),
        status: app.status || 'pending'
      })
    }
    
    if (app.status === 'approved' && app.updatedAt) {
      activities.push({
        id: `approval-${app.applicationId || index}`,
        type: 'approval',
        title: '申请已通过',
        description: `领养申请已通过审核`,
        time: new Date(app.updatedAt),
        status: 'approved'
      })
    }
  })
  
  // 从合同数据生成活动
  contracts.forEach((contract, index) => {
    if (contract.signedAt) {
      activities.push({
        id: `contract-${contract.contractId || index}`,
        type: 'contract',
        title: '合同已签署',
        description: `领养合同已完成签署`,
        time: new Date(contract.signedAt),
        status: 'completed'
      })
    }
  })
  
  // 按时间排序，取最近的10条
  return activities
    .sort((a, b) => b.time.getTime() - a.time.getTime())
    .slice(0, 10)
}

// 初始化数据
const initData = async () => {
  try {
    const [applications, contracts] = await Promise.all([
      adoptionApplicationsApi.getAllApplications(),
      adoptionContractsApi.getAllContracts()
    ])
    
    const appsData = applications.data || applications || []
    const contractsData = contracts.data || contracts || []
    
    stats.value.pendingApplications = appsData.filter(app => app.status === 'pending').length
    stats.value.approvedApplications = appsData.filter(app => app.status === 'approved').length
    stats.value.signedContracts = contractsData.length
    stats.value.completedAdoptions = contractsData.length
    
    // 生成最近活动数据
    recentActivities.value = generateRecentActivities(appsData, contractsData)
  } catch (error) {
    console.error('初始化数据失败:', error)
  }
}

// 组件挂载时加载数据
onMounted(() => {
  initData()
})
</script>

<style scoped>
.adoption-management {
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

/* 页面头部 */
.page-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section {
  flex: 1;
}

.page-title {
  display: flex;
  align-items: center;
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.title-icon {
  margin-right: 12px;
  color: #667eea;
}

.page-subtitle {
  font-size: 16px;
  color: #7f8c8d;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 统计卡片 */
.stats-section {
  margin-bottom: 32px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.stat-card.pending::before {
  background: linear-gradient(90deg, #f39c12, #e67e22);
}

.stat-card.approved::before {
  background: linear-gradient(90deg, #27ae60, #2ecc71);
}

.stat-card.contracts::before {
  background: linear-gradient(90deg, #3498db, #2980b9);
}

.stat-card.success::before {
  background: linear-gradient(90deg, #e74c3c, #c0392b);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
}

.pending .stat-icon {
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: white;
}

.approved .stat-icon {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
}

.contracts .stat-icon {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
}

.success .stat-icon {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #7f8c8d;
  font-weight: 500;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #27ae60;
}

/* 快捷操作 */
.quick-actions {
  margin-bottom: 32px;
}

.section-title {
  margin-bottom: 20px;
}

.section-title h2 {
  font-size: 24px;
  font-weight: 600;
  color: white;
  margin: 0 0 4px 0;
}

.section-title p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.action-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  margin-right: 16px;
}

.action-content {
  flex: 1;
}

.action-content h3 {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 4px 0;
}

.action-content p {
  font-size: 14px;
  color: #7f8c8d;
  margin: 0;
}

.action-arrow {
  color: #bdc3c7;
  font-size: 16px;
}

/* 最近活动 */
.recent-activities {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.activity-item:hover {
  background: #e9ecef;
  transform: translateX(4px);
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 16px;
  color: white;
}

.activity-icon.application {
  background: linear-gradient(135deg, #3498db, #2980b9);
}

.activity-icon.contract {
  background: linear-gradient(135deg, #f39c12, #e67e22);
}

.activity-icon.approval {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.activity-description {
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 4px;
}

.activity-time {
  font-size: 12px;
  color: #95a5a6;
}

.activity-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.activity-status.pending {
  background: #fff3cd;
  color: #856404;
}

.activity-status.approved {
  background: #d1ecf1;
  color: #0c5460;
}

.activity-status.completed {
  background: #d4edda;
  color: #155724;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .adoption-management {
    padding: 16px;
  }
  
  .page-header {
    padding: 20px;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>