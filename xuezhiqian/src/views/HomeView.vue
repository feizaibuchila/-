<template>
  <div class="home-container">
    <!-- 导航栏 -->
    <Navbar />
    
    <!-- 加载进度条 -->
    <div class="loading-progress-container" v-if="loadingProgress < 100">
      <div class="loading-progress-bar" :style="{ width: loadingProgress + '%' }"></div>
      <div class="loading-progress-text">{{ loadingProgress }}%</div>
    </div>
    
    <!-- 页面内容 -->
    <main class="main-content">
      <!-- 顶部横幅 -->
      <section class="hero-section fade-in">
        <div class="hero-carousel carousel">
          <!-- 薛之谦主视觉图片 -->
          <div class="hero-image">
            <img src="https://picsum.photos/id/1025/1200/800" alt="薛之谦" class="hero-main-image">
          </div>
          
          <!-- 背景音乐波形动画 -->
          <div class="hero-waveform">
            <canvas ref="heroWaveformCanvas" class="hero-waveform-canvas"></canvas>
          </div>
          
          <div class="hero-content">
            <h1>永远快乐薛之谦，我心终有谦谦结</h1>
            <p>欢迎来到薛之谦官方粉丝应援站</p>
            <div class="hero-actions">
              <router-link to="/concerts" class="btn btn-animated">查看最新演唱会</router-link>
              <router-link to="/vip" class="btn btn-vip btn-animated">开通会员享特权</router-link>
            </div>
          </div>
          <div class="hero-overlay"></div>
        </div>
      </section>
      
      <!-- 粉丝时长展示 -->
      <section class="fans-since-section fade-in">
        <div class="fans-since-card card card-hover">
          <h2>亲爱的谦友</h2>
          <p>你已经喜欢薛之谦 <span class="years-count">{{ fansSinceYears }} 年</span> 啦！</p>
          <p class="join-date">加入时间：{{ formatDate(fansSince) }}</p>
          <div class="love-meter">
            <div class="love-bar">
              <div class="love-progress" :style="{ width: `${loveProgress}%` }"></div>
            </div>
            <span class="love-percentage">{{ loveProgress }}%</span>
          </div>
        </div>
      </section>
      
      <!-- 演唱会集锦轮播 -->
      <section class="concert-reel-section fade-in">
        <ConcertReel />
      </section>
      
      <!-- 最新动态 -->
      <section class="latest-updates fade-in">
        <h2>最新动态</h2>
        
        <!-- 薛之谦最新照片展示 -->
        <section class="latest-photos-section">
          <h3>📸 薛之谦最新照片</h3>
          <div class="photos-grid">
            <div class="photo-card">
              <img src="https://picsum.photos/id/1011/400/300" alt="薛之谦照片1" class="photo-item">
            </div>
            <div class="photo-card">
              <img src="https://picsum.photos/id/1013/400/300" alt="薛之谦照片2" class="photo-item">
            </div>
            <div class="photo-card">
              <img src="https://picsum.photos/id/1027/400/300" alt="薛之谦照片3" class="photo-item">
            </div>
            <div class="photo-card">
              <img src="https://picsum.photos/id/1035/400/300" alt="薛之谦照片4" class="photo-item">
            </div>
            <div class="photo-card">
              <img src="https://picsum.photos/id/1041/400/300" alt="薛之谦照片5" class="photo-item">
            </div>
            <div class="photo-card">
              <img src="https://picsum.photos/id/1059/400/300" alt="薛之谦照片6" class="photo-item">
            </div>
          </div>
        </section>
        
        <!-- 演唱会行程日历 -->
        <ScheduleCalendar />
        
        <!-- 音乐作品与MV播放器 -->
        <section class="music-section">
          <h3>🎵 热门音乐与MV</h3>
          <MVPlayer />
        </section>
        
        <!-- 应援活动 -->
        <section class="activities-section">
          <ActivitySignup />
        </section>
      </section>
      
      <!-- 应援音频播放器 -->
      <section class="audio-player-section fade-in">
        <AudioPlayer />
      </section>
      
      <!-- 粉丝应援动态墙 -->
      <section class="fan-wall fade-in">
        <MessageBoard />
      </section>
      
      <!-- 歌词接龙游戏 -->
      <section class="lyrics-game fade-in">
        <LyricsGame />
      </section>
    </main>
    
    <!-- 页脚 -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-links">
          <h4>官方链接</h4>
          <ul>
            <li><a href="https://weibo.com/xuezhiqian" target="_blank" rel="noopener noreferrer" class="external-link">薛之谦官方微博</a></li>
            <li><a href="https://music.163.com/#/artist?id=6452" target="_blank" rel="noopener noreferrer" class="external-link">网易云音乐主页</a></li>
            <li><a href="https://y.qq.com/n/ryqq/singer/002J4UUk29y8BY" target="_blank" rel="noopener noreferrer" class="external-link">QQ音乐主页</a></li>
            <li><a href="https://www.douyin.com/user/MS4wLjABAAAAdV8n9kMZc27z0l1f6OQ1p3K5V8V0X6cBcNQnXrXrXrXrXrXrXrXrXrXrXrXrXr" target="_blank" rel="noopener noreferrer" class="external-link">抖音官方账号</a></li>
          </ul>
        </div>
        <div class="footer-info">
          <h4>关于我们</h4>
          <p>薛之谦粉丝应援站 - 永远快乐薛之谦，我心终有谦谦结</p>
          <p>© 2024 薛之谦粉丝应援站. 保留所有权利.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useUserStore } from '../store/index';
