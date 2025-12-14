<template>
  <header class="navbar" :class="{ scrolled: isScrolled }">
    <div class="navbar-container">
      <!-- 移动端汉堡菜单按钮 -->
      <button class="mobile-menu-toggle" @click="toggleMobileMenu" aria-label="菜单">
        <div class="menu-icon" :class="{ active: isMobileMenuOpen }">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>
      
      <!-- 品牌标识 -->
      <div class="navbar-brand">
        <router-link to="/home" class="navbar-logo">
          薛之谦粉丝应援站
        </router-link>
      </div>
      
      <!-- 桌面端导航 -->
      <nav class="nav-links desktop-nav">
        <router-link to="/home" class="navbar-link" active-class="active">首页</router-link>
        <router-link to="/albums/1" class="navbar-link" active-class="active">音乐作品</router-link>
        <router-link to="/concerts" class="navbar-link" active-class="active">演唱会</router-link>
        <router-link to="/vip" class="navbar-link btn btn-vip" active-class="active">VIP中心</router-link>
        <router-link to="/activities" class="navbar-link" active-class="active">应援活动</router-link>
        <router-link to="/spin-wheel" class="navbar-link" active-class="active">幸运转盘</router-link>
        
        <!-- 新增功能导航 -->
        <div class="dropdown">
          <button class="navbar-link dropdown-toggle">互动社区</button>
          <div class="dropdown-content">
            <router-link to="/topics" class="dropdown-item">话题互动墙</router-link>
            <router-link to="/lyrics-danmaku" class="dropdown-item">歌词弹幕</router-link>
            <router-link to="/guess-song" class="dropdown-item">猜歌挑战</router-link>
          </div>
        </div>
        
        <div class="dropdown">
          <button class="navbar-link dropdown-toggle">我的应援</button>
          <div class="dropdown-content">
            <router-link to="/profile" class="dropdown-item">个人主页</router-link>
            <router-link to="/tasks" class="dropdown-item">任务中心</router-link>
            <router-link to="/mall" class="dropdown-item">积分商城</router-link>
            <router-link to="/activity-calendar" class="dropdown-item">应援活动日历</router-link>
          </div>
        </div>
      </nav>
      
      <!-- 桌面端用户信息 -->
      <div class="navbar-user desktop-user">
        <div v-if="userInfo" class="user-info">
          <img :src="userInfo.avatar" alt="用户头像" class="user-avatar">
          <span class="user-name">{{ userInfo.nickname }}</span>
          <span v-if="isVip" class="vip-badge">{{ isPremiumVip ? '高级VIP' : 'VIP' }}</span>
        </div>
        
        <div class="navbar-actions">
          <a 
            href="https://weibo.com/xuezhiqian" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="external-link navbar-action"
            title="薛之谦官方微博"
          >
            <i class="icon">🔵</i>
          </a>
          <a 
            href="https://music.163.com/#/artist?id=6452" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="external-link navbar-action"
            title="网易云音乐主页"
          >
            <i class="icon">🎵</i>
          </a>
          <a 
            href="https://y.qq.com/n/ryqq/singer/002J4UUk29y8BY" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="external-link navbar-action"
            title="QQ音乐主页"
          >
            <i class="icon">🎧</i>
          </a>
          <button @click="handleLogout" class="btn btn-outline logout-btn">退出</button>
        </div>
      </div>
      
      <!-- 移动端导航菜单 -->
      <div class="mobile-menu" :class="{ open: isMobileMenuOpen }">
        <nav class="mobile-nav-links">
          <router-link to="/home" class="mobile-nav-link" active-class="active" @click="closeMobileMenu">首页</router-link>
          <router-link to="/albums/1" class="mobile-nav-link" active-class="active" @click="closeMobileMenu">音乐作品</router-link>
          <router-link to="/concerts" class="mobile-nav-link" active-class="active" @click="closeMobileMenu">演唱会</router-link>
          <router-link to="/vip" class="mobile-nav-link mobile-vip-btn" active-class="active" @click="closeMobileMenu">VIP中心</router-link>
          <router-link to="/activities" class="mobile-nav-link" active-class="active" @click="closeMobileMenu">应援活动</router-link>
          <router-link to="/spin-wheel" class="mobile-nav-link" active-class="active" @click="closeMobileMenu">幸运转盘</router-link>
          
          <!-- 互动社区子菜单 -->
          <div class="mobile-submenu">
            <button class="mobile-nav-link submenu-toggle" @click="toggleSubmenu('community')">
              互动社区 <span class="submenu-arrow" :class="{ open: activeSubmenu === 'community' }">▼</span>
            </button>
            <div class="submenu-content" :class="{ open: activeSubmenu === 'community' }">
              <router-link to="/topics" class="submenu-item" @click="closeMobileMenu">话题互动墙</router-link>
              <router-link to="/lyrics-danmaku" class="submenu-item" @click="closeMobileMenu">歌词弹幕</router-link>
              <router-link to="/guess-song" class="submenu-item" @click="closeMobileMenu">猜歌挑战</router-link>
            </div>
          </div>
          
          <!-- 我的应援子菜单 -->
          <div class="mobile-submenu">
            <button class="mobile-nav-link submenu-toggle" @click="toggleSubmenu('support')">
              我的应援 <span class="submenu-arrow" :class="{ open: activeSubmenu === 'support' }">▼</span>
            </button>
            <div class="submenu-content" :class="{ open: activeSubmenu === 'support' }">
              <router-link to="/profile" class="submenu-item" @click="closeMobileMenu">个人主页</router-link>
              <router-link to="/tasks" class="submenu-item" @click="closeMobileMenu">任务中心</router-link>
              <router-link to="/mall" class="submenu-item" @click="closeMobileMenu">积分商城</router-link>
              <router-link to="/activity-calendar" class="submenu-item" @click="closeMobileMenu">应援活动日历</router-link>
            </div>
          </div>
          
          <!-- 移动端用户信息 -->
          <div v-if="userInfo" class="mobile-user-info">
            <img :src="userInfo.avatar" alt="用户头像" class="mobile-user-avatar">
            <div class="mobile-user-details">
              <span class="mobile-user-name">{{ userInfo.nickname }}</span>
              <span v-if="isVip" class="mobile-vip-badge">{{ isPremiumVip ? '高级VIP' : 'VIP' }}</span>
            </div>
          </div>
          
          <!-- 移动端退出按钮 -->
          <button class="mobile-logout-btn" @click="handleLogout">退出</button>
        </nav>
      </div>
    </div>
    
    <!-- 移动端关键操作按钮固定在底部 -->
    <div class="mobile-fixed-actions">
      <router-link to="/concerts" class="mobile-fixed-btn">
        <span class="icon">🎤</span>
        <span>演唱会</span>
      </router-link>
    </div>
  </header>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store/index';

