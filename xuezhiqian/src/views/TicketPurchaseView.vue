<template>
  <div class="ticket-purchase-container">
    <!-- 导航栏 -->
    <Navbar />
    
    <!-- 页面标题 -->
    <div class="page-header">
      <button @click="goBack" class="back-btn">← 返回</button>
      <h1>🎫 演唱会门票购买</h1>
    </div>
    
    <!-- 演唱会信息 -->
    <div class="concert-info-section card">
      <div class="concert-info-header">
        <div class="concert-main-info">
          <h2>{{ currentConcert.title }}</h2>
          <div class="concert-meta">
            <span class="meta-item"><i class="icon">📅</i> {{ currentConcert.date }}</span>
            <span class="meta-item"><i class="icon">📍</i> {{ currentConcert.location }}</span>
          </div>
        </div>
        <div class="ticket-status" :class="currentConcert.ticketStatus === '预售中' ? 'presale' : 'coming'">
          {{ currentConcert.ticketStatus }}
        </div>
      </div>
    </div>
    
    <!-- 座位选择区域 -->
    <div class="seat-selection-section">
      <!-- 票价选择 -->
      <div class="price-selection">
        <h3>选择票价</h3>
        <div class="price-options">
          <button 
            v-for="price in ticketPrices" 
            :key="price.level"
            class="price-option"
            :class="{ active: selectedPrice === price.level }"
            @click="selectPriceLevel(price.level)"
            :disabled="price.available === 0"
          >
            <span class="price-level">{{ price.name }}</span>
            <span class="price-amount">{{ price.price }} 元</span>
            <span class="price-availability" :class="price.available < 10 ? 'low' : ''">
              {{ price.available > 0 ? `剩余 ${price.available} 张` : '已售罄' }}
            </span>
          </button>
        </div>
      </div>
      
      <!-- 座位图 -->
      <div class="seat-map-section" v-if="selectedPrice">
        <h3>{{ getCurrentPrice().name }} 区域座位图</h3>
        
        <div class="stage-indicator">
          舞台区域
        </div>
        
        <div class="seat-map-container">
          <div class="seat-map">
            <div 
              v-for="(row, rowIndex) in seatMap" 
              :key="rowIndex"
              class="seat-row"
            >
              <div class="row-label">{{ String.fromCharCode(65 + rowIndex) }}</div>
              <div class="seats">
                <div 
                  v-for="(seat, seatIndex) in row" 
                  :key="seatIndex"
                  class="seat"
                  :class="{
                    'available': seat.status === 'available',
                    'selected': seat.status === 'selected',
                    'unavailable': seat.status === 'unavailable'
                  }"
                  @click="toggleSeatSelection(rowIndex, seatIndex)"
                >
                  {{ seatIndex + 1 }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="seat-legend">
          <div class="legend-item">
            <div class="legend-color available"></div>
            <span>可选</span>
          </div>
          <div class="legend-item">
            <div class="legend-color selected"></div>
            <span>已选</span>
          </div>
          <div class="legend-item">
            <div class="legend-color unavailable"></div>
            <span>已售</span>
          </div>
        </div>
        
        <div class="selected-seats-info">
          <p>已选座位：
            <span v-if="selectedSeats.length === 0">无</span>
            <span v-else>{{ selectedSeats.join(', ') }}</span>
          </p>
          <p>总票数：{{ selectedSeats.length }} 张</p>
          <p>总价：{{ totalPrice }} 元</p>
        </div>
      </div>
    </div>
    
    <!-- 购买按钮 -->
    <div class="purchase-section" v-if="selectedSeats.length > 0">
      <div class="purchase-summary">
        <div class="summary-info">
          <span>已选 {{ selectedSeats.length }} 张票</span>
          <span class="total-price">总价：{{ totalPrice }} 元</span>
        </div>
        <button 
          class="buy-now-btn"
          @click="showPaymentModal = true"
        >
          立即购买
        </button>
      </div>
    </div>
    
    <!-- 支付方式弹窗 -->
    <div class="modal-overlay" v-if="showPaymentModal" @click="closePaymentModal">
      <div class="payment-modal" @click.stop>
        <div class="modal-header">
          <h3>选择支付方式</h3>
          <button class="close-btn" @click="closePaymentModal">×</button>
        </div>
        
        <div class="modal-body">
          <div class="payment-options">
            <div class="payment-option" @click="selectPaymentMethod('wechat')">
              <div class="payment-icon wechat">💚</div>
              <div class="payment-info">
                <h4>微信支付</h4>
                <p>使用微信扫码支付</p>
              </div>
              <div class="payment-check" :class="{ active: selectedPaymentMethod === 'wechat' }"></div>
            </div>
            
            <div class="payment-option" @click="selectPaymentMethod('alipay')">
              <div class="payment-icon alipay">💙</div>
              <div class="payment-info">
                <h4>支付宝</h4>
                <p>使用支付宝扫码支付</p>
              </div>
              <div class="payment-check" :class="{ active: selectedPaymentMethod === 'alipay' }"></div>
            </div>
            
            <div class="payment-option" @click="selectPaymentMethod('points')">
              <div class="payment-icon points">⭐</div>
              <div class="payment-info">
                <h4>积分支付</h4>
                <p>当前积分：{{ userPoints }} 点</p>
              </div>
              <div 
                class="payment-check" 
                :class="{ 
                  active: selectedPaymentMethod === 'points',
                  disabled: userPoints < totalPointsRequired 
                }"
              ></div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button 
            class="btn btn-outline"
            @click="closePaymentModal"
          >
            取消
          </button>
          <button 
            class="btn confirm-payment-btn"
            @click="confirmPayment"
            :disabled="!selectedPaymentMethod"
          >
            确认支付
          </button>
        </div>
      </div>
    </div>
    
    <!-- 支付结果弹窗 -->
    <div class="modal-overlay" v-if="showResultModal" @click="closeResultModal">
      <div class="result-modal" @click.stop>
        <div class="result-icon" :class="paymentSuccess ? 'success' : 'error'">
          {{ paymentSuccess ? '✅' : '❌' }}
        </div>
        <h3>{{ paymentSuccess ? '购票成功！' : '操作失败' }}</h3>
        <p>{{ paymentResultMessage }}</p>
        
        <div class="result-actions">
          <button 
            class="btn"
            @click="closeResultModal"
          >
            {{ paymentSuccess ? '查看我的门票' : '返回' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from '../components/Navbar.vue';
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '../store/index';

export default {
  name: 'TicketPurchaseView',
  components: {
    Navbar
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const userStore = useUserStore();
    
    // 状态
    const concertId = ref(Number(route.params.id));
    const selectedPrice = ref(null);
    const seatMap = ref([]);
    const selectedSeats = ref([]);
    const showPaymentModal = ref(false);
    const showResultModal = ref(false);
    const selectedPaymentMethod = ref(null);
    const paymentSuccess = ref(false);
    const paymentResultMessage = ref('');
    const userPoints = ref(5000); // 模拟用户积分
    
    // 演唱会数据
    const concerts = ref([
      {
        id: 1,
        title: '薛之谦「天外来物」世界巡回演唱会 - 上海站',
        date: '2024-06-15',
        location: '上海虹口足球场',
        ticketStatus: '预售中'
      },
      {
        id: 2,
        title: '薛之谦「天外来物」世界巡回演唱会 - 北京站',
        date: '2024-07-20',
        location: '北京工人体育场',
        ticketStatus: '预售中'
      },
      {
        id: 3,
        title: '薛之谦「天外来物」世界巡回演唱会 - 广州站',
        date: '2024-08-25',
        location: '广州天河体育场',
        ticketStatus: '预售中'
      }
    ]);
    
    // 票价数据
    const ticketPrices = ref([
      {
        level: 'vip',
        name: 'VIP区',
        price: 1980,
        available: 30,
        pointsRate: 2 // 积分兑换比例
      },
      {
        level: 'a',
        name: 'A区',
        price: 1380,
        available: 85,
        pointsRate: 2
      },
      {
        level: 'b',
        name: 'B区',
        price: 880,
        available: 156,
        pointsRate: 2
      },
      {
        level: 'c',
        name: 'C区',
        price: 580,
        available: 210,
        pointsRate: 2
      },
      {
        level: 'd',
        name: 'D区',
        price: 380,
        available: 25,
        pointsRate: 2
      }
    ]);
    
    // 计算属性
    const currentConcert = computed(() => {
      return concerts.value.find(c => c.id === concertId.value) || concerts.value[0];
    });
    
    const getCurrentPrice = () => {
      return ticketPrices.value.find(p => p.level === selectedPrice.value) || ticketPrices.value[0];
    };
    
    const totalPrice = computed(() => {
      if (!selectedPrice.value) return 0;
      const price = getCurrentPrice();
      return price.price * selectedSeats.value.length;
    });
    
    const totalPointsRequired = computed(() => {
      if (!selectedPrice.value) return 0;
      const price = getCurrentPrice();
      return price.price * selectedSeats.value.length * price.pointsRate;
    });
    
    // 方法
    const goBack = () => {
      router.back();
    };
    
    const selectPriceLevel = (level) => {
      selectedPrice.value = level;
      selectedSeats.value = [];
      generateSeatMap();
    };
    
    const generateSeatMap = () => {
      // 生成模拟座位图（根据票价等级生成不同数量的座位）
      const rows = selectedPrice.value === 'vip' ? 4 : 8;
      const seatsPerRow = selectedPrice.value === 'vip' ? 10 : 20;
      
      const map = [];
      for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j < seatsPerRow; j++) {
          // 随机生成一些已售出的座位
          const isSold = Math.random() > 0.7;
          row.push({
            status: isSold ? 'unavailable' : 'available'
          });
        }
        map.push(row);
      }
      
      seatMap.value = map;
    };
    
    const toggleSeatSelection = (rowIndex, seatIndex) => {
      const seat = seatMap.value[rowIndex][seatIndex];
      if (seat.status === 'unavailable') return;
      
      if (seat.status === 'available') {
        seat.status = 'selected';
        const seatLabel = `${String.fromCharCode(65 + rowIndex)}${seatIndex + 1}`;
        selectedSeats.value.push(seatLabel);
      } else {
        seat.status = 'available';
        const seatLabel = `${String.fromCharCode(65 + rowIndex)}${seatIndex + 1}`;
        selectedSeats.value = selectedSeats.value.filter(s => s !== seatLabel);
      }
    };
    
    const selectPaymentMethod = (method) => {
      if (method === 'points' && userPoints.value < totalPointsRequired.value) {
        return;
      }
      selectedPaymentMethod.value = method;
    };
    
    const closePaymentModal = () => {
      showPaymentModal.value = false;
      selectedPaymentMethod.value = null;
    };
    
    const confirmPayment = () => {
      if (!selectedPaymentMethod.value) return;
      
      closePaymentModal();
      
      if (selectedPaymentMethod.value === 'points') {
        // 积分支付逻辑
        if (userPoints.value >= totalPointsRequired.value) {
          userPoints.value -= totalPointsRequired.value;
          paymentSuccess.value = true;
          paymentResultMessage.value = `恭喜您，使用 ${totalPointsRequired.value} 积分成功购买门票！`;
          
          // 保存购票记录
          saveTicketPurchase();
        } else {
          paymentSuccess.value = false;
          paymentResultMessage.value = '积分不足，请选择其他支付方式';
        }
      } else if (selectedPaymentMethod.value === 'wechat' || selectedPaymentMethod.value === 'alipay') {
        // 模拟第三方支付
        paymentSuccess.value = true;
        paymentResultMessage.value = `请先绑定${selectedPaymentMethod.value === 'wechat' ? '微信' : '支付宝'}账号，支付成功！`;
        
        // 保存购票记录
        saveTicketPurchase();
      }
      
      showResultModal.value = true;
    };
    
    const saveTicketPurchase = () => {
      // 模拟保存购票记录
      const ticketRecord = {
        id: Date.now(),
        concertId: concertId.value,
        concertTitle: currentConcert.value.title,
        date: currentConcert.value.date,
        location: currentConcert.value.location,
        seats: [...selectedSeats.value],
        price: totalPrice.value,
        purchaseTime: new Date().toISOString(),
        status: '已支付',
        paymentMethod: selectedPaymentMethod.value
      };
      
      // 保存到本地存储
      let tickets = JSON.parse(localStorage.getItem('userTickets') || '[]');
      tickets.push(ticketRecord);
      localStorage.setItem('userTickets', JSON.stringify(tickets));
    };
    
    const closeResultModal = () => {
      showResultModal.value = false;
      if (paymentSuccess.value) {
        router.push('/my-tickets');
      }
    };
    
    // 生命周期
    onMounted(() => {
      // 默认选中VIP区
      if (ticketPrices.value.length > 0) {
        selectPriceLevel('vip');
      }
    });
    
    return {
      concertId,
      currentConcert,
      ticketPrices,
      selectedPrice,
      seatMap,
      selectedSeats,
      totalPrice,
      totalPointsRequired,
      showPaymentModal,
      showResultModal,
      selectedPaymentMethod,
      paymentSuccess,
      paymentResultMessage,
      userPoints,
      goBack,
      selectPriceLevel,
      toggleSeatSelection,
      selectPaymentMethod,
      closePaymentModal,
      confirmPayment,
      closeResultModal,
      getCurrentPrice
    };
  }
};
</script>

