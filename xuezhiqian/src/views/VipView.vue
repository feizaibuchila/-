<template>
  <div class="vip-container">
    <!-- 顶部导航栏 -->
    <header class="navbar">
      <div class="navbar-brand">
        <h1>薛之谦粉丝应援站 - VIP中心</h1>
      </div>
      
      <div class="navbar-user">
        <div class="user-info" v-if="userInfo">
          <img :src="userInfo.avatar" alt="用户头像" class="user-avatar">
          <span class="user-nickname">{{ userInfo.nickname }}</span>
          <span v-if="isVip" class="vip-badge">VIP</span>
        </div>
        
        <nav class="nav-links">
          <router-link to="/home" class="nav-link">首页</router-link>
          <router-link to="/vip" class="nav-link active">VIP中心</router-link>
          <button @click="handleLogout" class="logout-btn">退出登录</button>
        </nav>
      </div>
    </header>
    
    <!-- VIP状态展示 -->
    <div class="vip-status-section">
      <div class="vip-status-card" :class="{ 'is-vip': isVip }">
        <div class="vip-banner">
          <h2>{{ isVip ? '尊贵的VIP会员' : '立即开通VIP会员' }}</h2>
          <p v-if="isVip" class="expiry-date">有效期至：{{ formatDate(vipExpiryDate) }}</p>
        </div>
        
        <div v-if="isVip" class="vip-benefits-summary">
          <p>您当前享有 <span class="benefits-count">{{ vipBenefits.length }}</span> 项专属特权</p>
          <div class="benefits-preview">
            <span v-for="benefit in vipBenefits.slice(0, 3)" :key="benefit.id" class="benefit-tag">
              {{ benefit.title }}
            </span>
            <span v-if="vipBenefits.length > 3" class="benefit-more">+{{ vipBenefits.length - 3 }} 项</span>
          </div>
        </div>
        
        <div v-else class="vip-promo">
          <p>开通VIP会员，享受多重专属特权</p>
          <div class="vip-promo-highlights">
            <span class="highlight-item">专辑8折优惠</span>
            <span class="highlight-item">演唱会优先购票</span>
            <span class="highlight-item">专属周边</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 主内容区 -->
    <main class="main-content">
      <!-- VIP特权列表 -->
      <section class="benefits-section">
        <h2 class="section-title">🎁 VIP专属特权</h2>
        
        <div class="benefits-grid">
          <div v-for="benefit in vipBenefits" :key="benefit.id" class="benefit-card">
            <div class="benefit-icon">{{ benefit.icon }}</div>
            <div class="benefit-content">
              <h3 class="benefit-title">{{ benefit.title }}</h3>
              <p class="benefit-description">{{ benefit.description }}</p>
            </div>
          </div>
        </div>
      </section>
      
      <!-- VIP购买选项 -->
      <section class="plans-section">
        <h2 class="section-title">💎 VIP会员套餐</h2>
        
        <div class="plans-grid">
          <div 
            v-for="plan in vipPlans" 
            :key="plan.id" 
            class="plan-card"
            :class="{ 'highlighted': plan.id === 2 }"
          >
            <div class="plan-header">
              <h3 class="plan-name">{{ plan.name }}</h3>
              <div class="plan-price">
                <span class="price-yuan">¥</span>
                <span class="price-number">{{ plan.price }}</span>
                <span class="price-unit">/{{ plan.duration }}</span>
              </div>
            </div>
            
            <div class="plan-body">
              <p class="plan-description">{{ plan.description }}</p>
              
              <ul class="plan-features">
                <li v-for="benefit in vipBenefits" :key="benefit.id" class="feature-item">
                  <span class="feature-check">✓</span>
                  <span class="feature-text">{{ benefit.title }}</span>
                </li>
                
                <li v-if="plan.id === 2" class="feature-item highlighted-feature">
                  <span class="feature-check">✓</span>
                  <span class="feature-text">额外赠送限量版专属周边</span>
                </li>
              </ul>
            </div>
            
            <div class="plan-footer">
              <button 
                class="buy-plan-btn"
                @click="buyVipPlan(plan)"
                :disabled="isVip"
              >
                {{ isVip ? '您已是VIP' : '立即开通' }}
              </button>
              
              <p v-if="isVip" class="already-vip">您当前已是VIP会员</p>
            </div>
          </div>
        </div>
      </section>
      
      <!-- VIP常见问题 -->
      <section class="faq-section">
        <h2 class="section-title">❓ 常见问题</h2>
        
        <div class="faq-list">
          <div v-for="faq in faqs" :key="faq.id" class="faq-item">
            <div class="faq-question" @click="toggleFaq(faq.id)">
              <h3>{{ faq.question }}</h3>
              <span class="faq-toggle">{{ faq.expanded ? '−' : '+' }}</span>
            </div>
            
            <div v-if="faq.expanded" class="faq-answer">
              <p>{{ faq.answer }}</p>
            </div>
          </div>
        </div>
      </section>
      
      <!-- VIP专属活动 -->
      <section class="vip-activities-section">
        <h2 class="section-title">🎉 VIP专属活动</h2>
        
        <div class="activities-grid">
          <div class="activity-card">
            <div class="activity-image">
              <img src="https://picsum.photos/600/300?random=50" alt="VIP粉丝见面会" />
            </div>
            <div class="activity-content">
              <h3 class="activity-title">VIP专属粉丝见面会</h3>
              <p class="activity-date">2024年10月15日</p>
              <p class="activity-description">仅限VIP会员参与的线下粉丝见面会，与薛之谦近距离互动，获得签名照和合影机会。</p>
              <button class="join-activity-btn">立即报名</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Navbar from '../components/Navbar.vue';
