<template>
  <div class="concerts-container">
    <!-- 导航栏 -->
    <Navbar />
    
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>🎤 薛之谦演唱会</h1>
      <p>永远快乐薛之谦，我心终有谦谦结</p>
    </div>
    
    <!-- 快捷入口 -->
    <div class="quick-actions">
      <router-link to="/my-tickets" class="btn btn-secondary">
        🎫 我的演唱会门票
      </router-link>
      <router-link to="/vip" class="btn btn-vip">
        👑 VIP优先购票
      </router-link>
    </div>
    
    <!-- 演唱会列表 -->
    <div class="concerts-list">
      <div class="filter-section">
        <div class="filter-options">
          <button 
            v-for="city in cities" 
            :key="city"
            class="filter-btn"
            :class="{ active: selectedCity === city || (selectedCity === '' && city === '全部') }"
            @click="selectedCity = city === '全部' ? '' : city"
          >
            {{ city }}
          </button>
        </div>
        <div class="sort-options">
          <label>排序方式：</label>
          <select v-model="sortBy" class="sort-select">
            <option value="date">按日期排序</option>
            <option value="hot">热门程度</option>
          </select>
        </div>
      </div>
      
      <div class="concerts-grid">
        <div 
          v-for="concert in filteredConcerts" 
          :key="concert.id"
          class="concert-card card"
        >
          <div class="concert-image">
            <img :src="concert.image" :alt="concert.title" />
            <div v-if="concert.ticketStatus === '预售中'" class="presale-badge">
              🔥 预售中
            </div>
          </div>
          
          <div class="concert-info">
            <h3 class="concert-title">{{ concert.title }}</h3>
            
            <div class="concert-meta">
              <div class="meta-item">
                <span class="meta-icon">📍</span>
                <span>{{ concert.location }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">📅</span>
                <span>{{ concert.date }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">🎵</span>
                <span>{{ concert.tourName }}</span>
              </div>
            </div>
            
            <div class="ticket-prices">
              <span class="price-label">票价：</span>
              <span class="price-range">{{ concert.minPrice }} - {{ concert.maxPrice }} 元</span>
            </div>
            
            <div class="concert-actions">
              <router-link 
                :to="`/detail/${concert.id}?type=concerts`" 
                class="btn btn-outline"
              >
                查看详情
              </router-link>
              <button 
                class="btn buy-btn"
                :disabled="concert.ticketStatus !== '预售中'"
                @click="buyConcertTicket(concert.id)"
              >
                {{ concert.ticketStatus === '预售中' ? '立即购票' : '敬请期待' }}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 分页 -->
      <div class="pagination">
        <button 
          class="page-btn"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          上一页
        </button>
        <span class="page-info">第 {{ currentPage }} / {{ totalPages }} 页</span>
        <button 
          class="page-btn"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from '../components/Navbar.vue';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store/index';

export default {
  name: 'ConcertsView',
  components: {
    Navbar
  },
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    
    // 状态
    const concerts = ref([
      {
        id: 1,
        title: '薛之谦「天外来物」世界巡回演唱会 - 上海站',
        date: '2024-06-15',
        location: '上海虹口足球场',
        image: 'https://picsum.photos/id/1019/600/400',
        ticketStatus: '预售中',
        minPrice: 380,
        maxPrice: 1980,
        tourName: '天外来物',
        city: '上海'
      },
      {
        id: 2,
        title: '薛之谦「天外来物」世界巡回演唱会 - 北京站',
        date: '2024-07-20',
        location: '北京工人体育场',
        image: 'https://picsum.photos/id/1031/600/400',
        ticketStatus: '预售中',
        minPrice: 380,
        maxPrice: 1980,
        tourName: '天外来物',
        city: '北京'
      },
      {
        id: 3,
        title: '薛之谦「天外来物」世界巡回演唱会 - 广州站',
        date: '2024-08-25',
        location: '广州天河体育场',
        image: 'https://picsum.photos/id/1039/600/400',
        ticketStatus: '预售中',
        minPrice: 380,
        maxPrice: 1980,
        tourName: '天外来物',
        city: '广州'
      },
      {
        id: 4,
        title: '薛之谦「天外来物」世界巡回演唱会 - 成都站',
        date: '2024-09-15',
        location: '成都凤凰山体育公园',
        image: 'https://picsum.photos/id/1041/600/400',
        ticketStatus: '即将开售',
        minPrice: 380,
        maxPrice: 1980,
        tourName: '天外来物',
        city: '成都'
      },
      {
        id: 5,
        title: '薛之谦「天外来物」世界巡回演唱会 - 杭州站',
        date: '2024-10-01',
        location: '杭州奥体中心体育场',
        image: 'https://picsum.photos/id/1043/600/400',
        ticketStatus: '即将开售',
        minPrice: 380,
        maxPrice: 1980,
        tourName: '天外来物',
        city: '杭州'
      },
      {
        id: 6,
        title: '薛之谦「天外来物」世界巡回演唱会 - 武汉站',
        date: '2024-10-20',
        location: '武汉光谷国际网球中心',
        image: 'https://picsum.photos/id/1053/600/400',
        ticketStatus: '即将开售',
        minPrice: 380,
        maxPrice: 1980,
        tourName: '天外来物',
        city: '武汉'
      }
    ]);
    
    const selectedCity = ref('');
    const sortBy = ref('date');
    const currentPage = ref(1);
    const pageSize = ref(6);
    
    // 城市列表
    const cities = ref(['全部', '上海', '北京', '广州', '成都', '杭州', '武汉']);
    
    // 计算属性
    const filteredConcerts = computed(() => {
      let result = [...concerts.value];
      
      // 按城市筛选
      if (selectedCity.value) {
        result = result.filter(concert => concert.city === selectedCity.value);
      }
      
      // 排序
      if (sortBy.value === 'date') {
        result.sort((a, b) => new Date(a.date) - new Date(b.date));
      } else if (sortBy.value === 'hot') {
        // 模拟热门排序
        result.sort((a, b) => {
          if (a.ticketStatus === '预售中' && b.ticketStatus !== '预售中') return -1;
          if (a.ticketStatus !== '预售中' && b.ticketStatus === '预售中') return 1;
          return 0;
        });
      }
      
      // 分页
      const start = (currentPage.value - 1) * pageSize.value;
      const end = start + pageSize.value;
      
      return result.slice(start, end);
    });
    
    const totalPages = computed(() => {
      let result = [...concerts.value];
      if (selectedCity.value) {
        result = result.filter(concert => concert.city === selectedCity.value);
      }
      return Math.ceil(result.length / pageSize.value);
    });
    
    // 方法
    const buyConcertTicket = (id) => {
      router.push(`/tickets/${id}`);
    };
    
    // 生命周期
    onMounted(() => {
      // 确保用户已登录
      if (!userStore.getIsLoggedIn) {
        router.push('/');
      }
    });
    
    return {
      concerts,
      selectedCity,
      sortBy,
      currentPage,
      pageSize,
      cities,
      filteredConcerts,
      totalPages,
      buyConcertTicket
    };
  }
};
</script>

<style scoped>
/* 全局样式变量 */
:root {
  --primary-color: #ff4757;
  --primary-color-dark: #ff3838;
  --secondary-color: #5f27cd;
  --text-primary: #2c3e50;
  --text-secondary: #7f8c8d;
  --text-light: #ffffff;
  --background-primary: #ffffff;
  --background-secondary: #f8f9fa;
  --border-radius: 12px;
  --transition-speed: 0.3s;
  --box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.concerts-container {
  min-height: 100vh;
  background-color: var(--background-secondary);
  background-image: 
    radial-gradient(circle at 10% 20%, rgba(255, 71, 87, 0.05) 0%, transparent 20%),
    radial-gradient(circle at 90% 80%, rgba(95, 39, 205, 0.05) 0%, transparent 20%);
}

/* 页面头部 */
.page-header {
  text-align: center;
  padding: 4rem 1rem;
  background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
  color: white;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  animation: gradientShift 15s ease infinite;
  background-size: 400% 400%;
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="rgba(255,255,255,0.05)"/></svg>') repeat;
  opacity: 0.7;
}

.page-header h1 {
  font-size: 2.8rem;
  margin-bottom: 0.8rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
  animation: fadeInUp 1s ease;
}

.page-header p {
  font-size: 1.3rem;
  opacity: 0.95;
  position: relative;
  z-index: 1;
  animation: fadeInUp 1s ease 0.2s both;
  font-weight: 300;
}

/* 快捷操作按钮 */
.quick-actions {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
  padding: 0 1rem;
}

.quick-actions .btn {
  padding: 0.8rem 1.8rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all var(--transition-speed) ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.btn-secondary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-secondary:hover {
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-vip {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
  color: var(--text-primary);
}

.btn-vip:hover {
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 6px 20px rgba(255, 154, 158, 0.4);
}

/* 演唱会列表容器 */
.concerts-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem 3rem;
}

/* 筛选区域 */
.filter-section {
  background: white;
  padding: 1.5rem 2rem;
  border-radius: var(--border-radius);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  margin-bottom: 2.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.filter-options {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.6rem 1.2rem;
  border: 2px solid #e0e0e0;
  background-color: white;
  border-radius: 30px;
  cursor: pointer;
  transition: all var(--transition-speed) ease;
  font-size: 0.95rem;
  font-weight: 500;
  position: relative;
  overflow: hidden;
}

.filter-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 71, 87, 0.1);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.filter-btn:hover::before {
  width: 300px;
  height: 300px;
}

.filter-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: translateY(-1px);
  box-shadow: 0 2px 10px rgba(255, 71, 87, 0.2);
}

.filter-btn.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  box-shadow: 0 4px 15px rgba(255, 71, 87, 0.3);
}

.filter-btn.active::before {
  display: none;
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 0.95rem;
  color: var(--text-primary);
  font-weight: 500;
}

.sort-select {
  padding: 0.6rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  background-color: white;
  cursor: pointer;
  transition: all var(--transition-speed) ease;
}

.sort-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(255, 71, 87, 0.1);
}

