<template>
  <div class="vip-center-container">
    <!-- 导航栏 -->
    <Navbar />
    
    <!-- 页面内容 -->
    <main class="vip-main-content">
      <!-- 会员头部信息 -->
      <section class="vip-header fade-in">
        <div class="vip-banner">
          <div class="vip-info">
            <div class="user-avatar-container">
              <img :src="userInfo.avatar" alt="用户头像" class="user-avatar">
              <div v-if="isVip" class="vip-badge-container" :class="vipLevel === 2 ? 'vip-premium' : 'vip-standard'">
                <span class="vip-badge-text">{{ vipLevel === 2 ? '高级VIP' : 'VIP' }}</span>
                <div class="vip-badge-shine"></div>
              </div>
            </div>
            <div class="vip-details">
              <h1>{{ userInfo.nickname }}</h1>
              <p v-if="isVip" class="vip-expiry">会员有效期至：{{ formatDate(vipExpiry) }}</p>
              <p v-else class="not-vip">暂未开通会员</p>
              <div class="vip-progress" v-if="isVip">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: `${vipProgress}%` }"></div>
                </div>
                <span class="progress-text">{{ remainingDays }}天 / {{ totalDays }}天</span>
              </div>
            </div>
            <div class="vip-actions">
              <button 
                v-if="!isVip" 
                class="btn btn-vip-primary"
                @click="openMembershipModal"
              >
                立即开通
              </button>
              <button 
                v-else-if="vipLevel === 1" 
                class="btn btn-vip-premium"
                @click="upgradeToPremium"
              >
                升级为高级会员
              </button>
              <button 
                v-else 
                class="btn btn-renew"
                @click="renewMembership"
              >
                续费会员
              </button>
            </div>
          </div>
        </div>
      </section>
      
      <!-- 会员权益 -->
      <section class="vip-benefits fade-in">
        <h2>会员专属权益</h2>
        <div class="benefits-tabs">
          <button 
            v-for="tab in benefitsTabs" 
            :key="tab.key" 
            :class="['tab-btn', { active: currentBenefitTab === tab.key }]"
            @click="switchBenefitTab(tab.key)"
          >
            {{ tab.label }}
          </button>
        </div>
        
        <!-- 演唱会门票权益 -->
        <div v-if="currentBenefitTab === 'tickets'" class="benefits-content">
          <div class="benefit-card card">
            <div class="benefit-icon">🎫</div>
            <div class="benefit-info">
              <h3>演唱会门票优先购买</h3>
              <p class="benefit-desc">
                <span v-if="vipLevel === 2" class="highlight">高级会员：提前48小时抢购特权</span>
                <span v-else-if="vipLevel === 1">基础会员：提前24小时抢购特权</span>
                <span v-else>非会员：正常时间购买</span>
              </p>
              <div class="benefit-details">
                <p>• 享受专属购票通道</p>
                <p>• 优先锁定心仪座位</p>
                <p>• 会员专属优惠价</p>
              </div>
            </div>
          </div>
          
          <!-- 即将开售演唱会 -->
          <div class="upcoming-tickets">
            <h3>即将开售演唱会</h3>
            <div class="tickets-list">
              <div v-for="ticket in upcomingTickets" :key="ticket.id" class="ticket-item card">
                <div class="ticket-info">
                  <h4>{{ ticket.name }}</h4>
                  <p><i class="icon">📍</i> {{ ticket.location }}</p>
                  <p><i class="icon">📅</i> {{ ticket.date }}</p>
                </div>
                <div class="ticket-sale-info">
                  <div class="sale-timeline">
                    <div class="sale-stage" :class="{ active: vipLevel >= 2 }"><span>高级VIP</span> {{ ticket.saleTimes.vipPremium }}</div>
                    <div class="sale-stage" :class="{ active: vipLevel >= 1 }"><span>VIP</span> {{ ticket.saleTimes.vip }}</div>
                    <div class="sale-stage"><span>普通用户</span> {{ ticket.saleTimes.normal }}</div>
                  </div>
                  <button 
                    class="btn"
                    :disabled="!canBuyTicket(ticket)"
                    @click="buyTicket(ticket.id)"
                  >
                    {{ canBuyTicket(ticket) ? '立即购票' : '敬请期待' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 专辑购买权益 -->
        <div v-else-if="currentBenefitTab === 'albums'" class="benefits-content">
          <div class="benefit-card card">
            <div class="benefit-icon">💽</div>
            <div class="benefit-info">
              <h3>限量版专辑购买通道</h3>
              <p class="benefit-desc">
                <span v-if="vipLevel === 2" class="highlight">高级会员：优先锁库存，享8折优惠</span>
                <span v-else-if="vipLevel === 1">基础会员：享9折优惠</span>
                <span v-else>非会员：原价购买</span>
              </p>
              <div class="benefit-details">
                <p>• 独家限量周边赠送</p>
                <p>• 专属签名版本优先购</p>
                <p>• 会员专属包装</p>
              </div>
            </div>
          </div>
          
          <!-- 限量专辑 -->
          <div class="limited-albums">
            <h3>独家限量专辑</h3>
            <div class="albums-grid">
              <div v-for="album in limitedAlbums" :key="album.id" class="album-item card">
                <img :src="album.cover" :alt="album.name" class="album-cover">
                <div class="album-info">
                  <h4>{{ album.name }}</h4>
                  <p class="album-price">
                    <span v-if="vipLevel === 2" class="vip-price">¥{{ album.price * 0.8 }}</span>
                    <span v-else-if="vipLevel === 1" class="vip-price">¥{{ album.price * 0.9 }}</span>
                    <span v-else class="original-price">¥{{ album.price }}</span>
                    <span v-if="vipLevel >= 1" class="original-price original-line-through">¥{{ album.price }}</span>
                  </p>
                  <div class="album-stock">库存：{{ album.stock }}张</div>
                  <button 
                    class="btn"
                    :disabled="album.stock <= 0"
                    @click="buyAlbum(album.id)"
                  >
                    {{ album.stock > 0 ? '立即购买' : '已售罄' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 周边折扣权益 -->
        <div v-else-if="currentBenefitTab === 'merchandise'" class="benefits-content">
          <div class="benefit-card card">
            <div class="benefit-icon">🎁</div>
            <div class="benefit-info">
              <h3>应援周边折扣</h3>
              <p class="benefit-desc">
                <span v-if="vipLevel === 2" class="highlight">高级会员：全场周边8折优惠</span>
                <span v-else-if="vipLevel === 1">基础会员：全场周边9折优惠</span>
                <span v-else>非会员：无折扣</span>
              </p>
              <div class="benefit-details">
                <p>• 会员专属定制周边</p>
                <p>• 生日当月额外95折</p>
                <p>• 买满299元免运费</p>
              </div>
            </div>
          </div>
          
          <!-- 精选周边 -->
          <div class="featured-merchandise">
            <h3>精选周边</h3>
            <div class="merchandise-grid">
              <div v-for="item in merchandise" :key="item.id" class="merchandise-item card">
                <img :src="item.image" :alt="item.name" class="merchandise-image">
                <div class="merchandise-info">
                  <h4>{{ item.name }}</h4>
                  <p class="merchandise-price">
                    <span v-if="vipLevel === 2" class="vip-price">¥{{ item.price * 0.8 }}</span>
                    <span v-else-if="vipLevel === 1" class="vip-price">¥{{ item.price * 0.9 }}</span>
                    <span v-else class="original-price">¥{{ item.price }}</span>
                    <span v-if="vipLevel >= 1" class="original-price original-line-through">¥{{ item.price }}</span>
                  </p>
                  <button class="btn" @click="viewMerchandise(item.id)">查看详情</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 电子徽章权益 -->
        <div v-else-if="currentBenefitTab === 'badges'" class="benefits-content">
          <div class="benefit-card card">
            <div class="benefit-icon">🏆</div>
            <div class="benefit-info">
              <h3>会员专属电子纪念徽章</h3>
              <p class="benefit-desc">按开通时长自动更新的专属电子徽章，彰显您的粉丝身份</p>
              <div class="benefit-details">
                <p>• 开通1个月：初遇徽章</p>
                <p>• 开通3个月：相随徽章</p>
                <p>• 开通6个月：守护徽章</p>
                <p>• 开通1年：永恒徽章</p>
                <p>• 开通2年：钻石徽章</p>
              </div>
            </div>
          </div>
          
          <!-- 我的徽章 -->
          <div class="my-badges">
            <h3>我的徽章</h3>
            <div class="badges-grid">
              <div 
                v-for="badge in badges" 
                :key="badge.id" 
                class="badge-item" 
                :class="{ active: badge.earned }"
              >
                <div class="badge-icon">{{ badge.icon }}</div>
                <div class="badge-name">{{ badge.name }}</div>
                <div class="badge-status">{{ badge.earned ? '已获得' : '未获得' }}</div>
                <div class="badge-condition" v-if="!badge.earned">{{ badge.condition }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <!-- 会员订单 -->
      <section class="vip-orders fade-in">
        <h2>我的订单</h2>
        <div class="orders-tabs">
          <button 
            v-for="tab in ordersTabs" 
            :key="tab.key" 
            :class="['tab-btn', { active: currentOrderTab === tab.key }]"
            @click="switchOrderTab(tab.key)"
          >
            {{ tab.label }}
          </button>
        </div>
        
        <div class="orders-content">
          <div 
            v-if="currentOrderTab === 'tickets' && ticketOrders.length === 0"
            class="empty-state"
          >
            暂无门票订单
          </div>
          <div 
            v-else-if="currentOrderTab === 'albums' && albumOrders.length === 0"
            class="empty-state"
          >
            暂无专辑订单
          </div>
          <div 
            v-else-if="currentOrderTab === 'merchandise' && merchandiseOrders.length === 0"
            class="empty-state"
          >
            暂无周边订单
          </div>
          
          <!-- 门票订单 -->
          <div v-else-if="currentOrderTab === 'tickets'" class="orders-list">
            <div v-for="order in ticketOrders" :key="order.id" class="order-item card">
              <div class="order-header">
                <h4>{{ order.eventName }}</h4>
                <span class="order-status" :class="order.status">{{ order.statusText }}</span>
              </div>
              <div class="order-details">
                <p><i class="icon">📅</i> {{ order.eventDate }}</p>
                <p><i class="icon">📍</i> {{ order.location }}</p>
                <p><i class="icon">🎫</i> {{ order.ticketType }} × {{ order.quantity }}</p>
                <p><i class="icon">💰</i> 总价：¥{{ order.totalPrice }}</p>
              </div>
              <div class="order-actions">
                <button 
                  v-if="order.status === 'pending'"
                  class="btn btn-primary"
                  @click="payOrder(order.id)"
                >
                  立即支付
                </button>
                <button 
                  v-if="order.status === 'paid'"
                  class="btn btn-secondary"
                  @click="viewTicket(order.id)"
                >
                  查看门票
                </button>
                <button 
                  v-if="order.status === 'pending'"
                  class="btn btn-cancel"
                  @click="cancelOrder(order.id)"
                >
                  取消订单
                </button>
              </div>
            </div>
          </div>
          
          <!-- 专辑订单 -->
          <div v-else-if="currentOrderTab === 'albums'" class="orders-list">
            <div v-for="order in albumOrders" :key="order.id" class="order-item card">
              <div class="order-header">
                <h4>{{ order.albumName }}</h4>
                <span class="order-status" :class="order.status">{{ order.statusText }}</span>
              </div>
              <div class="order-details">
                <p><i class="icon">💽</i> {{ order.albumVersion }}</p>
                <p><i class="icon">📦</i> × {{ order.quantity }}</p>
                <p><i class="icon">💰</i> 总价：¥{{ order.totalPrice }}</p>
                <p v-if="order.status === 'shipped'">
                  <i class="icon">🚚</i> 物流单号：{{ order.trackingNumber }}
                </p>
              </div>
              <div class="order-actions">
                <button 
                  v-if="order.status === 'pending'"
                  class="btn btn-primary"
                  @click="payOrder(order.id)"
                >
                  立即支付
                </button>
                <button 
                  v-if="order.status === 'shipped'"
                  class="btn btn-secondary"
                  @click="trackOrder(order.id)"
                >
                  查看物流
                </button>
              </div>
            </div>
          </div>
          
          <!-- 周边订单 -->
          <div v-else-if="currentOrderTab === 'merchandise'" class="orders-list">
            <div v-for="order in merchandiseOrders" :key="order.id" class="order-item card">
              <div class="order-header">
                <h4>{{ order.itemName }}</h4>
                <span class="order-status" :class="order.status">{{ order.statusText }}</span>
              </div>
              <div class="order-details">
                <p><i class="icon">🎁</i> {{ order.itemType }}</p>
                <p><i class="icon">📦</i> × {{ order.quantity }}</p>
                <p><i class="icon">💰</i> 总价：¥{{ order.totalPrice }}</p>
                <p v-if="order.status === 'shipped'">
                  <i class="icon">🚚</i> 物流单号：{{ order.trackingNumber }}
                </p>
              </div>
              <div class="order-actions">
                <button 
                  v-if="order.status === 'pending'"
                  class="btn btn-primary"
                  @click="payOrder(order.id)"
                >
                  立即支付
                </button>
                <button 
                  v-if="order.status === 'shipped'"
                  class="btn btn-secondary"
                  @click="trackOrder(order.id)"
                >
                  查看物流
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <!-- 应援积分 -->
      <section class="vip-points fade-in">
        <div class="points-card card">
          <h3>应援积分</h3>
          <div class="points-info">
            <div class="points-balance">
              <span class="points-number">{{ pointsBalance }}</span>
              <span class="points-label">积分</span>
            </div>
            <div class="points-history">
              <h4>近期积分变动</h4>
              <div class="history-list">
                <div v-for="record in pointsHistory" :key="record.id" class="history-item">
                  <div class="history-type">{{ record.type }}</div>
                  <div class="history-amount" :class="record.amount > 0 ? 'positive' : 'negative'">
                    {{ record.amount > 0 ? '+' : '' }}{{ record.amount }}
                  </div>
                  <div class="history-date">{{ formatDate(record.date) }}</div>
                </div>
              </div>
            </div>
            <div class="points-actions">
              <button class="btn btn-primary" @click="exchangePoints">积分兑换</button>
              <button class="btn btn-secondary" @click="viewAllHistory">查看全部记录</button>
            </div>
          </div>
        </div>
      </section>
    </main>
    
    <!-- 页脚 -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-links">
          <h4>官方链接</h4>
          <ul>
            <li><a href="https://weibo.com/xuezhiqian" target="_blank" rel="noopener noreferrer" class="external-link">薛之谦官方微博</a></li>
            <li><a href="https://music.163.com/#/artist?id=6452" target="_blank" rel="noopener noreferrer" class="external-link">网易云音乐主页</a></li>
            <li><a href="https://y.qq.com/n/ryqq/singer/002J4UUk29y8BY" target="_blank" rel="noopener noreferrer" class="external-link">QQ音乐主页</a></li>
            <li><a href="https://www.douyin.com/user/MS4wLjABAAAAdV8n9kMZc27z0l1f6OQ1p3K5V8V0X6cBcNQnXrXrXrXrXrXrXrXrXrXrXrXrXr" target="_blank" rel="noopener noreferrer" class="external-link">抖音官方账号</a></li>
          </ul>
        </div>
        <div class="footer-info">
          <h4>关于我们</h4>
          <p>薛之谦粉丝应援站 - 永远快乐薛之谦，我心终有谦谦结</p>
          <p>© 2024 薛之谦粉丝应援站. 保留所有权利.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '../store/index';
import Navbar from '../components/Navbar.vue';

export default {
  name: 'VIPCenter',
  components: {
    Navbar
  },
  setup() {
    const userStore = useUserStore();
    
    // 会员信息
    const userInfo = computed(() => userStore.getUserInfo);
    const isVip = computed(() => userStore.getIsVip);
    const vipLevel = computed(() => userStore.getVipLevel);
    const vipExpiry = computed(() => userStore.getVipExpiry);
    const pointsBalance = computed(() => userStore.getPointsBalance);
    
    // 会员进度计算
    const vipProgress = computed(() => {
      if (!isVip.value || !vipExpiry.value) return 0;
      const now = new Date();
      const expiry = new Date(vipExpiry.value);
      const totalDays = (expiry - new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate() - 30)) / (1000 * 60 * 60 * 24);
      const remainingDays = (expiry - now) / (1000 * 60 * 60 * 24);
      return Math.max(0, Math.min(100, (remainingDays / totalDays) * 100));
    });
    
    const totalDays = computed(() => {
      if (!isVip.value || !vipExpiry.value) return 0;
      const expiry = new Date(vipExpiry.value);
      return (expiry - new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate() - 30)) / (1000 * 60 * 60 * 24);
    });
    
    const remainingDays = computed(() => {
      if (!isVip.value || !vipExpiry.value) return 0;
      const now = new Date();
      const expiry = new Date(vipExpiry.value);
      const days = (expiry - now) / (1000 * 60 * 60 * 24);
      return Math.max(0, Math.ceil(days));
    });
    
    // 标签页状态
    const benefitsTabs = [
      { key: 'tickets', label: '演唱会门票' },
      { key: 'albums', label: '专辑购买' },
      { key: 'merchandise', label: '应援周边' },
      { key: 'badges', label: '电子徽章' }
    ];
    const currentBenefitTab = ref('tickets');
    
    const ordersTabs = [
      { key: 'tickets', label: '门票订单' },
      { key: 'albums', label: '专辑订单' },
      { key: 'merchandise', label: '周边订单' }
    ];
    const currentOrderTab = ref('tickets');
    
    // 即将开售演唱会
    const upcomingTickets = [
      {
        id: 1,
        name: '薛之谦2024「天外来物」世界巡回演唱会 - 上海站',
        location: '上海虹口足球场',
        date: '2024-06-15',
        saleTimes: {
          vipPremium: '2024-05-10 10:00',
          vip: '2024-05-11 10:00',
          normal: '2024-05-12 10:00'
        }
      },
      {
        id: 2,
        name: '薛之谦2024「天外来物」世界巡回演唱会 - 北京站',
        location: '北京工人体育场',
        date: '2024-07-20',
        saleTimes: {
          vipPremium: '2024-06-01 10:00',
          vip: '2024-06-02 10:00',
          normal: '2024-06-03 10:00'
        }
      },
      {
        id: 3,
        name: '薛之谦2024「天外来物」世界巡回演唱会 - 广州站',
        location: '广州天河体育场',
        date: '2024-08-25',
        saleTimes: {
          vipPremium: '2024-07-15 10:00',
          vip: '2024-07-16 10:00',
          normal: '2024-07-17 10:00'
        }
      }
    ];
    
    // 限量专辑
    const limitedAlbums = [
      {
        id: 1,
        name: '薛之谦2024新专辑「天外来物2」豪华版',
        cover: 'https://p1.music.126.net/8lG9Zuc4NkqGpCk23iXU4A==/109951165107256460.jpg',
        price: 298,
        stock: 156
      },
      {
        id: 2,
        name: '薛之谦「尘」签名限量版',
        cover: 'https://p1.music.126.net/JvZ9mG4u2T0nQaJ38W00vQ==/109951164563917071.jpg',
        price: 398,
        stock: 42
      },
      {
        id: 3,
        name: '薛之谦「渡 The Crossing」黑胶唱片',
        cover: 'https://p1.music.126.net/rs0i9400s3fY02n1pZg1Dw==/109951163144113282.jpg',
        price: 598,
        stock: 28
      }
    ];
    
    // 精选周边
    const merchandise = [
      {
        id: 1,
        name: '薛之谦「天外来物」主题T恤',
        image: 'https://picsum.photos/id/96/300/300',
        price: 198
      },
      {
        id: 2,
        name: '薛之谦应援手环',
        image: 'https://picsum.photos/id/20/300/300',
        price: 59
      },
      {
        id: 3,
        name: '薛之谦「天外来物」演唱会海报',
        image: 'https://picsum.photos/id/30/300/300',
        price: 89
      },
      {
        id: 4,
        name: '薛之谦应援灯牌',
        image: 'https://picsum.photos/id/40/300/300',
        price: 129
      }
    ];
    
    // 徽章数据
    const badges = [
      {
        id: 1,
        name: '初遇徽章',
        icon: '🌱',
        condition: '开通1个月',
        earned: vipLevel.value >= 1 && remainingDays.value >= 25
      },
      {
        id: 2,
        name: '相随徽章',
        icon: '🤝',
        condition: '开通3个月',
        earned: vipLevel.value >= 1 && remainingDays.value >= 85
      },
      {
        id: 3,
        name: '守护徽章',
        icon: '🛡️',
        condition: '开通6个月',
        earned: vipLevel.value >= 1 && remainingDays.value >= 175
      },
      {
        id: 4,
        name: '永恒徽章',
        icon: '💎',
        condition: '开通1年',
        earned: vipLevel.value >= 2
      },
      {
        id: 5,
        name: '钻石徽章',
        icon: '👑',
        condition: '开通2年',
        earned: false
      }
    ];
    
    // 订单数据
    const ticketOrders = [
      {
        id: 1,
        eventName: '薛之谦2024「天外来物」世界巡回演唱会 - 上海站',
        eventDate: '2024-06-15',
        location: '上海虹口足球场',
        ticketType: 'VIP区',
        quantity: 2,
        totalPrice: 1998,
        status: 'paid',
        statusText: '已支付'
      },
      {
        id: 2,
        eventName: '薛之谦2024「天外来物」世界巡回演唱会 - 北京站',
        eventDate: '2024-07-20',
        location: '北京工人体育场',
        ticketType: 'A区',
        quantity: 1,
        totalPrice: 799,
        status: 'pending',
        statusText: '待支付'
      }
    ];
    
    const albumOrders = [
      {
        id: 3,
        albumName: '薛之谦2024新专辑「天外来物2」豪华版',
        albumVersion: '豪华版',
        quantity: 1,
        totalPrice: 238.4, // 8折后价格
        status: 'shipped',
        statusText: '已发货',
        trackingNumber: 'SF1234567890'
      }
    ];
    
    const merchandiseOrders = [
      {
        id: 4,
        itemName: '薛之谦「天外来物」主题T恤',
        itemType: 'L码',
        quantity: 2,
        totalPrice: 316.8, // 8折后价格
        status: 'pending',
        statusText: '待支付'
      },
      {
        id: 5,
        itemName: '薛之谦应援手环',
        itemType: '标准款',
        quantity: 3,
        totalPrice: 141.6, // 8折后价格
        status: 'shipped',
        statusText: '已发货',
        trackingNumber: 'YT0987654321'
      }
    ];
    
    // 积分记录
    const pointsHistory = [
      {
        id: 1,
        type: '歌词接龙游戏奖励',
        amount: 10,
        date: new Date('2024-05-01')
      },
      {
        id: 2,
        type: '会员每日签到',
        amount: 5,
        date: new Date('2024-05-02')
      },
      {
        id: 3,
        type: '积分兑换优惠券',
        amount: -50,
        date: new Date('2024-04-28')
      },
      {
        id: 4,
        type: '演唱会门票购买奖励',
        amount: 50,
        date: new Date('2024-04-20')
      },
      {
        id: 5,
        type: '会员生日额外奖励',
        amount: 100,
        date: new Date('2024-04-15')
      }
    ];
    
    // 格式化日期
    const formatDate = (date) => {
      if (!date) return '';
      const d = new Date(date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };
    
    // 检查是否可以购票
    const canBuyTicket = (ticket) => {
      const now = new Date();
      const vipPremiumSaleTime = new Date(ticket.saleTimes.vipPremium);
      const vipSaleTime = new Date(ticket.saleTimes.vip);
      
      if (vipLevel.value === 2 && now >= vipPremiumSaleTime) {
        return true;
      } else if (vipLevel.value === 1 && now >= vipSaleTime) {
        return true;
      }
      return false;
    };
    
    // 切换标签页
    const switchBenefitTab = (tabKey) => {
      currentBenefitTab.value = tabKey;
    };
    
    const switchOrderTab = (tabKey) => {
      currentOrderTab.value = tabKey;
    };
    
    // 会员操作
    const openMembershipModal = () => {
      // 打开会员开通模态框
      console.log('Open membership modal');
    };
    
    const upgradeToPremium = () => {
      // 升级为高级会员
      console.log('Upgrade to premium membership');
    };
    
    const renewMembership = () => {
      // 续费会员
      console.log('Renew membership');
    };
    
    // 购票操作
    const buyTicket = (ticketId) => {
      // 购票操作
      console.log('Buy ticket:', ticketId);
    };
    
    // 专辑购买
    const buyAlbum = (albumId) => {
      // 购买专辑
      console.log('Buy album:', albumId);
    };
    
    // 周边查看
    const viewMerchandise = (itemId) => {
      // 查看周边详情
      console.log('View merchandise:', itemId);
    };
    
    // 订单操作
    const payOrder = (orderId) => {
      // 支付订单
      console.log('Pay order:', orderId);
    };
    
    const viewTicket = (orderId) => {
      // 查看门票
      console.log('View ticket:', orderId);
    };
    
    const cancelOrder = (orderId) => {
      // 取消订单
      console.log('Cancel order:', orderId);
    };
    
    const trackOrder = (orderId) => {
      // 查看物流
      console.log('Track order:', orderId);
    };
    
    // 积分操作
    const exchangePoints = () => {
      // 积分兑换
      console.log('Exchange points');
    };
    
    const viewAllHistory = () => {
      // 查看全部积分记录
      console.log('View all points history');
    };
    
    // 组件挂载时初始化
    onMounted(() => {
      // 可以在这里加载用户的订单、积分等数据
    });
    
    return {
      userInfo,
      isVip,
      vipLevel,
      vipExpiry,
      vipProgress,
      totalDays,
      remainingDays,
      pointsBalance,
      currentBenefitTab,
      currentOrderTab,
      benefitsTabs,
      ordersTabs,
      upcomingTickets,
      limitedAlbums,
      merchandise,
      badges,
      ticketOrders,
      albumOrders,
      merchandiseOrders,
      pointsHistory,
      formatDate,
      canBuyTicket,
      switchBenefitTab,
      switchOrderTab,
      openMembershipModal,
      upgradeToPremium,
      renewMembership,
      buyTicket,
      buyAlbum,
      viewMerchandise,
      payOrder,
      viewTicket,
      cancelOrder,
      trackOrder,
      exchangePoints,
      viewAllHistory
    };
  }
};
</script>

<style scoped>
.vip-center-container {
  min-height: 100vh;
  padding-top: 80px; /* 为固定导航栏留出空间 */
}

.vip-main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

/* 会员头部信息 */
.vip-header {
  margin-bottom: 3rem;
}

.vip-banner {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  border-radius: 12px;
  padding: 2rem;
  color: var(--text-light);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.vip-info {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.user-avatar-container {
  position: relative;
}

.user-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid rgba(255, 255, 255, 0.3);
  background: white;
}

.vip-badge-container {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--vip-standard-color);
  border: 3px solid white;
  overflow: hidden;
  animation: glow 2s infinite;
}

.vip-badge-container.vip-premium {
  background: var(--vip-premium-color);
}

.vip-badge-text {
  font-weight: 700;
  font-size: 0.8rem;
  text-align: center;
  z-index: 1;
}

.vip-badge-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.3) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: rotate(30deg);
  animation: shine 2s infinite;
}

.vip-details {
  flex: 1;
  min-width: 300px;
}

.vip-details h1 {
  color: var(--text-light);
  margin-bottom: 0.5rem;
}

.vip-details h1::after {
  background: var(--text-light);
}

.vip-expiry,
.not-vip {
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.9);
}

.vip-progress {
  margin-top: 1rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: white;
  transition: width 1s ease;
}

.progress-text {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
}

.vip-actions {
  display: flex;
  gap: 1rem;
}

.btn-vip-primary {
  background: white;
  color: var(--primary-color);
}

.btn-vip-primary:hover {
  background: var(--background-primary);
}

.btn-vip-premium {
  background: var(--vip-premium-color);
  color: white;
  border: 2px solid var(--vip-premium-color);
}

.btn-vip-premium:hover {
  background: transparent;
}

.btn-renew {
  background: var(--secondary-light);
  color: white;
  border: 2px solid var(--secondary-light);
}

.btn-renew:hover {
  background: transparent;
}

/* 会员权益 */
.vip-benefits {
  margin-bottom: 3rem;
}

.benefits-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.benefits-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.benefit-card {
  display: flex;
  gap: 2rem;
  padding: 2rem;
  align-items: center;
}

.benefit-icon {
  font-size: 3rem;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 60, 87, 0.1);
  border-radius: 50%;
}

