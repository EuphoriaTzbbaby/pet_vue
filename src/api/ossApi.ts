import { get } from '../utils/axios'
import axios from 'axios'

// 上传文件（单独处理，不走你封装的 post）
export const uploadFile = (file: File, prefix: string, newFileName: string) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('prefix', prefix)
  formData.append('newFileName', newFileName)
  
  console.log('上传参数:', {
    prefix,
    newFileName,
    fileSize: file.size,
    fileType: file.type
  })
  
  return axios.post(`${import.meta.env.VITE_API_URL}/api/oss/upload`, formData, {
    headers: { 
      // 不要手动设置Content-Type，让浏览器自动设置
      // 'Content-Type': 'multipart/form-data' 
    },
    timeout: 30000, // 30秒超时
  })
}

// 获取文件夹列表
export const getFolders = () => {
  return get('/api/oss/folders')
}

// 获取视频列表
export const getVideoList = (prefix: string = 'e_learning/3分钟小故事/') => {
  return get('/api/oss/videos', { prefix })
}