.sort-select:hover {
  border-color: var(--primary-color);
}

/* 演唱会卡片网格 */
.concerts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2.5rem;
  margin-bottom: 3rem;
}

.concert-card {
  background-color: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  transition: transform var(--transition-speed) ease, box-shadow var(--transition-speed) ease;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  animation: fadeInUp 0.5s ease;
}

.concert-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.concert-image {
  position: relative;
  height: 220px;
  overflow: hidden;
  border-radius: var(--border-radius) var(--border-radius) 0 0;
}

.concert-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s ease;
}

.concert-card:hover .concert-image img {
  transform: scale(1.1);
}

.presale-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 30px;
  font-size: 0.95rem;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
  animation: pulse 2s infinite;
  z-index: 2;
}

/* 卡片内容 */
.concert-info {
  padding: 1.8rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

.concert-info::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
}

.concert-title {
  font-size: 1.3rem;
  margin-bottom: 1.2rem;
  color: var(--text-primary);
  line-height: 1.5;
  font-weight: 600;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color var(--transition-speed) ease;
}

.concert-card:hover .concert-title {
  color: var(--primary-color);
}

.concert-meta {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.meta-icon {
  font-size: 1.1rem;
  color: var(--primary-color);
  flex-shrink: 0;
}

.ticket-prices {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1.8rem;
  font-size: 1rem;
  padding: 0.8rem;
  background: linear-gradient(135deg, rgba(255, 71, 87, 0.05), rgba(95, 39, 205, 0.05));
  border-radius: 8px;
  border-left: 4px solid var(--primary-color);
}

.price-label {
  color: var(--text-secondary);
  font-weight: 500;
}

.price-range {
  color: var(--primary-color);
  font-weight: bold;
  font-size: 1.2rem;
}

/* 操作按钮 */
.concert-actions {
  display: flex;
  gap: 1rem;
  margin-top: auto;
}

.concert-actions .btn,
.concert-actions button {
  flex: 1;
  padding: 0.9rem 1.2rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all var(--transition-speed) ease;
  text-decoration: none;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.btn-outline {
  background: transparent;
  color: var(--text-primary);
  border: 2px solid var(--text-primary);
}

.btn-outline:hover {
  background: var(--text-primary);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.buy-btn {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-color-dark));
  color: white;
  border: none;
  box-shadow: 0 4px 15px rgba(255, 71, 87, 0.3);
}

.buy-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(255, 71, 87, 0.4);
  background: linear-gradient(135deg, var(--primary-color-dark), var(--primary-color));
}

