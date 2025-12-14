<template>
  <div class="spin-wheel-container">
    <div class="wheel-section">
      <div 
        class="wheel" 
        :style="{ transform: `rotate(${rotation}deg)` }"
        :class="{ spinning: isSpinning }"
      >
        <div 
          v-for="(segment, index) in segments" 
          :key="index" 
          class="wheel-segment"
          :style="{
            transform: `rotate(${index * anglePerSegment}deg)`,
            '--background-color': segment.color
          }"
        >
          <span class="segment-text">{{ segment.text }}</span>
        </div>
        <div class="wheel-center"></div>
      </div>
      <div class="wheel-pointer"></div>
      <button 
        class="spin-button" 
        @click="spinWheel" 
        :disabled="isSpinning"
      >
        {{ isSpinning ? '旋转中...' : '开始抽奖' }}
      </button>
    </div>
    
    <div class="config-section">
      <h3>配置转盘内容</h3>
      <div 
        v-for="(segment, index) in segments" 
        :key="index" 
        class="segment-config"
      >
        <input 
          v-model="segments[index].text" 
          type="text" 
          placeholder="输入内容" 
          class="segment-input"
        >
        <input 
          v-model="segments[index].color" 
          type="color" 
          class="segment-color"
        >
        <button 
          v-if="segments.length > 2" 
          @click="removeSegment(index)" 
          class="remove-btn"
        >
          删除
        </button>
      </div>
      <button @click="addSegment" class="add-btn">添加选项</button>
      <button @click="saveConfig" class="save-btn">保存配置</button>
      <button @click="resetConfig" class="reset-btn">重置转盘</button>
    </div>
    
    <div class="result-section" v-if="result">
      <h3>抽奖结果</h3>
      <div class="result-text">{{ result }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SpinWheel',
  data() {
    return {
      rotation: 0,
      isSpinning: false,
      result: '',
      segments: [
        { text: '奖品1', color: '#FF6B6B' },
        { text: '奖品2', color: '#4ECDC4' },
        { text: '奖品3', color: '#45B7D1' },
        { text: '奖品4', color: '#F9CA24' },
        { text: '奖品5', color: '#6C5CE7' },
        { text: '奖品6', color: '#FD79A8' }
      ]
    }
  },
  computed: {
    anglePerSegment() {
      return 360 / this.segments.length
    }
  },
  created() {
    // 尝试从localStorage加载配置
    this.loadConfig()
  },
  methods: {
    spinWheel() {
      if (this.isSpinning || this.segments.length === 0) return
      
      this.isSpinning = true
      this.result = ''
      
      // 计算随机目标角度
      const randomSegment = Math.floor(Math.random() * this.segments.length)
      const targetAngle = 360 * 5 + (randomSegment * this.anglePerSegment)
      
      // 动画持续时间（毫秒）
      const duration = 5000
      
      // 记录开始时间
      const startTime = Date.now()
      const startRotation = this.rotation
      const angleDifference = targetAngle - (this.rotation % 360)
      
      // 使用requestAnimationFrame实现平滑动画
      const animate = () => {
        const currentTime = Date.now()
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // 使用缓动函数
        let easeOutProgress = 1 - Math.pow(1 - progress, 3)
        
        this.rotation = startRotation + angleDifference * easeOutProgress
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          // 确保最终角度准确
          this.rotation = startRotation + angleDifference
          this.isSpinning = false
          this.result = this.segments[randomSegment].text
          
          // 震动效果
          this.$el.querySelector('.wheel').classList.add('shake')
          setTimeout(() => {
            this.$el.querySelector('.wheel').classList.remove('shake')
          }, 500)
        }
      }
      
      animate()
    },
    
    addSegment() {
      if (this.segments.length >= 12) {
        alert('最多只能添加12个选项')
        return
      }
      this.segments.push({
        text: `奖品${this.segments.length + 1}`,
        color: this.getRandomColor()
      })
    },
    
    removeSegment(index) {
      if (this.segments.length <= 2) {
        alert('至少需要保留2个选项')
        return
      }
      this.segments.splice(index, 1)
    },
    
    getRandomColor() {
      const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#F9CA24', 
        '#6C5CE7', '#FD79A8', '#00B894', '#FDCB6E',
        '#E17055', '#74B9FF', '#A29BFE', '#FF7675'
      ]
      return colors[Math.floor(Math.random() * colors.length)]
    },
    
    saveConfig() {
      try {
        localStorage.setItem('spinWheelConfig', JSON.stringify(this.segments))
        alert('配置已保存')
      } catch (error) {
        alert('保存配置失败')
        console.error('保存配置失败:', error)
      }
    },
    
    loadConfig() {
      try {
        const saved = localStorage.getItem('spinWheelConfig')
        if (saved) {
          this.segments = JSON.parse(saved)
        }
      } catch (error) {
        console.error('加载配置失败:', error)
      }
    },
    
    resetConfig() {
      if (confirm('确定要重置转盘吗？')) {
        localStorage.removeItem('spinWheelConfig')
        this.segments = [
          { text: '奖品1', color: '#FF6B6B' },
          { text: '奖品2', color: '#4ECDC4' },
          { text: '奖品3', color: '#45B7D1' },
          { text: '奖品4', color: '#F9CA24' },
          { text: '奖品5', color: '#6C5CE7' },
          { text: '奖品6', color: '#FD79A8' }
        ]
        this.rotation = 0
        this.result = ''
      }
    }
  }
}
</script>

