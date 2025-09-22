<template>
  <div class="adopter-adoption">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <el-icon class="title-icon"><Star /></el-icon>
            我的领养申请
          </h1>
          <p class="page-subtitle">查看和管理您的宠物领养申请状态</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="refreshData" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>
    </div>

    <!-- 申请状态统计 -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card pending">
          <div class="stat-icon">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.pending }}</div>
            <div class="stat-label">待审核</div>
          </div>
        </div>

        <div class="stat-card approved">
          <div class="stat-icon">
            <el-icon><Check /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.approved }}</div>
            <div class="stat-label">已通过</div>
          </div>
        </div>

        <div class="stat-card contract">
          <div class="stat-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.contractGenerated }}</div>
            <div class="stat-label">合同生成</div>
          </div>
        </div>

        <div class="stat-card completed">
          <div class="stat-icon">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.completed }}</div>
            <div class="stat-label">已完成</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 申请列表 -->
    <div class="applications-section">
      <div class="section-header">
        <h2>我的申请记录</h2>
        <div class="filter-controls">
          <el-select v-model="statusFilter" placeholder="筛选状态" clearable>
            <el-option label="全部" value="" />
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
            <el-option label="合同生成" value="contract_generated" />
            <el-option label="合同签署" value="contract_signed" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </div>
      </div>

      <div class="applications-list">
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="3" animated />
        </div>
        
        <div v-else-if="filteredApplications.length === 0" class="empty-state">
          <el-empty description="暂无申请记录">
            <el-button type="primary" @click="$router.push('/adopter/pets')">
              去看看宠物
            </el-button>
          </el-empty>
        </div>

        <div v-else class="application-cards">
          <div 
            v-for="application in filteredApplications" 
            :key="application.applicationId"
            class="application-card"
          >
            <div class="card-header">
              <div class="pet-info">
                <div class="pet-avatar">
                  <img src="/src/assets/default-avatar.png" :alt="application.petInfo?.name" />
                </div>
                <div class="pet-details">
                  <h3>{{ application.petInfo?.name }}</h3>
                  <p>{{ application.petInfo?.species }} · {{ application.petInfo?.age }}岁</p>
                </div>
              </div>
              <div class="status-badge">
                <el-tag :type="getStatusType(application.status || '')" size="large">
                  {{ getStatusText(application.status || '') }}
                </el-tag>
              </div>
            </div>

            <div class="card-content">
              <div class="application-info">
                <div class="info-item">
                  <span class="label">申请时间：</span>
                  <span class="value">{{ formatDate(application.createdAt) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">申请理由：</span>
                  <span class="value">{{ application.reason }}</span>
                </div>
                <div class="info-item">
                  <span class="label">居住条件：</span>
                  <span class="value">{{ application.livingCondition }}</span>
                </div>
                <div v-if="application.reviewNote" class="info-item">
                  <span class="label">审核备注：</span>
                  <span class="value">{{ application.reviewNote }}</span>
                </div>
              </div>
            </div>

            <div class="card-actions">
              <el-button 
                v-if="(application.status || '') === 'contract_generated'"
                type="primary"
                @click="viewContract(application)"
              >
                查看合同
              </el-button>
              <el-button 
                v-if="(application.status || '') === 'contract_generated'"
                type="success"
                @click="handleSignContract(application)"
              >
                签署合同
              </el-button>
              <el-button 
                v-if="(application.status || '') === 'contract_signed'"
                type="info"
                @click="viewContract(application)"
              >
                查看已签合同
              </el-button>
              <el-button 
                v-if="['pending', 'approved'].includes(application.status || '')"
                type="danger"
                plain
                @click="cancelApplication(application)"
              >
                取消申请
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 合同查看对话框 -->
    <el-dialog 
      v-model="contractDialogVisible" 
      title="领养合同" 
      width="80%"
      :before-close="handleContractDialogClose"
    >
      <div class="contract-content">
        <p><strong>合同状态:</strong> 
          <el-tag :type="currentContract?.signedAt ? 'success' : 'warning'">
            {{ currentContract?.signedAt ? '已签署' : '待签署' }}
          </el-tag>
        </p>
        <div v-if="currentContract" class="contract-text">
          <pre>{{ currentContract.contractText || '合同内容加载中...' }}</pre>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="contractDialogVisible = false">关闭</el-button>
          <el-button 
            v-if="!currentContract?.signedAt"
            type="primary"
            @click="confirmSignContract"
          >
            确认签署
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 签署合同对话框 -->
    <el-dialog 
      v-model="signDialogVisible" 
      title="签署合同" 
      width="500px"
    >
      <el-form :model="signForm" :rules="signRules" ref="signFormRef" label-width="100px">
        <el-form-item label="签署人姓名" prop="signerName">
          <el-input v-model="signForm.signerName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="联系电话" prop="signerPhone">
          <el-input v-model="signForm.signerPhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="居住地址" prop="signerAddress">
          <el-input 
            v-model="signForm.signerAddress" 
            type="textarea" 
            :rows="3"
            placeholder="请输入详细居住地址" 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="signDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitSignature" :loading="signing">
            确认签署
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Refresh, Clock, Check, Document, CircleCheck, Star 
} from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'
import { 
  getApplicationsByUserId, 
  type AdoptionApplications
} from '../api/adoptionApplicationsApi'
import { 
  getContractByApplicationId,
  updateContract,
  type AdoptionContracts
} from '../api/adoptionContractsApi'
import { getPetById } from '../api/petsApi'
import dayjs from 'dayjs'

const userStore = useUserStore()

// 扩展申请接口
interface ExtendedAdoptionApplication extends AdoptionApplications {
  petInfo?: {
    name?: string;
    species?: string;
    age?: number;
  };
  reviewNote?: string;
}

// 响应式数据
const loading = ref(false)
const applications = ref<ExtendedAdoptionApplication[]>([])
const statusFilter = ref('')
const contractDialogVisible = ref(false)
const signDialogVisible = ref(false)
const currentContract = ref<AdoptionContracts | null>(null)
const currentApplication = ref<ExtendedAdoptionApplication | null>(null)
const signing = ref(false)

// 签署表单
const signForm = reactive({
  signerName: '',
  signerPhone: '',
  signerAddress: ''
})

const signRules = {
  signerName: [{ required: true, message: '请输入签署人姓名', trigger: 'blur' }],
  signerPhone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  signerAddress: [{ required: true, message: '请输入居住地址', trigger: 'blur' }]
}

const signFormRef = ref()

// 计算属性
const stats = computed(() => {
  const pending = applications.value.filter(app => app.status === 'pending').length
  const approved = applications.value.filter(app => app.status === 'approved').length
  const contractGenerated = applications.value.filter(app => app.status === 'contract_generated').length
  const completed = applications.value.filter(app => app.status === 'completed').length
  
  return { pending, approved, contractGenerated, completed }
})

const filteredApplications = computed(() => {
  if (!statusFilter.value) return applications.value
  return applications.value.filter(app => app.status === statusFilter.value)
})

// 方法
// 加载申请数据
const loadApplications = async () => {
  try {
    loading.value = true
    const userId = userStore.currentUser?.userId
    if (!userId) return
    
    const response = await getApplicationsByUserId(userId)
    const apps = response.data
    
    // 获取每个申请对应的宠物信息
    const extendedApps: ExtendedAdoptionApplication[] = []
    for (const app of apps) {
      const extendedApp: ExtendedAdoptionApplication = { ...app }
      try {
        const petResponse = await getPetById(app.petId)
        extendedApp.petInfo = {
           name: petResponse.data.name || '未知',
           species: petResponse.data.species || '未知',
           age: petResponse.data.age || 0
         }
      } catch (error) {
        console.error('获取宠物信息失败:', error)
        extendedApp.petInfo = {
          name: '未知',
          species: '未知',
          age: 0
        }
      }
      extendedApps.push(extendedApp)
    }
    
    applications.value = extendedApps
  } catch (error) {
    ElMessage.error('加载申请数据失败')
    console.error('Error loading applications:', error)
  } finally {
    loading.value = false
  }
}

const refreshData = async () => {
  await loadApplications()
}

const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    contract_generated: 'primary',
    contract_signed: 'info',
    completed: 'success',
    cancelled: 'info'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝',
    contract_generated: '合同生成',
    contract_signed: '合同签署',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return ''
  return dayjs(dateString).format('YYYY-MM-DD HH:mm')
}

