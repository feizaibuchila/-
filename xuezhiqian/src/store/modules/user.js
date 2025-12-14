import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => {
    // 从localStorage加载状态
    const savedState = localStorage.getItem('userState');
    const initialState = {
      // 用户基本信息
      userInfo: null,
      isLoggedIn: false,
      token: null,
      fansSince: null, // 成为粉丝的时长
      
      // 会员状态 - 增强版
      membership: {
        isVip: false,
        vipLevel: 0, // 0: 非会员, 1: 基础会员, 2: 高级会员
        startDate: null,
        endDate: null,
        daysRemaining: 0
      },
      
      // 应援积分和谦币
      supportPoints: 0,
      qianbi: 0, // 谦币积分
      
      // 应援等级
      supportLevel: {
        level: 1,
        experience: 0,
        nextLevelExp: 100,
        badges: [] // 获得的徽章列表
      },
      
      // 个性化主页设置
      profileSettings: {
        avatar: null,
        backgroundImage: null,
        bio: '',
        layoutType: 'default', // default, compact, expanded
        pinnedContent: [], // 置顶的内容
        displayStats: {
          supportDays: true,
          level: true,
          badges: true
        }
      },
      
      // 任务系统
      tasks: {
        daily: [],
        weekly: [],
        monthly: [],
        completedTasks: []
      },
      
      // 收藏内容
      collections: {
        songs: [],
        albums: [],
        news: [],
        activities: []
      },
      
      // 消息通知
      notifications: []
    };
    
    const saved = savedState ? JSON.parse(savedState) : {};
    
    // 处理日期对象
    if (saved.fansSince) {
      saved.fansSince = new Date(saved.fansSince);
    }
    if (saved.membership?.startDate) {
      saved.membership.startDate = new Date(saved.membership.startDate);
    }
    if (saved.membership?.endDate) {
      saved.membership.endDate = new Date(saved.membership.endDate);
    }
    if (saved.supportLevel?.badges) {
      saved.supportLevel.badges = saved.supportLevel.badges.map(badge => ({
        ...badge,
        unlockedAt: new Date(badge.unlockedAt)
      }));
    }
    if (saved.tasks?.completedTasks) {
      saved.tasks.completedTasks = saved.tasks.completedTasks.map(task => ({
        ...task,
        completedAt: new Date(task.completedAt)
      }));
    }
    if (saved.notifications) {
      saved.notifications = saved.notifications.map(notification => ({
        ...notification,
        date: new Date(notification.date)
      }));
    }
    
    return { ...initialState, ...saved };
  },
  
  getters: {
    getUserInfo: (state) => state.userInfo,
    getToken: (state) => state.token,
    getIsLoggedIn: (state) => state.isLoggedIn,
    getFansSince: (state) => state.fansSince,
    getIsVip: (state) => state.membership.isVip,
    getVipLevel: (state) => state.membership.vipLevel,
    getVipExpiryDate: (state) => state.membership.endDate,
    getVipDaysRemaining: (state) => state.membership.daysRemaining,
    getSupportPoints: (state) => state.supportPoints,
    getQianbi: (state) => state.qianbi,
    
    // 获取粉丝时长（年）
    getFansSinceYears: (state) => {
      if (!state.fansSince) return 0;
      const now = new Date();
      const yearsDiff = now.getFullYear() - state.fansSince.getFullYear();
      return yearsDiff;
    },
    
    // 计算应援天数
    getSupportDays: (state) => {
      if (!state.fansSince) return 0;
      const now = new Date();
      const diffTime = Math.abs(now - state.fansSince);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    },
    
    // 应援等级相关
    getSupportLevel: (state) => state.supportLevel.level,
    getSupportExperience: (state) => state.supportLevel.experience,
    getNextLevelExp: (state) => state.supportLevel.nextLevelExp,
    getLevelProgress: (state) => {
      return Math.min(100, Math.round((state.supportLevel.experience / state.supportLevel.nextLevelExp) * 100));
    },
    getBadges: (state) => state.supportLevel.badges,
    
    // 个性化主页设置
    getProfileSettings: (state) => state.profileSettings,
    getAvatar: (state) => state.profileSettings.avatar || (state.userInfo?.avatar || null),
    getBackgroundImage: (state) => state.profileSettings.backgroundImage,
    
    // 任务相关
    getDailyTasks: (state) => state.tasks.daily,
    getWeeklyTasks: (state) => state.tasks.weekly,
    getMonthlyTasks: (state) => state.tasks.monthly,
    getCompletedTasksCount: (state) => state.tasks.completedTasks.length,
    
    // 收藏内容
    getCollections: (state) => state.collections,
    getCollectedSongs: (state) => state.collections.songs,
    getCollectedAlbums: (state) => state.collections.albums,
    
    // 获取未读消息数量
    getUnreadNotifications: (state) => {
      return state.notifications.filter(notification => !notification.read).length;
    },
    
    // 检查会员是否有效
    isMembershipValid: (state) => {
      if (!state.membership.isVip) return false;
      const now = new Date();
      return now < state.membership.endDate;
    }
  },
  
  actions: {
    // 保存状态到localStorage
    saveState() {
      localStorage.setItem('userState', JSON.stringify({
        userInfo: this.userInfo,
        isLoggedIn: this.isLoggedIn,
        token: this.token,
        fansSince: this.fansSince,
        membership: this.membership,
        supportPoints: this.supportPoints,
        qianbi: this.qianbi,
        supportLevel: this.supportLevel,
        profileSettings: this.profileSettings,
        tasks: this.tasks,
        collections: this.collections,
        notifications: this.notifications
      }));
    },
    
    setUserInfo(userInfo) {
      this.userInfo = userInfo;
      this.isLoggedIn = true;
      // 计算成为粉丝的时长（随机生成一些年数）
      const years = Math.floor(Math.random() * 10) + 1;
      const now = new Date();
      const fansSince = new Date(now.getFullYear() - years, now.getMonth(), now.getDate());
      this.fansSince = fansSince;
      this.saveState();
    },
    
    setToken(token) {
      this.token = token;
      localStorage.setItem('token', token);
      this.saveState();
    },
    
    // 增强版：设置会员状态
    setVipStatus(isVip, expiryDate = null, level = 0) {
      this.membership.isVip = isVip;
      this.membership.vipLevel = level;
      this.membership.endDate = expiryDate;
      
      if (expiryDate) {
        const now = new Date();
        const diffTime = Math.abs(expiryDate - now);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        this.membership.daysRemaining = diffDays;
      }
      this.saveState();
    },
    
    // 开通/升级会员
    upgradeMembership(level, durationMonths) {
      const now = new Date();
      const endDate = new Date(now);
      endDate.setMonth(endDate.getMonth() + durationMonths);
      
      this.membership = {
        isVip: true,
        vipLevel: level,
        startDate: now,
        endDate: endDate,
        daysRemaining: durationMonths * 30
      };
      
      // 添加会员开通成功通知
      this.addNotification({
        type: 'membership',
        title: '会员开通成功',
        content: `恭喜您成功开通${level === 1 ? '基础' : '高级'}VIP会员！有效期至${this.formatDate(endDate)}`,
        read: false
      });
      this.saveState();
    },
    
    // 增加应援积分
    addSupportPoints(points) {
      this.supportPoints += points;
      this.saveState();
    },
    
    // 减少应援积分
    reduceSupportPoints(points) {
      if (this.supportPoints >= points) {
        this.supportPoints -= points;
        this.saveState();
        return true;
      }
      return false;
    },
    
    // 增加谦币
    addQianbi(amount) {
      this.qianbi += amount;
      this.addNotification({
        type: 'qianbi',
        title: '谦币到账',
        content: `恭喜获得${amount}谦币！`,
        read: false
      });
      this.saveState();
    },
    
    // 使用谦币
    useQianbi(amount) {
      if (this.qianbi >= amount) {
        this.qianbi -= amount;
        this.saveState();
        return true;
      }
      return false;
    },
    
    // 增加应援经验值
    addExperience(exp) {
      this.supportLevel.experience += exp;
      
      // 检查是否升级
      while (this.supportLevel.experience >= this.supportLevel.nextLevelExp) {
        this.levelUp();
      }
      this.saveState();
    },
    
    // 升级
    levelUp() {
      this.supportLevel.level++;
      this.supportLevel.experience -= this.supportLevel.nextLevelExp;
      this.supportLevel.nextLevelExp = Math.floor(this.supportLevel.nextLevelExp * 1.5); // 每级所需经验递增
      
      // 解锁徽章
      this.unlockBadge(`等级${this.supportLevel.level}`);
      
      this.addNotification({
        type: 'levelup',
        title: '恭喜升级！',
        content: `您的应援等级提升至${this.supportLevel.level}级！`,
        read: false
      });
      this.saveState();
    },
    
    // 解锁徽章
    unlockBadge(badgeName) {
      const existingBadge = this.supportLevel.badges.find(b => b.name === badgeName);
      if (!existingBadge) {
        this.supportLevel.badges.push({
          name: badgeName,
          unlockedAt: new Date(),
          icon: `badge-${this.supportLevel.level}`
        });
        this.saveState();
      }
    },
    
    // 更新个性化主页设置
    updateProfileSettings(settings) {
      this.profileSettings = { ...this.profileSettings, ...settings };
      this.saveState();
    },
    
    // 添加收藏
    addToCollection(type, item) {
      if (!this.collections[type]) {
        this.collections[type] = [];
      }
      
      const existingItem = this.collections[type].find(i => i.id === item.id);
      if (!existingItem) {
        this.collections[type].push(item);
        this.saveState();
        return true;
      }
      return false;
    },
    
    // 移除收藏
    removeFromCollection(type, itemId) {
      if (this.collections[type]) {
        this.collections[type] = this.collections[type].filter(item => item.id !== itemId);
        this.saveState();
      }
    },
    
    // 初始化任务
    initTasks() {
      // 初始化每日任务
      this.tasks.daily = [
        {
          id: 'daily-checkin',
          title: '每日打卡为薛之谦送祝福',
          description: '每天登录并签到，为薛之谦送上祝福',
          reward: { qianbi: 10, exp: 5 },
          completed: false,
          claimed: false,
          type: 'daily'
        },
        {
          id: 'daily-share',
          title: '分享应援站至社交平台',
          description: '将薛之谦应援站分享到微信/微博等社交平台',
          reward: { qianbi: 15, exp: 10 },
          completed: false,
          claimed: false,
          type: 'daily'
        },
        {
          id: 'daily-listen',
          title: '聆听薛之谦音乐30分钟',
          description: '在音乐播放器中累计收听薛之谦音乐30分钟',
          reward: { qianbi: 20, exp: 10 },
          completed: false,
          claimed: false,
          type: 'daily'
        }
      ];
      
      // 初始化每周任务
      this.tasks.weekly = [
        {
          id: 'weekly-post',
          title: '发布3条应援动态',
          description: '在话题互动墙发布3条带话题的应援动态',
          reward: { qianbi: 50, exp: 30 },
          progress: 0,
          target: 3,
          completed: false,
          claimed: false,
          type: 'weekly'
        },
        {
          id: 'weekly-collect',
          title: '收藏5首薛之谦歌曲',
          description: '收藏5首薛之谦的歌曲到个人收藏夹',
          reward: { qianbi: 30, exp: 20 },
          progress: 0,
          target: 5,
          completed: false,
          claimed: false,
          type: 'weekly'
        }
      ];
      this.saveState();
    },
    
    // 更新任务进度
    updateTaskProgress(taskId, progress = 1) {
      // 在不同类型的任务中查找
      let taskFound = false;
      
      // 检查每日任务
      for (let task of this.tasks.daily) {
        if (task.id === taskId && !task.completed) {
          task.completed = true;
          taskFound = true;
          break;
        }
      }
      
      // 检查每周任务
      if (!taskFound) {
        for (let task of this.tasks.weekly) {
          if (task.id === taskId && !task.completed) {
            task.progress += progress;
            if (task.progress >= task.target) {
              task.progress = task.target;
              task.completed = true;
            }
            taskFound = true;
            break;
          }
        }
      }
      
      // 检查每月任务
      if (!taskFound) {
        for (let task of this.tasks.monthly) {
          if (task.id === taskId && !task.completed) {
            task.progress += progress;
            if (task.progress >= task.target) {
              task.progress = task.target;
              task.completed = true;
            }
            taskFound = true;
            break;
          }
        }
      }
      
      if (taskFound) {
        this.saveState();
      }
    },
    
    // 领取任务奖励
    claimTaskReward(taskId) {
      // 在所有任务中查找
      let taskToClaim = null;
      
      // 检查各类任务
      [this.tasks.daily, this.tasks.weekly, this.tasks.monthly].forEach(taskType => {
        if (!taskToClaim) {
          taskToClaim = taskType.find(t => t.id === taskId && t.completed && !t.claimed);
        }
      });
      
      if (taskToClaim) {
        // 发放奖励
        if (taskToClaim.reward.qianbi) {
          this.addQianbi(taskToClaim.reward.qianbi);
        }
        if (taskToClaim.reward.exp) {
          this.addExperience(taskToClaim.reward.exp);
        }
        
        taskToClaim.claimed = true;
        this.tasks.completedTasks.push({
          taskId: taskId,
          completedAt: new Date(),
          reward: taskToClaim.reward
        });
        
        this.saveState();
        return true;
      }
      
      return false;
    },
    
    // 添加通知
    addNotification(notification) {
      const newNotification = {
        id: Date.now(),
        ...notification,
        date: new Date()
      };
      this.notifications.unshift(newNotification);
      this.saveState();
    },
    
    // 标记通知为已读
    markNotificationAsRead(notificationId) {
      const notification = this.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
        this.saveState();
      }
    },
    
    // 格式化日期
    formatDate(date) {
      const d = new Date(date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    },
    
    logout() {
      this.userInfo = null;
      this.isLoggedIn = false;
      this.token = null;
      this.membership = {
        isVip: false,
        vipLevel: 0,
        startDate: null,
        endDate: null,
        daysRemaining: 0
      };
      // 保留应援积分和粉丝时长
      localStorage.removeItem('token');
      this.saveState();
    },
    
    // 初始化用户状态
    initUserState() {
      const token = localStorage.getItem('token');
      if (token) {
        this.token = token;
        // 这里应该从服务器验证token并获取用户信息
        // 但在模拟环境中，我们直接设置用户信息
        this.isLoggedIn = true;
        this.userInfo = {
          username: 'xuezhiqianfan',
          avatar: 'https://picsum.photos/64/64?random=1',
          nickname: '薛之谦的小迷弟/妹',
          id: '1'
        };
        
        // 模拟数据
        const years = Math.floor(Math.random() * 5) + 1;
        const now = new Date();
        const fansSince = new Date(now.getFullYear() - years, now.getMonth(), now.getDate());
        this.fansSince = fansSince;
        
        // 模拟VIP用户
        this.membership = {
          isVip: true,
          vipLevel: 1,
          startDate: new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()),
          endDate: new Date(now.getFullYear(), now.getMonth() + 6, now.getDate()),
          daysRemaining: 180
        };
        
        // 模拟应援积分和谦币
        this.supportPoints = 1500;
        this.qianbi = 500;
        
        // 模拟应援等级
        this.supportLevel = {
          level: 3,
          experience: 120,
          nextLevelExp: 200,
          badges: [
            {
              name: '等级1',
              unlockedAt: new Date(now.getFullYear(), now.getMonth() - 2, 1),
              icon: 'badge-1'
            },
            {
              name: '等级2',
              unlockedAt: new Date(now.getFullYear(), now.getMonth() - 1, 10),
              icon: 'badge-2'
            },
            {
              name: '等级3',
              unlockedAt: new Date(now.getFullYear(), now.getMonth(), 1),
              icon: 'badge-3'
            },
            {
              name: '活跃粉丝',
              unlockedAt: new Date(now.getFullYear(), now.getMonth(), 15),
              icon: 'badge-active'
            }
          ]
        };
        
        // 模拟个性化主页设置
        this.profileSettings = {
          avatar: 'https://picsum.photos/200/200?random=10',
          backgroundImage: 'https://picsum.photos/1200/400?random=20',
          bio: '薛之谦的忠实粉丝，愿世界和平！',
          layoutType: 'default',
          pinnedContent: [
            {
              id: '1',
              type: 'post',
              title: '演唱会记录'
            }
          ],
          displayStats: {
            supportDays: true,
            level: true,
            badges: true
          }
        };
        
        // 初始化任务
        this.initTasks();
        
        // 模拟收藏内容
        this.collections = {
          songs: [
            {
              id: '1',
              name: '演员',
              album: '意外',
              cover: 'https://picsum.photos/100/100?random=30'
            },
            {
              id: '2',
              name: '认真的雪',
              album: '薛之谦',
              cover: 'https://picsum.photos/100/100?random=31'
            }
          ],
          albums: [
            {
              id: '1',
              title: '无数',
              cover: 'https://picsum.photos/100/100?random=40'
            }
          ],
          news: [],
          activities: []
        };
        
        // 模拟通知
        this.notifications = [
          {
            id: 1,
            type: 'membership',
            title: '会员即将到期',
            content: '您的VIP会员将在180天后到期，记得及时续费哦！',
            read: false,
            date: new Date()
          },
          {
            id: 2,
            type: 'activity',
            title: '新歌打榜活动开始啦',
            content: '薛之谦新歌《天外来物2》打榜活动已开始，参与即送应援积分！',
            read: false,
            date: new Date()
          }
        ];
        
        this.saveState();
      }
    }
  }
});
