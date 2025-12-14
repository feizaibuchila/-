<template>
  <div class="tasks-view">
    <div class="container">
      <h1>应援任务中心</h1>
      
      <!-- 积分和等级信息 -->
      <div class="user-stats">
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <div class="stat-value">{{ qianbi }}</div>
            <div class="stat-label">我的谦币</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⭐</div>
          <div class="stat-content">
            <div class="stat-value">Lv.{{ supportLevel }}</div>
            <div class="stat-label">应援等级</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-content">
            <div class="stat-value">{{ completedTasksCount }}</div>
            <div class="stat-label">已完成任务</div>
          </div>
        </div>
      </div>

      <!-- 任务选项卡 -->
      <div class="task-tabs">
        <button 
          v-for="tab in taskTabs" 
          :key="tab.key"
          :class="['tab-btn', { active: activeTab === tab.key }]"
          @click="activeTab = tab.key"
        >
          {{ tab.title }}
        </button>
      </div>

      <!-- 每日任务 -->
      <div v-if="activeTab === 'daily'" class="tasks-container">
        <div v-for="task in dailyTasks" :key="task.id" class="task-card">
          <div class="task-header">
            <h3>{{ task.title }}</h3>
            <div class="task-reward">
              <span class="reward-item">💰 {{ task.reward.qianbi }}</span>
              <span class="reward-item">⭐ {{ task.reward.exp }}</span>
            </div>
          </div>
          <p class="task-description">{{ task.description }}</p>
          <div class="task-actions">
            <button 
              v-if="!task.completed" 
              class="btn btn-primary" 
              @click="completeTask(task)"
            >
              立即完成
            </button>
            <button 
              v-else-if="!task.claimed" 
              class="btn btn-success" 
              @click="claimReward(task.id)"
            >
              领取奖励
            </button>
            <div v-else class="task-status completed">
              已完成
            </div>
          </div>
        </div>
        <div v-if="dailyTasks.length === 0" class="empty-state">
          暂无每日任务
        </div>
      </div>

      <!-- 每周任务 -->
      <div v-if="activeTab === 'weekly'" class="tasks-container">
        <div v-for="task in weeklyTasks" :key="task.id" class="task-card">
          <div class="task-header">
            <h3>{{ task.title }}</h3>
            <div class="task-reward">
              <span class="reward-item">💰 {{ task.reward.qianbi }}</span>
              <span class="reward-item">⭐ {{ task.reward.exp }}</span>
            </div>
          </div>
          <p class="task-description">{{ task.description }}</p>
          <div class="task-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: (task.progress / task.target) * 100 + '%' }"></div>
            </div>
            <span class="progress-text">{{ task.progress }}/{{ task.target }}</span>
          </div>
          <div class="task-actions">
            <button 
              v-if="!task.completed" 
              class="btn btn-primary" 
              @click="startTask(task)"
            >
              去完成
            </button>
            <button 
              v-else-if="!task.claimed" 
              class="btn btn-success" 
              @click="claimReward(task.id)"
            >
              领取奖励
            </button>
            <div v-else class="task-status completed">
              已完成
            </div>
          </div>
        </div>
        <div v-if="weeklyTasks.length === 0" class="empty-state">
          暂无每周任务
        </div>
      </div>

      <!-- 每月任务 -->
      <div v-if="activeTab === 'monthly'" class="tasks-container">
        <div v-for="task in monthlyTasks" :key="task.id" class="task-card">
          <div class="task-header">
            <h3>{{ task.title }}</h3>
            <div class="task-reward">
              <span class="reward-item">💰 {{ task.reward.qianbi }}</span>
              <span class="reward-item">⭐ {{ task.reward.exp }}</span>
            </div>
          </div>
          <p class="task-description">{{ task.description }}</p>
          <div class="task-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: (task.progress / task.target) * 100 + '%' }"></div>
            </div>
            <span class="progress-text">{{ task.progress }}/{{ task.target }}</span>
          </div>
          <div class="task-actions">
            <button 
              v-if="!task.completed" 
              class="btn btn-primary" 
              @click="startTask(task)"
            >
              去完成
            </button>
            <button 
              v-else-if="!task.claimed" 
              class="btn btn-success" 
              @click="claimReward(task.id)"
            >
              领取奖励
            </button>
            <div v-else class="task-status completed">
              已完成
            </div>
          </div>
        </div>
        <div v-if="monthlyTasks.length === 0" class="empty-state">
          暂无每月任务
        </div>
      </div>

      <!-- 积分商城入口 -->
      <div class="mall-entry">
        <h2>积分商城</h2>
        <p>使用谦币兑换丰富的周边好礼！</p>
        <button class="btn btn-large" @click="goToMall">
          前往商城
          <span class="arrow">→</span>
        </button>
      </div>
    </div>

    <!-- 任务完成确认弹窗 -->
    <div v-if="showCompleteModal" class="modal-overlay" @click.self="showCompleteModal = false">
      <div class="modal-content">
        <h3>{{ currentTask?.title }}</h3>
        <p>{{ completeModalMessage }}</p>
        <div class="modal-actions">
          <button class="btn btn-primary" @click="confirmCompleteTask">确认</button>
          <button class="btn btn-secondary" @click="showCompleteModal = false">取消</button>
        </div>
      </div>
    </div>

    <!-- 每日打卡弹窗 -->
    <div v-if="showCheckinModal" class="modal-overlay" @click.self="showCheckinModal = false">
      <div class="modal-content checkin-modal">
        <div class="checkin-header">
          <h2>每日打卡</h2>
          <div class="checkin-date">{{ formatDate(new Date()) }}</div>
        </div>
        <div class="checkin-message">
          <textarea v-model="checkinMessage" placeholder="写下你想对薛之谦说的话..." rows="4"></textarea>
        </div>
        <div class="checkin-actions">
          <button class="btn btn-primary" @click="submitCheckin">
            打卡送祝福
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted } from 'vue';
import { useUserStore } from '../store/index.js';
import { useRouter } from 'vue-router';