import { useUserStore } from '../store/index';
import { getVipBenefits, getVipInfo, buyVip, mockData } from '../api/index';

export default {
  name: 'VipView',
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    
    // 从store获取数据
    const userInfo = computed(() => userStore.getUserInfo);
    const isVip = computed(() => userStore.getIsVip);
    const vipExpiryDate = computed(() => userStore.getVipExpiryDate);
    
    // 状态
    const loading = ref(false);
    const error = ref('');
    const vipBenefits = ref([]);
    const vipPlans = ref([]);
    const faqs = ref([]);
    
    // 初始化FAQ数据
    faqs.value = [
      {
        id: 1,
        question: 'VIP会员可以享受哪些特权？',
        answer: 'VIP会员可以享受专辑购买8折优惠、演唱会门票优先购买、专属周边、粉丝见面会优先等多重特权。',
        expanded: false
      },
      {
        id: 2,
        question: '如何开通VIP会员？',
        answer: '在VIP中心页面选择合适的套餐，点击"立即开通"按钮，按照提示完成支付即可开通VIP会员。',
        expanded: false
      },
      {
        id: 3,
        question: 'VIP会员到期后如何续费？',
        answer: 'VIP会员到期前，系统会自动提醒您续费。您也可以在VIP中心页面主动选择续费套餐进行续费。',
        expanded: false
      },
      {
        id: 4,
        question: 'VIP会员可以退款吗？',
        answer: 'VIP会员服务一旦开通，不支持退款。请您在开通前确认好套餐选择。',
        expanded: false
      },
      {
        id: 5,
        question: '年度VIP和月度VIP有什么区别？',
        answer: '除了有效期不同外，年度VIP还额外赠送限量版专属周边，性价比更高。',
        expanded: false
      }
    ];
    
    // 格式化日期
    const formatDate = (date) => {
      if (!date) return '';
      const d = new Date(date);
      return d.toLocaleDateString('zh-CN');
    };
    
    // 加载VIP信息
    const loadVipInfo = async () => {
      loading.value = true;
      error.value = '';
      
      try {
        // 在模拟环境中，我们直接使用mock数据
        // 真实环境中应该调用getVipInfo接口
        // const response = await getVipInfo();
        
        // 模拟VIP信息
        const response = mockData.vipInfo();
        
        if (response.code === 200) {
          vipBenefits.value = response.data.benefits;
          vipPlans.value = response.data.plans;
        } else {
          console.error('Failed to load VIP info:', response.message);
        }
      } catch (err) {
        console.error('Error loading VIP info:', err);
      } finally {
        loading.value = false;
      }
    };
    
    // 切换FAQ展开/折叠状态
    const toggleFaq = (id) => {
      const faq = faqs.value.find(f => f.id === id);
      if (faq) {
        faq.expanded = !faq.expanded;
      }
    };
    
    // 购买VIP套餐
    const buyVipPlan = async (plan) => {
      if (isVip.value) {
        alert('您已是VIP会员，无需再次开通！');
        return;
      }
      
      try {
        // 在模拟环境中，我们直接模拟购买成功
        // 真实环境中应该调用buyVip接口
        // const response = await buyVip(plan.id);
        
        // 模拟购买成功
        alert(`成功开通${plan.name}！`);
        
        // 更新用户VIP状态
        const now = new Date();
        let expiryDate;
        
        if (plan.id === 1) {
          // 月度VIP，有效期30天
          expiryDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        } else if (plan.id === 2) {
          // 年度VIP，有效期365天
          expiryDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
        }
        
        userStore.setVipStatus(true, expiryDate);
        
        // 如果是年度VIP，提示赠送周边
        if (plan.id === 2) {
          alert('恭喜您获得年度VIP专属限量周边！我们将尽快为您安排寄送。');
        }
      } catch (err) {
        console.error('Error buying VIP plan:', err);
        alert('购买失败，请稍后重试');
      }
    };
    
    // 退出登录功能已在Navbar组件中实现
    
    // 组件挂载时加载数据
    onMounted(() => {
      loadVipInfo();
    });
    
    return {
      userInfo,
      isVip,
      vipExpiryDate,
      loading,
      error,
      vipBenefits,
      vipPlans,
      faqs,
      formatDate,
      toggleFaq,
      buyVipPlan,
      handleLogout
    };
  }
};
</script>

