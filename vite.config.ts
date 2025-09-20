import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { loadEnv } from 'vite'

export default defineConfig(({ mode  }) => {
const env = loadEnv(mode, process.cwd()) as Record<string, string>
  return {
    plugins: [vue()],
    server: {
      proxy: {
        '/tzb/api': {  // 匹配前端请求的前缀
          target: env.VITE_API_URL,  // 动态读取后端地址
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/tzb\/api/, '')  // 根据后端路径调整
        }
      }
    }
  }
})
