<template>
  <div class="tickets-container">
    <Navbar />
    
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>演唱会门票购买</h1>
      <p>选择您心仪的座位和票价，享受精彩演出</p>
    </div>
    
    <!-- 购票内容 -->
    <div class="tickets-content">
      <!-- 返回按钮 -->
      <div class="back-section">
        <button @click="goBack" class="back-btn">
          <span class="back-icon">←</span>
          返回演唱会列表
        </button>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>正在加载演唱会信息...</p>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="error-container">
        <div class="error-icon">⚠️</div>
        <p>{{ error }}</p>
        <button @click="loadConcertData" class="retry-btn">重试</button>
      </div>
      
      <!-- 演唱会详情 -->
      <template v-else-if="concert">
        <!-- 演唱会信息卡片 -->
        <div class="concert-details-card">
          <div class="concert-main-info">
            <div class="concert-image">
              <img :src="concert.image" :alt="concert.title" />
            </div>
            <div class="concert-info">
              <h2 class="concert-title">{{ concert.title }}</h2>
              <div class="concert-meta">
                <div class="meta-item">
                  <span class="meta-icon">📅</span>
                  <span>{{ formatDate(concert.date) }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-icon">📍</span>
                  <span>{{ concert.location }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-icon">🎯</span>
                  <span>{{ concert.tourName }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-icon">🎫</span>
                  <span :class="`status-badge ${concert.ticketStatus}`">
                    {{ getStatusText(concert.ticketStatus) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 票价选择 -->
        <div class="ticket-selection">
          <h3 class="section-title">选择票价类别</h3>
          <div class="ticket-options">
            <div 
              v-for="ticket in ticketTypes" 
              :key="ticket.id"
              :class="['ticket-option', { 'selected': selectedTicketId === ticket.id, 'disabled': !ticket.available }]"
              @click="selectTicket(ticket)"
            >
              <div class="ticket-header">
                <h4 class="ticket-name">{{ ticket.name }}</h4>
                <span v-if="!ticket.available" class="sold-out">已售罄</span>
              </div>
              <div class="ticket-price">¥{{ ticket.price }}</div>
              <div class="ticket-info">
                <span class="ticket-available">剩余 {{ ticket.quantity }} 张</span>
                <span class="ticket-description">{{ ticket.description }}</span>
              </div>
              <div v-if="selectedTicketId === ticket.id" class="selected-indicator">✓ 已选择</div>
            </div>
          </div>
        </div>
        
        <!-- 数量选择 -->
        <div class="quantity-selection" v-if="selectedTicket">
          <h3 class="section-title">选择数量</h3>
          <div class="quantity-controls">
            <button 
              class="quantity-btn" 
              @click="decreaseQuantity" 
              :disabled="quantity <= 1"
            >-</button>
            <span class="quantity-display">{{ quantity }}</span>
            <button 
              class="quantity-btn" 
              @click="increaseQuantity" 
              :disabled="quantity >= maxQuantity"
            >+</button>
          </div>
          <p class="quantity-info" v-if="maxQuantity < 10">
            每人最多可购买 {{ maxQuantity }} 张票
          </p>
        </div>
        
        <!-- 购买信息摘要 -->
        <div class="purchase-summary" v-if="selectedTicket">
          <h3 class="section-title">订单摘要</h3>
          <div class="summary-details">
            <div class="summary-item">
              <span class="summary-label">票价类别：</span>
              <span class="summary-value">{{ selectedTicket.name }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">单价：</span>
              <span class="summary-value">¥{{ selectedTicket.price }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">数量：</span>
              <span class="summary-value">{{ quantity }} 张</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">小计：</span>
              <span class="summary-value total-price">¥{{ calculateTotal() }}</span>
            </div>
          </div>
          
          <!-- 购买按钮 -->
          <div class="purchase-actions">
            <button 
              class="purchase-btn" 
              @click="purchaseTickets" 
              :disabled="!canPurchase"
            >
              <span v-if="isProcessing">正在处理...</span>
              <span v-else>确认购买</span>
            </button>
          </div>
        </div>
      </template>
    </div>
    
    <!-- 成功购买提示 -->
    <div v-if="showSuccessModal" class="modal-overlay" @click.self="closeSuccessModal">
      <div class="success-modal">
        <div class="success-icon">🎉</div>
        <h3>购票成功！</h3>
        <p>您已成功购买 {{ quantity }} 张 {{ selectedTicket?.name || '' }} 门票</p>
        <div class="modal-actions">
          <button class="modal-btn primary" @click="goToMyTickets">查看我的门票</button>
          <button class="modal-btn secondary" @click="closeSuccessModal">继续购票</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Navbar from '../components/Navbar.vue'

export default {
  name: 'TicketsView',
  components: {
    Navbar
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const concertId = route.params.id
    
    const loading = ref(true)
    const error = ref('')
    const concert = ref(null)
    const selectedTicketId = ref(null)
    const quantity = ref(1)
    const isProcessing = ref(false)
    const showSuccessModal = ref(false)
    
    // 模拟票价类型数据
    const ticketTypes = ref([
      { id: 1, name: 'VIP区', price: 1280, quantity: 30, available: true, description: '近距离互动，限量纪念周边' },
      { id: 2, name: 'A区', price: 880, quantity: 120, available: true, description: '视野良好，音响效果佳' },
      { id: 3, name: 'B区', price: 580, quantity: 200, available: true, description: '性价比高，观演体验不错' },
      { id: 4, name: 'C区', price: 380, quantity: 0, available: false, description: '经济实惠，适合学生群体' }
    ])
    
    // 计算属性
    const selectedTicket = computed(() => {
      return ticketTypes.value.find(t => t.id === selectedTicketId.value)
    })
    
    const maxQuantity = computed(() => {
      if (!selectedTicket.value) return 1
      // 取剩余票量和每人限购数的最小值
      return Math.min(selectedTicket.value.quantity, 10)
    })
    
    const canPurchase = computed(() => {
      return selectedTicket.value?.available && quantity.value > 0 && !isProcessing.value
    })
    
    // 加载演唱会数据
    const loadConcertData = async () => {
      loading.value = true
      error.value = ''
      
      try {
        // 模拟API请求延迟
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // 从模拟数据中查找演唱会
        const mockConcerts = [
          { id: 1, title: '薛之谦「天外来物」巡回演唱会', date: '2024-12-25', location: '上海体育场', image: '/concert1.jpg', ticketStatus: 'presale', tourName: '天外来物', city: '上海' },
          { id: 2, title: '薛之谦「天外来物」巡回演唱会', date: '2025-01-10', location: '北京工人体育场', image: '/concert2.jpg', ticketStatus: 'onsale', tourName: '天外来物', city: '北京' },
          { id: 3, title: '薛之谦「天外来物」巡回演唱会', date: '2025-02-15', location: '广州天河体育中心', image: '/concert3.jpg', ticketStatus: 'presale', tourName: '天外来物', city: '广州' },
          { id: 4, title: '薛之谦「天外来物」巡回演唱会', date: '2025-03-08', location: '成都露天音乐公园', image: '/concert4.jpg', ticketStatus: 'onsale', tourName: '天外来物', city: '成都' },
          { id: 5, title: '薛之谦「天外来物」巡回演唱会', date: '2025-04-20', location: '杭州奥体中心', image: '/concert5.jpg', ticketStatus: 'presale', tourName: '天外来物', city: '杭州' },
          { id: 6, title: '薛之谦「天外来物」巡回演唱会', date: '2025-05-15', location: '武汉体育中心', image: '/concert6.jpg', ticketStatus: 'onsale', tourName: '天外来物', city: '武汉' }
        ]
        
        const foundConcert = mockConcerts.find(c => c.id === parseInt(concertId))
        
        if (foundConcert) {
          concert.value = foundConcert
        } else {
          throw new Error('演唱会信息未找到')
        }
      } catch (err) {
        error.value = err.message || '加载演唱会信息失败'
      } finally {
        loading.value = false
      }
    }
    
    // 选择票种
    const selectTicket = (ticket) => {
      if (ticket.available) {
        selectedTicketId.value = ticket.id
        quantity.value = 1
      }
    }
    
    // 增加数量
    const increaseQuantity = () => {
      if (quantity.value < maxQuantity.value) {
        quantity.value++
      }
    }
    
    // 减少数量
    const decreaseQuantity = () => {
      if (quantity.value > 1) {
        quantity.value--
      }
    }
    
    // 计算总价
    const calculateTotal = () => {
      if (!selectedTicket.value) return 0
      return selectedTicket.value.price * quantity.value
    }
    
    // 购买门票
    const purchaseTickets = async () => {
      if (!canPurchase.value) return
      
      isProcessing.value = true
      
      try {
        // 模拟API请求延迟
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // 更新票量
        const ticket = ticketTypes.value.find(t => t.id === selectedTicketId.value)
        if (ticket) {
          ticket.quantity -= quantity.value
          if (ticket.quantity === 0) {
            ticket.available = false
          }
        }
        
        // 显示成功提示
        showSuccessModal.value = true
      } catch (err) {
        error.value = '购票失败，请稍后重试'
        // 可以在这里添加更友好的错误处理
      } finally {
        isProcessing.value = false
      }
    }
    
    // 格式化日期
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      })
    }
    
    // 获取状态文本
    const getStatusText = (status) => {
      const statusMap = {
        presale: '预售中',
        onsale: '售票中',
        soldout: '已售罄'
      }
      return statusMap[status] || status
    }
    
    // 返回上一页
    const goBack = () => {
      router.push('/concerts')
    }
    
    // 关闭成功提示
    const closeSuccessModal = () => {
      showSuccessModal.value = false
    }
    
    // 跳转到我的门票
    const goToMyTickets = () => {
      showSuccessModal.value = false
      router.push('/my-tickets')
    }
    
    // 组件挂载时加载数据
    onMounted(() => {
      loadConcertData()
    })
    
    return {
      loading,
      error,
      concert,
      ticketTypes,
      selectedTicketId,
      selectedTicket,
      quantity,
      maxQuantity,
      canPurchase,
      isProcessing,
      showSuccessModal,
      selectTicket,
      increaseQuantity,
      decreaseQuantity,
      calculateTotal,
      purchaseTickets,
      formatDate,
      getStatusText,
      goBack,
      closeSuccessModal,
      goToMyTickets,
      loadConcertData
    }
  }
}
</script>

<style scoped>
/* 全局样式变量 */
:root {
  --primary-color: #ff4757;
  --primary-color-dark: #ff3838;
  --secondary-color: #5f27cd;
  --success-color: #2ed573;
  --warning-color: #ffa502;
  --text-primary: #2c3e50;
  --text-secondary: #7f8c8d;
  --background-primary: #ffffff;
  --background-secondary: #f8f9fa;
  --border-radius: 12px;
  --transition-speed: 0.3s;
}

.tickets-container {
  min-height: 100vh;
  background-color: var(--background-secondary);
  background-image: 
    radial-gradient(circle at 10% 20%, rgba(255, 71, 87, 0.05) 0%, transparent 20%),
    radial-gradient(circle at 90% 80%, rgba(95, 39, 205, 0.05) 0%, transparent 20%);
}

/* 页面头部 */
.page-header {
  text-align: center;
  padding: 3rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
  animation: gradientShift 15s ease infinite;
  background-size: 400% 400%;
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.8rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
}

.page-header p {
  font-size: 1.2rem;
  opacity: 0.95;
  position: relative;
  z-index: 1;
  font-weight: 300;
}

/* 返回按钮 */
.back-section {
  max-width: 1200px;
  margin: 0 auto 2rem;
  padding: 0 1rem;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  background: var(--background-primary);
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-speed) ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.back-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: translateX(-3px);
  box-shadow: 0 4px 15px rgba(255, 71, 87, 0.1);
}

.back-icon {
  font-size: 1.2rem;
}

/* 主内容区 */
.tickets-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem 3rem;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1.5rem;
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 71, 87, 0.1);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 错误状态 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1.5rem;
  color: var(--text-secondary);
  text-align: center;
}

.error-icon {
  font-size: 3rem;
}

.retry-btn {
  padding: 0.8rem 1.8rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-speed) ease;
  box-shadow: 0 4px 15px rgba(255, 71, 87, 0.3);
}