const viewContract = async (application: ExtendedAdoptionApplication) => {
  try {
    if (!application.applicationId) return
    const response = await getContractByApplicationId(application.applicationId)
    currentContract.value = response.data
    currentApplication.value = application
    contractDialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取合同信息失败')
  }
}

const handleSignContract = (application: ExtendedAdoptionApplication) => {
  currentApplication.value = application
  signForm.signerName = userStore.currentUser?.username || ''
  signForm.signerPhone = userStore.currentUser?.phone || ''
  signForm.signerAddress = ''
  signDialogVisible.value = true
}

const submitSignature = async () => {
  if (!signFormRef.value) return
  
  try {
    await signFormRef.value.validate()
    
    if (!currentApplication.value?.applicationId) return
    
    signing.value = true
    
    // 获取合同信息
    const contractResponse = await getContractByApplicationId(currentApplication.value.applicationId)
    const contract = contractResponse.data
    
    if (!contract?.contractId) {
      ElMessage.error('合同信息不完整')
      return
    }
    
    // 模拟签署合同 - 更新合同的签署时间
     const updatedContract = {
       ...contract,
       signedAt: new Date().toISOString()
     }
     await updateContract(updatedContract)
    
    ElMessage.success('合同签署成功！')
    signDialogVisible.value = false
    await refreshData()
  } catch (error) {
    ElMessage.error('合同签署失败')
  } finally {
    signing.value = false
  }
}

