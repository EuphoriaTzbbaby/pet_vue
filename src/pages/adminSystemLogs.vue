<template>
  <div class="admin-system-logs">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">系统日志</h1>
        <p class="page-subtitle">查看和管理系统运行日志</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="exportLogs">
          <ArrowDownTrayIcon class="btn-icon" />
          导出日志
        </button>
        <button class="btn btn-danger" @click="clearLogs">
          <TrashIcon class="btn-icon" />
          清空日志
        </button>
        <button class="btn btn-primary" @click="refreshLogs">
          <ArrowPathIcon class="btn-icon" />
          刷新
        </button>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon error">
          <ExclamationTriangleIcon />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.errorCount }}</div>
          <div class="stat-label">错误日志</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon warning">
          <ExclamationCircleIcon />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.warningCount }}</div>
          <div class="stat-label">警告日志</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon info">
          <InformationCircleIcon />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.infoCount }}</div>
          <div class="stat-label">信息日志</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success">
          <CheckCircleIcon />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalCount }}</div>
          <div class="stat-label">总日志数</div>
        </div>
      </div>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filters-section">
      <div class="filters-row">
        <div class="filter-group">
          <label class="filter-label">日志级别</label>
          <select v-model="filters.level" class="filter-select">
            <option value="">全部级别</option>
            <option value="error">错误</option>
            <option value="warning">警告</option>
            <option value="info">信息</option>
            <option value="debug">调试</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">日志模块</label>
          <select v-model="filters.module" class="filter-select">
            <option value="">全部模块</option>
            <option value="auth">用户认证</option>
            <option value="database">数据库</option>
            <option value="api">API接口</option>
            <option value="file">文件系统</option>
            <option value="email">邮件服务</option>
            <option value="payment">支付系统</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">时间范围</label>
          <select v-model="filters.timeRange" class="filter-select">
            <option value="today">今天</option>
            <option value="yesterday">昨天</option>
            <option value="week">最近7天</option>
            <option value="month">最近30天</option>
            <option value="custom">自定义</option>
          </select>
        </div>
        
        <div v-if="filters.timeRange === 'custom'" class="filter-group">
          <label class="filter-label">开始时间</label>
          <input 
            v-model="filters.startDate" 
            type="datetime-local" 
            class="filter-input"
          />
        </div>
        
        <div v-if="filters.timeRange === 'custom'" class="filter-group">
          <label class="filter-label">结束时间</label>
          <input 
            v-model="filters.endDate" 
            type="datetime-local" 
            class="filter-input"
          />
        </div>
      </div>
      
      <div class="search-row">
        <div class="search-group">
          <MagnifyingGlassIcon class="search-icon" />
          <input 
            v-model="filters.keyword" 
            type="text" 
            class="search-input"
            placeholder="搜索日志内容、用户ID、IP地址等..."
            @keyup.enter="searchLogs"
          />
        </div>
        <button class="btn btn-primary" @click="searchLogs">
          搜索
        </button>
        <button class="btn btn-secondary" @click="resetFilters">
          重置
        </button>
      </div>
    </div>

    <!-- 日志列表 -->
    <div class="logs-section">
      <div class="section-header">
        <h2 class="section-title">日志记录</h2>
        <div class="section-actions">
          <div class="view-toggle">
            <button 
              class="toggle-btn"
              :class="{ active: viewMode === 'table' }"
              @click="viewMode = 'table'"
            >
              <TableCellsIcon class="toggle-icon" />
              表格视图
            </button>
            <button 
              class="toggle-btn"
              :class="{ active: viewMode === 'raw' }"
              @click="viewMode = 'raw'"
            >
              <DocumentTextIcon class="toggle-icon" />
              原始日志
            </button>
          </div>
        </div>
      </div>

      <!-- 表格视图 -->
      <div v-if="viewMode === 'table'" class="table-container">
        <table class="logs-table">
          <thead>
            <tr>
              <th class="sortable" @click="sortBy('timestamp')">
                时间
                <ChevronUpDownIcon class="sort-icon" />
              </th>
              <th class="sortable" @click="sortBy('level')">
                级别
                <ChevronUpDownIcon class="sort-icon" />
              </th>
              <th class="sortable" @click="sortBy('module')">
                模块
                <ChevronUpDownIcon class="sort-icon" />
              </th>
              <th>消息</th>
              <th>用户</th>
              <th>IP地址</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in paginatedLogs" :key="log.id" class="log-row">
              <td class="timestamp-cell">
                <div class="timestamp">{{ formatTimestamp(log.timestamp) }}</div>
                <div class="date">{{ formatDate(log.timestamp) }}</div>
              </td>
              <td>
                <span class="level-badge" :class="log.level">
                  {{ getLevelText(log.level) }}
                </span>
              </td>
              <td>
                <span class="module-badge">{{ log.module }}</span>
              </td>
              <td class="message-cell">
                <div class="message" :title="log.message">
                  {{ truncateMessage(log.message) }}
                </div>
                <div v-if="log.details" class="details-preview">
                  {{ truncateMessage(log.details) }}
                </div>
              </td>
              <td>
                <div v-if="log.userId" class="user-info">
                  <div class="user-name">{{ log.userName || log.userId }}</div>
                  <div class="user-id">ID: {{ log.userId }}</div>
                </div>
                <span v-else class="no-user">系统</span>
              </td>
              <td>
                <span class="ip-address">{{ log.ipAddress || '-' }}</span>
              </td>
              <td>
                <div class="action-buttons">
                  <button 
                    class="action-btn" 
                    @click="viewLogDetails(log)"
                    title="查看详情"
                  >
                    <EyeIcon class="action-icon" />
                  </button>
                  <button 
                    v-if="log.level === 'error'"
                    class="action-btn error" 
                    @click="reportError(log)"
                    title="报告错误"
                  >
                    <ExclamationTriangleIcon class="action-icon" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div v-if="filteredLogs.length === 0" class="empty-state">
          <DocumentTextIcon class="empty-icon" />
          <h3>暂无日志记录</h3>
          <p>当前筛选条件下没有找到日志记录</p>
        </div>
      </div>

      <!-- 原始日志视图 -->
      <div v-if="viewMode === 'raw'" class="raw-logs-container">
        <div class="raw-logs">
          <div v-for="log in paginatedLogs" :key="log.id" class="raw-log-entry">
            <div class="raw-log-header">
              <span class="raw-timestamp">{{ log.timestamp }}</span>
              <span class="raw-level" :class="log.level">[{{ log.level.toUpperCase() }}]</span>
              <span class="raw-module">[{{ log.module }}]</span>
            </div>
            <div class="raw-log-content">
              {{ log.message }}
              <div v-if="log.details" class="raw-log-details">
                {{ log.details }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination">
        <div class="pagination-info">
          显示 {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, filteredLogs.length) }} 条，
          共 {{ filteredLogs.length }} 条记录
        </div>
        <div class="pagination-controls">
          <button 
            class="pagination-btn" 
            :disabled="currentPage === 1"
            @click="currentPage = 1"
          >
            首页
          </button>
          <button 
            class="pagination-btn" 
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            上一页
          </button>
          <span class="pagination-current">
            第 {{ currentPage }} / {{ totalPages }} 页
          </span>
          <button 
            class="pagination-btn" 
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            下一页
          </button>
          <button 
            class="pagination-btn" 
            :disabled="currentPage === totalPages"
            @click="currentPage = totalPages"
          >
            末页
          </button>
        </div>
      </div>
    </div>

    <!-- 日志详情模态框 -->
    <div v-if="showLogDetails" class="modal-overlay" @click="closeLogDetails">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>日志详情</h3>
          <button class="close-btn" @click="closeLogDetails">
            <XMarkIcon class="close-icon" />
          </button>
        </div>
        <div class="modal-body">
          <div class="log-detail-grid">
            <div class="detail-item">
              <label class="detail-label">时间</label>
              <div class="detail-value">{{ selectedLog?.timestamp }}</div>
            </div>
            <div class="detail-item">
              <label class="detail-label">级别</label>
              <div class="detail-value">
                <span class="level-badge" :class="selectedLog?.level">
                  {{ getLevelText(selectedLog?.level) }}
                </span>
              </div>
            </div>
            <div class="detail-item">
              <label class="detail-label">模块</label>
              <div class="detail-value">
                <span class="module-badge">{{ selectedLog?.module }}</span>
              </div>
            </div>
            <div class="detail-item">
              <label class="detail-label">用户</label>
              <div class="detail-value">
                {{ selectedLog?.userName || selectedLog?.userId || '系统' }}
              </div>
            </div>
            <div class="detail-item">
              <label class="detail-label">IP地址</label>
              <div class="detail-value">{{ selectedLog?.ipAddress || '-' }}</div>
            </div>
            <div class="detail-item">
              <label class="detail-label">用户代理</label>
              <div class="detail-value">{{ selectedLog?.userAgent || '-' }}</div>
            </div>
            <div class="detail-item full-width">
              <label class="detail-label">消息</label>
              <div class="detail-value message-detail">{{ selectedLog?.message }}</div>
            </div>
            <div v-if="selectedLog?.details" class="detail-item full-width">
              <label class="detail-label">详细信息</label>
              <div class="detail-value details-content">
                <pre>{{ selectedLog.details }}</pre>
              </div>
            </div>
            <div v-if="selectedLog?.stackTrace" class="detail-item full-width">
              <label class="detail-label">堆栈跟踪</label>
              <div class="detail-value stack-trace">
                <pre>{{ selectedLog.stackTrace }}</pre>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeLogDetails">关闭</button>
          <button class="btn btn-primary" @click="copyLogDetails">复制详情</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  TableCellsIcon,
  DocumentTextIcon,
  ChevronUpDownIcon,
  EyeIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