import Navbar from '../components/Navbar.vue';
import ScheduleCalendar from '../components/ScheduleCalendar.vue';
import ActivitySignup from '../components/ActivitySignup.vue';
import MessageBoard from '../components/MessageBoard.vue';
import LyricsGame from '../components/LyricsGame.vue';
import AudioPlayer from '../components/AudioPlayer.vue';
import ConcertReel from '../components/ConcertReel.vue';
import MVPlayer from '../components/MVPlayer.vue';

export default {
  name: 'HomeView',
  components: {
    Navbar,
    ScheduleCalendar,
    ActivitySignup,
    MessageBoard,
    LyricsGame,
    AudioPlayer,
    ConcertReel,
    MVPlayer
  },
  setup() {
    const userStore = useUserStore();
    
    // 加载进度
    const loadingProgress = ref(0);
    
    // 首页波形动画
    const heroWaveformCanvas = ref(null);
    const animationId = ref(null);
    
    // 粉丝数据
    const fansSinceYears = computed(() => {
      // 从用户存储中获取粉丝时长
      const fansSince = userStore.getFansSince;
      if (!fansSince) return 0;
      const now = new Date();
      const yearsDiff = now.getFullYear() - fansSince.getFullYear();
      return yearsDiff;
    });
    
    const fansSince = computed(() => userStore.getFansSince);
    const loveProgress = ref(85); // 模拟数据
    
    // 格式化日期
    const formatDate = (date) => {
      if (!date) return '';
      const d = new Date(date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };
    
    // 模拟资源加载进度
    const simulateLoadingProgress = () => {
      const interval = setInterval(() => {
        loadingProgress.value += Math.random() * 20;
        if (loadingProgress.value >= 100) {
          loadingProgress.value = 100;
          clearInterval(interval);
        }
      }, 200);
    };
    
    // 绘制首页背景波形动画
    const drawHeroWaveform = () => {
      if (!heroWaveformCanvas.value) return;
      
      const canvas = heroWaveformCanvas.value;
      const ctx = canvas.getContext('2d');
      
      // 设置canvas尺寸
      const setCanvasSize = () => {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      };
      
      setCanvasSize();
      window.addEventListener('resize', setCanvasSize);
      
      const draw = () => {
        animationId.value = requestAnimationFrame(draw);
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 创建渐变背景
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, 'rgba(255, 60, 87, 0.7)'); // 主色
        gradient.addColorStop(0.5, 'rgba(167, 139, 250, 0.7)'); // 紫色
        gradient.addColorStop(1, 'rgba(255, 126, 185, 0.7)'); // 粉色
        
        // 绘制多层波形
        for (let layer = 0; layer < 3; layer++) {
          const y = canvas.height * (0.4 + layer * 0.2);
          const amplitude = 30 - layer * 10;
          const frequency = 0.02 - layer * 0.005;
          const speed = 0.001 + layer * 0.0005;
          
          ctx.beginPath();
          ctx.moveTo(0, y);
          
          for (let x = 0; x < canvas.width; x++) {
            const offset = Date.now() * speed;
            const yOffset = Math.sin(x * frequency + offset) * amplitude;
            ctx.lineTo(x, y + yOffset);
          }
          
          ctx.lineTo(canvas.width, canvas.height);
          ctx.lineTo(0, canvas.height);
          ctx.closePath();
          
          // 设置半透明填充
          ctx.fillStyle = layer === 0 ? gradient : `rgba(255, 255, 255, ${0.1 - layer * 0.03})`;
          ctx.fill();
        }
      };
      
      draw();
    };
    
    onMounted(() => {
      simulateLoadingProgress();
      
      nextTick(() => {
        drawHeroWaveform();
      });
      
      // 图片懒加载实现
      const lazyLoadImages = () => {
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        lazyImages.forEach(img => {
          const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
              }
            });
          });
          
          observer.observe(img);
        });
      };
      
      // 延迟执行懒加载以确保DOM已加载
      setTimeout(lazyLoadImages, 100);
    });
    
    onUnmounted(() => {
      if (animationId.value) {
        cancelAnimationFrame(animationId.value);
      }
      window.removeEventListener('resize', () => {});
    });
    
    return {
      fansSinceYears,
      fansSince,
      loveProgress,
      formatDate,
      loadingProgress,
      heroWaveformCanvas
    };
  }
};
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  padding-top: 80px; /* 为固定导航栏留出空间 */
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

