<template>
  <div class="audio-player-container card">
    <!-- 播放器头部 -->
    <div class="player-header">
      <h3>🎵 应援音频播放器 🎵</h3>
      <div class="playlist-toggle">
        <button 
          class="btn btn-secondary"
          @click="togglePlaylist"
          :class="{ 'active': showPlaylist }"
        >
          {{ showPlaylist ? '隐藏' : '显示' }}播放列表
        </button>
      </div>
    </div>
    
    <!-- 播放列表 -->
    <div v-if="showPlaylist" class="playlist-panel">
      <div class="playlist-header">
        <span class="playlist-title">播放列表 ({{ audioList.length }})</span>
        <div class="playlist-controls">
          <button class="btn btn-secondary btn-sm shuffle-btn" @click="shufflePlaylist">
            🔀 随机播放
          </button>
          <button class="btn btn-secondary btn-sm clear-btn" @click="clearQueue">
            🗑️ 清空队列
          </button>
        </div>
      </div>
      
      <div class="playlist-content">
        <div v-if="audioList.length === 0" class="empty-playlist">
          播放列表为空
        </div>
        
        <div v-else class="playlist-items">
          <div 
            v-for="(audio, index) in audioList"
            :key="audio.id"
            class="playlist-item"
            :class="{
              'active': currentAudio && currentAudio.id === audio.id,
              'playing': currentAudio && currentAudio.id === audio.id && isPlaying
            }"
            @click="playAudio(audio, index)"
          >
            <div class="playlist-item-info">
              <div class="playlist-item-number">
                {{ currentAudio && currentAudio.id === audio.id && isPlaying ? '▶' : index + 1 }}
              </div>
              <div class="playlist-item-details">
                <div class="playlist-item-title">{{ audio.title }}</div>
                <div class="playlist-item-artist">{{ audio.artist }}</div>
              </div>
            </div>
            <div class="playlist-item-actions">
              <button 
                class="btn btn-icon remove-btn"
                @click.stop="removeFromPlaylist(index)"
                title="从播放列表移除"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 播放器主体 -->
    <div class="player-main">
      <!-- 当前播放信息 -->
      <div v-if="currentAudio" class="current-playback">
        <div class="playback-cover">
          <img :src="currentAudio.coverUrl" :alt="currentAudio.title" class="cover-image">
          <div class="cover-overlay" :class="{ 'playing': isPlaying }">
            <div class="vinyl-record">
              <div class="vinyl-center"></div>
            </div>
          </div>
        </div>
        
        <!-- 音乐波形动画 -->
        <div class="audio-waveform">
          <canvas ref="waveformCanvas" class="waveform-canvas"></canvas>
        </div>
        
        <div class="playback-info">
          <div class="song-title">{{ currentAudio.title }}</div>
          <div class="song-artist">{{ currentAudio.artist }}</div>
          <div class="song-album">{{ currentAudio.album }}</div>
        </div>
      </div>
      
      <div v-else class="no-audio-selected">
        <div class="placeholder-icon">🎵</div>
        <div class="placeholder-text">请从播放列表中选择一首歌曲</div>
      </div>
      
      <!-- 播放控制 -->
      <div class="playback-controls">
        <button 
          class="btn btn-icon repeat-btn"
          @click="toggleRepeatMode"
          :title="getRepeatModeText()"
          :class="`repeat-${repeatMode}`"
        >
          {{ getRepeatModeIcon() }}
        </button>
        
        <button 
          class="btn btn-icon prev-btn"
          @click="playPrevious"
          :disabled="!hasPrevious"
          title="上一首"
        >
          ⏮️
        </button>
        
        <button 
          class="btn btn-primary play-btn"
          @click="togglePlayPause"
          :disabled="!currentAudio"
          :title="isPlaying ? '暂停' : '播放'"
        >
          {{ isPlaying ? '⏸️' : '▶️' }}
        </button>
        
        <button 
          class="btn btn-icon next-btn"
          @click="playNext"
          :disabled="!hasNext"
          title="下一首"
        >
          ⏭️
        </button>
        
        <button 
          class="btn btn-icon shuffle-btn"
          @click="toggleShuffle"
          :title="isShuffling ? '取消随机播放' : '随机播放'"
          :class="{ 'active': isShuffling }"
        >
          🔀
        </button>
      </div>
      
      <!-- 进度条和时间 -->
      <div class="progress-container">
        <div class="time-info">
          <span class="current-time">{{ formatTime(currentTime) }}</span>
          <span class="total-time">{{ formatTime(duration) }}</span>
        </div>
        
        <div class="progress-bar-wrapper">
          <div 
            class="progress-bar"
            @click="seek"
          >
            <div 
              class="progress-filled"
              :style="{ width: progressPercent + '%' }"
            ></div>
            <div 
              class="progress-thumb"
              :style="{ left: progressPercent + '%' }"
              @mousedown="startDragging"
              ref="progressThumb"
            ></div>
          </div>
        </div>
      </div>
      
      <!-- 音量控制 -->
      <div class="volume-controls">
        <button 
          class="btn btn-icon volume-icon"
          @click="toggleMute"
          :title="isMuted ? '取消静音' : '静音'"
        >
          {{ getVolumeIcon() }}
        </button>
        
        <div class="volume-bar-wrapper">
          <div 
            class="volume-bar"
            @click="setVolume"
          >
            <div 
              class="volume-filled"
              :style="{ width: (isMuted ? 0 : volume) + '%' }"
            ></div>
            <div 
              class="volume-thumb"
              :style="{ left: (isMuted ? 0 : volume) + '%' }"
              @mousedown="startVolumeDragging"
              ref="volumeThumb"
            ></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 歌词显示区域 -->
    <div v-if="currentAudio && currentAudio.lyrics && currentAudio.lyrics.length > 0" class="lyrics-container">
      <div class="lyrics-header">
        <h4>🎤 歌词</h4>
        <div class="lyrics-mode">
          <button 
            class="btn btn-secondary btn-sm"
            @click="toggleLyricsMode"
            :class="{ 'active': lyricsMode === 'full' }"
          >
            {{ lyricsMode === 'full' ? '收起歌词' : '展开歌词' }}
          </button>
        </div>
      </div>
      
      <div 
        class="lyrics-content"
        :class="`lyrics-${lyricsMode}`"
        ref="lyricsContainer"
      >
        <div 
          v-for="(line, index) in currentAudio.lyrics"
          :key="index"
          class="lyrics-line"
          :class="{ 'active': isActiveLyric(index) }"
        >
          {{ line.text }}
        </div>
      </div>
    </div>
    
    <!-- 隐藏的音频元素 -->
    <audio 
      ref="audioElement"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
      @ended="onAudioEnded"
      @error="onAudioError"
      :src="currentAudio ? currentAudio.audioUrl : ''"
      :volume="volume / 100"
      :muted="isMuted"
    ></audio>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';

