<template>
  <div class="supplies-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">用品管理</h1>
          <p class="page-subtitle">管理系统中的所有用品信息</p>
        </div>
        <div class="header-actions">
          <el-input
            v-model="searchQuery"
            placeholder="搜索用品..."
            prefix-icon="Search"
            clearable
            @clear="handleSearchClear"
            @keyup.enter="handleSearch"
            class="search-input"
          />
          <el-button type="primary" @click="showAddDialog = true">
            <el-icon><Plus /></el-icon>
            添加用品
          </el-button>
          <el-button type="success" @click="showImportDialog = true">
            <el-icon><Upload /></el-icon>
            批量导入
          </el-button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-container">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon total">
                <el-icon><Box /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ totalProducts }}</div>
                <div class="stat-label">用品总数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon value">
                <el-icon><Money /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">¥{{ totalValue.toFixed(2) }}</div>
                <div class="stat-label">总库存价值</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon stock">
                <el-icon><Box /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ totalStock }}</div>
                <div class="stat-label">总库存量</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon active">
                <el-icon><CircleCheck /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ activeProducts }}</div>
                <div class="stat-label">上架用品</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <el-card shadow="never">
        <el-form :inline="true" :model="filterForm" class="filter-form">
          <el-form-item label="分类">
            <el-select v-model="filterForm.categoryId" placeholder="选择分类" clearable>
              <el-option
                v-for="category in categories"
                :key="category.categoryId"
                :label="category.name"
                :value="category.categoryId"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="filterForm.status" placeholder="选择状态" clearable>
              <el-option label="上架" value="on_sale" />
              <el-option label="下架" value="off_sale" />
            </el-select>
          </el-form-item>
          <el-form-item label="价格范围">
            <el-input-number
              v-model="filterForm.minPrice"
              :min="0"
              placeholder="最低价"
              class="price-input"
            />
            <span class="range-separator">-</span>
            <el-input-number
              v-model="filterForm.maxPrice"
              :min="0"
              placeholder="最高价"
              class="price-input"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleFilter">筛选</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 产品列表 -->
    <div class="products-section">
      <div class="section-header">
        <h2 class="section-title">用品列表</h2>
        <div class="section-actions">
          <el-tooltip content="刷新列表" placement="top">
            <el-button circle @click="fetchProducts">
              <el-icon><Refresh /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="批量操作" placement="top">
            <el-button circle @click="showBatchActions = !showBatchActions">
              <el-icon><Operation /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </div>

      <el-card shadow="never">
        <el-table
          v-loading="loading"
          :data="products"
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column label="ID" prop="productId" width="80" />
          <el-table-column label="用品名称" prop="name" min-width="150">
            <template #default="{ row }">
              <div class="product-name">
                <el-image
                  :src="getProductImage(row.name)"
                  fit="cover"
                  class="product-image"
                />
                <span>{{ row.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="分类" prop="categoryId" width="120">
            <template #default="{ row }">
              {{ getCategoryName(row.categoryId) }}
            </template>
          </el-table-column>
          <el-table-column label="价格" prop="price" width="120">
            <template #default="{ row }">
              <span class="price">¥{{ row.price.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="库存" prop="stock" width="100">
            <template #default="{ row }">
              <el-tag :type="row.stock > 10 ? 'success' : 'warning'">
                {{ row.stock }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" prop="status" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'on_sale' ? 'success' : 'info'">
                {{ row.status === 'on_sale' ? '上架' : '下架' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" prop="createdAt" width="180">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="220" fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                link
                @click="handleEdit(row)"
              >
                编辑
              </el-button>
              <el-button
                type="warning"
                link
                @click="handleToggleStatus(row)"
              >
                {{ row.status === 'on_sale' ? '下架' : '上架' }}
              </el-button>
              <el-button
                type="danger"
                link
                @click="handleDelete(row.productId)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 添加/编辑用品对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="isEdit ? '编辑用品' : '添加用品'"
      width="600px"
      @close="resetForm"
    >
      <el-form
        ref="productFormRef"
        :model="productForm"
        :rules="productRules"
        label-width="100px"
      >
        <el-form-item label="用品名称" prop="name">
          <el-input v-model="productForm.name" placeholder="请输入用品名称" />
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-select
            v-model="productForm.categoryId"
            placeholder="请选择分类"
            style="width: 100%"
          >
            <el-option
              v-for="category in categories"
              :key="category.categoryId"
              :label="category.name"
              :value="category.categoryId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="productForm.description"
            type="textarea"
            rows="3"
            placeholder="请输入用品描述"
          />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number
            v-model="productForm.price"
            :min="0"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number
            v-model="productForm.stock"
            :min="0"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="productForm.status">
            <el-radio label="on_sale">上架</el-radio>
            <el-radio label="off_sale">下架</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 批量操作对话框 -->
    <el-dialog
      v-model="showBatchActions"
      title="批量操作"
      width="400px"
    >
      <div class="batch-actions">
        <div class="batch-item">
          <h3>批量上架</h3>
          <p>将选中的用品全部上架</p>
          <el-button type="success" @click="batchUpdateStatus('on_sale')">
            批量上架
          </el-button>
        </div>
        <div class="batch-item">
          <h3>批量下架</h3>
          <p>将选中的用品全部下架</p>
          <el-button type="warning" @click="batchUpdateStatus('off_sale')">
            批量下架
          </el-button>
        </div>
        <div class="batch-item">
          <h3>批量删除</h3>
          <p>永久删除选中的用品，此操作不可恢复</p>
          <el-button type="danger" @click="batchDelete">
            批量删除
          </el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 导入对话框 -->
    <el-dialog
      v-model="showImportDialog"
      title="批量导入用品"
      width="500px"
    >
      <div class="import-container">
        <el-alert
          title="请下载模板文件，按照模板格式填写后上传"
          type="info"
          :closable="false"
          show-icon
          class="import-tip"
        />
        <el-button type="primary" @click="downloadTemplate">
          下载模板
        </el-button>
        <el-upload
          class="upload-area"
          drag
          :auto-upload="false"
          :on-change="handleFileChange"
          :limit="1"
          accept=".xlsx,.xls"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            将文件拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              只能上传 xlsx/xls 文件，且不超过 10MB
            </div>
          </template>
        </el-upload>
        <div v-if="importFile" class="file-info">
          <el-icon><Document /></el-icon>
          {{ importFile.name }}
          <el-button link type="danger" @click="removeFile">移除</el-button>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showImportDialog = false">取消</el-button>
          <el-button type="primary" @click="handleImport" :loading="importing">
            开始导入
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Search,
  Upload,
  Box,
  Money,
  Refresh,
  Operation,
  UploadFilled,
  Document,
  CircleCheck
} from '@element-plus/icons-vue'
import {
  createProduct,
  getProductById,
  getAllProducts,
  getProductsByCategory,
  updateProduct,
  updateStock,
  updateStatus,
  deleteProduct
} from '../api/productApi'

// 响应式数据
const loading = ref(false)
const products = ref([])
const categories = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const filterForm = reactive({
  categoryId: null,
  status: '',
  minPrice: null,
  maxPrice: null
})
const selectedProducts = ref([])
const showAddDialog = ref(false)
const showBatchActions = ref(false)
const showImportDialog = ref(false)
const isEdit = ref(false)
const productFormRef = ref()
const importFile = ref(null)
const importing = ref(false)

// 表单数据
const productForm = reactive({
  productId: null,
  categoryId: null,
  name: '',
  description: '',
  price: 0,
  stock: 0,
  status: 'on_sale'
})

// 表单验证规则
const productRules = {
  name: [
    { required: true, message: '请输入用品名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '价格必须大于0', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入库存', trigger: 'blur' },
    { type: 'number', min: 0, message: '库存不能为负数', trigger: 'blur' }
  ]
}

// 计算属性
const totalProducts = computed(() => products.value.length)
const totalValue = computed(() => {
  return products.value.reduce((sum, product) => {
    return sum + product.price * product.stock
  }, 0)
})
const totalStock = computed(() => {
  return products.value.reduce((sum, product) => sum + product.stock, 0)
})
const activeProducts = computed(() => {
  return products.value.filter(p => p.status === 'on_sale').length
})

// 获取用品图片
const getProductImage = (name) => {
  // 使用picsum.photos生成随机宠物图片
  const seed = name.replace(/\s/g, '-').toLowerCase()
  return `https://picsum.photos/seed/${seed}/100/100.jpg`
}

// 获取分类名称
const getCategoryName = (categoryId) => {
  const category = categories.value.find(c => c.categoryId === categoryId)
  return category ? category.name : '未知分类'
}

// 获取用品列表
const fetchProducts = async () => {
  loading.value = true
  try {
    let response
    if (filterForm.categoryId) {
      response = await getProductsByCategory(filterForm.categoryId)
    } else {
      response = await getAllProducts()
    }
    
    products.value = response.data || []
    total.value = products.value.length
  } catch (error) {
    console.error('获取用品列表失败:', error)
    ElMessage.error('获取用品列表失败')
  } finally {
    loading.value = false
  }
}

// 获取分类列表
const fetchCategories = async () => {
  try {
    const response = await getCategories()
    categories.value = response.data || []
  } catch (error) {
    console.error('获取分类列表失败:', error)
    ElMessage.error('获取分类列表失败')
  }
}

// 处理搜索
const handleSearch = () => {
  // 在实际应用中，这里应该调用搜索API
  ElMessage.info('搜索功能开发中...')
}

// 处理搜索清除
const handleSearchClear = () => {
  searchQuery.value = ''
  // 重新加载列表
  fetchProducts()
}

// 处理筛选
const handleFilter = () => {
  // 在实际应用中，这里应该调用筛选API
  ElMessage.info('筛选功能开发中...')
}

// 重置筛选
const resetFilter = () => {
  Object.keys(filterForm).forEach(key => {
    filterForm[key] = key === 'minPrice' || key === 'maxPrice' ? null : ''
  })
  fetchProducts()
}

// 处理分页
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchProducts()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchProducts()
}

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedProducts.value = selection
}

// 处理编辑
const handleEdit = async (row) => {
  isEdit.value = true
  try {
    const response = await getProductById(row.productId)
    Object.assign(productForm, response.data)
    showAddDialog.value = true
  } catch (error) {
    console.error('获取用品详情失败:', error)
    ElMessage.error('获取用品详情失败')
  }
}

// 处理添加
const handleAdd = () => {
  isEdit.value = false
  resetForm()
  showAddDialog.value = true
}

// 处理表单提交
const handleSubmit = async () => {
  if (!productFormRef.value) return
  
  await productFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          await updateProduct(productForm)
          ElMessage.success('用品更新成功')
        } else {
          await createProduct(productForm)
          ElMessage.success('用品添加成功')
        }
        showAddDialog.value = false
        fetchProducts()
      } catch (error) {
        console.error('保存用品失败:', error)
        ElMessage.error('保存用品失败')
      }
    }
  })
}

