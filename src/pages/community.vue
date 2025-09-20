<template>
	<div class="community-page">
	  <!-- 页面头部背景 -->
	  <div class="page-header">
		<div class="header-content">
		  <h1 class="page-title">
			<el-icon class="title-icon"><Star /></el-icon>
			萌宠社区
		  </h1>
		  <p class="page-subtitle">分享你的萌宠故事，发现更多可爱瞬间</p>
		</div>
		<div class="header-decoration">
		  <div class="floating-icon icon-1">🐕</div>
		  <div class="floating-icon icon-2">🐱</div>
		  <div class="floating-icon icon-3">🐰</div>
		</div>
	  </div>

	  <div class="main-content">
		<!-- 顶部导航标签 -->
		<div class="nav-tabs">
		  <div 
			v-for="tab in tabs" 
			:key="tab.id"
			:class="['tab-item', { active: activeTab === tab.id }]"
			@click="switchTab(tab.id)"
		  >
			<span class="tab-text">{{ tab.name }}</span>
			<div class="tab-indicator" v-if="activeTab === tab.id"></div>
		  </div>
		</div>

		<!-- 搜索和筛选区域 -->
		<div class="search-filter-bar">
		  <div class="search-section">
			<el-input
			  v-model="searchKeyword"
			  placeholder="搜索帖子标题或内容..."
			  class="search-input"
			  clearable
			  @input="handleSearch"
			>
			  <template #prefix>
				<el-icon><Search /></el-icon>
			  </template>
			</el-input>
		  </div>
		  <div class="filter-section">
			<el-select
			  v-model="sortBy"
			  placeholder="排序方式"
			  class="sort-select"
			  @change="handleSort"
			>
			  <el-option label="最新发布" value="latest" />
			  <el-option label="最多点赞" value="likes" />
			  <el-option label="最多评论" value="comments" />
			</el-select>
		  </div>
		</div>

		<!-- 发帖按钮和统计信息 -->
		<div class="action-bar">
		  <div class="stats-info">
			<div class="stat-item">
			  <el-icon><Document /></el-icon>
			  <span>{{ filteredPosts.length }} 篇帖子</span>
			</div>
			<div class="stat-item">
			  <el-icon><User /></el-icon>
			  <span>{{ userMap.size }} 位用户</span>
			</div>
			<div class="stat-item" v-if="searchKeyword">
			  <el-icon><Search /></el-icon>
			  <span>搜索: "{{ searchKeyword }}"</span>
			</div>
		  </div>
		  <div class="post-button-container">
			<el-button 
			  type="primary" 
			  @click="showPostDialog = true" 
			  size="large"
			  :disabled="!isAuthenticated"
			  class="post-btn"
			>
			  <el-icon><Plus /></el-icon> 分享萌宠
			</el-button>
			<div v-if="!isAuthenticated" class="login-tip">
			  <el-icon><Warning /></el-icon>
			  请先登录后发帖
			</div>
		  </div>
		</div>

		<!-- 帖子列表 -->
		<div v-if="loading" class="loading-container">
		  <div class="loading-animation">
			<div class="loading-spinner"></div>
			<p class="loading-text">正在加载萌宠故事...</p>
		  </div>
		</div>
		<div v-else class="posts-container">
		  <transition-group name="post-list" tag="div" class="post-list">
			<div 
			  v-for="(post, index) in paginatedPosts" 
			  :key="post.postId" 
			  class="post-item"
			  :style="{ animationDelay: `${index * 0.1}s` }"
			>
		  <!-- 帖子头部 -->
		  <div class="post-header">
			<div class="post-meta">
			  <el-avatar :size="36" :src="getAuthorAvatar(post.userId)" />
			  <div class="author-info">
				<span class="author-name">{{ getAuthorName(post.userId) }}</span>
				<span class="post-time">{{ formatTime(post.createdAt) }}</span>
			  </div>
			</div>
			<div class="post-tag" v-if="post.tags">{{ post.tags }}</div>
		  </div>
		  <!-- 帖子内容 -->
		  <div class="post-content" @click="viewPost(post.postId!)">
			<h3 class="post-title">{{ post.title }}</h3>
			<p class="post-text">{{ post.content }}</p>
			<!-- 帖子预览图片 -->
			<div class="post-preview">
			  <div class="preview-placeholder">
				<el-icon class="preview-icon"><Picture /></el-icon>
				<span>点击查看详情</span>
			  </div>
			</div>
		  </div>
		  <!-- 帖子底部互动 -->
		  <div class="post-actions">
			<div class="action-item" @click="likePost(post.postId!)">
			  <el-icon :class="{ 'is-liked': post.isLiked }">
				<Star />
			  </el-icon>
			  <span>{{ post.likes || 0 }}</span>
			</div>
			<div class="action-item" @click="viewComments(post.postId!)">
			  <el-icon><ChatDotRound /></el-icon>
			  <span>{{ post.comments || 0 }}</span>
			</div>
			<div class="action-item">
			  <el-icon><View /></el-icon>
			  <span>{{ post.views || 0 }}</span>
			</div>
		  </div>
			</div>
		  </transition-group>
		  <div v-if="paginatedPosts.length === 0" class="empty-state">
			<el-empty description="暂无帖子" />
		  </div>
		</div>
	  <!-- 分页 -->
	  <div class="pagination">
		<el-pagination
		  v-model:current-page="currentPage"
		  v-model:page-size="pageSize"
		  :page-sizes="[10, 20, 30]"
		  :total="filteredPosts.length"
		  layout="total, sizes, prev, pager, next, jumper"
		  @size-change="handleSizeChange"
		  @current-change="handleCurrentChange"
		  :disabled="loading"
		/>
	  </div>
	  <!-- 发布帖子对话框 -->
	  <el-dialog
		v-model="showPostDialog"
		title="分享萌宠故事"
		width="60%"
		top="10vh"
		:before-close="handleClose"
	  >
		<el-form 
		  :model="postForm" 
		  :rules="postRules" 
		  ref="postFormRef" 
		  label-width="80px"
		>
		  <el-form-item label="标题" prop="title">
			<el-input v-model="postForm.title" placeholder="给你的萌宠起个可爱的标题吧" />
		  </el-form-item>
		  <el-form-item label="内容" prop="content">
			<el-input
			  v-model="postForm.content"
			  type="textarea"
			  :rows="6"
			  placeholder="分享你和宠物的温馨故事、养宠心得或者萌宠日常"
			/>
		  </el-form-item>
		  <el-form-item label="宠物类型">
			<el-select v-model="postForm.tags" placeholder="选择宠物类型">
			  <el-option
				v-for="tag in tags"
				:key="tag"
				:label="tag"
				:value="tag"
			  />
			</el-select>
		  </el-form-item>
		</el-form>
		<template #footer>
		  <span class="dialog-footer">
			<el-button @click="handleClose">取消</el-button>
			<el-button type="primary" @click="submitPost" :loading="submitting">
			  发布
			</el-button>
		  </span>
		</template>
	  </el-dialog>
	  </div>
	</div>
  </template>
  
  <script setup lang="ts">
  import { ref, reactive, computed, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Plus, Star, ChatDotRound, View, Document, User, Warning, Picture, Search } from '@element-plus/icons-vue'
  import { useRouter } from 'vue-router'
  import dayjs from 'dayjs'
  import type { Users } from '../api/usersApi'
