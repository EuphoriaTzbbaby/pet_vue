<template>
  <div class="pets-page">
    <!-- 页面标题和操作区 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">
          <el-icon class="title-icon"><Pet /></el-icon>
          宠物管理
        </h1>
        <p class="page-subtitle">管理您的宠物信息，提供更好的宠物服务</p>
      </div>
      <div class="header-actions">
        <el-input
          v-model="searchQuery"
          placeholder="搜索宠物名称、种类..."
          prefix-icon="Search"
          clearable
          @clear="handleSearchClear"
          @keyup.enter="handleSearch"
          class="search-input"
          size="large"
          aria-label="搜索宠物"
          role="searchbox"
        />
        <el-button 
          type="primary" 
          @click="showAddDialog = true" 
          size="large"
          aria-label="添加新宠物"
        >
          <el-icon><Plus /></el-icon> 添加宠物
        </el-button>
        <el-button 
          type="danger" 
          @click="batchDelete" 
          :disabled="selectedPets.length === 0"
          size="large"
          :aria-label="`批量删除选中的${selectedPets.length}只宠物`"
        >
          <el-icon><Delete /></el-icon> 批量删除 ({{ selectedPets.length }})
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-container">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="stat-card total-card">
            <div class="stat-content">
              <div class="stat-icon-wrapper total">
                <el-icon class="stat-icon"><Pet /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ totalPets }}</div>
                <div class="stat-label">宠物总数</div>
                <div class="stat-trend">
                  <el-icon class="trend-icon"><TrendCharts /></el-icon>
                  <span>+12%</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="stat-card available-card">
            <div class="stat-content">
              <div class="stat-icon-wrapper available">
                <el-icon class="stat-icon"><Check /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ availablePets }}</div>
                <div class="stat-label">可领养</div>
                <div class="stat-trend">
                  <el-icon class="trend-icon"><TrendCharts /></el-icon>
                  <span>+8%</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="stat-card adopted-card">
            <div class="stat-content">
              <div class="stat-icon-wrapper adopted">
                <el-icon class="stat-icon"><User /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ adoptedPets }}</div>
                <div class="stat-label">已领养</div>
                <div class="stat-trend">
                  <el-icon class="trend-icon"><TrendCharts /></el-icon>
                  <span>+15%</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="stat-card vaccinated-card">
            <div class="stat-content">
              <div class="stat-icon-wrapper vaccinated">
                <el-icon class="stat-icon"><FirstAidKit /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ vaccinatedPets }}</div>
                <div class="stat-label">已接种疫苗</div>
                <div class="stat-trend">
                  <el-icon class="trend-icon"><TrendCharts /></el-icon>
                  <span>+5%</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 筛选器 + 排序 -->
    <div class="filter-container">
      <el-card shadow="never" class="filter-card">
        <template #header>
          <div class="filter-header">
            <span class="filter-title">
              <el-icon><Filter /></el-icon>
              筛选与排序
            </span>
            <el-button 
              type="text" 
              @click="showAdvancedFilters = !showAdvancedFilters"
              class="toggle-filters"
            >
              {{ showAdvancedFilters ? '收起' : '展开' }}高级筛选
              <el-icon>
                <ArrowDown v-if="!showAdvancedFilters" />
                <ArrowUp v-else />
              </el-icon>
            </el-button>
          </div>
        </template>
        
        <el-form :model="filterForm" class="filter-form">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-form-item label="种类">
            <el-select v-model="filterForm.species" placeholder="选择种类" clearable>
              <el-option v-for="species in speciesOptions" :key="species" :label="species" :value="species"/>
            </el-select>
          </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-form-item label="性别">
            <el-select v-model="filterForm.gender" placeholder="选择性别" clearable>
              <el-option label="公" value="公"/>
              <el-option label="母" value="母"/>
            </el-select>
          </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-form-item label="健康状况">
            <el-select v-model="filterForm.healthStatus" placeholder="选择健康状况" clearable>
              <el-option label="健康" value="健康"/>
              <el-option label="轻微疾病" value="轻微疾病"/>
              <el-option label="需要治疗" value="需要治疗"/>
            </el-select>
          </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-form-item label="状态">
            <el-select v-model="filterForm.status" placeholder="选择状态" clearable>
              <el-option label="可领养" value="可领养"/>
              <el-option label="已领养" value="已领养"/>
              <el-option label="隔离中" value="隔离中"/>
            </el-select>
          </el-form-item>
            </el-col>
          </el-row>
          
          <el-collapse-transition>
            <div v-show="showAdvancedFilters" class="advanced-filters">
              <el-row :gutter="20">
                <el-col :xs="24" :sm="12" :md="8" :lg="6">
                  <el-form-item label="年龄范围">
                    <el-slider
                      v-model="ageRange"
                      range
                      :min="0"
                      :max="20"
                      :marks="ageMarks"
                      show-stops
                    />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12" :md="8" :lg="6">
                  <el-form-item label="疫苗状态">
                    <el-radio-group v-model="filterForm.vaccinated">
                      <el-radio :label="null">全部</el-radio>
                      <el-radio :label="1">已接种</el-radio>
                      <el-radio :label="0">未接种</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12" :md="8" :lg="6">
                  <el-form-item label="排序方式">
            <el-select v-model="filterForm.sortBy" placeholder="选择排序方式">
              <el-option label="年龄升序" value="age_asc"/>
              <el-option label="年龄降序" value="age_desc"/>
              <el-option label="创建时间升序" value="created_asc"/>
              <el-option label="创建时间降序" value="created_desc"/>
                      <el-option label="名称升序" value="name_asc"/>
                      <el-option label="名称降序" value="name_desc"/>
            </el-select>
          </el-form-item>
                </el-col>
              </el-row>
            </div>
          </el-collapse-transition>
          
          <el-form-item class="filter-actions">
            <el-button type="primary" @click="applyFilters" :loading="loading">
              <el-icon><Search /></el-icon> 应用筛选
            </el-button>
            <el-button @click="resetFilters">
              <el-icon><Refresh /></el-icon> 重置
            </el-button>
            <el-button type="success" @click="exportData">
              <el-icon><Download /></el-icon> 导出数据
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 宠物列表 -->
    <div class="pets-container">
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="3" animated class="skeleton-card"/>
        <el-skeleton :rows="3" animated class="skeleton-card"/>
        <el-skeleton :rows="3" animated class="skeleton-card"/>
        <el-skeleton :rows="3" animated class="skeleton-card"/>
      </div>
      
      <div v-else-if="error" class="error-container">
        <el-result
          icon="error"
          title="加载失败"
          :sub-title="error"
        >
          <template #extra>
            <el-button type="primary" @click="fetchPets">重新加载</el-button>
          </template>
        </el-result>
      </div>

      <el-row v-else :gutter="20">
        <el-col
          v-for="pet in pets"
          :key="pet.petId"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
          class="pet-col"
        >
          <el-card 
            :body-style="{ padding: '0px' }" 
            shadow="hover" 
            class="pet-card"
            @click="viewPetDetail(pet)"
            :aria-label="`查看${pet.name || '未知宠物'}的详细信息`"
            role="button"
            tabindex="0"
            @keyup.enter="viewPetDetail(pet)"
            @keyup.space="viewPetDetail(pet)"
          >
            <div class="pet-image-container">
              <el-image 
                :src="petImage(pet)" 
                fit="cover" 
                class="pet-image"
                :preview-src-list="[petImage(pet)]"
                preview-teleported
                lazy
                :loading="'lazy'"
              />
              <div class="pet-status" :class="statusClass(pet.status || '')">
                {{ pet.status }}
              </div>
              <el-checkbox 
                class="select-pet" 
                v-model="selectedPets" 
                :label="pet.petId"
                @click.stop
              ></el-checkbox>
              <div class="pet-overlay">
                <el-button 
                  type="primary" 
                  size="small" 
                  circle
                  @click.stop="viewPetDetail(pet)"
                  class="view-btn"
                >
                  <el-icon><View /></el-icon>
                </el-button>
              </div>
            </div>
            <div class="pet-info">
              <div class="pet-header">
                <h3 class="pet-name">{{ pet.name }}</h3>
                <el-tag :type="getStatusTagType(pet.status || '')" size="small">
                  {{ pet.status }}
                </el-tag>
              </div>
              <div class="pet-details">
                <div class="pet-detail-item">
                  <el-icon class="detail-icon"><Connection/></el-icon>
                  <span>{{ pet.species }}</span>
                </div>
                <div class="pet-detail-item">
                  <el-icon class="detail-icon"><Male/></el-icon>
                  <span>{{ pet.gender }}</span>
                </div>
                <div class="pet-detail-item">
                  <el-icon class="detail-icon"><Timer/></el-icon>
                  <span>{{ pet.age }}月</span>
                </div>
                <div class="pet-detail-item">
                  <el-icon class="detail-icon" :class="{ 'vaccinated': pet.vaccinated }">
                    <FirstAidKit/>
                  </el-icon>
                  <span :class="{ 'vaccinated': pet.vaccinated }">
                    {{ pet.vaccinated ? '已接种' : '未接种' }}
                  </span>
                </div>
              </div>
              <div class="pet-description" v-if="pet.description">
                {{ pet.description.length > 50 ? pet.description.substring(0, 50) + '...' : pet.description }}
              </div>
              <div class="pet-actions">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click.stop="editPet(pet)"
                  class="action-btn"
                >
                  <el-icon><Edit /></el-icon> 编辑
                </el-button>
                <el-button 
                  type="danger" 
                  size="small" 
                  @click.stop="confirmDelete(pet)"
                  class="action-btn"
                >
                  <el-icon><Delete /></el-icon> 删除
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-empty v-if="!loading && pets.length === 0" description="暂无宠物数据">
        <el-button type="primary" @click="showAddDialog = true">添加第一只宠物</el-button>
      </el-empty>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[12, 24, 36, 48]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 添加/编辑宠物对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="isEdit ? '编辑宠物' : '添加宠物'"
      width="600px"
      @closed="resetForm"
    >
      <el-form 
        ref="petFormRef" 
        :model="petForm" 
        :rules="petRules" 
        label-width="100px"
      >
        <el-form-item label="宠物名称" prop="name">
          <el-input v-model="petForm.name" placeholder="请输入宠物名称" />
        </el-form-item>
        <el-form-item label="种类" prop="species">
          <el-input v-model="petForm.species" placeholder="例如：金毛犬、波斯猫" />
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input-number 
            v-model="petForm.age" 
            :min="0" 
            placeholder="年龄" 
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="petForm.gender">
            <el-radio label="公">公</el-radio>
            <el-radio label="母">母</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="健康状况" prop="healthStatus">
          <el-select v-model="petForm.healthStatus" placeholder="选择健康状况">
            <el-option label="健康" value="健康"/>
            <el-option label="轻微疾病" value="轻微疾病"/>
            <el-option label="需要治疗" value="需要治疗"/>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="petForm.status" placeholder="选择状态">
            <el-option label="可领养" value="可领养"/>
            <el-option label="已领养" value="已领养"/>
            <el-option label="隔离中" value="隔离中"/>
          </el-select>
        </el-form-item>
        <el-form-item label="是否接种疫苗" prop="vaccinated">
          <el-switch v-model="petForm.vaccinated" active-text="已接种" inactive-text="未接种"/>
        </el-form-item>
        <el-form-item label="宠物描述" prop="description">
          <el-input 
            v-model="petForm.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入宠物的详细描述..."
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="宠物照片" prop="image">
          <el-upload
            class="pet-uploader"
            :show-file-list="false"
            :before-upload="beforeImageUpload"
            :http-request="handleImageUpload"
            :loading="uploading"
          >
            <el-image 
              v-if="petForm.imageUrl" 
              :src="petForm.imageUrl" 
              class="pet-upload-image"
              fit="cover"
            />
            <div v-else class="pet-uploader-icon">
              <el-icon v-if="!uploading"><Plus /></el-icon>
              <el-icon v-else class="is-loading"><Loading /></el-icon>
            </div>
          </el-upload>
          <div class="upload-tip">支持 JPG、PNG 格式，文件大小不超过 2MB</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="submitForm">{{ isEdit ? '保存' : '添加' }}</el-button>
      </template>
    </el-dialog>

    <!-- 宠物详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="宠物详情"
      width="800px"
      class="pet-detail-dialog"
    >
      <div v-if="selectedPet" class="pet-detail-content">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="detail-image-container">
              <el-image 
                :src="currentPetImage || petImage(selectedPet)" 
                fit="cover" 
                class="detail-image"
                :preview-src-list="selectedPetMedia.map(media => media.url).filter(Boolean)"
                preview-teleported
              />
              
              <!-- 宠物相册 -->
              <div v-if="selectedPetMedia.length > 0" class="pet-gallery">
                <h4>宠物相册 ({{ selectedPetMedia.length }}) - 点击图片设为主图</h4>
                <div class="gallery-grid">
                  <div 
                    v-for="media in selectedPetMedia" 
                    :key="media.mediaId"
                    class="gallery-item"
                    :class="{ 'active': currentPetImage === media.url }"
                    @click="switchPetImage(media.url || '')"
                  >
                    <el-image 
                      :src="media.url" 
                      fit="cover" 
                      class="gallery-image"
                      :preview-src-list="selectedPetMedia.map(m => m.url).filter(Boolean)"
                      preview-teleported
                    />
                    <div class="gallery-overlay">
                      <el-icon class="switch-icon"><Check /></el-icon>
                      <el-button 
                        type="danger" 
                        size="small" 
                        circle 
                        @click.stop="deleteMedia(media)"
                        class="delete-btn"
                      >
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-info">
              <h2 class="detail-name">{{ selectedPet.name }}</h2>
              <el-tag :type="getStatusTagType(selectedPet.status || '')" size="large" class="detail-status">
                {{ selectedPet.status }}
              </el-tag>
              
              <div class="detail-section">
                <h4>基本信息</h4>
                <el-descriptions :column="1" border>
                  <el-descriptions-item label="种类">{{ selectedPet.species }}</el-descriptions-item>
                  <el-descriptions-item label="性别">{{ selectedPet.gender }}</el-descriptions-item>
                  <el-descriptions-item label="年龄">{{ selectedPet.age }}月</el-descriptions-item>
                  <el-descriptions-item label="健康状况">{{ selectedPet.healthStatus }}</el-descriptions-item>
                  <el-descriptions-item label="疫苗状态">
                    <el-tag :type="selectedPet.vaccinated ? 'success' : 'warning'">
                      {{ selectedPet.vaccinated ? '已接种' : '未接种' }}
                    </el-tag>
                  </el-descriptions-item>
                </el-descriptions>
              </div>
              
              <div class="detail-section" v-if="selectedPet.description">
                <h4>描述</h4>
                <p class="detail-description">{{ selectedPet.description }}</p>
              </div>
              
              <div class="detail-section">
                <h4>时间信息</h4>
                <el-descriptions :column="1" border>
                  <el-descriptions-item label="创建时间">
                    {{ selectedPet.createdAt ? new Date(selectedPet.createdAt).toLocaleString() : '未知' }}
                  </el-descriptions-item>
                  <el-descriptions-item label="更新时间">
                    {{ selectedPet.updatedAt ? new Date(selectedPet.updatedAt).toLocaleString() : '未知' }}
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
      <template #footer>
        <el-button @click="showDetailDialog = false">关闭</el-button>
        <el-button type="primary" @click="selectedPet && editPet(selectedPet)">编辑</el-button>
      </template>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="showDeleteDialog"
      title="确认删除"
      width="400px"
    >
      <span>确定删除宠物 <strong>{{ petToDelete?.name }}</strong> 吗？此操作不可恢复。</span>
      <template #footer>
        <el-button @click="showDeleteDialog = false">取消</el-button>
        <el-button type="danger" @click="deletePet">删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, Check, User, FirstAidKit, Connection, Male, Timer, Delete, 
  Search, Refresh, Download, Filter, ArrowDown, ArrowUp, View, Edit,
  TrendCharts, Loading
} from '@element-plus/icons-vue'
import { getAllPets, createPet, updatePet, deletePet as deletePetApi } from '../api/petsApi'
import type { Pet } from '../stores/types'
import { createPetMedia, getPetMediaByPetId, deletePetMedia, getAllPetMedia } from '../api/petMediaApi'
import type { PetMedia } from '../api/petMediaApi'
import { uploadFile } from '../api/ossApi'
import dayjs from 'dayjs'
import { useUserStore } from '../stores/user'