export default {
  name: 'TasksView',
  setup() {
    const userStore = useUserStore();
    const router = useRouter();
    const activeTab = ref('daily');
    const showCompleteModal = ref(false);
    const showCheckinModal = ref(false);
    const currentTask = ref(null);
    const completeModalMessage = ref('');
    const checkinMessage = ref('');

    const taskTabs = [
      { key: 'daily', title: '每日任务' },
      { key: 'weekly', title: '每周任务' },
      { key: 'monthly', title: '每月任务' }
    ];

    // 计算属性
    const qianbi = computed(() => userStore.getQianbi);
    const supportLevel = computed(() => userStore.getSupportLevel);
    const dailyTasks = computed(() => userStore.getDailyTasks);
    const weeklyTasks = computed(() => userStore.getWeeklyTasks);
    const monthlyTasks = computed(() => userStore.getMonthlyTasks);
    const completedTasksCount = computed(() => userStore.getCompletedTasksCount);

    // 方法
    const completeTask = (task) => {
      currentTask.value = task;
      
      // 根据任务类型显示不同的确认消息
      switch (task.id) {
        case 'daily-checkin':
          showCheckinModal.value = true;
          break;
        case 'daily-share':
          completeModalMessage.value = '请确认你已将应援站分享至社交平台';
          showCompleteModal.value = true;
          break;
        case 'daily-listen':
          completeModalMessage.value = '请确认你已聆听薛之谦音乐30分钟';
          showCompleteModal.value = true;
          break;
        default:
          // 直接完成其他任务
          userStore.updateTaskProgress(task.id);
          break;
      }
    };

    const confirmCompleteTask = () => {
      if (currentTask.value) {
        userStore.updateTaskProgress(currentTask.value.id);
        showCompleteModal.value = false;
        currentTask.value = null;
      }
    };

    const submitCheckin = () => {
      // 完成打卡任务
      userStore.updateTaskProgress('daily-checkin');
      
      // 显示成功消息
      alert('打卡成功！谢谢你的祝福~');
      
      showCheckinModal.value = false;
      checkinMessage.value = '';
    };

    const startTask = (task) => {
      // 根据任务类型跳转到相应页面
      switch (task.id) {
        case 'weekly-post':
          router.push('/topic-wall');
          break;
        case 'weekly-collect':
          router.push('/albums/1');
          break;
        default:
          // 对于其他任务，显示提示
          alert(`请前往相关页面完成「${task.title}」任务`);
          break;
      }
    };

    const claimReward = (taskId) => {
      const success = userStore.claimTaskReward(taskId);
      if (success) {
        alert('奖励领取成功！');
      } else {
        alert('无法领取奖励，请稍后再试');
      }
    };

    const goToMall = () => {
      router.push('/mall');
    };

    const formatDate = (date) => {
      const d = new Date(date);
      return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    };

    // 初始化每月任务（模拟）
    onMounted(() => {
      // 检查是否已经初始化了每月任务
      if (monthlyTasks.value.length === 0) {
        // 这里应该从API获取，现在模拟数据
        const monthlyTasksData = [
          {
            id: 'monthly-activity',
            title: '参与1次线下应援活动',
            description: '报名并参与一次线下应援活动',
            reward: { qianbi: 100, exp: 50 },
            progress: 0,
            target: 1,
            completed: false,
            claimed: false,
            type: 'monthly'
          },
          {
            id: 'monthly-level',
            title: '应援等级提升1级',
            description: '将应援等级提升到下一级',
            reward: { qianbi: 200, exp: 100 },
            progress: 0,
            target: 1,
            completed: false,
            claimed: false,
            type: 'monthly'
          }
        ];
        
        // 更新store中的每月任务
        userStore.tasks.monthly = monthlyTasksData;
      }
    });

    return {
      activeTab,
      taskTabs,
      qianbi,
      supportLevel,
      dailyTasks,
      weeklyTasks,
      monthlyTasks,
      completedTasksCount,
      showCompleteModal,
      showCheckinModal,
      currentTask,
      completeModalMessage,
      checkinMessage,
      completeTask,
      confirmCompleteTask,
      submitCheckin,
      startTask,
      claimReward,
      goToMall,
      formatDate
    };
  }
};
</script>

