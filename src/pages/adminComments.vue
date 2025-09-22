<template>
  <div class="admin-comments">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">评论管理</h1>
        <p class="page-subtitle">管理社区帖子的评论和回复</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="exportComments">
          <DocumentArrowDownIcon class="btn-icon" />
          导出数据
        </button>
      </div>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filters-section">
      <div class="filters-row">
        <div class="filter-group">
          <label>评论状态</label>
          <select v-model="filters.status">
            <option value="">全部状态</option>
            <option value="approved">已通过</option>
            <option value="pending">待审核</option>
            <option value="rejected">已拒绝</option>
            <option value="reported">被举报</option>
          </select>
        </div>
        <div class="filter-group">
          <label>评论类型</label>
          <select v-model="filters.type">
            <option value="">全部类型</option>
            <option value="comment">评论</option>
            <option value="reply">回复</option>
          </select>
        </div>
        <div class="filter-group">
          <label>时间范围</label>
          <select v-model="filters.dateRange">
            <option value="">全部时间</option>
            <option value="today">今天</option>
            <option value="week">最近一周</option>
            <option value="month">最近一月</option>
          </select>
        </div>
        <div class="search-group">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="搜索评论内容、用户名..."
            class="search-input"
          />
          <MagnifyingGlassIcon class="search-icon" />
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-row">
      <div class="stat-item">
        <div class="stat-value">{{ commentStats.total }}</div>
        <div class="stat-label">总评论数</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ commentStats.pending }}</div>
        <div class="stat-label">待审核</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ commentStats.reported }}</div>
        <div class="stat-label">被举报</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ commentStats.todayCount }}</div>
        <div class="stat-label">今日新增</div>
      </div>
    </div>

    <!-- 评论列表 -->
    <div class="comments-container">
      <div class="comments-header">
        <h3 class="comments-title">评论列表</h3>
        <div class="comments-actions">
          <button class="btn btn-sm" @click="refreshComments">
            <ArrowPathIcon class="btn-icon" />
            刷新
          </button>
          <button class="btn btn-sm btn-primary" @click="batchApprove" :disabled="selectedComments.length === 0">
            <CheckIcon class="btn-icon" />
            批量通过 ({{ selectedComments.length }})
          </button>
        </div>
      </div>
      
      <div class="comments-list">
        <div class="list-header">
          <label class="checkbox-container">
            <input 
              type="checkbox" 
              :checked="selectedComments.length === filteredComments.length && filteredComments.length > 0"
              @change="toggleSelectAll"
            />
            <span class="checkmark"></span>
          </label>
          <span class="header-text">全选</span>
        </div>
        
        <div v-for="comment in paginatedComments" :key="comment.id" class="comment-item">
          <div class="comment-header">
            <label class="checkbox-container">
              <input 
                type="checkbox" 
                :value="comment.id"
                v-model="selectedComments"
              />
              <span class="checkmark"></span>
            </label>
            
            <div class="comment-meta">
              <div class="user-info">
                <img :src="comment.user.avatar" :alt="comment.user.name" class="user-avatar" />
                <div class="user-details">
                  <div class="user-name">{{ comment.user.name }}</div>
                  <div class="comment-time">{{ formatDateTime(comment.createdAt) }}</div>
                </div>
              </div>
              
              <div class="comment-status">
                <div class="status-badge" :class="comment.status">
                  <component :is="getStatusIcon(comment.status)" class="status-icon" />
                  {{ getStatusText(comment.status) }}
                </div>
                <div v-if="comment.type === 'reply'" class="comment-type">回复</div>
              </div>
            </div>
          </div>
          
          <div class="comment-content">
            <div class="post-reference" v-if="comment.post">
              <span class="reference-label">评论于：</span>
              <a :href="`/community/posts/${comment.post.id}`" class="post-link">
                {{ comment.post.title }}
              </a>
            </div>
            
            <div v-if="comment.parentComment" class="parent-comment">
              <div class="parent-header">
                <UserIcon class="parent-icon" />
                <span class="parent-user">{{ comment.parentComment.user.name }}</span>
              </div>
              <div class="parent-content">{{ comment.parentComment.content }}</div>
            </div>
            
            <div class="comment-text">{{ comment.content }}</div>
            
            <div v-if="comment.images && comment.images.length > 0" class="comment-images">
              <img 
                v-for="image in comment.images" 
                :key="image.id" 
                :src="image.url" 
                :alt="image.alt"
                class="comment-image"
                @click="previewImage(image)"
              />
            </div>
          </div>
          
          <div class="comment-stats">
            <div class="stat-item">
              <HeartIcon class="stat-icon" />
              <span>{{ comment.likesCount }}</span>
            </div>
            <div class="stat-item">
              <ChatBubbleLeftIcon class="stat-icon" />
              <span>{{ comment.repliesCount }}</span>
            </div>
            <div v-if="comment.reportsCount > 0" class="stat-item warning">
              <ExclamationTriangleIcon class="stat-icon" />
              <span>{{ comment.reportsCount }} 举报</span>
            </div>
          </div>
          
          <div class="comment-actions">
            <button 
              v-if="comment.status === 'pending'" 
              class="action-btn approve" 
              @click="approveComment(comment)"
              title="通过"
            >
              <CheckIcon class="action-icon" />
            </button>
            <button 
              v-if="comment.status === 'pending'" 
              class="action-btn reject" 
              @click="rejectComment(comment)"
              title="拒绝"
            >
              <XMarkIcon class="action-icon" />
            </button>
            <button 
              v-if="comment.status === 'approved'" 
              class="action-btn hide" 
              @click="hideComment(comment)"
              title="隐藏"
            >
              <EyeSlashIcon class="action-icon" />
            </button>
            <button 
              class="action-btn view" 
              @click="viewCommentDetail(comment)"
              title="查看详情"
            >
              <EyeIcon class="action-icon" />
            </button>
            <button 
              class="action-btn delete" 
              @click="deleteComment(comment)"
              title="删除"
            >
              <TrashIcon class="action-icon" />
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

    <!-- 评论详情模态框 -->
    <div v-if="selectedComment" class="modal-overlay" @click="closeCommentModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>评论详情</h3>
          <button class="close-btn" @click="closeCommentModal">
            <XMarkIcon class="close-icon" />
          </button>
        </div>
        <div class="modal-body">
          <div class="comment-detail">
            <div class="detail-section">
              <h4>基本信息</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>评论ID</label>
                  <span>#{{ selectedComment.id }}</span>
                </div>
                <div class="detail-item">
                  <label>状态</label>
                  <div class="status-badge" :class="selectedComment.status">
                    {{ getStatusText(selectedComment.status) }}
                  </div>
                </div>
                <div class="detail-item">
                  <label>类型</label>
                  <span>{{ selectedComment.type === 'reply' ? '回复' : '评论' }}</span>
                </div>
                <div class="detail-item">
                  <label>发布时间</label>
                  <span>{{ formatDateTime(selectedComment.createdAt) }}</span>
                </div>
              </div>
            </div>
            
            <div class="detail-section">
              <h4>用户信息</h4>
              <div class="user-detail">
                <img :src="selectedComment.user.avatar" :alt="selectedComment.user.name" class="user-avatar-large" />
                <div class="user-info-detail">
                  <div class="user-name-large">{{ selectedComment.user.name }}</div>
                  <div class="user-email">{{ selectedComment.user.email }}</div>
                  <div class="user-stats">
                    <span>评论数: {{ selectedComment.user.commentsCount }}</span>
                    <span>获赞数: {{ selectedComment.user.likesReceived }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="detail-section">
              <h4>评论内容</h4>
              <div class="content-detail">
                <div class="comment-text-detail">{{ selectedComment.content }}</div>
                <div v-if="selectedComment.images && selectedComment.images.length > 0" class="comment-images-detail">
                  <img 
                    v-for="image in selectedComment.images" 
                    :key="image.id" 
                    :src="image.url" 
                    :alt="image.alt"
                    class="comment-image-detail"
                  />
                </div>
              </div>
            </div>
            
            <div v-if="selectedComment.reportsCount > 0" class="detail-section">
              <h4>举报信息</h4>
              <div class="reports-list">
                <div v-for="report in selectedComment.reports" :key="report.id" class="report-item">
                  <div class="report-user">{{ report.reporter.name }}</div>
                  <div class="report-reason">{{ report.reason }}</div>
                  <div class="report-time">{{ formatDateTime(report.createdAt) }}</div>
                </div>
              </div>
            </div>
          </div>
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
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ExclamationTriangleIcon,
  UserIcon,
  ClockIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon
} from '@heroicons/vue/24/outline'