const pets = ref<Pet[]>([])
const loading = ref(false)
const error = ref('')
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)
const searchQuery = ref('')
const showAddDialog = ref(false)
const showDeleteDialog = ref(false)
const showDetailDialog = ref(false)
const showAdvancedFilters = ref(false)
const selectedPets = ref<number[]>([])
const selectedPet = ref<Pet | null>(null)
const isEdit = ref(false)
const petToDelete = ref<Pet | null>(null)
const petFormRef = ref()
const ageRange = ref([0, 20])
const ageMarks = {
  0: '0月',
  5: '5月',
  10: '10月',
  15: '15月',
  20: '20月'
}
const uploading = ref(false)
const petMediaList = ref<PetMedia[]>([])
const selectedPetMedia = ref<PetMedia[]>([])
const currentPetImage = ref<string>('')
const petImagePreferences = ref<Record<number, string>>({})
// 用户 store
const userStore = useUserStore()

const petForm = reactive<Pet & { imageUrl?: string }>({
  petId: 0,
  orgId: userStore.currentUser?.userId,
  name: '',
  species: '',
  age: 0,
  gender: '公',
  healthStatus: '健康',
  status: '可领养',
  vaccinated: 0,
  description: '',
  imageUrl: ''
})
const petRules = {
  name: [{ required: true, message: '请输入宠物名称', trigger: 'blur' }],
  species: [{ required: true, message: '请输入种类', trigger: 'blur' }],
  age: [{ type: 'number', required: true, message: '请输入年龄', trigger: 'change' }]
}

