import { defineStore } from 'pinia';

export const useAppStore = defineStore('app', {
  state: () => {
    // 从localStorage加载状态
    const savedState = localStorage.getItem('appState');
    const initialState = {
      loading: false,
      error: null,
      currentTab: 'concerts', // 默认选中演唱会标签
      filter: {
        keyword: '',
        type: 'all'
      },
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      
      // 主题设置
      theme: 'default', // default, dark, light
      
      // 通知设置
      notificationSettings: {
        newSong: true,
        concert: true,
        activity: true,
        membership: true
      },
      
      // 播放器设置
      playerSettings: {
        volume: 80,
        repeatMode: 'off', // off, repeatOne, repeatAll
        shuffle: false
      }
    };
    
    return savedState ? { ...initialState, ...JSON.parse(savedState) } : initialState;
  },
  
  getters: {
    getLoading: (state) => state.loading,
    getError: (state) => state.error,
    getCurrentTab: (state) => state.currentTab,
    getFilter: (state) => state.filter,
    getPagination: (state) => state.pagination,
    getTheme: (state) => state.theme,
    getNotificationSettings: (state) => state.notificationSettings,
    getPlayerSettings: (state) => state.playerSettings
  },
  
  actions: {
    // 保存状态到localStorage
    saveState() {
      localStorage.setItem('appState', JSON.stringify({
        currentTab: this.currentTab,
        filter: this.filter,
        pagination: this.pagination,
        theme: this.theme,
        notificationSettings: this.notificationSettings,
        playerSettings: this.playerSettings
      }));
    },
    
    setLoading(loading) {
      this.loading = loading;
    },
    
    setError(error) {
      this.error = error;
    },
    
    clearError() {
      this.error = null;
    },
    
    setCurrentTab(tab) {
      this.currentTab = tab;
      this.saveState();
    },
    
    setFilter(filter) {
      this.filter = { ...this.filter, ...filter };
      this.saveState();
    },
    
    setPagination(pagination) {
      this.pagination = { ...this.pagination, ...pagination };
      this.saveState();
    },
    
    // 切换主题
    toggleTheme(theme) {
      this.theme = theme;
      this.saveState();
      // 这里可以添加主题切换的其他逻辑
    },
    
    // 更新通知设置
    updateNotificationSettings(settings) {
      this.notificationSettings = { ...this.notificationSettings, ...settings };
      this.saveState();
    },
    
    // 更新播放器设置
    updatePlayerSettings(settings) {
      this.playerSettings = { ...this.playerSettings, ...settings };
      this.saveState();
    }
  }
});
