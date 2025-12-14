<template>
  <div class="activity-calendar-view">
    <div class="container">
      <h1>线下应援活动</h1>
      
      <!-- 活动日历 -->
      <div class="calendar-section">
        <div class="calendar-header">
          <button class="btn" @click="changeMonth(-1)">←</button>
          <h2>{{ currentYear }}年 {{ currentMonth + 1 }}月</h2>
          <button class="btn" @click="changeMonth(1)">→</button>
        </div>
        
        <!-- 星期标题 -->
        <div class="calendar-weekdays">
          <div v-for="day in weekDays" :key="day" class="weekday">{{ day }}</div>
        </div>
        
        <!-- 日历单元格 -->
        <div class="calendar-days">
          <!-- 上个月的日期 -->
          <div v-for="day in prevMonthDays" :key="`prev-${day}`" class="calendar-day other-month">
            {{ day }}
          </div>
          
          <!-- 当前月的日期 -->
          <div 
            v-for="day in currentMonthDays" 
            :key="day" 
            class="calendar-day"
            :class="{
              'has-activity': hasActivity(currentYear, currentMonth, day),
              'today': isToday(currentYear, currentMonth, day),
              'selected': selectedDate && selectedDate.year === currentYear && selectedDate.month === currentMonth && selectedDate.day === day
            }"
            @click="selectDate(currentYear, currentMonth, day)"
          >
            <span class="day-number">{{ day }}</span>
            <span 
              v-if="hasActivity(currentYear, currentMonth, day)" 
              class="activity-indicator"
              :class="getEventType(currentYear, currentMonth, day)"
            ></span>
          </div>
          
          <!-- 下个月的日期 -->
          <div v-for="day in nextMonthDays" :key="`next-${day}`" class="calendar-day other-month">
            {{ day }}
          </div>
        </div>
        
        <!-- 图例 -->
        <div class="calendar-legend">
          <div class="legend-item">
            <span class="legend-dot concert"></span>
            <span>演唱会</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot birthday"></span>
            <span>生日应援</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot fan-meet"></span>
            <span>粉丝见面会</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot other"></span>
            <span>其他活动</span>
          </div>
        </div>
      </div>
      
      <!-- 活动列表 -->
      <div class="activities-section">
        <h2>{{ selectedDateTitle }}</h2>
        
        <div v-if="selectedDateActivities.length > 0" class="activities-list">
          <div 
            v-for="activity in selectedDateActivities" 
            :key="activity.id" 
            class="activity-card"
            @click="openActivityDetail(activity)"
          >
            <div class="activity-header">
              <div class="activity-type" :class="activity.type">
                {{ getActivityTypeLabel(activity.type) }}
              </div>
              <div class="activity-date">{{ formatDateTime(activity.startTime) }}</div>
            </div>
            <h3 class="activity-title">{{ activity.title }}</h3>
            <div class="activity-info">
              <div class="info-item">
                <i class="location-icon">📍</i>
                <span>{{ activity.location }}</span>
              </div>
              <div class="info-item">
                <i class="people-icon">👥</i>
                <span>{{ activity.participants.length }}人已报名</span>
              </div>
            </div>
            <div class="activity-footer">
              <span class="activity-status" :class="activity.status">
                {{ getActivityStatus(activity.status) }}
              </span>
              <button 
                class="btn action-btn"
                :class="activity.status === 'upcoming' ? 'join-btn' : 'view-btn'"
                :disabled="activity.status === 'past'"
              >
                {{ activity.status === 'upcoming' ? '立即报名' : '查看详情' }}
              </button>
            </div>
          </div>
        </div>
        
        <div v-else class="no-activities">
          <p>{{ selectedDate ? '该日期暂无应援活动' : '请选择日期查看活动' }}</p>
        </div>
      </div>
      
      <!-- 活动详情弹窗 -->
      <div v-if="showActivityDetail" class="modal-overlay" @click="closeActivityDetail">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>活动详情</h2>
            <button class="close-btn" @click="closeActivityDetail">×</button>
          </div>
          <div class="modal-body">
            <div v-if="currentActivity" class="activity-detail">
              <div class="detail-header">
                <div class="activity-type" :class="currentActivity.type">
                  {{ getActivityTypeLabel(currentActivity.type) }}
                </div>
                <h3 class="activity-title">{{ currentActivity.title }}</h3>
                <div class="activity-date-range">
                  {{ formatDateTime(currentActivity.startTime) }} - {{ formatDateTime(currentActivity.endTime) }}
                </div>
                <div class="activity-location">
                  📍 {{ currentActivity.location }}
                </div>
              </div>
              
              <div class="detail-content">
                <h4>活动介绍</h4>
                <p>{{ currentActivity.description }}</p>
                
                <h4>活动安排</h4>
                <ul class="schedule-list">
                  <li v-for="(item, index) in currentActivity.schedule" :key="index">
                    <span class="schedule-time">{{ item.time }}</span>
                    <span class="schedule-content">{{ item.content }}</span>
                  </li>
                </ul>
                
                <h4>参与须知</h4>
                <ul class="notice-list">
                  <li v-for="(notice, index) in currentActivity.notices" :key="index">
                    {{ notice }}
                  </li>
                </ul>
                
                <div class="activity-photos">
                  <h4>活动图片</h4>
                  <div class="photos-grid">
                    <img 
                      v-for="(photo, index) in currentActivity.photos" 
                      :key="index" 
                      :src="photo" 
                      :alt="`活动图片${index + 1}`"
                      class="activity-photo"
                      @click="openPhotoViewer(photo)"
                    >
                  </div>
                </div>
                
                <div class="activity-stats">
                  <div class="stat-item">
                    <span class="stat-label">已报名人数</span>
                    <span class="stat-value">{{ currentActivity.participants.length }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">活动状态</span>
                    <span class="stat-value" :class="currentActivity.status">
                      {{ getActivityStatus(currentActivity.status) }}
                    </span>
                  </div>
                </div>
                
                <!-- 参与者列表 -->
                <div class="participants-section" v-if="currentActivity.participants.length > 0">
                  <h4>参与者 ({{ currentActivity.participants.length }})</h4>
                  <div class="participants-list">
                    <div 
                      v-for="(participant, index) in currentActivity.participants" 
                      :key="index"
                      class="participant-item"
                    >
                      <img :src="participant.avatar" :alt="participant.name" class="participant-avatar" />
                      <span class="participant-name">{{ participant.name }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn secondary-btn" @click="closeActivityDetail">关闭</button>
            <button 
              v-if="currentActivity && currentActivity.status === 'upcoming' && !isParticipant"
              class="btn primary-btn"
              @click="joinActivity"
            >
              立即报名
            </button>
            <button 
              v-if="currentActivity && currentActivity.status === 'past'"
              class="btn primary-btn"
              @click="openPhotoUpload"
            >
              上传合影
            </button>
          </div>
        </div>
      </div>
      
      <!-- 图片查看器 -->
      <div v-if="showPhotoViewer" class="photo-viewer-overlay" @click="closePhotoViewer">
        <div class="photo-viewer" @click.stop>
          <button class="close-btn" @click="closePhotoViewer">×</button>
          <img :src="currentPhoto" :alt="'活动图片'" class="viewer-photo" />
        </div>
      </div>
      
      <!-- 报名弹窗 -->
      <div v-if="showJoinModal" class="modal-overlay" @click="closeJoinModal">
        <div class="modal-content join-modal" @click.stop>
          <div class="modal-header">
            <h2>活动报名</h2>
            <button class="close-btn" @click="closeJoinModal">×</button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitJoinForm">
              <div class="form-group">
                <label for="realName">真实姓名</label>
                <input 
                  type="text" 
                  id="realName" 
                  v-model="joinForm.realName" 
                  required 
                  placeholder="请输入真实姓名"
                />
              </div>
              <div class="form-group">
                <label for="phone">手机号码</label>
                <input 
                  type="tel" 
                  id="phone" 
                  v-model="joinForm.phone" 
                  required 
                  placeholder="请输入手机号码"
                />
              </div>
              <div class="form-group">
                <label for="remark">备注信息 (选填)</label>
                <textarea 
                  id="remark" 
                  v-model="joinForm.remark" 
                  placeholder="有什么想告诉组织者的吗？"
                ></textarea>
              </div>
              <div class="agreement">
                <input type="checkbox" id="agreement" v-model="joinForm.agreed" required />
                <label for="agreement">我已阅读并同意<a href="#">活动参与协议</a></label>
              </div>
              <button type="submit" class="btn submit-join-btn">确认报名</button>
            </form>
          </div>
        </div>
      </div>
      
      <!-- 照片上传弹窗 -->
      <div v-if="showUploadModal" class="modal-overlay" @click="closeUploadModal">
        <div class="modal-content upload-modal" @click.stop>
          <div class="modal-header">
            <h2>上传活动合影</h2>
            <button class="close-btn" @click="closeUploadModal">×</button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitPhotoUpload">
              <div class="form-group">
                <label>选择图片</label>
                <div class="upload-area" @click="triggerFileInput">
                  <input 
                    type="file" 
                    ref="fileInput" 
                    style="display: none" 
                    accept="image/*" 
                    multiple
                    @change="handleFileSelect"
                  />
                  <div v-if="previewImages.length === 0" class="upload-placeholder">
                    <span>📷</span>
                    <p>点击上传图片或拖拽到此处</p>
                    <p class="upload-hint">支持JPG、PNG格式，最大5MB</p>
                  </div>
                  <div v-else class="preview-grid">
                    <div v-for="(image, index) in previewImages" :key="index" class="preview-item">
                      <img :src="image" :alt="`预览图${index + 1}`" class="preview-image" />
                      <button type="button" class="remove-img" @click="removePreviewImage(index)">×</button>
                    </div>
                    <div v-if="previewImages.length < 9" class="add-more" @click="triggerFileInput">
                      <span>+</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="form-group">
                <label for="photoDesc">照片描述 (选填)</label>
                <textarea 
                  id="photoDesc" 
                  v-model="uploadForm.description" 
                  placeholder="简单描述一下这张照片吧"
                ></textarea>
              </div>
              <button type="submit" class="btn submit-upload-btn">上传照片</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { useUserStore } from '../store/index.js';

export default {
  name: 'ActivityCalendarView',
  setup() {
    const userStore = useUserStore();
    const fileInput = ref(null);
    
    // 日历状态
    const currentYear = ref(new Date().getFullYear());
    const currentMonth = ref(new Date().getMonth());
    const selectedDate = ref(null);
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    
    // 弹窗状态
    const showActivityDetail = ref(false);
    const currentActivity = ref(null);
    const showPhotoViewer = ref(false);
    const currentPhoto = ref('');
    const showJoinModal = ref(false);
    const showUploadModal = ref(false);
    
    // 表单数据
    const joinForm = reactive({
      realName: '',
      phone: '',
      remark: '',
      agreed: false
    });
    
    const uploadForm = reactive({
      description: ''
    });
    
    const previewImages = ref([]);
    const selectedFiles = ref([]);
    
    // 活动数据
    const activitiesData = [
      {
        id: 1,
        title: '薛之谦「天外来物」世界巡回演唱会 - 上海站场外应援',
        type: 'concert',
        startTime: '2024-01-20T16:00:00',
        endTime: '2024-01-20T22:00:00',
        location: '上海市徐汇区龙腾大道3399号',
        description: '薛之谦「天外来物」世界巡回演唱会上海站场外应援活动，为谦谦加油助威！活动将提供应援物资、拍照打卡区，欢迎各位谦友前来参与！',
        status: 'upcoming',
        participants: [
          { id: 1, name: '谦友一号', avatar: 'https://picsum.photos/40/40?random=1' },
          { id: 2, name: '谦友二号', avatar: 'https://picsum.photos/40/40?random=2' },
          { id: 3, name: '谦友三号', avatar: 'https://picsum.photos/40/40?random=3' }
        ],
        schedule: [
          { time: '16:00', content: '签到、领取应援物资' },
          { time: '17:00', content: '大合影' },
          { time: '18:00', content: '场外应援、合唱' },
          { time: '19:00', content: '入场' }
        ],
        notices: [
          '请提前报名，现场凭报名信息签到',
          '请遵守现场秩序，不要影响公共环境',
          '建议绿色出行，附近停车位有限',
          '天气可能较冷，请做好保暖措施'
        ],
        photos: [
          'https://picsum.photos/600/400?random=10',
          'https://picsum.photos/600/400?random=11',
          'https://picsum.photos/600/400?random=12'
        ]
      },
      {
        id: 2,
        title: '薛之谦生日应援会 - 北京',
        type: 'birthday',
        startTime: '2024-07-17T14:00:00',
        endTime: '2024-07-17T18:00:00',
        location: '北京市朝阳区三里屯SOHO',
        description: '为庆祝薛之谦生日，我们在北京举办一场线下应援会，现场将有生日蛋糕、应援活动和粉丝互动环节，欢迎各位谦友参加！',
        status: 'upcoming',
        participants: [],
        schedule: [
          { time: '14:00', content: '签到、领取生日应援礼包' },
          { time: '15:00', content: '粉丝互动游戏' },
          { time: '16:00', content: '生日祝福视频播放' },
          { time: '17:00', content: '切蛋糕、合影留念' }
        ],
        notices: [
          '请提前报名，名额有限',
          '可自愿准备小礼物交换',
          '现场提供蛋糕和饮料',
          '活动全程将有摄影记录'
        ],
        photos: []
      },
      {
        id: 3,
        title: '「意外」专辑十周年纪念线下活动',
        type: 'fan-meet',
        startTime: '2024-01-15T14:00:00',
        endTime: '2024-01-15T17:00:00',
        location: '上海市静安区南京西路1618号',
        description: '纪念《意外》专辑发行十周年，邀请谦友一起回顾经典，分享与专辑的故事，现场将有专辑周边赠送。',
        status: 'past',
        participants: [
          { id: 4, name: '谦友四号', avatar: 'https://picsum.photos/40/40?random=4' },
          { id: 5, name: '谦友五号', avatar: 'https://picsum.photos/40/40?random=5' }
        ],
        schedule: [
          { time: '14:00', content: '签到、领取纪念周边' },
          { time: '14:30', content: '专辑回顾分享' },
          { time: '15:30', content: '粉丝故事分享' },
          { time: '16:30', content: '合影留念' }
        ],
        notices: [
          '请携带专辑或相关周边参与互动',
          '活动免费，名额有限',
          '现场将有签名海报抽奖'
        ],
        photos: [
          'https://picsum.photos/600/400?random=13',
          'https://picsum.photos/600/400?random=14',
          'https://picsum.photos/600/400?random=15',
          'https://picsum.photos/600/400?random=16'
        ]
      }
    ];
    
    // 计算当前月的天数
    const getDaysInMonth = (year, month) => {
      return new Date(year, month + 1, 0).getDate();
    };
    
    // 计算当前月第一天是星期几
    const getFirstDayOfMonth = (year, month) => {
      return new Date(year, month, 1).getDay();
    };
    
    // 计算上个月的天数
    const getPrevMonthDays = () => {
      const firstDayOfMonth = getFirstDayOfMonth(currentYear.value, currentMonth.value);
      const daysInPrevMonth = getDaysInMonth(
        currentMonth.value === 0 ? currentYear.value - 1 : currentYear.value,
        currentMonth.value === 0 ? 11 : currentMonth.value - 1
      );
      
      const prevMonthDays = [];
      for (let i = 0; i < firstDayOfMonth; i++) {
        prevMonthDays.push(daysInPrevMonth - firstDayOfMonth + i + 1);
      }
      
      return prevMonthDays;
    };
    
    // 计算当前月的天数
    const getCurrentMonthDays = () => {
      const daysInMonth = getDaysInMonth(currentYear.value, currentMonth.value);
      const days = [];
      for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
      }
      return days;
    };
    
    // 计算下个月需要显示的天数
    const getNextMonthDays = () => {
      const firstDayOfMonth = getFirstDayOfMonth(currentYear.value, currentMonth.value);
      const daysInMonth = getDaysInMonth(currentYear.value, currentMonth.value);
      const totalDaysToDisplay = 42; // 6行7列
      const nextMonthDaysCount = totalDaysToDisplay - firstDayOfMonth - daysInMonth;
      
      const nextMonthDays = [];
      for (let i = 1; i <= nextMonthDaysCount; i++) {
        nextMonthDays.push(i);
      }
      
      return nextMonthDays;
    };
    
    // 计算属性
    const prevMonthDays = computed(() => getPrevMonthDays());
    const currentMonthDays = computed(() => getCurrentMonthDays());
    const nextMonthDays = computed(() => getNextMonthDays());
    
    // 判断指定日期是否有活动
    const hasActivity = (year, month, day) => {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return activitiesData.some(activity => {
        const activityDate = activity.startTime.split('T')[0];
        return activityDate === dateStr;
      });
    };
    
    // 获取活动类型
    const getEventType = (year, month, day) => {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const activity = activitiesData.find(activity => {
        const activityDate = activity.startTime.split('T')[0];
        return activityDate === dateStr;
      });
      
      return activity ? activity.type : '';
    };
    
    // 判断是否是今天
    const isToday = (year, month, day) => {
      const today = new Date();
      return today.getFullYear() === year && 
             today.getMonth() === month && 
             today.getDate() === day;
    };
    
    // 切换月份
    const changeMonth = (delta) => {
      currentMonth.value += delta;
      
      if (currentMonth.value < 0) {
        currentMonth.value = 11;
        currentYear.value -= 1;
      } else if (currentMonth.value > 11) {
        currentMonth.value = 0;
        currentYear.value += 1;
      }
      
      selectedDate.value = null;
    };
    
    // 选择日期
    const selectDate = (year, month, day) => {
      selectedDate.value = {
        year,
        month,
        day
      };
    };
    
    // 格式化日期时间
    const formatDateTime = (dateTimeStr) => {
      const date = new Date(dateTimeStr);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    };
    
    // 获取选中日期的标题
    const selectedDateTitle = computed(() => {
      if (!selectedDate.value) {
        return '选择日期查看活动';
      }
      
      const { year, month, day } = selectedDate.value;
      return `${year}年${month + 1}月${day}日 活动列表`;
    });
    
    // 获取选中日期的活动列表
    const selectedDateActivities = computed(() => {
      if (!selectedDate.value) {
        return [];
      }
      
      const { year, month, day } = selectedDate.value;
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      return activitiesData.filter(activity => {
        const activityDate = activity.startTime.split('T')[0];
        return activityDate === dateStr;
      });
    });
    
    // 获取活动类型标签
    const getActivityTypeLabel = (type) => {
      const typeMap = {
        'concert': '演唱会',
        'birthday': '生日应援',
        'fan-meet': '粉丝见面会',
        'other': '其他活动'
      };
      
      return typeMap[type] || '未知类型';
    };
    
    // 获取活动状态
    const getActivityStatus = (status) => {
      const statusMap = {
        'upcoming': '即将开始',
        'ongoing': '进行中',
        'past': '已结束'
      };
      
      return statusMap[status] || '未知状态';
    };
    
    // 打开活动详情
    const openActivityDetail = (activity) => {
      currentActivity.value = activity;
      showActivityDetail.value = true;
    };
    
    // 关闭活动详情
    const closeActivityDetail = () => {
      showActivityDetail.value = false;
      currentActivity.value = null;
    };
    
    // 打开图片查看器
    const openPhotoViewer = (photo) => {
      currentPhoto.value = photo;
      showPhotoViewer.value = true;
    };
    
    // 关闭图片查看器
    const closePhotoViewer = () => {
      showPhotoViewer.value = false;
      currentPhoto.value = '';
    };
    
    // 打开报名弹窗
    const joinActivity = () => {
      showActivityDetail.value = false;
      showJoinModal.value = true;
      
      // 重置表单
      joinForm.realName = '';
      joinForm.phone = '';
      joinForm.remark = '';
      joinForm.agreed = false;
    };
    
    // 关闭报名弹窗
    const closeJoinModal = () => {
      showJoinModal.value = false;
    };
    
    // 提交报名表单
    const submitJoinForm = () => {
      // 模拟报名成功
      if (currentActivity.value) {
        const newParticipant = {
          id: Date.now(),
          name: userStore.userInfo?.name || '谦友',
          avatar: userStore.userInfo?.avatar || 'https://picsum.photos/40/40?random=6'
        };
        
        // 找到对应活动并添加参与者
        const activityIndex = activitiesData.findIndex(a => a.id === currentActivity.value.id);
        if (activityIndex !== -1) {
          activitiesData[activityIndex].participants.push(newParticipant);
        }
        
        // 发放奖励
        userStore.addQianbi(20);
        userStore.addExperience(10);
        
        // 关闭弹窗
        showJoinModal.value = false;
        showActivityDetail.value = true;
        
        // 显示成功提示
        alert('报名成功！获得20谦币和10经验值奖励！');
      }
    };
    
    // 打开照片上传
    const openPhotoUpload = () => {
      showActivityDetail.value = false;
      showUploadModal.value = true;
      
      // 重置表单
      uploadForm.description = '';
      previewImages.value = [];
      selectedFiles.value = [];
    };
    
    // 关闭照片上传
    const closeUploadModal = () => {
      showUploadModal.value = false;
    };
    
    // 触发文件选择
    const triggerFileInput = () => {
      if (fileInput.value) {
        fileInput.value.click();
      }
    };
    
    // 处理文件选择
    const handleFileSelect = (event) => {
      const files = Array.from(event.target.files);
      
      files.forEach(file => {
        // 检查文件大小
        if (file.size > 5 * 1024 * 1024) {
          alert('文件大小不能超过5MB');
          return;
        }
        
        // 检查文件类型
        if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
          alert('只支持JPG和PNG格式的图片');
          return;
        }
        
        // 添加到选中文件
        selectedFiles.value.push(file);
        
        // 生成预览
        const reader = new FileReader();
        reader.onload = (e) => {
          if (previewImages.value.length < 9) {
            previewImages.value.push(e.target.result);
          }
        };
        reader.readAsDataURL(file);
      });
      
      // 清空input，允许重复选择相同文件
      event.target.value = '';
    };
    
    // 移除预览图片
    const removePreviewImage = (index) => {
      previewImages.value.splice(index, 1);
      selectedFiles.value.splice(index, 1);
    };
    
    // 提交照片上传
    const submitPhotoUpload = () => {
      if (previewImages.value.length === 0) {
        alert('请至少选择一张照片');
        return;
      }
      
      // 模拟上传成功
      if (currentActivity.value) {
        // 找到对应活动并添加照片
        const activityIndex = activitiesData.findIndex(a => a.id === currentActivity.value.id);
        if (activityIndex !== -1) {
          activitiesData[activityIndex].photos.push(...previewImages.value);
        }
        
        // 发放奖励
        userStore.addQianbi(30);
        userStore.addExperience(15);
        
        // 关闭弹窗
        showUploadModal.value = false;
        showActivityDetail.value = true;
        
        // 显示成功提示
        alert('照片上传成功！获得30谦币和15经验值奖励！');
      }
    };
    
    // 判断当前用户是否已参与活动
    const isParticipant = computed(() => {
      if (!currentActivity.value || !userStore.userInfo) {
        return false;
      }
      
      const currentUserName = userStore.userInfo.name || '谦友';
      return currentActivity.value.participants.some(p => p.name === currentUserName);
    });
    
    return {
      currentYear,
      currentMonth,
      selectedDate,
      weekDays,
      prevMonthDays,
      currentMonthDays,
      nextMonthDays,
      hasActivity,
      getEventType,
      isToday,
      changeMonth,
      selectDate,
      selectedDateTitle,
      selectedDateActivities,
      formatDateTime,
      getActivityTypeLabel,
      getActivityStatus,
      showActivityDetail,
      currentActivity,
      closeActivityDetail,
      openActivityDetail,
      showPhotoViewer,
      currentPhoto,
      closePhotoViewer,
      openPhotoViewer,
      showJoinModal,
      joinForm,
      closeJoinModal,
      submitJoinForm,
      joinActivity,
      isParticipant,
      showUploadModal,
      uploadForm,
      closeUploadModal,
      openPhotoUpload,
      previewImages,
      fileInput,
      triggerFileInput,
      handleFileSelect,
      removePreviewImage,
      submitPhotoUpload
    };
  }
};
</script>

