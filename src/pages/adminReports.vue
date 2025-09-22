<template>
  <div class="admin-reports">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">举报管理</h1>
        <p class="page-subtitle">处理用户举报的内容和行为</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="exportReports">
          <DocumentArrowDownIcon class="btn-icon" />
          导出数据
        </button>
        <button class="btn btn-primary" @click="refreshReports">
          <ArrowPathIcon class="btn-icon" />
          刷新
        </button>
      </div>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filters-section">
      <div class="filters-row">
        <div class="filter-group">
          <label>举报状态</label>
          <select v-model="filters.status">
            <option value="">全部状态</option>
            <option value="pending">待处理</option>
            <option value="investigating">调查中</option>
            <option value="resolved">已解决</option>
            <option value="dismissed">已驳回</option>
          </select>
        </div>
        <div class="filter-group">
          <label>举报类型</label>
          <select v-model="filters.type">
            <option value="">全部类型</option>
            <option value="spam">垃圾信息</option>
            <option value="harassment">骚扰行为</option>
            <option value="inappropriate">不当内容</option>
            <option value="fraud">欺诈行为</option>
            <option value="violence">暴力内容</option>
            <option value="other">其他</option>
          </select>
        </div>
        <div class="filter-group">
          <label>内容类型</label>
          <select v-model="filters.contentType">
            <option value="">全部内容</option>
            <option value="post">帖子</option>
            <option value="comment">评论</option>
            <option value="user">用户</option>
            <option value="pet">宠物信息</option>
          </select>
        </div>
        <div class="filter-group">
          <label>优先级</label>
          <select v-model="filters.priority">
            <option value="">全部优先级</option>
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
        </div>
        <div class="search-group">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="搜索举报内容、举报人..."
            class="search-input"
          />
          <MagnifyingGlassIcon class="search-icon" />
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-row">
      <div class="stat-item">
        <div class="stat-value">{{ reportStats.total }}</div>
        <div class="stat-label">总举报数</div>
      </div>
      <div class="stat-item pending">
        <div class="stat-value">{{ reportStats.pending }}</div>
        <div class="stat-label">待处理</div>
      </div>
      <div class="stat-item investigating">
        <div class="stat-value">{{ reportStats.investigating }}</div>
        <div class="stat-label">调查中</div>
      </div>
      <div class="stat-item high-priority">
        <div class="stat-value">{{ reportStats.highPriority }}</div>
        <div class="stat-label">高优先级</div>
      </div>
    </div>

    <!-- 举报列表 -->
    <div class="reports-container">
      <div class="reports-header">
        <h3 class="reports-title">举报列表</h3>
        <div class="reports-actions">
          <button class="btn btn-sm" @click="batchProcess" :disabled="selectedReports.length === 0">
            <Cog6ToothIcon class="btn-icon" />
            批量处理 ({{ selectedReports.length }})
          </button>
        </div>
      </div>
      
      <div class="reports-list">
        <div class="list-header">
          <label class="checkbox-container">
            <input 
              type="checkbox" 
              :checked="selectedReports.length === filteredReports.length && filteredReports.length > 0"
              @change="toggleSelectAll"
            />
            <span class="checkmark"></span>
          </label>
          <span class="header-text">全选</span>
        </div>
        
        <div v-for="report in paginatedReports" :key="report.id" class="report-item">
          <div class="report-header">
            <label class="checkbox-container">
              <input 
                type="checkbox" 
                :value="report.id"
                v-model="selectedReports"
              />
              <span class="checkmark"></span>
            </label>
            
            <div class="report-meta">
              <div class="report-id">#{{ report.id }}</div>
              <div class="report-badges">
                <div class="status-badge" :class="report.status">
                  <component :is="getStatusIcon(report.status)" class="status-icon" />
                  {{ getStatusText(report.status) }}
                </div>
                <div class="priority-badge" :class="report.priority">
                  {{ getPriorityText(report.priority) }}
                </div>
                <div class="type-badge" :class="report.type">
                  {{ getTypeText(report.type) }}
                </div>
              </div>
            </div>
            
            <div class="report-time">
              <ClockIcon class="time-icon" />
              {{ formatDateTime(report.createdAt) }}
            </div>
          </div>
          
          <div class="report-content">
            <div class="reporter-info">
              <div class="reporter-avatar">
                <img :src="report.reporter.avatar" :alt="report.reporter.name" class="avatar" />
              </div>
              <div class="reporter-details">
                <div class="reporter-name">{{ report.reporter.name }}</div>
                <div class="reporter-email">{{ report.reporter.email }}</div>
              </div>
            </div>
            
            <div class="report-details">
              <div class="report-reason">
                <h4>举报原因</h4>
                <p>{{ report.reason }}</p>
              </div>
              
              <div class="reported-content">
                <h4>被举报内容</h4>
                <div class="content-preview" :class="report.contentType">
                  <div class="content-type-label">
                    <component :is="getContentTypeIcon(report.contentType)" class="content-icon" />
                    {{ getContentTypeText(report.contentType) }}
                  </div>
                  
                  <div v-if="report.contentType === 'post'" class="post-preview">
                    <div class="post-title">{{ report.reportedContent.title }}</div>
                    <div class="post-excerpt">{{ report.reportedContent.excerpt }}</div>
                    <div class="post-author">作者: {{ report.reportedContent.author.name }}</div>
                  </div>
                  
                  <div v-else-if="report.contentType === 'comment'" class="comment-preview">
                    <div class="comment-text">{{ report.reportedContent.content }}</div>
                    <div class="comment-author">评论者: {{ report.reportedContent.author.name }}</div>
                  </div>
                  
                  <div v-else-if="report.contentType === 'user'" class="user-preview">
                    <div class="user-info">
                      <img :src="report.reportedContent.avatar" :alt="report.reportedContent.name" class="user-avatar" />
                      <div class="user-details">
                        <div class="user-name">{{ report.reportedContent.name }}</div>
                        <div class="user-email">{{ report.reportedContent.email }}</div>
                        <div class="user-stats">注册时间: {{ formatDate(report.reportedContent.joinDate) }}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div v-else-if="report.contentType === 'pet'" class="pet-preview">
                    <div class="pet-info">
                      <img :src="report.reportedContent.image" :alt="report.reportedContent.name" class="pet-image" />
                      <div class="pet-details">
                        <div class="pet-name">{{ report.reportedContent.name }}</div>
                        <div class="pet-breed">{{ report.reportedContent.breed }}</div>
                        <div class="pet-owner">发布者: {{ report.reportedContent.owner.name }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-if="report.evidence && report.evidence.length > 0" class="report-evidence">
                <h4>举报证据</h4>
                <div class="evidence-list">
                  <div v-for="evidence in report.evidence" :key="evidence.id" class="evidence-item">
                    <img :src="evidence.url" :alt="evidence.description" class="evidence-image" @click="previewEvidence(evidence)" />
                    <div class="evidence-description">{{ evidence.description }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="report-actions">
            <button 
              v-if="report.status === 'pending'" 
              class="action-btn investigate" 
              @click="startInvestigation(report)"
              title="开始调查"
            >
              <MagnifyingGlassIcon class="action-icon" />
              调查
            </button>
            <button 
              v-if="report.status === 'investigating'" 
              class="action-btn resolve" 
              @click="resolveReport(report)"
              title="标记为已解决"
            >
              <CheckIcon class="action-icon" />
              解决
            </button>
            <button 
              v-if="report.status === 'investigating'" 
              class="action-btn dismiss" 
              @click="dismissReport(report)"
              title="驳回举报"
            >
              <XMarkIcon class="action-icon" />
              驳回
            </button>
            <button 
              class="action-btn view" 
              @click="viewReportDetail(report)"
              title="查看详情"
            >
              <EyeIcon class="action-icon" />
              详情
            </button>
            <button 
              class="action-btn priority" 
              @click="changePriority(report)"
              title="调整优先级"
            >
              <ExclamationTriangleIcon class="action-icon" />
              优先级
            </button>
          </div>
        </div>
      </div>
      
      <!-- 分页 -->
      <div class="pagination">
        <button 
          class="pagination-btn" 
          :disabled="currentPage === 1" 
          @click="currentPage--"
        >
          上一页
        </button>
        <div class="pagination-info">
          第 {{ currentPage }} 页，共 {{ totalPages }} 页
        </div>
        <button 
          class="pagination-btn" 
          :disabled="currentPage === totalPages" 
          @click="currentPage++"
        >
          下一页
        </button>
      </div>
    </div>

    <!-- 举报详情模态框 -->
    <div v-if="selectedReport" class="modal-overlay" @click="closeReportModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>举报详情 #{{ selectedReport.id }}</h3>
          <button class="close-btn" @click="closeReportModal">
            <XMarkIcon class="close-icon" />
          </button>
        </div>
        <div class="modal-body">
          <div class="report-detail">
            <div class="detail-section">
              <h4>举报信息</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>举报ID</label>
                  <span>#{{ selectedReport.id }}</span>
                </div>
                <div class="detail-item">
                  <label>状态</label>
                  <div class="status-badge" :class="selectedReport.status">
                    {{ getStatusText(selectedReport.status) }}
                  </div>
                </div>
                <div class="detail-item">
                  <label>优先级</label>
                  <div class="priority-badge" :class="selectedReport.priority">
                    {{ getPriorityText(selectedReport.priority) }}
                  </div>
                </div>
                <div class="detail-item">
                  <label>举报时间</label>
                  <span>{{ formatDateTime(selectedReport.createdAt) }}</span>
                </div>
              </div>
            </div>
            
            <div class="detail-section">
              <h4>举报人信息</h4>
              <div class="reporter-detail">
                <img :src="selectedReport.reporter.avatar" :alt="selectedReport.reporter.name" class="reporter-avatar-large" />
                <div class="reporter-info-detail">
                  <div class="reporter-name-large">{{ selectedReport.reporter.name }}</div>
                  <div class="reporter-email-large">{{ selectedReport.reporter.email }}</div>
                  <div class="reporter-stats">
                    <span>举报次数: {{ selectedReport.reporter.reportCount }}</span>
                    <span>信誉度: {{ selectedReport.reporter.reputation }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="detail-section">
              <h4>处理记录</h4>
              <div class="processing-history">
                <div v-for="record in selectedReport.processingHistory" :key="record.id" class="history-item">
                  <div class="history-time">{{ formatDateTime(record.createdAt) }}</div>
                  <div class="history-action">{{ record.action }}</div>
                  <div class="history-operator">操作人: {{ record.operator.name }}</div>
                  <div v-if="record.note" class="history-note">备注: {{ record.note }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeReportModal">关闭</button>
          <button v-if="selectedReport.status === 'pending'" class="btn btn-primary" @click="startInvestigation(selectedReport)">
            开始调查
          </button>
          <button v-if="selectedReport.status === 'investigating'" class="btn btn-success" @click="resolveReport(selectedReport)">
            标记解决
          </button>
          <button v-if="selectedReport.status === 'investigating'" class="btn btn-warning" @click="dismissReport(selectedReport)">
            驳回举报
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  HeartIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  EyeSlashIcon
} from '@heroicons/vue/24/outline'

// 响应式数据
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = 10
const selectedReport = ref(null)
const selectedReports = ref([])

const filters = ref({
  status: '',
  type: '',
  contentType: '',
  priority: ''
})

const reportStats = ref({
  total: 1247,
  pending: 89,
  investigating: 34,
  highPriority: 12
})

const reports = ref([
  {
    id: 1001,
    type: 'inappropriate',
    contentType: 'post',
    status: 'pending',
    priority: 'high',
    reason: '该帖子包含不当内容，涉及虐待动物的描述，不符合社区规范。',
    reporter: {
      id: 1,
      name: '关心动物的用户',
      email: 'caring@example.com',
      avatar: 'https://via.placeholder.com/40x40',
      reportCount: 3,
      reputation: 85
    },
    reportedContent: {
      id: 101,
      title: '我家的宠物训练方法',
      excerpt: '分享一些训练宠物的经验...',
      author: {
        id: 2,
        name: '宠物爱好者'
      }
    },
    evidence: [
      {
        id: 1,
        url: 'https://via.placeholder.com/200x150',
        description: '不当内容截图'
      }
    ],
    processingHistory: [
      {
        id: 1,
        action: '举报提交',
        operator: { name: '系统' },
        note: '用户举报提交',
        createdAt: new Date('2024-12-01 09:30:00')
      }
    ],
    createdAt: new Date('2024-12-01 09:30:00')
  },
  {
    id: 1002,
    type: 'spam',
    contentType: 'comment',
    status: 'investigating',
    priority: 'medium',
    reason: '该评论是垃圾信息，重复发布相同内容，疑似广告。',
    reporter: {
      id: 3,
      name: '热心网友',
      email: 'helpful@example.com',
      avatar: 'https://via.placeholder.com/40x40',
      reportCount: 7,
      reputation: 92
    },
    reportedContent: {
      id: 201,
      content: '快来看看我们的宠物用品店，超低价格，质量保证！联系微信：xxx',
      author: {
        id: 4,
        name: '商家用户'
      }
    },
    evidence: [],
    processingHistory: [
      {
        id: 1,
        action: '举报提交',
        operator: { name: '系统' },
        note: '用户举报提交',
        createdAt: new Date('2024-11-30 14:20:00')
      },
      {
        id: 2,
        action: '开始调查',
        operator: { name: '管理员A' },
        note: '已分配给内容审核团队',
        createdAt: new Date('2024-11-30 15:00:00')
      }
    ],
    createdAt: new Date('2024-11-30 14:20:00')
  },
  {
    id: 1003,
    type: 'harassment',
    contentType: 'user',
    status: 'resolved',
    priority: 'high',
    reason: '该用户在多个帖子下恶意骚扰其他用户，使用不当言语。',
    reporter: {
      id: 5,
      name: '受害用户',
      email: 'victim@example.com',
      avatar: 'https://via.placeholder.com/40x40',
      reportCount: 1,
      reputation: 78
    },
    reportedContent: {
      id: 301,
      name: '问题用户',
      email: 'problem@example.com',
      avatar: 'https://via.placeholder.com/40x40',
      joinDate: new Date('2024-10-15')
    },
    evidence: [
      {
        id: 2,
        url: 'https://via.placeholder.com/200x150',
        description: '骚扰言论截图1'
      },
      {
        id: 3,
        url: 'https://via.placeholder.com/200x150',
        description: '骚扰言论截图2'
      }
    ],
    processingHistory: [
      {
        id: 1,
        action: '举报提交',
        operator: { name: '系统' },
        note: '用户举报提交',
        createdAt: new Date('2024-11-29 10:15:00')
      },
      {
        id: 2,
        action: '开始调查',
        operator: { name: '管理员B' },
        note: '高优先级处理',
        createdAt: new Date('2024-11-29 10:30:00')
      },
      {
        id: 3,
        action: '处理完成',
        operator: { name: '管理员B' },
        note: '已对用户进行警告并限制发言',
        createdAt: new Date('2024-11-29 16:45:00')
      }
    ],
    createdAt: new Date('2024-11-29 10:15:00')
  }
])

// 计算属性
const filteredReports = computed(() => {
  let result = reports.value
  
  // 状态筛选
  if (filters.value.status) {
    result = result.filter(report => report.status === filters.value.status)
  }
  
  // 类型筛选
  if (filters.value.type) {
    result = result.filter(report => report.type === filters.value.type)
  }
  
  // 内容类型筛选
  if (filters.value.contentType) {
    result = result.filter(report => report.contentType === filters.value.contentType)
  }
  
  // 优先级筛选
  if (filters.value.priority) {
    result = result.filter(report => report.priority === filters.value.priority)
  }
  
  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(report => 
      report.reason.toLowerCase().includes(query) ||
      report.reporter.name.toLowerCase().includes(query)
    )
  }
  
  return result
})

const paginatedReports = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredReports.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredReports.value.length / pageSize)
})