const confirmSignContract = async () => {
  if (!currentContract.value) return
  
  try {
    await ElMessageBox.confirm(
      '确认签署此合同？签署后将不可撤销。',
      '确认签署',
      {
        confirmButtonText: '确认签署',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    contractDialogVisible.value = false
    if (currentApplication.value) {
      handleSignContract(currentApplication.value)
    }
  } catch {
    // 用户取消
  }
}

const cancelApplication = async (_application: ExtendedAdoptionApplication) => {
  try {
    await ElMessageBox.confirm(
      '确认取消此申请？取消后将无法恢复。',
      '确认取消',
      {
        confirmButtonText: '确认取消',
        cancelButtonText: '保留申请',
        type: 'warning'
      }
    )
    
    // TODO: 调用取消申请API
    ElMessage.success('申请已取消')
    await refreshData()
  } catch {
    // 用户取消
  }
}

const handleContractDialogClose = () => {
  contractDialogVisible.value = false
  currentContract.value = null
  currentApplication.value = null
}

// 生命周期
onMounted(() => {
  loadApplications()
})
</script>

<style scoped>
.adopter-adoption {
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.page-header {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
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
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-icon {
  color: #e74c3c;
  font-size: 28px;
}

.page-subtitle {
  color: #666;
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.stats-section {
  margin-bottom: 32px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
  border-radius: 20px;
  padding: 28px 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
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
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.stat-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-card.pending .stat-icon {
  background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
  color: #d63031;
}

.stat-card.approved .stat-icon {
  background: linear-gradient(135deg, #55efc4 0%, #00b894 100%);
  color: #00b894;
}

.stat-card.contract .stat-icon {
  background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
  color: #0984e3;
}

.stat-card.completed .stat-icon {
  background: linear-gradient(135deg, #fd79a8 0%, #e84393 100%);
  color: #e84393;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stat-label {
  color: #555;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.applications-section {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.section-header h2 {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.application-cards {
  display: grid;
  gap: 24px;
}

.application-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.application-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.application-card:hover {
  transform: translateY(-6px) scale(1.02);
  border-color: #667eea;
  box-shadow: 0 20px 60px rgba(102, 126, 234, 0.2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.pet-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 16px;
  border-left: 4px solid #667eea;
  margin-bottom: 20px;
}

.pet-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.pet-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pet-details h3 {
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 6px 0;
}

.pet-details p {
  color: #666;
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.card-content {
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.info-item:last-child {
  border-bottom: none;
}

.info-item .label {
  font-weight: 600;
  color: #2c3e50;
  min-width: 100px;
  font-size: 15px;
}

.info-item .value {
  color: #555;
  flex: 1;
  font-weight: 500;
  font-size: 15px;
}

.card-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.card-actions .el-button {
  min-width: 100px;
  height: 40px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.card-actions .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.loading-container {
  padding: 40px 20px;
  text-align: center;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-state .el-empty {
  padding: 40px;
}

.empty-state .el-button {
  margin-top: 20px;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
}

.empty-state .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.contract-content {
  max-height: 60vh;
  overflow-y: auto;
}

.contract-text {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 24px;
  font-family: 'Courier New', monospace;
  line-height: 1.8;
  white-space: pre-wrap;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

.dialog-footer .el-button {
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.dialog-footer .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .adopter-adoption {
    padding: 16px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }
  
  .application-cards {
    gap: 16px;
  }
  
  .application-card {
    padding: 20px;
  }
  
  .card-actions {
    flex-direction: column;
  }
  
  .card-actions .el-button {
    width: 100%;
  }
  
  .page-header {
    padding: 24px;
  }
  
  .applications-section {
    padding: 24px;
  }
}
</style>