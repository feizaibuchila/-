<template>
  <div class="guess-song-view">
    <div class="container">
      <h1>猜歌挑战</h1>
      
      <!-- 游戏统计 -->
      <div class="game-stats">
        <div class="stat-card">
          <div class="stat-value">{{ totalScore }}</div>
          <div class="stat-label">今日总分</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ correctAnswers }}</div>
          <div class="stat-label">答对题数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ consecutiveCorrect }}</div>
          <div class="stat-label">连续答对</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ bestStreak }}</div>
          <div class="stat-label">最佳连击</div>
        </div>
      </div>

      <!-- 游戏区域 -->
      <div class="game-container">
        <!-- 游戏进行中 -->
        <div v-if="gameState === 'playing'" class="playing-state">
          <!-- 进度条 -->
          <div class="progress-section">
            <div class="progress-info">
              <span>题目 {{ currentRound }}/{{ totalRounds }}</span>
              <span>剩余时间: {{ remainingTime }}s</span>
            </div>
            <div class="progress-bar">
              <div class="progress" :style="{ width: timeProgress + '%' }"></div>
            </div>
          </div>

          <!-- 播放控制 -->
          <div class="playback-section">
            <div class="play-icon" @click="playSample">
              ▶️
            </div>
            <p class="play-hint">点击播放歌曲片段</p>
          </div>

          <!-- 选项区域 -->
          <div class="options-section">
            <h3>请选择歌曲名称：</h3>
            <div class="options-grid song-options">
              <button 
                v-for="option in songOptions" 
                :key="option"
                class="option-btn"
                :class="{ selected: selectedSong === option }"
                @click="selectSong(option)"
              >
                {{ option }}
              </button>
            </div>

            <h3 class="album-title">请选择所属专辑：</h3>
            <div class="options-grid album-options">
              <button 
                v-for="option in albumOptions" 
                :key="option"
                class="option-btn"
                :class="{ selected: selectedAlbum === option }"
                @click="selectAlbum(option)"
              >
                {{ option }}
              </button>
            </div>
          </div>

          <!-- 提交按钮 -->
          <button 
            class="btn submit-btn" 
            @click="submitAnswer"
            :disabled="!selectedSong || !selectedAlbum"
          >
            提交答案
          </button>
        </div>

        <!-- 答案结果 -->
        <div v-if="gameState === 'result'" class="result-state" :class="isCorrect ? 'correct' : 'wrong'">
          <div class="result-icon">{{ isCorrect ? '🎉' : '❌' }}</div>
          <h2>{{ isCorrect ? '回答正确！' : '回答错误' }}</h2>
          <div class="result-details">
            <div class="detail-item">
              <span class="detail-label">正确歌曲：</span>
              <span class="detail-value">{{ currentQuestion.songName }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">正确专辑：</span>
              <span class="detail-value">{{ currentQuestion.albumName }}</span>
            </div>
            <div v-if="isCorrect" class="detail-item score">
              <span class="detail-label">得分：</span>
              <span class="detail-value">{{ earnedScore }}分</span>
            </div>
            <div v-if="isCorrect && consecutiveCorrect > 1" class="detail-item streak">
              <span class="detail-label">连击奖励：</span>
              <span class="detail-value">+{{ streakBonus }}分</span>
            </div>
          </div>
          <button class="btn next-btn" @click="nextQuestion">
            {{ currentRound < totalRounds ? '下一题' : '结束挑战' }}
          </button>
        </div>

        <!-- 游戏结束 -->
        <div v-if="gameState === 'finished'" class="finished-state">
          <h2>挑战完成！</h2>
          <div class="final-stats">
            <div class="final-stat">
              <div class="stat-icon">🏆</div>
              <div class="stat-content">
                <div class="stat-value">{{ totalScore }}</div>
                <div class="stat-label">总得分</div>
              </div>
            </div>
            <div class="final-stat">
              <div class="stat-icon">✅</div>
              <div class="stat-content">
                <div class="stat-value">{{ correctAnswers }}</div>
                <div class="stat-label">正确题数</div>
              </div>
            </div>
            <div class="final-stat">
              <div class="stat-icon">🔥</div>
              <div class="stat-content">
                <div class="stat-value">{{ bestStreak }}</div>
                <div class="stat-label">最高连击</div>
              </div>
            </div>
          </div>
          <div class="reward-info">
            <p>恭喜获得 {{ rewardCoins }} 谦币奖励！</p>
            <p>恭喜获得 {{ rewardExp }} 经验值！</p>
          </div>
          <button class="btn restart-btn" @click="startNewGame">
            再来一局
          </button>
        </div>

        <!-- 游戏说明 -->
        <div v-if="gameState === 'idle'" class="game-instructions">
          <h2>游戏说明</h2>
          <ul>
            <li>游戏将播放薛之谦歌曲的片段，请猜测歌曲名称和所属专辑</li>
            <li>每道题有30秒的答题时间</li>
            <li>连续答对可获得额外连击分数加成</li>
            <li>完成挑战可获得谦币和经验值奖励</li>
            <li>每周将更新题库，记得来挑战哦！</li>
          </ul>
          <button class="btn start-btn" @click="startNewGame">
            开始挑战
          </button>
        </div>
      </div>

      <!-- 排行榜 -->
      <div class="ranking-section">
        <h3>本周排行榜</h3>
        <div class="ranking-list">
          <div 
            v-for="(player, index) in rankingList" 
            :key="player.id"
            class="ranking-item"
            :class="{ 'top-3': index < 3, 'current-user': player.isCurrentUser }"
          >
            <div class="rank-number">{{ index + 1 }}</div>
            <div class="user-info">
              <img :src="player.avatar" alt="用户头像" class="user-avatar" />
              <span class="username">{{ player.username }}</span>
              <span v-if="player.isCurrentUser" class="current-badge">(我)</span>
            </div>
            <div class="user-score">{{ player.score }}</div>
          </div>
        </div>
      </div>

      <!-- 隐藏的音频元素 -->
      <audio ref="audioPlayer" :src="currentAudioUrl" @ended="handleAudioEnd"></audio>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { useUserStore } from '../store/index.js';

export default {
  name: 'GuessSongView',
  setup() {
    const userStore = useUserStore();
    const audioPlayer = ref(null);
    
    // 游戏状态
    const gameState = ref('idle'); // 'idle', 'playing', 'result', 'finished'
    const currentRound = ref(1);
    const totalRounds = ref(10);
    const remainingTime = ref(30);
    const timeProgress = ref(100);
    const totalScore = ref(0);
    const correctAnswers = ref(0);
    const consecutiveCorrect = ref(0);
    const bestStreak = ref(0);
    const earnedScore = ref(0);
    const streakBonus = ref(0);
    const isCorrect = ref(false);
    
    // 答题相关
    const selectedSong = ref('');
    const selectedAlbum = ref('');
    const currentQuestion = reactive({
      songName: '',
      albumName: '',
      audioUrl: ''
    });
    const songOptions = ref([]);
    const albumOptions = ref([]);
    const currentAudioUrl = ref('');
    
    // 排行榜
    const rankingList = ref([]);
    
    // 定时器
    let gameTimer = null;
    let roundTimer = null;
    
    // 题库数据
    const songDatabase = [
      {
        songName: '演员',
        albumName: '绅士',
        audioUrl: '' // 实际项目中替换为真实音频URL
      },
      {
        songName: '认真的雪',
        albumName: '薛之谦',
        audioUrl: '' // 实际项目中替换为真实音频URL
      },
      {
        songName: '刚刚好',
        albumName: '初学者',
        audioUrl: '' // 实际项目中替换为真实音频URL
      },
      {
        songName: '丑八怪',
        albumName: '意外',
        audioUrl: '' // 实际项目中替换为真实音频URL
      },
      {
        songName: '违背的青春',
        albumName: '违背的青春',
        audioUrl: '' // 实际项目中替换为真实音频URL
      },
      {
        songName: '动物世界',
        albumName: '渡 The Crossing',
        audioUrl: '' // 实际项目中替换为真实音频URL
      },
      {
        songName: '暧昧',
        albumName: '渡 The Crossing',
        audioUrl: '' // 实际项目中替换为真实音频URL
      },
      {
        songName: '天份',
        albumName: '怪咖',
        audioUrl: '' // 实际项目中替换为真实音频URL
      },
      {
        songName: '像风一样',
        albumName: '像风一样',
        audioUrl: '' // 实际项目中替换为真实音频URL
      },
      {
        songName: '江南',
        albumName: '未完成的歌',
        audioUrl: '' // 实际项目中替换为真实音频URL
      },
      {
        songName: '方圆几里',
        albumName: '意外',
        audioUrl: '' // 实际项目中替换为真实音频URL
      },
      {
        songName: '我好像在哪见过你',
        albumName: '初学者',
        audioUrl: '' // 实际项目中替换为真实音频URL
      }
    ];
    
    // 初始化排行榜
    const initRankingList = () => {
      const currentUsername = userStore.userInfo?.name || '谦友';
      const currentAvatar = userStore.userInfo?.avatar || 'https://picsum.photos/40/40?random=1';
      
      rankingList.value = [
        { id: 1, username: '谦友一号', avatar: 'https://picsum.photos/40/40?random=10', score: 850, isCurrentUser: false },
        { id: 2, username: '谦友二号', avatar: 'https://picsum.photos/40/40?random=11', score: 780, isCurrentUser: false },
        { id: 3, username: '谦友三号', avatar: 'https://picsum.photos/40/40?random=12', score: 720, isCurrentUser: false },
        { id: 4, username: currentUsername, avatar: currentAvatar, score: 650, isCurrentUser: true },
        { id: 5, username: '谦友四号', avatar: 'https://picsum.photos/40/40?random=13', score: 620, isCurrentUser: false },
        { id: 6, username: '谦友五号', avatar: 'https://picsum.photos/40/40?random=14', score: 580, isCurrentUser: false },
        { id: 7, username: '谦友六号', avatar: 'https://picsum.photos/40/40?random=15', score: 550, isCurrentUser: false }
      ];
    };
    
    // 生成随机题目
    const generateQuestion = () => {
      // 从题库中随机选择一题
      const randomIndex = Math.floor(Math.random() * songDatabase.length);
      const question = songDatabase[randomIndex];
      
      // 设置当前题目
      currentQuestion.songName = question.songName;
      currentQuestion.albumName = question.albumName;
      currentQuestion.audioUrl = question.audioUrl;
      currentAudioUrl.value = question.audioUrl;
      
      // 生成歌曲选项（包含正确答案和3个干扰项）
      const allSongs = [...new Set(songDatabase.map(s => s.songName))];
      songOptions.value = generateOptions(allSongs, question.songName, 4);
      
      // 生成专辑选项（包含正确答案和3个干扰项）
      const allAlbums = [...new Set(songDatabase.map(s => s.albumName))];
      albumOptions.value = generateOptions(allAlbums, question.albumName, 4);
    };
    
    // 生成选项（包含正确答案和干扰项）
    const generateOptions = (allItems, correctItem, count) => {
      // 复制数组并移除正确答案
      const otherItems = allItems.filter(item => item !== correctItem);
      
      // 随机选择干扰项
      const shuffled = [...otherItems].sort(() => 0.5 - Math.random());
      const干扰项 = shuffled.slice(0, count - 1);
      
      // 合并正确答案和干扰项
      const options = [correctItem, ...干扰项];
      
      // 打乱顺序
      return options.sort(() => 0.5 - Math.random());
    };
    
    // 开始新游戏
    const startNewGame = () => {
      gameState.value = 'playing';
      currentRound.value = 1;
      totalScore.value = 0;
      correctAnswers.value = 0;
      consecutiveCorrect.value = 0;
      bestStreak.value = 0;
      
      // 生成第一题
      generateQuestion();
      startRound();
    };
    
    // 开始新一轮
    const startRound = () => {
      selectedSong.value = '';
      selectedAlbum.value = '';
      remainingTime.value = 30;
      timeProgress.value = 100;
      
      // 清除现有定时器
      if (roundTimer) {
        clearInterval(roundTimer);
      }
      
      // 开始倒计时
      roundTimer = setInterval(() => {
        remainingTime.value--;
        timeProgress.value = (remainingTime.value / 30) * 100;
        
        if (remainingTime.value <= 0) {
          // 时间到，自动提交
          submitAnswer();
        }
      }, 1000);
    };
    
    // 播放歌曲片段
    const playSample = () => {
      if (audioPlayer.value) {
        // 模拟播放，实际项目中会播放真实音频
        // audioPlayer.value.currentTime = 0;
        // audioPlayer.value.play();
        
        // 模拟播放效果
        const playIcon = event.currentTarget;
        playIcon.style.animation = 'pulse 1s';
        setTimeout(() => {
          playIcon.style.animation = '';
        }, 1000);
      }
    };
    
    // 处理音频播放结束
    const handleAudioEnd = () => {
      // 音频播放结束后的处理
    };
    
    // 选择歌曲
    const selectSong = (song) => {
      selectedSong.value = song;
    };
    
    // 选择专辑
    const selectAlbum = (album) => {
      selectedAlbum.value = album;
    };
    
    // 提交答案
    const submitAnswer = () => {
      // 清除定时器
      if (roundTimer) {
        clearInterval(roundTimer);
        roundTimer = null;
      }
      
      // 判断答案是否正确
      isCorrect.value = 
        selectedSong.value === currentQuestion.songName && 
        selectedAlbum.value === currentQuestion.albumName;
      
      // 计算得分
      if (isCorrect.value) {
        correctAnswers.value++;
        consecutiveCorrect.value++;
        bestStreak.value = Math.max(bestStreak.value, consecutiveCorrect.value);
        
        // 基础得分 = 剩余时间 * 10
        earnedScore.value = remainingTime.value * 10;
        
        // 连击加成
        if (consecutiveCorrect.value > 1) {
          streakBonus.value = (consecutiveCorrect.value - 1) * 50;
          earnedScore.value += streakBonus.value;
        } else {
          streakBonus.value = 0;
        }
        
        totalScore.value += earnedScore.value;
      } else {
        consecutiveCorrect.value = 0;
        earnedScore.value = 0;
        streakBonus.value = 0;
      }
      
      // 显示结果
      gameState.value = 'result';
    };
    
    // 下一题
    const nextQuestion = () => {
      if (currentRound.value < totalRounds.value) {
        currentRound.value++;
        generateQuestion();
        gameState.value = 'playing';
        startRound();
      } else {
        // 游戏结束
        finishGame();
      }
    };
    
    // 游戏结束
    const finishGame = () => {
      gameState.value = 'finished';
      
      // 计算奖励
      const rewardCoins = Math.floor(totalScore.value / 10);
      const rewardExp = Math.floor(totalScore.value / 20) + correctAnswers.value * 5;
      
      // 发放奖励
      userStore.addQianbi(rewardCoins);
      userStore.addExperience(rewardExp);
      
      // 更新排行榜
      updateRanking(totalScore.value);
    };
    
    // 更新排行榜
    const updateRanking = (score) => {
      const currentUserIndex = rankingList.value.findIndex(item => item.isCurrentUser);
      if (currentUserIndex !== -1) {
        rankingList.value[currentUserIndex].score = score;
        // 按分数排序
        rankingList.value.sort((a, b) => b.score - a.score);
      }
    };
    
    // 清理定时器
    onUnmounted(() => {
      if (gameTimer) {
        clearInterval(gameTimer);
      }
      if (roundTimer) {
        clearInterval(roundTimer);
      }
    });
    
    // 初始化
    onMounted(() => {
      initRankingList();
    });
    
    return {
      gameState,
      currentRound,
      totalRounds,
      remainingTime,
      timeProgress,
      totalScore,
      correctAnswers,
      consecutiveCorrect,
      bestStreak,
      earnedScore,
      streakBonus,
      isCorrect,
      selectedSong,
      selectedAlbum,
      currentQuestion,
      songOptions,
      albumOptions,
      currentAudioUrl,
      rankingList,
      audioPlayer,
      startNewGame,
      playSample,
      handleAudioEnd,
      selectSong,
      selectAlbum,
      submitAnswer,
      nextQuestion,
      rewardCoins: computed(() => Math.floor(totalScore.value / 10)),
      rewardExp: computed(() => Math.floor(totalScore.value / 20) + correctAnswers.value * 5)
    };
  }
};
</script>

<style scoped>
.guess-song-view {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 2rem 0;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1rem;
}

.guess-song-view h1 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.5rem;
  color: #333;
}