// 响应式数据
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = 10
const selectedComment = ref(null)
const selectedComments = ref([])

const filters = ref({
  status: '',
  type: '',
  dateRange: ''
})

const commentStats = ref({
  total: 2847,
  pending: 23,
  reported: 8,
  todayCount: 156
})

const comments = ref([
  {
    id: 1,
    content: '这只小狗真的太可爱了！我也想领养一只。请问还有其他类似的狗狗吗？',
    type: 'comment',
    status: 'approved',
    user: {
      id: 1,
      name: '张小明',
      email: 'zhangxm@example.com',
      avatar: 'https://via.placeholder.com/40x40',
      commentsCount: 45,
      likesReceived: 128
    },
    post: {
      id: 1,
      title: '可爱的金毛寻回犬等待领养'
    },
    parentComment: null,
    likesCount: 12,
    repliesCount: 3,
    reportsCount: 0,
    images: [],
    reports: [],
    createdAt: new Date('2024-12-01 10:30:00')
  },
  {
    id: 2,
    content: '我之前领养过一只金毛，真的很温顺很聪明。建议你可以先去看看实际情况。',
    type: 'reply',
    status: 'approved',
    user: {
      id: 2,
      name: '李小红',
      email: 'lixh@example.com',
      avatar: 'https://via.placeholder.com/40x40',
      commentsCount: 23,
      likesReceived: 67
    },
    post: {
      id: 1,
      title: '可爱的金毛寻回犬等待领养'
    },
    parentComment: {
      id: 1,
      content: '这只小狗真的太可爱了！我也想领养一只。',
      user: {
        name: '张小明'
      }
    },
    likesCount: 8,
    repliesCount: 0,
    reportsCount: 0,
    images: [],
    reports: [],
    createdAt: new Date('2024-12-01 11:15:00')
  },
  {
    id: 3,
    content: '这个价格太贵了吧，其他地方都比这便宜很多。而且看起来也不是很健康的样子。',
    type: 'comment',
    status: 'pending',
    user: {
      id: 3,
      name: '王大力',
      email: 'wangdl@example.com',
      avatar: 'https://via.placeholder.com/40x40',
      commentsCount: 12,
      likesReceived: 5
    },
    post: {
      id: 2,
      title: '纯种波斯猫寻找新家'
    },
    parentComment: null,
    likesCount: 2,
    repliesCount: 1,
    reportsCount: 2,
    images: [],
    reports: [
      {
        id: 1,
        reporter: { name: '举报用户A' },
        reason: '恶意评价',
        createdAt: new Date('2024-12-01 12:00:00')
      },
      {
        id: 2,
        reporter: { name: '举报用户B' },
        reason: '不实信息',
        createdAt: new Date('2024-12-01 12:30:00')
      }
    ],
    createdAt: new Date('2024-12-01 09:45:00')
  },
  {
    id: 4,
    content: '太棒了！终于找到了合适的宠物用品，质量看起来很不错。',
    type: 'comment',
    status: 'approved',
    user: {
      id: 4,
      name: '陈小美',
      email: 'chenxm@example.com',
      avatar: 'https://via.placeholder.com/40x40',
      commentsCount: 78,
      likesReceived: 234
    },
    post: {
      id: 3,
      title: '高品质宠物用品推荐'
    },
    parentComment: null,
    likesCount: 15,
    repliesCount: 2,
    reportsCount: 0,
    images: [
      {
        id: 1,
        url: 'https://via.placeholder.com/200x150',
        alt: '宠物用品图片'
      }
    ],
    reports: [],
    createdAt: new Date('2024-11-30 16:20:00')
  }
])

