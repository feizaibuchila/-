<template>
  <div class="activities-container">
    <!-- 导航栏 -->
    <Navbar />
    
    <!-- 页面内容 -->
    <main class="activities-main-content">
      <section class="activities-header">
        <h1>应援活动</h1>
        <p>参与薛之谦的粉丝应援活动，与其他谦友一起为偶像加油</p>
      </section>
      
      <section class="activities-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.value"
          :class="['tab-btn', { active: activeTab === tab.value }]"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
        </button>
      </section>
      
      <section class="activities-list">
        <div class="activity-card" v-for="activity in filteredActivities" :key="activity.id">
          <div class="activity-image">
            <img :src="activity.image" :alt="activity.title">
            <div class="activity-badge" :class="activity.statusClass">
              {{ activity.status }}
            </div>
          </div>
          <div class="activity-content">
            <h3 class="activity-title">{{ activity.title }}</h3>
            <p class="activity-date">{{ formatDate(activity.startDate) }} - {{ formatDate(activity.endDate) }}</p>
            <p class="activity-desc">{{ activity.description }}</p>
            <div class="activity-stats">
              <span class="stat-item">👥 {{ activity.participants }} 人参与</span>
              <span class="stat-item">❤️ {{ activity.likes }} 喜欢</span>
            </div>
            <div class="activity-actions">
              <button 
                class="btn btn-primary join-btn" 
                :disabled="activity.status === '已结束'"
                @click="joinActivity(activity.id)"
              >
                {{ activity.status === '进行中' ? '立即参与' : '活动详情' }}
              </button>
              <button class="btn btn-outline share-btn" @click="shareActivity(activity.id)">
                分享
              </button>
            </div>
          </div>
        </div>
      </section>
      
      <section v-if="filteredActivities.length === 0" class="no-activities">
        <p>暂无相关活动</p>
      </section>
    </main>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import Navbar from '../components/Navbar.vue';

export default {
  name: 'ActivitiesView',
  components: {
    Navbar
  },
  setup() {
    const activities = ref([]);
    const activeTab = ref('ongoing');
    
    const tabs = [
      { label: '进行中', value: 'ongoing' },
      { label: '即将开始', value: 'upcoming' },
      { label: '已结束', value: 'ended' }
    ];
    
    // 模拟应援活动数据
    const mockActivities = [
      {
        id: 1,
        title: '薛之谦2023巡回演唱会应援计划',
        description: '为薛之谦2023巡回演唱会制作应援手幅和灯牌，一起为偶像加油助威！',
        image: 'https://picsum.photos/id/10/800/400',
        startDate: new Date('2023-06-01'),
        endDate: new Date('2023-12-31'),
        status: '进行中',
        statusClass: 'status-ongoing',
        participants: 1258,
        likes: 2341
      },
      {
        id: 2,
        title: '薛之谦生日应援活动',
        description: '为薛之谦生日准备特别应援，包括线上祝福墙和线下庆祝活动',
        image: 'https://picsum.photos/id/20/800/400',
        startDate: new Date('2023-06-15'),
        endDate: new Date('2023-07-17'),
        status: '已结束',
        statusClass: 'status-ended',
        participants: 3421,
        likes: 5678
      },
      {
        id: 3,
        title: '新专辑打榜应援活动',
        description: '为薛之谦新专辑上线进行打榜应援，助力新专辑取得好成绩',
        image: 'https://picsum.photos/id/30/800/400',
        startDate: new Date('2023-08-01'),
        endDate: new Date('2023-08-31'),
        status: '即将开始',
        statusClass: 'status-upcoming',
        participants: 0,
        likes: 892
      },
      {
        id: 4,
        title: '谦友线下聚会活动',
        description: '全国各地谦友线下聚会，交流粉丝心得，共同为薛之谦应援',
        image: 'https://picsum.photos/id/40/800/400',
        startDate: new Date('2023-06-10'),
        endDate: new Date('2023-06-20'),
        status: '已结束',
        statusClass: 'status-ended',
        participants: 567,
        likes: 1023
      }
    ];
    
    // 格式化日期
    const formatDate = (date) => {
      const d = new Date(date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };
    
    // 根据当前标签筛选活动
    const filteredActivities = computed(() => {
      if (activeTab.value === 'ongoing') {
        return activities.value.filter(activity => activity.status === '进行中');
      } else if (activeTab.value === 'upcoming') {
        return activities.value.filter(activity => activity.status === '即将开始');
      } else if (activeTab.value === 'ended') {
        return activities.value.filter(activity => activity.status === '已结束');
      }
      return activities.value;
    });
    
    // 参与活动
    const joinActivity = (activityId) => {
      // 这里可以添加参与活动的逻辑
      alert(`成功参与活动 ID: ${activityId}`);
    };
    
    // 分享活动
    const shareActivity = (activityId) => {
      // 这里可以添加分享活动的逻辑
      alert(`分享活动 ID: ${activityId}`);
    };
    
    onMounted(() => {
      // 模拟数据加载
      activities.value = mockActivities;
    });
    
    return {
      activities,
      activeTab,
      tabs,
      filteredActivities,
      formatDate,
      joinActivity,
      shareActivity
    };
  }
};
</script>

<style scoped>
.activities-container {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.activities-main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.activities-header {
  text-align: center;
  margin-bottom: 60px;
}

.activities-header h1 {
  font-size: 36px;
  color: #333;
  margin-bottom: 16px;
}

.activities-header p {
  font-size: 18px;
  color: #666;
}

.activities-tabs {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 40px;
}

.tab-btn {
  padding: 12px 32px;
  border: none;
  background-color: #f0f0f0;
  border-radius: 25px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn:hover {
  background-color: #e0e0e0;
}

.tab-btn.active {
  background-color: #ff6b6b;
  color: white;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.activity-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.activity-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.activity-image {
  position: relative;
  height: 300px;
}

.activity-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.activity-badge {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 8px 20px;
  border-radius: 20px;
  font-weight: bold;
  color: white;
}

.status-ongoing {
  background-color: #4caf50;
}

.status-upcoming {
  background-color: #2196f3;
}

.status-ended {
  background-color: #9e9e9e;
}

.activity-content {
  padding: 30px;
}

.activity-title {
  font-size: 24px;
  margin: 0 0 16px 0;
  color: #333;
}

.activity-date {
  font-size: 16px;
  color: #ff6b6b;
  margin: 0 0 16px 0;
}

.activity-desc {
  font-size: 16px;
  color: #666;
  margin: 0 0 24px 0;
  line-height: 1.6;
}

.activity-stats {
  display: flex;
  gap: 30px;
  margin-bottom: 24px;
}

.stat-item {
  font-size: 16px;
  color: #666;
}

.activity-actions {
  display: flex;
  gap: 16px;
}

.btn {
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #ff6b6b;
  color: white;
  border: none;
}

.btn-primary:hover:not(:disabled) {
  background-color: #ff5252;
  transform: translateY(-2px);
}

.btn-primary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn-outline {
  background-color: transparent;
  color: #666;
  border: 1px solid #ddd;
}

.btn-outline:hover {
  background-color: #f0f0f0;
}

.no-activities {
  text-align: center;
  padding: 80px 0;
  color: #999;
  font-size: 18px;
}

@media (min-width: 768px) {
  .activity-card {
    flex-direction: row;
  }
  
  .activity-image {
    width: 40%;
    height: auto;
  }
  
  .activity-content {
    width: 60%;
  }
}
</style>