export default {
  name: 'Navbar',
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    const isScrolled = ref(false);
    
    // 移动端菜单状态
    const isMobileMenuOpen = ref(false);
    const activeSubmenu = ref(null);
    
    // 监听滚动事件
    const handleScroll = () => {
      isScrolled.value = window.scrollY > 50;
    };
    
    // 计算用户状态
    const userInfo = computed(() => userStore.getUserInfo);
    const isVip = computed(() => userStore.getIsVip);
    const isPremiumVip = computed(() => {
      return userInfo.value && userInfo.value.vipLevel === 2;
    });
    
    // 退出登录
    const handleLogout = () => {
      userStore.logout();
      router.push('/');
      closeMobileMenu();
    };
    
    // 移动端菜单控制
    const toggleMobileMenu = () => {
      isMobileMenuOpen.value = !isMobileMenuOpen.value;
      // 打开菜单时禁用滚动
      if (isMobileMenuOpen.value) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
        activeSubmenu.value = null;
      }
    };
    
    const closeMobileMenu = () => {
      isMobileMenuOpen.value = false;
      activeSubmenu.value = null;
      document.body.style.overflow = 'auto';
    };
    
    const toggleSubmenu = (menuName) => {
      activeSubmenu.value = activeSubmenu.value === menuName ? null : menuName;
    };
    
    // 组件挂载时添加滚动监听
    onMounted(() => {
      window.addEventListener('scroll', handleScroll);
      // 添加点击外部关闭菜单事件
      document.addEventListener('click', handleClickOutside);
    });
    
    // 组件卸载时移除监听
    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'auto';
    });
    
    // 点击外部关闭菜单
    const handleClickOutside = (event) => {
      const navbar = document.querySelector('.navbar');
      if (isMobileMenuOpen.value && !navbar.contains(event.target)) {
        closeMobileMenu();
      }
    };
    
    return {
      isScrolled,
      userInfo,
      isVip,
      isPremiumVip,
      handleLogout,
      isMobileMenuOpen,
      activeSubmenu,
      toggleMobileMenu,
      closeMobileMenu,
      toggleSubmenu
    };
  }
};
</script>

