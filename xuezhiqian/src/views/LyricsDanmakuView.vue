<template>
  <div class="lyrics-danmaku-view">
    <div class="container">
      <h1>歌词弹幕</h1>
      
      <!-- 歌曲选择 -->
      <div class="song-selection">
        <div class="song-list">
          <div 
            v-for="song in songList" 
            :key="song.id"
            :class="['song-item', { active: currentSong.id === song.id }]"
            @click="selectSong(song)"
          >
            <div class="song-info">
              <h3>{{ song.title }}</h3>
              <p>{{ song.album }}</p>
            </div>
            <div class="play-btn">▶</div>
          </div>
        </div>
      </div>

      <!-- 播放器和弹幕区域 -->
      <div class="player-container">
        <div class="song-header">
          <div class="current-song-info">
            <h2>{{ currentSong.title }}</h2>
            <p>{{ currentSong.album }}</p>
          </div>
          <div class="current-song-image">
            <img :src="currentSong.cover" alt="专辑封面" />
          </div>
        </div>

        <!-- 弹幕显示区域 -->
        <div class="danmaku-area">
          <div 
            v-for="danmaku in danmakus" 
            :key="danmaku.id"
            class="danmaku-item"
            :style="{
              top: danmaku.top + 'px',
              left: danmaku.left + '%',
              animationDuration: danmaku.speed + 's',
              fontSize: danmaku.size + 'px',
              color: danmaku.color,
              animationDelay: danmaku.delay + 's',
              opacity: danmaku.opacity
            }"
          >
            {{ danmaku.text }}
          </div>
        </div>

        <!-- 歌词显示 -->
        <div class="lyrics-container">
          <div class="lyrics-wrapper" ref="lyricsWrapper">
            <div 
              v-for="(line, index) in currentSong.lyrics" 
              :key="index"
              :class="['lyrics-line', { active: currentLine === index }]"
              :ref="el => setLyricsRef(el, index)"
              @click="sendLyricsDanmaku(line.text)"
            >
              {{ line.text }}
            </div>
          </div>
        </div>

        <!-- 播放控制 -->
        <div class="player-controls">
          <div class="progress-container">
            <span class="time">{{ formatTime(currentTime) }}</span>
            <div class="progress-bar">
              <div class="progress" :style="{ width: progress + '%' }"></div>
              <div class="progress-handle" :style="{ left: progress + '%' }"></div>
            </div>
            <span class="time">{{ formatTime(currentSong.duration) }}</span>
          </div>
          <div class="controls">
            <button class="control-btn" @click="toggleMute">
              {{ isMuted ? '🔇' : '🔊' }}
            </button>
            <button class="control-btn prev-btn" @click="playPrevious">
              ⏮️
            </button>
            <button class="control-btn play-btn" @click="togglePlay">
              {{ isPlaying ? '⏸️' : '▶️' }}
            </button>
            <button class="control-btn next-btn" @click="playNext">
              ⏭️
            </button>
            <button class="control-btn" @click="toggleRepeat">
              {{ repeatMode === 'none' ? '🔁' : repeatMode === 'one' ? '🔂' : '🔁' }}
            </button>
          </div>
          <div class="volume-container">
            <input 
              type="range" 
              v-model.number="volume" 
              min="0" 
              max="1" 
              step="0.1"
              class="volume-slider"
            />
          </div>
        </div>

        <!-- 弹幕发送 -->
        <div class="danmaku-input-area">
          <div class="danmaku-settings">
            <div class="setting-group">
              <span class="setting-label">颜色：</span>
              <div class="color-options">
                <button 
                  v-for="color in colorOptions" 
                  :key="color"
                  class="color-btn"
                  :class="{ active: selectedColor === color }"
                  :style="{ backgroundColor: color }"
                  @click="selectedColor = color"
                ></button>
              </div>
            </div>
            <div class="setting-group">
              <span class="setting-label">大小：</span>
              <select v-model.number="selectedSize" class="size-select">
                <option :value="14">小</option>
                <option :value="18" selected>中</option>
                <option :value="24">大</option>
              </select>
            </div>
            <div class="setting-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="danmakuTop" />
                <span>顶部弹幕</span>
              </label>
            </div>
          </div>
          <div class="input-group">
            <input 
              type="text" 
              v-model="danmakuText" 
              placeholder="发送弹幕..."
              class="danmaku-input"
              maxlength="50"
              @keyup.enter="sendDanmaku"
            />
            <button 
              class="btn send-btn" 
              @click="sendDanmaku"
              :disabled="!danmakuText.trim()"
            >
              发送
            </button>
          </div>
        </div>

        <!-- 隐藏的音频元素 -->
        <audio 
          ref="audioPlayer" 
          :src="currentSong.audioUrl"
          @timeupdate="handleTimeUpdate"
          @ended="handleEnded"
          @loadedmetadata="handleLoadedMetadata"
          :volume="volume"
        ></audio>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useUserStore } from '../store/index.js';

