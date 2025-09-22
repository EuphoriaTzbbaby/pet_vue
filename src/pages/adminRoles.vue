<template>
  <div class="admin-roles">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">角色权限管理</h1>
        <p class="page-subtitle">管理系统角色和权限配置</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="showAddRoleModal = true">
          <PlusIcon class="btn-icon" />
          添加角色
        </button>
      </div>
    </div>

    <!-- 角色列表 -->
    <div class="roles-grid">
      <div v-for="role in roles" :key="role.id" class="role-card">
        <div class="role-header">
          <div class="role-info">
            <h3 class="role-name">{{ role.name }}</h3>
            <p class="role-description">{{ role.description }}</p>
          </div>
          <div class="role-actions">
            <button class="action-btn edit" @click="editRole(role)" title="编辑">
              <PencilIcon class="action-icon" />
            </button>
            <button class="action-btn delete" @click="deleteRole(role)" title="删除" :disabled="role.isSystem">
              <TrashIcon class="action-icon" />
            </button>
          </div>
        </div>
        
        <div class="role-stats">
          <div class="stat-item">
            <span class="stat-number">{{ role.userCount }}</span>
            <span class="stat-label">用户数</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ role.permissions.length }}</span>
            <span class="stat-label">权限数</span>
          </div>
        </div>

        <div class="role-permissions">
          <h4 class="permissions-title">权限列表</h4>
          <div class="permissions-list">
            <span v-for="permission in role.permissions" :key="permission" class="permission-tag">
              {{ getPermissionText(permission) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑角色模态框 -->
    <div v-if="showAddRoleModal || editingRole" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ editingRole ? '编辑角色' : '添加角色' }}</h3>
          <button class="close-btn" @click="closeModal">
            <XMarkIcon class="close-icon" />
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveRole">
            <div class="form-group">
              <label>角色名称</label>
              <input v-model="roleForm.name" type="text" required />
            </div>
            <div class="form-group">
              <label>角色描述</label>
              <textarea v-model="roleForm.description" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label>权限配置</label>
              <div class="permissions-grid">
                <div v-for="permission in availablePermissions" :key="permission.key" class="permission-item">
                  <label class="permission-label">
                    <input 
                      type="checkbox" 
                      :value="permission.key"
                      v-model="roleForm.permissions"
                    />
                    <span class="permission-name">{{ permission.name }}</span>
                    <span class="permission-desc">{{ permission.description }}</span>
                  </label>
                </div>
              </div>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="closeModal">
                取消
              </button>
              <button type="submit" class="btn btn-primary">
                {{ editingRole ? '更新' : '创建' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

// 响应式数据
const roles = ref([])
const showAddRoleModal = ref(false)
const editingRole = ref(null)
const roleForm = ref({
  name: '',
  description: '',
  permissions: []
})

// 可用权限列表
const availablePermissions = ref([
  { key: 'user.view', name: '查看用户', description: '查看用户列表和详情' },
  { key: 'user.create', name: '创建用户', description: '创建新用户账户' },
  { key: 'user.edit', name: '编辑用户', description: '编辑用户信息' },
  { key: 'user.delete', name: '删除用户', description: '删除用户账户' },
  { key: 'pet.view', name: '查看宠物', description: '查看宠物列表和详情' },
  { key: 'pet.create', name: '添加宠物', description: '添加新宠物信息' },
  { key: 'pet.edit', name: '编辑宠物', description: '编辑宠物信息' },
  { key: 'pet.delete', name: '删除宠物', description: '删除宠物信息' },
  { key: 'adoption.view', name: '查看领养', description: '查看领养申请和合同' },
  { key: 'adoption.approve', name: '审核领养', description: '审核领养申请' },
  { key: 'adoption.manage', name: '管理领养', description: '管理领养流程' },
  { key: 'product.view', name: '查看商品', description: '查看商品列表和详情' },
  { key: 'product.create', name: '添加商品', description: '添加新商品' },
  { key: 'product.edit', name: '编辑商品', description: '编辑商品信息' },
  { key: 'product.delete', name: '删除商品', description: '删除商品' },
  { key: 'community.view', name: '查看社区', description: '查看社区帖子和评论' },
  { key: 'community.moderate', name: '社区管理', description: '管理社区内容和用户' },
  { key: 'system.config', name: '系统配置', description: '修改系统配置' },
  { key: 'system.logs', name: '系统日志', description: '查看系统日志' },
  { key: 'system.backup', name: '系统备份', description: '执行系统备份和恢复' }
])

// 方法
const loadRoles = async () => {
  try {
    // 这里应该调用实际的API
    // 暂时使用模拟数据
    roles.value = [
      {
        id: 1,
        name: '超级管理员',
        description: '拥有系统所有权限的管理员角色',
        userCount: 2,
        isSystem: true,
        permissions: availablePermissions.value.map(p => p.key)
      },
      {
        id: 2,
        name: '机构管理员',
        description: '管理机构相关功能的角色',
        userCount: 15,
        isSystem: false,
        permissions: [
          'pet.view', 'pet.create', 'pet.edit', 'pet.delete',
          'adoption.view', 'adoption.approve', 'adoption.manage',
          'community.view', 'community.moderate'
        ]
      },
      {
        id: 3,
        name: '普通用户',
        description: '基础的用户权限角色',
        userCount: 1230,
        isSystem: true,
        permissions: [
          'pet.view', 'adoption.view', 'product.view', 'community.view'
        ]
      }
    ]
  } catch (error) {
    console.error('加载角色列表失败:', error)
  }
}

const getPermissionText = (permissionKey) => {
  const permission = availablePermissions.value.find(p => p.key === permissionKey)
  return permission ? permission.name : permissionKey
}

const editRole = (role) => {
  editingRole.value = role
  roleForm.value = {
    name: role.name,
    description: role.description,
    permissions: [...role.permissions]
  }
}

const closeModal = () => {
  showAddRoleModal.value = false
  editingRole.value = null
  roleForm.value = {
    name: '',
    description: '',
    permissions: []
  }
}

const saveRole = async () => {
  try {
    if (editingRole.value) {
      // 更新角色
      console.log('更新角色:', roleForm.value)
    } else {
      // 创建角色
      console.log('创建角色:', roleForm.value)
    }
    closeModal()
    await loadRoles()
  } catch (error) {
    console.error('保存角色失败:', error)
  }
}

const deleteRole = async (role) => {
  if (role.isSystem) {
    alert('系统角色不能删除')
    return
  }
  
  if (confirm(`确定要删除角色 "${role.name}" 吗？`)) {
    try {
      console.log('删除角色:', role.name)
      await loadRoles()
    } catch (error) {
      console.error('删除角色失败:', error)
    }
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadRoles()
})
</script>

<style scoped>
.admin-roles {
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

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.role-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: transform 0.2s, box-shadow 0.2s;
}

.role-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.role-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.role-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.role-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.role-actions {
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

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.edit {
  background: #dbeafe;
  color: #1e40af;
}

.action-btn.edit:hover:not(:disabled) {
  background: #bfdbfe;
}

.action-btn.delete {
  background: #fee2e2;
  color: #dc2626;
}

.action-btn.delete:hover:not(:disabled) {
  background: #fecaca;
}

.action-icon {
  width: 16px;
  height: 16px;
}

.role-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.permissions-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.permissions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.permission-tag {
  padding: 4px 8px;
  background: #e0f2fe;
  color: #0369a1;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
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
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  resize: vertical;
}

.permissions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

.permission-item {
  padding: 8px;
  border-radius: 6px;
  transition: background 0.2s;
}

.permission-item:hover {
  background: #f9fafb;
}

.permission-label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
}

.permission-label input[type="checkbox"] {
  width: auto;
  margin-bottom: 4px;
}

.permission-name {
  font-weight: 500;
  color: #1f2937;
}

.permission-desc {
  font-size: 0.75rem;
  color: #6b7280;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

@media (max-width: 768px) {
  .admin-roles {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .roles-grid {
    grid-template-columns: 1fr;
  }
  
  .role-stats {
    flex-direction: column;
    gap: 12px;
  }
  
  .permissions-grid {
    grid-template-columns: 1fr;
  }
}
</style>