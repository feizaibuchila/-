<template>
  <div class="my-tickets-container">
    <!-- 导航栏 -->
    <Navbar />
    
    <!-- 页面标题 -->
    <div class="page-header">
      <button @click="goBack" class="back-btn">← 返回</button>
      <h1>🎫 我的演唱会门票</h1>
    </div>
    
    <!-- 门票统计卡片 -->
    <div class="stats-section">
      <div class="stats-card">
        <div class="stat-item">
          <div class="stat-number">{{ totalTickets }}</div>
          <div class="stat-label">总票数</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-number">{{ upcomingTickets }}</div>
          <div class="stat-label">即将到来</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-number">{{ completedTickets }}</div>
          <div class="stat-label">已结束</div>
        </div>
      </div>
    </div>
    
    <!-- 门票筛选 -->
    <div class="filter-section">
      <div class="filter-tabs">
        <button 
          class="filter-tab"
          :class="{ active: activeFilter === 'all' }"
          @click="activeFilter = 'all'"
        >
          全部门票
        </button>
        <button 
          class="filter-tab"
          :class="{ active: activeFilter === 'upcoming' }"
          @click="activeFilter = 'upcoming'"
        >
          即将到来
        </button>
        <button 
          class="filter-tab"
          :class="{ active: activeFilter === 'completed' }"
          @click="activeFilter = 'completed'"
        >
          已结束
        </button>
      </div>
    </div>
    
    <!-- 门票列表 -->
    <div class="tickets-section">
      <div v-if="filteredTickets.length === 0" class="empty-state">
        <div class="empty-icon">🎟️</div>
        <h3>暂无门票</h3>
        <p>您还没有购买任何演唱会门票</p>
        <router-link to="/concerts" class="browse-btn">浏览演唱会</router-link>
      </div>
      
      <div v-else class="tickets-grid">
        <div 
          v-for="ticket in filteredTickets" 
          :key="ticket.id"
          class="ticket-card"
          :class="ticket.status === '已结束' ? 'completed' : ''"
        >
          <!-- 门票头部信息 -->
          <div class="ticket-header">
            <div class="ticket-status-badge" :class="getTicketStatusClass(ticket)">
              {{ getTicketStatusText(ticket) }}
            </div>
            <button class="share-btn" @click="shareTicket(ticket)">
              📤 分享
            </button>
          </div>
          
          <!-- 演唱会信息 -->
          <div class="ticket-concert-info">
            <h3 class="concert-title">{{ ticket.concertTitle }}</h3>
            <div class="concert-meta">
              <div class="meta-item">
                <span class="meta-icon">📅</span>
                {{ formatDate(ticket.date) }}
              </div>
              <div class="meta-item">
                <span class="meta-icon">📍</span>
                {{ ticket.location }}
              </div>
              <div class="meta-item">
                <span class="meta-icon">💺</span>
                {{ ticket.seats.join(', ') }}
              </div>
            </div>
          </div>
          
          <!-- 门票详情 -->
          <div class="ticket-details">
            <div class="detail-item">
              <span class="detail-label">订单编号</span>
              <span class="detail-value">{{ formatOrderId(ticket.id) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">购买时间</span>
              <span class="detail-value">{{ formatDateTime(ticket.purchaseTime) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">支付方式</span>
              <span class="detail-value">{{ getPaymentMethodText(ticket.paymentMethod) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">总价</span>
              <span class="detail-value price">{{ ticket.price }} 元</span>
            </div>
          </div>
          
          <!-- 票根展示 -->
          <div class="ticket-stub">
            <div class="stub-qr">
              <div class="qr-placeholder">
                <span class="qr-icon">📱</span>
                <span class="qr-text">扫码入场</span>
              </div>
            </div>
            <div class="stub-info">
              <div class="stub-code">{{ generateTicketCode(ticket.id) }}</div>
              <div class="stub-warning">请凭此码入场，一人一票</div>
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="ticket-actions">
            <button 
              class="action-btn view-detail-btn"
              @click="viewConcertDetail(ticket.concertId)"
            >
              查看详情
            </button>
            <button 
              v-if="isUpcoming(ticket)"
              class="action-btn add-calendar-btn"
              @click="addCalendar(ticket)"
            >
              添加日历
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 分享弹窗 -->
    <div class="modal-overlay" v-if="showShareModal" @click="closeShareModal">
      <div class="share-modal" @click.stop>
        <div class="modal-header">
          <h3>分享门票</h3>
          <button class="close-btn" @click="closeShareModal">×</button>
        </div>
        
        <div class="modal-body">
          <div class="share-ticket-preview">
            <div class="preview-title">{{ selectedTicket.concertTitle }}</div>
            <div class="preview-info">{{ formatDate(selectedTicket.date) }} · {{ selectedTicket.location }}</div>
            <div class="preview-seats">座位：{{ selectedTicket.seats.join(', ') }}</div>
          </div>
          
          <div class="share-options">
            <div class="share-option" @click="copyTicketInfo">
              <div class="share-icon">📋</div>
              <span>复制信息</span>
            </div>
            <div class="share-option" @click="shareToWechat">
              <div class="share-icon">💚</div>
              <span>微信好友</span>
            </div>
            <div class="share-option" @click="shareToCircle">
              <div class="share-icon">⭕</div>
              <span>朋友圈</span>
            </div>
            <div class="share-option" @click="shareToWeibo">
              <div class="share-icon">🔵</div>
              <span>微博</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 操作结果提示 -->
    <div class="toast" :class="{ show: showToast }">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script>
import Navbar from '../components/Navbar.vue';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'MyTicketsView',
  components: {
    Navbar
  },
  setup() {
    const router = useRouter();
    
    // 状态
    const userTickets = ref([]);
    const activeFilter = ref('all');
    const showShareModal = ref(false);
    const selectedTicket = ref(null);
    const showToast = ref(false);
    const toastMessage = ref('');
    
    // 模拟数据（用于展示）
    const mockTickets = [
      {
        id: 10001,
        concertId: 1,
        concertTitle: '薛之谦「天外来物」世界巡回演唱会 - 上海站',
        date: '2024-06-15',
        location: '上海虹口足球场',
        seats: ['VIP区 A5', 'VIP区 A6'],
        price: 3960,
        purchaseTime: '2024-04-10T10:30:00Z',
        status: '已支付',
        paymentMethod: 'points'
      },
      {
        id: 10002,
        concertId: 2,
        concertTitle: '薛之谦「天外来物」世界巡回演唱会 - 北京站',
        date: '2024-07-20',
        location: '北京工人体育场',
        seats: ['A区 B12'],
        price: 1380,
        purchaseTime: '2024-04-15T14:20:00Z',
        status: '已支付',
        paymentMethod: 'wechat'
      },
      {
        id: 10003,
        concertId: 3,
        concertTitle: '薛之谦「天外来物」世界巡回演唱会 - 广州站',
        date: '2024-08-25',
        location: '广州天河体育场',
        seats: ['B区 C25', 'B区 C26'],
        price: 1760,
        purchaseTime: '2024-04-20T09:15:00Z',
        status: '已支付',
        paymentMethod: 'alipay'
      }
    ];
    
    // 计算属性
    const totalTickets = computed(() => userTickets.value.length);
    
    const upcomingTickets = computed(() => {
      return userTickets.value.filter(ticket => isUpcoming(ticket)).length;
    });
    
    const completedTickets = computed(() => {
      return userTickets.value.filter(ticket => !isUpcoming(ticket)).length;
    });
    
    const filteredTickets = computed(() => {
      if (activeFilter.value === 'all') {
        return userTickets.value;
      } else if (activeFilter.value === 'upcoming') {
        return userTickets.value.filter(ticket => isUpcoming(ticket));
      } else if (activeFilter.value === 'completed') {
        return userTickets.value.filter(ticket => !isUpcoming(ticket));
      }
      return userTickets.value;
    });
    
    // 方法
    const goBack = () => {
      router.back();
    };
    
    const isUpcoming = (ticket) => {
      const concertDate = new Date(ticket.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return concertDate >= today;
    };
    
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    };
    
    const formatDateTime = (dateTimeString) => {
      const date = new Date(dateTimeString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };
    
    const formatOrderId = (id) => {
      // 格式化订单号为易读形式
      const idStr = id.toString();
      return idStr.slice(0, 4) + '-' + idStr.slice(4);
    };
    
    const generateTicketCode = (id) => {
      // 生成票码
      const prefix = 'XZQ';
      const suffix = id.toString().slice(-6).padStart(6, '0');
      return prefix + '-' + suffix;
    };
    
    const getPaymentMethodText = (method) => {
      const methodMap = {
        'wechat': '微信支付',
        'alipay': '支付宝',
        'points': '积分支付'
      };
      return methodMap[method] || method;
    };
    
    const getTicketStatusClass = (ticket) => {
      if (ticket.status === '已结束') {
        return 'completed';
      } else if (isUpcoming(ticket)) {
        const daysUntil = Math.ceil((new Date(ticket.date) - new Date()) / (1000 * 60 * 60 * 24));
        if (daysUntil <= 3) {
          return 'soon';
        }
        return 'upcoming';
      }
      return 'default';
    };
    
    const getTicketStatusText = (ticket) => {
      if (ticket.status === '已结束') {
        return '已结束';
      } else if (isUpcoming(ticket)) {
        const daysUntil = Math.ceil((new Date(ticket.date) - new Date()) / (1000 * 60 * 60 * 24));
        if (daysUntil <= 3) {
          return '即将开始';
        }
        return '即将到来';
      }
      return ticket.status;
    };
    
    const viewConcertDetail = (concertId) => {
      router.push(`/tickets/${concertId}`);
    };
    
    const shareTicket = (ticket) => {
      selectedTicket.value = ticket;
      showShareModal.value = true;
    };
    
    const closeShareModal = () => {
      showShareModal.value = false;
      selectedTicket.value = null;
    };
    
    const copyTicketInfo = () => {
      if (!selectedTicket.value) return;
      
      const ticketInfo = `🎫 演唱会门票\n\n` +
                        `${selectedTicket.value.concertTitle}\n` +
                        `📅 ${formatDate(selectedTicket.value.date)}\n` +
                        `📍 ${selectedTicket.value.location}\n` +
                        `💺 ${selectedTicket.value.seats.join(', ')}\n` +
                        `🎫 票码：${generateTicketCode(selectedTicket.value.id)}`;
      
      navigator.clipboard.writeText(ticketInfo).then(() => {
        showToastMessage('门票信息已复制到剪贴板');
        closeShareModal();
      }).catch(() => {
        showToastMessage('复制失败，请手动复制');
      });
    };
    
    const shareToWechat = () => {
      showToastMessage('请选择分享给微信好友');
    };
    
    const shareToCircle = () => {
      showToastMessage('分享到朋友圈功能暂未开放');
    };
    
    const shareToWeibo = () => {
      showToastMessage('分享到微博功能暂未开放');
    };
    
    const addCalendar = (ticket) => {
      showToastMessage('已添加到日历提醒');
    };
    
    const showToastMessage = (message) => {
      toastMessage.value = message;
      showToast.value = true;
      
      setTimeout(() => {
        showToast.value = false;
      }, 3000);
    };
    
    const loadTickets = () => {
      // 从本地存储加载门票数据
      const storedTickets = localStorage.getItem('userTickets');
      if (storedTickets) {
        userTickets.value = JSON.parse(storedTickets);
      } else {
        // 如果没有存储数据，使用模拟数据
        userTickets.value = mockTickets;
        // 保存模拟数据到本地存储
        localStorage.setItem('userTickets', JSON.stringify(mockTickets));
      }
      
      // 根据日期排序（最近的日期在前）
      userTickets.value.sort((a, b) => new Date(a.date) - new Date(b.date));
    };
    
    // 生命周期
    onMounted(() => {
      loadTickets();
    });
    
    return {
      userTickets,
      activeFilter,
      totalTickets,
      upcomingTickets,
      completedTickets,
      filteredTickets,
      showShareModal,
      selectedTicket,
      showToast,
      toastMessage,
      goBack,
      formatDate,
      formatDateTime,
      formatOrderId,
      generateTicketCode,
      getPaymentMethodText,
      getTicketStatusClass,
      getTicketStatusText,
      viewConcertDetail,
      shareTicket,
      closeShareModal,
      copyTicketInfo,
      shareToWechat,
      shareToCircle,
      shareToWeibo,
      addCalendar,
      isUpcoming
    };
  }
};
</script>

<style scoped>
/* 全局变量 */
:root {
  --primary-gradient: linear-gradient(135deg, #ff6b6b, #feca57);
  --card-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  --card-hover-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
  --transition-fast: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --border-radius: 16px;
}

/* 主容器 */
.my-tickets-container {
  min-height: 100vh;
  background-color: #f9f9fb;
  background-image: 
    radial-gradient(circle at 10% 20%, rgba(255, 107, 107, 0.05) 0%, transparent 20%),
    radial-gradient(circle at 90% 80%, rgba(254, 202, 87, 0.05) 0%, transparent 20%);
}

/* 页面头部 */
.page-header {
  padding: 2.5rem 1.5rem;
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  position: relative;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
}

.page-header h1 {
  text-align: center;
  margin: 0;
  color: var(--text-primary);
  font-size: 1.8rem;
  font-weight: 600;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, #ff6b6b, #feca57);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.back-btn {
  position: absolute;
  left: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  padding: 0.75rem;
  color: var(--text-primary);
  border-radius: 50%;
  transition: var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  transform: translateY(-50%) scale(1.1);
}

/* 统计部分 */
.stats-section {
  max-width: 1200px;
  margin: 2.5rem auto 1.5rem;
  padding: 0 1.5rem;
  animation: fadeInUp 0.6s ease-out;
}

.stats-card {
  background: white;
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: var(--card-shadow);
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  gap: 2rem;
  position: relative;
  overflow: hidden;
}

.stats-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--primary-gradient);
}

.stat-item {
  text-align: center;
  flex: 1;
  min-width: 120px;
  padding: 0.5rem;
  border-radius: 12px;
  transition: var(--transition-fast);
}

.stat-item:hover {
  transform: translateY(-3px);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.75rem;
  display: block;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.95rem;
  font-weight: 500;
}

.stat-divider {
  width: 1px;
  height: 60px;
  background-color: rgba(0, 0, 0, 0.08);
  display: none;
}

@media (min-width: 768px) {
  .stat-divider {
    display: block;
  }
}

/* 筛选部分 */
.filter-section {
  max-width: 1200px;
  margin: 1.5rem auto;
  padding: 0 1.5rem;
  animation: fadeInUp 0.6s ease-out 0.2s both;
}

.filter-tabs {
  display: flex;
  background: white;
  border-radius: var(--border-radius);
  padding: 0.5rem;
  box-shadow: var(--card-shadow);
}

.filter-tab {
  flex: 1;
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: var(--transition-fast);
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.95rem;
  position: relative;
  overflow: hidden;
}

.filter-tab::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 107, 107, 0.05), transparent);
  transition: left 0.5s;
}

.filter-tab:hover::before {
  left: 100%;
}

.filter-tab:hover {
  color: var(--primary-color);
  transform: translateY(-1px);
}

.filter-tab.active {
  background: var(--primary-gradient);
  color: white;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

/* 门票列表部分 */
.tickets-section {
  max-width: 1200px;
  margin: 2.5rem auto;
  padding: 0 1.5rem;
  min-height: 500px;
  animation: fadeInUp 0.6s ease-out 0.4s both;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 5rem 2rem;
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
  border: 2px dashed rgba(0, 0, 0, 0.05);
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 1.5rem;
  animation: pulse 2s infinite;
}

.empty-state h3 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: 600;
}

.empty-state p {
  margin: 0 0 2rem 0;
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.6;
}

.browse-btn {
  display: inline-block;
  padding: 1rem 2.5rem;
  background: var(--primary-gradient);
  color: white;
  text-decoration: none;
  border-radius: 10px;
  transition: var(--transition-fast);
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
  border: none;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.browse-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.browse-btn:hover::before {
  left: 100%;
}

.browse-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
}

/* 门票网格 */
.tickets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 2rem;
}

/* 门票卡片 */
.ticket-card {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
  overflow: hidden;
  transition: var(--transition-fast);
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.ticket-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--card-hover-shadow);
  border-color: rgba(255, 107, 107, 0.2);
}

