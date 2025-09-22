<template>
  <div class="adoption-contracts">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="fas fa-file-contract"></i>
          领养合同管理
        </h1>
        <p class="page-description">管理领养合同的签署、执行和归档</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="createContract">
          <i class="fas fa-plus"></i>
          新建合同
        </button>
        <button class="btn btn-outline" @click="refreshContracts">
          <i class="fas fa-sync-alt"></i>
          刷新
        </button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card draft">
        <div class="stat-icon">
          <i class="fas fa-edit"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.draft }}</h3>
          <p>草稿合同</p>
        </div>
      </div>
      <div class="stat-card pending">
        <div class="stat-icon">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.pending }}</h3>
          <p>待签署</p>
        </div>
      </div>
      <div class="stat-card signed">
        <div class="stat-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.signed }}</h3>
          <p>已签署</p>
        </div>
      </div>
      <div class="stat-card completed">
        <div class="stat-icon">
          <i class="fas fa-archive"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.completed }}</h3>
          <p>已完成</p>
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
            placeholder="搜索合同编号、领养人姓名或宠物名称..."
            @input="handleSearch"
          >
        </div>
        <div class="filter-controls">
          <select v-model="statusFilter" @change="handleFilter">
            <option value="">全部状态</option>
            <option value="draft">草稿</option>
            <option value="pending">待签署</option>
            <option value="signed">已签署</option>
            <option value="completed">已完成</option>
            <option value="terminated">已终止</option>
          </select>
          <select v-model="dateFilter" @change="handleFilter">
            <option value="">全部时间</option>
            <option value="today">今天</option>
            <option value="week">本周</option>
            <option value="month">本月</option>
            <option value="quarter">本季度</option>
          </select>
          <select v-model="sortBy" @change="handleSort">
            <option value="createdAt">创建时间</option>
            <option value="signedAt">签署时间</option>
            <option value="contractNumber">合同编号</option>
            <option value="adopter">领养人</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 合同列表 -->
    <div class="contracts-list">
      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>加载中...</p>
      </div>
      
      <div v-else-if="filteredContracts.length === 0" class="empty-state">
        <i class="fas fa-file-contract"></i>
        <h3>暂无合同记录</h3>
        <p>当前没有符合条件的领养合同</p>
        <button class="btn btn-primary" @click="createContract">
          <i class="fas fa-plus"></i>
          创建第一个合同
        </button>
      </div>

      <div v-else class="contract-cards">
        <div 
          v-for="contract in filteredContracts" 
          :key="contract.id"
          class="contract-card"
          :class="`status-${contract.status}`"
        >
          <div class="card-header">
            <div class="contract-info">
              <div class="contract-number">
                <span class="label">合同编号</span>
                <span class="number">{{ contract.contractNumber }}</span>
              </div>
              <div class="contract-meta">
                <span class="created-date">{{ formatDate(contract.createdAt) }}</span>
              </div>
            </div>
            <div class="status-badge" :class="`status-${contract.status}`">
              {{ getStatusText(contract.status) }}
            </div>
          </div>

          <div class="card-content">
            <div class="parties-info">
              <div class="party adopter">
                <h5>
                  <i class="fas fa-user"></i>
                  领养人
                </h5>
                <p class="name">{{ contract.adopterName }}</p>
                <p class="contact">{{ contract.adopterPhone }}</p>
              </div>
              <div class="party pet">
                <h5>
                  <i class="fas fa-paw"></i>
                  宠物信息
                </h5>
                <p class="name">{{ contract.petName }}</p>
                <p class="details">{{ contract.petBreed }} · {{ contract.petAge }}岁</p>
              </div>
            </div>

            <div class="contract-details">
              <div class="detail-row">
                <div class="detail-item">
                  <span class="label">合同类型：</span>
                  <span class="value">{{ getContractTypeText(contract.contractType) }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">领养费用：</span>
                  <span class="value">¥{{ contract.adoptionFee }}</span>
                </div>
              </div>
              <div v-if="contract.signedAt" class="detail-row">
                <div class="detail-item">
                  <span class="label">签署时间：</span>
                  <span class="value">{{ formatDate(contract.signedAt) }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">有效期至：</span>
                  <span class="value">{{ formatDate(contract.expiresAt) }}</span>
                </div>
              </div>
              <div v-if="contract.notes" class="detail-row full-width">
                <div class="detail-item">
                  <span class="label">备注：</span>
                  <span class="value">{{ contract.notes }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="card-actions">
            <button 
              class="btn btn-outline"
              @click="viewContract(contract)"
            >
              <i class="fas fa-eye"></i>
              查看详情
            </button>
            
            <div class="action-buttons">
              <button 
                v-if="contract.status === 'draft'"
                class="btn btn-primary"
                @click="editContract(contract)"
              >
                <i class="fas fa-edit"></i>
                编辑
              </button>
              
              <button 
                v-if="contract.status === 'draft'"
                class="btn btn-success"
                @click="sendForSigning(contract.id)"
              >
                <i class="fas fa-paper-plane"></i>
                发送签署
              </button>
              
              <button 
                v-if="contract.status === 'pending'"
                class="btn btn-success"
                @click="markAsSigned(contract.id)"
              >
                <i class="fas fa-signature"></i>
                标记已签署
              </button>
              
              <button 
                v-if="contract.status === 'signed'"
                class="btn btn-info"
                @click="completeContract(contract.id)"
              >
                <i class="fas fa-check-double"></i>
                完成合同
              </button>
              
              <button 
                v-if="['draft', 'pending', 'signed'].includes(contract.status)"
                class="btn btn-danger"
                @click="terminateContract(contract.id)"
              >
                <i class="fas fa-ban"></i>
                终止
              </button>
              
              <button 
                class="btn btn-outline"
                @click="downloadContract(contract)"
              >
                <i class="fas fa-download"></i>
                下载
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

    <!-- 合同详情模态框 -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>合同详情 - {{ selectedContract?.contractNumber }}</h3>
          <button class="close-btn" @click="closeDetailModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div v-if="selectedContract" class="modal-body">
          <div class="contract-preview">
            <!-- 合同基本信息 -->
            <div class="section">
              <h4>基本信息</h4>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">合同编号：</span>
                  <span class="value">{{ selectedContract.contractNumber }}</span>
                </div>
                <div class="info-item">
                  <span class="label">合同状态：</span>
                  <span class="value status" :class="`status-${selectedContract.status}`">
                    {{ getStatusText(selectedContract.status) }}
                  </span>
                </div>
                <div class="info-item">
                  <span class="label">合同类型：</span>
                  <span class="value">{{ getContractTypeText(selectedContract.contractType) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">创建时间：</span>
                  <span class="value">{{ formatDate(selectedContract.createdAt) }}</span>
                </div>
              </div>
            </div>
            
            <!-- 当事人信息 -->
            <div class="section">
              <h4>当事人信息</h4>
              <div class="parties-detail">
                <div class="party-detail">
                  <h5>领养人信息</h5>
                  <div class="info-grid">
                    <div class="info-item">
                      <span class="label">姓名：</span>
                      <span class="value">{{ selectedContract.adopterName }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">电话：</span>
                      <span class="value">{{ selectedContract.adopterPhone }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">邮箱：</span>
                      <span class="value">{{ selectedContract.adopterEmail }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">身份证号：</span>
                      <span class="value">{{ selectedContract.adopterIdCard }}</span>
                    </div>
                    <div class="info-item full">
                      <span class="label">地址：</span>
                      <span class="value">{{ selectedContract.adopterAddress }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="party-detail">
                  <h5>宠物信息</h5>
                  <div class="info-grid">
                    <div class="info-item">
                      <span class="label">宠物名称：</span>
                      <span class="value">{{ selectedContract.petName }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">品种：</span>
                      <span class="value">{{ selectedContract.petBreed }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">年龄：</span>
                      <span class="value">{{ selectedContract.petAge }}岁</span>
                    </div>
                    <div class="info-item">
                      <span class="label">性别：</span>
                      <span class="value">{{ selectedContract.petGender }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">芯片号：</span>
                      <span class="value">{{ selectedContract.petChipId || '无' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 合同条款 -->
            <div class="section">
              <h4>合同条款</h4>
              <div class="contract-terms">
                <div class="term-item">
                  <span class="label">领养费用：</span>
                  <span class="value">¥{{ selectedContract.adoptionFee }}</span>
                </div>
                <div class="term-item">
                  <span class="label">试养期：</span>
                  <span class="value">{{ selectedContract.trialPeriod }}天</span>
                </div>
                <div class="term-item">
                  <span class="label">回访频率：</span>
                  <span class="value">{{ selectedContract.followUpFrequency }}</span>
                </div>
                <div v-if="selectedContract.specialTerms" class="term-item full">
                  <span class="label">特殊条款：</span>
                  <span class="value">{{ selectedContract.specialTerms }}</span>
                </div>
              </div>
            </div>
            
            <!-- 签署信息 -->
            <div v-if="selectedContract.signedAt" class="section">
              <h4>签署信息</h4>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">签署时间：</span>
                  <span class="value">{{ formatDate(selectedContract.signedAt) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">签署方式：</span>
                  <span class="value">{{ selectedContract.signMethod }}</span>
                </div>
                <div class="info-item">
                  <span class="label">有效期至：</span>
                  <span class="value">{{ formatDate(selectedContract.expiresAt) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="closeDetailModal">
            关闭
          </button>
          <div class="action-buttons">
            <button 
              v-if="selectedContract?.status === 'draft'"
              class="btn btn-primary"
              @click="editContract(selectedContract)"
            >
              <i class="fas fa-edit"></i>
              编辑合同
            </button>
            <button 
              class="btn btn-info"
              @click="downloadContract(selectedContract)"
            >
              <i class="fas fa-download"></i>
              下载合同
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 新建/编辑合同模态框 -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>{{ editingContract?.id ? '编辑合同' : '新建合同' }}</h3>
          <button class="close-btn" @click="closeEditModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveContract">
            <div class="form-sections">
              <!-- 基本信息 -->
              <div class="form-section">
                <h4>基本信息</h4>
                <div class="form-grid">
                  <div class="form-group">
                    <label>合同类型</label>
                    <select v-model="editingContract.contractType" required>
                      <option value="standard">标准领养合同</option>
                      <option value="trial">试养合同</option>
                      <option value="foster">寄养合同</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>领养费用</label>
                    <input 
                      v-model.number="editingContract.adoptionFee" 
                      type="number" 
                      min="0" 
                      step="0.01"
                      required
                    >
                  </div>
                </div>
              </div>
              
              <!-- 领养人信息 -->
              <div class="form-section">
                <h4>领养人信息</h4>
                <div class="form-grid">
                  <div class="form-group">
                    <label>姓名</label>
                    <input v-model="editingContract.adopterName" type="text" required>
                  </div>
                  <div class="form-group">
                    <label>电话</label>
                    <input v-model="editingContract.adopterPhone" type="tel" required>
                  </div>
                  <div class="form-group">
                    <label>邮箱</label>
                    <input v-model="editingContract.adopterEmail" type="email" required>
                  </div>
                  <div class="form-group">
                    <label>身份证号</label>
                    <input v-model="editingContract.adopterIdCard" type="text" required>
                  </div>
                  <div class="form-group full">
                    <label>地址</label>
                    <input v-model="editingContract.adopterAddress" type="text" required>
                  </div>
                </div>
              </div>
              
              <!-- 宠物信息 -->
              <div class="form-section">
                <h4>宠物信息</h4>
                <div class="form-grid">
                  <div class="form-group">
                    <label>宠物名称</label>
                    <input v-model="editingContract.petName" type="text" required>
                  </div>
                  <div class="form-group">
                    <label>品种</label>
                    <input v-model="editingContract.petBreed" type="text" required>
                  </div>
                  <div class="form-group">
                    <label>年龄</label>
                    <input v-model.number="editingContract.petAge" type="number" min="0" required>
                  </div>
                  <div class="form-group">
                    <label>性别</label>
                    <select v-model="editingContract.petGender" required>
                      <option value="male">雄性</option>
                      <option value="female">雌性</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>芯片号</label>
                    <input v-model="editingContract.petChipId" type="text">
                  </div>
                </div>
              </div>
              
              <!-- 合同条款 -->
              <div class="form-section">
                <h4>合同条款</h4>
                <div class="form-grid">
                  <div class="form-group">
                    <label>试养期（天）</label>
                    <input v-model.number="editingContract.trialPeriod" type="number" min="0" required>
                  </div>
                  <div class="form-group">
                    <label>回访频率</label>
                    <select v-model="editingContract.followUpFrequency" required>
                      <option value="weekly">每周</option>
                      <option value="monthly">每月</option>
                      <option value="quarterly">每季度</option>
                    </select>
                  </div>
                  <div class="form-group full">
                    <label>特殊条款</label>
                    <textarea v-model="editingContract.specialTerms" rows="3"></textarea>
                  </div>
                  <div class="form-group full">
                    <label>备注</label>
                    <textarea v-model="editingContract.notes" rows="2"></textarea>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="closeEditModal">
            取消
          </button>
          <button class="btn btn-primary" @click="saveContract">
            <i class="fas fa-save"></i>
            保存合同
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import * as adoptionContractsApi from '../api/adoptionContractsApi'

// 响应式数据
const loading = ref(false)
const contracts = ref([])
const searchQuery = ref('')
const statusFilter = ref('')
const dateFilter = ref('')
const sortBy = ref('createdAt')
const currentPage = ref(1)
const pageSize = ref(10)
const showDetailModal = ref(false)
const showEditModal = ref(false)
const selectedContract = ref(null)
const editingContract = ref({})

// 统计数据
const stats = computed(() => {
  const draft = contracts.value.filter(contract => contract.status === 'draft').length
  const pending = contracts.value.filter(contract => contract.status === 'pending').length
  const signed = contracts.value.filter(contract => contract.status === 'signed').length
  const completed = contracts.value.filter(contract => contract.status === 'completed').length
  
  return { draft, pending, signed, completed }
})

// 筛选和排序后的合同列表
const filteredContracts = computed(() => {
  let filtered = [...contracts.value]
  
  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(contract => 
      contract.contractNumber.toLowerCase().includes(query) ||
      contract.adopterName.toLowerCase().includes(query) ||
      contract.petName.toLowerCase().includes(query)
    )
  }
  
  // 状态筛选
  if (statusFilter.value) {
    filtered = filtered.filter(contract => contract.status === statusFilter.value)
  }
  
  // 时间筛选
  if (dateFilter.value) {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    filtered = filtered.filter(contract => {
      const contractDate = new Date(contract.createdAt)
      
      switch (dateFilter.value) {
        case 'today':
          return contractDate >= today
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          return contractDate >= weekAgo
        case 'month':
          const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
          return contractDate >= monthAgo
        case 'quarter':
          const quarterAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate())
          return contractDate >= quarterAgo
        default:
          return true
      }
    })
  }
  
  // 排序
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'createdAt':
        return new Date(b.createdAt) - new Date(a.createdAt)
      case 'signedAt':
        return new Date(b.signedAt || 0) - new Date(a.signedAt || 0)
      case 'contractNumber':
        return a.contractNumber.localeCompare(b.contractNumber)
      case 'adopter':
        return a.adopterName.localeCompare(b.adopterName)
      default:
        return 0
    }
  })
  
  // 分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filtered.slice(start, end)
})

// 总页数
const totalPages = computed(() => {
  const total = contracts.value.length
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
const loadContracts = async () => {
  try {
    loading.value = true
    const response = await adoptionContractsApi.getAllContracts()
    contracts.value = response.data || []
  } catch (error) {
    console.error('加载合同列表失败:', error)
  } finally {
    loading.value = false
  }
}

const refreshContracts = () => {
  loadContracts()
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleFilter = () => {
  currentPage.value = 1
}

const handleSort = () => {
  currentPage.value = 1
}

const changePage = (page) => {
  currentPage.value = page
}

const viewContract = (contract) => {
  selectedContract.value = contract
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedContract.value = null
}

const createContract = () => {
  editingContract.value = {
    contractType: 'standard',
    adoptionFee: 0,
    trialPeriod: 7,
    followUpFrequency: 'monthly',
    adopterName: '',
    adopterPhone: '',
    adopterEmail: '',
    adopterIdCard: '',
    adopterAddress: '',
    petName: '',
    petBreed: '',
    petAge: 1,
    petGender: 'male',
    petChipId: '',
    specialTerms: '',
    notes: ''
  }
  showEditModal.value = true
}

const editContract = (contract) => {
  editingContract.value = { ...contract }
  showEditModal.value = true
  if (showDetailModal.value) {
    closeDetailModal()
  }
}

const closeEditModal = () => {
  showEditModal.value = false
  editingContract.value = {}
}

const saveContract = async () => {
  try {
    if (editingContract.value.id) {
      await adoptionContractsApi.updateContract(editingContract.value)
    } else {
      await adoptionContractsApi.createContract(editingContract.value)
    }
    await loadContracts()
    closeEditModal()
  } catch (error) {
    console.error('保存合同失败:', error)
  }
}

const sendForSigning = async (id) => {
  try {
    await adoptionContractsApi.updateContract({ contractId: id, status: 'pending' })
    await loadContracts()
  } catch (error) {
    console.error('发送签署失败:', error)
  }
}

const markAsSigned = async (id) => {
  try {
    await adoptionContractsApi.updateContract({ contractId: id, status: 'signed' })
    await loadContracts()
  } catch (error) {
    console.error('标记签署失败:', error)
  }
}

const completeContract = async (id) => {
  try {
    await adoptionContractsApi.updateContract({ contractId: id, status: 'completed' })
    await loadContracts()
  } catch (error) {
    console.error('完成合同失败:', error)
  }
}

const terminateContract = async (id) => {
  if (confirm('确定要终止这个合同吗？此操作不可撤销。')) {
    try {
      await adoptionContractsApi.deleteContract(id)
      await loadContracts()
    } catch (error) {
      console.error('终止合同失败:', error)
    }
  }
}

const downloadContract = (contract) => {
  // 这里实现合同下载逻辑
  console.log('下载合同:', contract.contractNumber)
}

const getStatusText = (status) => {
  const statusMap = {
    draft: '草稿',
    pending: '待签署',
    signed: '已签署',
    completed: '已完成',
    terminated: '已终止'
  }
  return statusMap[status] || status
}

const getContractTypeText = (type) => {
  const typeMap = {
    standard: '标准领养合同',
    trial: '试养合同',
    foster: '寄养合同'
  }
  return typeMap[type] || type
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  loadContracts()
})
</script>

<style scoped>
.adoption-contracts {
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

.header-actions {
  display: flex;
  gap: 12px;
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

.stat-card.draft .stat-icon {
  background: linear-gradient(135deg, #64748b, #475569);
}

.stat-card.pending .stat-icon {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.stat-card.signed .stat-icon {
  background: linear-gradient(135deg, #10b981, #059669);
}

.stat-card.completed .stat-icon {
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

/* 合同列表 */
.contracts-list {
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
  margin: 0 0 20px 0;
}

.contract-cards {
  display: grid;
  gap: 20px;
}

.contract-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border-left: 4px solid #e2e8f0;
}

.contract-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.contract-card.status-draft {
  border-left-color: #64748b;
}

.contract-card.status-pending {
  border-left-color: #f59e0b;
}

.contract-card.status-signed {
  border-left-color: #10b981;
}

.contract-card.status-completed {
  border-left-color: #3b82f6;
}

.contract-card.status-terminated {
  border-left-color: #ef4444;
}

.card-header {
  padding: 20px 24px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
}

.contract-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.contract-number .label {
  font-size: 12px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.contract-number .number {
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
}

.contract-meta {
  font-size: 14px;
  color: #64748b;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.status-draft {
  background: #f1f5f9;
  color: #475569;
}

.status-badge.status-pending {
  background: #fef3c7;
  color: #d97706;
}

.status-badge.status-signed {
  background: #d1fae5;
  color: #059669;
}

.status-badge.status-completed {
  background: #dbeafe;
  color: #2563eb;
}

.status-badge.status-terminated {
  background: #fee2e2;
  color: #dc2626;
}

.card-content {
  padding: 16px 24px;
}

.parties-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 16px;
}

.party h5 {
  margin: 0 0 8px 0;
  color: #1a202c;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.party h5 i {
  color: #3b82f6;
}

.party .name {
  margin: 0 0 4px 0;
  color: #1a202c;
  font-weight: 500;
}

.party .contact,
.party .details {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

.contract-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.detail-row.full-width {
  grid-template-columns: 1fr;
}

.detail-item {
  display: flex;
  gap: 8px;
}

.detail-item .label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
  min-width: 80px;
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
  flex-wrap: wrap;
  gap: 12px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
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
  white-space: nowrap;
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

.btn-info {
  background: #06b6d4;
  color: white;
}

.btn-info:hover:not(:disabled) {
  background: #0891b2;
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
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-content.large {
  max-width: 900px;
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

.modal-footer {
  padding: 16px 24px 24px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 合同预览 */
.contract-preview {
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

.info-item .label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  display: block;
}

.info-item .value {
  color: #1a202c;
  font-size: 14px;
}

.info-item .value.status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.parties-detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.party-detail h5 {
  margin: 0 0 12px 0;
  color: #1a202c;
  font-weight: 600;
  font-size: 16px;
}

.contract-terms {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.term-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.term-item.full {
  grid-column: 1 / -1;
}

/* 表单样式 */
.form-sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section h4 {
  margin: 0 0 16px 0;
  color: #1a202c;
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 2px solid #f1f5f9;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group.full {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .adoption-contracts {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .header-actions {
    flex-direction: column;
    width: 100%;
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
  
  .parties-info {
    grid-template-columns: 1fr;
  }
  
  .detail-row {
    grid-template-columns: 1fr;
  }
  
  .card-actions {
    flex-direction: column;
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
  
  .parties-detail {
    grid-template-columns: 1fr;
  }
  
  .info-grid,
  .form-grid,
  .contract-terms {
    grid-template-columns: 1fr;
  }
}
</style>