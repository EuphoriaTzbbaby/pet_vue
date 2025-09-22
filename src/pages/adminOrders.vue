<template>
  <div class="admin-orders">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">订单管理</h1>
        <p class="page-subtitle">管理所有商品订单和交易记录</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="exportOrders">
          <DocumentArrowDownIcon class="btn-icon" />
          导出订单
        </button>
      </div>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filters-section">
      <div class="filters-row">
        <div class="filter-group">
          <label>订单状态</label>
          <select v-model="filters.status">
            <option value="">全部状态</option>
            <option value="pending">待付款</option>
            <option value="paid">已付款</option>
            <option value="processing">处理中</option>
            <option value="shipped">已发货</option>
            <option value="delivered">已送达</option>
            <option value="cancelled">已取消</option>
            <option value="refunded">已退款</option>
          </select>
        </div>
        <div class="filter-group">
          <label>时间范围</label>
          <select v-model="filters.dateRange">
            <option value="">全部时间</option>
            <option value="today">今天</option>
            <option value="week">最近一周</option>
            <option value="month">最近一月</option>
            <option value="quarter">最近三月</option>
          </select>
        </div>
        <div class="filter-group">
          <label>金额范围</label>
          <select v-model="filters.amountRange">
            <option value="">全部金额</option>
            <option value="0-100">0-100元</option>
            <option value="100-500">100-500元</option>
            <option value="500-1000">500-1000元</option>
            <option value="1000+">1000元以上</option>
          </select>
        </div>
        <div class="search-group">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="搜索订单号、用户名或商品名称..."
            class="search-input"
          />
          <MagnifyingGlassIcon class="search-icon" />
        </div>
      </div>
    </div>

    <!-- 订单统计 -->
    <div class="stats-row">
      <div class="stat-item">
        <div class="stat-value">{{ orderStats.total }}</div>
        <div class="stat-label">总订单数</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">¥{{ orderStats.totalAmount.toLocaleString() }}</div>
        <div class="stat-label">总交易额</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ orderStats.pending }}</div>
        <div class="stat-label">待处理</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ orderStats.completed }}</div>
        <div class="stat-label">已完成</div>
      </div>
    </div>

    <!-- 订单列表 -->
    <div class="orders-container">
      <div class="orders-header">
        <h3 class="orders-title">订单列表</h3>
        <div class="orders-actions">
          <button class="btn btn-sm" @click="refreshOrders">
            <ArrowPathIcon class="btn-icon" />
            刷新
          </button>
        </div>
      </div>
      
      <div class="orders-table">
        <div class="table-header">
          <div class="header-cell order-id">订单号</div>
          <div class="header-cell customer">客户信息</div>
          <div class="header-cell products">商品信息</div>
          <div class="header-cell amount">金额</div>
          <div class="header-cell status">状态</div>
          <div class="header-cell date">下单时间</div>
          <div class="header-cell actions">操作</div>
        </div>
        
        <div v-for="order in filteredOrders" :key="order.id" class="table-row">
          <div class="table-cell order-id">
            <div class="order-number">#{{ order.orderNumber }}</div>
            <div class="order-type">{{ order.type }}</div>
          </div>
          
          <div class="table-cell customer">
            <div class="customer-info">
              <div class="customer-avatar">
                <img :src="order.customer.avatar" :alt="order.customer.name" />
              </div>
              <div class="customer-details">
                <div class="customer-name">{{ order.customer.name }}</div>
                <div class="customer-contact">{{ order.customer.phone }}</div>
              </div>
            </div>
          </div>
          
          <div class="table-cell products">
            <div class="product-list">
              <div v-for="item in order.items.slice(0, 2)" :key="item.id" class="product-item">
                <img :src="item.image" :alt="item.name" class="product-image" />
                <div class="product-info">
                  <div class="product-name">{{ item.name }}</div>
                  <div class="product-spec">{{ item.specification }} × {{ item.quantity }}</div>
                </div>
              </div>
              <div v-if="order.items.length > 2" class="more-products">
                +{{ order.items.length - 2 }} 更多商品
              </div>
            </div>
          </div>
          
          <div class="table-cell amount">
            <div class="order-amount">¥{{ order.totalAmount.toLocaleString() }}</div>
            <div class="payment-method">{{ order.paymentMethod }}</div>
          </div>
          
          <div class="table-cell status">
            <div class="status-badge" :class="order.status">
              <component :is="getStatusIcon(order.status)" class="status-icon" />
              {{ getStatusText(order.status) }}
            </div>
          </div>
          
          <div class="table-cell date">
            <div class="order-date">{{ formatDate(order.createdAt) }}</div>
            <div class="order-time">{{ formatTime(order.createdAt) }}</div>
          </div>
          
          <div class="table-cell actions">
            <div class="action-buttons">
              <button class="action-btn view" @click="viewOrder(order)" title="查看详情">
                <EyeIcon class="action-icon" />
              </button>
              <button 
                v-if="order.status === 'paid'" 
                class="action-btn process" 
                @click="processOrder(order)" 
                title="处理订单"
              >
                <CogIcon class="action-icon" />
              </button>
              <button 
                v-if="order.status === 'processing'" 
                class="action-btn ship" 
                @click="shipOrder(order)" 
                title="发货"
              >
                <TruckIcon class="action-icon" />
              </button>
              <button 
                v-if="['pending', 'paid'].includes(order.status)" 
                class="action-btn cancel" 
                @click="cancelOrder(order)" 
                title="取消订单"
              >
                <XMarkIcon class="action-icon" />
              </button>
            </div>
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

    <!-- 订单详情模态框 -->
    <div v-if="selectedOrder" class="modal-overlay" @click="closeOrderModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>订单详情 - #{{ selectedOrder.orderNumber }}</h3>
          <button class="close-btn" @click="closeOrderModal">
            <XMarkIcon class="close-icon" />
          </button>
        </div>
        <div class="modal-body">
          <div class="order-details">
            <div class="detail-section">
              <h4>基本信息</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>订单号</label>
                  <span>#{{ selectedOrder.orderNumber }}</span>
                </div>
                <div class="detail-item">
                  <label>订单状态</label>
                  <div class="status-badge" :class="selectedOrder.status">
                    {{ getStatusText(selectedOrder.status) }}
                  </div>
                </div>
                <div class="detail-item">
                  <label>下单时间</label>
                  <span>{{ formatDateTime(selectedOrder.createdAt) }}</span>
                </div>
                <div class="detail-item">
                  <label>支付方式</label>
                  <span>{{ selectedOrder.paymentMethod }}</span>
                </div>
              </div>
            </div>
            
            <div class="detail-section">
              <h4>客户信息</h4>
              <div class="customer-detail">
                <div class="customer-avatar">
                  <img :src="selectedOrder.customer.avatar" :alt="selectedOrder.customer.name" />
                </div>
                <div class="customer-info">
                  <div class="customer-name">{{ selectedOrder.customer.name }}</div>
                  <div class="customer-contact">{{ selectedOrder.customer.phone }}</div>
                  <div class="customer-email">{{ selectedOrder.customer.email }}</div>
                </div>
              </div>
            </div>
            
            <div class="detail-section">
              <h4>商品清单</h4>
              <div class="items-list">
                <div v-for="item in selectedOrder.items" :key="item.id" class="item-row">
                  <img :src="item.image" :alt="item.name" class="item-image" />
                  <div class="item-info">
                    <div class="item-name">{{ item.name }}</div>
                    <div class="item-spec">{{ item.specification }}</div>
                  </div>
                  <div class="item-quantity">× {{ item.quantity }}</div>
                  <div class="item-price">¥{{ item.price.toLocaleString() }}</div>
                </div>
              </div>
            </div>
            
            <div class="detail-section">
              <h4>费用明细</h4>
              <div class="cost-breakdown">
                <div class="cost-item">
                  <span>商品总价</span>
                  <span>¥{{ selectedOrder.subtotal.toLocaleString() }}</span>
                </div>
                <div class="cost-item">
                  <span>运费</span>
                  <span>¥{{ selectedOrder.shippingFee.toLocaleString() }}</span>
                </div>
                <div class="cost-item">
                  <span>优惠金额</span>
                  <span class="discount">-¥{{ selectedOrder.discount.toLocaleString() }}</span>
                </div>
                <div class="cost-item total">
                  <span>订单总额</span>
                  <span>¥{{ selectedOrder.totalAmount.toLocaleString() }}</span>
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
  EyeIcon,
  CogIcon,
  TruckIcon,
  XMarkIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