const filterForm = reactive({
  species: '',
  gender: '',
  healthStatus: '',
  status: '',
  sortBy: '',
  vaccinated: null as number | null
})

const totalPets = computed(() => pets.value.length)
const availablePets = computed(() => pets.value.filter(p => p.status === '可领养').length)
const adoptedPets = computed(() => pets.value.filter(p => p.status === '已领养').length)
const vaccinatedPets = computed(() => pets.value.filter(p => p.vaccinated).length)
const speciesOptions = computed(() => Array.from(new Set(pets.value.map(p => p.species).filter(Boolean))))

const statusClass = (status: string) => {
  switch (status) {
    case '可领养': return 'available'
    case '已领养': return 'adopted'
    case '隔离中': return 'isolation'
    default: return ''
  }
}

const getStatusTagType = (status: string) => {
  switch (status) {
    case '可领养': return 'success'
    case '已领养': return 'info'
    case '隔离中': return 'warning'
    default: return ''
  }
}

const petImage = (pet: Pet) => {
  // 优先显示用户选择的图片
  if (pet.petId && petImagePreferences.value[pet.petId]) {
    return petImagePreferences.value[pet.petId]
  }
  
  // 如果有媒体列表，优先显示第一张图片
  const petMedia = petMediaList.value.find(media => media.petId === pet.petId)
  if (petMedia?.url) {
    return petMedia.url
  }
  
  // 否则使用默认图片
  const map: Record<string,string> = {
    '金毛犬': new URL('../assets/dog1.png', import.meta.url).href,
    '波斯猫': new URL('../assets/cat1.png', import.meta.url).href
  }
  return map[pet.species || ''] || new URL('../assets/default-avatar.png', import.meta.url).href
}

