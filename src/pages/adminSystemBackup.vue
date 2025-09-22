<template>
  <div class="admin-system-backup">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">系统备份</h1>
        <p class="page-subtitle">管理系统数据备份和恢复</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="showScheduleDialog = true">
          <ClockIcon class="btn-icon" />
          备份计划
        </button>
        <button class="btn btn-primary" @click="createBackup">
          <CloudArrowUpIcon class="btn-icon" />
          立即备份
        </button>
      </div>
    </div>

    <!-- 备份状态概览 -->
    <div class="status-section">
      <div class="status-card">
        <div class="status-header">
          <h2 class="status-title">备份状态</h2>
          <div class="status-indicator" :class="backupStatus.status">
            <div class="indicator-dot"></div>
            <span class="indicator-text">{{ getStatusText(backupStatus.status) }}</span>
          </div>
        </div>
        <div class="status-content">
          <div class="status-item">
            <label class="status-label">最后备份时间</label>
            <div class="status-value">{{ formatDateTime(backupStatus.lastBackup) }}</div>
          </div>
          <div class="status-item">
            <label class="status-label">下次备份时间</label>
            <div class="status-value">{{ formatDateTime(backupStatus.nextBackup) }}</div>
          </div>
          <div class="status-item">
            <label class="status-label">备份大小</label>
            <div class="status-value">{{ formatFileSize(backupStatus.totalSize) }}</div>
          </div>
          <div class="status-item">
            <label class="status-label">备份数量</label>
            <div class="status-value">{{ backupStatus.totalCount }} 个</div>
          </div>
        </div>
      </div>
      
      <div class="progress-card" v-if="isBackingUp">
        <div class="progress-header">
          <h3 class="progress-title">正在备份...</h3>
          <span class="progress-percentage">{{ backupProgress.percentage }}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: backupProgress.percentage + '%' }"></div>
        </div>
        <div class="progress-details">
          <span class="progress-current">{{ backupProgress.currentStep }}</span>
          <span class="progress-time">预计剩余: {{ backupProgress.estimatedTime }}</span>
        </div>
      </div>
    </div>

    <!-- 备份列表 -->
    <div class="backups-section">
      <div class="section-header">
        <h2 class="section-title">备份记录</h2>
        <div class="section-actions">
          <div class="filter-group">
            <select v-model="filters.type" class="filter-select">
              <option value="">全部类型</option>
              <option value="auto">自动备份</option>
              <option value="manual">手动备份</option>
            </select>
          </div>
          <div class="filter-group">
            <select v-model="filters.status" class="filter-select">
              <option value="">全部状态</option>
              <option value="completed">已完成</option>
              <option value="failed">失败</option>
              <option value="in_progress">进行中</option>
            </select>
          </div>
        </div>
      </div>

      <div class="backups-grid">
        <div v-for="backup in filteredBackups" :key="backup.id" class="backup-card">
          <div class="backup-header">
            <div class="backup-info">
              <h3 class="backup-name">{{ backup.name }}</h3>
              <div class="backup-meta">
                <span class="backup-type" :class="backup.type">
                  {{ backup.type === 'auto' ? '自动' : '手动' }}
                </span>
                <span class="backup-date">{{ formatDateTime(backup.createdAt) }}</span>
              </div>
            </div>
            <div class="backup-status">
              <span class="status-badge" :class="backup.status">
                {{ getBackupStatusText(backup.status) }}
              </span>
            </div>
          </div>
          
          <div class="backup-details">
            <div class="detail-item">
              <ServerIcon class="detail-icon" />
              <div class="detail-content">
                <div class="detail-label">数据库</div>
                <div class="detail-value">{{ formatFileSize(backup.databaseSize) }}</div>
              </div>
            </div>
            <div class="detail-item">
              <FolderIcon class="detail-icon" />
              <div class="detail-content">
                <div class="detail-label">文件</div>
                <div class="detail-value">{{ formatFileSize(backup.filesSize) }}</div>
              </div>
            </div>
            <div class="detail-item">
              <ClockIcon class="detail-icon" />
              <div class="detail-content">
                <div class="detail-label">耗时</div>
                <div class="detail-value">{{ formatDuration(backup.duration) }}</div>
              </div>
            </div>
          </div>
          
          <div class="backup-actions">
            <button 
              class="action-btn" 
              @click="downloadBackup(backup)"
              :disabled="backup.status !== 'completed'"
              title="下载备份"
            >
              <ArrowDownTrayIcon class="action-icon" />
            </button>
            <button 
              class="action-btn" 
              @click="restoreBackup(backup)"
              :disabled="backup.status !== 'completed'"
              title="恢复备份"
            >
              <ArrowUturnLeftIcon class="action-icon" />
            </button>
            <button 
              class="action-btn danger" 
              @click="deleteBackup(backup)"
              title="删除备份"
            >
              <TrashIcon class="action-icon" />
            </button>
          </div>
          
          <div v-if="backup.error" class="backup-error">
            <ExclamationTriangleIcon class="error-icon" />
            <span class="error-message">{{ backup.error }}</span>
          </div>
        </div>
      </div>
      
      <div v-if="filteredBackups.length === 0" class="empty-state">
        <CloudArrowUpIcon class="empty-icon" />
        <h3>暂无备份记录</h3>
        <p>还没有创建任何备份，点击上方按钮开始备份</p>
      </div>
    </div>

    <!-- 备份计划对话框 -->
    <div v-if="showScheduleDialog" class="modal-overlay" @click="closeScheduleDialog">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>备份计划设置</h3>
          <button class="close-btn" @click="closeScheduleDialog">
            <XMarkIcon class="close-icon" />
          </button>
        </div>
        <div class="modal-body">
          <div class="schedule-form">
            <div class="form-group">
              <label class="form-label">启用自动备份</label>
              <div class="form-switch">
                <input 
                  v-model="scheduleConfig.enabled" 
                  type="checkbox" 
                  class="switch-input"
                  id="enableSchedule"
                />
                <label for="enableSchedule" class="switch-label"></label>
              </div>
              <p class="form-help">开启后系统将按照设定的频率自动备份</p>
            </div>
            
            <div class="form-group">
              <label class="form-label">备份频率</label>
              <select v-model="scheduleConfig.frequency" class="form-select" :disabled="!scheduleConfig.enabled">
                <option value="daily">每日</option>
                <option value="weekly">每周</option>
                <option value="monthly">每月</option>
              </select>
              <p class="form-help">选择自动备份的执行频率</p>
            </div>
            
            <div class="form-group">
              <label class="form-label">备份时间</label>
              <input 
                v-model="scheduleConfig.time" 
                type="time" 
                class="form-input"
                :disabled="!scheduleConfig.enabled"
              />
              <p class="form-help">设置每日备份的执行时间</p>
            </div>
            
            <div class="form-group">
              <label class="form-label">保留数量</label>
              <input 
                v-model.number="scheduleConfig.retention" 
                type="number" 
                class="form-input"
                min="1" 
                max="30"
                :disabled="!scheduleConfig.enabled"
              />
              <p class="form-help">自动删除超过指定数量的旧备份（1-30个）</p>
            </div>
            
            <div class="form-group">
              <label class="form-label">备份内容</label>
              <div class="checkbox-group">
                <label class="checkbox-item">
                  <input 
                    v-model="scheduleConfig.includeDatabase" 
                    type="checkbox"
                    :disabled="!scheduleConfig.enabled"
                  />
                  <span class="checkbox-label">数据库</span>
                </label>
                <label class="checkbox-item">
                  <input 
                    v-model="scheduleConfig.includeFiles" 
                    type="checkbox"
                    :disabled="!scheduleConfig.enabled"
                  />
                  <span class="checkbox-label">上传文件</span>
                </label>
                <label class="checkbox-item">
                  <input 
                    v-model="scheduleConfig.includeConfig" 
                    type="checkbox"
                    :disabled="!scheduleConfig.enabled"
                  />
                  <span class="checkbox-label">配置文件</span>
                </label>
              </div>
              <p class="form-help">选择要包含在备份中的内容</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeScheduleDialog">取消</button>
          <button class="btn btn-primary" @click="saveScheduleConfig">保存设置</button>
        </div>
      </div>
    </div>

    <!-- 恢复确认对话框 -->
    <div v-if="showRestoreDialog" class="modal-overlay" @click="closeRestoreDialog">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>恢复备份</h3>
          <button class="close-btn" @click="closeRestoreDialog">
            <XMarkIcon class="close-icon" />
          </button>
        </div>
        <div class="modal-body">
          <div class="restore-warning">
            <ExclamationTriangleIcon class="warning-icon" />
            <div class="warning-content">
              <h4>警告：此操作将覆盖当前数据</h4>
              <p>恢复备份将会替换当前的所有数据，包括数据库和文件。此操作不可撤销，请确保您了解操作的后果。</p>
            </div>
          </div>
          
          <div class="restore-info">
            <h4>备份信息</h4>
            <div class="info-grid">
              <div class="info-item">
                <label>备份名称</label>
                <span>{{ selectedBackup?.name }}</span>
              </div>
              <div class="info-item">
                <label>创建时间</label>
                <span>{{ formatDateTime(selectedBackup?.createdAt) }}</span>
              </div>
              <div class="info-item">
                <label>备份大小</label>
                <span>{{ formatFileSize((selectedBackup?.databaseSize || 0) + (selectedBackup?.filesSize || 0)) }}</span>
              </div>
            </div>
          </div>
          
          <div class="restore-options">
            <h4>恢复选项</h4>
            <div class="checkbox-group">
              <label class="checkbox-item">
                <input v-model="restoreOptions.database" type="checkbox" />
                <span class="checkbox-label">恢复数据库</span>
              </label>
              <label class="checkbox-item">
                <input v-model="restoreOptions.files" type="checkbox" />
                <span class="checkbox-label">恢复文件</span>
              </label>
              <label class="checkbox-item">
                <input v-model="restoreOptions.config" type="checkbox" />
                <span class="checkbox-label">恢复配置</span>
              </label>
            </div>
          </div>
          
          <div class="confirmation-input">
            <label class="form-label">请输入 "RESTORE" 确认恢复操作</label>
            <input 
              v-model="confirmationText" 
              type="text" 
              class="form-input"
              placeholder="输入 RESTORE 确认"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeRestoreDialog">取消</button>
          <button 
            class="btn btn-danger" 
            @click="confirmRestore"
            :disabled="confirmationText !== 'RESTORE'"
          >
            确认恢复
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  CloudArrowUpIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  ArrowUturnLeftIcon,
  TrashIcon,
  ServerIcon,
  FolderIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