<style scoped>
.ticket-purchase-container {
  min-height: 100vh;
  background-color: var(--background-secondary);
}

.page-header {
  padding: 2rem 1rem;
  background-color: white;
  border-bottom: 1px solid #eee;
  position: relative;
}

.page-header h1 {
  text-align: center;
  margin: 0;
  color: var(--text-primary);
}

.back-btn {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  color: var(--text-primary);
}

.concert-info-section {
  max-width: 1200px;
  margin: 1rem auto;
  padding: 0 1rem;
}

.concert-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.concert-main-info h2 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.concert-meta {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
}

.ticket-status {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: bold;
}

.ticket-status.presale {
  background-color: #e74c3c;
  color: white;
}

.ticket-status.coming {
  background-color: #3498db;
  color: white;
}

.seat-selection-section {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.price-selection h3,
.seat-map-section h3 {
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.price-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.price-option {
  padding: 1rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: white;
  text-align: center;
}

.price-option:hover:not(:disabled) {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.price-option.active {
  border-color: var(--primary-color);
  background-color: rgba(52, 152, 219, 0.1);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);
}

.price-option:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.price-level {
  display: block;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.price-amount {
  display: block;
  font-size: 1.2rem;
  font-weight: bold;
  color: #e74c3c;
  margin-bottom: 0.5rem;
}

.price-availability {
  display: block;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.price-availability.low {
  color: #e67e22;
}

.seat-map-section {
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.stage-indicator {
  text-align: center;
  padding: 1rem;
  background-color: #333;
  color: white;
  border-radius: 8px;
  margin-bottom: 2rem;
  font-weight: bold;
}

.seat-map-container {
  overflow-x: auto;
  margin-bottom: 1rem;
}

.seat-map {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.seat-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.row-label {
  width: 20px;
  text-align: center;
  font-weight: bold;
  color: var(--text-primary);
}

.seats {
  display: flex;
  gap: 2px;
  flex-wrap: wrap;
}

.seat {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.seat.available {
  background-color: #2ecc71;
  color: white;
}

.seat.available:hover {
  background-color: #27ae60;
  transform: scale(1.1);
}

.seat.selected {
  background-color: #e74c3c;
  color: white;
}

.seat.unavailable {
  background-color: #95a5a6;
  color: #7f8c8d;
  cursor: not-allowed;
}

.seat-legend {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin: 1rem 0;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 3px;
}

.legend-color.available {
  background-color: #2ecc71;
}

.legend-color.selected {
  background-color: #e74c3c;
}

.legend-color.unavailable {
  background-color: #95a5a6;
}

.selected-seats-info {
  background-color: var(--background-secondary);
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.selected-seats-info p {
  margin: 0.5rem 0;
  color: var(--text-primary);
}

.purchase-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  border-top: 1px solid #eee;
  padding: 1rem;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.purchase-summary {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.total-price {
  font-size: 1.2rem;
  font-weight: bold;
  color: #e74c3c;
}

.buy-now-btn {
  padding: 0.8rem 2rem;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.buy-now-btn:hover {
  background-color: #c0392b;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.payment-modal,
.result-modal {
  background-color: white;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 1.5rem;
}

.payment-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.payment-option {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 2px solid #eee;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.payment-option:hover {
  border-color: var(--primary-color);
  background-color: rgba(52, 152, 219, 0.05);
}

.payment-icon {
  font-size: 2rem;
  margin-right: 1rem;
}

.payment-info h4 {
  margin: 0 0 0.25rem 0;
  color: var(--text-primary);
}

.payment-info p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.payment-check {
  position: absolute;
  right: 1rem;
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.payment-check.active {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.payment-check.active::after {
  content: '✓';
  color: white;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.8rem;
}

.payment-check.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem 1.5rem;
  border-top: 1px solid #eee;
}

.confirm-payment-btn {
  background-color: var(--primary-color);
  color: white;
}

.confirm-payment-btn:hover:not(:disabled) {
  background-color: var(--primary-color-dark);
}

.confirm-payment-btn:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.result-modal {
  text-align: center;
  padding: 2rem;
}

.result-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.result-icon.success {
  color: #2ecc71;
}

.result-icon.error {
  color: #e74c3c;
}

.result-modal h3 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.result-modal p {
  margin: 0 0 1.5rem 0;
  color: var(--text-secondary);
}

.result-actions {
  display: flex;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .concert-info-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .concert-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .price-options {
    grid-template-columns: 1fr;
  }
  
  .seat-map-section {
    padding: 1rem;
  }
  
  .seat {
    width: 25px;
    height: 25px;
    font-size: 0.7rem;
  }
  
  .seat-legend {
    gap: 1rem;
  }
  
  .purchase-summary {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .summary-info {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
  
  .buy-now-btn {
    width: 100%;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .modal-footer .btn {
    width: 100%;
  }
}
</style>