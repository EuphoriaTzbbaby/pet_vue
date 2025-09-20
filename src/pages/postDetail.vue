<template>
  <div class="post-detail-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <el-result icon="error" title="加载失败" :sub-title="error">
        <template #extra>
          <div class="error-actions">
            <el-button type="primary" @click="fetchPostDetail(0)" :loading="loading">
              重试 {{ retryCount > 0 ? `(${retryCount}/${maxRetries})` : '' }}
            </el-button>
            <el-button @click="$router.go(-1)">返回</el-button>
          </div>
        </template>
      </el-result>
    </div>

    <!-- 帖子不存在 -->
    <div v-else-if="!postFound" class="not-found-container">
      <el-result icon="warning" title="帖子不存在" sub-title="您访问的帖子可能已被删除或ID错误">
        <template #extra>
          <el-button type="primary" @click="goBack">返回上一页</el-button>
        </template>
      </el-result>
    </div>

    <!-- 帖子主体 -->
    <div v-else class="post-container">
      <div class="back-button">
        <el-button @click="goBack" type="text">
          <el-icon><ArrowLeft /></el-icon> 返回
        </el-button>
      </div>

      <div class="post-header">
        <h1 class="post-title">{{ post.title }}</h1>
        <div class="post-meta">
          <div class="author-info">
            <el-avatar :size="40" :src="curUser?.avatarUrl || defaultAvatar" />
            <div class="author-details">
              <span class="author-name">{{ curUser?.username || '匿名用户' }}</span>
              <span class="post-time">{{ formatTime(post.updatedAt) }}</span>
            </div>
          </div>
          <div class="post-stats">
            <span class="stat-item">
              <el-icon><View /></el-icon> {{ post.views || 0 }}
            </span>
            <span class="stat-item">
              <el-icon><Star /></el-icon> {{ post.likes || 0 }}
            </span>
          </div>
        </div>
        <div class="post-tag" v-if="post.tags">{{ post.tags }}</div>
      </div>

      <div class="post-content">
          <p>{{ post.content }}</p>
        </div>
        
        <!-- 帖子互动区域 -->
        <div class="post-interactions">
          <el-button 
            :type="postLiked ? 'danger' : 'default'"
            :icon="postLiked ? 'HeartFilled' : 'Heart'"
            size="small"
            :loading="likingPost"
            @click="togglePostLike"
          >
            {{ postLiked ? '已点赞' : '点赞' }} ({{ postLikeCount }})
          </el-button>
          <el-button 
            type="primary" 
            icon="ChatDotRound" 
            size="small"
            @click="showCommentInput = !showCommentInput"
          >
            评论 ({{ flatComments.length }})
          </el-button>
        </div>

      <!-- 顶层评论按钮 -->
      <div class="post-actions">
        <el-button type="primary" :disabled="!isAuthenticated" @click="showCommentInput = !showCommentInput">
          <el-icon><ChatDotRound /></el-icon> 评论
        </el-button>
        <span v-if="!isAuthenticated" class="login-tip">请先登录后评论</span>
      </div>

      <!-- 顶层评论输入框 -->
      <div v-if="showCommentInput && isAuthenticated" class="post-reply-input">
        <el-input
          v-model="newComment"
          type="textarea"
          :rows="2"
          placeholder="写下你的评论..."
          @keyup.ctrl.enter="submitTopComment"
        />
        <div class="reply-actions">
          <el-button type="success" size="small" @click="submitTopComment" :loading="submittingComment">评论</el-button>
          <el-button size="small" @click="cancelTopComment" :disabled="submittingComment">取消</el-button>
        </div>
      </div>
    </div>

    <!-- 评论区 -->
    <div v-if="!loading && !error && postFound" class="comments-section">
      <div class="comments-header">
        <h3>评论 ({{ topLevelComments.length }})</h3>
        <el-select v-model="sortOption" placeholder="排序方式" size="small">
          <el-option label="最热" value="hot" />
          <el-option label="最新" value="new" />
        </el-select>
      </div>

      <!-- 评论列表 -->
      <div class="comments-list">
        <div v-for="comment in sortedComments" :key="comment.commentId" class="comment-item">
          <!-- 顶层评论 -->
          <div class="comment-header">
            <el-avatar :size="32" :src="getAuthorAvatar(comment.userId)" />
            <div class="comment-meta">
              <span class="author-name">{{ getAuthorName(comment.userId) }}</span>
              <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
            </div>
          </div>

          <div class="comment-content">
            <p>{{ comment.content }}</p>
            <div class="comment-actions">
              <el-button type="text" size="small" @click="toggleCommentLike(comment)">
                <el-icon :class="{ 'is-liked': comment.isLiked }"><Star /></el-icon>
                {{ comment.likes || 0 }}
              </el-button>
              <el-button type="text" size="small" @click="toggleReplyInput(comment)">
                <el-icon><ChatDotRound /></el-icon> 回复
              </el-button>
            </div>
          </div>

          <!-- 顶层评论的回复输入框 -->
          <div v-if="comment.showReplyInput && isAuthenticated" class="reply-input">
            <el-input
              v-model="comment.replyContent"
              type="textarea"
              :rows="2"
              :placeholder="`回复 @${getAuthorName(comment.userId)}...`"
              @keyup.ctrl.enter="submitReply(comment, comment)"
            />
            <div class="reply-actions">
              <el-button type="primary" size="small" @click="submitReply(comment, comment)" :loading="submittingReply">回复</el-button>
              <el-button size="small" @click="cancelReply(comment)" :disabled="submittingReply">取消</el-button>
            </div>
          </div>

          <!-- 二级回复列表 -->
          <div class="replies" v-if="comment.replies && comment.replies.length > 0">
            <div v-for="reply in comment.replies" :key="reply.commentId" class="reply-item">
              <div class="reply-header">
                <el-avatar :size="24" :src="getAuthorAvatar(reply.userId)" />
                <div class="reply-meta">
                  <span class="author-name">{{ getAuthorName(reply.userId) }}</span>
                  <span class="reply-time">{{ formatTime(reply.createdAt) }}</span>
                </div>
              </div>
              <p class="reply-content">
                <span class="reply-to">回复 @{{ getAuthorName(reply.replyToUserId) }}：</span>
                {{ reply.content }}
              </p>
              <div class="reply-actions">
                <el-button type="text" size="small" @click="toggleCommentLike(reply)">
                  <el-icon :class="{ 'is-liked': reply.isLiked }"><Star /></el-icon>
                  {{ reply.likes || 0 }}
                </el-button>
                <el-button type="text" size="small" @click="toggleReplyInput(reply)">
                  <el-icon><ChatDotRound /></el-icon> 回复
                </el-button>
              </div>
              <!-- 二级回复的回复输入框 -->
              <div v-if="reply.showReplyInput && isAuthenticated" class="reply-input">
                <el-input
                  v-model="reply.replyContent"
                  type="textarea"
                  :rows="2"
                  :placeholder="`回复 @${getAuthorName(reply.userId)}...`"
                  @keyup.ctrl.enter="submitReply(comment, reply)"
                />
                <div class="reply-actions">
                  <el-button type="primary" size="small" @click="submitReply(comment, reply)" :loading="submittingReply">回复</el-button>
                  <el-button size="small" @click="cancelReply(reply)" :disabled="submittingReply">取消</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="topLevelComments.length === 0" class="empty-comments">
          <el-empty description="暂无评论，快来抢沙发吧！" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted} from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowLeft, View, Star, ChatDotRound } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import type { Users } from '../api/usersApi'