<style scoped>
.spin-wheel-container {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  justify-content: center;
  padding: 20px;
  font-family: 'Arial', sans-serif;
}

.wheel-section {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.wheel {
  position: relative;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  overflow: hidden;
  border: 8px solid #333;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  transition: transform 0s ease-out;
  will-change: transform;
}

.wheel.spinning {
  transition: transform 5s cubic-bezier(0.1, 0.7, 0.1, 1);
}

.wheel.shake {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: rotate(var(--rotation)) translateX(0); }
  25% { transform: rotate(var(--rotation)) translateX(-5px); }
  75% { transform: rotate(var(--rotation)) translateX(5px); }
}

.wheel-segment {
  position: absolute;
  width: 100%;
  height: 100%;
  transform-origin: center;
  clip-path: polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 50% 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--background-color);
  color: white;
  font-weight: bold;
  font-size: 16px;
  text-align: center;
  padding: 0 60px;
  box-sizing: border-box;
  writing-mode: vertical-rl;
  text-orientation: mixed;
}

.segment-text {
  max-width: 80px;
  word-wrap: break-word;
  transform: rotate(180deg);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.wheel-center {
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #333;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.5);
}

.wheel-pointer {
  position: absolute;
  top: -20px;
  width: 0;
  height: 0;
  border-left: 20px solid transparent;
  border-right: 20px solid transparent;
  border-bottom: 30px solid #e74c3c;
  z-index: 2;
}

.spin-button {
  margin-top: 40px;
  padding: 15px 30px;
  font-size: 18px;
  font-weight: bold;
  color: white;
  background-color: #e74c3c;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(231, 76, 60, 0.4);
}

.spin-button:hover:not(:disabled) {
  background-color: #c0392b;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(231, 76, 60, 0.6);
}

.spin-button:active:not(:disabled) {
  transform: translateY(0);
}

.spin-button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
  box-shadow: none;
}

.config-section {
  width: 300px;
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.config-section h3 {
  margin-top: 0;
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
}

.segment-config {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  gap: 10px;
  padding: 10px;
  background-color: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.segment-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.segment-color {
  width: 40px;
  height: 36px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-btn, .save-btn, .reset-btn, .remove-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.add-btn {
  width: 100%;
  background-color: #27ae60;
  color: white;
  margin-bottom: 10px;
}

.add-btn:hover {
  background-color: #219a52;
}

.save-btn {
  width: 100%;
  background-color: #3498db;
  color: white;
  margin-bottom: 10px;
}

.save-btn:hover {
  background-color: #2980b9;
}

.reset-btn {
  width: 100%;
  background-color: #e67e22;
  color: white;
}

.reset-btn:hover {
  background-color: #d35400;
}

.remove-btn {
  background-color: #e74c3c;
  color: white;
  padding: 6px 12px;
}

.remove-btn:hover {
  background-color: #c0392b;
}

.result-section {
  width: 100%;
  max-width: 700px;
  text-align: center;
  margin-top: 20px;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.result-section h3 {
  margin-top: 0;
  color: #2c3e50;
}

.result-text {
  font-size: 24px;
  font-weight: bold;
  color: #e74c3c;
  animation: resultPop 0.5s ease-out;
}

@keyframes resultPop {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  70% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .wheel {
    width: 300px;
    height: 300px;
  }
  
  .segment-text {
    font-size: 14px;
    max-width: 60px;
  }
  
  .wheel-center {
    width: 50px;
    height: 50px;
  }
  
  .spin-wheel-container {
    flex-direction: column;
    align-items: center;
  }
  
  .config-section {
    width: 100%;
    max-width: 400px;
  }
}
</style>