const fetchPets = async () => {
  loading.value = true
  error.value = ''
  try {
    // 并行获取宠物数据和媒体数据
    const [petsResponse, mediaResponse] = await Promise.all([
      getAllPets(),
      // 这里可以获取所有媒体数据，或者根据需要获取
      getAllPetMedia()
    ])
    
    let data = petsResponse.data || []
    petMediaList.value = mediaResponse.data || []
    console.log(petMediaList.value, 99999999999999)
    // 搜索过滤
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      data = data.filter(p => 
        p.name?.toLowerCase().includes(query) || 
        p.species?.toLowerCase().includes(query)
      )
    }

    // 基础筛选
    if (filterForm.species) data = data.filter(p => p.species === filterForm.species)
    if (filterForm.gender) data = data.filter(p => p.gender === filterForm.gender)
    if (filterForm.healthStatus) data = data.filter(p => p.healthStatus === filterForm.healthStatus)
    if (filterForm.status) data = data.filter(p => p.status === filterForm.status)
    if (filterForm.vaccinated !== null) data = data.filter(p => p.vaccinated === filterForm.vaccinated)

    // 年龄范围筛选
    data = data.filter(p => p.age && p.age >= ageRange.value[0] && p.age <= ageRange.value[1])

    // 排序
    if (filterForm.sortBy === 'age_asc') data.sort((a,b) => (a.age || 0) - (b.age || 0))
    if (filterForm.sortBy === 'age_desc') data.sort((a,b) => (b.age || 0) - (a.age || 0))
    if (filterForm.sortBy === 'created_asc') data.sort((a,b) => (a.petId || 0) - (b.petId || 0))
    if (filterForm.sortBy === 'created_desc') data.sort((a,b) => (b.petId || 0) - (a.petId || 0))
    if (filterForm.sortBy === 'name_asc') data.sort((a,b) => (a.name || '').localeCompare(b.name || ''))
    if (filterForm.sortBy === 'name_desc') data.sort((a,b) => (b.name || '').localeCompare(a.name || ''))

    total.value = data.length
    pets.value = data.slice((currentPage.value-1)*pageSize.value, currentPage.value*pageSize.value)
  } catch (err) {
    error.value = '网络连接失败，请检查网络后重试'
    console.error('获取宠物数据失败:', err)
  } finally {
    loading.value = false
  }
}

