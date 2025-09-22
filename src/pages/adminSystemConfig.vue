<template>
  <div class="admin-system-config">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">系统配置</h1>
        <p class="page-subtitle">管理系统的各项配置参数</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="resetToDefaults">
          <ArrowPathIcon class="btn-icon" />
          恢复默认
        </button>
        <button class="btn btn-primary" @click="saveAllConfigs" :disabled="!hasChanges">
          <CheckIcon class="btn-icon" />
          保存所有更改
        </button>
      </div>
    </div>

    <!-- 配置分类导航 -->
    <div class="config-nav">
      <button 
        v-for="category in configCategories" 
        :key="category.key"
        class="nav-item"
        :class="{ active: activeCategory === category.key }"
        @click="activeCategory = category.key"
      >
        <component :is="category.icon" class="nav-icon" />
        {{ category.name }}
      </button>
    </div>

    <!-- 配置内容区域 -->
    <div class="config-content">
      <!-- 基础设置 -->
      <div v-if="activeCategory === 'basic'" class="config-section">
        <div class="section-header">
          <h2 class="section-title">基础设置</h2>
          <p class="section-description">系统的基本配置信息</p>
        </div>
        
        <div class="config-grid">
          <div class="config-item">
            <label class="config-label">网站名称</label>
            <input 
              v-model="configs.basic.siteName" 
              type="text" 
              class="config-input"
              placeholder="请输入网站名称"
            />
            <p class="config-help">显示在浏览器标题栏和页面头部的网站名称</p>
          </div>
          
          <div class="config-item">
            <label class="config-label">网站描述</label>
            <textarea 
              v-model="configs.basic.siteDescription" 
              class="config-textarea"
              placeholder="请输入网站描述"
              rows="3"
            ></textarea>
            <p class="config-help">用于SEO和社交媒体分享的网站描述</p>
          </div>
          
          <div class="config-item">
            <label class="config-label">联系邮箱</label>
            <input 
              v-model="configs.basic.contactEmail" 
              type="email" 
              class="config-input"
              placeholder="请输入联系邮箱"
            />
            <p class="config-help">用户联系和系统通知的邮箱地址</p>
          </div>
          
          <div class="config-item">
            <label class="config-label">客服电话</label>
            <input 
              v-model="configs.basic.supportPhone" 
              type="tel" 
              class="config-input"
              placeholder="请输入客服电话"
            />
            <p class="config-help">显示给用户的客服联系电话</p>
          </div>
          
          <div class="config-item">
            <label class="config-label">网站状态</label>
            <div class="config-radio-group">
              <label class="radio-item">
                <input 
                  v-model="configs.basic.siteStatus" 
                  type="radio" 
                  value="online"
                />
                <span class="radio-label">正常运行</span>
              </label>
              <label class="radio-item">
                <input 
                  v-model="configs.basic.siteStatus" 
                  type="radio" 
                  value="maintenance"
                />
                <span class="radio-label">维护模式</span>
              </label>
            </div>
            <p class="config-help">维护模式下只有管理员可以访问网站</p>
          </div>
          
          <div class="config-item">
            <label class="config-label">维护公告</label>
            <textarea 
              v-model="configs.basic.maintenanceMessage" 
              class="config-textarea"
              placeholder="请输入维护期间显示的公告内容"
              rows="2"
              :disabled="configs.basic.siteStatus !== 'maintenance'"
            ></textarea>
            <p class="config-help">维护模式下显示给用户的公告信息</p>
          </div>
        </div>
      </div>

      <!-- 用户设置 -->
      <div v-if="activeCategory === 'user'" class="config-section">
        <div class="section-header">
          <h2 class="section-title">用户设置</h2>
          <p class="section-description">用户注册、登录和权限相关配置</p>
        </div>
        
        <div class="config-grid">
          <div class="config-item">
            <label class="config-label">允许用户注册</label>
            <div class="config-switch">
              <input 
                v-model="configs.user.allowRegistration" 
                type="checkbox" 
                class="switch-input"
                id="allowRegistration"
              />
              <label for="allowRegistration" class="switch-label"></label>
            </div>
            <p class="config-help">关闭后新用户无法注册账号</p>
          </div>
          
          <div class="config-item">
            <label class="config-label">邮箱验证</label>
            <div class="config-switch">
              <input 
                v-model="configs.user.requireEmailVerification" 
                type="checkbox" 
                class="switch-input"
                id="requireEmailVerification"
              />
              <label for="requireEmailVerification" class="switch-label"></label>
            </div>
            <p class="config-help">新用户注册后需要验证邮箱才能使用</p>
          </div>
          
          <div class="config-item">
            <label class="config-label">密码最小长度</label>
            <input 
              v-model.number="configs.user.minPasswordLength" 
              type="number" 
              class="config-input"
              min="6" 
              max="20"
            />
            <p class="config-help">用户密码的最小长度要求（6-20位）</p>
          </div>
          
          <div class="config-item">
            <label class="config-label">登录失败锁定</label>
            <div class="config-switch">
              <input 
                v-model="configs.user.enableLoginLock" 
                type="checkbox" 
                class="switch-input"
                id="enableLoginLock"
              />
              <label for="enableLoginLock" class="switch-label"></label>
            </div>
            <p class="config-help">多次登录失败后临时锁定账号</p>
          </div>
          
          <div class="config-item">
            <label class="config-label">最大失败次数</label>
            <input 
              v-model.number="configs.user.maxLoginAttempts" 
              type="number" 
              class="config-input"
              min="3" 
              max="10"
              :disabled="!configs.user.enableLoginLock"
            />
            <p class="config-help">触发账号锁定的最大登录失败次数</p>
          </div>
          
          <div class="config-item">
            <label class="config-label">锁定时长（分钟）</label>
            <input 
              v-model.number="configs.user.lockDuration" 
              type="number" 
              class="config-input"
              min="5" 
              max="1440"
              :disabled="!configs.user.enableLoginLock"
            />
            <p class="config-help">账号被锁定的时长（5-1440分钟）</p>
          </div>
        </div>
      </div>

      <!-- 内容设置 -->
      <div v-if="activeCategory === 'content'" class="config-section">
        <div class="section-header">
          <h2 class="section-title">内容设置</h2>
          <p class="section-description">帖子、评论和媒体文件相关配置</p>
        </div>
        
        <div class="config-grid">
          <div class="config-item">
            <label class="config-label">内容审核</label>
            <div class="config-radio-group">
              <label class="radio-item">
                <input 
                  v-model="configs.content.moderationMode" 
                  type="radio" 
                  value="none"
                />
                <span class="radio-label">无审核</span>
              </label>
              <label class="radio-item">
                <input 
                  v-model="configs.content.moderationMode" 
                  type="radio" 
                  value="auto"
                />
                <span class="radio-label">自动审核</span>
              </label>
              <label class="radio-item">
                <input 
                  v-model="configs.content.moderationMode" 
                  type="radio" 
                  value="manual"
                />
                <span class="radio-label">人工审核</span>
              </label>
            </div>
            <p class="config-help">选择内容发布前的审核方式</p>
          </div>
          
          <div class="config-item">
            <label class="config-label">最大文件大小（MB）</label>
            <input 
              v-model.number="configs.content.maxFileSize" 
              type="number" 
              class="config-input"
              min="1" 
              max="100"
            />
            <p class="config-help">用户上传文件的最大大小限制</p>
          </div>
          
          <div class="config-item">
            <label class="config-label">允许的文件类型</label>
            <div class="config-checkbox-group">
              <label class="checkbox-item" v-for="fileType in fileTypes" :key="fileType.value">
                <input 
                  v-model="configs.content.allowedFileTypes" 
                  type="checkbox" 
                  :value="fileType.value"
                />
                <span class="checkbox-label">{{ fileType.label }}</span>
              </label>
            </div>
            <p class="config-help">用户可以上传的文件类型</p>
          </div>
          
          <div class="config-item">
            <label class="config-label">敏感词过滤</label>
            <div class="config-switch">
              <input 
                v-model="configs.content.enableWordFilter" 
                type="checkbox" 
                class="switch-input"
                id="enableWordFilter"
              />
              <label for="enableWordFilter" class="switch-label"></label>
            </div>
            <p class="config-help">自动过滤和替换敏感词汇</p>
          </div>
          
          <div class="config-item">
            <label class="config-label">敏感词列表</label>
            <textarea 
              v-model="configs.content.sensitiveWords" 
              class="config-textarea"
              placeholder="请输入敏感词，每行一个"
              rows="5"
              :disabled="!configs.content.enableWordFilter"
            ></textarea>
            <p class="config-help">每行输入一个敏感词，系统会自动过滤这些词汇</p>
          </div>
        </div>
      </div>

      <!-- 通知设置 -->
      <div v-if="activeCategory === 'notification'" class="config-section">
        <div class="section-header">
          <h2 class="section-title">通知设置</h2>
          <p class="section-description">邮件、短信和系统通知相关配置</p>
        </div>
        
        <div class="config-grid">
          <div class="config-item">
            <label class="config-label">邮件服务</label>
            <div class="config-switch">
              <input 
                v-model="configs.notification.enableEmail" 
                type="checkbox" 
                class="switch-input"
                id="enableEmail"
              />
              <label for="enableEmail" class="switch-label"></label>
            </div>
            <p class="config-help">启用邮件通知功能</p>
          </div>
          
          <div class="config-item">
            <label class="config-label">SMTP服务器</label>
            <input 
              v-model="configs.notification.smtpHost" 
              type="text" 
              class="config-input"
              placeholder="请输入SMTP服务器地址"
              :disabled="!configs.notification.enableEmail"
            />
            <p class="config-help">邮件发送服务器地址</p>
          </div>
          
          <div class="config-item">
            <label class="config-label">SMTP端口</label>
            <input 
              v-model.number="configs.notification.smtpPort" 
              type="number" 
              class="config-input"
              placeholder="587"
              :disabled="!configs.notification.enableEmail"
            />
            <p class="config-help">SMTP服务器端口号</p>
          </div>
          
          <div class="config-item">
            <label class="config-label">发件人邮箱</label>
            <input 
              v-model="configs.notification.senderEmail" 
              type="email" 
              class="config-input"
              placeholder="请输入发件人邮箱"
              :disabled="!configs.notification.enableEmail"
            />
            <p class="config-help">系统邮件的发件人地址</p>
          </div>
          
          <div class="config-item">
            <label class="config-label">邮箱密码</label>
            <input 
              v-model="configs.notification.senderPassword" 
              type="password" 
              class="config-input"
              placeholder="请输入邮箱密码或授权码"
              :disabled="!configs.notification.enableEmail"
            />
            <p class="config-help">发件人邮箱的密码或授权码</p>
          </div>
          
          <div class="config-item">
            <label class="config-label">短信服务</label>
            <div class="config-switch">
              <input 
                v-model="configs.notification.enableSMS" 
                type="checkbox" 
                class="switch-input"
                id="enableSMS"
              />
              <label for="enableSMS" class="switch-label"></label>
            </div>
            <p class="config-help">启用短信通知功能</p>
          </div>
          
          <div class="config-item">
            <label class="config-label">短信服务商</label>
            <select 
              v-model="configs.notification.smsProvider" 
              class="config-select"
              :disabled="!configs.notification.enableSMS"
            >
              <option value="">请选择短信服务商</option>
              <option value="aliyun">阿里云</option>
              <option value="tencent">腾讯云</option>
              <option value="huawei">华为云</option>
            </select>
            <p class="config-help">选择使用的短信服务提供商</p>
          </div>
        </div>
      </div>

      <!-- 安全设置 -->
      <div v-if="activeCategory === 'security'" class="config-section">
        <div class="section-header">
          <h2 class="section-title">安全设置</h2>
          <p class="section-description">系统安全和防护相关配置</p>
        </div>
        
        <div class="config-grid">
          <div class="config-item">
            <label class="config-label">启用HTTPS</label>
            <div class="config-switch">
              <input 
                v-model="configs.security.enableHTTPS" 
                type="checkbox" 
                class="switch-input"
                id="enableHTTPS"
              />
              <label for="enableHTTPS" class="switch-label"></label>
            </div>
            <p class="config-help">强制使用HTTPS加密连接</p>
          </div>
          
          <div class="config-item">
            <label class="config-label">会话超时（分钟）</label>
            <input 
              v-model.number="configs.security.sessionTimeout" 
              type="number" 
              class="config-input"
              min="15" 
              max="1440"
            />
            <p class="config-help">用户会话的超时时间（15-1440分钟）</p>
          </div>
          
          <div class="config-item">
            <label class="config-label">IP访问限制</label>
            <div class="config-switch">
              <input 
                v-model="configs.security.enableIPLimit" 
                type="checkbox" 
                class="switch-input"
                id="enableIPLimit"
              />
              <label for="enableIPLimit" class="switch-label"></label>
            </div>
            <p class="config-help">限制单个IP的访问频率</p>
          </div>
          
          <div class="config-item">
            <label class="config-label">每分钟最大请求数</label>
            <input 
              v-model.number="configs.security.maxRequestsPerMinute" 
              type="number" 
              class="config-input"
              min="10" 
              max="1000"
              :disabled="!configs.security.enableIPLimit"
            />
            <p class="config-help">单个IP每分钟允许的最大请求数</p>
          </div>
          
          <div class="config-item">
            <label class="config-label">验证码</label>
            <div class="config-switch">
              <input 
                v-model="configs.security.enableCaptcha" 
                type="checkbox" 
                class="switch-input"
                id="enableCaptcha"
              />
              <label for="enableCaptcha" class="switch-label"></label>
            </div>
            <p class="config-help">在登录和注册时显示验证码</p>
          </div>
          
          <div class="config-item">
            <label class="config-label">数据备份</label>
            <div class="config-switch">
              <input 
                v-model="configs.security.enableAutoBackup" 
                type="checkbox" 
                class="switch-input"
                id="enableAutoBackup"
              />
              <label for="enableAutoBackup" class="switch-label"></label>
            </div>
            <p class="config-help">启用自动数据备份功能</p>
          </div>
          
          <div class="config-item">
            <label class="config-label">备份频率</label>
            <select 
              v-model="configs.security.backupFrequency" 
              class="config-select"
              :disabled="!configs.security.enableAutoBackup"
            >
              <option value="daily">每日</option>
              <option value="weekly">每周</option>
              <option value="monthly">每月</option>
            </select>
            <p class="config-help">自动备份的执行频率</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 保存确认对话框 -->
    <div v-if="showSaveDialog" class="modal-overlay" @click="closeSaveDialog">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>保存配置</h3>
          <button class="close-btn" @click="closeSaveDialog">
            <XMarkIcon class="close-icon" />
          </button>
        </div>
        <div class="modal-body">
          <p>确定要保存所有配置更改吗？部分配置可能需要重启系统才能生效。</p>
          <div class="changed-configs">
            <h4>已更改的配置：</h4>
            <ul>
              <li v-for="change in configChanges" :key="change">{{ change }}</li>
            </ul>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeSaveDialog">取消</button>
          <button class="btn btn-primary" @click="confirmSave">确认保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import {
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  Cog6ToothIcon,
  UserIcon,
  DocumentTextIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon
} from '@heroicons/vue/24/outline'

