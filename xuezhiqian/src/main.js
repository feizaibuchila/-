import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router/index.js'
import { useUserStore } from './store/index.js'

const app = createApp(App)
const pinia = createPinia()

// 使用Pinia状态管理
app.use(pinia)

// 使用路由
app.use(router)

// 初始化用户状态
const userStore = useUserStore()
userStore.initUserState()

// 挂载应用
app.mount('#app')