import type { Posts } from '../api/postsApi'
import { getUserById } from '../api/usersApi'
import { getPostById } from '../api/postsApi'
import { getCommentsByPostId, createComment } from '../api/commentsApi'
import { createLike, deleteLikeByPostAndUser } from '../api/likesApi'
import dayjs from 'dayjs'
import { createNotification } from '../api/notificationsApi'
import { useUserStore } from '../stores/user'

// 🟢 防抖工具函数
const debounce = (func: Function, wait: number) => {
  let timeout: ReturnType<typeof setTimeout>
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// 用户 store 666
const userStore = useUserStore()
// 初始化认证状态
userStore.initializeAuth()
const route = useRoute()
const router = useRouter()
const postId = parseInt(route.params.id as string)

const loading = ref(true)
const error = ref('')
const postFound = ref(false)
const retryCount = ref(0)
const maxRetries = 3
const sortOption = ref('hot')
const post = ref<Posts & { likes?: number; views?: number; isLiked?: boolean }>({ 
  postId: 0, 
  userId: 0, 
  title: '', 
  content: '', 
  tags: '', 
  createdAt: '', 
  updatedAt: '', 
  likes: 0, 
  views: 0,
  isLiked: false
})
const curPost = ref<Posts | null>(null)
const curUser = ref<Users | null>(null)
const flatComments = ref<any[]>([])
const defaultAvatar = 'https://cwwdka.oss-cn-beijing.aliyuncs.com/pet/userImage/7cwwdka20250908001440girl.jpg'
const isAuthenticated = computed(() => userStore.isAuthenticated)
const showCommentInput = ref(false)
const newComment = ref('')
const submittingComment = ref(false)
const submittingReply = ref(false)
const likingPost = ref(false)
const postLiked = ref(false)
const postLikeCount = ref(0)
const userMap = new Map<number, Users>()

// 🟢 计算属性优化
const sortedComments = computed(() => {
  if (!flatComments.value.length) return []
  
  const sorted = [...flatComments.value].sort((a, b) => {
    if (sortOption.value === 'hot') {
      return (b.likes || 0) - (a.likes || 0)
    } else {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })
  
  return sorted
})

// const isPostOwner = computed(() => {
//   return userStore.isAuthenticated && userStore.currentUser?.userId === post.value.userId
// })

// const canInteract = computed(() => {
//   return userStore.isAuthenticated && !loading.value
// })

// 🟢 优化的用户缓存机制
interface CachedUser extends Users {
  cacheTime: number
}

const CACHE_EXPIRE_TIME = 5 * 60 * 1000 // 5分钟缓存过期

const loadUserCache = (): Record<number, CachedUser> => {
  try {
    const cache = JSON.parse(localStorage.getItem('userCache') || '{}')
    // 清理过期缓存
    const now = Date.now()
    Object.keys(cache).forEach(key => {
      if (now - cache[key].cacheTime > CACHE_EXPIRE_TIME) {
        delete cache[key]
      }
    })
    return cache
  } catch {
    return {}
  }
}

const saveUserCache = (cache: Record<number, CachedUser>) => {
  try {
    localStorage.setItem('userCache', JSON.stringify(cache))
  } catch (error) {
    console.warn('缓存保存失败:', error)
  }
}

let userCache: Record<number, CachedUser> = loadUserCache()

// 🟢 获取用户（先查缓存，再查接口）
const fetchUser = async (userId: number) => {
  const now = Date.now()
  
  // 检查缓存是否存在且未过期
  if (userCache[userId] && (now - userCache[userId].cacheTime) < CACHE_EXPIRE_TIME) {
    const user = { ...userCache[userId] }
    // delete user.cacheTime // 移除缓存时间字段
    userMap.set(userId, user)
    return user
  }
  
  try {
    const res = await getUserById(userId)
    if (res.data) {
      // 保存到缓存时添加时间戳
      userCache[userId] = { ...res.data, cacheTime: now }
      saveUserCache(userCache)
      userMap.set(userId, res.data)
    }
    return res.data
  } catch (err) {
    console.error('获取用户失败', err)
    // 如果有过期缓存，降级使用
    if (userCache[userId]) {
      const user = { ...userCache[userId] }
      // delete user.cacheTime
      userMap.set(userId, user)
      return user
    }
    return null
  }
}

const fetchPostDetail = async (retry = 0) => {
  loading.value = true
  // error.value = false
  try {
    curPost.value = (await getPostById(postId)).data
    if (!curPost.value) {
      postFound.value = false
      error.value = '帖子不存在或已被删除'
      return
    }
    post.value = curPost.value
    // 初始化点赞状态
    postLikeCount.value = post.value.likes || 0
    postLiked.value = post.value.isLiked || false
    curUser.value = await fetchUser(curPost.value.userId)
    postFound.value = true
    retryCount.value = 0

    const commentsData = (await getCommentsByPostId(postId)).data || []
    flatComments.value = commentsData.map(c => ({
      ...c,
      isLiked: false,
      replyContent: '',
      replies: [],
      showReplyInput: false,
    }))

    userMap.clear()
    const userIds = new Set<number>()
    flatComments.value.forEach(c => {
      userIds.add(c.userId)
      if (c.replyToUserId) userIds.add(c.replyToUserId)
    })

    await Promise.all([...userIds].map(id => fetchUser(id)))
  } catch (err) {
    console.error(err)
    
    if (retry < maxRetries) {
      retryCount.value = retry + 1
      ElMessage.warning(`获取失败，正在重试 (${retryCount.value}/${maxRetries})`)
      setTimeout(() => fetchPostDetail(retry + 1), 1000 * retry + 1)
      return
    }
    
    error.value = '获取帖子详情失败，请检查网络连接'
    postFound.value = false
    ElMessage.error('获取帖子详情失败')
  } finally {
    if (retry === 0 || retry >= maxRetries) {
      loading.value = false
    }
  }
}

const topLevelComments = computed(() => {
  const commentMap = new Map<number, any>()
  const rootComments: any[] = []
  flatComments.value.forEach(comment => {
    comment.replies = []
    if (comment.parentId == -1) {
      rootComments.push(comment)
      commentMap.set(comment.commentId!, comment)
    }
    const parent = commentMap.get(comment.parentId)
    if (parent) parent.replies.push(comment)
  })

  return sortOption.value === 'hot'
    ? rootComments.sort((a, b) => (b.likes || 0) - (a.likes || 0))
    : rootComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

const formatTime = (dateString: string | undefined) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString()
}

const getAuthorName = (userId: number) => userMap.get(userId)?.username || '匿名用户'
const getAuthorAvatar = (userId: number) => userMap.get(userId)?.avatarUrl || defaultAvatar
const goBack = () => router.back()

const toggleReplyInput = (comment: any) => {
  comment.showReplyInput = !comment.showReplyInput
  if (!comment.showReplyInput) comment.replyContent = ''
}

const cancelReply = (comment: any) => { 
  comment.replyContent = ''
  comment.showReplyInput = false 
}

const cancelTopComment = () => { 
  newComment.value = ''
  showCommentInput.value = false 
}

const submitReply = debounce(async (parentComment: any, replyToComment: any | null) => {
  if (!userStore.currentUser) return ElMessage.warning('请先登录')
  if (!replyToComment.replyContent?.trim()) return ElMessage.warning('请输入回复内容')
  if (submittingReply.value) return
  
  submittingReply.value = true
  try {
    const commentData = {
      postId: post.value.postId!,
      userId: userStore.currentUser.userId || 0,
      content: replyToComment.replyContent,
      parentId: parentComment.commentId,
      replyToUserId: replyToComment?.userId,
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    }
    await createComment(commentData)
    ElMessage.success('回复发布成功')
	// 对发帖者
    await createNotification({
      userId: curPost.value?.userId || 0,
	  otherId: userStore.currentUser?.userId || 0,
      type: 'posts',
      content: `${userStore.currentUser?.username}对${getAuthorName(replyToComment.userId)}的评论进行了回复: ${replyToComment.replyContent}`,
	  isRead: 0,
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    })
	// 发评论的人
	await createNotification({
      userId: parentComment?.userId || 0,
	  otherId: userStore.currentUser?.userId || 0,
      type: 'posts',
      content: `${userStore.currentUser?.username}对你的评论进行了回复: ${replyToComment.replyContent}`,
	  isRead: 0,
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    })
    await fetchPostDetail()
    cancelReply(parentComment)
    if (replyToComment) cancelReply(replyToComment)
  } catch (err) {
    ElMessage.error('回复发布失败')
    console.error(err)
  } finally {
    submittingReply.value = false
  }
}, 300)

const submitTopComment = debounce(async () => {
  if (!userStore.currentUser) return ElMessage.warning('请先登录')
  if (!newComment.value.trim()) return ElMessage.warning('请输入评论内容')
  if (submittingComment.value) return
  
  submittingComment.value = true
  try {
    const commentData = {
      postId: post.value.postId!,
      userId: userStore.currentUser.userId || 0,
      content: newComment.value,
      parentId: -1,
	  replyToUserId: curUser.value?.userId || 0,
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    }
    await createComment(commentData)
    ElMessage.success('评论成功')
    await createNotification({
      userId: curUser.value?.userId || 0,
	  otherId: userStore.currentUser?.userId || 0,
      type: 'comment',
      content: `${userStore.currentUser?.username}对你的帖子进行了评论: ${newComment.value}`,
	  isRead: 0,
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    })
	ElMessage.success('通知发布成功')
    newComment.value = ''
    showCommentInput.value = false
    await fetchPostDetail()
  } catch (err) {
    ElMessage.error('评论失败')
    console.error(err)
  } finally {
    submittingComment.value = false
  }
}, 300)
// 🟢 切换帖子点赞状态
const togglePostLike = async () => {
  if (!userStore.isAuthenticated) {
    ElMessage.warning('请先登录')
    return
  }
  
  if (likingPost.value) return
  
  try {
    likingPost.value = true
    const wasLiked = postLiked.value
    const userId = userStore.currentUser?.userId
    
    if (!userId) {
      ElMessage.warning('用户信息异常，请重新登录')
      return
    }
    
    // 乐观更新UI
    postLiked.value = !wasLiked
    postLikeCount.value += wasLiked ? -1 : 1
    
    // 调用API
    if (wasLiked) {
      await deleteLikeByPostAndUser(postId, userId)
    } else {
      await createLike({ postId, userId })
    }
  } catch (error) {
    // 回滚UI状态
    postLiked.value = !postLiked.value
    postLikeCount.value += postLiked.value ? 1 : -1
    console.error('点赞操作失败:', error)
    ElMessage.error('点赞操作失败')
  } finally {
    likingPost.value = false
  }
}

// 🟢 切换评论点赞状态
const toggleCommentLike = (comment: any) => {
  comment.isLiked = !comment.isLiked
  comment.likes = (comment.likes || 0) + (comment.isLiked ? 1 : -1)
}

onMounted(() => fetchPostDetail())
</script>

<style scoped>
/* 现代化页面设计 */
.post-detail-page { 
  max-width: 900px; 
  margin: 0 auto; 
  padding: 24px;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  background-attachment: fixed;
  transition: all 0.3s ease;
}
.loading-container, .error-container, .not-found-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(25px);
  border-radius: 24px;
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.2);
  border: 1px solid rgba(102, 126, 234, 0.15);
  margin: 30px;
  padding: 60px 40px;
  text-align: center;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  animation: fadeInUp 0.8s ease-out;
}

.loading-container::before, .error-container::before, .not-found-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px 24px 0 0;
}