// 处理表单重置
const resetForm = () => {
  if (productFormRef.value) {
    productFormRef.value.resetFields()
  }
  Object.assign(productForm, {
    productId: null,
    categoryId: null,
    name: '',
    description: '',
    price: 0,
    stock: 0,
    status: 'on_sale'
  })
}

// 处理状态切换
const handleToggleStatus = async (row) => {
  try {
    const newStatus = row.status === 'on_sale' ? 'off_sale' : 'on_sale'
    await updateStatus(row.productId, newStatus)
    ElMessage.success(`用品已${newStatus === 'on_sale' ? '上架' : '下架'}`)
    fetchProducts()
  } catch (error) {
    console.error('更新状态失败:', error)
    ElMessage.error('更新状态失败')
  }
}

// 处理删除
const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个用品吗？此操作不可恢复', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteProduct(id)
    ElMessage.success('用品删除成功')
    fetchProducts()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用品失败:', error)
      ElMessage.error('删除用品失败')
    }
  }
}

// 批量更新状态
const batchUpdateStatus = async (status) => {
  if (selectedProducts.value.length === 0) {
    ElMessage.warning('请先选择要操作的用品')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要批量${status === 'on_sale' ? '上架' : '下架'}选中的 ${selectedProducts.value.length} 个用品吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const promises = selectedProducts.value.map(product => 
      updateStatus(product.productId, status)
    )
    
    await Promise.all(promises)
    ElMessage.success(`成功批量${status === 'on_sale' ? '上架' : '下架'}用品`)
    showBatchActions.value = false
    selectedProducts.value = []
    fetchProducts()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量更新状态失败:', error)
      ElMessage.error('批量更新状态失败')
    }
  }
}

