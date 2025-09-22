<template>
  <div class="admin-pet-categories">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">宠物分类管理</h1>
        <p class="page-subtitle">管理宠物的种类和品种分类</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="showAddCategoryModal = true">
          <PlusIcon class="btn-icon" />
          添加分类
        </button>
      </div>
    </div>

    <!-- 分类树形结构 -->
    <div class="categories-container">
      <div class="category-tree">
        <div v-for="category in categories" :key="category.id" class="category-item">
          <div class="category-header" @click="toggleCategory(category)">
            <div class="category-info">
              <ChevronRightIcon 
                class="expand-icon" 
                :class="{ expanded: category.expanded }"
                v-if="category.children && category.children.length > 0"
              />
              <div class="category-icon" :style="{ backgroundColor: category.color }">
                <component :is="getCategoryIcon(category.type)" class="icon" />
              </div>
              <div class="category-details">
                <h3 class="category-name">{{ category.name }}</h3>
                <p class="category-description">{{ category.description }}</p>
              </div>
            </div>
            <div class="category-stats">
              <span class="pet-count">{{ category.petCount }} 只宠物</span>
              <div class="category-actions">
                <button class="action-btn edit" @click.stop="editCategory(category)" title="编辑">
                  <PencilIcon class="action-icon" />
                </button>
                <button class="action-btn add" @click.stop="addSubCategory(category)" title="添加子分类">
                  <PlusIcon class="action-icon" />
                </button>
                <button class="action-btn delete" @click.stop="deleteCategory(category)" title="删除">
                  <TrashIcon class="action-icon" />
                </button>
              </div>
            </div>
          </div>
          
          <!-- 子分类 -->
          <div v-if="category.expanded && category.children" class="subcategories">
            <div v-for="subcategory in category.children" :key="subcategory.id" class="subcategory-item">
              <div class="subcategory-info">
                <div class="subcategory-icon" :style="{ backgroundColor: subcategory.color }">
                  <component :is="getCategoryIcon(subcategory.type)" class="icon" />
                </div>
                <div class="subcategory-details">
                  <h4 class="subcategory-name">{{ subcategory.name }}</h4>
                  <p class="subcategory-description">{{ subcategory.description }}</p>
                </div>
              </div>
              <div class="subcategory-stats">
                <span class="pet-count">{{ subcategory.petCount }} 只</span>
                <div class="subcategory-actions">
                  <button class="action-btn edit" @click="editCategory(subcategory)" title="编辑">
                    <PencilIcon class="action-icon" />
                  </button>
                  <button class="action-btn delete" @click="deleteCategory(subcategory)" title="删除">
                    <TrashIcon class="action-icon" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑分类模态框 -->
    <div v-if="showAddCategoryModal || editingCategory" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ editingCategory ? '编辑分类' : (parentCategory ? '添加子分类' : '添加分类') }}</h3>
          <button class="close-btn" @click="closeModal">
            <XMarkIcon class="close-icon" />
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveCategory">
            <div class="form-group">
              <label>分类名称</label>
              <input v-model="categoryForm.name" type="text" required />
            </div>
            <div class="form-group">
              <label>分类描述</label>
              <textarea v-model="categoryForm.description" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label>分类类型</label>
              <select v-model="categoryForm.type" required>
                <option value="dog">狗</option>
                <option value="cat">猫</option>
                <option value="bird">鸟</option>
                <option value="fish">鱼</option>
                <option value="rabbit">兔子</option>
                <option value="hamster">仓鼠</option>
                <option value="other">其他</option>
              </select>
            </div>
            <div class="form-group">
              <label>分类颜色</label>
              <div class="color-picker">
                <input v-model="categoryForm.color" type="color" />
                <span class="color-preview" :style="{ backgroundColor: categoryForm.color }"></span>
              </div>
            </div>
            <div v-if="parentCategory" class="form-group">
              <label>父分类</label>
              <input :value="parentCategory.name" type="text" disabled />
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="closeModal">
                取消
              </button>
              <button type="submit" class="btn btn-primary">
                {{ editingCategory ? '更新' : '创建' }}
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
  XMarkIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline'
import {
  HeartIcon,
  SparklesIcon,
  FireIcon,
  BoltIcon
} from '@heroicons/vue/24/solid'

// 响应式数据
const categories = ref([])
const showAddCategoryModal = ref(false)
const editingCategory = ref(null)
const parentCategory = ref(null)
const categoryForm = ref({
  name: '',
  description: '',
  type: 'dog',
  color: '#3b82f6'
})