.loading-container .el-loading-spinner {
  margin-top: 20px;
}

.loading-container .el-loading-text {
  font-size: 18px;
  color: #667eea;
  font-weight: 500;
  margin-top: 20px;
  animation: pulse 2s ease-in-out infinite;
}

.error-container h2, .not-found-container h2 {
  color: #e74c3c;
  font-size: 24px;
  margin-bottom: 16px;
  font-weight: 600;
}

.error-container p, .not-found-container p {
  color: #7f8c8d;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 30px;
}

.error-container .el-button, .not-found-container .el-button {
  border-radius: 25px;
  padding: 12px 30px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
}

.error-container .el-button:hover, .not-found-container .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}
 
 .error-actions {
   display: flex;
   gap: 12px;
   justify-content: center;
   align-items: center;
 }
.back-button { 
  margin-bottom: 24px;
  padding: 8px 0;
}
.post-container { 
  background: rgba(255, 255, 255, 0.95); 
  backdrop-filter: blur(20px);
  border-radius: 20px; 
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); 
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 40px; 
  margin-bottom: 40px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateY(0);
}
.post-container:hover {
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
  transform: translateY(-4px);
}
.post-header { 
  margin-bottom: 35px; 
  position: relative;
  animation: slideInDown 0.6s ease-out;
}
.post-title { 
  font-size: 28px; 
  font-weight: 700;
  color: #2c3e50; 
  margin: 0 0 24px 0; 
  line-height: 1.3;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}