// 加载用户图片偏好设置
const loadImagePreferences = () => {
  try {
    const saved = localStorage.getItem('petImagePreferences')
    if (saved) {
      petImagePreferences.value = JSON.parse(saved)
    }
  } catch (err) {
    console.error('加载图片偏好设置失败:', err)
    petImagePreferences.value = {}
  }
}

onMounted(() => {
  loadImagePreferences()
  fetchPets()
})

const handleSearch = () => { currentPage.value = 1; fetchPets() }
const handleSearchClear = () => { currentPage.value = 1; fetchPets() }

const applyFilters = () => { currentPage.value = 1; fetchPets() }
const resetFilters = () => {
  Object.assign(filterForm, { species:'', gender:'', healthStatus:'', status:'', sortBy:'', vaccinated: null})
  ageRange.value = [0, 20]
  currentPage.value = 1
  fetchPets()
}

const handleSizeChange = (size: number) => { pageSize.value = size; fetchPets() }
const handleCurrentChange = (page: number) => { currentPage.value = page; fetchPets() }

const editPet = (pet: Pet) => {
  Object.assign(petForm, {
    ...pet,
    // 确保vaccinated字段是布尔值，用于switch组件
    vaccinated: pet.vaccinated ? true : false
  })
  isEdit.value = true
  showAddDialog.value = true
}

