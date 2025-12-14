<template>
  <div class="concert-reel-container card">
    <div class="reel-header">
      <h3>🎤 演唱会精彩集锦 🎤</h3>
      <div class="reel-controls">
        <button 
          class="btn btn-icon"
          @click="prevSlide"
          :disabled="isTransitioning"
          title="上一个"
        >
          ⬅️
        </button>
        <button 
          class="btn btn-icon"
          @click="nextSlide"
          :disabled="isTransitioning"
          title="下一个"
        >
          ➡️
        </button>
        <button 
          class="btn btn-secondary btn-sm"
          @click="toggleAutoPlay"
          :class="{ 'active': isAutoPlaying }"
          title="{{ isAutoPlaying ? '暂停自动播放' : '开始自动播放' }}"
        >
          {{ isAutoPlaying ? '⏸️' : '▶️' }}
        </button>
      </div>
    </div>
    
    <div class="reel-slides">
      <div 
        class="slides-wrapper"
        ref="slidesWrapper"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
      >
        <!-- 轮播图 -->
        <div 
          class="slide-container"
          :style="slideContainerStyle"
        >
          <div 
            v-for="(slide, index) in slides"
            :key="slide.id"
            class="slide"
            :class="{ 'active': currentIndex === index }"
            :style="{ width: slideWidth + 'px' }"
          >
            <!-- 图片容器 -->
            <div class="slide-image-wrapper">
              <img 
                :src="slide.imageUrl"
                :alt="slide.title"
                class="slide-image"
              >
              <!-- 渐变遮罩 -->
              <div class="slide-overlay"></div>
              <!-- 悬停时显示的信息 -->
              <div class="slide-info">
                <h4 class="slide-title">{{ slide.title }}</h4>
                <p class="slide-date">{{ slide.date }}</p>
                <p class="slide-location">{{ slide.location }}</p>
                <p class="slide-song">{{ slide.song }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 指示器 -->
        <div class="slide-indicators">
          <button 
            v-for="(slide, index) in slides"
            :key="slide.id"
            class="indicator"
            :class="{ 'active': currentIndex === index }"
            @click="goToSlide(index)"
            :title="slide.title"
          ></button>
        </div>
        
        <!-- 进度条 -->
        <div v-if="isAutoPlaying" class="auto-play-progress">
          <div 
            class="progress-fill"
            :style="{ width: progressPercent + '%' }"
          ></div>
        </div>
      </div>
    </div>
    
    <!-- 统计信息 -->
    <div class="reel-footer">
      <div class="reel-stats">
        <span class="stat-item">
          <i class="stat-icon">👁️</i>
          <span class="stat-value">{{ totalViews.toLocaleString() }}</span>
        </span>
        <span class="stat-item">
          <i class="stat-icon">❤️</i>
          <span class="stat-value">{{ totalLikes.toLocaleString() }}</span>
        </span>
        <span class="stat-item">
          <i class="stat-icon">🎵</i>
          <span class="stat-value">{{ slides.length }} 个片段</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';

export default {
  name: 'ConcertReel',
  setup() {
    // 轮播数据
    const slides = ref([
      {
        id: 1,
        title: '《演员》深情演绎',
        date: '2023-09-10',
        location: '上海梅赛德斯奔驰文化中心',
        song: '演员',
        imageUrl: 'https://picsum.photos/id/1011/800/450',
        views: 1258000,
        likes: 89700
      },
      {
        id: 2,
        title: '《丑八怪》万人合唱',
        date: '2023-08-15',
        location: '北京工人体育馆',
        song: '丑八怪',
        imageUrl: 'https://picsum.photos/id/1012/800/450',
        views: 987000,
        likes: 76500
      },
      {
        id: 3,
        title: '《刚刚好》催泪瞬间',
        date: '2023-07-22',
        location: '广州天河体育中心',
        song: '刚刚好',
        imageUrl: 'https://picsum.photos/id/1013/800/450',
        views: 1123000,
        likes: 82300
      },
      {
        id: 4,
        title: '《认真的雪》经典重现',
        date: '2023-06-30',
        location: '成都凤凰山体育公园',
        song: '认真的雪',
        imageUrl: 'https://picsum.photos/id/1014/800/450',
        views: 1567000,
        likes: 112000
      },
      {
        id: 5,
        title: '《违背的青春》热血现场',
        date: '2023-05-18',
        location: '武汉光谷国际网球中心',
        song: '违背的青春',
        imageUrl: 'https://picsum.photos/id/1015/800/450',
        views: 876000,
        likes: 65400
      },
      {
        id: 6,
        title: '《动物世界》震撼舞台',
        date: '2023-04-25',
        location: '西安奥体中心体育场',
        song: '动物世界',
        imageUrl: 'https://picsum.photos/id/1016/800/450',
        views: 954000,
        likes: 71200
      }
    ]);
    
    // 状态
    const currentIndex = ref(0);
    const isTransitioning = ref(false);
    const isAutoPlaying = ref(true);
    const autoPlayInterval = ref(null);
    const progressPercent = ref(0);
    const progressInterval = ref(null);
    const isMouseOver = ref(false);
    
    // 引用
    const slidesWrapper = ref(null);
    
    // 自动播放间隔时间（毫秒）
    const autoPlayDelay = 5000;
    
    // 计算属性
    const totalViews = computed(() => {
      return slides.value.reduce((sum, slide) => sum + slide.views, 0);
    });
    
    const totalLikes = computed(() => {
      return slides.value.reduce((sum, slide) => sum + slide.likes, 0);
    });
    
    const slideWidth = computed(() => {
      // 获取容器宽度，确保轮播图宽度适应容器
      if (slidesWrapper.value) {
        return slidesWrapper.value.offsetWidth;
      }
      return 800; // 默认宽度
    });
    
    const slideContainerStyle = computed(() => {
      // 计算轮播容器的样式
      const translateX = -currentIndex.value * slideWidth.value;
      return {
        transform: `translateX(${translateX}px)`,
        transition: isTransitioning.value ? 'transform 0.5s ease' : 'none'
      };
    });
    
    // 下一个轮播图
    const nextSlide = () => {
      if (isTransitioning.value) return;
      
      isTransitioning.value = true;
      
      // 更新索引
      currentIndex.value = (currentIndex.value + 1) % slides.value.length;
      
      // 重置进度条
      resetProgress();
      
      // 等待过渡完成
      setTimeout(() => {
        isTransitioning.value = false;
      }, 500);
    };
    
    // 上一个轮播图
    const prevSlide = () => {
      if (isTransitioning.value) return;
      
      isTransitioning.value = true;
      
      // 更新索引
      currentIndex.value = (currentIndex.value - 1 + slides.value.length) % slides.value.length;
      
      // 重置进度条
      resetProgress();
      
      // 等待过渡完成
      setTimeout(() => {
        isTransitioning.value = false;
      }, 500);
    };
    
    // 跳转到指定轮播图
    const goToSlide = (index) => {
      if (isTransitioning.value || index === currentIndex.value) return;
      
      isTransitioning.value = true;
      
      // 更新索引
      currentIndex.value = index;
      
      // 重置进度条
      resetProgress();
      
      // 等待过渡完成
      setTimeout(() => {
        isTransitioning.value = false;
      }, 500);
    };
    
    // 切换自动播放
    const toggleAutoPlay = () => {
      isAutoPlaying.value = !isAutoPlaying.value;
      
      if (isAutoPlaying.value) {
        startAutoPlay();
      } else {
        stopAutoPlay();
      }
    };
    
    // 开始自动播放
    const startAutoPlay = () => {
      // 清除已存在的定时器
      stopAutoPlay();
      
      // 设置自动播放定时器
      autoPlayInterval.value = setInterval(() => {
        if (!isMouseOver.value) {
          nextSlide();
        }
      }, autoPlayDelay);
      
      // 设置进度条定时器
      startProgress();
    };
    
    // 停止自动播放
    const stopAutoPlay = () => {
      if (autoPlayInterval.value) {
        clearInterval(autoPlayInterval.value);
        autoPlayInterval.value = null;
      }
      
      if (progressInterval.value) {
        clearInterval(progressInterval.value);
        progressInterval.value = null;
      }
      
      // 重置进度条
      progressPercent.value = 0;
    };
    
    // 开始进度条动画
    const startProgress = () => {
      // 清除已存在的进度条定时器
      if (progressInterval.value) {
        clearInterval(progressInterval.value);
      }
      
      // 重置进度
      progressPercent.value = 0;
      
      // 计算每毫秒增加的进度百分比
      const increment = 100 / (autoPlayDelay / 16); // 约60fps
      
      // 设置进度条定时器
      progressInterval.value = setInterval(() => {
        if (!isMouseOver.value) {
          progressPercent.value += increment;
          
          // 进度条满时重置
          if (progressPercent.value >= 100) {
            progressPercent.value = 0;
          }
        }
      }, 16);
    };
    
    // 重置进度条
    const resetProgress = () => {
      progressPercent.value = 0;
      
      // 如果正在自动播放，重新开始进度条
      if (isAutoPlaying.value) {
        startProgress();
      }
    };
    
    // 鼠标进入
    const onMouseEnter = () => {
      isMouseOver.value = true;
    };
    
    // 鼠标离开
    const onMouseLeave = () => {
      isMouseOver.value = false;
    };
    
    // 窗口大小变化时调整轮播图宽度
    const handleResize = () => {
      nextTick(() => {
        // 强制重绘
        if (slidesWrapper.value) {
          slidesWrapper.value.style.height = `${slidesWrapper.value.offsetHeight}px`;
          
          // 触发回流
          setTimeout(() => {
            if (slidesWrapper.value) {
              slidesWrapper.value.style.height = '';
            }
          }, 0);
        }
      });
    };
    
    // 监听窗口大小变化
    onMounted(() => {
      // 开始自动播放
      startAutoPlay();
      
      // 添加窗口大小变化监听
      window.addEventListener('resize', handleResize);
      
      // 初始调整
      handleResize();
    });
    
    // 组件卸载时清理
    onUnmounted(() => {
      // 停止自动播放
      stopAutoPlay();
      
      // 移除窗口大小变化监听
      window.removeEventListener('resize', handleResize);
    });
    
    // 监听isAutoPlaying变化
    watch(isAutoPlaying, (newValue) => {
      if (newValue) {
        startAutoPlay();
      } else {
        stopAutoPlay();
      }
    });
    
    return {
      slides,
      currentIndex,
      isTransitioning,
      isAutoPlaying,
      progressPercent,
      isMouseOver,
      slidesWrapper,
      totalViews,
      totalLikes,
      slideWidth,
      slideContainerStyle,
      nextSlide,
      prevSlide,
      goToSlide,
      toggleAutoPlay,
      onMouseEnter,
      onMouseLeave
    };
  }
};
</script>

<style scoped>
.concert-reel-container {
  max-width: 1000px;
  margin: 0 auto;
  background: var(--background-primary);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* 轮播头部 */
.reel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: var(--primary-gradient);
  color: white;
}

.reel-header h3 {
  margin: 0;
  font-size: 1.3rem;
}

.reel-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.reel-controls .btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all var(--transition-speed) ease;
}

