<template>
  <div class="schedule-calendar-container">
    <h2>薛之谦行程日历</h2>
    
    <!-- 筛选选项 -->
    <div class="filter-section card">
      <div class="filter-controls">
        <div class="filter-group">
          <label>筛选类型：</label>
          <div class="filter-buttons">
            <button 
              v-for="type in eventTypes" 
              :key="type.value"
              :class="['filter-btn', { active: selectedTypes.includes(type.value) }]"
              @click="toggleType(type.value)"
            >
              {{ type.label }}
            </button>
          </div>
        </div>
        
        <div class="date-range">
          <label>日期范围：</label>
          <div class="date-picker">
            <input 
              type="month" 
              v-model="currentMonth"
              class="month-input"
              @change="onMonthChange"
            >
          </div>
        </div>
      </div>
      
      <div class="event-legend">
        <div class="legend-item" v-for="type in eventTypes" :key="type.value">
          <span class="legend-color" :style="{ backgroundColor: type.color }"></span>
          <span class="legend-text">{{ type.label }}</span>
        </div>
      </div>
    </div>
    
    <!-- 日历视图 -->
    <div class="calendar-view">
      <!-- 月份导航 -->
      <div class="calendar-header">
        <button class="nav-btn" @click="prevMonth">←</button>
        <h3>{{ currentMonthDisplay }}</h3>
        <button class="nav-btn" @click="nextMonth">→</button>
      </div>
      
      <!-- 日历网格 -->
      <div class="calendar-grid">
        <!-- 星期标题 -->
        <div class="weekday-header">
          <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
        </div>
        
        <!-- 日期单元格 -->
        <div class="calendar-days">
          <!-- 上月剩余天数 -->
          <div 
            v-for="day in prevMonthDays" 
            :key="`prev-${day}`"
            class="calendar-day prev-month"
          >
            <span class="day-number">{{ day }}</span>
          </div>
          
          <!-- 当月天数 -->
          <div 
            v-for="day in currentMonthDays" 
            :key="day"
            class="calendar-day current-month"
            :class="{ today: isToday(day), 'has-event': hasEvent(day) }"
          >
            <span class="day-number">{{ day }}</span>
            
            <!-- 事件指示器 -->
            <div class="event-indicators">
              <div 
                v-for="event in getEventsForDay(day)" 
                :key="event.id"
                class="event-indicator"
                :style="{ backgroundColor: getEventTypeColor(event.type) }"
                :title="`${event.title} - ${event.time}`"
              ></div>
            </div>
          </div>
          
          <!-- 下月开始天数 -->
          <div 
            v-for="day in nextMonthDays" 
            :key="`next-${day}`"
            class="calendar-day next-month"
          >
            <span class="day-number">{{ day }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 今日行程和详情 -->
    <div class="schedule-details">
      <!-- 今日行程 -->
      <div class="today-schedule card" v-if="todayEvents.length > 0">
        <h3>今日行程</h3>
        <div class="today-events">
          <div 
            v-for="event in todayEvents" 
            :key="event.id"
            class="today-event-item"
            :style="{ borderLeftColor: getEventTypeColor(event.type) }"
            @click="showEventDetails(event)"
          >
            <div class="event-time">{{ event.time }}</div>
            <div class="event-info">
              <div class="event-title">{{ event.title }}</div>
              <div class="event-location">{{ event.location }}</div>
            </div>
            <div class="event-actions">
              <button 
                class="add-cal-btn"
                @click.stop="addToCalendar(event)"
                :title="'添加到日历'"
              >
                📅
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 选定日期行程 -->
      <div class="selected-day-schedule card" v-if="selectedDate && selectedDateEvents.length > 0">
        <h3>{{ formatSelectedDate }} 行程</h3>
        <div class="selected-day-events">
          <div 
            v-for="event in selectedDateEvents" 
            :key="event.id"
            class="selected-event-item"
            :style="{ borderLeftColor: getEventTypeColor(event.type) }"
          >
            <div class="event-time">{{ event.time }}</div>
            <div class="event-info">
              <div class="event-title">{{ event.title }}</div>
              <div class="event-location">{{ event.location }}</div>
              <div class="event-description">{{ event.description }}</div>
            </div>
            <div class="event-actions">
              <button 
                class="add-cal-btn"
                @click="addToCalendar(event)"
                :title="'添加到日历'"
              >
                📅
              </button>
              <button 
                class="share-btn"
                @click="shareEvent(event)"
                :title="'分享行程'"
              >
                🔗
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 即将到来的重要事件 -->
    <div class="upcoming-events card" v-if="upcomingEvents.length > 0">
      <h3>即将到来的重要事件</h3>
      <div class="upcoming-events-list">
        <div 
          v-for="event in upcomingEvents" 
          :key="event.id"
          class="upcoming-event-item"
          :class="{ 'vip-event': event.vipOnly }"
          @click="showEventDetails(event)"
        >
          <div class="event-date">
            <div class="event-month">{{ getMonthName(event.date) }}</div>
            <div class="event-day">{{ getDayOfMonth(event.date) }}</div>
          </div>
          <div class="event-content">
            <div class="event-header">
              <span 
                class="event-badge"
                :style="{ backgroundColor: getEventTypeColor(event.type) }"
              >
                {{ getEventTypeName(event.type) }}
              </span>
              <div v-if="event.vipOnly" class="vip-badge">
                <span class="vip-badge-text">{{ currentUser.vipLevel === 2 ? '高级VIP' : 'VIP' }}专享</span>
              </div>
            </div>
            <h4 class="event-title">{{ event.title }}</h4>
            <div class="event-meta">
              <span class="event-time">{{ event.time }}</span>
              <span class="event-location">{{ event.location }}</span>
            </div>
            <div class="event-countdown">
              距离{{ formatEventDate(event.date) }}还有 {{ getCountdown(event.date) }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 行程详情弹窗 -->
    <div v-if="showEventModal" class="modal-overlay" @click="closeEventModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedEvent.title }}</h3>
          <button class="close-btn" @click="closeEventModal">×</button>
        </div>
        <div class="modal-body">
          <div class="event-detail">
            <div class="detail-row">
              <span class="detail-label">日期：</span>
              <span class="detail-value">{{ formatEventDate(selectedEvent.date) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">时间：</span>
              <span class="detail-value">{{ selectedEvent.time }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">地点：</span>
              <span class="detail-value">{{ selectedEvent.location }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">类型：</span>
              <span 
                class="detail-value event-type-badge"
                :style="{ backgroundColor: getEventTypeColor(selectedEvent.type) }"
              >
                {{ getEventTypeName(selectedEvent.type) }}
              </span>
            </div>
            <div v-if="selectedEvent.vipOnly" class="detail-row">
              <span class="detail-label">特殊说明：</span>
              <span class="detail-value vip-only-badge">
                {{ currentUser.vipLevel === 2 ? '高级VIP' : 'VIP' }}专享
              </span>
            </div>
            <div class="detail-row description">
              <span class="detail-label">详细介绍：</span>
              <span class="detail-value">{{ selectedEvent.description }}</span>
            </div>
          </div>
          
          <div class="event-actions">
            <button class="btn btn-primary" @click="addToCalendar(selectedEvent)">
              添加到日历
            </button>
            <button class="btn btn-secondary" @click="shareEvent(selectedEvent)">
              分享行程
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '../store/index';

export default {
  name: 'ScheduleCalendar',
  setup() {
    const userStore = useUserStore();
    
    // 当前用户信息
    const currentUser = computed(() => ({
      id: userStore.getUserInfo.id,
      nickname: userStore.getUserInfo.nickname,
      vipLevel: userStore.getVipLevel
    }));
    
    // 事件类型
    const eventTypes = [
      { value: 'concert', label: '演唱会', color: '#ff3c57' },
      { value: 'variety', label: '综艺', color: '#f9d56e' },
      { value: 'music', label: '新歌发布', color: '#1a1a2e' },
      { value: 'other', label: '其他活动', color: '#16213e' }
    ];
    
    // 筛选的事件类型
    const selectedTypes = ref(['concert', 'variety', 'music', 'other']);
    
    // 当前月份
    const currentMonth = ref(new Date().toISOString().slice(0, 7));
    
    // 星期标题
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    
    // 事件数据
    const events = ref([
      {
        id: 1,
        title: '薛之谦「天外来物」世界巡回演唱会 - 上海站',
        type: 'concert',
        date: new Date('2024-12-25'),
        time: '19:30',
        location: '上海体育场',
        description: '薛之谦2024「天外来物」世界巡回演唱会上海站，带来全新舞台体验和经典歌曲演绎。高级会员可提前48小时购票。',
        vipOnly: false,
        ticketLink: '#'
      },
      {
        id: 2,
        title: '《我们的歌》录制',
        type: 'variety',
        date: new Date('2024-12-15'),
        time: '14:00',
        location: '东方卫视演播厅',
        description: '薛之谦参与《我们的歌》节目录制，与其他歌手合作带来精彩表演。',
        vipOnly: false,
        ticketLink: null
      },
      {
        id: 3,
        title: '新专辑《未知的旅程》发布会',
        type: 'music',
        date: new Date('2025-01-10'),
        time: '15:00',
        location: '北京国家会议中心',
        description: '薛之谦全新专辑《未知的旅程》发布会，现场首唱新歌曲，与粉丝互动。会员专属限量版专辑优先购买。',
        vipOnly: true,
        ticketLink: '#'
      },
      {
        id: 4,
        title: '薛之谦「天外来物」世界巡回演唱会 - 北京站',
        type: 'concert',
        date: new Date('2025-01-18'),
        time: '19:30',
        location: '北京工人体育场',
        description: '薛之谦2024「天外来物」世界巡回演唱会北京站，带来震撼视听体验。',
        vipOnly: false,
        ticketLink: '#'
      },
      {
        id: 5,
        title: '《中国好声音》导师录制',
        type: 'variety',
        date: new Date('2025-01-25'),
        time: '13:00',
        location: '浙江卫视演播厅',
        description: '薛之谦作为《中国好声音》导师参与节目录制，点评学员表现。',
        vipOnly: false,
        ticketLink: null
      },
      {
        id: 6,
        title: '新歌《流星》发布',
        type: 'music',
        date: new Date('2025-02-01'),
        time: '00:00',
        location: '各大音乐平台',
        description: '薛之谦全新单曲《流星》零点发布，会员可提前24小时收听。',
        vipOnly: false,
        ticketLink: null
      },
      {
        id: 7,
        title: '薛之谦「天外来物」世界巡回演唱会 - 广州站',
        type: 'concert',
        date: new Date('2025-02-14'),
        time: '19:30',
        location: '广州天河体育中心',
        description: '薛之谦2024「天外来物」世界巡回演唱会广州站，情人节特别场。',
        vipOnly: false,
        ticketLink: '#'
      },
      {
        id: 8,
        title: '粉丝见面会（高级会员专享）',
        type: 'other',
        date: new Date('2025-02-20'),
        time: '16:00',
        location: '深圳大剧院',
        description: '薛之谦高级会员专属见面会，与粉丝近距离互动，签名合影。',
        vipOnly: true,
        ticketLink: '#'
      }
    ]);
    
    // 选中的事件和日期
    const selectedEvent = ref(null);
    const showEventModal = ref(false);
    const selectedDate = ref(null);
    
    // 获取当前月份的显示文本
    const currentMonthDisplay = computed(() => {
      const [year, month] = currentMonth.value.split('-');
      return `${year}年${parseInt(month)}月`;
    });
    
    // 获取当前月份的第一天
    const firstDayOfMonth = computed(() => {
      const [year, month] = currentMonth.value.split('-');
      return new Date(year, month - 1, 1);
    });
    
    // 获取当前月份的最后一天
    const lastDayOfMonth = computed(() => {
      const [year, month] = currentMonth.value.split('-');
      return new Date(year, month, 0);
    });
    
    // 获取当前月份的天数
    const currentMonthDays = computed(() => {
      return lastDayOfMonth.value.getDate();
    });
    
    // 获取上个月剩余天数
    const prevMonthDays = computed(() => {
      const firstDay = firstDayOfMonth.value.getDay();
      const prevMonth = new Date(firstDayOfMonth.value);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      const prevMonthLastDay = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0).getDate();
      
      const days = [];
      for (let i = 0; i < firstDay; i++) {
        days.push(prevMonthLastDay - firstDay + i + 1);
      }
      return days;
    });
    
    // 获取下个月开始天数
    const nextMonthDays = computed(() => {
      const lastDay = lastDayOfMonth.value.getDay();
      const days = [];
      for (let i = 1; i <= 6 - lastDay; i++) {
        days.push(i);
      }
      return days;
    });
    
    // 检查是否是今天
    const isToday = (day) => {
      const today = new Date();
      const [year, month] = currentMonth.value.split('-');
      return (
        today.getFullYear() === parseInt(year) &&
        today.getMonth() + 1 === parseInt(month) &&
        today.getDate() === day
      );
    };
    
    // 检查某一天是否有事件
    const hasEvent = (day) => {
      const [year, month] = currentMonth.value.split('-');
      const targetDate = new Date(year, month - 1, day);
      
      return events.value.some(event => {
        const eventDate = new Date(event.date);
        return (
          eventDate.getFullYear() === targetDate.getFullYear() &&
          eventDate.getMonth() === targetDate.getMonth() &&
          eventDate.getDate() === targetDate.getDate() &&
          (selectedTypes.value.includes(event.type) || event.type === 'music')
        );
      });
    };
    
    // 获取某一天的所有事件
    const getEventsForDay = (day) => {
      const [year, month] = currentMonth.value.split('-');
      const targetDate = new Date(year, month - 1, day);
      
      return events.value.filter(event => {
        const eventDate = new Date(event.date);
        return (
          eventDate.getFullYear() === targetDate.getFullYear() &&
          eventDate.getMonth() === targetDate.getMonth() &&
          eventDate.getDate() === targetDate.getDate() &&
          selectedTypes.value.includes(event.type)
        );
      });
    };
    
    // 获取事件类型的颜色
    const getEventTypeColor = (type) => {
      const eventType = eventTypes.find(t => t.value === type);
      return eventType ? eventType.color : '#999';
    };
    
    // 获取事件类型的名称
    const getEventTypeName = (type) => {
      const eventType = eventTypes.find(t => t.value === type);
      return eventType ? eventType.label : '未知类型';
    };
    
    // 切换事件类型筛选
    const toggleType = (type) => {
      const index = selectedTypes.value.indexOf(type);
      if (index > -1) {
        selectedTypes.value.splice(index, 1);
      } else {
        selectedTypes.value.push(type);
      }
    };
    
    // 切换到上个月
    const prevMonth = () => {
      const [year, month] = currentMonth.value.split('-');
      const date = new Date(year, month - 1, 1);
      date.setMonth(date.getMonth() - 1);
      currentMonth.value = date.toISOString().slice(0, 7);
    };
    
    // 切换到下个月
    const nextMonth = () => {
      const [year, month] = currentMonth.value.split('-');
      const date = new Date(year, month - 1, 1);
      date.setMonth(date.getMonth() + 1);
      currentMonth.value = date.toISOString().slice(0, 7);
    };
    
    // 月份改变时的处理
    const onMonthChange = () => {
      // 重置选中的日期
      selectedDate.value = null;
    };
    
    // 点击日期单元格
    const handleDayClick = (day) => {
      const [year, month] = currentMonth.value.split('-');
      const clickedDate = new Date(year, month - 1, day);
      
      selectedDate.value = clickedDate;
      // 滚动到选定日期行程
      setTimeout(() => {
        const element = document.querySelector('.selected-day-schedule');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    };
    
    // 显示事件详情
    const showEventDetails = (event) => {
      selectedEvent.value = event;
      showEventModal.value = true;
    };
    
    // 关闭事件详情弹窗
    const closeEventModal = () => {
      showEventModal.value = false;
      selectedEvent.value = null;
    };
    
    // 添加到日历
    const addToCalendar = (event) => {
      // 这里是模拟添加到日历的功能
      // 实际项目中可以使用第三方库或浏览器API
      alert(`${event.title} 已添加到日历！`);
    };
    
    // 分享事件
    const shareEvent = (event) => {
      // 这里是模拟分享事件的功能
      // 实际项目中可以使用Web Share API或生成分享链接
      alert(`分享链接已复制到剪贴板！\n${event.title} - ${formatEventDate(event.date)} ${event.time}`);
    };
    
    // 格式化事件日期
    const formatEventDate = (date) => {
      const d = new Date(date);
      return `${d.getFullYear()}年${String(d.getMonth() + 1).padStart(2, '0')}月${String(d.getDate()).padStart(2, '0')}日`;
    };
    
    // 格式化选定日期
    const formatSelectedDate = computed(() => {
      if (!selectedDate.value) return '';
      return formatEventDate(selectedDate.value);
    });
    
    // 获取月份名称
    const getMonthName = (date) => {
      const d = new Date(date);
      return `${d.getMonth() + 1}月`;
    };
    
    // 获取日期
    const getDayOfMonth = (date) => {
      const d = new Date(date);
      return d.getDate();
    };
    
    // 获取倒计时
    const getCountdown = (date) => {
      const now = new Date();
      const eventDate = new Date(date);
      const diffTime = Math.abs(eventDate - now);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return '今天';
      } else if (diffDays === 1) {
        return '1天';
      } else if (diffDays < 30) {
        return `${diffDays}天`;
      } else {
        const diffMonths = Math.floor(diffDays / 30);
        return `${diffMonths}个月`;
      }
    };
    
    // 获取今日事件
    const todayEvents = computed(() => {
      const today = new Date();
      return events.value.filter(event => {
        const eventDate = new Date(event.date);
        return (
          eventDate.getFullYear() === today.getFullYear() &&
          eventDate.getMonth() === today.getMonth() &&
          eventDate.getDate() === today.getDate() &&
          selectedTypes.value.includes(event.type)
        );
      });
    });
    
    // 获取选定日期的事件
    const selectedDateEvents = computed(() => {
      if (!selectedDate.value) return [];
      
      return events.value.filter(event => {
        const eventDate = new Date(event.date);
        return (
          eventDate.getFullYear() === selectedDate.value.getFullYear() &&
          eventDate.getMonth() === selectedDate.value.getMonth() &&
          eventDate.getDate() === selectedDate.value.getDate() &&
          selectedTypes.value.includes(event.type)
        );
      });
    });
    
    // 获取即将到来的重要事件（未来3个月内）
    const upcomingEvents = computed(() => {
      const now = new Date();
      const threeMonthsLater = new Date();
      threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
      
      return events.value
        .filter(event => {
          const eventDate = new Date(event.date);
          // 只显示未来的事件，并且在3个月内
          return eventDate >= now && eventDate <= threeMonthsLater && selectedTypes.value.includes(event.type);
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5); // 最多显示5个
    });
    
    // 组件挂载时初始化
    onMounted(() => {
      // 可以在这里加载事件数据
    });
    
    return {
      currentUser,
      eventTypes,
      selectedTypes,
      currentMonth,
      weekdays,
      currentMonthDisplay,
      prevMonthDays,
      currentMonthDays,
      nextMonthDays,
      selectedEvent,
      showEventModal,
      selectedDate,
      formatSelectedDate,
      todayEvents,
      selectedDateEvents,
      upcomingEvents,
      isToday,
      hasEvent,
      getEventsForDay,
      getEventTypeColor,
      getEventTypeName,
      toggleType,
      prevMonth,
      nextMonth,
      onMonthChange,
      handleDayClick,
      showEventDetails,
      closeEventModal,
      addToCalendar,
      shareEvent,
      formatEventDate,
      getMonthName,
      getDayOfMonth,
      getCountdown
    };
  }
};
</script>

<style scoped>
.schedule-calendar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.schedule-calendar-container h2 {
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

/* 筛选区域 */
.filter-section {
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.filter-controls {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.filter-group {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.filter-group label {
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border: 2px solid var(--border-color);
  background: var(--background-primary);
  color: var(--text-primary);
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all var(--transition-speed) ease;
}

.filter-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.filter-btn.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.date-range label {
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
}

.month-input {
  padding: 0.5rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 6px;
  background: var(--background-primary);
  color: var(--text-primary);
  font-size: 1rem;
  cursor: pointer;
}

.month-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.event-legend {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

/* 日历视图 */
.calendar-view {
  margin-bottom: 2rem;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--background-secondary);
  border-radius: 8px;
}

.calendar-header h3 {
  font-size: 1.25rem;
  color: var(--text-primary);
  margin: 0;
}

.nav-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: var(--background-primary);
  color: var(--text-primary);
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all var(--transition-speed) ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn:hover {
  background: var(--primary-color);
  color: white;
}

.calendar-grid {
  border: 2px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.weekday-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: var(--background-secondary);
}

.weekday {
  padding: 1rem;
  text-align: center;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 2px solid var(--border-color);
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  min-height: 400px;
}

.calendar-day {
  position: relative;
  min-height: 100px;
  padding: 0.5rem;
  border-bottom: 1px solid var(--border-color);
  border-right: 1px solid var(--border-color);
  background: var(--background-primary);
  transition: all var(--transition-speed) ease;
  cursor: pointer;
}

.calendar-day:nth-child(7n) {
  border-right: none;
}

.calendar-day:last-child {
  border-bottom: none;
}

.calendar-day:hover {
  background: var(--background-secondary);
}

.calendar-day.prev-month,
.calendar-day.next-month {
  background: var(--background-tertiary);
  color: var(--text-disabled);
}

.calendar-day.today {
  background: rgba(255, 60, 87, 0.1);
  border: 2px solid var(--primary-color);
  z-index: 1;
}

.day-number {
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: inline-block;
}

.event-indicators {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-top: 0.25rem;
}

.event-indicator {
  width: 100%;
  height: 4px;
  border-radius: 2px;
  margin-bottom: 2px;
}

.calendar-day.has-event:hover .event-indicators {
  opacity: 1;
}

/* 行程详情 */
.schedule-details {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 2rem;
}

.today-schedule h3,
.selected-day-schedule h3 {
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.today-events,
.selected-day-events {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.today-event-item,
.selected-event-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--background-secondary);
  border-radius: 8px;
  border-left: 4px solid var(--primary-color);
  transition: all var(--transition-speed) ease;
  cursor: pointer;
}

.today-event-item:hover,
.selected-event-item:hover {
  transform: translateX(4px);
}

.event-time {
  min-width: 80px;
  font-weight: 600;
  color: var(--text-primary);
}

.event-info {
  flex: 1;
}

.event-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.event-location {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.event-description {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
  line-height: 1.5;
}

.event-actions {
  display: flex;
  gap: 0.5rem;
}

.add-cal-btn,
.share-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: var(--background-primary);
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all var(--transition-speed) ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-cal-btn:hover,
.share-btn:hover {
  background: var(--primary-color);
  color: white;
}

/* 即将到来的事件 */
.upcoming-events h3 {
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.upcoming-events-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.upcoming-event-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: var(--background-secondary);
  border-radius: 8px;
  transition: all var(--transition-speed) ease;
  cursor: pointer;
}

.upcoming-event-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.upcoming-event-item.vip-event {
  border: 2px solid var(--vip-premium-color);
}

.event-date {
  min-width: 60px;
  text-align: center;
  padding: 0.5rem;
  background: var(--background-primary);
  border-radius: 6px;
}

.event-month {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.event-day {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
}

.event-content {
  flex: 1;
}

.event-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.event-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
}

.vip-badge {
  background: var(--vip-premium-color);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.vip-badge-text {
  color: white;
}

.upcoming-event-item h4 {
  font-size: 1.1rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.event-meta {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.event-countdown {
  font-size: 0.9rem;
  color: var(--primary-color);
  font-weight: 600;
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

.event-detail {
  margin-bottom: 2rem;
}

.detail-row {
  display: flex;
  margin-bottom: 1rem;
  align-items: flex-start;
}

.detail-row.description {
  flex-direction: column;
  align-items: stretch;
}

.detail-label {
  min-width: 80px;
  font-weight: 600;
  color: var(--text-secondary);
}

.detail-value {
  flex: 1;
  color: var(--text-primary);
}

.event-type-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
}

.vip-only-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: var(--vip-premium-color);
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
}

.modal-body .event-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .schedule-calendar-container {
    padding: 1rem;
  }
  
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group,
  .date-range {
    justify-content: center;
  }
  
  .calendar-day {
    min-height: 80px;
    padding: 0.25rem;
  }
  
  .event-indicators {
    gap: 0.15rem;
  }
  
  .event-indicator {
    height: 3px;
  }
  
  .today-event-item,
  .selected-event-item {
    flex-direction: column;
    align-items: stretch;
  }
  
  .event-time {
    min-width: auto;
  }
  
  .event-actions {
    justify-content: flex-end;
  }
  
  .upcoming-event-item {
    flex-direction: column;
    align-items: stretch;
  }
  
  .event-date {
    min-width: auto;
  }
  
  .event-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .modal-content {
    margin: 1rem;
  }
  
  .modal-body .event-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .calendar-header h3 {
    font-size: 1.1rem;
  }
  
  .nav-btn {
    width: 32px;
    height: 32px;
    font-size: 1rem;
  }
  
  .weekday {
    padding: 0.5rem;
    font-size: 0.85rem;
  }
  
  .day-number {
    font-size: 0.9rem;
  }
  
  .modal-header {
    padding: 1rem;
  }
  
  .modal-body {
    padding: 1rem;
  }
  
  .detail-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .detail-label {
    min-width: auto;
    margin-bottom: 0.25rem;
  }
}
</style>