<template>
  <div class="mv-player-container">
    <!-- 视频播放器容器 -->
    <div class="video-wrapper">
      <!-- 弹幕容器 -->
      <div class="danmaku-container" ref="danmakuContainer">
        <div 
          v-for="danmaku in activeDanmakus" 
          :key="danmaku.id"
          class="danmaku"
          :class="`danmaku-${danmaku.position}`"
          :style="{
            animationDuration: `${danmaku.duration}s`,
            color: danmaku.color,
            fontSize: `${danmaku.fontSize}px`,
            fontWeight: danmaku.bold ? 'bold' : 'normal',
            opacity: danmaku.opacity,
            top: danmaku.position === 'top' || danmaku.position === 'bottom' ? `${danmaku.y}%` : '50%',
            transform: danmaku.position === 'top' || danmaku.position === 'bottom' ? 'none' : 'translateY(-50%)',
            zIndex: danmaku.zIndex
          }"
        >
          <span v-if="danmaku.vipLevel > 0" class="vip-badge" :class="`vip-badge-${danmaku.vipLevel}`">
            {{ danmaku.vipLevel === 2 ? '高级' : '' }}VIP
          </span>
          {{ danmaku.text }}
        </div>
      </div>
      
      <!-- 视频元素 -->
      <video 
        ref="videoPlayer"
        :src="currentMV.src"
        :poster="currentMV.poster"
        controls
        @play="onPlay"
        @pause="onPause"
        @timeupdate="onTimeUpdate"
        @ended="onEnded"
        @loadedmetadata="onLoadedMetadata"
        @volumechange="onVolumeChange"
        @error="onError"
        :muted="isMuted"
      >
        您的浏览器不支持HTML5视频播放。
      </video>
      
      <!-- 自定义控制层 -->
      <div class="custom-controls" v-if="showControls">
        <div class="progress-container">
          <div 
            class="progress-bar"
            @click="seek"
          >
            <div 
              class="progress-filled"
              :style="{ width: `${progress}%` }"
            ></div>
            <div 
              class="progress-buffer"
              :style="{ width: `${bufferProgress}%` }"
            ></div>
          </div>
        </div>
        
        <div class="controls-bottom">
          <div class="controls-left">
            <button 
              class="control-btn"
              @click="togglePlay"
              title="播放/暂停"
            >
              {{ isPlaying ? '⏸️' : '▶️' }}
            </button>
            
            <button 
              class="control-btn"
              @click="toggleMute"
              title="静音/取消静音"
            >
              {{ isMuted ? '🔇' : (volume > 0.5 ? '🔊' : '🔉') }}
            </button>
            
            <div class="volume-slider">
              <input 
                type="range"
                min="0"
                max="1"
                step="0.05"
                :value="volume"
                @input="setVolume"
                title="音量调节"
              >
            </div>
            
            <span class="time-display">
              {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
            </span>
          </div>
          
          <div class="controls-center">
            <button 
              class="control-btn"
              @click="toggleDanmaku"
              title="开启/关闭弹幕"
              :class="{ active: showDanmaku }"
            >
              {{ showDanmaku ? '💬' : '💭' }}
            </button>
            
            <button 
              class="control-btn"
              @click="toggleFullScreen"
              title="全屏/退出全屏"
            >
              {{ isFullScreen ? '🔽' : '🔼' }}
            </button>
          </div>
          
          <div class="controls-right">
            <select 
              class="speed-select"
              :value="playbackSpeed"
              @change="setPlaybackSpeed"
              title="播放速度"
            >
              <option value="0.5">0.5x</option>
              <option value="0.75">0.75x</option>
              <option value="1">1.0x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2.0x</option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- 加载动画 -->
      <div class="loading-spinner" v-if="isLoading && !isPlaying">
        <div class="spinner"></div>
        <span>加载中...</span>
      </div>
    </div>
    
    <!-- MV信息 -->
    <div class="mv-info">
      <h2>{{ currentMV.title }}</h2>
      <p class="mv-artist">薛之谦</p>
      <p class="mv-description">{{ currentMV.description }}</p>
      <div class="mv-stats">
        <span>播放量: {{ formatNumber(currentMV.views) }}</span>
        <span>点赞: {{ formatNumber(currentMV.likes) }}</span>
        <span>收藏: {{ formatNumber(currentMV.favorites) }}</span>
        <span>评论: {{ formatNumber(currentMV.comments) }}</span>
      </div>
    </div>
    
    <!-- 弹幕发送区域 -->
    <div class="danmaku-input-area" v-if="showDanmaku">
      <div class="danmaku-input-wrapper">
        <input 
          type="text"
          class="danmaku-input"
          v-model="danmakuText"
          placeholder="发送弹幕..."
          @keydown.enter="sendDanmaku"
          maxlength="50"
        >
        
        <div class="danmaku-settings">
          <select 
            v-model="danmakuPosition"
            class="danmaku-position-select"
            title="弹幕位置"
          >
            <option value="scroll">滚动</option>
            <option value="top">顶部</option>
            <option value="bottom">底部</option>
          </select>
          
          <input 
            type="color"
            v-model="danmakuColor"
            class="danmaku-color-picker"
            title="弹幕颜色"
          >
        </div>
        
        <button 
          class="danmaku-send-btn btn btn-primary"
          @click="sendDanmaku"
          :disabled="!danmakuText.trim()"
          title="发送弹幕"
        >
          发送
        </button>
      </div>
      
      <div class="danmaku-tips">
        <span>弹幕字数上限50字</span>
        <span>文明观看，理性发言</span>
      </div>
    </div>
    
    <!-- 相关MV推荐 -->
    <div class="related-mvs">
      <h3>相关MV推荐</h3>
      <div class="mvs-grid">
        <div 
          v-for="mv in relatedMVs"
          :key="mv.id"
          class="mv-item"
          @click="playMV(mv.id)"
        >
          <div class="mv-thumbnail">
            <img :src="mv.poster" :alt="mv.title">
            <span class="mv-duration">{{ formatTime(mv.duration) }}</span>
          </div>
          <h4 class="mv-title">{{ mv.title }}</h4>
          <p class="mv-stats">{{ formatNumber(mv.views) }}次播放</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useUserStore } from '../store/index';

