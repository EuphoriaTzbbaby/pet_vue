import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 领养申请接口
interface AdoptionApplication {
  id: string
  applicantName: string
  phone: string
  email: string
  age: number
  petName: string
  petBreed: string
  petAge: number
  livingEnvironment: string
  experience: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
}

// 领养合同接口
interface AdoptionContract {
  id: string
  contractNumber: string
  contractType: 'standard' | 'trial' | 'foster'
  status: 'draft' | 'pending' | 'signed' | 'completed' | 'terminated'
  adopterName: string
  adopterPhone: string
  adopterEmail: string
  adopterIdCard: string
  adopterAddress: string
  petName: string
  petBreed: string
  petAge: number
  petGender: 'male' | 'female'
  petChipId?: string
  adoptionFee: number
  trialPeriod: number
  followUpFrequency: 'weekly' | 'monthly' | 'quarterly'
  specialTerms?: string
  notes?: string
  createdAt: string
  updatedAt: string
  signedAt?: string
  expiresAt?: string
  signMethod?: string
}

// 统计数据接口
interface AdoptionStats {
  applications: {
    total: number
    pending: number
    approved: number
    rejected: number
  }
  contracts: {
    total: number
    draft: number
    pending: number
    signed: number
    completed: number
    terminated: number
  }
  recentActivity: {
    newApplications: number
    signedContracts: number
    completedAdoptions: number
  }
}