.buy-btn:active:not(:disabled) {
  transform: translateY(0);
}

.buy-btn:disabled {
  background: linear-gradient(135deg, #bdc3c7, #95a5a6);
  cursor: not-allowed;
  box-shadow: none;
}

/* 分页控件 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin-top: 3rem;
  padding-bottom: 2rem;
}

.page-btn {
  padding: 0.8rem 1.5rem;
  border: 2px solid var(--primary-color);
  background-color: white;
  color: var(--primary-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all var(--transition-speed) ease;
  font-weight: 600;
  font-size: 1rem;
  position: relative;
  overflow: hidden;
}

.page-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: var(--primary-color);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
  z-index: 0;
}

.page-btn span {
  position: relative;
  z-index: 1;
}

.page-btn:hover:not(:disabled) {
  color: white;
}

.page-btn:hover:not(:disabled)::before {
  width: 300px;
  height: 300px;
}

.page-btn:disabled {
  border-color: #ddd;
  color: #999;
  cursor: not-allowed;
  background: #f5f5f5;
}

.page-btn:disabled::before {
  display: none;
}

.page-info {
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 500;
  background: white;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
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
  .page-header h1 {
    font-size: 2.5rem;
  }
  
  .concerts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 3rem 1rem;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .page-header p {
    font-size: 1.1rem;
  }
  
  .quick-actions {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  
  .quick-actions .btn {
    width: 80%;
    max-width: 300px;
  }
  
  .filter-section {
    padding: 1.2rem 1rem;
  }
  
  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-options {
    justify-content: center;
  }
  
  .sort-options {
    justify-content: center;
  }
  
  .concerts-grid {
    grid-template-columns: 1fr;
  }
  
  .concert-card {
    max-width: 400px;
    margin: 0 auto;
  }
  
  .concert-actions {
    flex-direction: column;
  }
  
  .pagination {
    gap: 1rem;
  }
  
  .page-btn,
  .page-info {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .page-header h1 {
    font-size: 1.8rem;
  }
  
  .quick-actions .btn {
    width: 90%;
  }
  
  .filter-btn {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
  
  .concert-info {
    padding: 1.5rem;
  }
}
</style>