// 方法
const getStatusIcon = (status) => {
  const iconMap = {
    pending: ClockIcon,
    investigating: MagnifyingGlassIcon,
    resolved: CheckIcon,
    dismissed: XMarkIcon
  }
  return iconMap[status] || ClockIcon
}

const getStatusText = (status) => {
  const textMap = {
    pending: '待处理',
    investigating: '调查中',
    resolved: '已解决',
    dismissed: '已驳回'
  }
  return textMap[status] || '未知状态'
}

const getPriorityText = (priority) => {
  const textMap = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return textMap[priority] || '未知'
}

const getTypeText = (type) => {
  const textMap = {
    spam: '垃圾信息',
    harassment: '骚扰行为',
    inappropriate: '不当内容',
    fraud: '欺诈行为',
    violence: '暴力内容',
    other: '其他'
  }
  return textMap[type] || '未知类型'
}

const getContentTypeIcon = (contentType) => {
  const iconMap = {
    post: DocumentTextIcon,
    comment: ChatBubbleLeftIcon,
    user: UserIcon,
    pet: HeartIcon
  }
  return iconMap[contentType] || DocumentTextIcon
}

const getContentTypeText = (contentType) => {
  const textMap = {
    post: '帖子',
    comment: '评论',
    user: '用户',
    pet: '宠物信息'
  }
  return textMap[contentType] || '未知内容'
}