// 响应式数据
const activeCategory = ref('basic')
const showSaveDialog = ref(false)
const originalConfigs = ref({})

const configCategories = [
  { key: 'basic', name: '基础设置', icon: GlobeAltIcon },
  { key: 'user', name: '用户设置', icon: UserIcon },
  { key: 'content', name: '内容设置', icon: DocumentTextIcon },
  { key: 'notification', name: '通知设置', icon: BellIcon },
  { key: 'security', name: '安全设置', icon: ShieldCheckIcon }
]

const fileTypes = [
  { value: 'jpg', label: 'JPG图片' },
  { value: 'png', label: 'PNG图片' },
  { value: 'gif', label: 'GIF图片' },
  { value: 'pdf', label: 'PDF文档' },
  { value: 'doc', label: 'Word文档' },
  { value: 'mp4', label: 'MP4视频' }
]

const configs = ref({
  basic: {
    siteName: '宠物领养平台',
    siteDescription: '为宠物寻找温暖的家，为家庭带来快乐的伙伴',
    contactEmail: 'contact@petadoption.com',
    supportPhone: '400-123-4567',
    siteStatus: 'online',
    maintenanceMessage: '系统正在维护中，预计1小时后恢复正常，给您带来不便敬请谅解。'
  },
  user: {
    allowRegistration: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    enableLoginLock: true,
    maxLoginAttempts: 5,
    lockDuration: 30
  },
  content: {
    moderationMode: 'auto',
    maxFileSize: 10,
    allowedFileTypes: ['jpg', 'png', 'gif', 'pdf'],
    enableWordFilter: true,
    sensitiveWords: '垃圾\n广告\n欺诈\n暴力'
  },
  notification: {
    enableEmail: true,
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    senderEmail: 'noreply@petadoption.com',
    senderPassword: '',
    enableSMS: false,
    smsProvider: ''
  },
  security: {
    enableHTTPS: true,
    sessionTimeout: 120,
    enableIPLimit: true,
    maxRequestsPerMinute: 100,
    enableCaptcha: true,
    enableAutoBackup: true,
    backupFrequency: 'daily'
  }
})