<style scoped>
/* 使用全局CSS变量 */
.navbar {
  background: linear-gradient(135deg, var(--background-primary), var(--background-secondary));
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 0.8rem 0;
  transition: all var(--transition-speed) ease;
  position: relative;
  z-index: 1000;
}

.navbar.scrolled {
  background: var(--background-primary);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 0.5rem 0;
}

.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
}

/* 汉堡菜单按钮 - 仅在移动端显示 */
.mobile-menu-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  z-index: 1100;
}

.menu-icon {
  width: 24px;
  height: 20px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.menu-icon span {
  display: block;
  height: 3px;
  width: 100%;
  background-color: var(--primary-color);
  border-radius: 3px;
  transition: all var(--transition-speed) ease;
  transform-origin: center;
}

.menu-icon.active span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.menu-icon.active span:nth-child(2) {
  opacity: 0;
}

.menu-icon.active span:nth-child(3) {
  transform: rotate(-45deg) translate(5px, -5px);
}

.navbar-brand {
  flex-shrink: 0;
}

.navbar-logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
  text-decoration: none;
  transition: all var(--transition-speed) ease;
  padding: 0.5rem 0;
}

.navbar-logo:hover {
  transform: scale(1.05);
  text-shadow: 0 2px 8px rgba(255, 82, 119, 0.3);
}

/* 桌面端导航链接样式 */
.desktop-nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin: 0 auto;
}

.navbar-link {
  position: relative;
  color: var(--high-contrast-text);
  text-decoration: none;
  font-size: 1.05rem;
  font-weight: 500;
  padding: 0.5rem 0.8rem;
  border-radius: var(--border-radius);
  transition: all var(--transition-speed) ease;
  overflow: hidden;
  display: inline-block;
  transform-origin: center;
  will-change: transform;
}

.navbar-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 3px;
  background: var(--primary-color);
  transition: width var(--transition-speed) ease;
}

.navbar-link:hover {
  color: var(--primary-color);
  background: rgba(255, 82, 119, 0.1);
  transform: translateY(-1px) scale(1.03);
}

.navbar-link:hover::after {
  width: 100%;
}

.navbar-link.active {
  color: var(--primary-color);
  font-weight: 600;
}

.navbar-link.active::after {
  width: 100%;
}

/* 下拉菜单样式 */
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-toggle {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.05rem;
  font-weight: 500;
  font-family: inherit;
}

.dropdown-content {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background-color: white;
  min-width: 160px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  z-index: 100;
  border-radius: var(--border-radius);
  margin-top: 4px;
  transform-origin: top;
  transform: scaleY(0.95);
  opacity: 0;
  transition: opacity var(--transition-speed) ease, transform var(--transition-speed) ease;
}

.dropdown:hover .dropdown-content {
  display: block;
  opacity: 1;
  transform: scaleY(1);
}

.dropdown-item {
  color: var(--high-contrast-text);
  padding: 0.75rem 1rem;
  text-decoration: none;
  display: block;
  transition: background-color var(--transition-speed) ease, color var(--transition-speed) ease;
}

.dropdown-item:hover {
  background-color: var(--background-secondary);
  color: var(--primary-color);
  transform: translateX(5px);
}

.dropdown-item.router-link-active {
  background-color: rgba(255, 82, 119, 0.1);
  color: var(--primary-color);
}

