import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Post, Comment } from './types'
import { getAllPosts, getPostById, createPost, updatePost, deletePost } from '../api/postsApi'
import { getCommentsByPostId, createComment} from '../api/commentsApi'
import { createLike, deleteLikeByPostAndUser} from '../api/likesApi'
import { ElMessage } from 'element-plus'

export const usePostStore = defineStore('post', () => {
  // 状态
  const posts = ref<Post[]>([])
  const currentPost = ref<Post | null>(null)
  const comments = ref<Comment[]>([])
  const loading = ref(false)
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(10)

  // 计算属性
  const paginatedPosts = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return posts.value.slice(start, end)
  })

  const postsByTag = computed(() => {
    const grouped: Record<string, Post[]> = {}
    posts.value.forEach(post => {
      const tag = post.tags || '未分类'
      if (!grouped[tag]) {
        grouped[tag] = []
      }
      grouped[tag].push(post)
    })
    return grouped
  })

  // 动作
  const fetchPosts = async () => {
    loading.value = true
    try {
      const response = await getAllPosts()
      posts.value = response.data.sort((a, b) => 
        new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      )
      total.value = response.data.length
      return { success: true }
    } catch (error: any) {
      ElMessage.error('获取帖子列表失败')
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const fetchPostById = async (id: number) => {
    loading.value = true
    try {
      const response = await getPostById(id)
      currentPost.value = response.data
      return { success: true }
    } catch (error: any) {
      ElMessage.error('获取帖子详情失败')
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const addPost = async (postData: Omit<Post, 'postId'>) => {
    loading.value = true
    try {
      const response = await createPost(postData)
      posts.value.unshift(response.data)
      total.value++
      ElMessage.success('帖子发布成功')
      return { success: true }
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '发布帖子失败')
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const editPost = async (postData: Post) => {
    loading.value = true
    try {
      const response = await updatePost(postData)
      const index = posts.value.findIndex(post => post.postId === postData.postId)
      if (index !== -1) {
        posts.value[index] = response.data
      }
      if (currentPost.value?.postId === postData.postId) {
        currentPost.value = response.data
      }
      ElMessage.success('帖子更新成功')
      return { success: true }
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '更新帖子失败')
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const removePost = async (id: number) => {
    loading.value = true
    try {
      await deletePost(id)
      posts.value = posts.value.filter(post => post.postId !== id)
      total.value--
      if (currentPost.value?.postId === id) {
        currentPost.value = null
      }
      ElMessage.success('帖子删除成功')
      return { success: true }
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '删除帖子失败')
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const fetchComments = async (postId: number) => {
    loading.value = true
    try {
      const response = await getCommentsByPostId(postId)
      comments.value = response.data
      return { success: true }
    } catch (error: any) {
      ElMessage.error('获取评论失败')
      return { success: false, error }
    } finally {
      loading.value = false
    }
  }

  const addComment = async (commentData: Omit<Comment, 'commentId'>) => {
    try {
      const response = await createComment(commentData)
      comments.value.push(response.data)
      // 更新帖子的评论数
      const post = posts.value.find(p => p.postId === commentData.postId)
      if (post) {
        post.comments = (post.comments || 0) + 1
      }
      ElMessage.success('评论发布成功')
      return { success: true }
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '发布评论失败')
      return { success: false, error }
    }
  }

  const toggleLike = async (postId: number, userId: number) => {
    try {
      const post = posts.value.find(p => p.postId === postId)
      if (!post) return { success: false }

      if (post.isLiked) {
        await deleteLikeByPostAndUser(postId, userId)
        post.isLiked = false
        post.likes = (post.likes || 0) - 1
        ElMessage.success('已取消点赞')
      } else {
        await createLike({ postId, userId })
        post.isLiked = true
        post.likes = (post.likes || 0) + 1
        ElMessage.success('点赞成功')
      }
      return { success: true }
    } catch (error: any) {
      ElMessage.error('操作失败')
      return { success: false, error }
    }
  }

  const setPage = (page: number) => {
    currentPage.value = page
  }

  const setPageSize = (size: number) => {
    pageSize.value = size
    currentPage.value = 1
  }

  return {
    // 状态
    posts,
    currentPost,
    comments,
    loading,
    total,
    currentPage,
    pageSize,
    // 计算属性
    paginatedPosts,
    postsByTag,
    // 动作
    fetchPosts,
    fetchPostById,
    addPost,
    editPost,
    removePost,
    fetchComments,
    addComment,
    toggleLike,
    setPage,
    setPageSize
  }
})