<template>
  <div class="adoption-applications">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="fas fa-clipboard-list"></i>
          领养申请管理
        </h1>
        <p class="page-description">管理和审核宠物领养申请</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="refreshApplications">
          <i class="fas fa-sync-alt"></i>
          刷新
        </button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card pending">
        <div class="stat-icon">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.pending }}</h3>
          <p>待审核申请</p>
        </div>
      </div>
      <div class="stat-card approved">
        <div class="stat-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.approved }}</h3>
          <p>已通过申请</p>
        </div>
      </div>
      <div class="stat-card rejected">
        <div class="stat-icon">
          <i class="fas fa-times-circle"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.rejected }}</h3>
          <p>已拒绝申请</p>
        </div>
      </div>
      <div class="stat-card total">
        <div class="stat-icon">
          <i class="fas fa-list"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.total }}</h3>
          <p>总申请数</p>
        </div>
      </div>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filter-section">
      <div class="filter-row">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="搜索申请人姓名、电话或宠物名称..."
            @input="handleSearch"
          >
        </div>
        <div class="filter-controls">
          <select v-model="statusFilter" @change="handleFilter">
            <option value="">全部状态</option>
            <option value="pending">待审核</option>
            <option value="approved">已通过</option>
            <option value="rejected">已拒绝</option>
          </select>
          <select v-model="dateFilter" @change="handleFilter">
            <option value="">全部时间</option>
            <option value="today">今天</option>
            <option value="week">本周</option>
            <option value="month">本月</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 申请列表 -->
    <div class="applications-list">
      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>加载中...</p>
      </div>
      
      <div v-else-if="filteredApplications.length === 0" class="empty-state">
        <i class="fas fa-inbox"></i>
        <h3>暂无申请记录</h3>
        <p>当前没有符合条件的领养申请</p>
      </div>

      <div v-else class="application-cards">
        <div 
          v-for="application in filteredApplications" 
          :key="application.id"
          class="application-card"
          :class="`status-${application.status}`"
        >
          <div class="card-header">
            <div class="applicant-info">
              <div class="avatar">
                <i class="fas fa-user"></i>
              </div>
              <div class="info">
                <h4>{{ application.applicantName }}</h4>
                <p>{{ application.phone }}</p>
              </div>
            </div>
            <div class="status-badge" :class="`status-${application.status}`">
              {{ getStatusText(application.status) }}
            </div>
          </div>

          <div class="card-content">
            <div class="pet-info">
              <h5>
                <i class="fas fa-paw"></i>
                申请领养：{{ application.petName }}
              </h5>
              <p class="pet-details">{{ application.petBreed }} · {{ application.petAge }}岁</p>
            </div>

            <div class="application-details">
              <div class="detail-item">
                <span class="label">申请时间：</span>
                <span class="value">{{ formatDate(application.createdAt) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">居住环境：</span>
                <span class="value">{{ application.livingEnvironment }}</span>
              </div>
              <div class="detail-item">
                <span class="label">养宠经验：</span>
                <span class="value">{{ application.experience }}</span>
              </div>
              <div v-if="application.reason" class="detail-item full-width">
                <span class="label">申请理由：</span>
                <span class="value">{{ application.reason }}</span>
              </div>
            </div>
          </div>

          <div class="card-actions">
            <button 
              class="btn btn-outline"
              @click="viewApplication(application)"
            >
              <i class="fas fa-eye"></i>
              查看详情
            </button>
            
            <div v-if="application.status === 'pending'" class="action-buttons">
              <button 
                class="btn btn-success"
                @click="approveApplication(application.id)"
              >
                <i class="fas fa-check"></i>
                通过
              </button>
              <button 
                class="btn btn-danger"
                @click="rejectApplication(application.id)"
              >
                <i class="fas fa-times"></i>
                拒绝
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="totalPages > 1" class="pagination">
      <button 
        class="btn btn-outline"
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
      >
        <i class="fas fa-chevron-left"></i>
        上一页
      </button>
      
      <div class="page-numbers">
        <button 
          v-for="page in visiblePages" 
          :key="page"
          class="btn"
          :class="{ 'btn-primary': page === currentPage, 'btn-outline': page !== currentPage }"
          @click="changePage(page)"
        >
          {{ page }}
        </button>
      </div>
      
      <button 
        class="btn btn-outline"
        :disabled="currentPage === totalPages"
        @click="changePage(currentPage + 1)"
      >
        下一页
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>

    <!-- 申请详情模态框 -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>申请详情</h3>
          <button class="close-btn" @click="closeDetailModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div v-if="selectedApplication" class="modal-body">
          <!-- 详细信息展示 -->
          <div class="detail-sections">
            <div class="section">
              <h4>申请人信息</h4>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">姓名：</span>
                  <span class="value">{{ selectedApplication.applicantName }}</span>
                </div>
                <div class="info-item">
                  <span class="label">电话：</span>
                  <span class="value">{{ selectedApplication.phone }}</span>
                </div>
                <div class="info-item">
                  <span class="label">邮箱：</span>
                  <span class="value">{{ selectedApplication.email }}</span>
                </div>
                <div class="info-item">
                  <span class="label">年龄：</span>
                  <span class="value">{{ selectedApplication.age }}岁</span>
                </div>
              </div>
            </div>
            
            <div class="section">
              <h4>宠物信息</h4>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">宠物名称：</span>
                  <span class="value">{{ selectedApplication.petName }}</span>
                </div>
                <div class="info-item">
                  <span class="label">品种：</span>
                  <span class="value">{{ selectedApplication.petBreed }}</span>
                </div>
                <div class="info-item">
                  <span class="label">年龄：</span>
                  <span class="value">{{ selectedApplication.petAge }}岁</span>
                </div>
              </div>
            </div>
            
            <div class="section">
              <h4>申请详情</h4>
              <div class="info-grid">
                <div class="info-item full">
                  <span class="label">居住环境：</span>
                  <span class="value">{{ selectedApplication.livingEnvironment }}</span>
                </div>
                <div class="info-item full">
                  <span class="label">养宠经验：</span>
                  <span class="value">{{ selectedApplication.experience }}</span>
                </div>
                <div class="info-item full">
                  <span class="label">申请理由：</span>
                  <span class="value">{{ selectedApplication.reason }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="closeDetailModal">
            关闭
          </button>
          <div v-if="selectedApplication?.status === 'pending'" class="action-buttons">
            <button 
              class="btn btn-success"
              @click="approveApplication(selectedApplication.id)"
            >
              <i class="fas fa-check"></i>
              通过申请
            </button>
            <button 
              class="btn btn-danger"
              @click="rejectApplication(selectedApplication.id)"
            >
              <i class="fas fa-times"></i>
              拒绝申请
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import * as adoptionApplicationsApi from '../api/adoptionApplicationsApi'
import { getUserById } from '../api/usersApi'
import { getPetById } from '../api/petsApi'

// 响应式数据
const loading = ref(false)
const applications = ref([])
const searchQuery = ref('')
const statusFilter = ref('')
const dateFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const showDetailModal = ref(false)
const selectedApplication = ref(null)

// 统计数据
const stats = computed(() => {
  const pending = applications.value.filter(app => app.status === 'pending').length
  const approved = applications.value.filter(app => app.status === 'approved').length
  const rejected = applications.value.filter(app => app.status === 'rejected').length
  const total = applications.value.length
  
  return { pending, approved, rejected, total }
})

// 筛选后的申请列表
const filteredApplications = computed(() => {
  let filtered = applications.value
  
  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(app => 
      app.applicantName.toLowerCase().includes(query) ||
      app.phone.includes(query) ||
      app.petName.toLowerCase().includes(query)
    )
  }
  
  // 状态筛选
  if (statusFilter.value) {
    filtered = filtered.filter(app => app.status === statusFilter.value)
  }
  
  // 时间筛选
  if (dateFilter.value) {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    filtered = filtered.filter(app => {
      const appDate = new Date(app.createdAt)
      
      switch (dateFilter.value) {
        case 'today':
          return appDate >= today
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          return appDate >= weekAgo
        case 'month':
          const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
          return appDate >= monthAgo
        default:
          return true
      }
    })
  }
  
  // 分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filtered.slice(start, end)
})

// 总页数
const totalPages = computed(() => {
  const total = applications.value.length
  return Math.ceil(total / pageSize.value)
})

// 可见页码
const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// 方法
const loadApplications = async () => {
  try {
    loading.value = true
    const apiApplications = await adoptionApplicationsApi.getAllApplications()
    
    // 转换API数据格式以匹配页面显示需求
    const processedApplications = []
    
    for (const app of apiApplications) {
      try {
        // 并行获取用户和宠物信息
        const [userResponse, petResponse] = await Promise.all([
          getUserById(app.userId),
          getPetById(app.petId)
        ])
        
        const user = userResponse.data
        const pet = petResponse.data
        
        processedApplications.push({
           id: app.applicationId,
           userId: app.userId, // 保存原始userId用于API调用
           applicantName: user.username || `用户${app.userId}`,
           phone: user.phone || '未提供',
           email: user.email || '未提供',
           age: 25, // API中暂无年龄字段，使用默认值
           petId: app.petId,
           petName: pet.name || '未知宠物',
           petBreed: pet.species || '未知品种',
           petAge: pet.age || 0,
           livingEnvironment: app.livingCondition,
           experience: '待完善', // API中暂无此字段
           reason: app.reason,
           status: app.status || 'pending',
           createdAt: app.createdAt || new Date().toISOString(),
           updatedAt: app.updatedAt || new Date().toISOString()
         })
      } catch (error) {
        console.error(`获取申请${app.applicationId}的详细信息失败:`, error)
        // 如果获取详细信息失败，使用基本信息
        processedApplications.push({
           id: app.applicationId,
           userId: app.userId, // 保存原始userId用于API调用
           applicantName: `用户${app.userId}`,
           phone: '获取失败',
           email: '获取失败',
           age: 0,
           petId: app.petId,
           petName: '获取失败',
           petBreed: '获取失败',
           petAge: 0,
           livingEnvironment: app.livingCondition,
           experience: '待完善',
           reason: app.reason,
           status: app.status || 'pending',
           createdAt: app.createdAt || new Date().toISOString(),
           updatedAt: app.updatedAt || new Date().toISOString()
         })
      }
    }
    
    applications.value = processedApplications
  } catch (error) {
    console.error('加载申请列表失败:', error)
    // 这里可以添加错误提示
  } finally {
    loading.value = false
  }
}

const refreshApplications = () => {
  loadApplications()
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleFilter = () => {
  currentPage.value = 1
}

const changePage = (page) => {
  currentPage.value = page
}

const viewApplication = (application) => {
  selectedApplication.value = application
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedApplication.value = null
}

const approveApplication = async (id) => {
  try {
    // 找到对应的申请
    const application = applications.value.find(app => app.id === id)
    if (!application) {
      console.error('未找到对应的申请')
      return
    }
    
    // 更新申请状态
     await adoptionApplicationsApi.updateApplication({
       applicationId: id,
       petId: application.petId,
       userId: application.userId,
       reason: application.reason,
       livingCondition: application.livingEnvironment,
       status: 'approved'
     })
    
    await loadApplications()
    if (showDetailModal.value) {
      closeDetailModal()
    }
    // 这里可以添加成功提示
  } catch (error) {
    console.error('审核通过失败:', error)
    // 这里可以添加错误提示
  }
}

const rejectApplication = async (id) => {
  try {
    // 找到对应的申请
    const application = applications.value.find(app => app.id === id)
    if (!application) {
      console.error('未找到对应的申请')
      return
    }
    
    // 更新申请状态
     await adoptionApplicationsApi.updateApplication({
       applicationId: id,
       petId: application.petId,
       userId: application.userId,
       reason: application.reason,
       livingCondition: application.livingEnvironment,
       status: 'rejected'
     })
    
    await loadApplications()
    if (showDetailModal.value) {
      closeDetailModal()
    }
    // 这里可以添加成功提示
  } catch (error) {
    console.error('审核拒绝失败:', error)
    // 这里可以添加错误提示
  }
}

const getStatusText = (status) => {
  const statusMap = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return statusMap[status] || status
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  loadApplications()
})
</script>

<style scoped>
.adoption-applications {
  padding: 24px;
  background: #f8fafc;
  min-height: 100vh;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content .page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-content .page-title i {
  color: #3b82f6;
}

.page-description {
  color: #64748b;
  margin: 0;
  font-size: 16px;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-card.pending .stat-icon {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.stat-card.approved .stat-icon {
  background: linear-gradient(135deg, #10b981, #059669);
}

.stat-card.rejected .stat-icon {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.stat-card.total .stat-icon {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.stat-content h3 {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: #1a202c;
}

.stat-content p {
  color: #64748b;
  margin: 0;
  font-size: 14px;
}

/* 筛选区域 */
.filter-section {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.filter-row {
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 300px;
  position: relative;
}

.search-box i {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
}

.search-box input {
  width: 100%;
  padding: 12px 16px 12px 48px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.search-box input:focus {
  outline: none;
  border-color: #3b82f6;
}

.filter-controls {
  display: flex;
  gap: 12px;
}

.filter-controls select {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.filter-controls select:focus {
  outline: none;
  border-color: #3b82f6;
}

/* 申请列表 */
.applications-list {
  margin-bottom: 32px;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.loading-state i {
  font-size: 32px;
  color: #3b82f6;
  margin-bottom: 16px;
}

.empty-state i {
  font-size: 48px;
  color: #94a3b8;
  margin-bottom: 16px;
}

.empty-state h3 {
  color: #1a202c;
  margin: 0 0 8px 0;
}

.empty-state p {
  color: #64748b;
  margin: 0;
}

.application-cards {
  display: grid;
  gap: 20px;
}

.application-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border-left: 4px solid #e2e8f0;
}

.application-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.application-card.status-pending {
  border-left-color: #f59e0b;
}

.application-card.status-approved {
  border-left-color: #10b981;
}

.application-card.status-rejected {
  border-left-color: #ef4444;
}

.card-header {
  padding: 20px 24px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
}

.applicant-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
}

.applicant-info .info h4 {
  margin: 0 0 4px 0;
  color: #1a202c;
  font-weight: 600;
}

.applicant-info .info p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.status-pending {
  background: #fef3c7;
  color: #d97706;
}

.status-badge.status-approved {
  background: #d1fae5;
  color: #059669;
}

.status-badge.status-rejected {
  background: #fee2e2;
  color: #dc2626;
}

.card-content {
  padding: 16px 24px;
}

.pet-info {
  margin-bottom: 16px;
}

.pet-info h5 {
  margin: 0 0 4px 0;
  color: #1a202c;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.pet-info h5 i {
  color: #3b82f6;
}

.pet-details {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

.application-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item .label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-item .value {
  color: #1a202c;
  font-size: 14px;
}

.card-actions {
  padding: 16px 24px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f1f5f9;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

/* 按钮样式 */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #059669;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #dc2626;
}

.btn-outline {
  background: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.btn-outline:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.page-numbers {
  display: flex;
  gap: 4px;
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 24px 24px 16px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #1a202c;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #64748b;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.close-btn:hover {
  background: #f1f5f9;
}

.modal-body {
  padding: 24px;
}

.detail-sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section h4 {
  margin: 0 0 16px 0;
  color: #1a202c;
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 2px solid #f1f5f9;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.info-item.full {
  grid-column: 1 / -1;
}

.modal-footer {
  padding: 16px 24px 24px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .adoption-applications {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    min-width: auto;
  }
  
  .filter-controls {
    flex-direction: column;
  }
  
  .card-actions {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .action-buttons {
    justify-content: center;
  }
  
  .pagination {
    flex-wrap: wrap;
  }
  
  .modal-content {
    margin: 10px;
    max-height: calc(100vh - 20px);
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>