/* VIP按钮特殊样式 */
.btn-vip {
  background: var(--gradient-primary);
  color: var(--text-light) !important;
  padding: 0.6rem 1.2rem !important;
  font-weight: 600 !important;
  border-radius: 50px !important;
  border: none;
  box-shadow: 0 4px 15px rgba(255, 82, 119, 0.3);
}

.btn-vip:hover {
  background: var(--gradient-primary) !important;
  transform: translateY(-2px) scale(1.05) !important;
  box-shadow: 0 6px 20px rgba(255, 82, 119, 0.4) !important;
}

/* 桌面端用户信息样式 */
.desktop-user {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--background-secondary);
  padding: 0.5rem 1rem;
  border-radius: 50px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--primary-color);
  transition: transform var(--transition-speed) ease;
}

.user-avatar:hover {
  transform: scale(1.1);
}

.user-name {
  font-weight: 600;
  color: var(--high-contrast-text);
  min-width: 60px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vip-badge {
  background: linear-gradient(135deg, #ffd700, #ff8c00);
  color: var(--text-light);
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* 导航操作按钮 */
.navbar-actions {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.navbar-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--background-secondary);
  color: var(--text-secondary);
  font-size: 1.2rem;
  transition: all var(--transition-speed) ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.navbar-action:hover {
  background: var(--primary-color);
  color: var(--text-light);
  transform: translateY(-3px) scale(1.1);
  box-shadow: 0 4px 15px rgba(255, 82, 119, 0.3);
}

.logout-btn {
  padding: 0.6rem 1.2rem;
  font-size: 0.9rem;
  background: var(--background-secondary);
  color: var(--high-contrast-text);
  border: 2px solid var(--text-secondary);
  border-radius: 50px;
  font-weight: 500;
  transition: all var(--transition-speed) ease;
}

.logout-btn:hover {
  background: var(--primary-color);
  color: var(--text-light);
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 82, 119, 0.3);
}

/* 移动端菜单样式 */
.mobile-menu {
  position: fixed;
  top: 0;
  left: -100%;
  width: 80%;
  max-width: 320px;
  height: 100vh;
  background: white;
  box-shadow: 2px 0 15px rgba(0, 0, 0, 0.15);
  z-index: 1050;
  transition: left var(--transition-speed) ease;
  overflow-y: auto;
  padding-top: 60px;
}

.mobile-menu.open {
  left: 0;
}

.mobile-nav-links {
  display: flex;
  flex-direction: column;
  padding: 0 1rem;
}

.mobile-nav-link {
  padding: 1rem;
  color: var(--high-contrast-text);
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: 500;
  border-bottom: 1px solid var(--border-color);
  transition: all var(--transition-speed) ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  font-family: inherit;
}

.mobile-nav-link:hover {
  color: var(--primary-color);
  background: rgba(255, 82, 119, 0.05);
  transform: translateX(5px);
}

.mobile-nav-link.active {
  color: var(--primary-color);
  font-weight: 600;
}

.mobile-vip-btn {
  background: var(--gradient-primary);
  color: white !important;
  margin: 1rem 0;
  border-radius: 50px;
  text-align: center;
  padding: 0.8rem 1rem;
}

.mobile-vip-btn:hover {
  background: var(--gradient-primary);
  color: white !important;
  transform: translateX(0) scale(1.03);
}

/* 移动端子菜单样式 */
.mobile-submenu {
  margin-bottom: 0.5rem;
}

.submenu-toggle {
  position: relative;
}

.submenu-arrow {
  font-size: 0.8rem;
  transition: transform var(--transition-speed) ease;
}

.submenu-arrow.open {
  transform: rotate(180deg);
}

.submenu-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height var(--transition-speed) ease;
}

.submenu-content.open {
  max-height: 300px;
}

.submenu-item {
  display: block;
  padding: 0.8rem 1rem 0.8rem 2rem;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 1rem;
  transition: all var(--transition-speed) ease;
  border-bottom: 1px solid var(--border-color);
}

.submenu-item:hover {
  color: var(--primary-color);
  background: rgba(255, 82, 119, 0.05);
  transform: translateX(5px);
}

/* 移动端用户信息 */
.mobile-user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--background-secondary);
  border-radius: 8px;
  margin: 1rem 0;
}

