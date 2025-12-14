<template>
  <div class="profile-view">
    <!-- 背景图和个人信息区域 -->
    <div class="profile-header" :style="{ backgroundImage: `url(${backgroundImage})` }">
      <div class="profile-info">
        <div class="avatar-container">
          <img :src="avatar" alt="用户头像" class="avatar" @click="triggerAvatarUpload" />
          <input type="file" ref="avatarInput" @change="handleAvatarUpload" style="display: none;" accept="image/*" />
          <div class="avatar-edit-overlay">
            <span>更换头像</span>
          </div>
        </div>
        <div class="user-details">
          <h1>{{ userInfo.nickname }}</h1>
          <p class="username">@{{ userInfo.username }}</p>
          <p class="bio" v-if="profileSettings.bio">{{ profileSettings.bio }}</p>
          <p class="bio" v-else>
            <span class="placeholder" @click="editBio">添加个人简介...</span>
          </p>
        </div>
      </div>
      <div class="header-actions">
        <button class="btn edit-profile-btn" @click="toggleEditMode">
          {{ isEditMode ? '保存设置' : '编辑资料' }}
        </button>
        <button class="btn layout-btn" @click="openLayoutSettings">
          布局设置
        </button>
      </div>
    </div>

    <!-- 编辑资料弹窗 -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal-content">
        <h2>编辑个人资料</h2>
        <div class="form-group">
          <label>昵称</label>
          <input v-model="editForm.nickname" type="text" class="form-input" />
        </div>
        <div class="form-group">
          <label>个人简介</label>
          <textarea v-model="editForm.bio" class="form-textarea" rows="4"></textarea>
        </div>
        <div class="form-group">
          <label>背景图</label>
          <input type="file" @change="handleBackgroundUpload" class="form-file" accept="image/*" />
          <img v-if="editForm.backgroundImage" :src="editForm.backgroundImage" class="preview-image" />
        </div>
        <div class="modal-actions">
          <button class="btn btn-primary" @click="saveProfile">保存</button>
          <button class="btn btn-secondary" @click="showEditModal = false">取消</button>
        </div>
      </div>
    </div>

    <!-- 布局设置弹窗 -->
    <div v-if="showLayoutModal" class="modal-overlay" @click.self="showLayoutModal = false">
      <div class="modal-content">
        <h2>布局设置</h2>
        <div class="form-group">
          <label>布局类型</label>
          <select v-model="editForm.layoutType" class="form-select">
            <option value="default">默认布局</option>
            <option value="compact">紧凑布局</option>
            <option value="expanded">展开布局</option>
          </select>
        </div>
        <div class="form-group">
          <label>显示统计信息</label>
          <div class="checkbox-group">
            <label>
              <input type="checkbox" v-model="editForm.displayStats.supportDays" />
              应援天数
            </label>
            <label>
              <input type="checkbox" v-model="editForm.displayStats.level" />
              应援等级
            </label>
            <label>
              <input type="checkbox" v-model="editForm.displayStats.badges" />
              徽章展示
            </label>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-primary" @click="saveLayout">保存</button>
          <button class="btn btn-secondary" @click="showLayoutModal = false">取消</button>
        </div>
      </div>
    </div>

    <!-- 应援等级和统计信息 -->
    <div class="stats-container">
      <div v-if="profileSettings.displayStats.supportDays" class="stat-item">
        <div class="stat-value">{{ supportDays }}</div>
        <div class="stat-label">应援天数</div>
      </div>
      <div v-if="profileSettings.displayStats.level" class="stat-item">
        <div class="stat-value">Lv.{{ supportLevel }}</div>
        <div class="stat-label">应援等级</div>
        <div class="level-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: levelProgress + '%' }"></div>
          </div>
          <span class="progress-text">{{ supportExperience }}/{{ nextLevelExp }} 经验</span>
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ qianbi }}</div>
        <div class="stat-label">谦币</div>
      </div>
    </div>

    <!-- 徽章展示 -->
    <div v-if="profileSettings.displayStats.badges && badges.length > 0" class="badges-container">
      <h3>获得徽章</h3>
      <div class="badges-grid">
        <div v-for="badge in badges" :key="badge.name" class="badge-item">
          <div class="badge-icon">{{ badge.name }}</div>
          <div class="badge-name">{{ badge.name }}</div>
          <div class="badge-date">{{ formatDate(badge.unlockedAt) }}</div>
        </div>
      </div>
    </div>

    <!-- 收藏内容展示 -->
    <div class="collections-container">
      <div class="section-header">
        <h3>我的收藏</h3>
        <div class="collection-tabs">
          <button 
            v-for="tab in collectionTabs" 
            :key="tab.key"
            :class="['tab-btn', { active: activeTab === tab.key }]"
            @click="activeTab = tab.key"
          >
            {{ tab.title }}
          </button>
        </div>
      </div>

      <!-- 收藏的歌曲 -->
      <div v-if="activeTab === 'songs'" class="collections-grid">
        <div v-for="song in collectedSongs" :key="song.id" class="collection-item">
          <img :src="song.cover" alt="歌曲封面" class="item-cover" />
          <div class="item-info">
            <h4>{{ song.name }}</h4>
            <p>{{ song.album }}</p>
          </div>
        </div>
        <div v-if="collectedSongs.length === 0" class="empty-state">
          暂无收藏的歌曲
        </div>
      </div>

      <!-- 收藏的专辑 -->
      <div v-if="activeTab === 'albums'" class="collections-grid">
        <div v-for="album in collectedAlbums" :key="album.id" class="collection-item album-item">
          <img :src="album.cover" alt="专辑封面" class="item-cover" />
          <div class="item-info">
            <h4>{{ album.title }}</h4>
          </div>
        </div>
        <div v-if="collectedAlbums.length === 0" class="empty-state">
          暂无收藏的专辑
        </div>
      </div>
    </div>

    <!-- 应援手绘和文案展示 -->
    <div class="support-content-container">
      <h3>我的应援创作</h3>
      <div class="support-upload-section">
        <button class="btn upload-btn" @click="triggerSupportUpload">
          上传应援手绘/文案
        </button>
        <input type="file" ref="supportInput" @change="handleSupportUpload" style="display: none;" accept="image/*" />
      </div>
      <div v-if="supportWorks.length > 0" class="support-works-grid">
        <div v-for="work in supportWorks" :key="work.id" class="support-work-item">
          <img v-if="work.type === 'image'" :src="work.url" alt="应援手绘" class="work-image" />
          <div v-else class="work-text">
            {{ work.content }}
          </div>
          <div class="work-actions">
            <button class="btn btn-small" @click="editSupportWork(work)">编辑</button>
            <button class="btn btn-small delete-btn" @click="deleteSupportWork(work.id)">删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted } from 'vue';
