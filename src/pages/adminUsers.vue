<template>
  <div class="admin-users">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">用户管理</h1>
        <p class="page-subtitle">管理系统中的所有用户账户</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="showAddUserModal = true">
          <PlusIcon class="btn-icon" />
          添加用户
        </button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filters">
      <div class="search-box">
        <MagnifyingGlassIcon class="search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索用户名、邮箱或手机号..."
          class="search-input"
        />
      </div>
      <select v-model="selectedRole" class="filter-select">
        <option value="">所有角色</option>
        <option value="admin">管理员</option>
        <option value="organization">机构</option>
        <option value="adopter">领养者</option>
      </select>
      <select v-model="selectedStatus" class="filter-select">
        <option value="">所有状态</option>
        <option value="active">活跃</option>
        <option value="inactive">非活跃</option>
        <option value="banned">已封禁</option>
      </select>
    </div>

    <!-- 用户列表 -->
    <div class="users-table-container">
      <table class="users-table">
        <thead>
          <tr>
            <th>用户信息</th>
            <th>角色</th>
            <th>注册时间</th>
            <th>最后登录</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id" class="user-row">
            <td class="user-info">
              <div class="user-avatar">
                <img :src="user.avatar || '/default-avatar.png'" :alt="user.username" />
              </div>
              <div class="user-details">
                <div class="user-name">{{ user.username }}</div>
                <div class="user-email">{{ user.email }}</div>
                <div class="user-phone" v-if="user.phone">{{ user.phone }}</div>
              </div>
            </td>
            <td>
              <span class="role-badge" :class="user.role">
                {{ getRoleText(user.role) }}
              </span>
            </td>
            <td class="date-cell">{{ formatDate(user.createdAt) }}</td>
            <td class="date-cell">{{ formatDate(user.lastLoginAt) }}</td>
            <td>
              <span class="status-badge" :class="user.status">
                {{ getStatusText(user.status) }}
              </span>
            </td>
            <td class="actions-cell">
              <button class="action-btn edit" @click="editUser(user)" title="编辑">
                <PencilIcon class="action-icon" />
              </button>
              <button 
                class="action-btn" 
                :class="user.status === 'banned' ? 'unban' : 'ban'"
                @click="toggleUserStatus(user)"
                :title="user.status === 'banned' ? '解封' : '封禁'"
              >
                <component :is="user.status === 'banned' ? CheckIcon : XMarkIcon" class="action-icon" />
              </button>
              <button class="action-btn delete" @click="deleteUser(user)" title="删除">
                <TrashIcon class="action-icon" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <button 
        class="page-btn" 
        :disabled="currentPage === 1"
        @click="currentPage--"
      >
        上一页
      </button>
      <span class="page-info">
        第 {{ currentPage }} 页，共 {{ totalPages }} 页
      </span>
      <button 
        class="page-btn" 
        :disabled="currentPage === totalPages"
        @click="currentPage++"
      >
        下一页
      </button>
    </div>

    <!-- 添加/编辑用户模态框 -->
    <div v-if="showAddUserModal || editingUser" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ editingUser ? '编辑用户' : '添加用户' }}</h3>
          <button class="close-btn" @click="closeModal">
            <XMarkIcon class="close-icon" />
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveUser">
            <div class="form-group">
              <label>用户名</label>
              <input v-model="userForm.username" type="text" required />
            </div>
            <div class="form-group">
              <label>邮箱</label>
              <input v-model="userForm.email" type="email" required />
            </div>
            <div class="form-group">
              <label>手机号</label>
              <input v-model="userForm.phone" type="tel" />
            </div>
            <div class="form-group">
              <label>角色</label>
              <select v-model="userForm.role" required>
                <option value="adopter">领养者</option>
                <option value="organization">机构</option>
                <option value="admin">管理员</option>
              </select>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="closeModal">
                取消
              </button>
              <button type="submit" class="btn btn-primary">
                {{ editingUser ? '更新' : '创建' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/vue/24/outline'

// 响应式数据
const users = ref([])
const searchQuery = ref('')
const selectedRole = ref('')
const selectedStatus = ref('')
const currentPage = ref(1)
const pageSize = 10
const showAddUserModal = ref(false)
const editingUser = ref(null)
const userForm = ref({
  username: '',
  email: '',
  phone: '',
  role: 'adopter'
})

// 计算属性
const filteredUsers = computed(() => {
  let filtered = users.value
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user => 
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.phone && user.phone.includes(query))
    )
  }
  
  if (selectedRole.value) {
    filtered = filtered.filter(user => user.role === selectedRole.value)
  }
  
  if (selectedStatus.value) {
    filtered = filtered.filter(user => user.status === selectedStatus.value)
  }
  
  const start = (currentPage.value - 1) * pageSize
  return filtered.slice(start, start + pageSize)
})