export default {
  name: 'LyricsDanmakuView',
  setup() {
    const userStore = useUserStore();
    const audioPlayer = ref(null);
    const lyricsWrapper = ref(null);
    const lyricsRefs = ref([]);
    
    // 播放状态
    const isPlaying = ref(false);
    const isMuted = ref(false);
    const volume = ref(0.7);
    const currentTime = ref(0);
    const progress = ref(0);
    const currentLine = ref(-1);
    const repeatMode = ref('none'); // 'none', 'all', 'one'
    
    // 弹幕相关
    const danmakus = ref([]);
    const danmakuText = ref('');
    const selectedColor = ref('#ffffff');
    const selectedSize = ref(18);
    const danmakuTop = ref(false);
    const danmakuTracks = ref(6); // 弹幕轨道数量
    
    // 弹幕颜色选项
    const colorOptions = [
      '#ffffff', '#ff0000', '#00ff00', '#0000ff',
      '#ffff00', '#ff00ff', '#00ffff', '#ffa500'
    ];
    
    // 歌曲列表
    const songList = ref([
      {
        id: 1,
        title: '演员',
        album: '绅士',
        cover: 'https://picsum.photos/300/300?random=201',
        audioUrl: '', // 实际项目中替换为真实音频URL
        duration: 280,
        lyrics: [
          { time: 0, text: '《演员》 - 薛之谦' },
          { time: 30, text: '简单点 说话的方式简单点' },
          { time: 35, text: '递进的情绪请省略' },
          { time: 40, text: '你又不是个演员' },
          { time: 43, text: '别设计那些情节' },
          { time: 50, text: '没意见 我只想看看你怎么圆' },
          { time: 55, text: '你难过的太表面 像没天赋的演员' },
          { time: 60, text: '观众一眼能看见' },
          { time: 70, text: '该配合你演出的我演视而不见' },
          { time: 75, text: '在逼一个最爱你的人即兴表演' },
          { time: 80, text: '什么时候我们开始收起了底线' },
          { time: 85, text: '顺应时代的改变看那些拙劣的表演' },
          { time: 90, text: '可你曾经那么爱我干嘛演出细节' },
          { time: 95, text: '我该变成什么样子才能延缓厌倦' },
          { time: 100, text: '原来当爱放下防备后的这些那些' },
          { time: 105, text: '才是考验' }
        ]
      },
      {
        id: 2,
        title: '认真的雪',
        album: '薛之谦',
        cover: 'https://picsum.photos/300/300?random=202',
        audioUrl: '', // 实际项目中替换为真实音频URL
        duration: 315,
        lyrics: [
          { time: 0, text: '《认真的雪》 - 薛之谦' },
          { time: 30, text: '雪下得那么深 下得那么认真' },
          { time: 35, text: '倒映出我躺在雪中的伤痕' },
          { time: 40, text: '夜深人静 那是爱情' },
          { time: 45, text: '偷偷的控制着我的心' },
          { time: 50, text: '提醒我爱你要随时待命' },
          { time: 60, text: '雪下得那么深 下得那么认真' },
          { time: 65, text: '倒映出我躺在雪中的伤痕' },
          { time: 70, text: '我并不在乎自己究竟多伤痕累累' },
          { time: 75, text: '可我在乎今后你有谁陪' }
        ]
      },
      {
        id: 3,
        title: '刚刚好',
        album: '初学者',
        cover: 'https://picsum.photos/300/300?random=203',
        audioUrl: '', // 实际项目中替换为真实音频URL
        duration: 285,
        lyrics: [
          { time: 0, text: '《刚刚好》 - 薛之谦' },
          { time: 30, text: '如果有人在灯塔' },
          { time: 35, text: '拨弄她的头发' },
          { time: 40, text: '思念刻在墙和瓦' },
          { time: 45, text: '如果感情会长大' },
          { time: 50, text: '没有说的儒雅' },
          { time: 55, text: '把挽回的手放下' },
          { time: 60, text: '镜子里的人说假话' },
          { time: 65, text: '违心的样子你决定了吗' },
          { time: 70, text: '装聋或者作哑 要不我先说话' },
          { time: 75, text: '我们的爱情 到这刚刚好' }
        ]
      }
    ]);
    
    // 当前播放的歌曲
    const currentSong = ref(songList.value[0]);
    
    // 模拟音频播放的定时器
    let playTimer = null;
    let autoDanmakuTimer = null;
    
    // 方法
    const setLyricsRef = (el, index) => {
      if (el) {
        lyricsRefs.value[index] = el;
      }
    };
    
    const selectSong = (song) => {
      currentSong.value = song;
      currentTime.value = 0;
      progress.value = 0;
      currentLine.value = -1;
      
      // 重置播放器
      if (audioPlayer.value) {
        audioPlayer.value.pause();
        audioPlayer.value.currentTime = 0;
        // 在实际项目中，这里会设置新的src并加载
        // audioPlayer.value.src = song.audioUrl;
        // audioPlayer.value.load();
      }
      
      // 清除现有弹幕
      danmakus.value = [];
      
      // 开始播放
      startPlaySimulation();
    };
    
    const togglePlay = () => {
      if (isPlaying.value) {
        pausePlaySimulation();
      } else {
        startPlaySimulation();
      }
    };
    
    const startPlaySimulation = () => {
      isPlaying.value = true;
      
      // 清除现有定时器
      if (playTimer) {
        clearInterval(playTimer);
      }
      
      // 模拟播放进度
      playTimer = setInterval(() => {
        currentTime.value += 0.5;
        if (currentTime.value >= currentSong.value.duration) {
          handleEnded();
        }
        updateProgress();
        updateCurrentLine();
      }, 500);
      
      // 自动发送模拟弹幕
      startAutoDanmakus();
    };
    
    const pausePlaySimulation = () => {
      isPlaying.value = false;
      if (playTimer) {
        clearInterval(playTimer);
        playTimer = null;
      }
      if (autoDanmakuTimer) {
        clearInterval(autoDanmakuTimer);
        autoDanmakuTimer = null;
      }
    };
    
    const startAutoDanmakus = () => {
      // 清除现有定时器
      if (autoDanmakuTimer) {
        clearInterval(autoDanmakuTimer);
      }
      
      // 每隔一段时间自动发送模拟弹幕
      autoDanmakuTimer = setInterval(() => {
        if (Math.random() > 0.7) { // 30%的概率发送
          const randomLyrics = currentSong.value.lyrics[Math.floor(Math.random() * currentSong.value.lyrics.length)];
          addDanmaku({
            text: randomLyrics.text,
            color: colorOptions[Math.floor(Math.random() * colorOptions.length)],
            size: [14, 18, 24][Math.floor(Math.random() * 3)],
            top: Math.random() > 0.3 // 70%概率是滚动弹幕
          });
        }
      }, 2000);
    };
    
    const updateProgress = () => {
      progress.value = (currentTime.value / currentSong.value.duration) * 100;
    };
    
    const updateCurrentLine = () => {
      const lyrics = currentSong.value.lyrics;
      for (let i = lyrics.length - 1; i >= 0; i--) {
        if (currentTime.value >= lyrics[i].time) {
          if (currentLine.value !== i) {
            currentLine.value = i;
            scrollToCurrentLyrics();
          }
          break;
        }
      }
    };
    
    const scrollToCurrentLyrics = () => {
      nextTick(() => {
        const currentRef = lyricsRefs.value[currentLine.value];
        const wrapper = lyricsWrapper.value;
        if (currentRef && wrapper) {
          const offsetTop = currentRef.offsetTop;
          const wrapperHeight = wrapper.clientHeight;
          const lineHeight = currentRef.offsetHeight;
          
          wrapper.scrollTop = offsetTop - wrapperHeight / 2 + lineHeight / 2;
        }
      });
    };
    
    const playPrevious = () => {
      const currentIndex = songList.value.findIndex(song => song.id === currentSong.value.id);
      const prevIndex = currentIndex === 0 ? songList.value.length - 1 : currentIndex - 1;
      selectSong(songList.value[prevIndex]);
    };
    
    const playNext = () => {
      const currentIndex = songList.value.findIndex(song => song.id === currentSong.value.id);
      const nextIndex = currentIndex === songList.value.length - 1 ? 0 : currentIndex + 1;
      selectSong(songList.value[nextIndex]);
    };
    
    const toggleMute = () => {
      isMuted.value = !isMuted.value;
      if (audioPlayer.value) {
        audioPlayer.value.muted = isMuted.value;
      }
    };
    
    const toggleRepeat = () => {
      if (repeatMode.value === 'none') {
        repeatMode.value = 'all';
      } else if (repeatMode.value === 'all') {
        repeatMode.value = 'one';
      } else {
        repeatMode.value = 'none';
      }
    };
    
    const handleTimeUpdate = () => {
      if (audioPlayer.value) {
        currentTime.value = audioPlayer.value.currentTime;
        updateProgress();
        updateCurrentLine();
      }
    };
    
    const handleEnded = () => {
      pausePlaySimulation();
      
      if (repeatMode.value === 'one') {
        // 单曲循环
        currentTime.value = 0;
        startPlaySimulation();
      } else if (repeatMode.value === 'all' || repeatMode.value === 'none') {
        // 播放下一首
        playNext();
      }
    };
    
    const handleLoadedMetadata = () => {
      if (audioPlayer.value && audioPlayer.value.duration) {
        currentSong.value.duration = audioPlayer.value.duration;
      }
    };
    
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    
    const addDanmaku = (options) => {
      const trackHeight = 40; // 每个轨道的高度
      const trackIndex = Math.floor(Math.random() * danmakuTracks.value);
      
      const danmaku = {
        id: Date.now() + Math.random(),
        text: options.text,
        top: trackIndex * trackHeight,
        left: 100,
        speed: 8 + Math.random() * 7, // 弹幕速度
        color: options.color,
        size: options.size,
        delay: 0,
        opacity: 0.9
      };
      
      danmakus.value.push(danmaku);
      
      // 弹幕动画结束后移除
      setTimeout(() => {
        const index = danmakus.value.findIndex(d => d.id === danmaku.id);
        if (index > -1) {
          danmakus.value.splice(index, 1);
        }
      }, (danmaku.speed + danmaku.delay) * 1000);
    };
    
    const sendDanmaku = () => {
      if (!danmakuText.value.trim()) return;
      
      addDanmaku({
        text: danmakuText.value.trim(),
        color: selectedColor.value,
        size: selectedSize.value,
        top: danmakuTop.value
      });
      
      danmakuText.value = '';
      
      // 发送弹幕获得经验值和谦币
      userStore.addExperience(2);
      userStore.addQianbi(3);
    };
    
    const sendLyricsDanmaku = (text) => {
      addDanmaku({
        text: text,
        color: selectedColor.value,
        size: selectedSize.value,
        top: danmakuTop.value
      });
      
      // 发送歌词弹幕获得经验值和谦币
      userStore.addExperience(2);
      userStore.addQianbi(3);
    };
    
    // 清理定时器
    onUnmounted(() => {
      if (playTimer) {
        clearInterval(playTimer);
      }
      if (autoDanmakuTimer) {
        clearInterval(autoDanmakuTimer);
      }
    });
    
    // 组件挂载时自动播放第一首歌
    onMounted(() => {
      // 延迟开始播放，确保DOM已加载
      setTimeout(() => {
        startPlaySimulation();
      }, 1000);
    });
    
    return {
      songList,
      currentSong,
      isPlaying,
      isMuted,
      volume,
      currentTime,
      progress,
      currentLine,
      repeatMode,
      danmakus,
      danmakuText,
      selectedColor,
      selectedSize,
      danmakuTop,
      colorOptions,
      audioPlayer,
      lyricsWrapper,
      selectSong,
      togglePlay,
      playPrevious,
      playNext,
      toggleMute,
      toggleRepeat,
      formatTime,
      sendDanmaku,
      sendLyricsDanmaku,
      setLyricsRef
    };
  }
};
</script>