const formatDateTime = (date) => {
  return date.toLocaleString('zh-CN')
}

const formatDate = (date) => {
  return date.toLocaleDateString('zh-CN')
}

const toggleSelectAll = (event) => {
  if (event.target.checked) {
    selectedReports.value = filteredReports.value.map(report => report.id)
  } else {
    selectedReports.value = []
  }
}

const startInvestigation = (report) => {
  console.log('开始调查举报:', report.id)
  report.status = 'investigating'
  report.processingHistory.push({
    id: Date.now(),
    action: '开始调查',
    operator: { name: '当前管理员' },
    note: '已开始调查此举报',
    createdAt: new Date()
  })
}

const resolveReport = (report) => {
  console.log('解决举报:', report.id)
  report.status = 'resolved'
  report.processingHistory.push({
    id: Date.now(),
    action: '处理完成',
    operator: { name: '当前管理员' },
    note: '举报已处理完成',
    createdAt: new Date()
  })
}

const dismissReport = (report) => {
  console.log('驳回举报:', report.id)
  report.status = 'dismissed'
  report.processingHistory.push({
    id: Date.now(),
    action: '驳回举报',
    operator: { name: '当前管理员' },
    note: '经调查，举报不成立',
    createdAt: new Date()
  })
}

const changePriority = (report) => {
  const priorities = ['low', 'medium', 'high']
  const currentIndex = priorities.indexOf(report.priority)
  const nextIndex = (currentIndex + 1) % priorities.length
  report.priority = priorities[nextIndex]
  console.log('调整优先级:', report.id, report.priority)
}