const totalPages = computed(() => {
  let filtered = users.value
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user => 
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.phone && user.phone.includes(query))
    )
  }
  
  if (selectedRole.value) {
    filtered = filtered.filter(user => user.role === selectedRole.value)
  }
  
  if (selectedStatus.value) {
    filtered = filtered.filter(user => user.status === selectedStatus.value)
  }
  
  return Math.ceil(filtered.length / pageSize)
})

// 方法
const loadUsers = async () => {
  try {
    // 这里应该调用实际的API
    // 暂时使用模拟数据
    users.value = [
      {
        id: 1,
        username: '张三',
        email: 'zhangsan@example.com',
        phone: '13800138001',
        role: 'adopter',
        status: 'active',
        avatar: null,
        createdAt: new Date('2024-01-15'),
        lastLoginAt: new Date('2024-01-20')
      },
      {
        id: 2,
        username: '李四',
        email: 'lisi@example.com',
        phone: '13800138002',
        role: 'organization',
        status: 'active',
        avatar: null,
        createdAt: new Date('2024-01-10'),
        lastLoginAt: new Date('2024-01-19')
      },
      {
        id: 3,
        username: '王五',
        email: 'wangwu@example.com',
        phone: '13800138003',
        role: 'admin',
        status: 'banned',
        avatar: null,
        createdAt: new Date('2024-01-05'),
        lastLoginAt: new Date('2024-01-18')
      }
    ]
  } catch (error) {
    console.error('加载用户列表失败:', error)
  }
}

const getRoleText = (role) => {
  const roleMap = {
    admin: '管理员',
    organization: '机构',
    adopter: '领养者'
  }
  return roleMap[role] || role
}

const getStatusText = (status) => {
  const statusMap = {
    active: '活跃',
    inactive: '非活跃',
    banned: '已封禁'
  }
  return statusMap[status] || status
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

const editUser = (user) => {
  editingUser.value = user
  userForm.value = {
    username: user.username,
    email: user.email,
    phone: user.phone || '',
    role: user.role
  }
}

const closeModal = () => {
  showAddUserModal.value = false
  editingUser.value = null
  userForm.value = {
    username: '',
    email: '',
    phone: '',
    role: 'adopter'
  }
}

const saveUser = async () => {
  try {
    if (editingUser.value) {
      // 更新用户
      console.log('更新用户:', userForm.value)
    } else {
      // 创建用户
      console.log('创建用户:', userForm.value)
    }
    closeModal()
    await loadUsers()
  } catch (error) {
    console.error('保存用户失败:', error)
  }
}

const toggleUserStatus = async (user) => {
  try {
    const newStatus = user.status === 'banned' ? 'active' : 'banned'
    console.log(`${newStatus === 'banned' ? '封禁' : '解封'}用户:`, user.username)
    user.status = newStatus
  } catch (error) {
    console.error('更新用户状态失败:', error)
  }
}

const deleteUser = async (user) => {
  if (confirm(`确定要删除用户 "${user.username}" 吗？`)) {
    try {
      console.log('删除用户:', user.username)
      await loadUsers()
    } catch (error) {
      console.error('删除用户失败:', error)
    }
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.admin-users {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
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

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.filters {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #9ca3af;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
}

.filter-select {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
}

.users-table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th {
  background: #f9fafb;
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.users-table td {
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
}

.user-row:hover {
  background: #f9fafb;
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
  overflow: hidden;
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  font-weight: 600;
  color: #1f2937;
}

.user-email {
  font-size: 0.875rem;
  color: #6b7280;
}

.user-phone {
  font-size: 0.875rem;
  color: #9ca3af;
}

.role-badge, .status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.role-badge.admin {
  background: #fef3c7;
  color: #92400e;
}

.role-badge.organization {
  background: #dbeafe;
  color: #1e40af;
}

.role-badge.adopter {
  background: #dcfce7;
  color: #166534;
}

.status-badge.active {
  background: #dcfce7;
  color: #166534;
}

.status-badge.inactive {
  background: #f3f4f6;
  color: #6b7280;
}

.status-badge.banned {
  background: #fee2e2;
  color: #dc2626;
}

.date-cell {
  font-size: 0.875rem;
  color: #6b7280;
}

.actions-cell {
  display: flex;
  gap: 8px;
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

.action-btn.edit {
  background: #dbeafe;
  color: #1e40af;
}

.action-btn.edit:hover {
  background: #bfdbfe;
}

.action-btn.ban {
  background: #fee2e2;
  color: #dc2626;
}

.action-btn.ban:hover {
  background: #fecaca;
}

.action-btn.unban {
  background: #dcfce7;
  color: #166534;
}

.action-btn.unban:hover {
  background: #bbf7d0;
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
  margin-top: 24px;
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #f3f4f6;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
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
  max-width: 500px;
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
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

@media (max-width: 768px) {
  .admin-users {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .filters {
    flex-direction: column;
  }
  
  .search-box {
    min-width: auto;
  }
  
  .users-table-container {
    overflow-x: auto;
  }
  
  .users-table {
    min-width: 800px;
  }
}
</style>