/* 顶部横幅 */
.hero-section {
  position: relative;
  height: 80vh;
  margin-bottom: 2rem;
  border-radius: 12px;
  overflow: hidden;
}

.hero-carousel {
  height: 100%;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  position: relative;
  overflow: hidden;
}

.hero-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.hero-main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.3;
}

/* 首页背景波形动画 */
.hero-waveform {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.hero-waveform-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

/* 加载进度条 */
.loading-progress-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.loading-progress-bar {
  height: 100%;
  background: var(--primary-gradient);
  transition: width 0.3s ease;
  position: relative;
}

.loading-progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.loading-progress-text {
  position: absolute;
  top: 100%;
  right: 10px;
  margin-top: 5px;
  font-size: 0.8rem;
  color: var(--text-secondary);
  background: var(--background-secondary);
  padding: 2px 8px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 卡片悬停效果 */
.card-hover {
  transition: all 0.3s ease;
}

.card-hover:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

/* 按钮动画效果 */
.btn-animated {
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.btn-animated::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
  z-index: -1;
}

.btn-animated:hover::before {
  left: 100%;
}

.hero-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: var(--text-light);
  z-index: 2;
}

.hero-content h1 {
  font-size: clamp(2.5rem, 5vw, 4rem);
  margin-bottom: 1rem;
  color: var(--text-light);
}

.hero-content h1::after {
  background: var(--text-light);
}

.hero-content p {
  font-size: clamp(1rem, 2vw, 1.5rem);
  margin-bottom: 2rem;
  color: var(--text-light);
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1;
}

/* 粉丝时长卡片 */
.fans-since-section {
  margin-bottom: 3rem;
  text-align: center;
}

.fans-since-card {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.years-count {
  color: var(--primary-color);
  font-size: 1.5rem;
  font-weight: 700;
}

.join-date {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.love-meter {
  margin-top: 1.5rem;
}

.love-bar {
  width: 100%;
  height: 12px;
  background: var(--border-color);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.love-progress {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-light));
  border-radius: 6px;
  transition: width 1s ease;
}

.love-percentage {
  font-weight: 600;
  color: var(--primary-color);
}

/* 最新动态 */
.latest-updates {
  margin-bottom: 3rem;
}

/* 最新照片展示 */
.latest-photos-section {
  margin-bottom: 3rem;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.photo-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.photo-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.photo-item {
  width: 100%;
  height: 225px;
  object-fit: cover;
  display: block;
}

.updates-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  border: 2px solid var(--primary-color);
  background: transparent;
  color: var(--primary-color);
  border-radius: 30px;
  cursor: pointer;
  transition: all var(--transition-speed) ease;
  font-weight: 600;
}

.tab-btn:hover {
  background: var(--primary-color);
  color: var(--text-light);
  transform: translateY(-2px);
}

.tab-btn.active {
  background: var(--primary-color);
  color: var(--text-light);
}

/* 日历样式 */
.concerts-calendar {
  background: var(--card-background);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.calendar-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--background-primary);
  transition: all var(--transition-speed) ease;
  position: relative;
  min-height: 80px;
}

.calendar-day.hasEvent {
  background: rgba(255, 60, 87, 0.1);
  border: 2px solid var(--primary-color);
}

.day-number {
  font-weight: 600;
}

.event-indicator {
  position: absolute;
  bottom: 4px;
  left: 4px;
  right: 4px;
  text-align: center;
  font-size: 0.7rem;
  color: var(--primary-color);
  font-weight: 600;
}

.event-location {
  display: block;
  font-size: 0.6rem;
  color: var(--text-secondary);
  font-weight: normal;
}

/* 音乐专辑 */
.albums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
}