export const useAdoptionStore = defineStore('adoption', () => {
  // 状态
  const applications = ref<AdoptionApplication[]>([])
  const contracts = ref<AdoptionContract[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性 - 申请统计
  const applicationStats = computed(() => {
    const total = applications.value.length
    const pending = applications.value.filter(app => app.status === 'pending').length
    const approved = applications.value.filter(app => app.status === 'approved').length
    const rejected = applications.value.filter(app => app.status === 'rejected').length
    
    return { total, pending, approved, rejected }
  })

  // 计算属性 - 合同统计
  const contractStats = computed(() => {
    const total = contracts.value.length
    const draft = contracts.value.filter(contract => contract.status === 'draft').length
    const pending = contracts.value.filter(contract => contract.status === 'pending').length
    const signed = contracts.value.filter(contract => contract.status === 'signed').length
    const completed = contracts.value.filter(contract => contract.status === 'completed').length
    const terminated = contracts.value.filter(contract => contract.status === 'terminated').length
    
    return { total, draft, pending, signed, completed, terminated }
  })

  // 计算属性 - 最近活动统计
  const recentActivityStats = computed(() => {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const newApplications = applications.value.filter(app => 
      new Date(app.createdAt) >= weekAgo
    ).length
    
    const signedContracts = contracts.value.filter(contract => 
      contract.signedAt && new Date(contract.signedAt) >= weekAgo
    ).length
    
    const completedAdoptions = contracts.value.filter(contract => 
      contract.status === 'completed' && new Date(contract.updatedAt) >= weekAgo
    ).length
    
    return { newApplications, signedContracts, completedAdoptions }
  })

  // 计算属性 - 综合统计
  const overallStats = computed((): AdoptionStats => {
    return {
      applications: applicationStats.value,
      contracts: contractStats.value,
      recentActivity: recentActivityStats.value
    }
  })

  // 计算属性 - 待处理项目
  const pendingItems = computed(() => {
    const pendingApplications = applications.value.filter(app => app.status === 'pending')
    const pendingContracts = contracts.value.filter(contract => 
      ['draft', 'pending'].includes(contract.status)
    )
    
    return {
      applications: pendingApplications,
      contracts: pendingContracts,
      total: pendingApplications.length + pendingContracts.length
    }
  })

  // 模拟数据初始化
  const initializeMockData = () => {
    // 模拟申请数据
    applications.value = [
      {
        id: '1',
        applicantName: '张三',
        phone: '13800138001',
        email: 'zhangsan@example.com',
        age: 28,
        petName: '小白',
        petBreed: '金毛',
        petAge: 2,
        livingEnvironment: '三室一厅，有阳台',
        experience: '养过猫咪3年',
        reason: '喜欢狗狗，想给它一个温暖的家',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        applicantName: '李四',
        phone: '13800138002',
        email: 'lisi@example.com',
        age: 32,
        petName: '小黑',
        petBreed: '拉布拉多',
        petAge: 1,
        livingEnvironment: '独栋别墅，有花园',
        experience: '从小养狗',
        reason: '家里孩子想要个伴',
        status: 'approved',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    // 模拟合同数据
    contracts.value = [
      {
        id: '1',
        contractNumber: 'AC2024001',
        contractType: 'standard',
        status: 'signed',
        adopterName: '李四',
        adopterPhone: '13800138002',
        adopterEmail: 'lisi@example.com',
        adopterIdCard: '110101199001011234',
        adopterAddress: '北京市朝阳区xxx街道',
        petName: '小黑',
        petBreed: '拉布拉多',
        petAge: 1,
        petGender: 'male',
        petChipId: 'CHIP001',
        adoptionFee: 500,
        trialPeriod: 30,
        followUpFrequency: 'monthly',
        specialTerms: '需定期体检',
        notes: '性格温顺，适合家庭饲养',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
        signedAt: new Date().toISOString()
      }
    ]
  }

  // Actions - 申请相关
  const fetchApplications = async () => {
    try {
      loading.value = true
      error.value = null
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      initializeMockData()
    } catch (err) {
      error.value = '获取申请列表失败'
      console.error('获取申请列表失败:', err)
    } finally {
      loading.value = false
    }
  }

  const getApplicationById = (id: string) => {
    return applications.value.find(app => app.id === id)
  }

  const updateApplicationStatus = (id: string, status: 'pending' | 'approved' | 'rejected') => {
    const index = applications.value.findIndex(app => app.id === id)
    if (index !== -1) {
      applications.value[index].status = status
      applications.value[index].updatedAt = new Date().toISOString()
    }
  }

  const deleteApplication = (id: string) => {
    const index = applications.value.findIndex(app => app.id === id)
    if (index !== -1) {
      applications.value.splice(index, 1)
    }
  }

  // Actions - 合同相关
  const fetchContracts = async () => {
    try {
      loading.value = true
      error.value = null
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      // 合同数据已在initializeMockData中初始化
    } catch (err) {
      error.value = '获取合同列表失败'
      console.error('获取合同列表失败:', err)
    } finally {
      loading.value = false
    }
  }

  const getContractById = (id: string) => {
    return contracts.value.find(contract => contract.id === id)
  }

  const updateContractStatus = (id: string, status: AdoptionContract['status']) => {
    const index = contracts.value.findIndex(contract => contract.id === id)
    if (index !== -1) {
      contracts.value[index].status = status
      contracts.value[index].updatedAt = new Date().toISOString()
      if (status === 'signed') {
        contracts.value[index].signedAt = new Date().toISOString()
      }
    }
  }

  const deleteContract = (id: string) => {
    const index = contracts.value.findIndex(contract => contract.id === id)
    if (index !== -1) {
      contracts.value.splice(index, 1)
    }
  }

  // 工具方法
  const clearError = () => {
    error.value = null
  }

  const refreshAll = async () => {
    await Promise.all([
      fetchApplications(),
      fetchContracts()
    ])
  }

  // 搜索和筛选方法
  const searchApplications = (query: string, status?: string) => {
    let filtered = applications.value
    
    if (query) {
      const searchQuery = query.toLowerCase()
      filtered = filtered.filter(app => 
        app.applicantName.toLowerCase().includes(searchQuery) ||
        app.phone.includes(searchQuery) ||
        app.petName.toLowerCase().includes(searchQuery)
      )
    }
    
    if (status) {
      filtered = filtered.filter(app => app.status === status)
    }
    
    return filtered
  }

  const searchContracts = (query: string, status?: string) => {
    let filtered = contracts.value
    
    if (query) {
      const searchQuery = query.toLowerCase()
      filtered = filtered.filter(contract => 
        contract.contractNumber.toLowerCase().includes(searchQuery) ||
        contract.adopterName.toLowerCase().includes(searchQuery) ||
        contract.petName.toLowerCase().includes(searchQuery)
      )
    }
    
    if (status) {
      filtered = filtered.filter(contract => contract.status === status)
    }
    
    return filtered
  }

  // 初始化模拟数据
  initializeMockData()

  return {
    // 状态
    applications,
    contracts,
    loading,
    error,
    
    // 计算属性
    applicationStats,
    contractStats,
    recentActivityStats,
    overallStats,
    pendingItems,
    
    // 申请相关方法
    fetchApplications,
    getApplicationById,
    updateApplicationStatus,
    deleteApplication,
    
    // 合同相关方法
    fetchContracts,
    getContractById,
    updateContractStatus,
    deleteContract,
    
    // 工具方法
    clearError,
    refreshAll,
    searchApplications,
    searchContracts
  }
})

// 导出类型
export type { AdoptionApplication, AdoptionContract, AdoptionStats }