// 计算属性
const filteredComments = computed(() => {
  let result = comments.value
  
  // 状态筛选
  if (filters.value.status) {
    result = result.filter(comment => comment.status === filters.value.status)
  }
  
  // 类型筛选
  if (filters.value.type) {
    result = result.filter(comment => comment.type === filters.value.type)
  }
  
  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(comment => 
      comment.content.toLowerCase().includes(query) ||
      comment.user.name.toLowerCase().includes(query)
    )
  }
  
  return result
})

const paginatedComments = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredComments.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredComments.value.length / pageSize)
})

// 方法
const getStatusIcon = (status) => {
  const iconMap = {
    approved: ShieldCheckIcon,
    pending: ClockIcon,
    rejected: ShieldExclamationIcon,
    reported: ExclamationTriangleIcon
  }
  return iconMap[status] || ClockIcon
}

const getStatusText = (status) => {
  const textMap = {
    approved: '已通过',
    pending: '待审核',
    rejected: '已拒绝',
    reported: '被举报'
  }
  return textMap[status] || '未知状态'
}

const formatDateTime = (date) => {
  return date.toLocaleString('zh-CN')
}

const toggleSelectAll = (event) => {
  if (event.target.checked) {
    selectedComments.value = filteredComments.value.map(comment => comment.id)
  } else {
    selectedComments.value = []
  }
}