// 批量删除
const batchDelete = async () => {
  if (selectedProducts.value.length === 0) {
    ElMessage.warning('请先选择要删除的用品')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedProducts.value.length} 个用品吗？此操作不可恢复`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }
    )
    
    const promises = selectedProducts.value.map(product => 
      deleteProduct(product.productId)
    )
    
    await Promise.all(promises)
    ElMessage.success('用品批量删除成功')
    showBatchActions.value = false
    selectedProducts.value = []
    fetchProducts()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  }
}

// 处理文件变化
const handleFileChange = (file) => {
  importFile.value = file.raw
}

// 移除文件
const removeFile = () => {
  importFile.value = null
}

// 下载模板
const downloadTemplate = () => {
  // 实际应用中应该提供真实的模板文件下载
  ElMessage.info('模板下载功能开发中...')
}

// 处理导入
const handleImport = () => {
  if (!importFile.value) {
    ElMessage.warning('请先选择要导入的文件')
    return
  }
  
  importing.value = true
  // 实际应用中这里应该调用导入API
  setTimeout(() => {
    importing.value = false
    ElMessage.success('导入成功')
    showImportDialog.value = false
    importFile.value = null
    fetchProducts()
  }, 1500)
}

// 生命周期钩子
onMounted(() => {
  fetchProducts()
  fetchCategories()
})
</script>

<style scoped>
.supplies-management {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
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
  font-size: 24px;
  margin: 0 0 8px 0;
  color: #303133;
}

.page-subtitle {
  color: #909399;
  margin: 0;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.search-input {
  width: 200px;
}

.stats-container {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
  color: white;
}

.stat-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.value {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.stock {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.active {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
}

.stat-label {
  color: #909399;
  font-size: 14px;
}

.filter-section {
  margin-bottom: 20px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.price-input {
  width: 120px;
}

.range-separator {
  margin: 0 10px;
}

.products-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  margin: 0;
  color: #303133;
}

.section-actions {
  display: flex;
  gap: 10px;
}

.product-name {
  display: flex;
  align-items: center;
}

.product-image {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  margin-right: 10px;
}

.price {
  color: #f56c6c;
  font-weight: bold;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.batch-actions {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.batch-item {
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.batch-item h3 {
  margin: 0 0 8px 0;
  color: #303133;
}

.batch-item p {
  margin: 0 0 10px 0;
  color: #606266;
  font-size: 14px;
}

.import-container {
  text-align: center;
}

.import-tip {
  margin-bottom: 20px;
}

.upload-area {
  margin: 20px 0;
}

.file-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}
</style>