.post-meta { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  animation: fadeInUp 0.8s ease-out 0.4s both;
}
.author-info { 
  display: flex; 
  align-items: center;
  transition: transform 0.3s ease;
}
.author-info:hover {
  transform: scale(1.05);
}
.author-details { margin-left: 15px; }
.author-name { 
  font-weight: 600; 
  color: #2c3e50; 
  display: block;
  font-size: 15px;
}
.post-time { 
  font-size: 13px; 
  color: #7f8c8d;
  margin-top: 2px;
}
.post-stats { 
  display: flex; 
  gap: 24px;
}
.stat-item { 
  display: flex; 
  align-items: center; 
  color: #7f8c8d; 
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  padding: 6px 12px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.5);
}
.stat-item:hover {
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
}
.stat-item .el-icon { 
  margin-right: 6px;
  font-size: 16px;
}
.post-tag { 
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white; 
  padding: 8px 16px; 
  border-radius: 20px; 
  font-size: 13px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  animation: fadeInUp 0.8s ease-out 0.6s both;
}
.post-content { margin-bottom: 30px; line-height: 1.8; color: #606266; }
.post-interactions {
  display: flex;
  gap: 16px;
  margin: 20px 0;
  padding: 20px;
  border-top: 1px solid #f0f0f0;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(102, 126, 234, 0.1);
}
.post-interactions .el-button {
  border-radius: 25px;
  padding: 12px 20px;
  font-weight: 600;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
  position: relative;
  overflow: hidden;
}
.post-interactions .el-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.6s ease;
}
.post-interactions .el-button:hover::before {
  left: 100%;
}
.post-interactions .el-button:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}
.post-interactions .el-button:active {
  transform: translateY(-1px) scale(1.02);
  transition: all 0.1s ease;
}
.post-interactions .el-button--danger {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  animation: pulse 0.6s ease-in-out;
}
.post-interactions .el-button--danger:hover {
  box-shadow: 0 8px 25px rgba(231, 76, 60, 0.4);
}
.post-actions {
  display: flex;
  gap: 20px;
  align-items: center;
  border-top: 1px solid #ebeef5;
  padding: 25px 0;
  margin: 30px 0;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(102, 126, 234, 0.15);
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.1);
  animation: fadeInUp 0.6s ease-out 0.4s both;
  padding: 25px;
}
.login-tip { color: #909399; font-size: 14px; margin-left: auto; }
.post-reply-input { margin-top: 15px; margin-bottom: 15px; }
.reply-actions {
  display: flex;
  gap: 12px;
  margin-top: 15px;
  padding: 12px 0;
}
.reply-actions .el-button {
  border-radius: 20px;
  padding: 10px 18px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 3px 12px rgba(102, 126, 234, 0.2);
}
.reply-actions .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
}
.reply-actions .el-button--success {
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
}
.reply-actions .el-button--success:hover {
  box-shadow: 0 6px 20px rgba(46, 204, 113, 0.4);
}
.comments-section { 
  background: rgba(255, 255, 255, 0.95); 
  backdrop-filter: blur(20px);
  border-radius: 20px; 
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); 
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 40px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateY(0);
}
.comments-section:hover {
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}
.comments-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 35px;
  padding-bottom: 20px;
  border-bottom: 2px solid rgba(102, 126, 234, 0.1);
  animation: fadeInUp 0.8s ease-out 0.8s both;
}
.comments-header h3 {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 20px;
  font-weight: 600;
}
.comments-list { 
  display: flex; 
  flex-direction: column; 
  gap: 24px;
}
.comment-item {
  border: 1px solid rgba(102, 126, 234, 0.1);
  border-radius: 16px;
  padding: 28px;
  margin-bottom: 16px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  transform: translateY(0);
  opacity: 1;
  animation: fadeInUp 0.6s ease-out;
}

