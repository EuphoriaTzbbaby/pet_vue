import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
// 完整引入Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 引入Element Plus中文语言包
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import router from './router/index'
import GlobalChat from './components/cwwChat.vue'
const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.component('GlobalChat', GlobalChat) // 注册全局聊天组件
app.use(ElementPlus, {
  locale: zhCn,
})
app.mount('#app')