.retry-btn:hover {
  background: var(--primary-color-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 71, 87, 0.4);
}

/* 演唱会详情卡片 */
.concert-details-card {
  background: var(--background-primary);
  border-radius: var(--border-radius);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  padding: 2rem;
  margin-bottom: 2.5rem;
  animation: fadeInUp 0.5s ease;
}

.concert-main-info {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.concert-image {
  flex: 0 0 200px;
  height: 150px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.concert-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.concert-info {
  flex: 1;
}

.concert-title {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  line-height: 1.3;
  font-weight: 700;
}

.concert-meta {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 1rem;
  color: var(--text-secondary);
}

.meta-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.status-badge {
  padding: 0.3rem 0.8rem;
  border-radius: 30px;
  font-weight: 600;
  font-size: 0.9rem;
}

.status-badge.presale {
  background: linear-gradient(135deg, #ffa502, #ff6348);
  color: white;
}

.status-badge.onsale {
  background: linear-gradient(135deg, #2ed573, #55efc4);
  color: white;
}

.status-badge.soldout {
  background: linear-gradient(135deg, #95a5a6, #bdc3c7);
  color: white;
}

/* 票价选择 */
.ticket-selection {
  margin-bottom: 2.5rem;
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  font-weight: 600;
  position: relative;
  padding-left: 1rem;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.3rem;
  bottom: 0.3rem;
  width: 4px;
  background: var(--primary-color);
  border-radius: 4px;
}

.ticket-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.ticket-option {
  background: var(--background-primary);
  border: 2px solid #e0e0e0;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  cursor: pointer;
  transition: all var(--transition-speed) ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.ticket-option:hover:not(.disabled) {
  border-color: var(--primary-color);
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 71, 87, 0.15);
}

.ticket-option.selected {
  border-color: var(--primary-color);
  background: linear-gradient(135deg, rgba(255, 71, 87, 0.05), rgba(255, 71, 87, 0.1));
  box-shadow: 0 4px 15px rgba(255, 71, 87, 0.2);
}

.ticket-option.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f5f5f5;
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.ticket-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
}

.sold-out {
  background: #95a5a6;
  color: white;
  padding: 0.2rem 0.8rem;
  border-radius: 30px;
  font-size: 0.8rem;
  font-weight: 600;
}

.ticket-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.ticket-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.ticket-available {
  font-weight: 500;
}

.ticket-description {
  font-style: italic;
}

.selected-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  background: var(--primary-color);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 30px;
  font-size: 0.8rem;
  font-weight: 600;
}

/* 数量选择 */
.quantity-selection {
  margin-bottom: 2.5rem;
  background: var(--background-primary);
  border-radius: var(--border-radius);
  padding: 1.5rem 2rem;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.quantity-btn {
  width: 50px;
  height: 50px;
  border: 2px solid var(--primary-color);
  background: white;
  color: var(--primary-color);
  border-radius: 50%;
  font-size: 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-speed) ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-btn:hover:not(:disabled) {
  background: var(--primary-color);
  color: white;
  transform: scale(1.1);
}

.quantity-btn:disabled {
  border-color: #ddd;
  color: #ddd;
  cursor: not-allowed;
}

.quantity-display {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  min-width: 60px;
  text-align: center;
}

.quantity-info {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* 购买摘要 */
.purchase-summary {
  background: var(--background-primary);
  border-radius: var(--border-radius);
  padding: 1.5rem 2rem;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 2rem;
}

.summary-details {
  margin-bottom: 2rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.summary-item:last-child {
  border-bottom: none;
  padding-top: 1.2rem;
  font-size: 1.1rem;
}

.summary-label {
  color: var(--text-secondary);
  font-weight: 500;
}

.summary-value {
  color: var(--text-primary);
  font-weight: 600;
}

.total-price {
  color: var(--primary-color);
  font-size: 1.3rem;
  font-weight: 700;
}

.purchase-actions {
  display: flex;
  justify-content: center;
}

.purchase-btn {
  width: 100%;
  padding: 1.2rem;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-color-dark));
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-speed) ease;
  box-shadow: 0 4px 15px rgba(255, 71, 87, 0.3);
}

.purchase-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 71, 87, 0.4);
}

.purchase-btn:disabled {
  background: linear-gradient(135deg, #bdc3c7, #95a5a6);
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

/* 成功模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.success-modal {
  background: var(--background-primary);
  border-radius: var(--border-radius);
  padding: 3rem;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  max-width: 90%;
  width: 500px;
  animation: fadeInUp 0.5s ease;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.success-modal h3 {
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.success-modal p {
  color: var(--text-secondary);
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.modal-btn {
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-speed) ease;
  border: none;
}

.modal-btn.primary {
  background: var(--primary-color);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 71, 87, 0.3);
}

.modal-btn.primary:hover {
  background: var(--primary-color-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 71, 87, 0.4);
}

.modal-btn.secondary {
  background: transparent;
  color: var(--text-primary);
  border: 2px solid var(--text-primary);
}

.modal-btn.secondary:hover {
  background: var(--text-primary);
  color: white;
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

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .concert-main-info {
    flex-direction: column;
    text-align: center;
  }
  
  .concert-image {
    flex: none;
    width: 250px;
    height: 180px;
  }
  
  .concert-meta {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }
  
  .ticket-options {
    grid-template-columns: 1fr;
  }
  
  .quantity-controls {
    justify-content: center;
  }
  
  .summary-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .success-modal {
    padding: 2rem;
    width: 95%;
  }
}
</style>