.comment-item:hover {
  border-color: rgba(102, 126, 234, 0.3);
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.15);
}

.comment-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px 0 0 16px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.comment-item:hover::before {
  opacity: 1;
}
.comment-header { 
  display: flex; 
  align-items: center; 
  margin-bottom: 18px;
}
.comment-meta { 
  margin-left: 15px; 
  flex: 1;
}
.comment-content { 
  margin-bottom: 18px;
  line-height: 1.6;
  color: #2c3e50;
  font-size: 15px;
}
.comment-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}
.comment-actions .el-button {
  border-radius: 20px;
  transition: all 0.3s ease;
  font-weight: 500;
}
.comment-actions .el-button:hover {
  transform: translateY(-2px);
}
.is-liked { 
  color: #e74c3c;
  animation: pulse 0.6s ease-in-out;
}
.reply-input { 
  margin-top: 20px; 
  margin-bottom: 20px; 
  padding: 20px; 
  background: rgba(102, 126, 234, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  animation: slideDown 0.3s ease-out;
}
.replies { 
  margin-left: 48px; 
  margin-top: 24px; 
  padding-left: 24px; 
  border-left: 3px solid rgba(102, 126, 234, 0.2);
  position: relative;
}
.replies::before {
  content: '';
  position: absolute;
  left: -3px;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}
.replies:hover::before {
  opacity: 1;
}
.reply-item { 
  margin-bottom: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  transition: all 0.3s ease;
}
.reply-item:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: translateX(4px);
}
.reply-header { 
  display: flex; 
  align-items: center; 
  margin-bottom: 10px;
}
.reply-meta { 
  margin-left: 10px;
}
.reply-content { 
  margin: 0; 
  line-height: 1.5; 
  color: #2c3e50;
  font-size: 14px;
}
.reply-to { 
  color: #667eea; 
  margin-right: 6px;
  font-weight: 500;
}
.empty-comments { 
  text-align: center; 
  padding: 40px 0;
  color: #7f8c8d;
  font-size: 16px;
}
/* 动画关键帧 */
@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
    max-height: 0;
  }
  to {
    opacity: 1;
    transform: translateY(0);
    max-height: 200px;
  }
}

