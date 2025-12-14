<template>
  <div class="activity-signup-container">
    <h2>应援活动报名</h2>
    
    <!-- 活动筛选 -->
    <div class="activity-filters card">
      <div class="filter-controls">
        <div class="filter-group">
          <label>活动类型：</label>
          <select v-model="selectedType" class="filter-select">
            <option value="all">全部类型</option>
            <option value="offline">线下活动</option>
            <option value="online">线上活动</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>会员等级：</label>
          <select v-model="selectedVipLevel" class="filter-select">
            <option value="all">全部等级</option>
            <option value="0">普通用户</option>
            <option value="1">VIP会员</option>
            <option value="2">高级VIP会员</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>活动状态：</label>
          <select v-model="selectedStatus" class="filter-select">
            <option value="all">全部状态</option>
            <option value="open">报名中</option>
            <option value="ending">即将截止</option>
            <option value="closed">已截止</option>
          </select>
        </div>
      </div>
    </div>
    
    <!-- 活动列表 -->
    <div class="activities-list">
      <div v-if="filteredActivities.length === 0" class="empty-state card">
        暂无符合条件的活动
      </div>
      
      <div 
        v-for="activity in filteredActivities" 
        :key="activity.id"
        class="activity-card card"
        :class="getActivityStatusClass(activity)"
      >
        <!-- 活动封面 -->
        <div class="activity-cover" :style="{ backgroundImage: `url(${activity.coverImage})` }"></div>
        
        <!-- 活动状态标签 -->
        <div 
          class="activity-status-badge"
          :class="`status-${activity.status}`"
        >
          {{ getActivityStatusText(activity.status) }}
        </div>
        
        <!-- 活动内容 -->
        <div class="activity-content">
          <div class="activity-header">
            <h3 class="activity-title">{{ activity.title }}</h3>
            <div class="activity-type-badge" :class="`type-${activity.type}`">
              {{ getActivityTypeText(activity.type) }}
            </div>
          </div>
          
          <div class="activity-meta">
            <div class="meta-item">
              <span class="meta-icon">📅</span>
              <span class="meta-text">{{ formatDate(activity.date) }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-icon">⏰</span>
              <span class="meta-text">{{ activity.time }}</span>
            </div>
            <div class="meta-item" v-if="activity.location">
              <span class="meta-icon">📍</span>
              <span class="meta-text">{{ activity.location }}</span>
            </div>
          </div>
          
          <div class="activity-description">
            {{ activity.description }}
          </div>
          
          <div class="activity-requirements">
            <div class="requirement-item">
              <span class="requirement-label">会员等级要求：</span>
              <span class="requirement-value">
                {{ getVipLevelText(activity.minVipLevel) }}及以上
              </span>
            </div>
            <div class="requirement-item">
              <span class="requirement-label">名额限制：</span>
              <span class="requirement-value">
                {{ activity.registeredCount }}/{{ activity.quota }}
              </span>
            </div>
            <div class="requirement-item">
              <span class="requirement-label">报名截止：</span>
              <span class="requirement-value">
                {{ formatDate(activity.registrationEndDate) }}
              </span>
            </div>
          </div>
          
          <div class="activity-actions">
            <button 
              class="btn btn-primary signup-btn"
              @click="openSignupForm(activity)"
              :disabled="!canSignup(activity)"
              :title="!canSignup(activity) ? getSignupDisabledReason(activity) : ''"
            >
              立即报名
            </button>
            <button 
              class="btn btn-secondary details-btn"
              @click="showActivityDetails(activity)"
            >
              查看详情
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 报名表单弹窗 -->
    <div v-if="showSignupModal" class="modal-overlay" @click="closeSignupModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ currentActivity?.title }} - 报名表单</h3>
          <button class="close-btn" @click="closeSignupModal">×</button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="submitSignup" class="signup-form">
            <!-- 个人信息 -->
            <div class="form-section">
              <h4>个人信息</h4>
              
              <div class="form-group">
                <label for="realName">真实姓名 <span class="required">*</span></label>
                <input 
                  id="realName"
                  v-model="signupForm.realName"
                  type="text"
                  class="form-input"
                  placeholder="请输入真实姓名"
                  required
                >
              </div>
              
              <div class="form-group">
                <label for="phone">手机号码 <span class="required">*</span></label>
                <input 
                  id="phone"
                  v-model="signupForm.phone"
                  type="tel"
                  class="form-input"
                  placeholder="请输入手机号码"
                  required
                  pattern="^1[3-9]\d{9}$"
                >
              </div>
              
              <div class="form-group">
                <label for="email">电子邮箱 <span class="required">*</span></label>
                <input 
                  id="email"
                  v-model="signupForm.email"
                  type="email"
                  class="form-input"
                  placeholder="请输入电子邮箱"
                  required
                >
              </div>
              
              <div class="form-group" v-if="currentActivity?.type === 'offline'">
                <label for="address">居住地址</label>
                <input 
                  id="address"
                  v-model="signupForm.address"
                  type="text"
                  class="form-input"
                  placeholder="请输入居住地址"
                >
              </div>
            </div>
            
            <!-- 活动相关信息 -->
            <div class="form-section">
              <h4>活动相关</h4>
              
              <div class="form-group">
                <label for="participationNotes">参与须知确认 <span class="required">*</span></label>
                <div class="checkbox-group">
                  <input 
                    id="participationNotes"
                    v-model="signupForm.agreedToNotes"
                    type="checkbox"
                    required
                  >
                  <label for="participationNotes">
                    我已阅读并同意<a href="#" class="link-primary">活动参与须知</a>，承诺遵守活动规则
                  </label>
                </div>
              </div>
              
              <div class="form-group">
                <label for="specialRequirements">特殊需求（选填）</label>
                <textarea 
                  id="specialRequirements"
                  v-model="signupForm.specialRequirements"
                  class="form-textarea"
                  placeholder="如有特殊饮食要求、健康状况等，请在此说明"
                  rows="3"
                  maxlength="200"
                ></textarea>
              </div>
            </div>
            
            <!-- 提交按钮 -->
            <div class="form-actions">
              <button 
                type="button" 
                class="btn btn-secondary"
                @click="closeSignupModal"
              >
                取消
              </button>
              <button 
                type="submit" 
                class="btn btn-primary"
                :disabled="isSubmitting"
              >
                <span v-if="isSubmitting" class="loading-spinner"></span>
                {{ isSubmitting ? '提交中...' : '确认提交' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- 活动详情弹窗 -->
    <div v-if="showDetailsModal" class="modal-overlay" @click="closeDetailsModal">
      <div class="modal-content details-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ currentActivity?.title }} - 活动详情</h3>
          <button class="close-btn" @click="closeDetailsModal">×</button>
        </div>
        
        <div class="modal-body">
          <div class="activity-details">
            <!-- 活动封面大图 -->
            <div class="detail-cover">
              <img :src="currentActivity?.coverImage" :alt="currentActivity?.title" class="detail-image">
            </div>
            
            <!-- 活动基本信息 -->
            <div class="detail-info">
              <div class="info-row">
                <span class="info-label">活动时间：</span>
                <span class="info-value">{{ formatDate(currentActivity?.date) }} {{ currentActivity?.time }}</span>
              </div>
              <div class="info-row" v-if="currentActivity?.location">
                <span class="info-label">活动地点：</span>
                <span class="info-value">{{ currentActivity?.location }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">活动类型：</span>
                <span class="info-value">{{ getActivityTypeText(currentActivity?.type) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">名额限制：</span>
                <span class="info-value">{{ currentActivity?.registeredCount }}/{{ currentActivity?.quota }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">会员等级要求：</span>
                <span class="info-value">{{ getVipLevelText(currentActivity?.minVipLevel) }}及以上</span>
              </div>
              <div class="info-row">
                <span class="info-label">报名时间：</span>
                <span class="info-value">
                  {{ formatDate(currentActivity?.registrationStartDate) }} 至 {{ formatDate(currentActivity?.registrationEndDate) }}
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">活动状态：</span>
                <span 
                  class="info-value status-badge"
                  :class="`status-${currentActivity?.status}`"
                >
                  {{ getActivityStatusText(currentActivity?.status) }}
                </span>
              </div>
            </div>
            
            <!-- 活动详细介绍 -->
            <div class="detail-description">
              <h4>活动介绍</h4>
              <div class="description-content">
                {{ currentActivity?.fullDescription }}
              </div>
            </div>
            
            <!-- 参与须知 -->
            <div class="detail-notes">
              <h4>参与须知</h4>
              <ul class="notes-list">
                <li v-for="(note, index) in currentActivity?.participationNotes" :key="index">
                  {{ note }}
                </li>
              </ul>
            </div>
            
            <!-- 底部按钮 -->
            <div class="detail-actions">
              <button 
                v-if="canSignup(currentActivity)"
                class="btn btn-primary signup-btn"
                @click="openSignupForm(currentActivity)"
              >
                立即报名
              </button>
              <button class="btn btn-secondary" @click="closeDetailsModal">
                关闭
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 提交成功弹窗 -->
    <div v-if="showSuccessModal" class="modal-overlay" @click="closeSuccessModal">
      <div class="modal-content success-modal" @click.stop>
        <div class="success-icon">✓</div>
        <h3>报名提交成功！</h3>
        <p class="success-message">{{ successMessage }}</p>
        <div class="success-actions">
          <button class="btn btn-primary" @click="closeSuccessModal">
            确定
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '../store/index';

export default {
  name: 'ActivitySignup',
  setup() {
    const userStore = useUserStore();
    
    // 当前用户信息
    const currentUser = computed(() => ({
      id: userStore.getUserInfo.id,
      nickname: userStore.getUserInfo.nickname,
      vipLevel: userStore.getVipLevel
    }));
    
    // 筛选选项
    const selectedType = ref('all');
    const selectedVipLevel = ref('all');
    const selectedStatus = ref('all');
    
    // 活动数据
    const activities = ref([
      {
        id: 1,
        title: '薛之谦「天外来物」演唱会上海站线下应援活动',
        type: 'offline',
        status: 'open',
        date: new Date('2024-12-25'),
        time: '16:00-19:00',
        location: '上海体育场外广场',
        description: '为薛之谦上海演唱会进行线下应援，发放应援物资，组织粉丝合唱等活动。',
        fullDescription: '本次应援活动是为薛之谦「天外来物」世界巡回演唱会上海站特别策划的线下应援活动。活动将在演唱会开始前3小时在上海体育场外广场举行，包括应援物资发放、粉丝大合唱、应援口号练习等环节。所有参与者将获得限量版应援礼包一份。',
        coverImage: 'https://picsum.photos/id/1050/800/400',
        minVipLevel: 1,
        quota: 200,
        registeredCount: 128,
        registrationStartDate: new Date('2024-12-01'),
        registrationEndDate: new Date('2024-12-20'),
        participationNotes: [
          '请携带有效身份证件和报名成功凭证',
          '活动当天请遵守现场秩序，听从工作人员安排',
          '活动提供免费应援物资，请有序领取',
          '请勿携带易燃易爆物品和违禁品',
          '活动结束后请带走个人垃圾，保持场地整洁'
        ]
      },
      {
        id: 2,
        title: '薛之谦新歌打榜线上活动',
        type: 'online',
        status: 'open',
        date: new Date('2025-01-10'),
        time: '全天',
        location: null,
        description: '为薛之谦新歌《流星》进行各大音乐平台打榜活动，提升歌曲排名。',
        fullDescription: '为庆祝薛之谦新歌《流星》发布，特组织线上打榜活动。参与者需要在指定时间内前往各大音乐平台（QQ音乐、网易云音乐等）为歌曲点赞、评论、分享，提升歌曲排名。活动结束后将根据贡献值发放应援积分奖励。',
        coverImage: 'https://picsum.photos/id/1051/800/400',
        minVipLevel: 0,
        quota: 500,
        registeredCount: 342,
        registrationStartDate: new Date('2025-01-05'),
        registrationEndDate: new Date('2025-01-09'),
        participationNotes: [
          '请使用正版音乐平台账号参与打榜',
          '打榜过程中请遵守各平台规则',
          '活动结束后将根据打榜数据统计贡献值',
          '贡献值排名靠前的用户将获得额外奖励'
        ]
      },
      {
        id: 3,
        title: '薛之谦生日应援线下聚会',
        type: 'offline',
        status: 'ending',
        date: new Date('2025-07-17'),
        time: '14:00-18:00',
        location: '北京朝阳公园',
        description: '为薛之谦生日举办线下聚会，共同庆祝生日，制作生日应援视频。',
        fullDescription: '为庆祝薛之谦生日，组织北京地区粉丝线下聚会活动。活动将包括生日蛋糕分享、应援口号练习、生日视频拍摄等环节。所有参与者将获得生日特别版应援周边。',
        coverImage: 'https://picsum.photos/id/1052/800/400',
        minVipLevel: 2,
        quota: 100,
        registeredCount: 95,
        registrationStartDate: new Date('2025-06-17'),
        registrationEndDate: new Date('2025-07-07'),
        participationNotes: [
          '请携带生日应援物品，如手幅、灯牌等',
          '活动将拍摄集体视频，请提前练习应援口号',
          '活动提供免费饮料和小食',
          '请提前到达活动场地，准时签到'
        ]
      },
      {
        id: 4,
        title: '薛之谦新专辑宣传线上应援',
        type: 'online',
        status: 'open',
        date: new Date('2025-01-20'),
        time: '全天',
        location: null,
        description: '为薛之谦新专辑《未知的旅程》进行社交媒体宣传，扩大专辑影响力。',
        fullDescription: '为宣传薛之谦新专辑《未知的旅程》，特组织线上社交媒体宣传活动。参与者需要在微博、抖音、微信等平台分享专辑信息，使用指定话题标签，吸引更多人关注新专辑。活动结束后将根据宣传效果发放应援积分和周边奖励。',
        coverImage: 'https://picsum.photos/id/1053/800/400',
        minVipLevel: 1,
        quota: 300,
        registeredCount: 178,
        registrationStartDate: new Date('2025-01-15'),
        registrationEndDate: new Date('2025-01-19'),
        participationNotes: [
          '请使用指定话题标签进行宣传',
          '宣传内容需积极正面，符合法律法规',
          '请保留宣传截图，活动结束后提交审核',
          '宣传效果优异的用户将获得额外奖励'
        ]
      },
      {
        id: 5,
        title: '薛之谦演唱会接机活动',
        type: 'offline',
        status: 'closed',
        date: new Date('2024-12-24'),
        time: '10:00',
        location: '上海浦东国际机场',
        description: '组织粉丝前往机场迎接薛之谦，为演唱会造势。',
        fullDescription: '为迎接薛之谦抵达上海准备演唱会，组织粉丝前往机场接机活动。活动将发放统一应援物品，组织有序迎接，为演唱会预热。',
        coverImage: 'https://picsum.photos/id/1054/800/400',
        minVipLevel: 2,
        quota: 50,
        registeredCount: 50,
        registrationStartDate: new Date('2024-12-10'),
        registrationEndDate: new Date('2024-12-20'),
        participationNotes: [
          '请严格遵守机场秩序，听从工作人员安排',
          '请勿拥挤推搡，注意安全',
          '请保持安静，不要影响其他旅客',
          '请准备好应援物品，保持热情但有序'
        ]
      }
    ]);
    
    // 弹窗状态
    const showSignupModal = ref(false);
    const showDetailsModal = ref(false);
    const showSuccessModal = ref(false);
    const currentActivity = ref(null);
    const isSubmitting = ref(false);
    const successMessage = ref('');
    
    // 报名表单数据
    const signupForm = ref({
      realName: '',
      phone: '',
      email: '',
      address: '',
      agreedToNotes: false,
      specialRequirements: ''
    });
    
    // 格式化日期
    const formatDate = (date) => {
      if (!date) return '';
      const d = new Date(date);
      return `${d.getFullYear()}年${String(d.getMonth() + 1).padStart(2, '0')}月${String(d.getDate()).padStart(2, '0')}日`;
    };
    
    // 获取活动类型文本
    const getActivityTypeText = (type) => {
      switch (type) {
        case 'offline': return '线下活动';
        case 'online': return '线上活动';
        default: return '未知类型';
      }
    };
    
    // 获取活动状态文本
    const getActivityStatusText = (status) => {
      switch (status) {
        case 'open': return '报名中';
        case 'ending': return '即将截止';
        case 'closed': return '已截止';
        default: return '未知状态';
      }
    };
    
    // 获取活动状态样式类
    const getActivityStatusClass = (activity) => {
      return `status-${activity.status}`;
    };
    
    // 获取会员等级文本
    const getVipLevelText = (level) => {
      switch (level) {
        case 0: return '普通用户';
        case 1: return 'VIP会员';
        case 2: return '高级VIP会员';
        default: return '未知等级';
      }
    };
    
    // 检查是否可以报名
    const canSignup = (activity) => {
      if (!activity) return false;
      
      // 活动已截止
      if (activity.status === 'closed') return false;
      
      // 名额已满
      if (activity.registeredCount >= activity.quota) return false;
      
      // 会员等级不足
      if (currentUser.value.vipLevel < activity.minVipLevel) return false;
      
      // 报名截止日期已过
      if (new Date() > new Date(activity.registrationEndDate)) return false;
      
      // 报名开始日期未到
      if (new Date() < new Date(activity.registrationStartDate)) return false;
      
      return true;
    };
    
    // 获取报名按钮禁用原因
    const getSignupDisabledReason = (activity) => {
      if (!activity) return '';
      
      if (activity.status === 'closed') return '活动已截止';
      if (activity.registeredCount >= activity.quota) return '名额已满';
      if (currentUser.value.vipLevel < activity.minVipLevel) 
        return `需要${getVipLevelText(activity.minVipLevel)}及以上`;
      if (new Date() > new Date(activity.registrationEndDate)) return '报名已截止';
      if (new Date() < new Date(activity.registrationStartDate)) return '报名尚未开始';
      
      return '';
    };
    
    // 打开报名表单
    const openSignupForm = (activity) => {
      currentActivity.value = activity;
      // 重置表单
      signupForm.value = {
        realName: '',
        phone: '',
        email: '',
        address: '',
        agreedToNotes: false,
        specialRequirements: ''
      };
      showSignupModal.value = true;
    };
    
    // 关闭报名表单
    const closeSignupModal = () => {
      showSignupModal.value = false;
      currentActivity.value = null;
    };
    
    // 显示活动详情
    const showActivityDetails = (activity) => {
      currentActivity.value = activity;
      showDetailsModal.value = true;
    };
    
    // 关闭活动详情
    const closeDetailsModal = () => {
      showDetailsModal.value = false;
      currentActivity.value = null;
    };
    
    // 提交报名表单
    const submitSignup = async () => {
      if (!currentActivity.value || isSubmitting.value) return;
      
      isSubmitting.value = true;
      
      try {
        // 模拟提交请求
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // 更新活动报名人数
        const activity = activities.value.find(a => a.id === currentActivity.value.id);
        if (activity && activity.registeredCount < activity.quota) {
          activity.registeredCount++;
        }
        
        // 设置成功消息
        successMessage.value = `恭喜您，${currentActivity.value.title} 报名成功！我们将通过 ${signupForm.value.email} 发送报名确认信息。`;
        
        // 关闭报名表单，显示成功弹窗
        closeSignupModal();
        showSuccessModal.value = true;
        
        // 增加应援积分
        userStore.addPoints(50);
      } catch (error) {
        console.error('报名失败:', error);
        alert('报名失败，请稍后重试');
      } finally {
        isSubmitting.value = false;
      }
    };
    
    // 关闭成功弹窗
    const closeSuccessModal = () => {
      showSuccessModal.value = false;
      successMessage.value = '';
    };
    
    // 筛选后的活动列表
    const filteredActivities = computed(() => {
      return activities.value.filter(activity => {
        // 按类型筛选
        if (selectedType.value !== 'all' && activity.type !== selectedType.value) {
          return false;
        }
        
        // 按会员等级筛选
        if (selectedVipLevel.value !== 'all' && activity.minVipLevel > parseInt(selectedVipLevel.value)) {
          return false;
        }
        
        // 按状态筛选
        if (selectedStatus.value !== 'all' && activity.status !== selectedStatus.value) {
          return false;
        }
        
        return true;
      }).sort((a, b) => {
        // 按活动状态和时间排序
        const statusOrder = { 'open': 0, 'ending': 1, 'closed': 2 };
        const statusDiff = statusOrder[a.status] - statusOrder[b.status];
        if (statusDiff !== 0) return statusDiff;
        
        // 同状态下按时间排序
        return new Date(a.date) - new Date(b.date);
      });
    });
    
    // 组件挂载时初始化
    onMounted(() => {
      // 可以在这里加载活动数据
    });
    
    return {
      currentUser,
      selectedType,
      selectedVipLevel,
      selectedStatus,
      activities,
      showSignupModal,
      showDetailsModal,
      showSuccessModal,
      currentActivity,
      isSubmitting,
      successMessage,
      signupForm,
      filteredActivities,
      formatDate,
      getActivityTypeText,
      getActivityStatusText,
      getActivityStatusClass,
      getVipLevelText,
      canSignup,
      getSignupDisabledReason,
      openSignupForm,
      closeSignupModal,
      showActivityDetails,
      closeDetailsModal,
      submitSignup,
      closeSuccessModal
    };
  }
};
</script>

<style scoped>
.activity-signup-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.activity-signup-container h2 {
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

/* 筛选区域 */
.activity-filters {
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.filter-controls {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  align-items: center;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filter-group label {
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 6px;
  background: var(--background-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
  cursor: pointer;
  transition: border-color var(--transition-speed) ease;
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary-color);
}

/* 活动列表 */
.activities-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem;
  color: var(--text-secondary);
}

.activity-card {
  position: relative;
  overflow: hidden;
  transition: transform var(--transition-speed) ease, box-shadow var(--transition-speed) ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.activity-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.activity-card.status-closed {
  opacity: 0.8;
}

.activity-cover {
  height: 180px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.activity-status-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
  z-index: 1;
}

.activity-status-badge.status-open {
  background: var(--success-color);
}

.activity-status-badge.status-ending {
  background: var(--warning-color);
}

.activity-status-badge.status-closed {
  background: var(--danger-color);
}

.activity-content {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.activity-title {
  font-size: 1.2rem;
  color: var(--text-primary);
  margin: 0;
  flex: 1;
}

.activity-type-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  white-space: nowrap;
}

.activity-type-badge.type-offline {
  background: var(--primary-color);
}

.activity-type-badge.type-online {
  background: var(--secondary-color);
}

.activity-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
}

.meta-icon {
  font-size: 1rem;
}

.activity-description {
  line-height: 1.5;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  flex: 1;
}

.activity-requirements {
  margin-bottom: 1.5rem;
}

.requirement-item {
  display: flex;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.requirement-label {
  font-weight: 600;
  color: var(--text-secondary);
  min-width: 100px;
}

.requirement-value {
  color: var(--text-primary);
}

.activity-actions {
  display: flex;
  gap: 1rem;
}

.signup-btn,
.details-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal-content {
  background: var(--background-primary);
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}

.details-modal {
  max-width: 800px;
}

.success-modal {
  max-width: 400px;
  text-align: center;
  padding: 2rem;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  font-size: 1.25rem;
  color: var(--text-primary);
  margin: 0;
}

.close-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-speed) ease;
}

.close-btn:hover {
  background: var(--background-secondary);
  color: var(--text-primary);
}

.modal-body {
  padding: 1.5rem;
}

/* 报名表单 */
.signup-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-section {
  margin-bottom: 1rem;
}

.form-section h4 {
  font-size: 1.1rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.required {
  color: var(--danger-color);
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 6px;
  background: var(--background-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: border-color var(--transition-speed) ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.checkbox-group {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.checkbox-group input[type="checkbox"] {
  margin-top: 2px;
}

.checkbox-group label {
  margin: 0;
  font-weight: normal;
}

.link-primary {
  color: var(--primary-color);
  text-decoration: none;
  position: relative;
}

.link-primary::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--primary-color);
  transition: width var(--transition-speed) ease;
}

.link-primary:hover::after {
  width: 100%;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;
  vertical-align: middle;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 活动详情 */
.activity-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-cover {
  margin-bottom: 1rem;
}

.detail-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
  object-fit: cover;
}

.detail-info {
  background: var(--background-secondary);
  padding: 1rem;
  border-radius: 8px;
}

.info-row {
  display: flex;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  font-weight: 600;
  color: var(--text-secondary);
  min-width: 100px;
}

.info-value {
  color: var(--text-primary);
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  color: white;
}

.status-badge.status-open {
  background: var(--success-color);
}

.status-badge.status-ending {
  background: var(--warning-color);
}

.status-badge.status-closed {
  background: var(--danger-color);
}

.detail-description,
.detail-notes {
  margin-bottom: 1rem;
}

.detail-description h4,
.detail-notes h4 {
  font-size: 1.1rem;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.description-content {
  line-height: 1.6;
  color: var(--text-primary);
}

.notes-list {
  padding-left: 1.5rem;
  color: var(--text-primary);
}

.notes-list li {
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.detail-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

/* 成功弹窗 */
.success-icon {
  font-size: 3rem;
  color: var(--success-color);
  margin-bottom: 1rem;
}

.success-modal h3 {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.success-message {
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.5;
}

.success-actions {
  display: flex;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .activity-signup-container {
    padding: 1rem;
  }
  
  .activities-list {
    grid-template-columns: 1fr;
  }
  
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .activity-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .activity-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .activity-actions {
    flex-direction: column;
  }
  
  .modal-overlay {
    padding: 1rem;
  }
  
  .modal-content {
    margin: 0;
  }
  
  .details-modal {
    max-height: 90vh;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .info-row {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .info-label {
    min-width: auto;
  }
  
  .detail-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .modal-header {
    padding: 1rem;
  }
  
  .modal-header h3 {
    font-size: 1.1rem;
  }
  
  .modal-body {
    padding: 1rem;
  }
  
  .form-group {
    margin-bottom: 0.75rem;
  }
  
  .activity-card {
    margin-bottom: 1rem;
  }
}
</style>