import { getAllPosts, createPost, type Posts } from '../api/postsApi'
import type { Posts as ApiPost } from '../api/postsApi'
const router = useRouter()
import { getUserById } from '../api/usersApi'
import { useUserStore } from '../stores/user'
  
  // 标签
  const tabs = [
	{ id: 'all', name: '全部' },
	{ id: 'recommend', name: '推荐' },
	{ id: 'cute', name: '萌宠秀' },
	{ id: 'dog', name: '汪星人' },
	{ id: 'cat', name: '喵星人' },
	{ id: 'experience', name: '养宠心得' },
	{ id: 'medical', name: '宠物医疗' },
	{ id: 'hot', name: '热门' },
	{ id: 'latest', name: '最新' }
  ]
  const tags = ['狗狗', '猫咪', '兔子', '仓鼠', '鸟类', '鱼类', '爬宠', '其他']
  
  // 状态
  const activeTab = ref('all')
  const currentPage = ref(1)
  const pageSize = ref(10)
  const totalPosts = ref(0)
  const showPostDialog = ref(false)
  const submitting = ref(false)
  const postFormRef = ref()
  const loading = ref(false)
  const searchKeyword = ref('')
  const sortBy = ref('latest')
  
  // 用户 store
const userStore = useUserStore()
// 初始化认证状态
userStore.initializeAuth()