// 计算属性
const hasChanges = computed(() => {
  return JSON.stringify(configs.value) !== JSON.stringify(originalConfigs.value)
})

const configChanges = computed(() => {
  const changes = []
  
  // 这里可以实现更详细的变更检测逻辑
  if (hasChanges.value) {
    changes.push('基础设置已修改')
    changes.push('用户设置已修改')
    // 可以根据实际变更情况添加具体的变更项
  }
  
  return changes
})

// 方法
const saveAllConfigs = () => {
  showSaveDialog.value = true
}

const confirmSave = async () => {
  try {
    // 这里应该调用API保存配置
    console.log('保存配置:', configs.value)
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新原始配置
    originalConfigs.value = JSON.parse(JSON.stringify(configs.value))
    
    showSaveDialog.value = false
    alert('配置保存成功！')
  } catch (error) {
    console.error('保存配置失败:', error)
    alert('保存配置失败，请重试')
  }
}

const closeSaveDialog = () => {
  showSaveDialog.value = false
}

const resetToDefaults = () => {
  if (confirm('确定要恢复所有配置到默认值吗？此操作不可撤销。')) {
    // 这里应该从API获取默认配置
    console.log('恢复默认配置')
    loadConfigs()
  }
}

const loadConfigs = async () => {
  try {
    // 这里应该调用API加载配置
    console.log('加载系统配置')
    
    // 保存原始配置用于变更检测
    originalConfigs.value = JSON.parse(JSON.stringify(configs.value))
  } catch (error) {
    console.error('加载配置失败:', error)
  }
}