// 响应式数据
const viewMode = ref('table')
const currentPage = ref(1)
const pageSize = ref(50)
const showLogDetails = ref(false)
const selectedLog = ref(null)
const sortField = ref('timestamp')
const sortOrder = ref('desc')

const filters = ref({
  level: '',
  module: '',
  timeRange: 'today',
  startDate: '',
  endDate: '',
  keyword: ''
})

const stats = ref({
  errorCount: 0,
  warningCount: 0,
  infoCount: 0,
  totalCount: 0
})

const logs = ref([])

// 计算属性
const filteredLogs = computed(() => {
  let filtered = [...logs.value]
  
  // 级别筛选
  if (filters.value.level) {
    filtered = filtered.filter(log => log.level === filters.value.level)
  }
  
  // 模块筛选
  if (filters.value.module) {
    filtered = filtered.filter(log => log.module === filters.value.module)
  }
  
  // 时间范围筛选
  if (filters.value.timeRange !== 'custom') {
    const now = new Date()
    let startTime
    
    switch (filters.value.timeRange) {
      case 'today':
        startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'yesterday':
        startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
        break
      case 'week':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
    }
    
    if (startTime) {
      filtered = filtered.filter(log => new Date(log.timestamp) >= startTime)
    }
  } else {
    // 自定义时间范围
    if (filters.value.startDate) {
      filtered = filtered.filter(log => new Date(log.timestamp) >= new Date(filters.value.startDate))
    }
    if (filters.value.endDate) {
      filtered = filtered.filter(log => new Date(log.timestamp) <= new Date(filters.value.endDate))
    }
  }
  
  // 关键词搜索
  if (filters.value.keyword) {
    const keyword = filters.value.keyword.toLowerCase()
    filtered = filtered.filter(log => 
      log.message.toLowerCase().includes(keyword) ||
      (log.details && log.details.toLowerCase().includes(keyword)) ||
      (log.userId && log.userId.toString().includes(keyword)) ||
      (log.ipAddress && log.ipAddress.includes(keyword))
    )
  }
  
  // 排序
  filtered.sort((a, b) => {
    let aValue = a[sortField.value]
    let bValue = b[sortField.value]
    
    if (sortField.value === 'timestamp') {
      aValue = new Date(aValue)
      bValue = new Date(bValue)
    }
    
    if (sortOrder.value === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })
  
  return filtered
})

const totalPages = computed(() => {
  return Math.ceil(filteredLogs.value.length / pageSize.value)
})

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredLogs.value.slice(start, end)
})