<style scoped>
.tasks-view {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.tasks-view h1 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.5rem;
  color: #333;
}

/* 用户统计信息 */
.user-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 3rem;
}

.stat-card {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  flex: 1;
  margin: 0 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 2rem;
}

.stat-content .stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #1890ff;
  margin-bottom: 0.5rem;
}

.stat-content .stat-label {
  color: #666;
  font-size: 1rem;
}

/* 任务选项卡 */
.task-tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  background-color: white;
  border-radius: 8px;
  padding: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.tab-btn {
  flex: 1;
  padding: 1rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1.1rem;
  border-radius: 6px;
  transition: background-color 0.3s;
  margin: 0 0.5rem;
}

.tab-btn.active {
  background-color: #1890ff;
  color: white;
}

/* 任务列表 */
.tasks-container {
  display: grid;
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.task-card {
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.task-header h3 {
  margin: 0;
  font-size: 1.3rem;
}

.task-reward {
  display: flex;
  gap: 1rem;
}

.reward-item {
  background-color: #f0f0f0;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 500;
}

.task-description {
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.task-progress {
  margin-bottom: 1.5rem;
}

.progress-bar {
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background-color: #52c41a;
  transition: width 0.3s;
}

.progress-text {
  font-size: 0.875rem;
  color: #666;
}

.task-actions {
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: #1890ff;
  color: white;
}

.btn-primary:hover {
  background-color: #40a9ff;
}

.btn-success {
  background-color: #52c41a;
  color: white;
}

.btn-success:hover {
  background-color: #73d13d;
}

.task-status {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
}

.task-status.completed {
  background-color: #f0f9ff;
  color: #1890ff;
}

/* 积分商城入口 */
.mall-entry {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.mall-entry h2 {
  margin-bottom: 1rem;
  font-size: 2rem;
}

.mall-entry p {
  margin-bottom: 2rem;
  font-size: 1.1rem;
  opacity: 0.9;
}

.btn-large {
  padding: 1rem 2.5rem;
  font-size: 1.2rem;
  font-weight: 500;
  background-color: white;
  color: #667eea;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-large:hover {
  background-color: #f0f0f0;
}

.arrow {
  font-size: 1.4rem;
  transition: transform 0.3s;
}

.btn-large:hover .arrow {
  transform: translateX(5px);
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

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
}

.modal-content h3 {
  margin-bottom: 1rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

/* 打卡弹窗 */
.checkin-modal h2 {
  margin-bottom: 0.5rem;
}

.checkin-date {
  color: #666;
  margin-bottom: 1.5rem;
}

.checkin-message textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 1rem;
  resize: none;
  font-family: inherit;
}

.checkin-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 4rem;
  background-color: white;
  border-radius: 8px;
  color: #999;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-stats {
    flex-direction: column;
    gap: 1rem;
  }
  
  .stat-card {
    margin: 0;
  }
  
  .task-tabs {
    flex-direction: column;
    padding: 0.5rem;
  }
  
  .tab-btn {
    margin: 0.5rem 0;
  }
  
  .task-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .mall-entry {
    padding: 2rem 1rem;
  }
}
</style>