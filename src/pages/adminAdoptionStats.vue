<template>
  <div class="admin-adoption-stats">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">领养统计</h1>
        <p class="page-subtitle">查看领养申请和成功率的详细统计数据</p>
      </div>
      <div class="header-actions">
        <select v-model="selectedPeriod" class="period-selector">
          <option value="week">最近一周</option>
          <option value="month">最近一月</option>
          <option value="quarter">最近三月</option>
          <option value="year">最近一年</option>
        </select>
        <button class="btn btn-primary" @click="exportReport">
          <DocumentArrowDownIcon class="btn-icon" />
          导出报告
        </button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon applications">
          <DocumentTextIcon class="icon" />
        </div>
        <div class="stat-content">
          <h3 class="stat-value">{{ stats.totalApplications }}</h3>
          <p class="stat-label">总申请数</p>
          <div class="stat-change positive">
            <ArrowUpIcon class="change-icon" />
            +{{ stats.applicationsGrowth }}%
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon approved">
          <CheckCircleIcon class="icon" />
        </div>
        <div class="stat-content">
          <h3 class="stat-value">{{ stats.approvedApplications }}</h3>
          <p class="stat-label">已通过</p>
          <div class="stat-change positive">
            <ArrowUpIcon class="change-icon" />
            +{{ stats.approvedGrowth }}%
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon success-rate">
          <ChartBarIcon class="icon" />
        </div>
        <div class="stat-content">
          <h3 class="stat-value">{{ stats.successRate }}%</h3>
          <p class="stat-label">成功率</p>
          <div class="stat-change" :class="stats.rateChange >= 0 ? 'positive' : 'negative'">
            <component :is="stats.rateChange >= 0 ? ArrowUpIcon : ArrowDownIcon" class="change-icon" />
            {{ stats.rateChange >= 0 ? '+' : '' }}{{ stats.rateChange }}%
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon completed">
          <HeartIcon class="icon" />
        </div>
        <div class="stat-content">
          <h3 class="stat-value">{{ stats.completedAdoptions }}</h3>
          <p class="stat-label">完成领养</p>
          <div class="stat-change positive">
            <ArrowUpIcon class="change-icon" />
            +{{ stats.completedGrowth }}%
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-container">
      <div class="chart-section">
        <div class="chart-header">
          <h3 class="chart-title">领养趋势</h3>
          <div class="chart-legend">
            <div class="legend-item">
              <div class="legend-color applications"></div>
              <span>申请数量</span>
            </div>
            <div class="legend-item">
              <div class="legend-color approved"></div>
              <span>通过数量</span>
            </div>
          </div>
        </div>
        <div class="chart-placeholder">
          <div class="chart-bars">
            <div v-for="(data, index) in chartData" :key="index" class="bar-group">
              <div class="bar applications" :style="{ height: data.applications + '%' }"></div>
              <div class="bar approved" :style="{ height: data.approved + '%' }"></div>
              <div class="bar-label">{{ data.label }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="chart-section">
        <div class="chart-header">
          <h3 class="chart-title">宠物类型分布</h3>
        </div>
        <div class="pet-type-stats">
          <div v-for="petType in petTypeStats" :key="petType.type" class="pet-type-item">
            <div class="pet-type-info">
              <div class="pet-type-icon" :style="{ backgroundColor: petType.color }">
                <component :is="getPetTypeIcon(petType.type)" class="icon" />
              </div>
              <div class="pet-type-details">
                <h4 class="pet-type-name">{{ petType.name }}</h4>
                <p class="pet-type-count">{{ petType.count }} 次领养</p>
              </div>
            </div>
            <div class="pet-type-percentage">{{ petType.percentage }}%</div>
            <div class="pet-type-bar">
              <div class="bar-fill" :style="{ width: petType.percentage + '%', backgroundColor: petType.color }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 详细数据表格 -->
    <div class="data-table-section">
      <div class="section-header">
        <h3 class="section-title">月度详细数据</h3>
        <div class="table-actions">
          <input v-model="searchQuery" type="text" placeholder="搜索..." class="search-input" />
        </div>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>月份</th>
              <th>申请数量</th>
              <th>通过数量</th>
              <th>拒绝数量</th>
              <th>成功率</th>
              <th>平均处理时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in filteredTableData" :key="row.month">
              <td class="month-cell">{{ row.month }}</td>
              <td class="number-cell">{{ row.applications }}</td>
              <td class="number-cell success">{{ row.approved }}</td>
              <td class="number-cell danger">{{ row.rejected }}</td>
              <td class="percentage-cell">
                <div class="percentage-bar">
                  <div class="bar-fill" :style="{ width: row.successRate + '%' }"></div>
                  <span class="percentage-text">{{ row.successRate }}%</span>
                </div>
              </td>
              <td class="time-cell">{{ row.avgProcessTime }} 天</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  DocumentArrowDownIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ChartBarIcon,
  HeartIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/vue/24/outline'
import {
  HeartIcon as HeartSolidIcon,
  SparklesIcon,
  FireIcon,
  BoltIcon
} from '@heroicons/vue/24/solid'

// 响应式数据
const selectedPeriod = ref('month')
const searchQuery = ref('')
const stats = ref({
  totalApplications: 1247,
  applicationsGrowth: 12.5,
  approvedApplications: 892,
  approvedGrowth: 8.3,
  successRate: 71.5,
  rateChange: 2.1,
  completedAdoptions: 834,
  completedGrowth: 15.7
})

const chartData = ref([
  { label: '1月', applications: 85, approved: 60 },
  { label: '2月', applications: 92, approved: 68 },
  { label: '3月', applications: 78, approved: 55 },
  { label: '4月', applications: 95, approved: 72 },
  { label: '5月', applications: 88, approved: 65 },
  { label: '6月', applications: 100, approved: 78 },
  { label: '7月', applications: 82, approved: 58 }
])

const petTypeStats = ref([
  {
    type: 'dog',
    name: '狗狗',
    count: 456,
    percentage: 54.7,
    color: '#f59e0b'
  },
  {
    type: 'cat',
    name: '猫咪',
    count: 289,
    percentage: 34.6,
    color: '#8b5cf6'
  },
  {
    type: 'bird',
    name: '鸟类',
    count: 56,
    percentage: 6.7,
    color: '#10b981'
  },
  {
    type: 'other',
    name: '其他',
    count: 33,
    percentage: 4.0,
    color: '#ef4444'
  }
])

const tableData = ref([
  {
    month: '2024年1月',
    applications: 156,
    approved: 112,
    rejected: 44,
    successRate: 71.8,
    avgProcessTime: 3.2
  },
  {
    month: '2024年2月',
    applications: 143,
    approved: 98,
    rejected: 45,
    successRate: 68.5,
    avgProcessTime: 3.8
  },
  {
    month: '2024年3月',
    applications: 167,
    approved: 125,
    rejected: 42,
    successRate: 74.9,
    avgProcessTime: 2.9
  },
  {
    month: '2024年4月',
    applications: 189,
    approved: 134,
    rejected: 55,
    successRate: 70.9,
    avgProcessTime: 3.1
  },
  {
    month: '2024年5月',
    applications: 172,
    approved: 118,
    rejected: 54,
    successRate: 68.6,
    avgProcessTime: 3.5
  },
  {
    month: '2024年6月',
    applications: 198,
    approved: 145,
    rejected: 53,
    successRate: 73.2,
    avgProcessTime: 2.8
  },
  {
    month: '2024年7月',
    applications: 222,
    approved: 160,
    rejected: 62,
    successRate: 72.1,
    avgProcessTime: 3.0
  }
])

// 计算属性
const filteredTableData = computed(() => {
  if (!searchQuery.value) {
    return tableData.value
  }
  return tableData.value.filter(row => 
    row.month.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// 方法
const getPetTypeIcon = (type) => {
  const iconMap = {
    dog: HeartSolidIcon,
    cat: SparklesIcon,
    bird: BoltIcon,
    other: FireIcon
  }
  return iconMap[type] || HeartSolidIcon
}

const exportReport = () => {
  // 这里应该实现导出功能
  console.log('导出统计报告')
  alert('导出功能开发中...')
}

const loadStats = async () => {
  try {
    // 这里应该调用实际的API
    console.log('加载统计数据')
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.admin-adoption-stats {
  padding: 24px;
  max-width: 1400px;
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

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.period-selector {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
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

.btn-icon {
  width: 16px;
  height: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon.applications {
  background: #dbeafe;
}

.stat-icon.approved {
  background: #dcfce7;
}

.stat-icon.success-rate {
  background: #fef3c7;
}

.stat-icon.completed {
  background: #fce7f3;
}

.stat-icon .icon {
  width: 28px;
  height: 28px;
}

.stat-icon.applications .icon {
  color: #1e40af;
}

.stat-icon.approved .icon {
  color: #166534;
}

.stat-icon.success-rate .icon {
  color: #d97706;
}

.stat-icon.completed .icon {
  color: #be185d;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 8px 0;
}

.stat-change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.stat-change.positive {
  color: #059669;
}

.stat-change.negative {
  color: #dc2626;
}

.change-icon {
  width: 12px;
  height: 12px;
}

.charts-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

.chart-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.chart-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.chart-legend {
  display: flex;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  color: #6b7280;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-color.applications {
  background: #3b82f6;
}

.legend-color.approved {
  background: #10b981;
}

.chart-placeholder {
  height: 300px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  height: 100%;
  width: 100%;
  justify-content: space-around;
}

.bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  height: 100%;
}

.bar {
  width: 20px;
  border-radius: 4px 4px 0 0;
  min-height: 4px;
  transition: all 0.3s;
}

.bar.applications {
  background: #3b82f6;
  margin-right: 4px;
}

.bar.approved {
  background: #10b981;
}

.bar-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: auto;
}

.pet-type-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pet-type-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pet-type-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.pet-type-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pet-type-icon .icon {
  width: 20px;
  height: 20px;
  color: white;
}

.pet-type-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 2px 0;
}

.pet-type-count {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.pet-type-percentage {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  min-width: 50px;
  text-align: right;
}

.pet-type-bar {
  width: 100px;
  height: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}

.data-table-section {
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
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  width: 200px;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #f3f4f6;
}

.data-table th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.data-table tbody tr:hover {
  background: #f9fafb;
}

.month-cell {
  font-weight: 500;
  color: #1f2937;
}

.number-cell {
  font-weight: 600;
  text-align: center;
}

.number-cell.success {
  color: #059669;
}

.number-cell.danger {
  color: #dc2626;
}

.percentage-cell {
  width: 150px;
}

.percentage-bar {
  position: relative;
  width: 100%;
  height: 20px;
  background: #f3f4f6;
  border-radius: 10px;
  overflow: hidden;
}

.percentage-bar .bar-fill {
  height: 100%;
  background: #10b981;
  border-radius: 10px;
}

.percentage-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.75rem;
  font-weight: 600;
  color: #1f2937;
}

.time-cell {
  text-align: center;
  color: #6b7280;
}

@media (max-width: 1024px) {
  .charts-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .admin-adoption-stats {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .search-input {
    width: 100%;
  }
}
</style>