.benefit-info {
  flex: 1;
}

.benefit-desc {
  margin-bottom: 1rem;
  line-height: 1.6;
}

.highlight {
  color: var(--primary-color);
  font-weight: 600;
}

.benefit-details p {
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}

/* 即将开售演唱会 */
.upcoming-tickets,
.limited-albums,
.featured-merchandise,
.my-badges {
  margin-top: 2rem;
}

.tickets-list,
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.ticket-item,
.order-item {
  display: flex;
  flex-direction: column;
}

.ticket-info,
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.order-status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.order-status.pending {
  background: rgba(255, 152, 0, 0.1);
  color: var(--warning-color);
}

.order-status.paid {
  background: rgba(76, 175, 80, 0.1);
  color: var(--success-color);
}

.order-status.shipped {
  background: rgba(33, 150, 243, 0.1);
  color: var(--info-color);
}

.sale-timeline {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.sale-stage {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: var(--background-secondary);
  border-radius: 8px;
  opacity: 0.6;
  transition: all var(--transition-speed) ease;
}

.sale-stage.active {
  opacity: 1;
  background: rgba(255, 60, 87, 0.1);
  border: 1px solid var(--primary-color);
}

.ticket-sale-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1rem;
}

/* 专辑网格 */
.albums-grid,
.merchandise-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
}