@media (max-width: 768px) {
  .post-detail-page { 
    padding: 15px;
    margin: 0 8px;
    background-attachment: scroll;
  }
  .post-container { 
    padding: 25px 20px;
    border-radius: 16px;
    margin-bottom: 24px;
  }
  .post-title { 
    font-size: 22px;
    line-height: 1.4;
  }
  .post-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
  }
  .post-stats {
    align-self: flex-end;
    flex-wrap: wrap;
    gap: 15px;
    justify-content: flex-start;
  }
  .post-interactions {
    padding: 15px;
    gap: 12px;
    flex-wrap: wrap;
  }
  .post-interactions .el-button {
    flex: 1;
    min-width: 120px;
    padding: 14px 16px;
    font-size: 14px;
  }
  .post-actions { 
    flex-direction: column;
    gap: 15px;
    padding: 20px;
    margin: 20px 0;
  }
  .post-actions .el-button {
    width: 100%;
    justify-content: center;
    padding: 16px 20px;
    font-size: 16px;
  }
  .comments-header { 
    flex-direction: column; 
    gap: 15px; 
    align-items: flex-start;
  }
  .comments-section {
    padding: 20px 15px;
    margin: 15px 0;
    border-radius: 16px;
  }
  .comment-item {
    padding: 20px 16px;
    margin-bottom: 12px;
  }
  .replies { 
    margin-left: 15px;
    padding-left: 12px;
    border-left-width: 2px;
  }
  .reply-item {
    padding: 12px;
  }
  .reply-actions {
    flex-wrap: wrap;
    gap: 8px;
  }
  .reply-actions .el-button {
    flex: 1;
    min-width: 80px;
  }
  .login-tip { 
    width: 100%; 
    text-align: right; 
    margin-left: 0; 
    margin-top: 12px;
  }
  .loading-container, .error-container, .not-found-container {
    margin: 15px;
    padding: 40px 20px;
    min-height: 350px;
  }
  /* 触摸优化 */
  .el-button {
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
  .comment-item, .reply-item {
    -webkit-tap-highlight-color: transparent;
  }
}

@media (max-width: 480px) {
  .post-detail-page {
    padding: 10px;
  }
  .post-container {
    padding: 20px 15px;
    margin: 10px 0;
  }
  .post-title {
    font-size: 20px;
  }
  .post-interactions .el-button {
    min-width: 100px;
    padding: 12px 14px;
    font-size: 13px;
  }
  .comments-section {
    padding: 15px 10px;
  }
  .comment-item {
    padding: 16px 12px;
  }
  .replies {
    margin-left: 10px;
    padding-left: 8px;
  }
}
</style>