.mobile-user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--primary-color);
}

.mobile-user-name {
  font-weight: 600;
  color: var(--high-contrast-text);
}

.mobile-vip-badge {
  background: linear-gradient(135deg, #ffd700, #ff8c00);
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-top: 0.25rem;
  display: inline-block;
}

/* 移动端退出按钮 */
.mobile-logout-btn {
  margin: 1rem 0;
  padding: 1rem;
  background: var(--background-secondary);
  color: var(--high-contrast-text);
  border: 2px solid var(--text-secondary);
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 500;
  transition: all var(--transition-speed) ease;
}

.mobile-logout-btn:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

/* 移动端固定操作按钮 */
.mobile-fixed-actions {
  position: fixed;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 900;
  display: none;
}

.mobile-fixed-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  background: var(--gradient-primary);
  color: white;
  padding: 1rem 2rem;
  border-radius: 50px;
  box-shadow: 0 4px 15px rgba(255, 82, 119, 0.4);
  text-decoration: none;
  font-weight: 600;
  transition: all var(--transition-speed) ease;
  min-width: 180px;
  text-align: center;
}

.mobile-fixed-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(255, 82, 119, 0.5);
}

.mobile-fixed-btn .icon {
  font-size: 1.5rem;
}

/* 响应式设计媒体查询 */
@media (max-width: 1200px) {
  .navbar-container {
    padding: 0 1.5rem;
  }
  
  .desktop-nav {
    gap: 1.2rem;
  }
  
  .navbar-link {
    font-size: 1rem;
  }
}

@media (max-width: 1024px) {
  .desktop-nav {
    gap: 1rem;
  }
  
  .navbar-link {
    padding: 0.5rem 0.6rem;
  }
  
  .desktop-user {
    gap: 0.8rem;
  }
  
  .user-info {
    padding: 0.5rem;
  }
  
  .user-avatar {
    width: 35px;
    height: 35px;
  }
  
  .user-name {
    display: none;
  }
}

@media (max-width: 768px) {
  /* 显示汉堡菜单，隐藏桌面导航 */
  .mobile-menu-toggle {
    display: block;
  }
  
  .desktop-nav {
    display: none;
  }
  
  .desktop-user {
    display: none;
  }
  
  .navbar-container {
    padding: 0 1rem;
  }
  
  /* 显示移动端固定按钮 */
  .mobile-fixed-actions {
    display: block;
  }
  
  .navbar-logo {
    font-size: 1.3rem;
  }
  
  /* 汉堡菜单按钮位置调整 */
  .navbar-container {
    justify-content: space-between;
  }
}

@media (max-width: 480px) {
  .mobile-menu {
    width: 90%;
  }
  
  .navbar-logo {
    font-size: 1.2rem;
  }
  
  .mobile-fixed-btn {
    padding: 0.8rem 1.5rem;
    min-width: 150px;
  }
  
  .mobile-fixed-btn .icon {
    font-size: 1.3rem;
  }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .navbar-container {
    padding: 0 1.5rem;
  }
  
  .nav-links {
    gap: 1.2rem;
  }
}

@media (max-width: 1024px) {
  .navbar-container {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
  
  .nav-links {
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .navbar-link {
    font-size: 0.95rem;
    padding: 0.4rem 0.6rem;
  }
  
  .btn-vip {
    font-size: 0.9rem !important;
    padding: 0.5rem 1rem !important;
  }
  
  .navbar-user {
    flex-direction: column;
    gap: 0.8rem;
  }
}

@media (max-width: 768px) {
  .nav-links {
    gap: 0.8rem;
  }
  
  .navbar-logo {
    font-size: 1.3rem;
  }
  
  .navbar-link {
    font-size: 0.9rem;
    padding: 0.3rem 0.5rem;
  }
  
  .user-info {
    padding: 0.4rem 0.8rem;
  }
  
  .navbar-actions {
    gap: 0.5rem;
  }
  
  .navbar-action {
    width: 36px;
    height: 36px;
    font-size: 1rem;
  }
}
</style>