// 方法
const loadLogs = async () => {
  try {
    // 这里应该调用API加载日志数据
    console.log('加载系统日志')
    
    // 模拟数据
    logs.value = [
      {
        id: 1,
        timestamp: '2024-01-15T10:30:00Z',
        level: 'error',
        module: 'auth',
        message: '用户登录失败：密码错误',
        details: 'Login attempt failed for user: user@example.com. Reason: Invalid password',
        userId: 1001,
        userName: '张三',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        id: 2,
        timestamp: '2024-01-15T10:25:00Z',
        level: 'info',
        module: 'api',
        message: '用户成功登录',
        details: 'User login successful',
        userId: 1002,
        userName: '李四',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      {
        id: 3,
        timestamp: '2024-01-15T10:20:00Z',
        level: 'warning',
        module: 'database',
        message: '数据库连接池接近满载',
        details: 'Database connection pool usage: 85%. Consider increasing pool size.',
        ipAddress: '127.0.0.1'
      }
    ]
    
    updateStats()
  } catch (error) {
    console.error('加载日志失败:', error)
  }
}

const updateStats = () => {
  stats.value = {
    errorCount: logs.value.filter(log => log.level === 'error').length,
    warningCount: logs.value.filter(log => log.level === 'warning').length,
    infoCount: logs.value.filter(log => log.level === 'info').length,
    totalCount: logs.value.length
  }
}

const refreshLogs = () => {
  loadLogs()
}

const searchLogs = () => {
  currentPage.value = 1
  // 搜索逻辑已在计算属性中实现
}

const resetFilters = () => {
  filters.value = {
    level: '',
    module: '',
    timeRange: 'today',
    startDate: '',
    endDate: '',
    keyword: ''
  }
  currentPage.value = 1
}

const sortBy = (field) => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortOrder.value = 'desc'
  }
}

