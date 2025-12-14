<template>
  <div id="app">
    <!-- 全局加载进度条 -->
    <div class="loading-progress" :style="{ width: loadingProgress + '%' }" v-if="loadingProgress > 0 && loadingProgress < 100">
    </div>
    
    <!-- 应用主要内容 -->
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'App',
  setup() {
    const router = useRouter();
    const loadingProgress = ref(0);
    
    // 模拟加载进度
    const simulateLoadingProgress = () => {
      loadingProgress.value = 0;
      const interval = setInterval(() => {
        loadingProgress.value += Math.random() * 20;
        if (loadingProgress.value >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            loadingProgress.value = 0;
          }, 300);
        }
      }, 200);
    };
    
    // 路由切换时显示加载进度
    watch(() => router.currentRoute.value.path, () => {
      simulateLoadingProgress();
    });
    
    // 为所有可交互元素添加点击反馈
    const addClickFeedback = () => {
      document.addEventListener('click', (e) => {
        const interactiveElements = ['button', 'a', 'input[type="submit"]', 'input[type="button"]', 'select'];
        if (interactiveElements.includes(e.target.tagName.toLowerCase()) || 
            e.target.closest('button') || e.target.closest('a')) {
          const ripple = document.createElement('span');
          ripple.classList.add('ripple-effect');
          const rect = e.target.getBoundingClientRect();
          const size = Math.max(rect.width, rect.height);
          const x = e.clientX - rect.left - size / 2;
          const y = e.clientY - rect.top - size / 2;
          
          ripple.style.width = ripple.style.height = `${size}px`;
          ripple.style.left = `${x}px`;
          ripple.style.top = `${y}px`;
          
          e.target.appendChild(ripple);
          setTimeout(() => {
            ripple.remove();
          }, 600);
        }
      });
    };
    
    onMounted(() => {
      // 添加点击反馈效果
      addClickFeedback();
      
      // 初始化时执行一次加载进度
      simulateLoadingProgress();
    });
    
    return {
      loadingProgress
    };
  }
};
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--high-contrast-text);
  background-color: var(--background-primary);
  line-height: 1.6;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

/* 基础CSS变量设置 */
:root {
  --primary-color: #ff5277;
  --secondary-color: #a239ca;
  --gradient-primary: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  --text-light: #ffffff;
  --background-primary: #ffffff;
  --background-secondary: #f8f9fa;
  --high-contrast-text: #333333;
  --text-secondary: #707070;
  --border-color: #e0e0e0;
  --border-radius: 8px;
  --transition-speed: 0.3s;
}

#app {
  min-height: 100vh;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--background-secondary);
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--primary-color);
}

/* 全局动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 字体大小调节控件 */
.font-size-controls {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 5px;
  background: var(--background-primary);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.font-size-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: var(--background-secondary);
  color: var(--high-contrast-text);
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-speed) ease;
}

.font-size-btn:hover {
  background: var(--gradient-primary);
  color: white;
  transform: scale(1.1);
}

/* 加载进度条 */
.loading-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 4px;
  background: var(--gradient-primary);
  z-index: 9999;
  transition: width 0.3s ease;
  box-shadow: 0 0 10px rgba(255, 82, 119, 0.5);
}

/* 通用按钮样式 */
.btn {
  display: inline-block;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  text-align: center;
  text-decoration: none;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all var(--transition-speed) ease;
  position: relative;
  overflow: hidden;
  user-select: none;
}

.btn-primary {
  background: var(--gradient-primary);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 4px 12px rgba(255, 82, 119, 0.3);
}

.btn-secondary {
  background-color: var(--background-secondary);
  color: var(--high-contrast-text);
}

.btn-secondary:hover {
  background-color: #e0e0e0;
  transform: translateY(-1px) scale(1.02);
}

.btn-disabled {
  background: #adb5bd;
  color: white;
  cursor: not-allowed;
  opacity: 0.8;
}

/* 通用卡片样式 */
.card {
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: all var(--transition-speed) ease;
  position: relative;
  overflow: hidden;
}

.card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px) scale(1.01);
}

/* 加载状态 */
.loading-spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 3px solid var(--background-secondary);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 全局点击反馈动画 */
.ripple-effect {
  position: absolute;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  transform: scale(0);
  animation: ripple 0.6s ease-out;
  pointer-events: none;
}

@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

/* 确保颜色对比度符合无障碍标准 */
a, button, .btn, .navbar-link, .dropdown-item {
  color: var(--high-contrast-text);
  /* 确保文本对比度≥4.5:1 */
}

h1, h2, h3, h4, h5, h6 {
  color: var(--high-contrast-text);
  font-weight: 600;
}

/* 响应式样式 */
@media (max-width: 768px) {
  body {
    font-size: 15px;
  }
  
  .loading-progress {
    height: 3px;
  }
}
</style>