// 发布帖子表单
const postForm = reactive<Omit<Posts, 'postId' | 'createdAt' | 'updatedAt'> & { tags: string }>({
  userId: userStore.currentUser?.userId || 0,
  title: '',
  content: '',
  tags: ''
})
  
  // 表单验证
  const postRules = {
	title: [
	  { required: true, message: '请输入帖子标题', trigger: 'blur' },
	  { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
	],
	content: [
	  { required: true, message: '请输入帖子内容', trigger: 'blur' },
	  { min: 10, message: '内容至少 10 个字符', trigger: 'blur' }
	]
  }
  
  const apiPosts = ref<ApiPost[]>([])
  const userMap = new Map<number, Users>()
  
  // 处理API数据
  const processedPosts = computed(() => {
	return apiPosts.value.map(post => ({
	  ...post,
	  id: post.postId,
	  author: getAuthorName(post.userId),
	  authorAvatar: getAuthorAvatar(post.userId),
	  publishTime: post.createdAt,
	  likes: 0,
	  comments: 0,
	  views: 0,
	  isLiked: false
	}))
  })
  
  // 根据标签和搜索关键词过滤
  const filteredPosts = computed(() => {
	let posts = processedPosts.value
	
	// 按标签过滤
	if (activeTab.value !== 'all' && activeTab.value !== 'recommend') {
	  posts = posts.filter(post => post.tags === activeTab.value)
	}
	
	// 按搜索关键词过滤
	if (searchKeyword.value.trim()) {
	  const keyword = searchKeyword.value.toLowerCase()
	  posts = posts.filter(post => 
		post.title.toLowerCase().includes(keyword) || 
		post.content.toLowerCase().includes(keyword)
	  )
	}
	
	// 排序
	if (sortBy.value === 'latest') {
	  posts.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
	} else if (sortBy.value === 'likes') {
	  posts.sort((a, b) => (b.likes || 0) - (a.likes || 0))
	} else if (sortBy.value === 'comments') {
	  posts.sort((a, b) => (b.comments || 0) - (a.comments || 0))
	}
	
	return posts
  })
  
  // 分页
  const paginatedPosts = computed(() => {
	const start = (currentPage.value - 1) * pageSize.value
	const end = start + pageSize.value
	return filteredPosts.value.slice(start, end)
  })
  
  // 切换标签
  const switchTab = (tabId: string) => {
	activeTab.value = tabId
	currentPage.value = 1
	fetchPosts()
  }

  // 搜索处理
  const handleSearch = () => {
	currentPage.value = 1
  }

  // 排序处理
  const handleSort = () => {
	currentPage.value = 1
  }
  
  // 查看帖子
  const viewPost = (postId: number) => {
	router.push({ name: 'PostDetail', params: { id: postId } })
  }
  
  // 点赞
  const likePost = (_postId: number) => {
	ElMessage.info('点赞功能开发中...')
  }
  
  // 评论
  const viewComments = (_postId: number) => {
	ElMessage.info('评论功能开发中...')
  }
  
  // 关闭对话框
  const handleClose = () => {
	showPostDialog.value = false
	resetForm()
  }
  const resetForm = () => {
	postForm.title = ''
	postForm.content = ''
	postForm.tags = ''
	postFormRef.value?.resetFields()
  }
  
  // 提交帖子
  const submitPost = async () => {
	if (!postFormRef.value) return
	if (!isAuthenticated.value) {
	  ElMessageBox.confirm('您还未登录，是否去登录？', '提示', {
		confirmButtonText: '去登录',
		cancelButtonText: '取消',
		type: 'warning'
	  }).then(() => {
		router.push('/login')
	  })
	  return
	}
	try {
	  await postFormRef.value.validate()
	  submitting.value = true
	  const postData: Posts = {
		userId: postForm.userId,
		title: postForm.title,
		content: postForm.content,
		tags: postForm.tags,
		createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
		updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
	  }
	  await createPost(postData)
	  ElMessage.success('宠物故事发布成功！')
	  handleClose()
	  fetchPosts()
	} catch (error: any) {
	  ElMessage.error(error.response?.data?.message || '帖子发布失败')
	  console.error(error)
	} finally {
	  submitting.value = false
	}
  }
  
  // 分页
  const handleSizeChange = (val: number) => {
	pageSize.value = val
	currentPage.value = 1
	fetchPosts()
  }
  const handleCurrentChange = (val: number) => {
	currentPage.value = val
	fetchPosts()
  }
  
  // ⚡ 从 API 获取帖子 + 用户缓存
  const fetchPosts = async () => {
	loading.value = true
	try {
	  const response = await getAllPosts()
	  apiPosts.value = response.data || []
	  totalPosts.value = apiPosts.value.length
  
	  const userIds = [...new Set(apiPosts.value.map(p => p.userId))]
	  // 从 localStorage 加载缓存
	  const cachedUsers = JSON.parse(localStorage.getItem('users') || '{}')
  
	  userMap.clear()
	  for (const id of Object.keys(cachedUsers)) {
		userMap.set(Number(id), cachedUsers[id])
	  }
  
	  const uncachedIds = userIds.filter(id => !userMap.has(id))
	  if (uncachedIds.length > 0) {
		const results = await Promise.allSettled(
		  uncachedIds.map(id => getUserById(id))
		)
		results.forEach((res, idx) => {
		  if (res.status === 'fulfilled') {
			const user = res.value.data
			userMap.set(uncachedIds[idx], user)
			cachedUsers[uncachedIds[idx]] = user
		  }
		})
		// 更新缓存
		localStorage.setItem('users', JSON.stringify(cachedUsers))
	  }
	} catch (e) {
	  ElMessage.error('获取帖子失败')
	  console.error(e)
	} finally {
	  loading.value = false
	}
  }
  
  // 辅助函数
  const getAuthorName = (userId: number) => userMap.get(userId)?.username || '匿名用户'
  const getAuthorAvatar = (userId: number) => userMap.get(userId)?.avatarUrl || ''
  const formatTime = (timestamp: string | undefined): string => {
	if (!timestamp) return '未知时间'
	const date = new Date(timestamp)
	const diffMs = Date.now() - date.getTime()
	const diffMins = Math.floor(diffMs / (1000 * 60))
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
	if (diffMins < 1) return '刚刚'
	if (diffMins < 60) return `${diffMins}分钟前`
	if (diffHours < 24) return `${diffHours}小时前`
	if (diffDays < 7) return `${diffDays}天前`
	return date.toLocaleDateString('zh-CN')
  }
  
  const isAuthenticated = computed(() => userStore.isAuthenticated)
  
  onMounted(() => {
	console.log(userStore, 99999);
	
	fetchPosts()
  })
  </script>
  
  <style scoped>
	.community-page {
	  min-height: 100vh;
	  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	  position: relative;
	}

	/* 页面头部 */
	.page-header {
	  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	  padding: 60px 20px 40px;
	  text-align: center;
	  position: relative;
	  overflow: hidden;
	}

	.page-header::before {
	  content: '';
	  position: absolute;
	  top: 0;
	  left: 0;
	  right: 0;
	  bottom: 0;
	  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="%23ffffff" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="%23ffffff" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="%23ffffff" opacity="0.15"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>') repeat;
	  opacity: 0.3;
	}

	.header-content {
	  position: relative;
	  z-index: 2;
	}

	.page-title {
	  font-size: 3rem;
	  font-weight: 700;
	  color: white;
	  margin: 0 0 15px 0;
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  gap: 15px;
	  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
	}

	.title-icon {
	  font-size: 3rem;
	  color: #ffd700;
	  animation: sparkle 2s ease-in-out infinite;
	}

	@keyframes sparkle {
	  0%, 100% { transform: scale(1) rotate(0deg); }
	  50% { transform: scale(1.1) rotate(10deg); }
	}

	.page-subtitle {
	  font-size: 1.2rem;
	  color: rgba(255,255,255,0.9);
	  margin: 0;
	  font-weight: 300;
	}

	.header-decoration {
	  position: absolute;
	  top: 0;
	  left: 0;
	  right: 0;
	  bottom: 0;
	  pointer-events: none;
	}

	.floating-icon {
	  position: absolute;
	  font-size: 2rem;
	  opacity: 0.6;
	  animation: float 6s ease-in-out infinite;
	}

	.icon-1 {
	  top: 20%;
	  left: 10%;
	  animation-delay: 0s;
	}

	.icon-2 {
	  top: 60%;
	  right: 15%;
	  animation-delay: 2s;
	}

	.icon-3 {
	  bottom: 20%;
	  left: 20%;
	  animation-delay: 4s;
	}

	@keyframes float {
	  0%, 100% { transform: translateY(0px) rotate(0deg); }
	  33% { transform: translateY(-20px) rotate(5deg); }
	  66% { transform: translateY(10px) rotate(-3deg); }
	}

	/* 主内容区域 */
	.main-content {
	  max-width: 900px;
	  margin: 0 auto;
	  padding: 0 20px 40px;
	  background: white;
	  border-radius: 20px 20px 0 0;
	  box-shadow: 0 -10px 30px rgba(0,0,0,0.1);
	  position: relative;
	  margin-top: -20px;
	}
	/* 导航标签 */
	.nav-tabs {
	  display: flex;
	  padding: 30px 0 0;
	  margin-bottom: 30px;
	  overflow-x: auto;
	  white-space: nowrap;
	  gap: 8px;
	  justify-content: center;
	}

	.tab-item {
	  padding: 12px 24px;
	  cursor: pointer;
	  font-size: 15px;
	  color: #666;
	  position: relative;
	  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	  border-radius: 25px;
	  background: #f8f9fa;
	  border: 2px solid transparent;
	  font-weight: 500;
	  min-width: 80px;
	  text-align: center;
	}

	.tab-item:hover {
	  color: #667eea;
	  background: #f0f4ff;
	  transform: translateY(-2px);
	  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
	}

	.tab-item.active {
	  color: white;
	  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	  border-color: #667eea;
	  transform: translateY(-2px);
	  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
	}

	.tab-text {
	  position: relative;
	  z-index: 1;
	}

	.tab-indicator {
	  position: absolute;
	  bottom: -8px;
	  left: 50%;
	  transform: translateX(-50%);
	  width: 6px;
	  height: 6px;
	  background: #667eea;
	  border-radius: 50%;
	  animation: pulse 2s infinite;
	}

	@keyframes pulse {
	  0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
	  50% { opacity: 0.7; transform: translateX(-50%) scale(1.2); }
	}

	/* 搜索筛选栏 */
	.search-filter-bar {
	  display: flex;
	  gap: 20px;
	  margin-bottom: 25px;
	  padding: 20px;
	  background: white;
	  border-radius: 15px;
	  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
	  border: 1px solid #f0f4ff;
	}

	.search-section {
	  flex: 1;
	}

	.search-input {
	  width: 100%;
	}

	.search-input .el-input__wrapper {
	  border-radius: 25px;
	  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
	  border: 2px solid transparent;
	  transition: all 0.3s;
	}

	.search-input .el-input__wrapper:hover {
	  border-color: #e8f0fe;
	  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
	}

	.search-input .el-input__wrapper.is-focus {
	  border-color: #667eea;
	  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
	}

	.filter-section {
	  min-width: 150px;
	}

	.sort-select .el-select__wrapper {
	  border-radius: 25px;
	  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
	  border: 2px solid transparent;
	  transition: all 0.3s;
	}

	.sort-select .el-select__wrapper:hover {
	  border-color: #e8f0fe;
	  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
	}

	.sort-select .el-select__wrapper.is-focus {
	  border-color: #667eea;
	  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
	}

	/* 操作栏 */
	.action-bar {
	  display: flex;
	  justify-content: space-between;
	  align-items: center;
	  margin-bottom: 30px;
	  padding: 20px;
	  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
	  border-radius: 15px;
	  border: 1px solid #e8f0fe;
	}

	.stats-info {
	  display: flex;
	  gap: 30px;
	}

	.stat-item {
	  display: flex;
	  align-items: center;
	  gap: 8px;
	  color: #667eea;
	  font-weight: 500;
	  font-size: 14px;
	}

	.stat-item .el-icon {
	  font-size: 18px;
	}

	.post-button-container {
	  display: flex;
	  align-items: center;
	  gap: 15px;
	}

	.post-btn {
	  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	  border: none;
	  border-radius: 25px;
	  padding: 12px 24px;
	  font-weight: 600;
	  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
	  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.post-btn:hover {
	  transform: translateY(-2px);
	  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
	}

	.login-tip {
	  display: flex;
	  align-items: center;
	  gap: 5px;
	  color: #f56565;
	  font-size: 13px;
	  background: #fed7d7;
	  padding: 8px 12px;
	  border-radius: 20px;
	  border: 1px solid #feb2b2;
	}
	/* 加载动画 */
	.loading-container {
	  display: flex;
	  justify-content: center;
	  align-items: center;
	  min-height: 300px;
	}

	.loading-animation {
	  text-align: center;
	}

	.loading-spinner {
	  width: 50px;
	  height: 50px;
	  border: 4px solid #f3f4f6;
	  border-top: 4px solid #667eea;
	  border-radius: 50%;
	  animation: spin 1s linear infinite;
	  margin: 0 auto 15px;
	}

	.loading-text {
	  color: #667eea;
	  font-size: 16px;
	  margin: 0;
	  animation: pulse-text 2s ease-in-out infinite;
	}

	@keyframes spin {
	  0% { transform: rotate(0deg); }
	  100% { transform: rotate(360deg); }
	}

	@keyframes pulse-text {
	  0%, 100% { opacity: 1; }
	  50% { opacity: 0.6; }
	}

	/* 帖子容器 */
	.posts-container {
	  display: flex;
	  flex-direction: column;
	  gap: 25px;
	}

	.post-list {
	  display: flex;
	  flex-direction: column;
	  gap: 25px;
	}

	/* 帖子列表动画 */
	.post-list-enter-active {
	  transition: all 0.6s ease;
	  animation: slideInUp 0.6s ease;
	}

	.post-list-leave-active {
	  transition: all 0.4s ease;
	}

	.post-list-enter-from {
	  opacity: 0;
	  transform: translateY(30px);
	}

	.post-list-leave-to {
	  opacity: 0;
	  transform: translateY(-30px);
	}

	@keyframes slideInUp {
	  0% {
		opacity: 0;
		transform: translateY(50px) scale(0.95);
	  }
	  100% {
		opacity: 1;
		transform: translateY(0) scale(1);
	  }
	}

	/* 帖子项 */
	.post-item {
	  background: white;
	  border-radius: 20px;
	  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
	  padding: 25px;
	  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	  border: 1px solid #f0f4ff;
	  position: relative;
	  overflow: hidden;
	}

	.post-item::before {
	  content: '';
	  position: absolute;
	  top: 0;
	  left: 0;
	  right: 0;
	  height: 4px;
	  background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
	  opacity: 0;
	  transition: opacity 0.3s;
	}

	.post-item:hover {
	  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.15);
	  transform: translateY(-5px);
	  border-color: #e8f0fe;
	}

	.post-item:hover::before {
	  opacity: 1;
	}
	/* 帖子头部 */
	.post-header {
	  display: flex;
	  justify-content: space-between;
	  align-items: center;
	  margin-bottom: 20px;
	}

	.post-meta {
	  display: flex;
	  align-items: center;
	}

	.author-info {
	  margin-left: 15px;
	}

	.author-name {
	  font-weight: 600;
	  color: #2d3748;
	  display: block;
	  font-size: 15px;
	  margin-bottom: 2px;
	}

	.post-time {
	  font-size: 12px;
	  color: #a0aec0;
	  font-weight: 400;
	}

	.post-tag {
	  background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%);
	  color: #d63031;
	  padding: 6px 16px;
	  border-radius: 20px;
	  font-size: 12px;
	  font-weight: 600;
	  border: none;
	  box-shadow: 0 2px 8px rgba(214, 48, 49, 0.2);
	  text-transform: uppercase;
	  letter-spacing: 0.5px;
	}

	/* 帖子内容 */
	.post-content {
	  margin-bottom: 20px;
	  cursor: pointer;
	  transition: all 0.3s;
	  padding: 15px;
	  border-radius: 12px;
	  background: #fafbfc;
	  border: 1px solid transparent;
	}

	.post-content:hover {
	  background: #f7fafc;
	  border-color: #e8f0fe;
	  transform: translateX(5px);
	}

	.post-title {
	  margin: 0 0 12px 0;
	  font-size: 20px;
	  color: #2d3748;
	  font-weight: 700;
	  line-height: 1.4;
	  transition: color 0.3s;
	}

	.post-content:hover .post-title {
	  color: #667eea;
	}

	.post-text {
	  margin: 0;
	  color: #4a5568;
	  line-height: 1.7;
	  font-size: 15px;
	  display: -webkit-box;
      -webkit-line-clamp: 3;
      line-clamp: 3;
	  -webkit-box-orient: vertical;
	  overflow: hidden;
	}

	/* 帖子预览 */
	.post-preview {
	  margin: 15px 0;
	  border-radius: 12px;
	  overflow: hidden;
	}

	.preview-placeholder {
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  gap: 10px;
	  padding: 30px;
	  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
	  border: 2px dashed #d1d9ff;
	  color: #667eea;
	  font-size: 14px;
	  font-weight: 500;
	  transition: all 0.3s;
	}

	.preview-placeholder:hover {
	  background: linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%);
	  border-color: #667eea;
	  transform: scale(1.02);
	}

	.preview-icon {
	  font-size: 24px;
	  color: #667eea;
	}

	/* 帖子头部 */
	.post-actions {
	  display: flex;
	  justify-content: space-around;
	  align-items: center;
	  border-top: 1px solid #e8f0fe;
	  padding-top: 20px;
	  margin-top: 5px;
	}

	.action-item {
	  display: flex;
	  align-items: center;
	  color: #718096;
	  cursor: pointer;
	  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	  padding: 10px 16px;
	  border-radius: 20px;
	  font-size: 14px;
	  font-weight: 500;
	  background: #f7fafc;
	  border: 1px solid transparent;
	  min-width: 80px;
	  justify-content: center;
	}

	.action-item:hover {
	  color: #667eea;
	  background: #f0f4ff;
	  border-color: #e8f0fe;
	  transform: translateY(-2px);
	  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
	}

	.action-item .el-icon {
	  margin-right: 8px;
	  font-size: 18px;
	}

	.action-item .is-liked {
	  color: #f56565;
	  animation: heartbeat 1.5s ease-in-out infinite;
	}

	@keyframes heartbeat {
	  0%, 100% { transform: scale(1); }
	  50% { transform: scale(1.1); }
	}

	/* 分页 */
	.pagination {
	  display: flex;
	  justify-content: center;
	  margin: 40px 0;
	  padding: 20px;
	}

	/* 响应式设计 */
	@media (max-width: 768px) {
	  .page-title {
		font-size: 2rem;
	  }
	  
	  .page-subtitle {
		font-size: 1rem;
	  }
	  
	  .main-content {
		padding: 0 15px 30px;
		margin-top: -15px;
	  }
	  
	  .nav-tabs {
		padding: 20px 0 0;
		gap: 4px;
		flex-wrap: wrap;
	  }
	  
	  .tab-item {
		padding: 10px 16px;
		font-size: 13px;
		min-width: 60px;
	  }
	  
	  .search-filter-bar {
		flex-direction: column;
		gap: 15px;
		padding: 15px;
	  }
	  
	  .filter-section {
		min-width: auto;
	  }
	  
	  .action-bar {
		flex-direction: column;
		gap: 15px;
		padding: 15px;
		align-items: stretch;
	  }
	  
	  .stats-info {
		gap: 20px;
		flex-direction: column;
		align-items: flex-start;
	  }
	  
	  .post-item {
		padding: 20px;
		margin: 0 5px;
	  }
	  
	  .post-header {
		flex-direction: column;
		align-items: flex-start;
		gap: 10px;
	  }
	  
	  .post-title {
		font-size: 18px;
	  }
	  
	  .post-text {
		font-size: 14px;
	  }
	  
	  .post-actions {
		flex-wrap: wrap;
		gap: 10px;
		justify-content: space-around;
	  }
	  
	  .action-item {
		flex: 1;
		min-width: 70px;
		padding: 8px 12px;
		flex-direction: column;
		gap: 4px;
		font-size: 12px;
	  }
	}
	
	@media (max-width: 480px) {
	  .page-header {
		padding: 40px 15px;
	  }
	  
	  .page-title {
		font-size: 1.5rem;
	  }
	  
	  .main-content {
		padding: 0 10px 20px;
	  }
	  
	  .nav-tabs {
		padding: 15px 0 0;
		gap: 2px;
	  }
	  
	  .tab-item {
		padding: 8px 12px;
		font-size: 12px;
		min-width: 50px;
	  }
	  
	  .search-filter-bar {
		padding: 12px;
	  }
	  
	  .post-item {
		padding: 15px;
		margin: 0;
	  }
	  
	  .post-title {
		font-size: 16px;
	  }
	  
	  .post-text {
		font-size: 13px;
	  }
	  
	  .action-item {
		padding: 6px 8px;
		font-size: 11px;
	  }
	  
	  .loading-spinner {
		width: 40px;
		height: 40px;
	  }
	  
	  .loading-text {
		font-size: 14px;
	  }
	}
	/* 添加一些可爱的宠物主题装饰 */
	::v-deep(.el-button) {
	  border-radius: 20px;
	  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	  border: none;
	}
	::v-deep(.el-button:hover) {
	  transform: scale(1.05);
	  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
	}
	::v-deep(.el-dialog) {
	  border-radius: 15px;
	  overflow: hidden;
	}
	::v-deep(.el-dialog__header) {
	  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	  color: white;
	  padding: 20px;
	}
	::v-deep(.el-dialog__title) {
	  color: white;
	  font-weight: 600;
	}
	/* 新增样式 */
	.loading-container {
	  padding: 20px;
	}
	.empty-state {
	  padding: 40px 0;
	  text-align: center;
	}
	.login-tip {
	  font-size: 14px;
	}
	</style>