<style scoped>
.vip-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* 顶部导航栏 */
.navbar {
  background: rgba(255, 255, 255, 0.95);
  padding: 1rem 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  backdrop-filter: blur(10px);
}

.navbar-brand h1 {
  color: #e63946;
  font-size: 1.5rem;
  margin: 0;
}

.navbar-user {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #e63946;
}

.user-nickname {
  font-weight: 500;
  color: #495057;
}

.vip-badge {
  background: #ffd700;
  color: #333;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: bold;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-link {
  color: #495057;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.nav-link:hover,
.nav-link.active {
  background: #e63946;
  color: white;
}

.logout-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.logout-btn:hover {
  background: #5a6268;
}

/* VIP状态卡片 */
.vip-status-section {
  padding: 2rem;
  display: flex;
  justify-content: center;
}

.vip-status-card {
  background: rgba(255, 255, 255, 0.9);
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  width: 100%;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.vip-status-card.is-vip {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.vip-banner h2 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.expiry-date {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  opacity: 0.9;
}

.vip-benefits-summary p {
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.benefits-count {
  font-weight: bold;
  font-size: 1.5rem;
}

.benefits-preview {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
}

.benefit-tag {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
}

.benefit-more {
  background: rgba(255, 255, 255, 0.3);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: bold;
}

.vip-promo p {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #495057;
}

.vip-promo-highlights {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
}

.highlight-item {
  background: #e63946;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-weight: 500;
}

/* 主内容区 */
.main-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  color: #e63946;
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.75rem;
}

/* 特权列表 */
.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.benefit-card {
  background: rgba(255, 255, 255, 0.95);
  padding: 1.5rem;
  border-radius: 12px;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease;
}

.benefit-card:hover {
  transform: translateY(-5px);
}

.benefit-icon {
  font-size: 2rem;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.benefit-content h3 {
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

.benefit-description {
  color: #6c757d;
  font-size: 0.875rem;
  line-height: 1.5;
}

/* 套餐列表 */
.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.plan-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.plan-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.plan-card.highlighted {
  border: 2px solid #ffd700;
  position: relative;
}

.plan-card.highlighted::before {
  content: '推荐';
  position: absolute;
  top: 0;
  right: 0;
  background: #ffd700;
  color: #333;
  padding: 0.25rem 1rem;
  font-weight: bold;
  font-size: 0.75rem;
}

.plan-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  text-align: center;
}

.plan-name {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.plan-price {
  font-size: 2rem;
  font-weight: bold;
}

.price-yuan {
  font-size: 1.5rem;
}

.price-unit {
  font-size: 1rem;
  font-weight: normal;
  opacity: 0.8;
}

.plan-body {
  padding: 1.5rem;
}

.plan-description {
  color: #6c757d;
  margin-bottom: 1.5rem;
  text-align: center;
}

.plan-features {
  list-style: none;
  padding: 0;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
  color: #495057;
}

.feature-item:last-child {
  border-bottom: none;
}

.feature-check {
  color: #2a9d8f;
  font-weight: bold;
}

.feature-item.highlighted-feature {
  color: #e63946;
  font-weight: 500;
}

.plan-footer {
  padding: 1.5rem;
  text-align: center;
  border-top: 1px solid #f0f0f0;
}

.buy-plan-btn {
  background: #e63946;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.buy-plan-btn:hover:not(:disabled) {
  background: #c1121f;
}

.buy-plan-btn:disabled {
  background: #adb5bd;
  cursor: not-allowed;
}

.already-vip {
  color: #6c757d;
  margin-top: 0.5rem;
  font-style: italic;
}

/* FAQ部分 */
.faq-section {
  margin-bottom: 3rem;
}

.faq-list {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.faq-item {
  border-bottom: 1px solid #f0f0f0;
}

.faq-item:last-child {
  border-bottom: none;
}

.faq-question {
  padding: 1.5rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.3s ease;
}

.faq-question:hover {
  background: rgba(230, 57, 70, 0.05);
}

.faq-question h3 {
  color: #333;
  margin: 0;
  font-size: 1.1rem;
}

.faq-toggle {
  color: #e63946;
  font-size: 1.5rem;
  font-weight: bold;
  transition: transform 0.3s ease;
}

.faq-answer {
  padding: 0 1.5rem 1.5rem 1.5rem;
}

.faq-answer p {
  color: #6c757d;
  line-height: 1.6;
  margin: 0;
}

/* VIP专属活动 */
.vip-activities-section {
  margin-bottom: 3rem;
}

.activity-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  max-width: 800px;
  margin: 0 auto;
}

.activity-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.activity-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.activity-card:hover .activity-image img {
  transform: scale(1.05);
}

.activity-content {
  padding: 1.5rem;
}

.activity-title {
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

.activity-date {
  color: #e63946;
  font-weight: 500;
  margin-bottom: 1rem;
}

.activity-description {
  color: #6c757d;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.join-activity-btn {
  background: #e63946;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.join-activity-btn:hover {
  background: #c1121f;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
  
  .navbar-user {
    flex-direction: column;
    width: 100%;
    gap: 1rem;
  }
  
  .nav-links {
    width: 100%;
    justify-content: center;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .vip-status-section {
    padding: 1rem;
  }
  
  .benefits-grid,
  .plans-grid {
    grid-template-columns: 1fr;
  }
  
  .vip-banner h2 {
    font-size: 1.5rem;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .activity-image {
    height: 150px;
  }
}
</style>