const submitForm = () => {
  petFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    try {
      // 准备提交的数据，确保类型正确
      const submitData = {
        ...petForm,
        // 将布尔值转换为数字
        vaccinated: petForm.vaccinated ? 1 : 0,
        createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        // 移除前端添加的字段
        imageUrl: undefined
      }
      
      let petId: number
      if (isEdit.value) {
        await updatePet(submitData)
        petId = petForm.petId || 0
      } else {
        const response = await createPet(submitData)
        if(response.data == -1) {
          ElMessage.error('宠物添加失败')
          return
        } else {
          petId = response.data || 0

        }
      }
      console.log(petId, petForm.imageUrl, petForm.imageUrl !== '', petId !== 0)
      // 如果有图片，保存到petMedia
      if (petForm.imageUrl !== '' && petId !== 0) {
        const mediaData: PetMedia = {
          petId: petId,
          mediaType: 'image',
          url: petForm.imageUrl,
          uploadedAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
        }
        console.log(mediaData)
        await createPetMedia(mediaData)
      }
      
      ElMessage.success('操作成功')
      showAddDialog.value = false
      resetForm()
      fetchPets()
    } catch (err: any) {
      console.error('提交表单失败:', err)
      
      // 更详细的错误信息
      let errorMessage = '操作失败'
      if (err.response) {
        errorMessage = `服务器错误 (${err.response.status}): ${err.response.data?.message || err.response.statusText}`
      } else if (err.request) {
        errorMessage = '网络连接失败，请检查网络'
      } else {
        errorMessage = err.message || '操作失败'
      }
      
      ElMessage.error(errorMessage)
    }
  })
}

const resetForm = () => {
  Object.assign(petForm, { 
    petId: 0, 
    orgId: userStore.currentUser?.userId,
    name: '', 
    species: '', 
    age: 0, 
    gender: '公', 
    healthStatus: '健康', 
    status: '可领养', 
    vaccinated: 0,
    description: '',
    imageUrl: ''
  })
  isEdit.value = false
}

const beforeImageUpload = (file: File) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg'
  const isLt2M = file.size / 1024 / 1024 < 2

  console.log('文件验证:', {
    name: file.name,
    type: file.type,
    size: file.size,
    sizeMB: (file.size / 1024 / 1024).toFixed(2)
  })

  if (!isJPG) {
    ElMessage.error('上传图片只能是 JPG/PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!')
    return false
  }
  
  return true
}

const handleImageUpload = async (options: any) => {
  try {
    uploading.value = true
    const { file } = options
    const timestamp = dayjs().format('YYYYMMDDHHmmss')
    
    // 清理文件名，移除特殊字符
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileExtension = cleanFileName.split('.').pop() || 'jpg'
    const newFileName = `pet_${timestamp}.${fileExtension}`
    
    console.log('开始上传图片:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      newFileName,
      prefix: 'pet/petImage/'
    })
    
    // 上传到OSS
    const res = await uploadFile(file, 'pet/petImage/', newFileName)
    
    console.log('上传响应:', res)
    
    if (res.data && res.data.success) {
      petForm.imageUrl = res.data.url
      ElMessage.success('图片上传成功')
    } else {
      const errorMsg = res.data?.message || '上传失败'
      ElMessage.error(`上传失败: ${errorMsg}`)
      console.error('上传失败响应:', res)
    }
  } catch (err: any) {
    console.error('图片上传失败:', err)
    
    // 更详细的错误信息
    let errorMessage = '上传出错'
    if (err.response) {
      // 服务器响应了错误状态码
      errorMessage = `服务器错误 (${err.response.status}): ${err.response.data?.message || err.response.statusText}`
    } else if (err.request) {
      // 请求已发出但没有收到响应
      errorMessage = '网络连接失败，请检查网络'
    } else {
      // 其他错误
      errorMessage = err.message || '上传出错'
    }
    
    ElMessage.error(errorMessage)
  } finally {
    uploading.value = false
  }
}

const confirmDelete = (pet: Pet) => { petToDelete.value = pet; showDeleteDialog.value = true }
const deletePet = async () => {
  if (!petToDelete.value) return
  try {
await deletePetApi(petToDelete.value?.petId || 0)
    ElMessage.success('删除成功')
    showDeleteDialog.value = false
    fetchPets()
  } catch {
    ElMessage.error('删除失败')
  }
}