.album-item,
.merchandise-item {
  display: flex;
  flex-direction: column;
  text-align: center;
}

.album-cover,
.merchandise-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
  margin-bottom: 1rem;
  transition: transform var(--transition-speed) ease;
}

.album-item:hover .album-cover,
.merchandise-item:hover .merchandise-image {
  transform: scale(1.05);
}

.album-price,
.merchandise-price {
  margin-bottom: 0.5rem;
}

.vip-price {
  color: var(--primary-color);
  font-weight: 700;
  font-size: 1.25rem;
  margin-right: 0.5rem;
}

.original-price {
  color: var(--text-secondary);
}

.original-line-through {
  text-decoration: line-through;
}

.album-stock {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

/* 徽章网格 */
.badges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1.5rem;
}

.badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1rem;
  background: var(--background-secondary);
  border-radius: 8px;
  transition: all var(--transition-speed) ease;
  opacity: 0.6;
}

.badge-item.active {
  opacity: 1;
  background: rgba(255, 60, 87, 0.1);
  border: 1px solid var(--primary-color);
}

.badge-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.badge-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.badge-status {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.badge-condition {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

/* 会员订单 */
.vip-orders {
  margin-bottom: 3rem;
}

.orders-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.empty-state {
  text-align: center;
  padding: 4rem;
  color: var(--text-secondary);
  background: var(--background-secondary);
  border-radius: 8px;
}

.order-details {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.order-details p {
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}

.order-actions {
  display: flex;
  gap: 1rem;
}

.btn-secondary {
  background: transparent;
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
}

.btn-secondary:hover {
  background: var(--primary-color);
  color: var(--text-light);
}

.btn-cancel {
  background: transparent;
  color: var(--danger-color);
  border: 2px solid var(--danger-color);
}

.btn-cancel:hover {
  background: var(--danger-color);
  color: var(--text-light);
}

/* 应援积分 */
.vip-points {
  margin-bottom: 3rem;
}

.points-card {
  padding: 2rem;
}

.points-info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.points-balance {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  justify-content: center;
}

.points-number {
  font-size: 3rem;
  font-weight: 700;
  color: var(--primary-color);
}

.points-label {
  font-size: 1.25rem;
  color: var(--text-secondary);
}

.points-history h4 {
  margin-bottom: 1rem;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--background-secondary);
  border-radius: 8px;
}

.history-type {
  flex: 1;
}

.history-amount {
  font-weight: 600;
  margin: 0 1rem;
}

.history-amount.positive {
  color: var(--success-color);
}

.history-amount.negative {
  color: var(--danger-color);
}

.history-date {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.points-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

/* 动画 */
@keyframes glow {
  0% {
    box-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
  }
  100% {
    box-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
  }
}

@keyframes shine {
  0% {
    transform: translateX(-100%) rotate(30deg);
  }
  100% {
    transform: translateX(100%) rotate(30deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .vip-main-content {
    padding: 1rem;
  }
  
  .vip-info {
    flex-direction: column;
    text-align: center;
  }
  
  .user-avatar {
    width: 100px;
    height: 100px;
  }
  
  .vip-badge-container {
    width: 50px;
    height: 50px;
  }
  
  .vip-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .benefits-tabs,
  .orders-tabs {
    justify-content: center;
  }
  
  .benefit-card {
    flex-direction: column;
    text-align: center;
  }
  
  .benefit-icon {
    margin-bottom: 1rem;
  }
  
  .ticket-info,
  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .ticket-sale-info {
    align-items: flex-start;
  }
  
  .order-actions {
    flex-direction: column;
  }
  
  .albums-grid,
  .merchandise-grid {
    grid-template-columns: 1fr;
  }
  
  .badges-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}
</style>