<template>
  <el-upload
    class="avatar-uploader"
    :show-file-list="false"
    :before-upload="beforeAvatarUpload"
    :http-request="handleAvatarUpload"
  >
    <el-avatar :size="size" :src="avatarUrl || defaultAvatar" />
  </el-upload>
</template>

<script lang="ts" setup>
// import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { UploadRequestOptions } from 'element-plus'
import { uploadFile } from '../api/ossApi'
import { updateUser } from '../api/usersApi'
import type { Users } from '../api/usersApi'
import dayjs from 'dayjs'

const defaultAvatar = new URL('../assets/default-avatar.png', import.meta.url).href

// Props
interface Props {
  avatarUrl?: string
  size?: number
  userInfo: Users
}

const props = withDefaults(defineProps<Props>(), {
  size: 80
})

// Emits
const emit = defineEmits<{
  'update:avatarUrl': [url: string]
  'user-updated': [user: Users]
}>()

// 上传前校验
const beforeAvatarUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  return true
}

// 自定义上传请求
const handleAvatarUpload = async (options: UploadRequestOptions) => {
  try {
    const { file } = options
    const userId = props.userInfo.userId
    const timestamp = dayjs().format('YYYYMMDDHHmmss')
    const newFileName = `${userId}cwwdka${timestamp}${(file as File).name}`
    const res = await uploadFile(file as File, 'pet/userImage/', newFileName)
    
    if (res.data.success) {
      const updatedUser = {
        ...props.userInfo,
        avatarUrl: res.data.url!,
        updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
      }
      
      // 更新用户信息
      await updateUser(updatedUser)
      
      // 触发事件
      emit('update:avatarUrl', res.data.url!)
      emit('user-updated', updatedUser)
      
      ElMessage.success('头像上传成功')
    } else {
      ElMessage.error(res.data.message || '上传失败')
    }
  } catch (err) {
    ElMessage.error('上传出错')
  }
}
</script>

<style scoped>
.avatar-uploader {
  display: inline-block;
  cursor: pointer;
}
</style>