const batchDelete = async () => {
  if (!selectedPets.value.length) return
  
  try {
    await ElMessageBox.confirm(
      `确定删除选中的 ${selectedPets.value.length} 只宠物吗？此操作不可恢复。`,
      '批量删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    for (const id of selectedPets.value) await deletePetApi(id)
    ElMessage.success('批量删除成功')
    selectedPets.value = []
    fetchPets()
  } catch (error) {
    if (error !== 'cancel') {
    ElMessage.error('批量删除失败')
    }
  }
}

const viewPetDetail = async (pet: Pet) => {
  selectedPet.value = pet
  showDetailDialog.value = true
  
  // 获取该宠物的媒体数据
  if (pet.petId) {
    try {
      const response = await getPetMediaByPetId(pet.petId)
      selectedPetMedia.value = response.data || []
      
      // 设置当前显示的图片
      const savedImage = petImagePreferences.value[pet.petId]
      if (savedImage && selectedPetMedia.value.some(m => m.url === savedImage)) {
        currentPetImage.value = savedImage
      } else if (selectedPetMedia.value.length > 0) {
        currentPetImage.value = selectedPetMedia.value[0].url || ''
      } else {
        currentPetImage.value = ''
      }
    } catch (err) {
      console.error('获取宠物媒体失败:', err)
      selectedPetMedia.value = []
      currentPetImage.value = ''
    }
  }
}

const switchPetImage = (imageUrl: string) => {
  if (!selectedPet.value?.petId) return
  
  currentPetImage.value = imageUrl
  petImagePreferences.value[selectedPet.value.petId] = imageUrl
  
  // 保存到localStorage实现持久化
  localStorage.setItem('petImagePreferences', JSON.stringify(petImagePreferences.value))
  
  ElMessage.success('已设为主图')
}

const deleteMedia = async (media: PetMedia) => {
  try {
    await ElMessageBox.confirm(
      '确定删除这张照片吗？',
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    if (media.mediaId) {
      await deletePetMedia(media.mediaId)
      // 从列表中移除
      selectedPetMedia.value = selectedPetMedia.value.filter(m => m.mediaId !== media.mediaId)
      ElMessage.success('照片删除成功')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const exportData = async () => {
  try {
    const response = await getAllPets()
    const data = response.data || []
    
    // 创建CSV内容
    const headers = ['ID', '名称', '种类', '年龄', '性别', '健康状况', '状态', '疫苗状态', '创建时间']
    const csvContent = [
      headers.join(','),
      ...data.map(pet => [
        pet.petId || '',
        pet.name || '',
        pet.species || '',
        pet.age || '',
        pet.gender || '',
        pet.healthStatus || '',
        pet.status || '',
        pet.vaccinated ? '已接种' : '未接种',
        pet.createdAt ? new Date(pet.createdAt).toLocaleString() : ''
      ].join(','))
    ].join('\n')
    
    // 创建下载链接
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `宠物数据_${new Date().toLocaleDateString()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    ElMessage.success('数据导出成功')
  } catch (error) {
    ElMessage.error('数据导出失败')
  }
}
</script>

<style scoped>
.pets-page { 
  padding: 24px; 
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

/* 页面头部样式 */
.page-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: flex-start; 
  margin-bottom: 24px; 
  flex-wrap: wrap; 
  gap: 16px;
}

.header-left {
  flex: 1;
}

.page-title { 
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
}

.title-icon {
  font-size: 32px;
  color: #409EFF;
}

.page-subtitle {
  margin: 0;
  color: #7f8c8d;
  font-size: 14px;
}

.header-actions { 
  display: flex; 
  gap: 12px; 
  flex-wrap: wrap; 
  align-items: center; 
}

.search-input { 
  width: 280px; 
}

/* 统计卡片样式 */
.stats-container { 
  margin-bottom: 24px; 
}

.stat-card { 
  text-align: center; 
  border-radius: 12px;
  transition: all 0.3s ease;
  border: none;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.stat-content { 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  gap: 16px; 
  padding: 20px;
}

.stat-icon-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.stat-icon-wrapper.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-icon-wrapper.available {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.stat-icon-wrapper.adopted {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.stat-icon-wrapper.vaccinated {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
}

.stat-icon { 
  font-size: 24px; 
}

.stat-info {
  text-align: left;
}

.stat-value { 
  font-size: 32px; 
  font-weight: 700; 
  color: #2c3e50;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label { 
  font-size: 14px; 
  color: #7f8c8d;
  margin-bottom: 8px;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #67C23A;
}

.trend-icon {
  font-size: 14px;
}

/* 筛选器样式 */
.filter-container { 
  margin-bottom: 24px; 
}

.filter-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #2c3e50;
}

.toggle-filters {
  color: #409EFF;
}

.filter-form {
  padding: 20px;
}

.advanced-filters {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.filter-actions {
  margin-top: 20px;
  text-align: center;
}

/* 宠物卡片样式 */
.pets-container { 
  margin-bottom: 24px; 
}

.pet-col {
  animation: fadeInUp 0.6s ease-out;
  animation-fill-mode: both;
}

.pet-col:nth-child(1) { animation-delay: 0.1s; }
.pet-col:nth-child(2) { animation-delay: 0.2s; }
.pet-col:nth-child(3) { animation-delay: 0.3s; }
.pet-col:nth-child(4) { animation-delay: 0.4s; }
.pet-col:nth-child(5) { animation-delay: 0.5s; }
.pet-col:nth-child(6) { animation-delay: 0.6s; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.pet-card { 
  position: relative; 
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  cursor: pointer;
}

.pet-card:hover,
.pet-card:focus {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  outline: 2px solid #409EFF;
  outline-offset: 2px;
}

.pet-image-container { 
  position: relative; 
  overflow: hidden;
}

.pet-image { 
  width: 100%; 
  height: 200px; 
  transition: transform 0.3s ease;
}

.pet-card:hover .pet-image {
  transform: scale(1.05);
}

.pet-status { 
  position: absolute; 
  top: 12px; 
  left: 12px; 
  padding: 4px 8px; 
  color: #fff; 
  border-radius: 6px; 
  font-size: 12px; 
  font-weight: 500;
  backdrop-filter: blur(10px);
}

.pet-status.available { 
  background: rgba(103, 194, 58, 0.9);
}

.pet-status.adopted { 
  background: rgba(245, 108, 108, 0.9);
}

.pet-status.isolation { 
  background: rgba(230, 162, 60, 0.9);
}

.select-pet { 
  position: absolute; 
  top: 12px; 
  right: 12px; 
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  padding: 4px;
}

.pet-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.pet-card:hover .pet-overlay {
  opacity: 1;
}

.view-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  color: #409EFF;
}

.pet-info { 
  padding: 16px; 
}

.pet-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 12px; 
}

.pet-name { 
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.pet-details { 
  display: flex; 
  flex-wrap: wrap; 
  gap: 8px; 
  margin-bottom: 12px; 
  font-size: 14px; 
  color: #606266;
}

.pet-detail-item { 
  display: flex; 
  align-items: center; 
  gap: 4px;
  flex: 1;
  min-width: 50%;
}

.detail-icon {
  font-size: 16px;
  color: #909399;
}

.detail-icon.vaccinated {
  color: #67C23A;
}

.pet-detail-item .vaccinated {
  color: #67C23A;
  font-weight: 500;
}

.pet-description {
  font-size: 13px;
  color: #909399;
  line-height: 1.4;
  margin-bottom: 12px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 6px;
}

.pet-actions { 
  display: flex; 
  justify-content: flex-end; 
  gap: 8px; 
}

.action-btn {
  border-radius: 6px;
}

/* 宠物详情对话框样式 */
.pet-detail-dialog .el-dialog__body {
  padding: 20px;
}

.pet-detail-content {
  padding: 20px 0;
}

.detail-image-container {
  text-align: center;
}

.detail-image {
  width: 100%;
  height: 300px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.detail-info {
  padding-left: 20px;
}

.detail-name {
  margin: 0 0 12px 0;
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
}

.detail-status {
  margin-bottom: 20px;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.detail-description {
  line-height: 1.6;
  color: #606266;
  margin: 0;
}

/* 宠物相册样式 */
.pet-gallery {
  margin-top: 20px;
}

.pet-gallery h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
}

.gallery-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.gallery-item:hover {
  transform: scale(1.05);
}

.gallery-item.active {
  border-color: #409EFF;
  box-shadow: 0 0 10px rgba(64, 158, 255, 0.3);
}

.gallery-image {
  width: 100%;
  height: 80px;
  border-radius: 6px;
}

.gallery-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.gallery-item:hover .gallery-overlay {
  opacity: 1;
}

.gallery-item.active .gallery-overlay {
  background: rgba(64, 158, 255, 0.8);
  opacity: 1;
}

.switch-icon {
  color: white;
  font-size: 18px;
}

.delete-btn {
  width: 24px;
  height: 24px;
  padding: 0;
  min-height: 24px;
}

.delete-btn .el-icon {
  font-size: 12px;
}

/* 分页样式 */
.pagination-container { 
  text-align: center; 
  margin-top: 24px; 
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

/* 加载状态样式 */
.loading-container {
  padding: 40px;
  text-align: center;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.skeleton-card {
  border-radius: 12px;
  padding: 20px;
  background: white;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.error-container {
  padding: 40px;
  text-align: center;
}

/* 图片上传样式 */
.pet-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.pet-uploader:hover {
  border-color: #409EFF;
}

.pet-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.pet-upload-image {
  width: 178px;
  height: 178px;
  display: block;
}

.upload-tip {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .pets-page {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .search-input {
    width: 100%;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .stat-content {
    flex-direction: column;
    gap: 12px;
  }
  
  .stat-info {
    text-align: center;
  }
  
  .detail-info {
    padding-left: 0;
    margin-top: 20px;
  }
}

@media (max-width: 480px) {
  .pet-details {
    flex-direction: column;
  }
  
  .pet-detail-item {
    min-width: 100%;
  }
  
  .pet-actions {
    flex-direction: column;
  }
}
</style>