export default {
  name: 'MVPlayer',
  props: {
    mvId: {
      type: Number,
      default: 1
    }
  },
  setup(props) {
    const userStore = useUserStore();
    const videoPlayer = ref(null);
    const danmakuContainer = ref(null);
    
    // 视频状态
    const isPlaying = ref(false);
    const isMuted = ref(false);
    const volume = ref(0.8);
    const currentTime = ref(0);
    const duration = ref(0);
    const progress = ref(0);
    const bufferProgress = ref(0);
    const playbackSpeed = ref(1);
    const isFullScreen = ref(false);
    const showControls = ref(true);
    const isLoading = ref(false);
    
    // 弹幕状态
    const showDanmaku = ref(true);
    const danmakuText = ref('');
    const danmakuColor = ref('#FFFFFF');
    const danmakuPosition = ref('scroll');
    const activeDanmakus = ref([]);
    const danmakuIdCounter = ref(0);
    
    // MV数据
    const mvs = [
      {
        id: 1,
        title: '薛之谦 - 天外来物',
        src: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4', // 测试视频
        poster: 'https://p1.music.126.net/x2o8IuTzS2D40d4I1r7YKA==/109951166425848609.jpg',
        duration: 263,
        description: '薛之谦2021全新单曲《天外来物》MV，宇宙级浪漫的极致表达。',
        views: 12345678,
        likes: 567890,
        favorites: 234567,
        comments: 123456
      },
      {
        id: 2,
        title: '薛之谦 - 像风一样',
        src: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4', // 测试视频
        poster: 'https://p1.music.126.net/jvZ9mG4u2T0nQaJ38W00vQ==/109951164563917071.jpg',
        duration: 245,
        description: '薛之谦《像风一样》MV，细腻刻画爱情中的温柔与洒脱。',
        views: 9876543,
        likes: 456789,
        favorites: 189012,
        comments: 98765
      },
      {
        id: 3,
        title: '薛之谦 - 违背的青春',
        src: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4', // 测试视频
        poster: 'https://p1.music.126.net/rs0i9400s3fY02n1pZg1Dw==/109951163144113282.jpg',
        duration: 278,
        description: '薛之谦《违背的青春》MV，致敬每一个为梦想奋斗的人。',
        views: 8765432,
        likes: 345678,
        favorites: 156789,
        comments: 87654
      },
      {
        id: 4,
        title: '薛之谦 - 刚刚好',
        src: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4', // 测试视频
        poster: 'https://p1.music.126.net/8lG9Zuc4NkqGpCk23iXU4A==/109951165107256460.jpg',
        duration: 231,
        description: '薛之谦《刚刚好》MV，诠释爱情中恰到好处的温柔与遗憾。',
        views: 7654321,
        likes: 234567,
        favorites: 123456,
        comments: 76543
      }
    ];
    
    // 当前播放的MV
    const currentMV = computed(() => {
      return mvs.find(mv => mv.id === props.mvId) || mvs[0];
    });
    
    // 相关MV推荐
    const relatedMVs = computed(() => {
      return mvs.filter(mv => mv.id !== props.mvId);
    });
    
    // 控制层显示计时器
    let controlsTimer = null;
    let danmakuGeneratorTimer = null;
    
    // 格式化时间
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    
    // 格式化数字
    const formatNumber = (num) => {
      if (num >= 100000000) {
        return (num / 100000000).toFixed(1) + '亿';
      } else if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万';
      }
      return num.toString();
    };
    
    // 播放/暂停切换
    const togglePlay = () => {
      if (videoPlayer.value) {
        if (isPlaying.value) {
          videoPlayer.value.pause();
        } else {
          videoPlayer.value.play().catch(error => {
            console.error('播放失败:', error);
            isLoading.value = false;
          });
        }
      }
    };
    
    // 静音切换
    const toggleMute = () => {
      isMuted.value = !isMuted.value;
    };
    
    // 设置音量
    const setVolume = (event) => {
      const newVolume = parseFloat(event.target.value);
      volume.value = newVolume;
      if (newVolume > 0) {
        isMuted.value = false;
      }
    };
    
    // 跳转进度
    const seek = (event) => {
      if (videoPlayer.value && duration.value > 0) {
        const rect = event.currentTarget.getBoundingClientRect();
        const pos = (event.clientX - rect.left) / rect.width;
        const newTime = pos * duration.value;
        videoPlayer.value.currentTime = newTime;
      }
    };
    
    // 设置播放速度
    const setPlaybackSpeed = (event) => {
      const newSpeed = parseFloat(event.target.value);
      playbackSpeed.value = newSpeed;
      if (videoPlayer.value) {
        videoPlayer.value.playbackRate = newSpeed;
      }
    };
    
    // 全屏切换
    const toggleFullScreen = () => {
      const videoWrapper = document.querySelector('.video-wrapper');
      if (!document.fullscreenElement) {
        videoWrapper.requestFullscreen().catch(err => {
          console.error(`全屏切换失败: ${err.message}`);
        });
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    };
    
    // 弹幕开关
    const toggleDanmaku = () => {
      showDanmaku.value = !showDanmaku.value;
    };
    
    // 发送弹幕
    const sendDanmaku = () => {
      const text = danmakuText.value.trim();
      if (!text) return;
      
      const userVipLevel = userStore.getVipLevel;
      
      const newDanmaku = {
        id: danmakuIdCounter.value++,
        text: text,
        color: danmakuColor.value,
        position: danmakuPosition.value,
        fontSize: 16,
        bold: false,
        opacity: 1,
        duration: 8 + Math.random() * 4, // 弹幕持续时间8-12秒
        time: currentTime.value,
        vipLevel: userVipLevel,
        zIndex: 10,
        y: danmakuPosition.value === 'scroll' ? 0 : Math.floor(Math.random() * 80) + 10 // 顶部和底部弹幕的Y位置
      };
      
      activeDanmakus.value.push(newDanmaku);
      danmakuText.value = '';
      
      // 30秒后移除弹幕
      setTimeout(() => {
        activeDanmakus.value = activeDanmakus.value.filter(d => d.id !== newDanmaku.id);
      }, 30000);
    };
    
    // 播放指定MV
    const playMV = (mvId) => {
      // 这里可以添加MV切换逻辑
      console.log('播放MV:', mvId);
      // 清空当前弹幕
      activeDanmakus.value = [];
      // 触发父组件更新MV
      // emit('change-mv', mvId);
    };
    
    // 视频事件处理
    const onPlay = () => {
      isPlaying.value = true;
      isLoading.value = false;
      startDanmakuGenerator();
    };
    
    const onPause = () => {
      isPlaying.value = false;
      stopDanmakuGenerator();
    };
    
    const onTimeUpdate = () => {
      if (videoPlayer.value && duration.value > 0) {
        currentTime.value = videoPlayer.value.currentTime;
        progress.value = (currentTime.value / duration.value) * 100;
        
        // 更新缓冲进度
        if (videoPlayer.value.buffered.length > 0) {
          const bufferedEnd = videoPlayer.value.buffered.end(videoPlayer.value.buffered.length - 1);
          bufferProgress.value = (bufferedEnd / duration.value) * 100;
        }
      }
      
      // 隐藏控制层
      if (showControls.value && isPlaying.value) {
        if (controlsTimer) clearTimeout(controlsTimer);
        controlsTimer = setTimeout(() => {
          showControls.value = false;
        }, 3000);
      }
    };
    
    const onEnded = () => {
      isPlaying.value = false;
      stopDanmakuGenerator();
      // 可以添加自动播放下一个的逻辑
    };
    
    const onLoadedMetadata = () => {
      if (videoPlayer.value) {
        duration.value = videoPlayer.value.duration;
        // 设置初始音量
        videoPlayer.value.volume = volume.value;
        // 设置初始播放速度
        videoPlayer.value.playbackRate = playbackSpeed.value;
        isLoading.value = false;
      }
    };
    
    const onVolumeChange = () => {
      if (videoPlayer.value) {
        volume.value = videoPlayer.value.volume;
        isMuted.value = videoPlayer.value.muted;
      }
    };
    
    const onError = (event) => {
      console.error('视频播放错误:', event);
      isLoading.value = false;
    };
    
    // 开始模拟弹幕生成
    const startDanmakuGenerator = () => {
      if (danmakuGeneratorTimer) {
        clearInterval(danmakuGeneratorTimer);
      }
      
      danmakuGeneratorTimer = setInterval(() => {
        if (Math.random() > 0.7) { // 30%的概率生成弹幕
          generateMockDanmaku();
        }
      }, 1500);
    };
    
    // 停止模拟弹幕生成
    const stopDanmakuGenerator = () => {
      if (danmakuGeneratorTimer) {
        clearInterval(danmakuGeneratorTimer);
        danmakuGeneratorTimer = null;
      }
    };
    
    // 生成模拟弹幕
    const generateMockDanmaku = () => {
      const mockTexts = [
        '薛之谦太帅了！',
        '这首歌真的好好听',
        'MV拍得太有意境了',
        '永远支持薛之谦！',
        '这个旋律太抓耳了',
        '歌词写得真好',
        '天外来物yyds！',
        '循环播放中...',
        '期待下一首新歌',
        '演唱会一定要去！',
        '歌词太戳心了',
        '这个高音绝了',
        '编曲太好听了',
        '永远快乐薛之谦，我心终有谦谦结',
        '谦友们在哪里！'
      ];
      
      const colors = ['#FFFFFF', '#FF3C57', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0'];
      const positions = ['scroll', 'top', 'bottom'];
      const vipLevels = [0, 1, 2];
      
      const newDanmaku = {
        id: danmakuIdCounter.value++,
        text: mockTexts[Math.floor(Math.random() * mockTexts.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        position: positions[Math.floor(Math.random() * positions.length)],
        fontSize: 14 + Math.random() * 4, // 14-18px
        bold: Math.random() > 0.7,
        opacity: 0.8 + Math.random() * 0.2, // 0.8-1.0
        duration: 8 + Math.random() * 4, // 8-12秒
        time: currentTime.value,
        vipLevel: Math.random() > 0.5 ? vipLevels[Math.floor(Math.random() * vipLevels.length)] : 0,
        zIndex: 10,
        y: positions.includes('scroll') ? 0 : Math.floor(Math.random() * 80) + 10
      };
      
      activeDanmakus.value.push(newDanmaku);
      
      // 30秒后移除弹幕
      setTimeout(() => {
        activeDanmakus.value = activeDanmakus.value.filter(d => d.id !== newDanmaku.id);
      }, 30000);
    };
    
    // 全屏变化事件
    const handleFullscreenChange = () => {
      isFullScreen.value = !!document.fullscreenElement;
    };
    
    // 视频点击事件
    const handleVideoClick = () => {
      togglePlay();
      showControls.value = true;
      if (controlsTimer) clearTimeout(controlsTimer);
    };
    
    // 控制层点击事件
    const handleControlsClick = (event) => {
      event.stopPropagation();
      showControls.value = true;
      if (controlsTimer) clearTimeout(controlsTimer);
    };
    
    // 键盘事件
    const handleKeydown = (event) => {
      // 空格控制播放/暂停
      if (event.code === 'Space' && event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA') {
        event.preventDefault();
        togglePlay();
      }
      
      // 左右箭头控制快进快退
      if (event.code === 'ArrowRight' && videoPlayer.value) {
        event.preventDefault();
        videoPlayer.value.currentTime = Math.min(currentTime.value + 10, duration.value);
      }
      if (event.code === 'ArrowLeft' && videoPlayer.value) {
        event.preventDefault();
        videoPlayer.value.currentTime = Math.max(currentTime.value - 10, 0);
      }
      
      // 上下箭头控制音量
      if (event.code === 'ArrowUp' && videoPlayer.value) {
        event.preventDefault();
        videoPlayer.value.volume = Math.min(videoPlayer.value.volume + 0.1, 1);
        volume.value = videoPlayer.value.volume;
        isMuted.value = false;
      }
      if (event.code === 'ArrowDown' && videoPlayer.value) {
        event.preventDefault();
        videoPlayer.value.volume = Math.max(videoPlayer.value.volume - 0.1, 0);
        volume.value = videoPlayer.value.volume;
      }
      
      // F键全屏
      if (event.code === 'KeyF') {
        event.preventDefault();
        toggleFullScreen();
      }
      
      // M键静音
      if (event.code === 'KeyM') {
        event.preventDefault();
        toggleMute();
      }
    };
    
    // 鼠标移动事件
    const handleMouseMove = () => {
      if (isPlaying.value && !showControls.value) {
        showControls.value = true;
        if (controlsTimer) clearTimeout(controlsTimer);
        controlsTimer = setTimeout(() => {
          showControls.value = false;
        }, 3000);
      }
    };
    
    // 组件挂载时
    onMounted(() => {
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('keydown', handleKeydown);
      
      // 获取视频元素并绑定事件
      nextTick(() => {
        if (videoPlayer.value) {
          const video = videoPlayer.value;
          video.addEventListener('click', handleVideoClick);
          
          const videoWrapper = document.querySelector('.video-wrapper');
          if (videoWrapper) {
            videoWrapper.addEventListener('mousemove', handleMouseMove);
          }
          
          const customControls = document.querySelector('.custom-controls');
          if (customControls) {
            customControls.addEventListener('click', handleControlsClick);
          }
          
          // 预加载
          isLoading.value = true;
          video.load();
        }
      });
    });
    
    // 组件卸载时
    onUnmounted(() => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeydown);
      
      if (controlsTimer) {
        clearTimeout(controlsTimer);
      }
      
      if (danmakuGeneratorTimer) {
        clearInterval(danmakuGeneratorTimer);
      }
      
      // 移除视频事件监听器
      if (videoPlayer.value) {
        const video = videoPlayer.value;
        video.removeEventListener('click', handleVideoClick);
      }
      
      const videoWrapper = document.querySelector('.video-wrapper');
      if (videoWrapper) {
        videoWrapper.removeEventListener('mousemove', handleMouseMove);
      }
      
      const customControls = document.querySelector('.custom-controls');
      if (customControls) {
        customControls.removeEventListener('click', handleControlsClick);
      }
      
      // 退出全屏
      if (document.fullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    });
    
    return {
      videoPlayer,
      danmakuContainer,
      isPlaying,
      isMuted,
      volume,
      currentTime,
      duration,
      progress,
      bufferProgress,
      playbackSpeed,
      isFullScreen,
      showControls,
      isLoading,
      showDanmaku,
      danmakuText,
      danmakuColor,
      danmakuPosition,
      activeDanmakus,
      currentMV,
      relatedMVs,
      formatTime,
      formatNumber,
      togglePlay,
      toggleMute,
      setVolume,
      seek,
      setPlaybackSpeed,
      toggleFullScreen,
      toggleDanmaku,
      sendDanmaku,
      playMV
    };
  }
};
</script>

<style scoped>
.mv-player-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* 视频播放器容器 */
.video-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: var(--background-dark);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

/* 弹幕容器 */
.danmaku-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 5;
}

.danmaku {
  position: absolute;
  white-space: nowrap;
  word-break: keep-all;
  user-select: none;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.8);
}