.ticket-card.completed {
  opacity: 0.85;
  filter: grayscale(40%);
}

.ticket-card.completed::before {
  content: '已结束';
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: #95a5a6;
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  z-index: 10;
}

/* 门票头部 */
.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.75rem;
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(254, 202, 87, 0.1));
}

.ticket-status-badge {
  padding: 0.4rem 1.2rem;
  border-radius: 25px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.ticket-status-badge.upcoming {
  background-color: #3498db;
  color: white;
  box-shadow: 0 3px 10px rgba(52, 152, 219, 0.3);
}

.ticket-status-badge.soon {
  background-color: #e74c3c;
  color: white;
  box-shadow: 0 3px 10px rgba(231, 76, 60, 0.3);
  animation: pulse 2s infinite;
}

.ticket-status-badge.completed {
  background-color: #95a5a6;
  color: white;
  box-shadow: 0 3px 10px rgba(149, 165, 166, 0.3);
}

.share-btn {
  background: white;
  border: none;
  cursor: pointer;
  padding: 0.6rem 1.2rem;
  border-radius: 20px;
  font-size: 0.85rem;
  color: var(--primary-color);
  font-weight: 500;
  transition: var(--transition-fast);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.share-btn:hover {
  background-color: var(--primary-color);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

/* 演唱会信息 */
.ticket-concert-info {
  padding: 1.75rem;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.08);
}

.concert-title {
  margin: 0 0 1.25rem 0;
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: -0.3px;
}

.concert-meta {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1rem;
  color: var(--text-secondary);
}

.meta-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

/* 门票详情 */
.ticket-details {
  padding: 1.75rem;
  background-color: rgba(0, 0, 0, 0.02);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 0.95rem;
  padding: 0.25rem 0;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-label {
  color: var(--text-secondary);
  font-weight: 500;
}

.detail-value {
  color: var(--text-primary);
  font-weight: 600;
  letter-spacing: -0.2px;
}

.detail-value.price {
  color: #e74c3c;
  font-weight: bold;
  font-size: 1.1rem;
}

/* 票根部分 */
.ticket-stub {
  padding: 1.75rem;
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  border-top: 1px dashed rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  position: relative;
}

.ticket-stub::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  height: 80%;
  background-image: 
    linear-gradient(90deg, transparent 30%, rgba(255, 107, 107, 0.03) 30%, rgba(255, 107, 107, 0.03) 32%, transparent 32%),
    linear-gradient(90deg, transparent 36%, rgba(255, 107, 107, 0.03) 36%, rgba(255, 107, 107, 0.03) 38%, transparent 38%),
    linear-gradient(90deg, transparent 42%, rgba(255, 107, 107, 0.03) 42%, rgba(255, 107, 107, 0.03) 44%, transparent 44%),
    linear-gradient(90deg, transparent 48%, rgba(255, 107, 107, 0.03) 48%, rgba(255, 107, 107, 0.03) 50%, transparent 50%);
  pointer-events: none;
}

.stub-qr {
  flex-shrink: 0;
}

.qr-placeholder {
  width: 110px;
  height: 110px;
  background-color: white;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.qr-placeholder::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--primary-gradient);
}

.qr-icon {
  font-size: 2.5rem;
  animation: pulse 3s infinite;
}

.qr-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.stub-info {
  flex: 1;
}

.stub-code {
  font-size: 1.25rem;
  font-weight: bold;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.75rem;
  letter-spacing: 1px;
  font-family: 'Courier New', monospace;
}

.stub-warning {
  font-size: 0.9rem;
  color: #e74c3c;
  font-weight: 500;
}

/* 操作按钮 */
.ticket-actions {
  padding: 1.5rem 1.75rem;
  display: flex;
  gap: 1.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.action-btn {
  flex: 1;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-fast);
  font-size: 0.95rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
  z-index: -1;
}

.action-btn:hover::before {
  left: 100%;
}

.view-detail-btn {
  background-color: white;
  border: 2px solid var(--primary-color);
  color: var(--primary-color);
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.1);
}

