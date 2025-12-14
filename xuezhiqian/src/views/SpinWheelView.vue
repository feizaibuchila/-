<template>
  <div class="spin-wheel-container">
    <!-- 导航栏 -->
    <Navbar />
    
    <!-- 页面内容 -->
    <main class="spin-wheel-main-content">
      <section class="spin-wheel-header">
        <h1>幸运转盘</h1>
        <p>试试你的运气，赢取薛之谦周边好礼</p>
        <div class="user-points">
          <span class="points-icon">🎯</span>
          <span class="points-text">当前积分：{{ userPoints }}</span>
        </div>
      </section>
      
      <section class="spin-wheel-section">
        <div class="wheel-container">
          <div 
            class="wheel" 
            :class="{ spinning: isSpinning }"
            :style="{ transform: `rotate(${rotation}deg)` }"
          >
            <div v-for="(prize, index) in prizes" :key="prize.id" class="wheel-section" :style="getSectionStyle(index)">
              <div class="prize-name">{{ prize.name }}</div>
              <div class="prize-icon">{{ prize.icon }}</div>
            </div>
          </div>
          <div class="wheel-center"></div>
          <div class="wheel-arrow"></div>
        </div>
        
        <div class="spin-controls">
          <button 
            class="spin-btn" 
            :disabled="isSpinning || userPoints < spinCost"
            @click="startSpin"
          >
            {{ isSpinning ? '转盘ing...' : `开始抽奖 (消耗${spinCost}积分)` }}
          </button>
          <p class="spin-hint" v-if="userPoints < spinCost">积分不足，无法抽奖</p>
        </div>
      </section>
      
      <section class="prize-list-section">
        <h2>奖品列表</h2>
        <div class="prize-list">
          <div class="prize-item" v-for="prize in prizes" :key="prize.id">
            <div class="prize-icon-large">{{ prize.icon }}</div>
            <div class="prize-info">
              <h3 class="prize-title">{{ prize.name }}</h3>
              <p class="prize-probability">中奖概率：{{ prize.probability }}%</p>
              <p class="prize-count" v-if="prize.remaining > 0">剩余数量：{{ prize.remaining }}</p>
              <p class="prize-count prize-count-none" v-else>已兑完</p>
            </div>
          </div>
        </div>
      </section>
      
      <section class="history-section">
        <h2>中奖记录</h2>
        <div class="history-list" v-if="history.length > 0">
          <div class="history-item" v-for="record in history" :key="record.id">
            <div class="history-time">{{ record.time }}</div>
            <div class="history-prize">{{ record.prize }}</div>
          </div>
        </div>
        <div class="no-history" v-else>
          <p>暂无中奖记录</p>
        </div>
      </section>
    </main>
    
    <!-- 中奖弹窗 -->
    <div class="modal" v-if="showResultModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ resultType === 'win' ? '恭喜中奖！' : '谢谢参与' }}</h2>
        </div>
        <div class="modal-body">
          <div class="result-icon">{{ resultIcon }}</div>
          <p class="result-message">{{ resultMessage }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" @click="closeResultModal">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import Navbar from '../components/Navbar.vue';

export default {
  name: 'SpinWheelView',
  components: {
    Navbar
  },
  setup() {
    const isSpinning = ref(false);
    const rotation = ref(0);
    const userPoints = ref(100);
    const spinCost = ref(10);
    const showResultModal = ref(false);
    const resultType = ref(''); // 'win' 或 'lose'
    const resultMessage = ref('');
    const resultIcon = ref('');
    const prizes = ref([]);
    const history = ref([]);
    
    // 模拟奖品数据
    const mockPrizes = [
      { id: 1, name: '薛之谦签名CD', icon: '💿', probability: 5, remaining: 5, color: '#FF6B6B' },
      { id: 2, name: '薛之谦演唱会门票', icon: '🎫', probability: 2, remaining: 2, color: '#4ECDC4' },
      { id: 3, name: '薛之谦周边T恤', icon: '👕', probability: 10, remaining: 10, color: '#45B7D1' },
      { id: 4, name: '50积分', icon: '🎯', probability: 20, remaining: 999, color: '#96CEB4' },
      { id: 5, name: '谢谢参与', icon: '🤝', probability: 40, remaining: 999, color: '#FFEAA7' },
      { id: 6, name: '薛之谦海报', icon: '🖼️', probability: 15, remaining: 20, color: '#DDA0DD' },
      { id: 7, name: '100积分', icon: '🎯', probability: 5, remaining: 999, color: '#98D8C8' },
      { id: 8, name: '薛之谦手办', icon: '🎎', probability: 3, remaining: 8, color: '#F7DC6F' }
    ];
    
    // 模拟中奖记录
    const mockHistory = [
      { id: 1, time: '2023-06-10 14:30', prize: '50积分' },
      { id: 2, time: '2023-06-08 10:15', prize: '谢谢参与' },
      { id: 3, time: '2023-06-05 19:45', prize: '薛之谦海报' }
    ];
    
    // 获取扇形区域样式
    const getSectionStyle = (index) => {
      const angle = 360 / prizes.value.length;
      const rotate = index * angle;
      const prize = prizes.value[index];
      
      return {
        transform: `rotate(${rotate}deg) translateY(-100%)`,
        backgroundColor: prize.color
      };
    };
    
    // 开始抽奖
    const startSpin = () => {
      if (isSpinning.value || userPoints.value < spinCost.value) return;
      
      isSpinning.value = true;
      userPoints.value -= spinCost.value;
      
      // 随机决定中奖结果
      const random = Math.random() * 100;
      let selectedPrize = null;
      let cumulativeProbability = 0;
      
      for (const prize of prizes.value) {
        cumulativeProbability += prize.probability;
        if (random <= cumulativeProbability) {
          selectedPrize = prize;
          break;
        }
      }
      
      // 计算旋转角度（3-5圈 + 目标奖品位置）
      const prizeIndex = prizes.value.findIndex(p => p.id === selectedPrize.id);
      const baseRotation = rotation.value + Math.floor(Math.random() * 3 + 3) * 360;
      const targetAngle = 360 - (prizeIndex * (360 / prizes.value.length)) - (360 / prizes.value.length / 2);
      const finalRotation = baseRotation + targetAngle;
      
      // 执行旋转动画
      rotation.value = finalRotation;
      
      // 延迟显示结果
      setTimeout(() => {
        isSpinning.value = false;
        
        // 更新奖品剩余数量
        if (selectedPrize.id !== 5 && selectedPrize.remaining > 0) {
          selectedPrize.remaining--;
        }
        
        // 添加到历史记录
        const newRecord = {
          id: Date.now(),
          time: new Date().toLocaleString('zh-CN'),
          prize: selectedPrize.name
        };
        history.value.unshift(newRecord);
        
        // 更新积分（如果中奖的是积分）
        if (selectedPrize.name.includes('积分')) {
          const points = parseInt(selectedPrize.name);
          userPoints.value += points;
        }
        
        // 显示结果弹窗
        resultType.value = selectedPrize.id === 5 ? 'lose' : 'win';
        resultMessage.value = selectedPrize.id === 5 ? '再接再厉，下次再来！' : `恭喜获得${selectedPrize.name}！`;
        resultIcon.value = selectedPrize.icon;
        showResultModal.value = true;
      }, 5000);
    };
    
    // 关闭结果弹窗
    const closeResultModal = () => {
      showResultModal.value = false;
    };
    
    onMounted(() => {
      // 模拟数据加载
      prizes.value = mockPrizes;
      history.value = mockHistory;
    });
    
    return {
      isSpinning,
      rotation,
      userPoints,
      spinCost,
      showResultModal,
      resultType,
      resultMessage,
      resultIcon,
      prizes,
      history,
      getSectionStyle,
      startSpin,
      closeResultModal
    };
  }
};
</script>

<style scoped>
.spin-wheel-container {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.spin-wheel-main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.spin-wheel-header {
  text-align: center;
  margin-bottom: 60px;
}

.spin-wheel-header h1 {
  font-size: 36px;
  color: #333;
  margin-bottom: 16px;
}

.spin-wheel-header p {
  font-size: 18px;
  color: #666;
  margin-bottom: 24px;
}

.user-points {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  background: white;
  border-radius: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.points-icon {
  font-size: 24px;
}

.points-text {
  font-size: 18px;
  font-weight: bold;
  color: #ff6b6b;
}

.spin-wheel-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 80px;
}

.wheel-container {
  position: relative;
  width: 400px;
  height: 400px;
  margin-bottom: 40px;
}

.wheel {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: relative;
  transition: transform 5s ease-out;
  overflow: hidden;
  border: 8px solid #fff;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

.wheel-section {
  position: absolute;
  width: 50%;
  height: 50%;
  transform-origin: bottom right;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
}

.prize-name {
  font-weight: bold;
  color: white;
  text-align: center;
  font-size: 14px;
  margin-bottom: 8px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.prize-icon {
  font-size: 24px;
}

.wheel-center {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #ff6b6b;
  transform: translate(-50%, -50%);
  z-index: 10;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.wheel-arrow {
  position: absolute;
  top: 20px;
  left: 50%;
  width: 0;
  height: 0;
  border-left: 20px solid transparent;
  border-right: 20px solid transparent;
  border-bottom: 40px solid #ff6b6b;
  transform: translateX(-50%);
  z-index: 5;
}

.spin-controls {
  text-align: center;
}

.spin-btn {
  padding: 16px 48px;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.spin-btn:hover:not(:disabled) {
  background: #ff5252;
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
}

.spin-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.spin-hint {
  color: #ff6b6b;
  font-size: 16px;
  margin-top: 16px;
}

.prize-list-section h2,
.history-section h2 {
  font-size: 28px;
  margin-bottom: 30px;
  color: #333;
  text-align: center;
}

.prize-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 80px;
}

.prize-item {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.prize-icon-large {
  font-size: 48px;
}

.prize-info h3 {
  font-size: 18px;
  margin: 0 0 8px 0;
  color: #333;
}

.prize-probability,
.prize-count {
  font-size: 14px;
  color: #666;
  margin: 4px 0;
}

.prize-count-none {
  color: #ff6b6b;
}

.history-list {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.history-item {
  display: flex;
  justify-content: space-between;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.history-item:last-child {
  border-bottom: none;
}

.history-time {
  color: #666;
  font-size: 16px;
}

.history-prize {
  color: #ff6b6b;
  font-weight: bold;
  font-size: 16px;
}

.no-history {
  text-align: center;
  padding: 60px 0;
  color: #999;
  font-size: 18px;
}

/* 弹窗样式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  max-width: 400px;
  width: 90%;
}

.modal-header h2 {
  font-size: 28px;
  margin: 0 0 30px 0;
  color: #ff6b6b;
}

.result-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.result-message {
  font-size: 20px;
  color: #333;
  margin-bottom: 30px;
}

.btn {
  padding: 12px 36px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-primary {
  background-color: #ff6b6b;
  color: white;
}

.btn-primary:hover {
  background-color: #ff5252;
  transform: translateY(-2px);
}

@media (max-width: 480px) {
  .wheel-container {
    width: 300px;
    height: 300px;
  }
  
  .prize-name {
    font-size: 12px;
  }
  
  .prize-icon {
    font-size: 20px;
  }
}
</style>