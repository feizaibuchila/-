<template>
  <div class="detail-container">
    <!-- 返回按钮 -->
    <div class="back-section">
      <button @click="goBack" class="back-btn">
        ← 返回列表
      </button>
    </div>
    
    <!-- 详情内容 -->
    <div v-if="loading" class="loading">加载中...</div>
    
    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>
    
    <div v-else-if="itemDetail" class="detail-content">
      <!-- 演唱会详情 -->
      <div v-if="type === 'concerts'" class="concert-detail">
        <div class="detail-header">
          <div class="detail-image">
            <img :src="itemDetail.image" :alt="itemDetail.title" />
          </div>
          
          <div class="detail-info">
            <h1 class="detail-title">{{ itemDetail.title }}</h1>
            
            <div class="detail-meta">
              <div class="meta-item">
                <span class="meta-label">日期：</span>
                <span class="meta-value">{{ itemDetail.date }}</span>
              </div>
              
              <div class="meta-item">
                <span class="meta-label">地点：</span>
                <span class="meta-value">{{ itemDetail.location }}</span>
              </div>
              
              <div class="meta-item">
                <span class="meta-label">状态：</span>
                <span class="status-badge" :class="itemDetail.ticketStatus === '预售中' ? 'presale' : 'coming'">
                  {{ itemDetail.ticketStatus }}
                </span>
              </div>
            </div>
            
            <div class="action-buttons">
              <button 
                class="buy-ticket-btn"
                :class="{ disabled: itemDetail.ticketStatus !== '预售中' }"
                :disabled="itemDetail.ticketStatus !== '预售中'"
                @click="buyTicket"
              >
                {{ itemDetail.ticketStatus === '预售中' ? '立即购票' : '敬请期待' }}
              </button>
              
              <button 
                class="add-calendar-btn"
                @click="addToCalendar"
              >
                添加到日历
              </button>
            </div>
          </div>
        </div>
        
        <div class="detail-body">
          <div class="section">
            <h2>演出介绍</h2>
            <p class="description">{{ itemDetail.description }}</p>
            <p>薛之谦「天外来物」世界巡回演唱会，将为粉丝带来全新的视听体验。本次巡演将呈现多首经典歌曲和新歌，舞台设计颠覆以往，打造沉浸式音乐盛宴。</p>
          </div>
          
          <div class="section">
            <h2>演出曲目</h2>
            <ul class="song-list">
              <li>演员</li>
              <li>丑八怪</li>
              <li>刚刚好</li>
              <li>意外</li>
              <li>认真的雪</li>
              <li>你还要我怎样</li>
              <li>违背的青春</li>
              <li>天外来物</li>
              <li>无数</li>
              <li>可</li>
            </ul>
          </div>
          
          <div class="section">
            <h2>购票须知</h2>
            <ul class="notice-list">
              <li>购票时请确认好个人信息，避免因信息错误导致无法入场</li>
              <li>门票一经售出，不支持退换</li>
              <li>VIP用户可提前10分钟购票，享受优先选座权益</li>
              <li>演出前请关注官方公告，了解最新动态</li>
            </ul>
          </div>
        </div>
      </div>
      
      <!-- 专辑详情 -->
      <div v-else-if="type === 'albums'" class="album-detail">
        <div class="detail-header">
          <div class="detail-image">
            <img :src="itemDetail.cover" :alt="itemDetail.title" />
          </div>
          
          <div class="detail-info">
            <h1 class="detail-title">{{ itemDetail.title }}</h1>
            <h2 class="artist-name">薛之谦</h2>
            
            <div class="detail-meta">
              <div class="meta-item">
                <span class="meta-label">发行日期：</span>
                <span class="meta-value">{{ itemDetail.releaseDate }}</span>
              </div>
              
              <div class="meta-item">
                <span class="meta-label">歌曲数量：</span>
                <span class="meta-value">{{ itemDetail.tracks }} 首</span>
              </div>
            </div>
            
            <div class="action-buttons">
              <button 
                class="buy-album-btn"
                @click="buyAlbum"
              >
                {{ isVip ? 'VIP特惠购买' : '立即购买' }}
              </button>
              
              <button 
                class="add-playlist-btn"
                @click="addToPlaylist"
              >
                添加到播放列表
              </button>
            </div>
          </div>
        </div>
        
        <div class="detail-body">
          <div class="section">
            <h2>专辑介绍</h2>
            <p class="description">{{ itemDetail.description }}</p>
            <p>这张专辑凝聚了薛之谦对音乐的热爱和对生活的感悟，每一首歌都讲述着不同的故事，展现了薛之谦独特的音乐风格和创作才华。</p>
          </div>
          
          <div class="section">
            <h2>曲目列表</h2>
            <ul class="song-list">
              <li v-for="(song, index) in trackList" :key="index" class="track-item">
                <span class="track-number">{{ index + 1 }}</span>
                <span class="track-name">{{ song }}</span>
                <button class="play-btn">▶</button>
              </li>
            </ul>
          </div>
          
          <div class="section">
            <h2>购买优惠</h2>
            <div class="price-info">
              <div class="original-price">原价：¥{{ albumPrice }}</div>
              <div class="vip-price" v-if="isVip">VIP价：¥{{ vipAlbumPrice }}</div>
            </div>
            <p class="price-note">* VIP用户购买数字专辑享受8折优惠</p>
          </div>
        </div>
      </div>
      
      <!-- 新歌预告详情 -->
      <div v-else-if="type === 'newsongs'" class="song-detail">
        <div class="detail-header">
          <div class="detail-image">
            <img :src="itemDetail.cover" :alt="itemDetail.title" />
          </div>
          
          <div class="detail-info">
            <h1 class="detail-title">{{ itemDetail.title }}</h1>
            <h2 class="artist-name">{{ itemDetail.artist }}</h2>
            
            <div class="detail-meta">
              <div class="meta-item">
                <span class="meta-label">预计发行：</span>
                <span class="meta-value">{{ itemDetail.releaseDate }}</span>
              </div>
              
              <div class="meta-item">
                <span class="meta-label">状态：</span>
                <span class="status-badge" :class="itemDetail.status === '即将上线' ? 'coming-soon' : 'in-progress'">
                  {{ itemDetail.status }}
                </span>
              </div>
            </div>
            
            <div class="action-buttons">
              <button 
                v-if="itemDetail.preview"
                class="preview-btn"
                @click="playPreview"
              >
                试听预告
              </button>
              
              <button 
                class="remind-btn"
                @click="setReminder"
              >
                设置提醒
              </button>
            </div>
          </div>
        </div>
        
        <div class="detail-body">
          <div class="section">
            <h2>歌曲介绍</h2>
            <p class="song-description">这是薛之谦的全新单曲，由知名音乐制作人操刀，融合了薛之谦独特的音乐风格和情感表达，将为听众带来不一样的听觉体验。</p>
          </div>
          
          <div class="section">
            <h2>制作团队</h2>
            <ul class="team-list">
              <li><strong>作词：</strong>薛之谦</li>
              <li><strong>作曲：</strong>薛之谦</li>
              <li><strong>编曲：</strong>郑楠</li>
              <li><strong>制作人：</strong>薛之谦</li>
            </ul>
          </div>
          
          <div class="section" v-if="itemDetail.status === '即将上线'">
            <h2>上线倒计时</h2>
            <div class="countdown">
              <div class="countdown-item">
                <span class="countdown-value">{{ days }}</span>
                <span class="countdown-label">天</span>
              </div>
              <div class="countdown-item">
                <span class="countdown-value">{{ hours }}</span>
                <span class="countdown-label">时</span>
              </div>
              <div class="countdown-item">
                <span class="countdown-value">{{ minutes }}</span>
                <span class="countdown-label">分</span>
              </div>
              <div class="countdown-item">
                <span class="countdown-value">{{ seconds }}</span>
                <span class="countdown-label">秒</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../store/index';