export default {
  name: 'AudioPlayer',
  setup() {
    // 播放列表数据
    const audioList = ref([
      {
        id: 1,
        title: '演员',
        artist: '薛之谦',
        album: '绅士',
        coverUrl: 'https://picsum.photos/id/1011/400/400',
        audioUrl: 'https://example.com/actor.mp3', // 示例URL，实际项目中替换为真实URL
        duration: 280,
        lyrics: [
          { time: 0, text: '演员 - 薛之谦' },
          { time: 20, text: '简单点 说话的方式简单点' },
          { time: 25, text: '递进的情绪请省略' },
          { time: 30, text: '你又不是个演员' },
          { time: 35, text: '别设计那些情节' },
          { time: 40, text: '没意见 我只想看看你怎么圆' },
          { time: 45, text: '你难过的太表面 像没天赋的演员' },
          { time: 50, text: '观众一眼能看见' },
          { time: 60, text: '该配合你演出的我演视而不见' },
          { time: 65, text: '在逼一个最爱你的人即兴表演' },
          { time: 70, text: '什么时候我们开始收起了底线' },
          { time: 75, text: '顺应时代的改变看那些拙劣的表演' },
          { time: 85, text: '可你曾经那么爱我干嘛演出细节' },
          { time: 90, text: '我该变成什么样子才能延缓厌倦' },
          { time: 95, text: '原来当爱放下防备后的这些那些' },
          { time: 100, text: '才是考验' }
        ],
        isInstrumental: false
      },
      {
        id: 2,
        title: '丑八怪',
        artist: '薛之谦',
        album: '意外',
        coverUrl: 'https://picsum.photos/id/1012/400/400',
        audioUrl: 'https://example.com/ugly.mp3', // 示例URL，实际项目中替换为真实URL
        duration: 290,
        lyrics: [
          { time: 0, text: '丑八怪 - 薛之谦' },
          { time: 25, text: '如果世界漆黑 其实我很美' },
          { time: 30, text: '在爱情里面进退 最多被消费' },
          { time: 35, text: '无关痛痒的是非 又怎么不对 无所谓' },
          { time: 45, text: '如果像你一样 总有人赞美' },
          { time: 50, text: '围绕着我的卑微 也许能消退' },
          { time: 55, text: '其实我并不在意 有很多机会' },
          { time: 60, text: '像巨人一样的无畏' },
          { time: 70, text: '放纵我心里的鬼' },
          { time: 75, text: '可是我不配' },
          { time: 80, text: '丑八怪 在这暧昧的时代' },
          { time: 85, text: '我的存在 像意外' },
          { time: 90, text: '有人用一滴泪 会红颜祸水' },
          { time: 95, text: '有人丢掉称谓 什么也不会' },
          { time: 100, text: '只要你足够虚伪 就不怕魔鬼 对不对' }
        ],
        isInstrumental: false
      },
      {
        id: 3,
        title: '刚刚好',
        artist: '薛之谦',
        album: '初学者',
        coverUrl: 'https://picsum.photos/id/1013/400/400',
        audioUrl: 'https://example.com/justright.mp3', // 示例URL，实际项目中替换为真实URL
        duration: 275,
        lyrics: [
          { time: 0, text: '刚刚好 - 薛之谦' },
          { time: 20, text: '如果有人在灯塔' },
          { time: 25, text: '拨弄她的头发' },
          { time: 30, text: '思念刻在墙和瓦' },
          { time: 35, text: '如果感情会长大' },
          { time: 40, text: '没有说的儒雅' },
          { time: 45, text: '把挽回的手放下' },
          { time: 55, text: '镜子里的人说假话' },
          { time: 60, text: '违心的样子你决定了吗' },
          { time: 65, text: '装聋或者作哑 要不我先说话' },
          { time: 75, text: '我们的爱情到这刚刚好' },
          { time: 80, text: '剩不多也不少还能忘掉' },
          { time: 85, text: '我应该可以把自己照顾好' },
          { time: 90, text: '我们的距离到这刚刚好' },
          { time: 95, text: '不够我们拥抱 就挽回不了' }
        ],
        isInstrumental: false
      },
      {
        id: 4,
        title: '演员 (伴奏)',
        artist: '薛之谦',
        album: '绅士',
        coverUrl: 'https://picsum.photos/id/1014/400/400',
        audioUrl: 'https://example.com/actor_instrumental.mp3', // 示例URL，实际项目中替换为真实URL
        duration: 280,
        lyrics: [],
        isInstrumental: true
      },
      {
        id: 5,
        title: '谦友应援曲',
        artist: '谦友合唱团',
        album: '永远快乐薛之谦',
        coverUrl: 'https://picsum.photos/id/1015/400/400',
        audioUrl: 'https://example.com/fan_song.mp3', // 示例URL，实际项目中替换为真实URL
        duration: 320,
        lyrics: [
          { time: 0, text: '谦友应援曲 - 谦友合唱团' },
          { time: 30, text: '永远快乐薛之谦 我心终有谦谦结' },
          { time: 40, text: '你的歌声陪伴我 走过春秋和冬夏' },
          { time: 50, text: '每首歌里的故事 都是我们的回忆' },
          { time: 60, text: '不管未来多遥远 我们永远在一起' },
          { time: 80, text: '永远快乐薛之谦 我心终有谦谦结' },
          { time: 90, text: '你的笑容温暖我 度过风雨和迷茫' },
          { time: 100, text: '每一次的演唱会 都是我们的约定' },
          { time: 110, text: '不管路途多艰辛 我们永远支持你' }
        ],
        isInstrumental: false
      }
    ]);
    
    // 播放器状态
    const currentAudioIndex = ref(-1);
    const isPlaying = ref(false);
    const currentTime = ref(0);
    const duration = ref(0);
    const volume = ref(80);
    const isMuted = ref(false);
    const repeatMode = ref('none'); // none, one, all
    const isShuffling = ref(false);
    const showPlaylist = ref(false);
    const lyricsMode = ref('compact'); // compact, full
    
    // 随机播放的队列
    const shuffleQueue = ref([]);
    
    // 引用
    const audioElement = ref(null);
    const progressThumb = ref(null);
    const volumeThumb = ref(null);
    const lyricsContainer = ref(null);
    const waveformCanvas = ref(null);
    
    // 音频分析器相关
    const audioContext = ref(null);
    const analyser = ref(null);
    const dataArray = ref(null);
    const animationId = ref(null);
    
    // 拖拽状态
    const isDragging = ref(false);
    const isVolumeDragging = ref(false);
    
    // 计算属性
    const currentAudio = computed(() => {
      return currentAudioIndex.value >= 0 && currentAudioIndex.value < audioList.value.length 
        ? audioList.value[currentAudioIndex.value] 
        : null;
    });
    
    const progressPercent = computed(() => {
      return duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0;
    });
    
    const hasPrevious = computed(() => {
      return currentAudioIndex.value > 0;
    });
    
    const hasNext = computed(() => {
      return currentAudioIndex.value < audioList.value.length - 1;
    });
    
    // 格式化时间
    const formatTime = (seconds) => {
      const minutes = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };
    
    // 获取重复模式文本
    const getRepeatModeText = () => {
      switch (repeatMode.value) {
        case 'none': return '不重复';
        case 'one': return '单曲循环';
        case 'all': return '列表循环';
        default: return '不重复';
      }
    };
    
    // 获取重复模式图标
    const getRepeatModeIcon = () => {
      switch (repeatMode.value) {
        case 'none': return '🔁';
        case 'one': return '🔂';
        case 'all': return '🔄';
        default: return '🔁';
      }
    };
    
    // 获取音量图标
    const getVolumeIcon = () => {
      if (isMuted.value || volume.value === 0) return '🔇';
      if (volume.value < 30) return '🔈';
      if (volume.value < 70) return '🔉';
      return '🔊';
    };
    
    // 切换重复模式
    const toggleRepeatMode = () => {
      switch (repeatMode.value) {
        case 'none':
          repeatMode.value = 'one';
          break;
        case 'one':
          repeatMode.value = 'all';
          break;
        case 'all':
          repeatMode.value = 'none';
          break;
      }
    };
    
    // 切换随机播放
    const toggleShuffle = () => {
      isShuffling.value = !isShuffling.value;
      
      if (isShuffling.value) {
        // 创建随机播放队列
        shuffleQueue.value = [...Array(audioList.value.length).keys()];
        // Fisher-Yates 洗牌算法
        for (let i = shuffleQueue.value.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffleQueue.value[i], shuffleQueue.value[j]] = [shuffleQueue.value[j], shuffleQueue.value[i]];
        }
        
        // 确保当前歌曲在队列首位
        const currentIndex = shuffleQueue.value.indexOf(currentAudioIndex.value);
        if (currentIndex > -1) {
          [shuffleQueue.value[0], shuffleQueue.value[currentIndex]] = [shuffleQueue.value[currentIndex], shuffleQueue.value[0]];
        }
      } else {
        shuffleQueue.value = [];
      }
    };
    
    // 播放音频
    const playAudio = (audio, index = -1) => {
      if (index === -1) {
        index = audioList.value.findIndex(item => item.id === audio.id);
      }
      
      if (index === -1) return;
      
      // 如果点击的是当前播放的歌曲，则切换播放/暂停
      if (index === currentAudioIndex.value) {
        togglePlayPause();
        return;
      }
      
      currentAudioIndex.value = index;
      currentTime.value = 0;
      
      // 重置音频元素
      if (audioElement.value) {
        audioElement.value.load();
        audioElement.value.play().then(() => {
          isPlaying.value = true;
        }).catch(error => {
          console.error('播放失败:', error);
          isPlaying.value = false;
        });
      }
    };
    
    // 切换播放/暂停
    const togglePlayPause = () => {
      if (!audioElement.value || !currentAudio.value) return;
      
      if (isPlaying.value) {
        audioElement.value.pause();
      } else {
        audioElement.value.play().then(() => {
          // 播放成功
        }).catch(error => {
          console.error('播放失败:', error);
        });
      }
      
      isPlaying.value = !isPlaying.value;
    };
    
    // 播放上一首
    const playPrevious = () => {
      if (!hasPrevious.value) return;
      
      if (isShuffling.value && shuffleQueue.value.length > 0) {
        // 随机播放模式下的上一首逻辑
        // 注意：随机播放模式通常没有真正的"上一首"概念，这里简化处理
        const currentIndexInShuffle = shuffleQueue.value.indexOf(currentAudioIndex.value);
        if (currentIndexInShuffle > 0) {
          playAudio(audioList.value[shuffleQueue.value[currentIndexInShuffle - 1]]);
        } else {
          // 如果是随机队列的第一首，则回到列表的上一首
          playAudio(audioList.value[currentAudioIndex.value - 1]);
        }
      } else {
        playAudio(audioList.value[currentAudioIndex.value - 1]);
      }
    };
    
    // 播放下一首
    const playNext = () => {
      if (isShuffling.value && shuffleQueue.value.length > 0) {
        // 随机播放模式
        const currentIndexInShuffle = shuffleQueue.value.indexOf(currentAudioIndex.value);
        if (currentIndexInShuffle < shuffleQueue.value.length - 1) {
          playAudio(audioList.value[shuffleQueue.value[currentIndexInShuffle + 1]]);
        } else {
          // 如果已经是随机队列的最后一首，则重新洗牌
          toggleShuffle();
          toggleShuffle();
          playAudio(audioList.value[shuffleQueue.value[0]]);
        }
      } else {
        // 顺序播放模式
        if (hasNext.value) {
          playAudio(audioList.value[currentAudioIndex.value + 1]);
        } else if (repeatMode.value === 'all') {
          // 列表循环模式下，回到第一首
          playAudio(audioList.value[0]);
        }
      }
    };
    
    // 切换播放列表显示
    const togglePlaylist = () => {
      showPlaylist.value = !showPlaylist.value;
    };
    
    // 切换歌词显示模式
    const toggleLyricsMode = () => {
      lyricsMode.value = lyricsMode.value === 'compact' ? 'full' : 'compact';
    };
    
    // 从播放列表移除
    const removeFromPlaylist = (index) => {
      if (index === currentAudioIndex.value) {
        // 如果移除的是当前播放的歌曲
        const wasPlaying = isPlaying.value;
        
        if (audioList.value.length > 1) {
          // 如果还有其他歌曲，播放下一首或上一首
          if (hasNext.value) {
            playNext();
          } else if (hasPrevious.value) {
            playPrevious();
          }
        } else {
          // 如果是最后一首歌曲，停止播放
          if (audioElement.value) {
            audioElement.value.pause();
          }
          currentAudioIndex.value = -1;
          isPlaying.value = false;
        }
      } else if (index < currentAudioIndex.value) {
        // 如果移除的是当前歌曲之前的歌曲，调整当前索引
        currentAudioIndex.value--;
      }
      
      // 从列表中移除
      audioList.value.splice(index, 1);
      
      // 如果启用了随机播放，更新随机队列
      if (isShuffling.value) {
        shuffleQueue.value = shuffleQueue.value.filter(idx => idx !== index);
        // 调整随机队列中的索引
        shuffleQueue.value = shuffleQueue.value.map(idx => idx > index ? idx - 1 : idx);
      }
    };
    
    // 清空播放列表
    const clearQueue = () => {
      if (confirm('确定要清空播放列表吗？')) {
        audioList.value = [];
        currentAudioIndex.value = -1;
        isPlaying.value = false;
        shuffleQueue.value = [];
      }
    };
    
    // 随机打乱播放列表
    const shufflePlaylist = () => {
      // Fisher-Yates 洗牌算法
      for (let i = audioList.value.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [audioList.value[i], audioList.value[j]] = [audioList.value[j], audioList.value[i]];
      }
      
      // 如果当前有歌曲在播放，找到它在新列表中的位置
      if (currentAudio.value) {
        const newIndex = audioList.value.findIndex(item => item.id === currentAudio.value.id);
        if (newIndex > -1) {
          currentAudioIndex.value = newIndex;
        }
      }
    };
    
    // 切换静音
    const toggleMute = () => {
      isMuted.value = !isMuted.value;
    };
    
    // 设置音量
    const setVolume = (event) => {
      if (!event.target) return;
      
      const rect = event.target.getBoundingClientRect();
      const pos = (event.clientX - rect.left) / rect.width;
      const newVolume = Math.max(0, Math.min(100, pos * 100));
      
      volume.value = newVolume;
      
      // 如果设置了音量，取消静音
      if (newVolume > 0 && isMuted.value) {
        isMuted.value = false;
      }
    };
    
    // 跳转到指定时间
    const seek = (event) => {
      if (!event.target || !duration.value) return;
      
      const rect = event.target.getBoundingClientRect();
      const pos = (event.clientX - rect.left) / rect.width;
      const newTime = pos * duration.value;
      
      currentTime.value = newTime;
      
      if (audioElement.value) {
        audioElement.value.currentTime = newTime;
      }
    };
    
    // 开始拖拽进度条
    const startDragging = (event) => {
      event.preventDefault();
      isDragging.value = true;
      
      // 添加全局事件监听
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };
    
    // 开始拖拽音量条
    const startVolumeDragging = (event) => {
      event.preventDefault();
      isVolumeDragging.value = true;
      
      // 添加全局事件监听
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };
    
    // 鼠标移动（拖拽时）
    const onMouseMove = (event) => {
      if (isDragging.value && progressThumb.value) {
        const rect = progressThumb.value.parentElement.getBoundingClientRect();
        const pos = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        const newTime = pos * duration.value;
        
        currentTime.value = newTime;
        
        // 不直接设置audioElement.currentTime，等待鼠标松开时设置
      }
      
      if (isVolumeDragging.value && volumeThumb.value) {
        const rect = volumeThumb.value.parentElement.getBoundingClientRect();
        const pos = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        const newVolume = pos * 100;
        
        volume.value = newVolume;
        
        // 如果设置了音量，取消静音
        if (newVolume > 0 && isMuted.value) {
          isMuted.value = false;
        }
      }
    };
    
    // 鼠标松开（拖拽结束）
    const onMouseUp = () => {
      if (isDragging.value && audioElement.value) {
        audioElement.value.currentTime = currentTime.value;
        isDragging.value = false;
      }
      
      if (isVolumeDragging.value) {
        isVolumeDragging.value = false;
      }
      
      // 移除全局事件监听
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    
    // 检查是否是当前活跃的歌词行
    const isActiveLyric = (index) => {
      if (!currentAudio.value || !currentAudio.value.lyrics || currentAudio.value.lyrics.length === 0) {
        return false;
      }
      
      const lyrics = currentAudio.value.lyrics;
      
      // 检查当前时间是否在当前行和下一行之间
      if (index === lyrics.length - 1) {
        // 最后一行
        return currentTime.value >= lyrics[index].time;
      } else {
        return currentTime.value >= lyrics[index].time && currentTime.value < lyrics[index + 1].time;
      }
    };
    
    // 滚动歌词到当前行
    const scrollLyricsToActive = () => {
      if (!lyricsContainer.value || !currentAudio.value || !currentAudio.value.lyrics) return;
      
      const activeLine = lyricsContainer.value.querySelector('.lyrics-line.active');
      if (!activeLine) return;
      
      const containerRect = lyricsContainer.value.getBoundingClientRect();
      const lineRect = activeLine.getBoundingClientRect();
      
      // 计算需要滚动的距离，使当前行位于容器中央
      const scrollTop = activeLine.offsetTop - containerRect.height / 2 + lineRect.height / 2;
      
      lyricsContainer.value.scrollTop = scrollTop;
    };
    
    // 音频事件处理
    const onTimeUpdate = () => {
      if (!audioElement.value || isDragging.value) return;
      
      currentTime.value = audioElement.value.currentTime;
      
      // 滚动歌词到当前行
      scrollLyricsToActive();
    };
    
    const onLoadedMetadata = () => {
      if (!audioElement.value) return;
      
      duration.value = audioElement.value.duration;
    };
    
    const onAudioEnded = () => {
      if (repeatMode.value === 'one') {
        // 单曲循环
        if (audioElement.value) {
          audioElement.value.currentTime = 0;
          audioElement.value.play();
        }
      } else {
        // 播放下一首
        playNext();
      }
    };
    
    const onAudioError = (event) => {
      console.error('音频播放错误:', event);
      isPlaying.value = false;
      // 这里可以添加错误提示
    };
    
    // 监听currentAudio变化，自动播放
    watch(currentAudio, (newAudio) => {
      if (newAudio && audioElement.value) {
        audioElement.value.load();
        audioElement.value.play().then(() => {
          isPlaying.value = true;
        }).catch(error => {
          console.error('自动播放失败:', error);
          isPlaying.value = false;
        });
      }
    });
    
    // 监听isPlaying变化，更新音频元素状态
    watch(isPlaying, (newValue) => {
      if (!audioElement.value) return;
      
      if (newValue) {
        audioElement.value.play().catch(error => {
          console.error('播放失败:', error);
          isPlaying.value = false;
        });
      } else {
        audioElement.value.pause();
      }
    });
    
    // 监听isMuted变化，更新音频元素状态
    watch(isMuted, (newValue) => {
      if (audioElement.value) {
        audioElement.value.muted = newValue;
      }
    });
    
    // 监听volume变化，更新音频元素状态
    watch(volume, (newValue) => {
      if (audioElement.value) {
        audioElement.value.volume = newValue / 100;
      }
    });
    
    // 初始化音频分析器
    const initAudioAnalyzer = () => {
      if (!audioElement.value) return;
      
      try {
        // 创建音频上下文
        audioContext.value = new (window.AudioContext || window.webkitAudioContext)();
        
        // 创建分析器
        analyser.value = audioContext.value.createAnalyser();
        analyser.value.fftSize = 256;
        
        // 获取数据数组
        const bufferLength = analyser.value.frequencyBinCount;
        dataArray.value = new Uint8Array(bufferLength);
        
        // 创建音频源并连接
        const source = audioContext.value.createMediaElementSource(audioElement.value);
        source.connect(analyser.value);
        analyser.value.connect(audioContext.value.destination);
        
        // 初始化波形动画
        nextTick(() => {
          if (waveformCanvas.value) {
            drawWaveform();
          }
        });
      } catch (error) {
        console.warn('音频分析器初始化失败:', error);
      }
    };
    
    // 绘制波形动画
    const drawWaveform = () => {
      if (!analyser.value || !waveformCanvas.value) return;
      
      const canvas = waveformCanvas.value;
      const ctx = canvas.getContext('2d');
      
      // 设置canvas尺寸
      const setCanvasSize = () => {
        const parentWidth = canvas.parentElement.clientWidth;
        canvas.width = parentWidth;
        canvas.height = 60; // 固定高度
      };
      
      setCanvasSize();
      
      // 响应式调整canvas大小
      window.addEventListener('resize', setCanvasSize);
      
      const draw = () => {
        animationId.value = requestAnimationFrame(draw);
        
        // 获取频率数据
        analyser.value.getByteFrequencyData(dataArray.value);
        
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 绘制波形
        const barWidth = (canvas.width / dataArray.value.length) * 2.5;
        let x = 0;
        
        // 渐变颜色
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, '#ff7eb9'); // 粉色
        gradient.addColorStop(0.5, '#a78bfa'); // 紫色
        gradient.addColorStop(1, '#818cf8'); // 蓝色
        
        ctx.fillStyle = isPlaying.value ? gradient : 'rgba(167, 139, 250, 0.3)';
        
        for (let i = 0; i < dataArray.value.length; i++) {
          const barHeight = isPlaying.value ? 
            (dataArray.value[i] / 255) * canvas.height : 
            10 + Math.sin(Date.now() * 0.002 + i) * 5; // 未播放时的轻微动画
          
          // 绘制圆角矩形
          ctx.beginPath();
          ctx.moveTo(x, canvas.height - barHeight);
          ctx.lineTo(x + barWidth, canvas.height - barHeight);
          ctx.arcTo(x + barWidth, canvas.height, x, canvas.height, 4);
          ctx.arcTo(x, canvas.height, x, canvas.height - barHeight, 4);
          ctx.closePath();
          ctx.fill();
          
          x += barWidth + 1;
        }
      };
      
      draw();
    };
    
    // 组件挂载时的初始化
    onMounted(() => {
      // 可以在这里加载用户的播放历史或偏好设置
      
      // 延迟初始化音频分析器，等待用户交互后再创建
      const initOnInteraction = () => {
        initAudioAnalyzer();
        document.removeEventListener('click', initOnInteraction);
        document.removeEventListener('keydown', initOnInteraction);
      };
      
      document.addEventListener('click', initOnInteraction);
      document.addEventListener('keydown', initOnInteraction);
    });
    
    // 组件卸载时的清理
    onUnmounted(() => {
      // 移除全局事件监听
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('click', initAudioAnalyzer);
      document.removeEventListener('keydown', initAudioAnalyzer);
      window.removeEventListener('resize', () => {}); // 清理resize事件
      
      // 暂停播放
      if (audioElement.value) {
        audioElement.value.pause();
      }
      
      // 取消动画帧
      if (animationId.value) {
        cancelAnimationFrame(animationId.value);
      }
      
      // 关闭音频上下文
      if (audioContext.value) {
        audioContext.value.close();
      }
    });
    
    return {
      audioList,
      currentAudioIndex,
      isPlaying,
      currentTime,
      duration,
      volume,
      isMuted,
      repeatMode,
      isShuffling,
      showPlaylist,
      lyricsMode,
      shuffleQueue,
      audioElement,
      progressThumb,
      volumeThumb,
      lyricsContainer,
      waveformCanvas,
      isDragging,
      isVolumeDragging,
      currentAudio,
      progressPercent,
      hasPrevious,
      hasNext,
      formatTime,
      getRepeatModeText,
      getRepeatModeIcon,
      getVolumeIcon,
      toggleRepeatMode,
      toggleShuffle,
      playAudio,
      togglePlayPause,
      playPrevious,
      playNext,
      togglePlaylist,
      toggleLyricsMode,
      removeFromPlaylist,
      clearQueue,
      shufflePlaylist,
      toggleMute,
      setVolume,
      seek,
      startDragging,
      startVolumeDragging,
      isActiveLyric,
      scrollLyricsToActive,
      onTimeUpdate,
      onLoadedMetadata,
      onAudioEnded,
      onAudioError
    };
  }
};
</script>