const approveComment = (comment) => {
  console.log('通过评论:', comment.id)
  comment.status = 'approved'
}

const rejectComment = (comment) => {
  console.log('拒绝评论:', comment.id)
  comment.status = 'rejected'
}

const hideComment = (comment) => {
  console.log('隐藏评论:', comment.id)
  // 这里应该调用API隐藏评论
}

const deleteComment = (comment) => {
  if (confirm(`确定要删除这条评论吗？`)) {
    console.log('删除评论:', comment.id)
    const index = comments.value.findIndex(c => c.id === comment.id)
    if (index > -1) {
      comments.value.splice(index, 1)
    }
  }
}

const batchApprove = () => {
  if (selectedComments.value.length === 0) return
  
  if (confirm(`确定要批量通过 ${selectedComments.value.length} 条评论吗？`)) {
    selectedComments.value.forEach(commentId => {
      const comment = comments.value.find(c => c.id === commentId)
      if (comment) {
        comment.status = 'approved'
      }
    })
    selectedComments.value = []
  }
}

const viewCommentDetail = (comment) => {
  selectedComment.value = comment
}

const closeCommentModal = () => {
  selectedComment.value = null
}

const previewImage = (image) => {
  // 这里可以实现图片预览功能
  console.log('预览图片:', image.url)
}

const refreshComments = () => {
  console.log('刷新评论列表')
  // 这里应该重新加载评论数据
}

const exportComments = () => {
  console.log('导出评论数据')
  alert('导出功能开发中...')
}

const loadComments = async () => {
  try {
    // 这里应该调用实际的API
    console.log('加载评论列表')
  } catch (error) {
    console.error('加载评论列表失败:', error)
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadComments()
})
</script>