<style scoped>
.lyrics-danmaku-view {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.lyrics-danmaku-view h1 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.5rem;
  color: #333;
}

/* 歌曲选择 */
.song-selection {
  margin-bottom: 2rem;
}

.song-list {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.song-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.3s;
}

.song-item:last-child {
  border-bottom: none;
}

.song-item:hover {
  background-color: #f5f5f5;
}

.song-item.active {
  background-color: #1890ff;
  color: white;
}

.song-info h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
}

.song-info p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.8;
}

.song-item .play-btn {
  font-size: 1.2rem;
  opacity: 0;
  transition: opacity 0.3s;
}

.song-item:hover .play-btn {
  opacity: 1;
}

.song-item.active .play-btn {
  opacity: 1;
}

/* 播放器容器 */
.player-container {
  background-color: #2c3e50;
  color: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* 歌曲头部信息 */
.song-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.current-song-info h2 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
}

.current-song-info p {
  margin: 0;
  opacity: 0.8;
}

.current-song-image img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* 弹幕区域 */
.danmaku-area {
  position: relative;
  height: 240px;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 2rem;
}

.danmaku-item {
  position: absolute;
  white-space: nowrap;
  transform: translateX(100%);
  animation: danmaku-move linear infinite;
  pointer-events: none;
  will-change: transform;
}