<style scoped>
.audio-player-container {
  max-width: 800px;
  margin: 0 auto;
  background: var(--background-primary);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* 播放器头部 */
.player-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: var(--primary-gradient);
  color: white;
  position: relative;
  overflow: hidden;
}

/* 音频波形动画容器 */
.audio-waveform {
  margin: 1rem 0;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.05);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.waveform-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.player-header h3 {
  margin: 0;
  font-size: 1.3rem;
}

.playlist-toggle .btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all var(--transition-speed) ease;
}

.playlist-toggle .btn:hover,
.playlist-toggle .btn.active {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

/* 播放列表 */
.playlist-panel {
  max-height: 300px;
  border-bottom: 1px solid var(--border-color);
}

.playlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: var(--background-secondary);
}

.playlist-title {
  font-weight: 600;
  color: var(--text-primary);
}

.playlist-controls {
  display: flex;
  gap: 0.5rem;
}

.btn-sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.85rem;
}

.playlist-content {
  max-height: 240px;
  overflow-y: auto;
}

.empty-playlist {
  padding: 3rem;
  text-align: center;
  color: var(--text-secondary);
}

.playlist-items {
  display: flex;
  flex-direction: column;
}

.playlist-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: background-color var(--transition-speed) ease;
}

.playlist-item:hover {
  background: var(--background-secondary);
}