import { useUserStore } from '../store/index.js';

export default {
  name: 'ProfileView',
  setup() {
    const userStore = useUserStore();
    const isEditMode = ref(false);
    const showEditModal = ref(false);
    const showLayoutModal = ref(false);
    const activeTab = ref('songs');
    const supportWorks = ref([]);
    const avatarInput = ref(null);
    const supportInput = ref(null);
    
    // 编辑表单
    const editForm = ref({
      nickname: '',
      bio: '',
      backgroundImage: '',
      layoutType: 'default',
      displayStats: {
        supportDays: true,
        level: true,
        badges: true
      }
    });

    // 计算属性
    const userInfo = computed(() => userStore.getUserInfo);
    const avatar = computed(() => userStore.getAvatar);
    const backgroundImage = computed(() => userStore.getBackgroundImage || 'https://picsum.photos/1200/400?random=99');
    const profileSettings = computed(() => userStore.getProfileSettings);
    const supportDays = computed(() => userStore.getSupportDays);
    const supportLevel = computed(() => userStore.getSupportLevel);
    const supportExperience = computed(() => userStore.getSupportExperience);
    const nextLevelExp = computed(() => userStore.getNextLevelExp);
    const levelProgress = computed(() => userStore.getLevelProgress);
    const badges = computed(() => userStore.getBadges);
    const qianbi = computed(() => userStore.getQianbi);
    const collectedSongs = computed(() => userStore.getCollectedSongs);
    const collectedAlbums = computed(() => userStore.getCollectedAlbums);

    const collectionTabs = [
      { key: 'songs', title: '歌曲' },
      { key: 'albums', title: '专辑' }
    ];

    // 方法
    const toggleEditMode = () => {
      if (isEditMode.value) {
        // 保存设置
        isEditMode.value = false;
      } else {
        isEditMode.value = true;
      }
    };

    const openLayoutSettings = () => {
      // 初始化编辑表单
      editForm.value = {
        nickname: userInfo.value.nickname,
        bio: profileSettings.value.bio,
        backgroundImage: profileSettings.value.backgroundImage,
        layoutType: profileSettings.value.layoutType,
        displayStats: { ...profileSettings.value.displayStats }
      };
      showLayoutModal.value = true;
    };

    const triggerAvatarUpload = () => {
      avatarInput.value?.click();
    };

    const handleAvatarUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          userStore.updateProfileSettings({ avatar: e.target.result });
        };
        reader.readAsDataURL(file);
      }
    };

    const handleBackgroundUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          editForm.value.backgroundImage = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    };

    const editBio = () => {
      showEditModal.value = true;
      editForm.value.bio = profileSettings.value.bio;
      editForm.value.nickname = userInfo.value.nickname;
    };

    const saveProfile = () => {
      userStore.updateProfileSettings({
        bio: editForm.value.bio
      });
      // 这里应该调用API更新用户昵称
      showEditModal.value = false;
    };

    const saveLayout = () => {
      userStore.updateProfileSettings({
        layoutType: editForm.value.layoutType,
        displayStats: editForm.value.displayStats,
        backgroundImage: editForm.value.backgroundImage
      });
      showLayoutModal.value = false;
    };

    const triggerSupportUpload = () => {
      supportInput.value?.click();
    };

    const handleSupportUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          supportWorks.value.push({
            id: Date.now(),
            type: 'image',
            url: e.target.result,
            createdAt: new Date()
          });
        };
        reader.readAsDataURL(file);
      }
    };

    const editSupportWork = (work) => {
      // 编辑功能待实现
      console.log('编辑作品:', work);
    };

    const deleteSupportWork = (workId) => {
      supportWorks.value = supportWorks.value.filter(work => work.id !== workId);
    };

    const formatDate = (date) => {
      const d = new Date(date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    // 初始化模拟数据
    onMounted(() => {
      // 模拟应援作品
      supportWorks.value = [
        {
          id: 1,
          type: 'image',
          url: 'https://picsum.photos/400/400?random=100',
          createdAt: new Date()
        },
        {
          id: 2,
          type: 'text',
          content: '薛之谦，你的音乐陪伴了我整个青春，未来继续加油！',
          createdAt: new Date()
        }
      ];
    });

    return {
      userInfo,
      avatar,
      backgroundImage,
      profileSettings,
      supportDays,
      supportLevel,
      supportExperience,
      nextLevelExp,
      levelProgress,
      badges,
      qianbi,
      collectedSongs,
      collectedAlbums,
      collectionTabs,
      activeTab,
      isEditMode,
      showEditModal,
      showLayoutModal,
      editForm,
      supportWorks,
      avatarInput,
      supportInput,
      toggleEditMode,
      openLayoutSettings,
      triggerAvatarUpload,
      handleAvatarUpload,
      handleBackgroundUpload,
      editBio,
      saveProfile,
      saveLayout,
      triggerSupportUpload,
      handleSupportUpload,
      editSupportWork,
      deleteSupportWork,
      formatDate
    };
  }
};
</script>