const viewLogDetails = (log) => {
  selectedLog.value = log
  showLogDetails.value = true
}

const closeLogDetails = () => {
  showLogDetails.value = false
  selectedLog.value = null
}

const copyLogDetails = () => {
  if (selectedLog.value) {
    const details = JSON.stringify(selectedLog.value, null, 2)
    navigator.clipboard.writeText(details)
    alert('日志详情已复制到剪贴板')
  }
}

const reportError = (log) => {
  // 这里可以实现错误报告功能
  console.log('报告错误:', log)
  alert('错误已报告给开发团队')
}

const exportLogs = () => {
  // 这里可以实现日志导出功能
  console.log('导出日志')
  alert('日志导出功能开发中')
}

const clearLogs = () => {
  if (confirm('确定要清空所有日志吗？此操作不可撤销。')) {
    logs.value = []
    updateStats()
    alert('日志已清空')
  }
}

const formatTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN')
}

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString('zh-CN')
}

const getLevelText = (level) => {
  const levelMap = {
    error: '错误',
    warning: '警告',
    info: '信息',
    debug: '调试'
  }
  return levelMap[level] || level
}

const truncateMessage = (message, maxLength = 100) => {
  if (!message) return ''
  return message.length > maxLength ? message.substring(0, maxLength) + '...' : message
}

// 监听筛选条件变化
watch(filters, () => {
  currentPage.value = 1
}, { deep: true })

// 组件挂载时加载数据
onMounted(() => {
  loadLogs()
})
</script>

<style scoped>
.admin-system-logs {
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

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.error {
  background: #fef2f2;
  color: #ef4444;
}

.stat-icon.warning {
  background: #fffbeb;
  color: #f59e0b;
}

.stat-icon.info {
  background: #eff6ff;
  color: #3b82f6;
}

.stat-icon.success {
  background: #f0fdf4;
  color: #22c55e;
}

.stat-icon svg {
  width: 24px;
  height: 24px;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 4px;
}

.filters-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.filters-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.filter-select,
.filter-input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
}