const batchProcess = () => {
  if (selectedReports.value.length === 0) return
  
  const action = prompt('请选择批量操作：\n1. 开始调查\n2. 标记解决\n3. 驳回举报')
  if (!action) return
  
  selectedReports.value.forEach(reportId => {
    const report = reports.value.find(r => r.id === reportId)
    if (report) {
      switch (action) {
        case '1':
          startInvestigation(report)
          break
        case '2':
          resolveReport(report)
          break
        case '3':
          dismissReport(report)
          break
      }
    }
  })
  selectedReports.value = []
}

const viewReportDetail = (report) => {
  selectedReport.value = report
}

const closeReportModal = () => {
  selectedReport.value = null
}

const previewEvidence = (evidence) => {
  console.log('预览证据:', evidence.url)
  // 这里可以实现证据预览功能
}

const refreshReports = () => {
  console.log('刷新举报列表')
  // 这里应该重新加载举报数据
}

const exportReports = () => {
  console.log('导出举报数据')
  alert('导出功能开发中...')
}

const loadReports = async () => {
  try {
    // 这里应该调用实际的API
    console.log('加载举报列表')
  } catch (error) {
    console.error('加载举报列表失败:', error)
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadReports()
})
</script>

<style scoped>
.admin-reports {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #6b7280;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover {
  background: #059669;
}