.danmaku-scroll {
  right: -100%;
  animation-name: scrollDanmaku;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

.danmaku-top,
.danmaku-bottom {
  left: 50%;
  transform: translateX(-50%);
  animation-name: fadeDanmaku;
  animation-timing-function: ease-in-out;
  animation-fill-mode: forwards;
}

@keyframes scrollDanmaku {
  0% {
    transform: translateX(0);
    right: -100%;
  }
  100% {
    transform: translateX(-100%);
    right: 100%;
  }
}

@keyframes fadeDanmaku {
  0%, 100% {
    opacity: 0;
  }
  10%, 90% {
    opacity: 1;
  }
}

/* VIP徽章 */
.vip-badge {
  display: inline-block;
  padding: 0 0.25rem;
  margin-right: 0.25rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: bold;
  line-height: 1.2;
  vertical-align: middle;
}

.vip-badge-1 {
  background: var(--vip-standard-color);
  color: white;
}

.vip-badge-2 {
  background: var(--vip-premium-color);
  color: white;
}

/* 视频元素 */
.video-wrapper video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* 自定义控制层 */
.custom-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 100%);
  padding: 1rem;
  transition: opacity var(--transition-speed) ease;
  z-index: 10;
}

.progress-container {
  margin-bottom: 1rem;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.progress-buffer {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: rgba(255, 255, 255, 0.5);
  transition: width 0.1s ease;
}

.progress-filled {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: var(--primary-color);
  transition: width 0.1s ease;
}

.controls-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.controls-left,
.controls-center,
.controls-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.control-btn {
  background: transparent;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color var(--transition-speed) ease;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.control-btn.active {
  color: var(--primary-color);
}

.volume-slider {
  width: 100px;
}

.volume-slider input[type="range"] {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  outline: none;
  -webkit-appearance: none;
}

.volume-slider input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
}

.time-display {
  color: white;
  font-size: 0.9rem;
}

.speed-select {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
}

.speed-select option {
  background: var(--background-dark);
  color: white;
}

/* 加载动画 */
.loading-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: white;
  z-index: 15;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* MV信息 */
.mv-info {
  background: var(--background-secondary);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.mv-info h2 {
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.mv-info h2::after {
  background: var(--primary-color);
}

.mv-artist {
  color: var(--primary-color);
  font-weight: 600;
  margin-bottom: 1rem;
}

.mv-description {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.mv-stats {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* 弹幕发送区域 */
.danmaku-input-area {
  background: var(--background-secondary);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.danmaku-input-wrapper {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.danmaku-input {
  flex: 1;
  min-width: 300px;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 24px;
  background: var(--background-primary);
  color: var(--text-primary);
  font-size: 1rem;
  transition: border-color var(--transition-speed) ease;
}

.danmaku-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.danmaku-settings {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.danmaku-position-select {
  padding: 0.5rem;
  border: 2px solid var(--border-color);
  border-radius: 20px;
  background: var(--background-primary);
  color: var(--text-primary);
  cursor: pointer;
  font-size: 0.9rem;
}

.danmaku-color-picker {
  width: 40px;
  height: 40px;
  border: 2px solid var(--border-color);
  border-radius: 50%;
  cursor: pointer;
  background: transparent;
  padding: 0;
}

.danmaku-send-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 24px;
  font-size: 1rem;
  font-weight: 600;
  white-space: nowrap;
}

.danmaku-tips {
  display: flex;
  gap: 2rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
  flex-wrap: wrap;
}

/* 相关MV推荐 */
.related-mvs {
  margin-top: 1rem;
}

.related-mvs h3 {
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.mvs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.mv-item {
  cursor: pointer;
  transition: transform var(--transition-speed) ease, box-shadow var(--transition-speed) ease;
  border-radius: 8px;
  overflow: hidden;
  background: var(--background-secondary);
}

.mv-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.mv-thumbnail {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.mv-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-speed) ease;
}

.mv-item:hover .mv-thumbnail img {
  transform: scale(1.05);
}

.mv-duration {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.mv-item h4 {
  padding: 1rem;
  margin: 0;
  font-size: 1.1rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-primary);
}

.mv-item .mv-stats {
  padding: 0 1rem 1rem 1rem;
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .mv-player-container {
    padding: 1rem;
  }
  
  .controls-bottom {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .controls-left,
  .controls-center,
  .controls-right {
    width: 100%;
    justify-content: space-between;
  }
  
  .volume-slider {
    width: 80px;
  }
  
  .danmaku-input-wrapper {
    flex-direction: column;
    align-items: stretch;
  }
  
  .danmaku-input {
    min-width: auto;
  }
  
  .danmaku-settings {
    justify-content: center;
  }
  
  .danmaku-tips {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .mvs-grid {
    grid-template-columns: 1fr;
  }
  
  .mv-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .controls-left,
  .controls-center,
  .controls-right {
    flex-wrap: wrap;
  }
  
  .control-btn {
    font-size: 1rem;
    padding: 0.35rem;
  }
  
  .volume-slider {
    width: 60px;
  }
  
  .time-display {
    font-size: 0.8rem;
  }
  
  .speed-select {
    font-size: 0.8rem;
    padding: 0.2rem 0.4rem;
  }
  
  .danmaku-position-select {
    font-size: 0.8rem;
    padding: 0.4rem;
  }
  
  .danmaku-color-picker {
    width: 35px;
    height: 35px;
  }
  
  .danmaku-send-btn {
    padding: 0.65rem 1.25rem;
    font-size: 0.9rem;
  }
}
</style>