import { getDetail } from '../api/index';

export default {
  name: 'DetailView',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const userStore = useUserStore();
    
    // 从路由参数中获取ID和类型
    const id = computed(() => route.params.id);
    const type = computed(() => route.params.type);
    
    // 状态
    const loading = ref(false);
    const error = ref('');
    const itemDetail = ref(null);
    const isVip = computed(() => userStore.getIsVip);
    
    // 专辑相关数据
    const trackList = ref([
      '天外来物',
      '无数',
      '陪你去流浪',
      '像风一样',
      '迟迟',
      '可',
      '洛城',
      '变废为宝',
      '野心',
      '笑场'
    ]);
    const albumPrice = ref(20);
    const vipAlbumPrice = computed(() => Math.floor(albumPrice.value * 0.8));
    
    // 倒计时相关数据
    const days = ref(0);
    const hours = ref(0);
    const minutes = ref(0);
    const seconds = ref(0);
    let countdownInterval = null;
    
    // 加载详情数据
    const loadDetail = async () => {
      loading.value = true;
      error.value = '';
      
      try {
        // 在模拟环境中，我们直接模拟数据
        // 真实环境中应该调用getDetail接口
        // const response = await getDetail(id.value, type.value);
        
        // 模拟数据
        let mockItem;
        
        if (type.value === 'concerts') {
          mockItem = {
            id: id.value,
            title: `薛之谦「天外来物」世界巡回演唱会-${id.value === '1' ? '上海' : id.value === '2' ? '北京' : '广州'}站`,
            date: id.value === '1' ? '2024-06-15' : id.value === '2' ? '2024-07-20' : '2024-08-10',
            location: id.value === '1' ? '上海梅赛德斯奔驰文化中心' : id.value === '2' ? '北京工人体育场' : '广州天河体育中心',
            image: `https://picsum.photos/500/300?random=1${id.value}`, 
            description: '薛之谦2026全新巡演，带来视听盛宴，与粉丝共度难忘夜晚。',
            ticketStatus: id.value === '2' ? '预售中' : '即将开售'
          };
        } else if (type.value === 'albums') {
          mockItem = {
            id: id.value,
            title: id.value === '1' ? '无数' : id.value === '2' ? '尘' : '意外',
            releaseDate: id.value === '1' ? '2022-07-17' : id.value === '2' ? '2019-12-27' : '2013-11-11',
            cover: `https://picsum.photos/500/500?random=2${id.value}`, 
            description: id.value === '1' ? '薛之谦2022年全新专辑《无数》，包含10首原创歌曲。' : 
                         id.value === '2' ? '薛之谦2019年专辑《尘》，展现音乐创作新高度。' : 
                         '薛之谦经典专辑《意外》，收录多首热门歌曲。',
            tracks: 10
          };
        } else if (type.value === 'newsongs') {
          mockItem = {
            id: id.value,
            title: id.value === '1' ? '未完成的歌' : '星河',
            artist: '薛之谦',
            releaseDate: id.value === '1' ? '2024-08-01' : '2024-09-15',
            cover: `https://picsum.photos/500/500?random=3${id.value}`, 
            status: id.value === '1' ? '即将上线' : '制作中',
            preview: id.value === '1' ? 'https://picsum.photos/100/100?random=41' : null
          };
        }
        
        itemDetail.value = mockItem;
        
        // 如果是即将上线的新歌，启动倒计时
        if (type.value === 'newsongs' && itemDetail.value && itemDetail.value.status === '即将上线') {
          startCountdown();
        }
      } catch (err) {
        error.value = '加载详情失败，请稍后重试';
        console.error('Load detail error:', err);
      } finally {
        loading.value = false;
      }
    };
    
    // 启动倒计时
    const startCountdown = () => {
      // 清除之前的定时器
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
      
      // 更新倒计时
      const updateCountdown = () => {
        const releaseDate = new Date(itemDetail.value.releaseDate);
        const now = new Date();
        const diff = releaseDate - now;
        
        if (diff <= 0) {
          // 已经上线
          days.value = 0;
          hours.value = 0;
          minutes.value = 0;
          seconds.value = 0;
          clearInterval(countdownInterval);
          return;
        }
        
        days.value = Math.floor(diff / (1000 * 60 * 60 * 24));
        hours.value = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        minutes.value = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        seconds.value = Math.floor((diff % (1000 * 60)) / 1000);
      };
      
      // 立即更新一次
      updateCountdown();
      
      // 设置定时器，每秒更新一次
      countdownInterval = setInterval(updateCountdown, 1000);
    };
    
    // 返回上一页
    const goBack = () => {
      router.push('/home');
    };
    
    // 购买演唱会门票
    const buyTicket = () => {
      if (isVip.value) {
        alert('作为VIP用户，您可以提前10分钟购票，享受优先选座权益！');
      } else {
        alert('购票成功！请留意订单详情。');
      }
    };
    
    // 添加到日历
    const addToCalendar = () => {
      alert('已添加到日历！');
    };
    
    // 购买专辑
    const buyAlbum = () => {
      const price = isVip.value ? vipAlbumPrice.value : albumPrice.value;
      alert(`购买成功！您以¥${price}的价格购买了专辑《${itemDetail.value.title}》`);
    };
    
    // 添加到播放列表
    const addToPlaylist = () => {
      alert('已添加到播放列表！');
    };
    
    // 试听预告
    const playPreview = () => {
      alert('开始播放歌曲预告！');
    };
    
    // 设置提醒
    const setReminder = () => {
      alert('已设置上线提醒！');
    };
    
    // 组件挂载时加载数据
    onMounted(() => {
      loadDetail();
    });
    
    // 组件卸载时清除定时器
    onUnmounted(() => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    });
    
    return {
      id,
      type,
      loading,
      error,
      itemDetail,
      isVip,
      trackList,
      albumPrice,
      vipAlbumPrice,
      days,
      hours,
      minutes,
      seconds,
      goBack,
      buyTicket,
      addToCalendar,
      buyAlbum,
      addToPlaylist,
      playPreview,
      setReminder
    };
  }
};
</script>