<style scoped>
.profile-view {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.profile-header {
  position: relative;
  height: 400px;
  background-size: cover;
  background-position: center;
  color: white;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.profile-info {
  display: flex;
  align-items: flex-end;
  gap: 2rem;
  margin-bottom: 2rem;
}

.avatar-container {
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid white;
  cursor: pointer;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-edit-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-container:hover .avatar-edit-overlay {
  opacity: 1;
}

.user-details {
  flex: 1;
}

.user-details h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.username {
  color: #ddd;
  margin-bottom: 1rem;
}

.bio {
  font-size: 1.1rem;
  line-height: 1.6;
  max-width: 600px;
}

.placeholder {
  color: #999;
  font-style: italic;
  text-decoration: underline;
  cursor: pointer;
}

.header-actions {
  position: absolute;
  top: 2rem;
  right: 2rem;
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.edit-profile-btn {
  background-color: #1890ff;
  color: white;
}

.edit-profile-btn:hover {
  background-color: #40a9ff;
}

.layout-btn {
  background-color: #ffffff;
  color: #333;
}

.layout-btn:hover {
  background-color: #f0f0f0;
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
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content h2 {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 1rem;
}

.preview-image {
  max-width: 100%;
  max-height: 200px;
  margin-top: 1rem;
  border-radius: 4px;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: normal;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn-primary {
  background-color: #1890ff;
  color: white;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
}

/* 统计信息样式 */
.stats-container {
  background-color: white;
  padding: 2rem;
  margin: -50px auto 2rem;
  max-width: 1200px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-around;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #1890ff;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #666;
  font-size: 1rem;
}

.level-progress {
  margin-top: 1rem;
  padding: 0 2rem;
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

/* 徽章样式 */
.badges-container {
  max-width: 1200px;
  margin: 0 auto 2rem;
  padding: 0 1rem;
}

.badges-container h3 {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.badges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.badge-item {
  background-color: white;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.badge-icon {
  width: 60px;
  height: 60px;
  background-color: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.75rem;
  font-size: 0.875rem;
  color: #1890ff;
}

.badge-name {
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.badge-date {
  font-size: 0.875rem;
  color: #999;
}

/* 收藏内容样式 */
.collections-container {
  max-width: 1200px;
  margin: 0 auto 2rem;
  padding: 0 1rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h3 {
  font-size: 1.5rem;
}

.collection-tabs {
  display: flex;
  gap: 1rem;
}

.tab-btn {
  background: none;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: border-color 0.3s;
}

.tab-btn.active {
  color: #1890ff;
  border-bottom-color: #1890ff;
}

.collections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.collection-item {
  background-color: white;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  gap: 1rem;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.album-item {
  flex-direction: column;
  text-align: center;
}

.item-cover {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.album-item .item-cover {
  width: 100%;
  height: auto;
  aspect-ratio: 1;
}

.item-info h4 {
  margin-bottom: 0.25rem;
}

.item-info p {
  color: #666;
  font-size: 0.875rem;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem;
  color: #999;
  background-color: #f8f9fa;
  border-radius: 8px;
}

/* 应援内容样式 */
.support-content-container {
  max-width: 1200px;
  margin: 0 auto 2rem;
  padding: 0 1rem;
}

.support-content-container h3 {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.support-upload-section {
  margin-bottom: 2rem;
  text-align: center;
}

.upload-btn {
  background-color: #52c41a;
  color: white;
}

.upload-btn:hover {
  background-color: #73d13d;
}

.support-works-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.support-work-item {
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.work-image {
  width: 100%;
  height: auto;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.work-text {
  line-height: 1.6;
  margin-bottom: 1rem;
  min-height: 100px;
}

.work-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.delete-btn {
  background-color: #ff4d4f;
  color: white;
}

.delete-btn:hover {
  background-color: #ff7875;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-header {
    height: 300px;
    padding: 1rem;
  }
  
  .profile-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1rem;
  }
  
  .avatar-container {
    width: 100px;
    height: 100px;
    margin-bottom: -50px;
  }
  
  .header-actions {
    position: static;
    margin-top: 1rem;
    justify-content: center;
  }
  
  .stats-container {
    flex-direction: column;
    gap: 2rem;
    margin-top: 60px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>