// 响应式数据
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = 10
const selectedOrder = ref(null)

const filters = ref({
  status: '',
  dateRange: '',
  amountRange: ''
})

const orderStats = ref({
  total: 1247,
  totalAmount: 2456789,
  pending: 23,
  completed: 1156
})

const orders = ref([
  {
    id: 1,
    orderNumber: 'ORD20241201001',
    type: '商品订单',
    customer: {
      name: '张三',
      phone: '138****5678',
      email: 'zhangsan@example.com',
      avatar: 'https://via.placeholder.com/40x40'
    },
    items: [
      {
        id: 1,
        name: '高级狗粮',
        specification: '5kg装',
        quantity: 2,
        price: 299,
        image: 'https://via.placeholder.com/60x60'
      },
      {
        id: 2,
        name: '宠物玩具',
        specification: '橡胶球',
        quantity: 1,
        price: 59,
        image: 'https://via.placeholder.com/60x60'
      }
    ],
    subtotal: 657,
    shippingFee: 15,
    discount: 20,
    totalAmount: 652,
    paymentMethod: '微信支付',
    status: 'paid',
    createdAt: new Date('2024-12-01 10:30:00')
  },
  {
    id: 2,
    orderNumber: 'ORD20241201002',
    type: '商品订单',
    customer: {
      name: '李四',
      phone: '139****9876',
      email: 'lisi@example.com',
      avatar: 'https://via.placeholder.com/40x40'
    },
    items: [
      {
        id: 3,
        name: '猫砂',
        specification: '10L装',
        quantity: 1,
        price: 89,
        image: 'https://via.placeholder.com/60x60'
      }
    ],
    subtotal: 89,
    shippingFee: 10,
    discount: 0,
    totalAmount: 99,
    paymentMethod: '支付宝',
    status: 'processing',
    createdAt: new Date('2024-12-01 14:20:00')
  },
  {
    id: 3,
    orderNumber: 'ORD20241201003',
    type: '商品订单',
    customer: {
      name: '王五',
      phone: '137****1234',
      email: 'wangwu@example.com',
      avatar: 'https://via.placeholder.com/40x40'
    },
    items: [
      {
        id: 4,
        name: '宠物洗护用品套装',
        specification: '洗发水+护毛素',
        quantity: 1,
        price: 158,
        image: 'https://via.placeholder.com/60x60'
      },
      {
        id: 5,
        name: '宠物指甲剪',
        specification: '不锈钢',
        quantity: 1,
        price: 35,
        image: 'https://via.placeholder.com/60x60'
      },
      {
        id: 6,
        name: '宠物梳子',
        specification: '双面梳',
        quantity: 1,
        price: 42,
        image: 'https://via.placeholder.com/60x60'
      }
    ],
    subtotal: 235,
    shippingFee: 12,
    discount: 15,
    totalAmount: 232,
    paymentMethod: '银行卡',
    status: 'shipped',
    createdAt: new Date('2024-11-30 16:45:00')
  }
])