<style scoped>
.detail-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
}

/* 返回按钮 */
.back-section {
  margin-bottom: 2rem;
}

.back-btn {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #ced4da;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.back-btn:hover {
  background: #e63946;
  color: white;
  border-color: #e63946;
}

/* 加载和错误状态 */
.loading,
.error-message {
  text-align: center;
  padding: 4rem;
  color: #6c757d;
}

.error-message {
  color: #e63946;
  background: #fee;
  border-radius: 6px;
  margin-top: 2rem;
}

/* 详情内容 */
.detail-content {
  max-width: 1200px;
  margin: 0 auto;
}

/* 详情头部 */
.detail-header {
  display: flex;
  gap: 2rem;
  background: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.detail-image {
  flex-shrink: 0;
  width: 300px;
  height: 300px;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.detail-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.detail-title {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.artist-name {
  font-size: 1.25rem;
  color: #e63946;
  margin-bottom: 1.5rem;
}

.detail-meta {
  margin-bottom: 2rem;
}

.meta-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
}

.meta-label {
  font-weight: 500;
  color: #495057;
  min-width: 80px;
}

.meta-value {
  color: #6c757d;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.presale {
  background: #2a9d8f;
  color: white;
}

.status-badge.coming {
  background: #e9c46a;
  color: #264653;
}

.status-badge.coming-soon {
  background: #e63946;
  color: white;
}

.status-badge.in-progress {
  background: #6c757d;
  color: white;
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.action-buttons button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.buy-ticket-btn {
  background: #e63946;
  color: white;
}

.buy-ticket-btn:hover:not(.disabled) {
  background: #c1121f;
}

.buy-ticket-btn.disabled {
  background: #adb5bd;
  cursor: not-allowed;
}

.add-calendar-btn {
  background: #457b9d;
  color: white;
}

.add-calendar-btn:hover {
  background: #1d3557;
}

.buy-album-btn {
  background: #e63946;
  color: white;
}

.buy-album-btn:hover {
  background: #c1121f;
}

.add-playlist-btn {
  background: #457b9d;
  color: white;
}

.add-playlist-btn:hover {
  background: #1d3557;
}

.preview-btn {
  background: #2a9d8f;
  color: white;
}

.preview-btn:hover {
  background: #1b4332;
}

.remind-btn {
  background: #e9c46a;
  color: #264653;
}

.remind-btn:hover {
  background: #d4a373;
}

/* 详情主体 */
.detail-body {
  background: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.section {
  margin-bottom: 2.5rem;
}

.section:last-child {
  margin-bottom: 0;
}

.section h2 {
  color: #e63946;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f0f0f0;
}

.description,
.song-description {
  color: #495057;
  line-height: 1.6;
  margin-bottom: 1rem;
}

/* 曲目列表 */
.song-list {
  list-style: none;
  padding: 0;
}

.song-list li {
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
  color: #495057;
}

.song-list li:last-child {
  border-bottom: none;
}

.track-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.track-number {
  color: #6c757d;
  font-size: 0.875rem;
  min-width: 20px;
}

.track-name {
  flex: 1;
  color: #495057;
}

.play-btn {
  background: #e63946;
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

.play-btn:hover {
  background: #c1121f;
}

/* 购票须知和制作团队 */
.notice-list,
.team-list {
  list-style: none;
  padding: 0;
}

.notice-list li,
.team-list li {
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
  color: #495057;
}

.notice-list li:last-child,
.team-list li:last-child {
  border-bottom: none;
}

/* 价格信息 */
.price-info {
  margin-bottom: 1rem;
}

.original-price {
  font-size: 1.25rem;
  color: #495057;
  margin-bottom: 0.5rem;
}

.vip-price {
  font-size: 1.5rem;
  color: #e63946;
  font-weight: bold;
}

.price-note {
  color: #6c757d;
  font-size: 0.875rem;
  font-style: italic;
}

/* 倒计时 */
.countdown {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
}

.countdown-item {
  text-align: center;
  background: #e63946;
  color: white;
  padding: 1rem;
  border-radius: 8px;
  min-width: 80px;
}

.countdown-value {
  display: block;
  font-size: 2rem;
  font-weight: bold;
}

.countdown-label {
  font-size: 0.875rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .detail-container {
    padding: 1rem;
  }
  
  .detail-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .detail-image {
    width: 250px;
    height: 250px;
  }
  
  .detail-title {
    font-size: 1.5rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .meta-item {
    justify-content: center;
  }
  
  .countdown {
    flex-wrap: wrap;
  }
}
</style>