.album-card {
  text-align: center;
}

.album-cover {
  width: 100%;
  height: auto;
  border-radius: 8px;
  margin-bottom: 1rem;
  transition: transform var(--transition-speed) ease;
}

.album-card:hover .album-cover {
  transform: scale(1.05);
}

.album-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
}

/* 应援活动 */
.activities-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.activity-card {
  display: flex;
  flex-direction: column;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.activity-date {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.activity-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.activity-status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.activity-status.active {
  background: rgba(76, 175, 80, 0.1);
  color: var(--success-color);
}

.activity-status.upcoming {
  background: rgba(255, 152, 0, 0.1);
  color: var(--warning-color);
}

/* 粉丝应援动态墙 */
.fan-wall {
  margin-bottom: 3rem;
}

.fan-wall-filter {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-secondary);
  border-radius: 20px;
  cursor: pointer;
  transition: all var(--transition-speed) ease;
  font-size: 0.9rem;
}

.filter-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.filter-btn.active {
  background: var(--primary-color);
  color: var(--text-light);
  border-color: var(--primary-color);
}

.fan-posts {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.post-card {
  display: flex;
  flex-direction: column;
}

.post-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.post-content {
  margin-bottom: 1rem;
}

.post-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
  margin-top: 1rem;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.post-date {
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.post-actions {
  display: flex;
  gap: 1rem;
}

.action-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-speed) ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.action-btn:hover {
  color: var(--primary-color);
}

.action-btn.liked {
  color: var(--primary-color);
}

/* 歌词接龙游戏 */
.lyrics-game {
  margin-bottom: 3rem;
}

.game-card {
  padding: 2rem;
  text-align: center;
}

.current-lyric {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(255, 60, 87, 0.1);
  border-radius: 8px;
}

.game-input {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.answer-input {
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 30px;
  width: 100%;
  max-width: 400px;
  font-size: 1rem;
  transition: border-color var(--transition-speed) ease;
}

.answer-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.game-result {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.game-result.correct {
  background: rgba(76, 175, 80, 0.1);
  color: var(--success-color);
}

.game-result.wrong {
  background: rgba(255, 60, 87, 0.1);
  color: var(--danger-color);
}

.correct-answer {
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.game-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1.5rem;
}

.game-stats p {
  font-weight: 600;
  color: var(--secondary-color);
}

/* 页脚 */
.footer {
  background: var(--background-dark);
  color: var(--text-light);
  padding: 3rem 2rem;
  margin-top: 3rem;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.footer-links h4,
.footer-info h4 {
  color: var(--text-light);
  margin-bottom: 1.5rem;
}

.footer-links ul {
  list-style: none;
  padding: 0;
}

.footer-links li {
  margin-bottom: 0.75rem;
}

.footer-links a {
  color: rgba(255, 255, 255, 0.8);
}

.footer-links a:hover {
  color: var(--primary-color);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }
  
  .hero-section {
    height: 60vh;
  }
  
  .hero-content h1 {
    font-size: 2rem;
  }
  
  .updates-tabs,
  .fan-wall-filter {
    justify-content: center;
  }
  
  .calendar-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .fan-posts {
    grid-template-columns: 1fr;
  }
  
  .game-input {
    flex-direction: column;
    align-items: center;
  }
  
  .answer-input {
    max-width: 100%;
  }
}
</style>