<style scoped>
.admin-comments {
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

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.75rem;
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

.comments-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.comments-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.comments-actions {
  display: flex;
  gap: 12px;
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

.comment-item {
  padding: 20px 24px;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.2s;
}

.comment-item:hover {
  background: #f9fafb;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 12px;
}

.comment-meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex: 1;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.user-name {
  font-weight: 500;
  color: #1f2937;
  font-size: 0.875rem;
}

.comment-time {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 2px;
}

.comment-status {
  display: flex;
  align-items: center;
  gap: 8px;
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

.status-badge.approved {
  background: #dcfce7;
  color: #166534;
}

.status-badge.pending {
  background: #fef3c7;
  color: #d97706;
}

.status-badge.rejected {
  background: #fee2e2;
  color: #dc2626;
}

.status-badge.reported {
  background: #fef2f2;
  color: #b91c1c;
}

.status-icon {
  width: 12px;
  height: 12px;
}

.comment-type {
  font-size: 0.75rem;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
}

.comment-content {
  margin-left: 34px;
  margin-bottom: 12px;
}

.post-reference {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 8px;
}

.reference-label {
  margin-right: 4px;
}

.post-link {
  color: #3b82f6;
  text-decoration: none;
}

.post-link:hover {
  text-decoration: underline;
}

.parent-comment {
  background: #f9fafb;
  border-left: 3px solid #e5e7eb;
  padding: 8px 12px;
  margin-bottom: 8px;
  border-radius: 0 6px 6px 0;
}

.parent-header {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}

.parent-icon {
  width: 12px;
  height: 12px;
  color: #6b7280;
}

.parent-user {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
}

.parent-content {
  font-size: 0.75rem;
  color: #6b7280;
  line-height: 1.4;
}

.comment-text {
  font-size: 0.875rem;
  color: #1f2937;
  line-height: 1.5;
  margin-bottom: 8px;
}

.comment-images {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.comment-image {
  width: 80px;
  height: 60px;
  border-radius: 6px;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.2s;
}

.comment-image:hover {
  transform: scale(1.05);
}

.comment-stats {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: 34px;
  margin-bottom: 12px;
}

.comment-stats .stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: #6b7280;
  background: none;
  padding: 0;
  box-shadow: none;
  border: none;
  text-align: left;
}

.comment-stats .stat-item.warning {
  color: #dc2626;
}

.stat-icon {
  width: 14px;
  height: 14px;
}

.comment-actions {
  display: flex;
  gap: 8px;
  margin-left: 34px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.approve {
  background: #dcfce7;
  color: #166534;
}

.action-btn.approve:hover {
  background: #bbf7d0;
}

.action-btn.reject {
  background: #fee2e2;
  color: #dc2626;
}

.action-btn.reject:hover {
  background: #fecaca;
}

.action-btn.hide {
  background: #f3f4f6;
  color: #6b7280;
}

.action-btn.hide:hover {
  background: #e5e7eb;
}

.action-btn.view {
  background: #dbeafe;
  color: #1e40af;
}

.action-btn.view:hover {
  background: #bfdbfe;
}

.action-btn.delete {
  background: #fee2e2;
  color: #dc2626;
}

.action-btn.delete:hover {
  background: #fecaca;
}

.action-icon {
  width: 16px;
  height: 16px;
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
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
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
  max-height: calc(90vh - 80px);
  overflow-y: auto;
}

.comment-detail {
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

.user-detail {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-avatar-large {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.user-name-large {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.user-email {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 8px;
}

.user-stats {
  display: flex;
  gap: 16px;
  font-size: 0.75rem;
  color: #6b7280;
}

.comment-text-detail {
  font-size: 1rem;
  color: #1f2937;
  line-height: 1.6;
  margin-bottom: 16px;
}

.comment-images-detail {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.comment-image-detail {
  width: 120px;
  height: 90px;
  border-radius: 8px;
  object-fit: cover;
}

.reports-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.report-item {
  padding: 12px;
  background: #fef2f2;
  border-radius: 8px;
  border-left: 3px solid #dc2626;
}

.report-user {
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 4px;
}

.report-reason {
  color: #dc2626;
  margin-bottom: 4px;
}

.report-time {
  font-size: 0.75rem;
  color: #6b7280;
}

@media (max-width: 768px) {
  .admin-comments {
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
  
  .comment-meta {
    flex-direction: column;
    gap: 8px;
  }
  
  .comment-content,
  .comment-stats,
  .comment-actions {
    margin-left: 0;
  }
  
  .modal {
    width: 95%;
    margin: 20px;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>