// 计算属性
const filteredOrders = computed(() => {
  let result = orders.value
  
  // 状态筛选
  if (filters.value.status) {
    result = result.filter(order => order.status === filters.value.status)
  }
  
  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(order => 
      order.orderNumber.toLowerCase().includes(query) ||
      order.customer.name.toLowerCase().includes(query) ||
      order.items.some(item => item.name.toLowerCase().includes(query))
    )
  }
  
  return result
})

const totalPages = computed(() => {
  return Math.ceil(filteredOrders.value.length / pageSize)
})

// 方法
const getStatusIcon = (status) => {
  const iconMap = {
    pending: ClockIcon,
    paid: CheckCircleIcon,
    processing: CogIcon,
    shipped: TruckIcon,
    delivered: CheckCircleIcon,
    cancelled: XMarkIcon,
    refunded: ExclamationTriangleIcon
  }
  return iconMap[status] || ClockIcon
}

const getStatusText = (status) => {
  const textMap = {
    pending: '待付款',
    paid: '已付款',
    processing: '处理中',
    shipped: '已发货',
    delivered: '已送达',
    cancelled: '已取消',
    refunded: '已退款'
  }
  return textMap[status] || '未知状态'
}

const formatDate = (date) => {
  return date.toLocaleDateString('zh-CN')
}