.playlist-item.active {
  background: var(--primary-light);
  border-left: 4px solid var(--primary-color);
}

.playlist-item.playing .playlist-item-number {
  color: var(--primary-color);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.playlist-item-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.playlist-item-number {
  font-size: 0.9rem;
  color: var(--text-secondary);
  min-width: 20px;
  text-align: center;
}

.playlist-item-details {
  flex: 1;
}

.playlist-item-title {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.playlist-item-artist {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  font-size: 0.9rem;
}

.remove-btn:hover {
  background: var(--danger-light);
  color: var(--danger-color);
}

/* 播放器主体 */
.player-main {
  padding: 1.5rem;
}

/* 当前播放信息 */
.current-playback {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  align-items: center;
}

.playback-cover {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-speed) ease;
}

.playback-cover:hover .cover-overlay {
  opacity: 1;
}

.cover-overlay.playing {
  opacity: 1;
}

.vinyl-record {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #333;
  position: relative;
  animation: spin 3s linear infinite;
  animation-play-state: paused;
}

.cover-overlay.playing .vinyl-record {
  animation-play-state: running;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.vinyl-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
}

.playback-info {
  flex: 1;
}

.song-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.song-artist {
  font-size: 1rem;
  color: var(--primary-color);
  margin-bottom: 0.25rem;
}

.song-album {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.no-audio-selected {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: var(--text-secondary);
}

.placeholder-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* 播放控制 */
.playback-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.play-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.repeat-btn.repeat-none {
  color: var(--text-secondary);
}

.repeat-btn.repeat-one {
  color: var(--success-color);
}

.repeat-btn.repeat-all {
  color: var(--primary-color);
}

.shuffle-btn.active {
  color: var(--primary-color);
}

/* 进度条 */
.progress-container {
  margin-bottom: 1.5rem;
}

.time-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.progress-bar-wrapper,
.volume-bar-wrapper {
  position: relative;
  height: 6px;
  background: var(--background-secondary);
  border-radius: 3px;
  overflow: hidden;
  cursor: pointer;
}

.progress-bar,
.volume-bar {
  width: 100%;
  height: 100%;
  position: relative;
}

.progress-filled,
.volume-filled {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: var(--primary-gradient);
  transition: width var(--transition-speed) ease;
}

.progress-thumb,
.volume-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  background: white;
  border: 2px solid var(--primary-color);
  border-radius: 50%;
  cursor: pointer;
  transition: transform var(--transition-speed) ease;
}

.progress-thumb:hover,
.volume-thumb:hover {
  transform: translate(-50%, -50%) scale(1.2);
}

/* 音量控制 */
.volume-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.volume-bar-wrapper {
  width: 100px;
}

/* 歌词显示 */
.lyrics-container {
  border-top: 1px solid var(--border-color);
}

.lyrics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: var(--background-secondary);
}