@keyframes danmaku-move {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  5% {
    opacity: 0.9;
  }
  95% {
    opacity: 0.9;
  }
  to {
    transform: translateX(-100%);
    opacity: 0;
  }
}

/* 歌词区域 */
.lyrics-container {
  height: 200px;
  overflow: hidden;
  margin-bottom: 2rem;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 1rem;
}

.lyrics-wrapper {
  height: 100%;
  overflow-y: auto;
  text-align: center;
  transition: transform 0.3s;
}

.lyrics-wrapper::-webkit-scrollbar {
  display: none;
}

.lyrics-line {
  padding: 0.5rem 0;
  font-size: 1.1rem;
  opacity: 0.6;
  transition: all 0.3s;
  cursor: pointer;
}

.lyrics-line:hover {
  opacity: 0.8;
}

.lyrics-line.active {
  opacity: 1;
  color: #1890ff;
  font-size: 1.3rem;
  font-weight: 500;
}

/* 播放控制 */
.player-controls {
  margin-bottom: 2rem;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.time {
  font-size: 0.9rem;
  min-width: 45px;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  position: relative;
  cursor: pointer;
}

.progress {
  height: 100%;
  background-color: #1890ff;
  border-radius: 2px;
}

.progress-handle {
  position: absolute;
  width: 12px;
  height: 12px;
  background-color: #1890ff;
  border-radius: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  transition: transform 0.2s;
}

.progress-handle:hover {
  transform: translate(-50%, -50%) scale(1.2);
}

.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1rem;
}

