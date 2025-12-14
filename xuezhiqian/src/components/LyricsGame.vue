<template>
  <div class="lyrics-game-container">
    <h2>🎵 歌词接龙小游戏 🎵</h2>
    
    <!-- 游戏状态卡片 -->
    <div class="game-stats card">
      <div class="stat-item">
        <span class="stat-label">当前积分：</span>
        <span class="stat-value points">{{ currentPoints }} 积分</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">今日已答：</span>
        <span class="stat-value">{{ todayAnswered }} 题</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">今日正确率：</span>
        <span class="stat-value">{{ todayCorrectRate }}%</span>
      </div>
    </div>
    
    <!-- 游戏主区域 -->
    <div class="game-main card">
      <!-- 游戏说明 -->
      <div v-if="gameStatus === 'ready'" class="game-instruction">
        <div class="instruction-content">
          <h3>游戏规则</h3>
          <p>欢迎来到薛之谦歌词接龙游戏！游戏规则很简单：</p>
          <ol>
            <li>系统会随机显示一句薛之谦歌曲的歌词片段</li>
            <li>你需要在输入框中填写下一句歌词</li>
            <li>答对一题获得 <span class="highlight">10 积分</span>，连续答对积分翻倍！</li>
            <li>答错可以继续尝试，直到答对为止</li>
            <li>每日可获得的积分有上限</li>
          </ol>
          <p>准备好了吗？点击开始按钮开始游戏吧！</p>
        </div>
        <button class="btn btn-primary start-btn" @click="startGame">
          开始游戏
        </button>
      </div>
      
      <!-- 游戏进行中 -->
      <div v-else-if="gameStatus === 'playing'" class="game-playing">
        <!-- 歌曲信息 -->
        <div class="song-info">
          <div class="song-title">{{ currentLyric.songName }}</div>
          <div class="song-album">{{ currentLyric.albumName }}</div>
        </div>
        
        <!-- 歌词显示 -->
        <div class="lyrics-display">
          <div class="current-lyric">
            {{ currentLyric.currentLine }}
          </div>
          <div class="divider">↓ 请接下一句 ↓</div>
          <div class="user-input-area">
            <input 
              v-model="userAnswer"
              type="text"
              class="answer-input"
              placeholder="请输入下一句歌词..."
              @keyup.enter="checkAnswer"
              :disabled="isChecking"
            >
            <button 
              class="btn btn-primary submit-btn"
              @click="checkAnswer"
              :disabled="!userAnswer.trim() || isChecking"
            >
              <span v-if="isChecking" class="loading-spinner"></span>
              {{ isChecking ? '验证中...' : '提交答案' }}
            </button>
          </div>
        </div>
        
        <!-- 提示信息 -->
        <div v-if="lastResult === 'correct'" class="result-message correct">
          ✅ 回答正确！获得 <span class="points">{{ earnedPoints }} 积分</span>
          <div class="correct-hint">
            <strong>正确歌词：</strong>{{ currentLyric.nextLine }}
          </div>
        </div>
        
        <div v-else-if="lastResult === 'incorrect'" class="result-message incorrect">
          ❌ 回答错误，请再试一次！
          <div v-if="hintCount > 0" class="hint-message">
            💡 提示：首字是 "{{ getFirstCharacterHint() }}"
          </div>
          <button class="btn btn-secondary hint-btn" @click="showHint" :disabled="hintCount >= maxHints">
            {{ hintCount >= maxHints ? '已用完提示' : '获取提示' }}
          </button>
        </div>
        
        <!-- 进度信息 -->
        <div class="game-progress">
          <div class="progress-item">
            <span class="progress-label">连续答对：</span>
            <span class="progress-value streak">{{ currentStreak }} 题</span>
          </div>
          <div class="progress-item">
            <span class="progress-label">当前倍率：</span>
            <span class="progress-value multiplier">×{{ currentMultiplier }}</span>
          </div>
          <div class="progress-item">
            <span class="progress-label">今日剩余：</span>
            <span class="progress-value remaining">{{ remainingDailyPoints }} 积分</span>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="game-actions">
          <button class="btn btn-secondary skip-btn" @click="skipLyric" :disabled="isChecking">
            跳过此题
          </button>
          <button class="btn btn-secondary give-up-btn" @click="giveUp" :disabled="isChecking">
            查看答案
          </button>
        </div>
      </div>
      
      <!-- 游戏结束 -->
      <div v-else-if="gameStatus === 'ended'" class="game-ended">
        <div class="end-icon">🏆</div>
        <h3>游戏结束！</h3>
        <div class="end-stats">
          <div class="end-stat">
            <span class="stat-label">本次游戏得分：</span>
            <span class="stat-value points">{{ gameScore }} 积分</span>
          </div>
          <div class="end-stat">
            <span class="stat-label">最高连击：</span>
            <span class="stat-value streak">{{ maxStreak }} 题</span>
          </div>
          <div class="end-stat">
            <span class="stat-label">正确率：</span>
            <span class="stat-value">{{ gameCorrectRate }}%</span>
          </div>
        </div>
        <button class="btn btn-primary restart-btn" @click="startGame">
          再玩一次
        </button>
      </div>
    </div>
    
    <!-- 排行榜 -->
    <div class="ranking-section">
      <h3>🏆 歌词达人排行榜 🏆</h3>
      <div class="ranking-list card">
        <div v-if="rankingList.length === 0" class="empty-ranking">
          暂无排行榜数据
        </div>
        <div v-else class="ranking-items">
          <!-- 前三名特殊样式 -->
          <div v-for="(item, index) in rankingList.slice(0, 3)" :key="item.userId" class="ranking-item top-three" :class="`rank-${index + 1}`">
            <div class="rank-number">{{ getRankIcon(index + 1) }}</div>
            <div class="rank-avatar">
              <img :src="getUserAvatar(item.userId)" alt="用户头像">
            </div>
            <div class="rank-info">
              <div class="rank-username">{{ item.username }}</div>
              <div class="rank-points">{{ item.points }} 积分</div>
            </div>
          </div>
          
          <!-- 其他排名 -->
          <div v-for="(item, index) in rankingList.slice(3)" :key="item.userId" class="ranking-item">
            <div class="rank-number">{{ index + 4 }}</div>
            <div class="rank-avatar">
              <img :src="getUserAvatar(item.userId)" alt="用户头像">
            </div>
            <div class="rank-info">
              <div class="rank-username">{{ item.username }}</div>
              <div class="rank-points">{{ item.points }} 积分</div>
            </div>
          </div>
          
          <!-- 当前用户排名 -->
          <div v-if="currentUserRank && !rankingList.some(item => item.userId === currentUserId)" class="ranking-item current-user">
            <div class="rank-number">{{ currentUserRank.rank }}</div>
            <div class="rank-avatar">
              <img :src="getUserAvatar(currentUserId)" alt="当前用户头像">
            </div>
            <div class="rank-info">
              <div class="rank-username">{{ currentUserRank.username }} (你)</div>
              <div class="rank-points">{{ currentUserRank.points }} 积分</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 积分兑换 -->
    <div class="redeem-section">
      <h3>🎁 积分兑换中心 🎁</h3>
      <div class="redeem-list">
        <div 
          v-for="item in redeemItems" 
          :key="item.id"
          class="redeem-item card"
          :class="{ 'can-redeem': currentPoints >= item.pointsRequired, 'cannot-redeem': currentPoints < item.pointsRequired }"
        >
          <div class="redeem-icon">{{ item.icon }}</div>
          <div class="redeem-info">
            <div class="redeem-title">{{ item.title }}</div>
            <div class="redeem-description">{{ item.description }}</div>
            <div class="redeem-cost">
              <span class="points">{{ item.pointsRequired }}</span> 积分
            </div>
          </div>
          <button 
            class="btn btn-primary redeem-btn"
            @click="redeemItem(item)"
            :disabled="currentPoints < item.pointsRequired"
            :title="currentPoints < item.pointsRequired ? '积分不足' : ''"
          >
            {{ currentPoints >= item.pointsRequired ? '立即兑换' : '积分不足' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useUserStore } from '../store/index';

export default {
  name: 'LyricsGame',
  setup() {
    const userStore = useUserStore();
    
    // 用户信息
    const currentUserId = computed(() => userStore.getUserInfo.id);
    const currentPoints = computed(() => userStore.getPoints);
    
    // 游戏状态
    const gameStatus = ref('ready'); // ready, playing, ended
    const gameScore = ref(0);
    const currentStreak = ref(0);
    const maxStreak = ref(0);
    const currentMultiplier = ref(1);
    const todayAnswered = ref(0);
    const todayCorrect = ref(0);
    const remainingDailyPoints = ref(200); // 每日积分上限
    const isChecking = ref(false);
    const lastResult = ref(''); // correct, incorrect
    const earnedPoints = ref(0);
    const hintCount = ref(0);
    const maxHints = 2;
    
    // 用户输入
    const userAnswer = ref('');
    
    // 歌词数据
    const lyricsData = ref([
      {
        id: 1,
        songName: '演员',
        albumName: '绅士',
        currentLine: '该配合你演出的我演视而不见',
        nextLine: '在逼一个最爱你的人即兴表演',
        difficulty: 'easy'
      },
      {
        id: 2,
        songName: '刚刚好',
        albumName: '初学者',
        currentLine: '我们的爱情到这刚刚好',
        nextLine: '剩不多也不少还能忘掉',
        difficulty: 'easy'
      },
      {
        id: 3,
        songName: '丑八怪',
        albumName: '意外',
        currentLine: '丑八怪 在这暧昧的时代',
        nextLine: '我的存在 像意外',
        difficulty: 'easy'
      },
      {
        id: 4,
        songName: '认真的雪',
        albumName: '薛之谦',
        currentLine: '雪下得那么深下得那么认真',
        nextLine: '倒映出我淌在雪中的伤痕',
        difficulty: 'easy'
      },
      {
        id: 5,
        songName: '刚刚好',
        albumName: '初学者',
        currentLine: '用力爱过的人不该计较',
        nextLine: '是否要逼人弃了甲',
        difficulty: 'medium'
      },
      {
        id: 6,
        songName: '暧昧',
        albumName: '渡',
        currentLine: '反正现在的感情 都暧昧',
        nextLine: '你大可不必为难 找般配',
        difficulty: 'medium'
      },
      {
        id: 7,
        songName: '违背的青春',
        albumName: '怪咖',
        currentLine: '我该变成什么样子才能延缓厌倦',
        nextLine: '原来当爱放下防备后的这些那些',
        difficulty: 'medium'
      },
      {
        id: 8,
        songName: '动物世界',
        albumName: '渡',
        currentLine: '人类用沙 想捏出梦里通天塔',
        nextLine: '为贪念不惜代价',
        difficulty: 'medium'
      },
      {
        id: 9,
        songName: '方圆几里',
        albumName: '意外',
        currentLine: '爱不爱都可以 我怎样都依你',
        nextLine: '连借口我都帮你寻',
        difficulty: 'easy'
      },
      {
        id: 10,
        songName: '一半',
        albumName: '一半',
        currentLine: '我可以为我们的散承担一半',
        nextLine: '可我偏要摧毁所有的好感',
        difficulty: 'medium'
      },
      {
        id: 11,
        songName: '我好像在哪见过你',
        albumName: '初学者',
        currentLine: '我好像在哪见过你',
        nextLine: '我在劝我该忘了你',
        difficulty: 'easy'
      },
      {
        id: 12,
        songName: '天外来物',
        albumName: '天外来物',
        currentLine: '你像天外来物一样求之不得',
        nextLine: '你在世俗里的名字不重要了',
        difficulty: 'medium'
      },
      {
        id: 13,
        songName: '违背的青春',
        albumName: '怪咖',
        currentLine: '再没骗自己的理由 时间如刀不再温柔',
        nextLine: '一路走 汗在流 再回首 已没有',
        difficulty: 'hard'
      },
      {
        id: 14,
        songName: '高尚',
        albumName: '渡',
        currentLine: '狼藏起反犬旁 像从了良',
        nextLine: '张牙舞爪的人在散谎',
        difficulty: 'hard'
      },
      {
        id: 15,
        songName: '笑场',
        albumName: '尘',
        currentLine: '我们哭着降临世界 却可以笑着走向永恒',
        nextLine: '等你把我灌醉 唱个情歌',
        difficulty: 'hard'
      }
    ]);
    
    // 当前题目
    const currentLyric = ref(null);
    const usedLyrics = ref(new Set());
    
    // 排行榜数据
    const rankingList = ref([
      { userId: 1, username: '谦友001', points: 980 },
      { userId: 2, username: '世界和平守护者', points: 870 },
      { userId: 3, username: '演员的自我修养', points: 750 },
      { userId: 4, username: '丑八怪本怪', points: 640 },
      { userId: 5, username: '认真的雪', points: 590 },
      { userId: 6, username: '刚刚好遇见', points: 480 },
      { userId: 7, username: '暧昧不明', points: 420 },
      { userId: 8, username: '天外来客', points: 380 }
    ]);
    
    const currentUserRank = computed(() => {
      // 模拟当前用户排名
      const userPoints = currentPoints.value;
      let rank = 1;
      
      for (const item of rankingList.value) {
        if (item.points > userPoints) {
          rank++;
        }
      }
      
      return {
        rank,
        userId: currentUserId.value,
        username: userStore.getUserInfo.nickname || '我',
        points: userPoints
      };
    });
    
    // 积分兑换物品
    const redeemItems = ref([
      {
        id: 1,
        title: 'VIP会员7天体验券',
        description: '免费体验VIP会员7天，享受会员专属权益',
        pointsRequired: 500,
        icon: '💎'
      },
      {
        id: 2,
        title: '演唱会门票9折优惠券',
        description: '购买薛之谦演唱会门票享受9折优惠',
        pointsRequired: 300,
        icon: '🎫'
      },
      {
        id: 3,
        title: '周边商城85折优惠券',
        description: '购买薛之谦周边商品享受85折优惠',
        pointsRequired: 200,
        icon: '🛍️'
      },
      {
        id: 4,
        title: '歌词游戏额外提示次数',
        description: '歌词游戏中获得额外2次提示机会',
        pointsRequired: 50,
        icon: '💡'
      }
    ]);
    
    // 计算今日正确率
    const todayCorrectRate = computed(() => {
      if (todayAnswered.value === 0) return 0;
      return Math.round((todayCorrect.value / todayAnswered.value) * 100);
    });
    
    // 计算游戏正确率
    const gameCorrectRate = computed(() => {
      if (gameStatus.value !== 'ended' || todayAnswered.value === 0) return 0;
      return Math.round((todayCorrect.value / todayAnswered.value) * 100);
    });
    
    // 开始游戏
    const startGame = () => {
      gameStatus.value = 'playing';
      gameScore.value = 0;
      currentStreak.value = 0;
      maxStreak.value = 0;
      currentMultiplier.value = 1;
      usedLyrics.value.clear();
      loadNewLyric();
    };
    
    // 加载新歌词
    const loadNewLyric = () => {
      // 如果所有歌词都用过了，重置使用记录
      if (usedLyrics.value.size >= lyricsData.value.length) {
        usedLyrics.value.clear();
      }
      
      // 随机选择未使用的歌词
      const availableLyrics = lyricsData.value.filter(lyric => !usedLyrics.value.has(lyric.id));
      const randomIndex = Math.floor(Math.random() * availableLyrics.length);
      currentLyric.value = availableLyrics[randomIndex];
      usedLyrics.value.add(currentLyric.value.id);
      
      // 重置当前题目的状态
      userAnswer.value = '';
      lastResult.value = '';
      hintCount.value = 0;
    };
    
    // 检查答案
    const checkAnswer = async () => {
      if (!userAnswer.value.trim() || isChecking.value || !currentLyric.value) return;
      
      isChecking.value = true;
      
      try {
        // 模拟网络请求延迟
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // 简单的答案验证（忽略标点和空格差异）
        const normalizedUserAnswer = userAnswer.value.replace(/[\s\p{P}]/gu, '').toLowerCase();
        const normalizedCorrectAnswer = currentLyric.value.nextLine.replace(/[\s\p{P}]/gu, '').toLowerCase();
        
        todayAnswered.value++;
        
        if (normalizedUserAnswer === normalizedCorrectAnswer) {
          // 回答正确
          lastResult.value = 'correct';
          todayCorrect.value++;
          
          // 计算获得的积分
          currentStreak.value++;
          maxStreak.value = Math.max(maxStreak.value, currentStreak.value);
          
          // 计算倍率（连续答对5题倍率×2，10题×3，以此类推）
          currentMultiplier.value = Math.floor(currentStreak.value / 5) + 1;
          
          // 基础积分10分，乘以倍率
          earnedPoints.value = 10 * currentMultiplier.value;
          
          // 检查是否超过每日积分上限
          if (gameScore.value + earnedPoints.value > remainingDailyPoints.value) {
            earnedPoints.value = remainingDailyPoints.value - gameScore.value;
          }
          
          // 更新分数
          gameScore.value += earnedPoints.value;
          
          // 添加到用户总积分
          if (earnedPoints.value > 0) {
            userStore.addPoints(earnedPoints.value);
          }
          
          // 延迟加载下一题
          setTimeout(() => {
            if (gameScore.value >= remainingDailyPoints.value) {
              // 达到每日积分上限，结束游戏
              endGame();
            } else {
              loadNewLyric();
            }
          }, 2000);
        } else {
          // 回答错误
          lastResult.value = 'incorrect';
          currentStreak.value = 0;
          currentMultiplier.value = 1;
        }
      } catch (error) {
        console.error('验证答案时出错:', error);
      } finally {
        isChecking.value = false;
      }
    };
    
    // 显示提示
    const showHint = () => {
      if (hintCount.value < maxHints && currentLyric.value) {
        hintCount.value++;
      }
    };
    
    // 获取首字提示
    const getFirstCharacterHint = () => {
      if (!currentLyric.value || hintCount.value === 0) return '';
      return currentLyric.value.nextLine.trim()[0];
    };
    
    // 跳过此题
    const skipLyric = () => {
      if (isChecking.value) return;
      
      // 重置连击
      currentStreak.value = 0;
      currentMultiplier.value = 1;
      
      // 加载新题目
      loadNewLyric();
    };
    
    // 放弃此题，查看答案
    const giveUp = () => {
      if (isChecking.value || !currentLyric.value) return;
      
      lastResult.value = 'correct';
      earnedPoints.value = 0;
      
      // 重置连击
      currentStreak.value = 0;
      currentMultiplier.value = 1;
      
      // 延迟加载下一题
      setTimeout(() => {
        loadNewLyric();
      }, 3000);
    };
    
    // 结束游戏
    const endGame = () => {
      gameStatus.value = 'ended';
    };
    
    // 积分兑换
    const redeemItem = (item) => {
      if (currentPoints.value < item.pointsRequired) return;
      
      // 弹出确认框
      if (confirm(`确定要用 ${item.pointsRequired} 积分兑换 ${item.title} 吗？`)) {
        // 扣除积分
        userStore.addPoints(-item.pointsRequired);
        
        // 显示兑换成功消息
        alert(`兑换成功！${item.title} 已添加到您的账户。`);
      }
    };
    
    // 获取用户头像
    const getUserAvatar = (userId) => {
      // 模拟用户头像，使用picsum.photos随机图片
      const avatarId = userId % 1000;
      return `https://picsum.photos/seed/${avatarId}/40/40`;
    };
    
    // 获取排名图标
    const getRankIcon = (rank) => {
      switch (rank) {
        case 1: return '🥇';
        case 2: return '🥈';
        case 3: return '🥉';
        default: return rank;
      }
    };
    
    // 组件挂载时初始化
    onMounted(() => {
      // 可以在这里加载用户游戏记录等
    });
    
    return {
      currentUserId,
      currentPoints,
      gameStatus,
      gameScore,
      currentStreak,
      maxStreak,
      currentMultiplier,
      todayAnswered,
      todayCorrect,
      remainingDailyPoints,
      isChecking,
      lastResult,
      earnedPoints,
      hintCount,
      maxHints,
      userAnswer,
      currentLyric,
      rankingList,
      currentUserRank,
      redeemItems,
      todayCorrectRate,
      gameCorrectRate,
      startGame,
      checkAnswer,
      showHint,
      getFirstCharacterHint,
      skipLyric,
      giveUp,
      endGame,
      redeemItem,
      getUserAvatar,
      getRankIcon
    };
  }
};
</script>

<style scoped>
.lyrics-game-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.lyrics-game-container h2 {
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  text-align: center;
}

/* 游戏状态卡片 */
.game-stats {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
}

.stat-value.points {
  color: var(--primary-color);
}

.stat-value.streak {
  color: var(--success-color);
}

/* 游戏主区域 */
.game-main {
  padding: 2rem;
  margin-bottom: 2rem;
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

/* 游戏说明 */
.game-instruction {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.instruction-content {
  margin-bottom: 2rem;
}

.instruction-content h3 {
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.instruction-content p {
  margin-bottom: 1rem;
  line-height: 1.6;
  color: var(--text-primary);
}

.instruction-content ol {
  text-align: left;
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}

.instruction-content li {
  margin-bottom: 0.5rem;
  line-height: 1.5;
  color: var(--text-primary);
}

.highlight {
  color: var(--primary-color);
  font-weight: 600;
}

.start-btn {
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

/* 游戏进行中 */
.game-playing {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 歌曲信息 */
.song-info {
  text-align: center;
  margin-bottom: 1rem;
}

.song-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 0.25rem;
}

.song-album {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

/* 歌词显示 */
.lyrics-display {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 2rem;
  background: var(--background-secondary);
  border-radius: 12px;
}

.current-lyric {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
  line-height: 1.6;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
}

.divider {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.user-input-area {
  width: 100%;
  max-width: 500px;
  display: flex;
  gap: 1rem;
}

.answer-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 6px;
  background: var(--background-primary);
  color: var(--text-primary);
  font-size: 1rem;
  transition: border-color var(--transition-speed) ease;
}

.answer-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.answer-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-btn {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

/* 结果消息 */
.result-message {
  padding: 1rem;
  border-radius: 6px;
  text-align: center;
  margin-top: 1rem;
}

.result-message.correct {
  background: var(--success-background);
  color: var(--success-color);
  border: 1px solid var(--success-border);
}

.result-message.incorrect {
  background: var(--danger-background);
  color: var(--danger-color);
  border: 1px solid var(--danger-border);
}

.correct-hint {
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

.hint-message {
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

.hint-btn {
  margin-top: 0.5rem;
  padding: 0.25rem 0.75rem;
  font-size: 0.8rem;
}

/* 游戏进度 */
.game-progress {
  display: flex;
  justify-content: space-around;
  padding: 1rem;
  background: var(--background-secondary);
  border-radius: 6px;
  flex-wrap: wrap;
  gap: 1rem;
}

.progress-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.progress-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

.progress-value.multiplier {
  color: var(--warning-color);
}

.progress-value.remaining {
  color: var(--info-color);
}

/* 游戏操作按钮 */
.game-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.skip-btn,
.give-up-btn {
  padding: 0.75rem 1.5rem;
}

/* 游戏结束 */
.game-ended {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.end-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.game-ended h3 {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}

.end-stats {
  margin-bottom: 2rem;
}

.end-stat {
  margin-bottom: 0.75rem;
}

.restart-btn {
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

/* 排行榜 */
.ranking-section {
  margin-bottom: 2rem;
}

.ranking-section h3 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.ranking-list {
  padding: 0;
  max-height: 400px;
  overflow-y: auto;
}

.empty-ranking {
  padding: 3rem;
  text-align: center;
  color: var(--text-secondary);
}

.ranking-items {
  display: flex;
  flex-direction: column;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  transition: background-color var(--transition-speed) ease;
}

.ranking-item:hover {
  background: var(--background-secondary);
}

.ranking-item:last-child {
  border-bottom: none;
}

.ranking-item.top-three {
  background: linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,255,255,0) 100%);
}

.ranking-item.rank-1 {
  background: linear-gradient(135deg, rgba(255,215,0,0.2) 0%, rgba(255,255,255,0) 100%);
}

.ranking-item.rank-2 {
  background: linear-gradient(135deg, rgba(192,192,192,0.2) 0%, rgba(255,255,255,0) 100%);
}

.ranking-item.rank-3 {
  background: linear-gradient(135deg, rgba(205,127,50,0.2) 0%, rgba(255,255,255,0) 100%);
}

.ranking-item.current-user {
  background: var(--primary-light);
  border-left: 4px solid var(--primary-color);
}

.rank-number {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-secondary);
  min-width: 30px;
  text-align: center;
  margin-right: 1rem;
}

.rank-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 1rem;
}

.rank-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.rank-info {
  flex: 1;
}

.rank-username {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.rank-points {
  font-size: 0.9rem;
  color: var(--primary-color);
  font-weight: 600;
}

/* 积分兑换 */
.redeem-section {
  margin-bottom: 2rem;
}

.redeem-section h3 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.redeem-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.redeem-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  transition: transform var(--transition-speed) ease;
}

.redeem-item:hover {
  transform: translateY(-2px);
}

.redeem-item.can-redeem {
  border: 2px solid var(--success-border);
}

.redeem-item.cannot-redeem {
  opacity: 0.7;
}

.redeem-icon {
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--background-secondary);
  border-radius: 50%;
}

.redeem-info {
  flex: 1;
}

.redeem-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.redeem-description {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.redeem-cost {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--primary-color);
}

.redeem-btn {
  padding: 0.75rem 1rem;
  white-space: nowrap;
}

/* 加载动画 */
.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;
  vertical-align: middle;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .lyrics-game-container {
    padding: 1rem;
  }
  
  .game-stats {
    flex-direction: column;
    gap: 1rem;
  }
  
  .stat-item {
    min-width: auto;
  }
  
  .game-main {
    padding: 1.5rem;
  }
  
  .current-lyric {
    font-size: 1.2rem;
    min-height: 60px;
  }
  
  .user-input-area {
    flex-direction: column;
  }
  
  .game-progress {
    flex-direction: column;
    align-items: center;
  }
  
  .game-actions {
    flex-direction: column;
  }
  
  .ranking-list {
    max-height: 300px;
  }
  
  .redeem-list {
    grid-template-columns: 1fr;
  }
  
  .redeem-item {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .lyrics-display {
    padding: 1rem;
  }
  
  .current-lyric {
    font-size: 1.1rem;
  }
  
  .song-title {
    font-size: 1.1rem;
  }
  
  .game-ended h3 {
    font-size: 1.3rem;
  }
  
  .end-icon {
    font-size: 3rem;
  }
}
</style>