.reel-controls .btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.reel-controls .btn.active {
  background: rgba(255, 255, 255, 0.4);
}

.reel-controls .btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 轮播主体 */
.reel-slides {
  position: relative;
  overflow: hidden;
}

.slides-wrapper {
  position: relative;
  width: 100%;
  cursor: pointer;
}

.slide-container {
  display: flex;
  transition: transform 0.5s ease;
}

.slide {
  flex-shrink: 0;
  position: relative;
}

.slide-image-wrapper {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 56.25%; /* 16:9 比例 */
  overflow: hidden;
}

.slide-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-speed) ease;
}

.slide:hover .slide-image {
  transform: scale(1.05);
}

.slide-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0) 100%);
  opacity: 0;
  transition: opacity var(--transition-speed) ease;
}

.slide:hover .slide-overlay {
  opacity: 1;
}

.slide-info {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 2rem;
  color: white;
  transform: translateY(20px);
  opacity: 0;
  transition: all var(--transition-speed) ease;
  z-index: 10;
}

.slide:hover .slide-info {
  transform: translateY(0);
  opacity: 1;
}

.slide-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.slide-date,
.slide-location,
.slide-song {
  margin: 0.25rem 0;
  font-size: 0.9rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.slide-date {
  color: var(--primary-color);
  font-weight: 600;
}

/* 指示器 */
.slide-indicators {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
  z-index: 20;
}

.indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  border: none;
  cursor: pointer;
  transition: all var(--transition-speed) ease;
}