.lyrics-header h4 {
  margin: 0;
  color: var(--text-primary);
}

.lyrics-mode .btn {
  padding: 0.25rem 0.75rem;
  font-size: 0.85rem;
}

.lyrics-content {
  max-height: 120px;
  overflow-y: auto;
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.lyrics-content.lyrics-full {
  max-height: 300px;
}

.lyrics-line {
  padding: 0.5rem 0;
  color: var(--text-secondary);
  transition: all var(--transition-speed) ease;
  font-size: 0.95rem;
}

.lyrics-line.active {
  color: var(--primary-color);
  font-size: 1.1rem;
  font-weight: 600;
  transform: scale(1.05);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .audio-player-container {
    margin: 0 1rem;
  }
  
  .player-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .current-playback {
    flex-direction: column;
    text-align: center;
  }
  
  .playback-cover {
    width: 100px;
    height: 100px;
  }
  
  .song-title {
    font-size: 1.2rem;
  }
  
  .playback-controls {
    gap: 1rem;
  }
  
  .play-btn {
    width: 48px;
    height: 48px;
    font-size: 1rem;
  }
  
  .volume-controls {
    justify-content: center;
  }
  
  .volume-bar-wrapper {
    width: 80px;
  }
  
  .lyrics-header {
    flex-direction: column;
    gap: 0.75rem;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .player-main {
    padding: 1rem;
  }
  
  .playlist-header {
    flex-direction: column;
    gap: 0.75rem;
    text-align: center;
  }
  
  .playlist-controls {
    justify-content: center;
  }
  
  .playback-cover {
    width: 80px;
    height: 80px;
  }
  
  .vinyl-record {
    width: 60px;
    height: 60px;
  }
  
  .lyrics-content {
    padding: 1rem;
  }
}
</style>