.control-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.5rem;
  transition: transform 0.2s;
}

.control-btn:hover {
  transform: scale(1.1);
}

.control-btn.play-btn {
  font-size: 2.5rem;
}

.volume-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.volume-slider {
  width: 120px;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  outline: none;
  -webkit-appearance: none;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  background-color: #1890ff;
  border-radius: 50%;
  cursor: pointer;
}

/* 弹幕输入区域 */
.danmaku-input-area {
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 1.5rem;
}

.danmaku-settings {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.setting-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.setting-label {
  font-size: 0.9rem;
}

.color-options {
  display: flex;
  gap: 0.5rem;
}

.color-btn {
  width: 24px;
  height: 24px;
  border: 2px solid transparent;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s;
}

.color-btn:hover {
  transform: scale(1.1);
}

.color-btn.active {
  border-color: #1890ff;
  transform: scale(1.1);
}

.size-select {
  padding: 0.25rem 0.5rem;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: white;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
}

.checkbox-label input {
  cursor: pointer;
}

.input-group {
  display: flex;
  gap: 1rem;
}

.danmaku-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
}

.send-btn {
  padding: 0.75rem 2rem;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.send-btn:hover:not(:disabled) {
  background-color: #40a9ff;
}

.send-btn:disabled {
  background-color: #d9d9d9;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .song-header {
    flex-direction: column;
    text-align: center;
  }
  
  .danmaku-area {
    height: 180px;
  }
  
  .lyrics-container {
    height: 150px;
  }
  
  .controls {
    gap: 1.5rem;
  }
  
  .danmaku-settings {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .input-group {
    flex-direction: column;
  }
  
  .send-btn {
    width: 100%;
  }
}
</style>