.indicator:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: scale(1.2);
}

.indicator.active {
  background: var(--primary-color);
  transform: scale(1.3);
}

/* 自动播放进度条 */
.auto-play-progress {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  z-index: 20;
}

.progress-fill {
  height: 100%;
  background: var(--primary-color);
  transition: width 0.02s linear;
}

/* 轮播底部 */
.reel-footer {
  padding: 1rem 1.5rem;
  background: var(--background-secondary);
  border-top: 1px solid var(--border-color);
}

.reel-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.stat-icon {
  font-size: 1.1rem;
}

.stat-value {
  font-weight: 600;
  color: var(--text-primary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .concert-reel-container {
    margin: 0 1rem;
  }
  
  .reel-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .slide-info {
    padding: 1.5rem;
  }
  
  .slide-title {
    font-size: 1.2rem;
  }
  
  .reel-stats {
    gap: 1rem;
  }
  
  .stat-item {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .reel-header h3 {
    font-size: 1.1rem;
  }
  
  .slide-info {
    padding: 1rem;
  }
  
  .slide-title {
    font-size: 1rem;
  }
  
  .slide-date,
  .slide-location,
  .slide-song {
    font-size: 0.8rem;
  }
  
  .slide-indicators {
    bottom: 0.5rem;
  }
  
  .indicator {
    width: 10px;
    height: 10px;
  }
  
  .reel-stats {
    gap: 0.75rem;
  }
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide.active .slide-info {
  animation: fadeInUp 0.5s ease-out;
}
</style>