// 监听配置变化
watch(configs, () => {
  // 可以在这里实现实时保存或其他逻辑
}, { deep: true })

// 组件挂载时加载配置
onMounted(() => {
  loadConfigs()
})
</script>

<style scoped>
.admin-system-config {
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

.header-actions {
  display: flex;
  gap: 12px;
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

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
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

.config-nav {
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
  background: white;
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  background: none;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
  justify-content: center;
}

.nav-item:hover {
  background: #f3f4f6;
  color: #374151;
}

.nav-item.active {
  background: #3b82f6;
  color: white;
}

.nav-icon {
  width: 16px;
  height: 16px;
}

.config-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.config-section {
  padding: 32px;
}

.section-header {
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.section-description {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.config-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.config-input,
.config-textarea,
.config-select {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  transition: border-color 0.2s;
}

.config-input:focus,
.config-textarea:focus,
.config-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.config-input:disabled,
.config-textarea:disabled,
.config-select:disabled {
  background: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
}

.config-textarea {
  resize: vertical;
  min-height: 80px;
}

.config-help {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}

.config-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.switch-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switch-label {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #d1d5db;
  transition: 0.2s;
  border-radius: 24px;
}

.switch-label:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.2s;
  border-radius: 50%;
}

.switch-input:checked + .switch-label {
  background-color: #3b82f6;
}

.switch-input:checked + .switch-label:before {
  transform: translateX(24px);
}

.config-radio-group {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.radio-item input[type="radio"] {
  margin: 0;
}

.radio-label {
  font-size: 0.875rem;
  color: #374151;
}

.config-checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.checkbox-item input[type="checkbox"] {
  margin: 0;
}

.checkbox-label {
  font-size: 0.875rem;
  color: #374151;
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

.modal-body p {
  margin: 0 0 16px 0;
  color: #374151;
  line-height: 1.5;
}

.changed-configs h4 {
  margin: 0 0 8px 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.changed-configs ul {
  margin: 0;
  padding-left: 20px;
  color: #6b7280;
  font-size: 0.875rem;
}

.changed-configs li {
  margin-bottom: 4px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
}

@media (max-width: 768px) {
  .admin-system-config {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .config-nav {
    flex-direction: column;
    gap: 2px;
  }
  
  .nav-item {
    justify-content: flex-start;
  }
  
  .config-grid {
    grid-template-columns: 1fr;
  }
  
  .config-radio-group,
  .config-checkbox-group {
    flex-direction: column;
    gap: 8px;
  }
  
  .modal {
    width: 95%;
    margin: 20px;
  }
  
  .modal-footer {
    flex-direction: column;
  }
}
</style>