/* 游戏统计 */
.game-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #1890ff;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

/* 游戏容器 */
.game-container {
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  min-height: 400px;
}

/* 游戏进行中 */
.progress-section {
  margin-bottom: 2rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.progress-bar {
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background-color: #1890ff;
  transition: width 1s linear;
}

.playback-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
  padding: 2rem;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.play-icon {
  font-size: 4rem;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: transform 0.3s;
}

.play-icon:hover {
  transform: scale(1.1);
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.play-hint {
  color: #666;
  margin: 0;
}

.options-section {
  margin-bottom: 2rem;
}

.options-section h3 {
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.album-title {
  margin-top: 2rem;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.option-btn {
  padding: 1rem;
  border: 2px solid #d9d9d9;
  background-color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
}

.option-btn:hover {
  border-color: #1890ff;
  background-color: #f0f8ff;
}

.option-btn.selected {
  border-color: #1890ff;
  background-color: #1890ff;
  color: white;
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn:hover:not(:disabled) {
  background-color: #40a9ff;
}

.submit-btn:disabled {
  background-color: #d9d9d9;
  cursor: not-allowed;
}

/* 答案结果 */
.result-state {
  text-align: center;
  padding: 2rem;
  border-radius: 8px;
}

.result-state.correct {
  background-color: #f6ffed;
  border: 2px solid #b7eb8f;
}

.result-state.wrong {
  background-color: #fff1f0;
  border: 2px solid #ffccc7;
}

.result-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.result-state h2 {
  margin-bottom: 1.5rem;
}

.result-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.detail-label {
  color: #666;
}

.detail-value {
  font-weight: 500;
}

.detail-item.score .detail-value,
.detail-item.streak .detail-value {
  color: #ff4d4f;
  font-size: 1.1rem;
}

.next-btn {
  padding: 1rem 2rem;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.next-btn:hover {
  background-color: #40a9ff;
}

/* 游戏结束 */
.finished-state {
  text-align: center;
}

.finished-state h2 {
  margin-bottom: 2rem;
}

.final-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 2rem;
}

.final-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-content .stat-value {
  font-size: 1.8rem;
  color: #1890ff;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.stat-content .stat-label {
  font-size: 0.9rem;
  color: #666;
}

.reward-info {
  background-color: #f6ffed;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  border: 1px solid #b7eb8f;
}

.reward-info p {
  margin: 0.5rem 0;
  color: #389e0d;
  font-weight: 500;
}

.restart-btn {
  padding: 1rem 2rem;
  background-color: #52c41a;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.restart-btn:hover {
  background-color: #73d13d;
}

/* 游戏说明 */
.game-instructions {
  text-align: center;
  padding: 2rem;
}

.game-instructions h2 {
  margin-bottom: 1.5rem;
}

.game-instructions ul {
  text-align: left;
  max-width: 600px;
  margin: 0 auto 2rem;
  padding-left: 1.5rem;
}

.game-instructions li {
  margin-bottom: 0.75rem;
  line-height: 1.6;
}

.start-btn {
  padding: 1rem 2rem;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.start-btn:hover {
  background-color: #40a9ff;
}

/* 排行榜 */
.ranking-section {
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.ranking-section h3 {
  margin-bottom: 1.5rem;
  text-align: center;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.ranking-item:hover {
  background-color: #f5f5f5;
}

.ranking-item.top-3 {
  background-color: #fff7e6;
  font-weight: 500;
}

.ranking-item.current-user {
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
}

.rank-number {
  width: 30px;
  text-align: center;
  font-weight: bold;
  color: #1890ff;
}

.user-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.current-badge {
  color: #1890ff;
  font-size: 0.8rem;
}

.user-score {
  font-weight: bold;
  color: #ff4d4f;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .options-grid {
    grid-template-columns: 1fr;
  }
  
  .final-stats {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .result-details {
    text-align: left;
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>