.btn-warning {
  background: #f59e0b;
  color: white;
}

.btn-warning:hover {
  background: #d97706;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.75rem;
}

.btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.filters-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.filters-row {
  display: flex;
  gap: 20px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 150px;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.filter-group select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
}

.search-group {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 40px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #6b7280;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-item {
  background: white;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.stat-item.pending {
  border-left: 4px solid #f59e0b;
}

.stat-item.investigating {
  border-left: 4px solid #3b82f6;
}

.stat-item.high-priority {
  border-left: 4px solid #dc2626;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.reports-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.reports-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.reports-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.list-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.checkbox-container {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

.checkbox-container input {
  opacity: 0;
  position: absolute;
  cursor: pointer;
}

.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 18px;
  width: 18px;
  background-color: white;
  border: 2px solid #d1d5db;
  border-radius: 3px;
  transition: all 0.2s;
}

.checkbox-container:hover input ~ .checkmark {
  border-color: #3b82f6;
}

.checkbox-container input:checked ~ .checkmark {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox-container input:checked ~ .checkmark:after {
  display: block;
}

.checkbox-container .checkmark:after {
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.header-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.report-item {
  padding: 24px;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.2s;
}

.report-item:hover {
  background: #f9fafb;
}

.report-item:last-child {
  border-bottom: none;
}

.report-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.report-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.report-id {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
}

.report-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.pending {
  background: #fef3c7;
  color: #d97706;
}

.status-badge.investigating {
  background: #dbeafe;
  color: #1e40af;
}

.status-badge.resolved {
  background: #dcfce7;
  color: #166534;
}

.status-badge.dismissed {
  background: #fee2e2;
  color: #dc2626;
}

.priority-badge {
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 500;
}

.priority-badge.high {
  background: #fee2e2;
  color: #dc2626;
}

.priority-badge.medium {
  background: #fef3c7;
  color: #d97706;
}

.priority-badge.low {
  background: #f0f9ff;
  color: #0369a1;
}

.type-badge {
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 500;
  background: #f3f4f6;
  color: #6b7280;
}

.report-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: #6b7280;
}

.time-icon {
  width: 14px;
  height: 14px;
}

.report-content {
  margin-left: 34px;
  margin-bottom: 16px;
}

.reporter-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.reporter-avatar .avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.reporter-name {
  font-weight: 500;
  color: #1f2937;
  font-size: 0.875rem;
}

.reporter-email {
  font-size: 0.75rem;
  color: #6b7280;
}

.report-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.report-reason h4,
.reported-content h4,
.report-evidence h4 {
  margin: 0 0 8px 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.report-reason p {
  margin: 0;
  font-size: 0.875rem;
  color: #1f2937;
  line-height: 1.5;
}

.content-preview {
  background: #f9fafb;
  border-radius: 8px;
  padding: 12px;
  border-left: 3px solid #e5e7eb;
}

.content-type-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 8px;
}

.content-icon {
  width: 14px;
  height: 14px;
}

.post-preview .post-title {
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 4px;
}

.post-preview .post-excerpt {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 4px;
}

.post-preview .post-author,
.comment-preview .comment-author {
  font-size: 0.75rem;
  color: #6b7280;
}

.comment-preview .comment-text {
  color: #1f2937;
  margin-bottom: 4px;
}

.user-preview .user-info,
.pet-preview .pet-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-preview .user-avatar,
.pet-preview .pet-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-preview .user-name,
.pet-preview .pet-name {
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 2px;
}

.user-preview .user-email,
.pet-preview .pet-breed {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 2px;
}

.user-preview .user-stats,
.pet-preview .pet-owner {
  font-size: 0.75rem;
  color: #6b7280;
}

.evidence-list {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.evidence-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.evidence-image {
  width: 100px;
  height: 75px;
  border-radius: 6px;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.2s;
}

.evidence-image:hover {
  transform: scale(1.05);
}

.evidence-description {
  font-size: 0.75rem;
  color: #6b7280;
  text-align: center;
}

.report-actions {
  display: flex;
  gap: 8px;
  margin-left: 34px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.investigate {
  background: #dbeafe;
  color: #1e40af;
}

.action-btn.investigate:hover {
  background: #bfdbfe;
}

.action-btn.resolve {
  background: #dcfce7;
  color: #166534;
}

.action-btn.resolve:hover {
  background: #bbf7d0;
}

.action-btn.dismiss {
  background: #fee2e2;
  color: #dc2626;
}

.action-btn.dismiss:hover {
  background: #fecaca;
}

.action-btn.view {
  background: #f3f4f6;
  color: #6b7280;
}

.action-btn.view:hover {
  background: #e5e7eb;
}

.action-btn.priority {
  background: #fef3c7;
  color: #d97706;
}

.action-btn.priority:hover {
  background: #fde68a;
}

.action-icon {
  width: 16px;
  height: 16px;
}

.status-icon {
  width: 12px;
  height: 12px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-top: 1px solid #e5e7eb;
}

.pagination-btn {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: #f3f4f6;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 0.875rem;
  color: #6b7280;
}

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
}

.modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
}

.close-icon {
  width: 20px;
  height: 20px;
  color: #6b7280;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.report-detail {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-section h4 {
  margin: 0 0 16px 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
}

.detail-item span {
  font-size: 0.875rem;
  color: #1f2937;
}

.reporter-detail {
  display: flex;
  align-items: center;
  gap: 16px;
}

.reporter-avatar-large {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.reporter-name-large {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.reporter-email-large {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 8px;
}

.reporter-stats {
  display: flex;
  gap: 16px;
  font-size: 0.75rem;
  color: #6b7280;
}

.processing-history {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  border-left: 3px solid #3b82f6;
}

.history-time {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 4px;
}

.history-action {
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 2px;
}

.history-operator {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 4px;
}

.history-note {
  font-size: 0.875rem;
  color: #374151;
}

@media (max-width: 768px) {
  .admin-reports {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .filters-row {
    flex-direction: column;
    gap: 12px;
  }
  
  .filter-group,
  .search-group {
    min-width: auto;
  }
  
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .report-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .report-content,
  .report-actions {
    margin-left: 0;
  }
  
  .modal {
    width: 95%;
    margin: 20px;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-footer {
    flex-direction: column;
  }
}
</style>