.view-detail-btn:hover {
  background-color: var(--primary-color);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.add-calendar-btn {
  background-color: #2ecc71;
  border: 2px solid #2ecc71;
  color: white;
  box-shadow: 0 2px 8px rgba(46, 204, 113, 0.2);
}

.add-calendar-btn:hover {
  background-color: #27ae60;
  border-color: #27ae60;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(46, 204, 113, 0.3);
}

/* 分享弹窗 */
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
  backdrop-filter: blur(5px);
  animation: fadeIn 0.3s ease-out;
}

.share-modal {
  background-color: white;
  border-radius: var(--border-radius);
  width: 90%;
  max-width: 450px;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease-out;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.75rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.05), rgba(254, 202, 87, 0.05));
}

.modal-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.35rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: var(--transition-fast);
}

.close-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--text-primary);
  transform: scale(1.1);
}

.modal-body {
  padding: 2rem 1.75rem;
}

.share-ticket-preview {
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.05), rgba(254, 202, 87, 0.05));
  padding: 1.75rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.preview-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
  font-size: 1.1rem;
  line-height: 1.4;
}

.preview-info,
.preview-seats {
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.share-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.share-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 1.25rem 0;
  border-radius: 12px;
  transition: var(--transition-fast);
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.share-option:hover {
  background: white;
  transform: translateY(-5px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
}

.share-icon {
  font-size: 2.25rem;
  transition: var(--transition-fast);
}

.share-option:hover .share-icon {
  transform: scale(1.2);
}

.share-option span {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
}

/* 提示框 */
.toast {
  position: fixed;
  bottom: -100px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  color: white;
  padding: 1.25rem 2.5rem;
  border-radius: 10px;
  z-index: 2000;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 10px 30px rgba(46, 204, 113, 0.4);
  font-weight: 500;
  animation: fadeInUp 0.4s ease-out;
}

.toast.show {
  bottom: 3rem;
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

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

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .tickets-grid {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 2rem 1rem;
  }
  
  .page-header h1 {
    font-size: 1.5rem;
  }
  
  .back-btn {
    left: 1rem;
    font-size: 1.5rem;
    padding: 0.5rem;
  }
  
  .stats-card {
    padding: 1.5rem;
    gap: 1.5rem;
  }
  
  .stat-number {
    font-size: 2rem;
  }
  
  .filter-tabs {
    padding: 0.3rem;
  }
  
  .filter-tab {
    padding: 0.8rem 1rem;
    font-size: 0.85rem;
  }
  
  .tickets-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .tickets-section {
    margin: 2rem auto;
    padding: 0 1rem;
  }
  
  .ticket-card {
    border-radius: 12px;
  }
  
  .ticket-header,
  .ticket-concert-info,
  .ticket-details,
  .ticket-stub,
  .ticket-actions {
    padding: 1.25rem;
  }
  
  .ticket-stub {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
  
  .qr-placeholder {
    width: 90px;
    height: 90px;
  }
  
  .ticket-actions {
    flex-direction: column;
    gap: 1rem;
  }
  
  .empty-state {
    padding: 3.5rem 1.5rem;
  }
  
  .empty-icon {
    font-size: 4rem;
  }
  
  .share-options {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
  }
  
  .modal-header,
  .modal-body {
    padding: 1.5rem 1.25rem;
  }
  
  .share-ticket-preview {
    padding: 1.25rem;
    margin-bottom: 1.5rem;
  }
  
  .toast {
    width: 90%;
    padding: 1rem 1.5rem;
    font-size: 0.9rem;
  }
  
  .toast.show {
    bottom: 2rem;
  }
}

@media (max-width: 480px) {
  .stats-section,
  .filter-section {
    padding: 0 1rem;
  }
  
  .stat-item {
    min-width: 100px;
  }
  
  .stat-number {
    font-size: 1.8rem;
  }
  
  .browse-btn {
    padding: 0.9rem 2rem;
    font-size: 0.9rem;
  }
}
  </style>