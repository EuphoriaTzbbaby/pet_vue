// 用户状态类型
export interface UserState {
  currentUser: User | null
  isAuthenticated: boolean
  token: string | null
  loading: boolean
}

export interface User {
  userId?: number  // 改为可选，与 API 一致
  username: string
  password?: string  // 添加 password 字段
  email?: string
  phone?: string
  role?: string
  avatarUrl?: string
  status?: string
  createdAt?: string
  updatedAt?: string
}

// 宠物状态类型
export interface PetState {
  pets: Pet[]
  currentPet: Pet | null
  loading: boolean
  total: number
}

export interface Pet {
  petId?: number  // 改为可选
  orgId?: number
  name?: string   // 改为可选，与 API 一致
  species?: string // 改为可选
  age?: number    // 改为可选
  gender?: string // 改为可选
  healthStatus?: string // 改为可选
  vaccinated?: number
  description?: string
  status?: string // 改为可选
  createdAt?: string
  updatedAt?: string
}

// 帖子状态类型
export interface PostState {
  posts: Post[]
  currentPost: Post | null
  comments: Comment[]
  loading: boolean
  total: number
  currentPage: number
  pageSize: number
}

export interface Post {
  postId?: number
  userId: number
  title: string
  content: string
  tags: string
  likes?: number
  comments?: number
  views?: number
  isLiked?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface Comment {
  commentId?: number
  postId: number
  userId: number
  parentId?: number
  replyToUserId?: number
  content: string
  createdAt?: string
  updatedAt?: string
}

// 通知状态类型
export interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
}

export interface Notification {
  notificationId?: number  // 改为与 API 一致
  userId?: number
  otherId?: number
  type?: string
  content?: string
  isRead?: number  // 改为 number 类型，与 API 一致
  createdAt?: string
}