// 响应式数据
const isBackingUp = ref(false)
const showScheduleDialog = ref(false)
const showRestoreDialog = ref(false)
const selectedBackup = ref(null)
const confirmationText = ref('')

const filters = ref({
  type: '',
  status: ''
})

const backupStatus = ref({
  status: 'idle', // idle, running, completed, failed
  lastBackup: '2024-01-15T02:00:00Z',
  nextBackup: '2024-01-16T02:00:00Z',
  totalSize: 1024 * 1024 * 1024 * 2.5, // 2.5GB
  totalCount: 15
})

const backupProgress = ref({
  percentage: 0,
  currentStep: '',
  estimatedTime: ''
})

const scheduleConfig = ref({
  enabled: true,
  frequency: 'daily',
  time: '02:00',
  retention: 7,
  includeDatabase: true,
  includeFiles: true,
  includeConfig: true
})

const restoreOptions = ref({
  database: true,
  files: true,
  config: false
})

const backups = ref([])

// 计算属性
const filteredBackups = computed(() => {
  let filtered = [...backups.value]
  
  if (filters.value.type) {
    filtered = filtered.filter(backup => backup.type === filters.value.type)
  }
  
  if (filters.value.status) {
    filtered = filtered.filter(backup => backup.status === filters.value.status)
  }
  
  return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

// 方法
const loadBackups = async () => {
  try {
    // 这里应该调用API加载备份数据
    console.log('加载备份列表')
    
    // 模拟数据
    backups.value = [
      {
        id: 1,
        name: '自动备份-20240115',
        type: 'auto',
        status: 'completed',
        createdAt: '2024-01-15T02:00:00Z',
        databaseSize: 1024 * 1024 * 500, // 500MB
        filesSize: 1024 * 1024 * 1024 * 1.2, // 1.2GB
        duration: 180000 // 3分钟
      },
      {
        id: 2,
        name: '手动备份-升级前',
        type: 'manual',
        status: 'completed',
        createdAt: '2024-01-14T10:30:00Z',
        databaseSize: 1024 * 1024 * 480,
        filesSize: 1024 * 1024 * 1024 * 1.1,
        duration: 165000
      },
      {
        id: 3,
        name: '自动备份-20240114',
        type: 'auto',
        status: 'failed',
        createdAt: '2024-01-14T02:00:00Z',
        databaseSize: 0,
        filesSize: 0,
        duration: 30000,
        error: '磁盘空间不足，备份失败'
      }
    ]
  } catch (error) {
    console.error('加载备份列表失败:', error)
  }
}

const createBackup = async () => {
  try {
    isBackingUp.value = true
    backupStatus.value.status = 'running'
    
    // 模拟备份进度
    const steps = [
      { step: '准备备份环境...', duration: 2000 },
      { step: '备份数据库...', duration: 5000 },
      { step: '备份文件系统...', duration: 8000 },
      { step: '压缩备份文件...', duration: 3000 },
      { step: '验证备份完整性...', duration: 2000 }
    ]
    
    let totalProgress = 0
    const stepProgress = 100 / steps.length
    
    for (const [index, { step, duration }] of steps.entries()) {
      backupProgress.value.currentStep = step
      backupProgress.value.estimatedTime = `${Math.ceil((steps.length - index) * 2)} 分钟`
      
      // 模拟进度更新
      const startProgress = totalProgress
      const endProgress = totalProgress + stepProgress
      
      const progressInterval = setInterval(() => {
        if (backupProgress.value.percentage < endProgress) {
          backupProgress.value.percentage += 1
        }
      }, duration / stepProgress)
      
      await new Promise(resolve => setTimeout(resolve, duration))
      clearInterval(progressInterval)
      
      totalProgress = endProgress
      backupProgress.value.percentage = Math.round(totalProgress)
    }
    
    // 完成备份
    backupProgress.value.percentage = 100
    backupProgress.value.currentStep = '备份完成'
    
    setTimeout(() => {
      isBackingUp.value = false
      backupStatus.value.status = 'completed'
      backupStatus.value.lastBackup = new Date().toISOString()
      
      // 添加新的备份记录
      const newBackup = {
        id: Date.now(),
        name: `手动备份-${new Date().toLocaleDateString('zh-CN').replace(/\//g, '')}`,
        type: 'manual',
        status: 'completed',
        createdAt: new Date().toISOString(),
        databaseSize: 1024 * 1024 * 520,
        filesSize: 1024 * 1024 * 1024 * 1.3,
        duration: 20000
      }
      
      backups.value.unshift(newBackup)
      alert('备份创建成功！')
    }, 1000)
    
  } catch (error) {
    console.error('创建备份失败:', error)
    isBackingUp.value = false
    backupStatus.value.status = 'failed'
    alert('备份创建失败，请重试')
  }
}

const downloadBackup = (backup) => {
  // 这里应该实现备份下载逻辑
  console.log('下载备份:', backup.name)
  alert('备份下载功能开发中')
}

const restoreBackup = (backup) => {
  selectedBackup.value = backup
  showRestoreDialog.value = true
  confirmationText.value = ''
  restoreOptions.value = {
    database: true,
    files: true,
    config: false
  }
}

const confirmRestore = async () => {
  if (confirmationText.value !== 'RESTORE') {
    return
  }
  
  try {
    // 这里应该调用API执行恢复操作
    console.log('恢复备份:', selectedBackup.value.name, restoreOptions.value)
    
    closeRestoreDialog()
    alert('备份恢复已开始，系统将在完成后自动重启')
  } catch (error) {
    console.error('恢复备份失败:', error)
    alert('恢复备份失败，请重试')
  }
}

const deleteBackup = (backup) => {
  if (confirm(`确定要删除备份 "${backup.name}" 吗？此操作不可撤销。`)) {
    const index = backups.value.findIndex(b => b.id === backup.id)
    if (index > -1) {
      backups.value.splice(index, 1)
      alert('备份已删除')
    }
  }
}

const saveScheduleConfig = async () => {
  try {
    // 这里应该调用API保存备份计划配置
    console.log('保存备份计划:', scheduleConfig.value)
    
    closeScheduleDialog()
    alert('备份计划设置已保存')
  } catch (error) {
    console.error('保存备份计划失败:', error)
    alert('保存失败，请重试')
  }
}

const closeScheduleDialog = () => {
  showScheduleDialog.value = false
}

const closeRestoreDialog = () => {
  showRestoreDialog.value = false
  selectedBackup.value = null
  confirmationText.value = ''
}

const getStatusText = (status) => {
  const statusMap = {
    idle: '空闲',
    running: '运行中',
    completed: '已完成',
    failed: '失败'
  }
  return statusMap[status] || status
}

const getBackupStatusText = (status) => {
  const statusMap = {
    completed: '已完成',
    failed: '失败',
    in_progress: '进行中'
  }
  return statusMap[status] || status
}

const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

const formatDuration = (milliseconds) => {
  if (!milliseconds) return '0秒'
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}小时${minutes % 60}分钟`
  } else if (minutes > 0) {
    return `${minutes}分钟${seconds % 60}秒`
  } else {
    return `${seconds}秒`
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadBackups()
})
</script>

<style scoped>
.admin-system-backup {
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

.btn-danger:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.status-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.status-card,
.progress-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.status-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #9ca3af;
}

.status-indicator.idle .indicator-dot {
  background: #9ca3af;
}

.status-indicator.running .indicator-dot {
  background: #3b82f6;
  animation: pulse 2s infinite;
}

.status-indicator.completed .indicator-dot {
  background: #22c55e;
}

.status-indicator.failed .indicator-dot {
  background: #ef4444;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.indicator-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.status-content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.status-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.status-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.progress-card {
  grid-column: 1 / -1;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.progress-percentage {
  font-size: 1.25rem;
  font-weight: 700;
  color: #3b82f6;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-current {
  font-size: 0.875rem;
  color: #374151;
}

.progress-time {
  font-size: 0.875rem;
  color: #6b7280;
}

.backups-section {
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

.section-actions {
  display: flex;
  gap: 12px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-select {
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
}

.backups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  padding: 24px;
}

.backup-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.2s;
}

.backup-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.backup-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.backup-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.backup-meta {
  display: flex;
  gap: 12px;
  align-items: center;
}

.backup-type {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.backup-type.auto {
  background: #eff6ff;
  color: #2563eb;
}

.backup-type.manual {
  background: #f0fdf4;
  color: #16a34a;
}

.backup-date {
  font-size: 0.875rem;
  color: #6b7280;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.completed {
  background: #f0fdf4;
  color: #16a34a;
}

.status-badge.failed {
  background: #fef2f2;
  color: #dc2626;
}

.status-badge.in_progress {
  background: #eff6ff;
  color: #2563eb;
}

.backup-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-icon {
  width: 16px;
  height: 16px;
  color: #6b7280;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-label {
  font-size: 0.75rem;
  color: #6b7280;
}

.detail-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
}

.backup-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.action-btn {
  width: 36px;
  height: 36px;
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

.action-btn:hover:not(:disabled) {
  background: #e5e7eb;
  color: #374151;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.danger {
  background: #fef2f2;
  color: #ef4444;
}

.action-btn.danger:hover:not(:disabled) {
  background: #fecaca;
}

.action-icon {
  width: 16px;
  height: 16px;
}

.backup-error {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 8px 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
}

.error-icon {
  width: 16px;
  height: 16px;
  color: #ef4444;
}

.error-message {
  font-size: 0.875rem;
  color: #dc2626;
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
  max-width: 600px;
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

.schedule-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-input,
.form-select {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
}

.form-input:disabled,
.form-select:disabled {
  background: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
}

.form-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.switch-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switch-label {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #d1d5db;
  transition: 0.2s;
  border-radius: 24px;
}

.switch-label:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.2s;
  border-radius: 50%;
}

.switch-input:checked + .switch-label {
  background-color: #3b82f6;
}

.switch-input:checked + .switch-label:before {
  transform: translateX(24px);
}

.form-help {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-item input[type="checkbox"]:disabled {
  cursor: not-allowed;
}

.checkbox-label {
  font-size: 0.875rem;
  color: #374151;
}

.restore-warning {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #fffbeb;
  border: 1px solid #fbbf24;
  border-radius: 8px;
  margin-bottom: 20px;
}

.warning-icon {
  width: 20px;
  height: 20px;
  color: #f59e0b;
  flex-shrink: 0;
  margin-top: 2px;
}

.warning-content h4 {
  margin: 0 0 8px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #92400e;
}

.warning-content p {
  margin: 0;
  font-size: 0.875rem;
  color: #92400e;
  line-height: 1.5;
}

.restore-info,
.restore-options {
  margin-bottom: 20px;
}

.restore-info h4,
.restore-options h4 {
  margin: 0 0 12px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item label {
  font-size: 0.875rem;
  color: #6b7280;
}

.info-item span {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
}

.confirmation-input {
  margin-top: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
}

@media (max-width: 768px) {
  .admin-system-backup {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .status-section {
    grid-template-columns: 1fr;
  }
  
  .status-content {
    grid-template-columns: 1fr;
  }
  
  .backups-grid {
    grid-template-columns: 1fr;
  }
  
  .backup-details {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .section-actions {
    flex-direction: column;
  }
  
  .modal {
    width: 95%;
    margin: 20px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-footer {
    flex-direction: column;
  }
}
</style>