<style scoped>
.activity-calendar-view {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.activity-calendar-view h1 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.5rem;
  color: #333;
}

/* 日历部分 */
.calendar-section {
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.calendar-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.calendar-header .btn {
  padding: 0.5rem 1rem;
  border: 1px solid #d9d9d9;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s;
}

.calendar-header .btn:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.weekday {
  text-align: center;
  padding: 0.75rem;
  font-weight: 500;
  color: #666;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.calendar-day {
  position: relative;
  padding: 1rem 0.5rem;
  min-height: 80px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.calendar-day:hover {
  border-color: #1890ff;
  background-color: #e6f7ff;
}

.calendar-day.other-month {
  color: #d9d9d9;
  background-color: #f5f5f5;
}

.calendar-day.has-activity {
  border-color: #1890ff;
}

.calendar-day.today {
  background-color: #e6f7ff;
  font-weight: bold;
}

.calendar-day.selected {
  background-color: #1890ff;
  color: white;
}

.day-number {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.activity-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.activity-indicator.concert {
  background-color: #ff4d4f;
}

.activity-indicator.birthday {
  background-color: #ff9800;
}

.activity-indicator.fan-meet {
  background-color: #4caf50;
}

.activity-indicator.other {
  background-color: #9c27b0;
}

.calendar-legend {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-dot.concert {
  background-color: #ff4d4f;
}

.legend-dot.birthday {
  background-color: #ff9800;
}

.legend-dot.fan-meet {
  background-color: #4caf50;
}

.legend-dot.other {
  background-color: #9c27b0;
}

/* 活动列表部分 */
.activities-section {
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.activities-section h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  color: #333;
}

.activities-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.activity-card {
  padding: 1.5rem;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.activity-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #1890ff;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.activity-type {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  color: white;
}

.activity-type.concert {
  background-color: #ff4d4f;
}

.activity-type.birthday {
  background-color: #ff9800;
}

.activity-type.fan-meet {
  background-color: #4caf50;
}

.activity-type.other {
  background-color: #9c27b0;
}

.activity-date {
  font-size: 0.85rem;
  color: #666;
}

.activity-title {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  line-height: 1.4;
}

.activity-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.activity-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-status {
  font-size: 0.85rem;
  font-weight: 500;
}

.activity-status.upcoming {
  color: #52c41a;
}

.activity-status.ongoing {
  color: #1890ff;
}

.activity-status.past {
  color: #999;
}

.action-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
}

.join-btn {
  background-color: #1890ff;
  color: white;
}

.join-btn:hover:not(:disabled) {
  background-color: #40a9ff;
}

.join-btn:disabled {
  background-color: #d9d9d9;
  cursor: not-allowed;
}

.view-btn {
  background-color: #f5f5f5;
  color: #666;
}

.view-btn:hover {
  background-color: #e6f7ff;
  color: #1890ff;
}

.no-activities {
  text-align: center;
  padding: 3rem;
  color: #999;
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.join-modal,
.upload-modal {
  max-width: 500px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #d9d9d9;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.3rem;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background-color: transparent;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s;
}

.close-btn:hover {
  background-color: #f5f5f5;
  color: #333;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #d9d9d9;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

/* 活动详情 */
.activity-detail .detail-header {
  padding-bottom: 1.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  text-align: center;
}

.activity-detail .activity-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.activity-date-range,
.activity-location {
  margin-bottom: 0.5rem;
  color: #666;
}

.detail-content h4 {
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  font-size: 1.1rem;
  color: #333;
}

.schedule-list,
.notice-list {
  padding-left: 1.5rem;
  margin-bottom: 1.5rem;
}

.schedule-list li,
.notice-list li {
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

.schedule-time {
  font-weight: 500;
  margin-right: 0.5rem;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.activity-photo {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.3s;
}

.activity-photo:hover {
  transform: scale(1.05);
}

.activity-stats {
  display: flex;
  justify-content: space-around;
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.stat-value {
  display: block;
  font-size: 1.3rem;
  font-weight: bold;
}

.participants-section {
  margin-top: 1.5rem;
}

.participants-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.participant-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #f5f5f5;
  border-radius: 20px;
}

.participant-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

/* 图片查看器 */
.photo-viewer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
}

.photo-viewer {
  position: relative;
  max-width: 90%;
  max-height: 90vh;
}

.viewer-photo {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
}

.photo-viewer .close-btn {
  position: absolute;
  top: -40px;
  right: 0;
  color: white;
}

/* 表单样式 */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #1890ff;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.agreement {
  margin-bottom: 1.5rem;
}

.agreement a {
  color: #1890ff;
  text-decoration: none;
}

.agreement a:hover {
  text-decoration: underline;
}

.submit-join-btn,
.submit-upload-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-join-btn:hover,
.submit-upload-btn:hover {
  background-color: #40a9ff;
}

.primary-btn {
  padding: 0.75rem 1.5rem;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.primary-btn:hover {
  background-color: #40a9ff;
}

.secondary-btn {
  padding: 0.75rem 1.5rem;
  background-color: white;
  color: #666;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.secondary-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
}

/* 上传区域 */
.upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s;
}

.upload-area:hover {
  border-color: #1890ff;
}

.upload-placeholder span {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.upload-placeholder p {
  margin: 0.5rem 0;
  color: #666;
}

.upload-hint {
  font-size: 0.9rem;
  color: #999;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.preview-item {
  position: relative;
  padding-top: 100%;
  overflow: hidden;
  border-radius: 4px;
}

.preview-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-img {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 24px;
  height: 24px;
  border: none;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-more {
  border: 2px dashed #d9d9d9;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 100%;
  position: relative;
  cursor: pointer;
}

.add-more span {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
  color: #d9d9d9;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .calendar-weekdays,
  .calendar-days {
    font-size: 0.9rem;
  }
  
  .calendar-day {
    min-height: 60px;
    padding: 0.5rem 0.25rem;
  }
  
  .activities-list {
    grid-template-columns: 1fr;
  }
  
  .calendar-legend {
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .activity-stats {
    flex-direction: column;
    gap: 1rem;
  }
  
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
  
  .preview-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>