const formatTime = (date) => {
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const formatDateTime = (date) => {
  return date.toLocaleString('zh-CN')
}

const viewOrder = (order) => {
  selectedOrder.value = order
}

const closeOrderModal = () => {
  selectedOrder.value = null
}

const processOrder = (order) => {
  console.log('处理订单:', order.orderNumber)
  // 这里应该调用API更新订单状态
  order.status = 'processing'
}

const shipOrder = (order) => {
  console.log('发货:', order.orderNumber)
  // 这里应该调用API更新订单状态
  order.status = 'shipped'
}

const cancelOrder = (order) => {
  if (confirm(`确定要取消订单 ${order.orderNumber} 吗？`)) {
    console.log('取消订单:', order.orderNumber)
    // 这里应该调用API更新订单状态
    order.status = 'cancelled'
  }
}

const refreshOrders = () => {
  console.log('刷新订单列表')
  // 这里应该重新加载订单数据
}

const exportOrders = () => {
  console.log('导出订单')
  alert('导出功能开发中...')
}

const loadOrders = async () => {
  try {
    // 这里应该调用实际的API
    console.log('加载订单列表')
  } catch (error) {
    console.error('加载订单列表失败:', error)
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.admin-orders {
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

.orders-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.orders-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.orders-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.orders-table {
  overflow-x: auto;
}

.table-header {
  display: grid;
  grid-template-columns: 150px 200px 250px 120px 120px 140px 120px;
  gap: 16px;
  padding: 16px 24px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.table-row {
  display: grid;
  grid-template-columns: 150px 200px 250px 120px 120px 140px 120px;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.2s;
}

.table-row:hover {
  background: #f9fafb;
}

.table-cell {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.order-number {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
}

.order-type {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 2px;
}

.customer-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.customer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.customer-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.customer-name {
  font-weight: 500;
  color: #1f2937;
  font-size: 0.875rem;
}

.customer-contact {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 2px;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.product-image {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
}

.product-name {
  font-size: 0.75rem;
  font-weight: 500;
  color: #1f2937;
  line-height: 1.2;
}

.product-spec {
  font-size: 0.625rem;
  color: #6b7280;
}

.more-products {
  font-size: 0.75rem;
  color: #6b7280;
  font-style: italic;
}

.order-amount {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
}

.payment-method {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 2px;
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

.status-badge.pending {
  background: #fef3c7;
  color: #d97706;
}

.status-badge.paid {
  background: #dcfce7;
  color: #166534;
}

.status-badge.processing {
  background: #dbeafe;
  color: #1e40af;
}

.status-badge.shipped {
  background: #e0e7ff;
  color: #3730a3;
}

.status-badge.delivered {
  background: #dcfce7;
  color: #166534;
}

.status-badge.cancelled {
  background: #fee2e2;
  color: #dc2626;
}

.status-badge.refunded {
  background: #fef2f2;
  color: #b91c1c;
}

.status-icon {
  width: 12px;
  height: 12px;
}

.order-date {
  font-size: 0.875rem;
  color: #1f2937;
}

.order-time {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 2px;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

.action-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.view {
  background: #dbeafe;
  color: #1e40af;
}

.action-btn.view:hover {
  background: #bfdbfe;
}

.action-btn.process {
  background: #fef3c7;
  color: #d97706;
}

.action-btn.process:hover {
  background: #fde68a;
}

.action-btn.ship {
  background: #e0e7ff;
  color: #3730a3;
}

.action-btn.ship:hover {
  background: #c7d2fe;
}

.action-btn.cancel {
  background: #fee2e2;
  color: #dc2626;
}

.action-btn.cancel:hover {
  background: #fecaca;
}

.action-icon {
  width: 14px;
  height: 14px;
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

.order-details {
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

.customer-detail {
  display: flex;
  align-items: center;
  gap: 16px;
}

.customer-detail .customer-avatar {
  width: 60px;
  height: 60px;
}

.customer-detail .customer-name {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.customer-detail .customer-contact,
.customer-detail .customer-email {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 2px;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.item-image {
  width: 50px;
  height: 50px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
}

.item-name {
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 2px;
}

.item-spec {
  font-size: 0.875rem;
  color: #6b7280;
}

.item-quantity {
  font-size: 0.875rem;
  color: #6b7280;
  min-width: 60px;
  text-align: center;
}

.item-price {
  font-weight: 600;
  color: #1f2937;
  min-width: 80px;
  text-align: right;
}

.cost-breakdown {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cost-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.cost-item.total {
  border-top: 1px solid #e5e7eb;
  padding-top: 12px;
  font-weight: 600;
  font-size: 1.125rem;
}

.discount {
  color: #059669;
}

@media (max-width: 1200px) {
  .table-header,
  .table-row {
    grid-template-columns: 120px 180px 200px 100px 100px 120px 100px;
  }
}

@media (max-width: 768px) {
  .admin-orders {
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
  
  .orders-table {
    font-size: 0.75rem;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .table-cell {
    padding: 8px 0;
    border-bottom: 1px solid #f3f4f6;
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