.search-row {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.search-group {
  position: relative;
  flex: 1;
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

.search-input {
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
}

.logs-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.view-toggle {
  display: flex;
  gap: 4px;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 4px;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  background: none;
  color: #6b7280;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn.active {
  background: white;
  color: #374151;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.toggle-icon {
  width: 16px;
  height: 16px;
}

.table-container {
  overflow-x: auto;
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
}

.logs-table th {
  background: #f9fafb;
  padding: 12px 16px;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.logs-table th.sortable {
  cursor: pointer;
  user-select: none;
}

.logs-table th.sortable:hover {
  background: #f3f4f6;
}

.sort-icon {
  width: 14px;
  height: 14px;
  margin-left: 4px;
  color: #9ca3af;
}

.logs-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.875rem;
  vertical-align: top;
}

.log-row:hover {
  background: #f9fafb;
}

.timestamp-cell {
  min-width: 120px;
}

.timestamp {
  font-weight: 500;
  color: #1f2937;
}

.date {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 2px;
}

.level-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.level-badge.error {
  background: #fef2f2;
  color: #dc2626;
}

.level-badge.warning {
  background: #fffbeb;
  color: #d97706;
}

.level-badge.info {
  background: #eff6ff;
  color: #2563eb;
}

.level-badge.debug {
  background: #f3f4f6;
  color: #6b7280;
}

.module-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  background: #f3f4f6;
  color: #374151;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
}

.message-cell {
  max-width: 300px;
}

.message {
  color: #1f2937;
  line-height: 1.4;
}

.details-preview {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 4px;
  font-style: italic;
}

.user-info {
  min-width: 100px;
}

.user-name {
  font-weight: 500;
  color: #1f2937;
}

.user-id {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 2px;
}

.no-user {
  color: #9ca3af;
  font-style: italic;
}

.ip-address {
  font-family: monospace;
  color: #6b7280;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.action-btn.error {
  background: #fef2f2;
  color: #ef4444;
}

.action-btn.error:hover {
  background: #fecaca;
}

.action-icon {
  width: 16px;
  height: 16px;
}

.raw-logs-container {
  padding: 24px;
  background: #1f2937;
  color: #f9fafb;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  max-height: 600px;
  overflow-y: auto;
}

.raw-log-entry {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #374151;
}

.raw-log-entry:last-child {
  border-bottom: none;
}

.raw-log-header {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
  font-weight: 500;
}

.raw-timestamp {
  color: #9ca3af;
}

.raw-level {
  font-weight: 600;
}

.raw-level.error {
  color: #f87171;
}

.raw-level.warning {
  color: #fbbf24;
}

.raw-level.info {
  color: #60a5fa;
}

.raw-level.debug {
  color: #9ca3af;
}

.raw-module {
  color: #a78bfa;
}

.raw-log-content {
  white-space: pre-wrap;
  word-break: break-word;
}

.raw-log-details {
  margin-top: 8px;
  padding-left: 16px;
  color: #d1d5db;
  font-size: 0.8125rem;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
}

.empty-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  color: #d1d5db;
}

.empty-state h3 {
  font-size: 1.125rem;
  font-weight: 500;
  color: #374151;
  margin: 0 0 8px 0;
}

.empty-state p {
  margin: 0;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
}

.pagination-info {
  font-size: 0.875rem;
  color: #6b7280;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: #f3f4f6;
}

.pagination-btn:disabled {
  color: #9ca3af;
  cursor: not-allowed;
}

.pagination-current {
  font-size: 0.875rem;
  color: #374151;
  margin: 0 8px;
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
  max-width: 800px;
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

.log-detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.detail-value {
  font-size: 0.875rem;
  color: #1f2937;
}

.message-detail {
  background: #f9fafb;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  white-space: pre-wrap;
  word-break: break-word;
}

.details-content,
.stack-trace {
  background: #1f2937;
  color: #f9fafb;
  padding: 16px;
  border-radius: 6px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.8125rem;
  line-height: 1.5;
  overflow-x: auto;
}

.details-content pre,
.stack-trace pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
}

@media (max-width: 768px) {
  .admin-system-logs {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .filters-row {
    grid-template-columns: 1fr;
  }
  
  .search-row {
    flex-direction: column;
  }
  
  .view-toggle {
    flex-direction: column;
  }
  
  .table-container {
    overflow-x: scroll;
  }
  
  .logs-table {
    min-width: 800px;
  }
  
  .pagination {
    flex-direction: column;
    gap: 12px;
  }
  
  .modal {
    width: 95%;
    margin: 20px;
  }
  
  .log-detail-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-footer {
    flex-direction: column;
  }
}
</style>