// 方法
const loadCategories = async () => {
  try {
    // 这里应该调用实际的API
    // 暂时使用模拟数据
    categories.value = [
      {
        id: 1,
        name: '犬类',
        description: '各种品种的狗狗',
        type: 'dog',
        color: '#f59e0b',
        petCount: 156,
        expanded: false,
        children: [
          {
            id: 11,
            name: '金毛寻回犬',
            description: '温顺友好的大型犬',
            type: 'dog',
            color: '#fbbf24',
            petCount: 23,
            parentId: 1
          },
          {
            id: 12,
            name: '泰迪',
            description: '小巧可爱的贵宾犬',
            type: 'dog',
            color: '#f97316',
            petCount: 45,
            parentId: 1
          },
          {
            id: 13,
            name: '哈士奇',
            description: '活泼好动的雪橇犬',
            type: 'dog',
            color: '#06b6d4',
            petCount: 18,
            parentId: 1
          }
        ]
      },
      {
        id: 2,
        name: '猫类',
        description: '各种品种的猫咪',
        type: 'cat',
        color: '#8b5cf6',
        petCount: 89,
        expanded: false,
        children: [
          {
            id: 21,
            name: '英国短毛猫',
            description: '温顺的短毛猫品种',
            type: 'cat',
            color: '#a78bfa',
            petCount: 32,
            parentId: 2
          },
          {
            id: 22,
            name: '波斯猫',
            description: '优雅的长毛猫',
            type: 'cat',
            color: '#c084fc',
            petCount: 15,
            parentId: 2
          }
        ]
      },
      {
        id: 3,
        name: '鸟类',
        description: '各种观赏鸟类',
        type: 'bird',
        color: '#10b981',
        petCount: 34,
        expanded: false,
        children: [
          {
            id: 31,
            name: '鹦鹉',
            description: '聪明会说话的鸟类',
            type: 'bird',
            color: '#34d399',
            petCount: 12,
            parentId: 3
          },
          {
            id: 32,
            name: '金丝雀',
            description: '美丽的歌唱鸟',
            type: 'bird',
            color: '#fbbf24',
            petCount: 8,
            parentId: 3
          }
        ]
      },
      {
        id: 4,
        name: '小型宠物',
        description: '兔子、仓鼠等小型宠物',
        type: 'other',
        color: '#ef4444',
        petCount: 67,
        expanded: false,
        children: [
          {
            id: 41,
            name: '兔子',
            description: '可爱的小兔子',
            type: 'rabbit',
            color: '#f87171',
            petCount: 28,
            parentId: 4
          },
          {
            id: 42,
            name: '仓鼠',
            description: '小巧的仓鼠',
            type: 'hamster',
            color: '#fb7185',
            petCount: 39,
            parentId: 4
          }
        ]
      }
    ]
  } catch (error) {
    console.error('加载分类列表失败:', error)
  }
}

const getCategoryIcon = (type) => {
  const iconMap = {
    dog: HeartIcon,
    cat: SparklesIcon,
    bird: BoltIcon,
    fish: FireIcon,
    rabbit: HeartIcon,
    hamster: SparklesIcon,
    other: BoltIcon
  }
  return iconMap[type] || HeartIcon
}

const toggleCategory = (category) => {
  if (category.children && category.children.length > 0) {
    category.expanded = !category.expanded
  }
}

const editCategory = (category) => {
  editingCategory.value = category
  categoryForm.value = {
    name: category.name,
    description: category.description,
    type: category.type,
    color: category.color
  }
}

const addSubCategory = (category) => {
  parentCategory.value = category
  showAddCategoryModal.value = true
}

const closeModal = () => {
  showAddCategoryModal.value = false
  editingCategory.value = null
  parentCategory.value = null
  categoryForm.value = {
    name: '',
    description: '',
    type: 'dog',
    color: '#3b82f6'
  }
}

const saveCategory = async () => {
  try {
    if (editingCategory.value) {
      // 更新分类
      console.log('更新分类:', categoryForm.value)
    } else {
      // 创建分类
      const newCategory = {
        ...categoryForm.value,
        parentId: parentCategory.value?.id || null
      }
      console.log('创建分类:', newCategory)
    }
    closeModal()
    await loadCategories()
  } catch (error) {
    console.error('保存分类失败:', error)
  }
}

const deleteCategory = async (category) => {
  if (confirm(`确定要删除分类 "${category.name}" 吗？`)) {
    try {
      console.log('删除分类:', category.name)
      await loadCategories()
    } catch (error) {
      console.error('删除分类失败:', error)
    }
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.admin-pet-categories {
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

.categories-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.category-tree {
  padding: 0;
}

.category-item {
  border-bottom: 1px solid #f3f4f6;
}

.category-item:last-child {
  border-bottom: none;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  cursor: pointer;
  transition: background 0.2s;
}

.category-header:hover {
  background: #f9fafb;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.expand-icon {
  width: 16px;
  height: 16px;
  color: #6b7280;
  transition: transform 0.2s;
}

.expand-icon.expanded {
  transform: rotate(90deg);
}

.category-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.category-icon .icon {
  width: 24px;
  height: 24px;
  color: white;
}

.category-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.category-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.category-stats {
  display: flex;
  align-items: center;
  gap: 16px;
}

.pet-count {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.category-actions {
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

.action-btn.add {
  background: #dcfce7;
  color: #166534;
}

.action-btn.add:hover {
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

.subcategories {
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.subcategory-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px 16px 80px;
  border-bottom: 1px solid #e5e7eb;
}

.subcategory-item:last-child {
  border-bottom: none;
}

.subcategory-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.subcategory-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.subcategory-icon .icon {
  width: 16px;
  height: 16px;
  color: white;
}

.subcategory-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 2px 0;
}

.subcategory-description {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
}

.subcategory-stats {
  display: flex;
  align-items: center;
  gap: 12px;
}

.subcategory-actions {
  display: flex;
  gap: 6px;
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
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
}

.form-group textarea {
  resize: vertical;
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-picker input[type="color"] {
  width: 50px;
  height: 40px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.color-preview {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

@media (max-width: 768px) {
  .admin-pet-categories {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .category-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .category-stats {
    align-self: stretch;
    justify-content: space-between;
  }
  
  .subcategory-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding-left: 60px;
  }
  
  .subcategory-stats {
    align-self: stretch;
    justify-content: space-between;
  }
}
</style>