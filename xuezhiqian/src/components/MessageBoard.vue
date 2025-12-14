<template>
  <div class="message-board-container">
    <h2>应援留言板</h2>
    
    <!-- 留言板标签页 -->
    <div class="message-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.key" 
        :class="['tab-btn', { active: currentTab === tab.key }]"
        @click="switchTab(tab.key)"
      >
        {{ tab.label }}
      </button>
    </div>
    
    <!-- 发布留言区域 -->
    <div class="post-message-section card">
      <div class="user-info">
        <img :src="currentUser.avatar" alt="用户头像" class="user-avatar">
        <span class="user-name">{{ currentUser.nickname }}</span>
        <div v-if="currentUser.vipLevel > 0" class="vip-badge-container" :class="currentUser.vipLevel === 2 ? 'vip-premium' : 'vip-standard'">
          <span class="vip-badge-text">{{ currentUser.vipLevel === 2 ? '高级VIP' : 'VIP' }}</span>
        </div>
      </div>
      
      <textarea 
        v-model="newMessage.content"
        placeholder="写下你想对薛之谦说的话..."
        class="message-input"
        maxlength="500"
        rows="4"
      ></textarea>
      
      <div class="message-actions">
        <!-- 上传图片 -->
        <div class="upload-section">
          <label for="image-upload" class="upload-btn">
            📷 上传图片
          </label>
          <input 
            id="image-upload"
            type="file"
            accept="image/*"
            multiple
            @change="handleImageUpload"
            style="display: none;"
          >
          <span class="upload-hint">(最多上传3张图片)</span>
        </div>
        
        <!-- 图片预览 -->
        <div class="image-preview" v-if="previewImages.length > 0">
          <div v-for="(image, index) in previewImages" :key="index" class="preview-item">
            <img :src="image" :alt="`预览图片${index + 1}`">
            <button class="remove-image" @click="removeImage(index)">×</button>
          </div>
        </div>
        
        <div class="post-actions">
          <span class="char-count">{{ newMessage.content.length }}/500</span>
          <button 
            class="btn btn-primary post-btn"
            @click="postMessage"
            :disabled="!newMessage.content.trim()"
          >
            发布留言
          </button>
        </div>
      </div>
    </div>
    
    <!-- 筛选和排序 -->
    <div class="filter-sort-section">
      <div class="filter-options">
        <label>筛选：</label>
        <select v-model="filterType" class="filter-select">
          <option value="all">全部</option>
          <option value="text">文字</option>
          <option value="image">图文</option>
        </select>
        
        <select v-model="sortType" class="sort-select">
          <option value="newest">最新发布</option>
          <option value="hottest">最热</option>
          <option value="mostLiked">最多点赞</option>
        </select>
      </div>
    </div>
    
    <!-- 留言列表 -->
    <div class="messages-list">
      <div v-if="filteredMessages.length === 0" class="empty-state">
        暂无留言
      </div>
      
      <div 
        v-for="message in filteredMessages" 
        :key="message.id"
        class="message-item card fade-in"
      >
        <div class="message-header">
          <div class="user-info">
            <img :src="message.user.avatar" alt="用户头像" class="user-avatar">
            <div class="user-details">
              <span class="user-name">{{ message.user.nickname }}</span>
              <div v-if="message.user.vipLevel > 0" class="vip-badge-container small" :class="message.user.vipLevel === 2 ? 'vip-premium' : 'vip-standard'">
                <span class="vip-badge-text">{{ message.user.vipLevel === 2 ? '高级VIP' : 'VIP' }}</span>
              </div>
            </div>
          </div>
          <div class="message-time">
            {{ formatDate(message.createdAt) }}
          </div>
        </div>
        
        <div class="message-content">
          <p>{{ message.content }}</p>
          
          <!-- 图片展示 -->
          <div v-if="message.images && message.images.length > 0" class="message-images">
            <img 
              v-for="(image, index) in message.images" 
              :key="index"
              :src="image"
              :alt="`留言图片${index + 1}`"
              class="message-image"
              @click="openImageViewer(image)"
            >
          </div>
        </div>
        
        <div class="message-footer">
          <button 
            class="action-btn like-btn"
            :class="{ liked: message.isLiked }"
            @click="toggleLike(message.id)"
          >
            <span class="icon">{{ message.isLiked ? '❤️' : '🤍' }}</span>
            <span class="count">{{ message.likes }}</span>
          </button>
          
          <button 
            class="action-btn comment-btn"
            @click="toggleComments(message.id)"
          >
            <span class="icon">💬</span>
            <span class="count">{{ message.comments.length }}</span>
          </button>
          
          <button 
            class="action-btn share-btn"
            @click="shareMessage(message.id)"
          >
            <span class="icon">🔗</span>
            <span>分享</span>
          </button>
        </div>
        
        <!-- 评论区域 -->
        <div 
          v-if="expandedComments.includes(message.id)"
          class="comments-section"
        >
          <!-- 评论列表 -->
          <div v-if="message.comments.length > 0" class="comments-list">
            <div 
              v-for="comment in message.comments" 
              :key="comment.id"
              class="comment-item"
            >
              <img :src="comment.user.avatar" alt="用户头像" class="comment-avatar">
              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-user">{{ comment.user.nickname }}</span>
                  <div v-if="comment.user.vipLevel > 0" class="vip-badge-container mini" :class="comment.user.vipLevel === 2 ? 'vip-premium' : 'vip-standard'">
                    <span class="vip-badge-text">{{ comment.user.vipLevel === 2 ? '高级VIP' : 'VIP' }}</span>
                  </div>
                  <span class="comment-time">{{ formatDate(comment.createdAt) }}</span>
                </div>
                <p class="comment-text">{{ comment.content }}</p>
                <div class="comment-actions">
                  <button 
                    class="comment-action-btn like-btn"
                    :class="{ liked: comment.isLiked }"
                    @click="toggleCommentLike(message.id, comment.id)"
                  >
                    <span class="icon">{{ comment.isLiked ? '❤️' : '🤍' }}</span>
                    <span class="count">{{ comment.likes }}</span>
                  </button>
                  <button 
                    class="comment-action-btn reply-btn"
                    @click="replyToComment(message.id, comment.id, comment.user.nickname)"
                  >
                    <span>回复</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 发表评论 -->
          <div class="post-comment-section">
            <img :src="currentUser.avatar" alt="用户头像" class="comment-avatar">
            <div class="comment-input-wrapper">
              <input 
                v-model="commentInputs[message.id]"
                type="text"
                placeholder="写下你的回复..."
                class="comment-input"
                maxlength="200"
                @keydown.enter="postComment(message.id)"
              >
              <button 
                class="btn btn-primary comment-btn"
                @click="postComment(message.id)"
                :disabled="!commentInputs[message.id]?.trim()"
              >
                回复
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 加载更多 -->
      <div v-if="hasMoreMessages" class="load-more">
        <button class="btn btn-secondary" @click="loadMoreMessages">
          加载更多
        </button>
      </div>
    </div>
    
    <!-- 图片查看器 -->
    <div v-if="showImageViewer" class="image-viewer-overlay" @click="closeImageViewer">
      <div class="image-viewer" @click.stop>
        <button class="close-btn" @click="closeImageViewer">×</button>
        <img :src="currentViewImage" :alt="'查看图片'">
        <div class="viewer-controls" v-if="currentMessageImages.length > 1">
          <button class="nav-btn" @click="prevImage">←</button>
          <span class="image-counter">{{ currentImageIndex + 1 }}/{{ currentMessageImages.length }}</span>
          <button class="nav-btn" @click="nextImage">→</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '../store/index';

export default {
  name: 'MessageBoard',
  setup() {
    const userStore = useUserStore();
    
    // 当前用户信息
    const currentUser = computed(() => ({
      id: userStore.getUserInfo.id,
      nickname: userStore.getUserInfo.nickname,
      avatar: userStore.getUserInfo.avatar,
      vipLevel: userStore.getVipLevel
    }));
    
    // 标签页
    const tabs = [
      { key: 'all', label: '全部留言' },
      { key: 'concert', label: '演唱会应援' },
      { key: 'birthday', label: '生日应援' },
      { key: 'other', label: '其他应援' }
    ];
    const currentTab = ref('all');
    
    // 筛选和排序
    const filterType = ref('all');
    const sortType = ref('newest');
    
    // 留言数据
    const messages = ref([
      {
        id: 1,
        user: {
          id: 1,
          nickname: '谦友一号',
          avatar: 'https://picsum.photos/id/64/200',
          vipLevel: 2
        },
        content: '薛之谦的演唱会真的太精彩了！每一首歌都让人感动，期待下次再见！永远快乐薛之谦，我心终有谦谦结！',
        images: [
          'https://picsum.photos/id/1015/800/600',
          'https://picsum.photos/id/1016/800/600'
        ],
        likes: 128,
        isLiked: false,
        comments: [
          {
            id: 1,
            user: {
              id: 2,
              nickname: '谦友二号',
              avatar: 'https://picsum.photos/id/65/200',
              vipLevel: 1
            },
            content: '我也去了！现场气氛超棒！',
            likes: 15,
            isLiked: false,
            createdAt: new Date(Date.now() - 3600000)
          },
          {
            id: 2,
            user: {
              id: 3,
              nickname: '谦友三号',
              avatar: 'https://picsum.photos/id/66/200',
              vipLevel: 0
            },
            content: '羡慕了，没抢到票...',
            likes: 5,
            isLiked: false,
            createdAt: new Date(Date.now() - 1800000)
          }
        ],
        createdAt: new Date(Date.now() - 86400000),
        type: 'concert'
      },
      {
        id: 2,
        user: {
          id: 4,
          nickname: '谦友四号',
          avatar: 'https://picsum.photos/id/67/200',
          vipLevel: 1
        },
        content: '祝我们最亲爱的薛之谦生日快乐！新歌超级好听，希望未来一切顺利，永远支持你！',
        images: [
          'https://picsum.photos/id/1025/800/600'
        ],
        likes: 256,
        isLiked: true,
        comments: [
          {
            id: 3,
            user: {
              id: 5,
              nickname: '谦友五号',
              avatar: 'https://picsum.photos/id/68/200',
              vipLevel: 0
            },
            content: '生日快乐！',
            likes: 42,
            isLiked: false,
            createdAt: new Date(Date.now() - 7200000)
          }
        ],
        createdAt: new Date(Date.now() - 172800000),
        type: 'birthday'
      },
      {
        id: 3,
        user: {
          id: 6,
          nickname: '谦友六号',
          avatar: 'https://picsum.photos/id/69/200',
          vipLevel: 0
        },
        content: '新歌循环播放中，歌词写得太戳心了，每一句都唱出了我的心声。薛之谦真的是个天才创作人！',
        images: [],
        likes: 89,
        isLiked: false,
        comments: [],
        createdAt: new Date(Date.now() - 259200000),
        type: 'other'
      },
      {
        id: 4,
        user: {
          id: 7,
          nickname: '谦友七号',
          avatar: 'https://picsum.photos/id/70/200',
          vipLevel: 2
        },
        content: '今天去接机了，薛之谦本人超温柔的！还跟我们打招呼，送了签名，太幸福了！',
        images: [
          'https://picsum.photos/id/1035/800/600',
          'https://picsum.photos/id/1036/800/600',
          'https://picsum.photos/id/1037/800/600'
        ],
        likes: 178,
        isLiked: false,
        comments: [
          {
            id: 4,
            user: {
              id: 8,
              nickname: '谦友八号',
              avatar: 'https://picsum.photos/id/71/200',
              vipLevel: 1
            },
            content: '哇！好羡慕啊！',
            likes: 23,
            isLiked: true,
            createdAt: new Date(Date.now() - 10800000)
          }
        ],
        createdAt: new Date(Date.now() - 345600000),
        type: 'other'
      },
      {
        id: 5,
        user: {
          id: 9,
          nickname: '谦友九号',
          avatar: 'https://picsum.photos/id/72/200',
          vipLevel: 1
        },
        content: '终于收到了限量版专辑，包装太精美了！里面的歌词本设计也很用心，每一首歌都值得细细品味。',
        images: [
          'https://picsum.photos/id/1045/800/600',
          'https://picsum.photos/id/1046/800/600'
        ],
        likes: 145,
        isLiked: false,
        comments: [],
        createdAt: new Date(Date.now() - 432000000),
        type: 'other'
      }
    ]);
    
    // 新留言
    const newMessage = ref({
      content: '',
      images: []
    });
    
    // 图片预览
    const previewImages = ref([]);
    
    // 展开的评论
    const expandedComments = ref([]);
    
    // 评论输入
    const commentInputs = ref({});
    
    // 加载更多相关
    const hasMoreMessages = ref(true);
    const currentPage = ref(1);
    const pageSize = ref(10);
    
    // 图片查看器
    const showImageViewer = ref(false);
    const currentViewImage = ref('');
    const currentImageIndex = ref(0);
    const currentMessageImages = ref([]);
    
    // 格式化日期
    const formatDate = (date) => {
      const now = new Date();
      const messageDate = new Date(date);
      const diffTime = Math.abs(now - messageDate);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      
      if (diffMinutes < 1) {
        return '刚刚';
      } else if (diffMinutes < 60) {
        return `${diffMinutes}分钟前`;
      } else if (diffHours < 24) {
        return `${diffHours}小时前`;
      } else if (diffDays < 7) {
        return `${diffDays}天前`;
      } else {
        return `${messageDate.getFullYear()}-${String(messageDate.getMonth() + 1).padStart(2, '0')}-${String(messageDate.getDate()).padStart(2, '0')}`;
      }
    };
    
    // 切换标签页
    const switchTab = (tabKey) => {
      currentTab.value = tabKey;
      currentPage.value = 1;
    };
    
    // 处理图片上传
    const handleImageUpload = (event) => {
      const files = event.target.files;
      if (!files) return;
      
      const maxFiles = 3;
      const remainingSlots = maxFiles - previewImages.value.length;
      const filesToAdd = Math.min(files.length, remainingSlots);
      
      for (let i = 0; i < filesToAdd; i++) {
        const file = files[i];
        const reader = new FileReader();
        
        reader.onload = (e) => {
          previewImages.value.push(e.target.result);
          newMessage.value.images.push(e.target.result);
        };
        
        reader.readAsDataURL(file);
      }
    };
    
    // 移除预览图片
    const removeImage = (index) => {
      previewImages.value.splice(index, 1);
      newMessage.value.images.splice(index, 1);
    };
    
    // 发布留言
    const postMessage = () => {
      if (!newMessage.value.content.trim()) return;
      
      const newMsg = {
        id: messages.value.length + 1,
        user: {
          ...currentUser.value
        },
        content: newMessage.value.content,
        images: [...newMessage.value.images],
        likes: 0,
        isLiked: false,
        comments: [],
        createdAt: new Date(),
        type: currentTab.value === 'all' ? 'other' : currentTab.value
      };
      
      messages.value.unshift(newMsg);
      
      // 清空表单
      newMessage.value.content = '';
      newMessage.value.images = [];
      previewImages.value = [];
      
      // 重置文件输入
      const fileInput = document.getElementById('image-upload');
      if (fileInput) {
        fileInput.value = '';
      }
    };
    
    // 切换点赞
    const toggleLike = (messageId) => {
      const message = messages.value.find(m => m.id === messageId);
      if (!message) return;
      
      if (message.isLiked) {
        message.likes--;
      } else {
        message.likes++;
      }
      message.isLiked = !message.isLiked;
    };
    
    // 切换评论区
    const toggleComments = (messageId) => {
      const index = expandedComments.value.indexOf(messageId);
      if (index > -1) {
        expandedComments.value.splice(index, 1);
      } else {
        expandedComments.value.push(messageId);
        // 初始化评论输入
        if (!commentInputs.value[messageId]) {
          commentInputs.value[messageId] = '';
        }
      }
    };
    
    // 分享留言
    const shareMessage = (messageId) => {
      console.log('分享留言:', messageId);
      // 这里可以实现分享功能
      alert('分享功能开发中...');
    };
    
    // 发布评论
    const postComment = (messageId) => {
      const message = messages.value.find(m => m.id === messageId);
      if (!message || !commentInputs.value[messageId]?.trim()) return;
      
      const newComment = {
        id: message.comments.length + 1,
        user: {
          ...currentUser.value
        },
        content: commentInputs.value[messageId].trim(),
        likes: 0,
        isLiked: false,
        createdAt: new Date()
      };
      
      message.comments.push(newComment);
      commentInputs.value[messageId] = '';
    };
    
    // 切换评论点赞
    const toggleCommentLike = (messageId, commentId) => {
      const message = messages.value.find(m => m.id === messageId);
      if (!message) return;
      
      const comment = message.comments.find(c => c.id === commentId);
      if (!comment) return;
      
      if (comment.isLiked) {
        comment.likes--;
      } else {
        comment.likes++;
      }
      comment.isLiked = !comment.isLiked;
    };
    
    // 回复评论
    const replyToComment = (messageId, commentId, nickname) => {
      commentInputs.value[messageId] = `@${nickname} `;
      
      // 滚动到评论输入框
      setTimeout(() => {
        const commentInput = document.querySelector(`.comment-input`);
        if (commentInput) {
          commentInput.focus();
        }
      }, 100);
    };
    
    // 加载更多留言
    const loadMoreMessages = () => {
      // 这里可以实现加载更多留言的逻辑
      // 模拟加载
      setTimeout(() => {
        currentPage.value++;
        // 如果没有更多数据了
        if (currentPage.value > 3) {
          hasMoreMessages.value = false;
        }
      }, 1000);
    };
    
    // 打开图片查看器
    const openImageViewer = (image, images = []) => {
      currentViewImage.value = image;
      
      // 如果没有传入图片数组，找到包含当前图片的留言的所有图片
      if (images.length === 0) {
        const message = messages.value.find(m => 
          m.images && m.images.includes(image)
        );
        if (message) {
          currentMessageImages.value = message.images;
        }
      } else {
        currentMessageImages.value = images;
      }
      
      currentImageIndex.value = currentMessageImages.value.indexOf(image);
      showImageViewer.value = true;
      
      // 禁止背景滚动
      document.body.style.overflow = 'hidden';
    };
    
    // 关闭图片查看器
    const closeImageViewer = () => {
      showImageViewer.value = false;
      
      // 恢复背景滚动
      document.body.style.overflow = '';
    };
    
    // 上一张图片
    const prevImage = () => {
      currentImageIndex.value = 
        (currentImageIndex.value - 1 + currentMessageImages.value.length) % 
        currentMessageImages.value.length;
      currentViewImage.value = currentMessageImages.value[currentImageIndex.value];
    };
    
    // 下一张图片
    const nextImage = () => {
      currentImageIndex.value = 
        (currentImageIndex.value + 1) % currentMessageImages.value.length;
      currentViewImage.value = currentMessageImages.value[currentImageIndex.value];
    };
    
    // 筛选后的留言
    const filteredMessages = computed(() => {
      let filtered = messages.value;
      
      // 按标签筛选
      if (currentTab.value !== 'all') {
        filtered = filtered.filter(m => m.type === currentTab.value);
      }
      
      // 按类型筛选
      if (filterType.value === 'text') {
        filtered = filtered.filter(m => m.images.length === 0);
      } else if (filterType.value === 'image') {
        filtered = filtered.filter(m => m.images.length > 0);
      }
      
      // 排序
      if (sortType.value === 'newest') {
        filtered = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (sortType.value === 'hottest') {
        // 假设热度是点赞数+评论数*2
        filtered = [...filtered].sort((a, b) => (b.likes + b.comments.length * 2) - (a.likes + a.comments.length * 2));
      } else if (sortType.value === 'mostLiked') {
        filtered = [...filtered].sort((a, b) => b.likes - a.likes);
      }
      
      // 分页
      return filtered.slice(0, currentPage.value * pageSize.value);
    });
    
    // 组件挂载时初始化
    onMounted(() => {
      // 初始化评论输入对象
      messages.value.forEach(message => {
        commentInputs.value[message.id] = '';
      });
    });
    
    return {
      currentUser,
      tabs,
      currentTab,
      filterType,
      sortType,
      messages,
      newMessage,
      previewImages,
      expandedComments,
      commentInputs,
      hasMoreMessages,
      showImageViewer,
      currentViewImage,
      currentImageIndex,
      currentMessageImages,
      filteredMessages,
      formatDate,
      switchTab,
      handleImageUpload,
      removeImage,
      postMessage,
      toggleLike,
      toggleComments,
      shareMessage,
      postComment,
      toggleCommentLike,
      replyToComment,
      loadMoreMessages,
      openImageViewer,
      closeImageViewer,
      prevImage,
      nextImage
    };
  }
};
</script>

<style scoped>
.message-board-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.message-board-container h2 {
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

/* 标签页 */
.message-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  border: 2px solid var(--border-color);
  background: var(--background-primary);
  color: var(--text-primary);
  border-radius: 24px;
  cursor: pointer;
  font-size: 1rem;
  transition: all var(--transition-speed) ease;
}

.tab-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.tab-btn.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

/* 发布留言区域 */
.post-message-section {
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  font-weight: 600;
  color: var(--text-primary);
}

.vip-badge-container {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.vip-badge-container.vip-standard {
  background: var(--vip-standard-color);
  color: white;
}

.vip-badge-container.vip-premium {
  background: var(--vip-premium-color);
  color: white;
}

.vip-badge-container.small {
  padding: 0.15rem 0.5rem;
  font-size: 0.7rem;
}

.vip-badge-container.mini {
  padding: 0.1rem 0.35rem;
  font-size: 0.65rem;
}

.vip-badge-text {
  white-space: nowrap;
}

.message-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--background-primary);
  color: var(--text-primary);
  font-size: 1rem;
  resize: vertical;
  transition: border-color var(--transition-speed) ease;
}

.message-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.message-actions {
  margin-top: 1rem;
}

.upload-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.upload-btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  border: 2px dashed var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all var(--transition-speed) ease;
  font-size: 0.9rem;
}

.upload-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.upload-hint {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.image-preview {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.preview-item {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 6px;
  overflow: hidden;
  background: var(--background-secondary);
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image {
  position: absolute;
  top: 0;
  right: 0;
  width: 24px;
  height: 24px;
  background: rgba(255, 0, 0, 0.8);
  color: white;
  border: none;
  border-radius: 0 0 0 6px;
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.post-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.char-count {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.post-btn {
  padding: 0.75rem 1.5rem;
}

/* 筛选和排序 */
.filter-sort-section {
  margin-bottom: 2rem;
  padding: 1rem;
  background: var(--background-secondary);
  border-radius: 8px;
}

.filter-options {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-options label {
  font-weight: 600;
  color: var(--text-primary);
}

.filter-select,
.sort-select {
  padding: 0.5rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 6px;
  background: var(--background-primary);
  color: var(--text-primary);
  cursor: pointer;
  font-size: 0.9rem;
}

.filter-select:focus,
.sort-select:focus {
  outline: none;
  border-color: var(--primary-color);
}

/* 留言列表 */
.messages-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 4rem;
  color: var(--text-secondary);
  background: var(--background-secondary);
  border-radius: 8px;
}

.message-item {
  padding: 1.5rem;
  transition: transform var(--transition-speed) ease, box-shadow var(--transition-speed) ease;
}

.message-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.message-header .user-info {
  margin-bottom: 0;
}

.message-time {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.message-content p {
  line-height: 1.6;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.message-images {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.message-image {
  width: calc(33.333% - 0.5rem);
  height: auto;
  border-radius: 6px;
  cursor: pointer;
  transition: transform var(--transition-speed) ease;
}

.message-image:hover {
  transform: scale(1.03);
}

.message-footer {
  display: flex;
  gap: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 20px;
  transition: all var(--transition-speed) ease;
}

.action-btn:hover {
  background: var(--background-secondary);
  color: var(--primary-color);
}

.action-btn.liked {
  color: var(--danger-color);
}

.action-btn.liked:hover {
  background: rgba(255, 60, 87, 0.1);
  color: var(--danger-color);
}

.icon {
  font-size: 1.2rem;
}

.count {
  font-size: 0.9rem;
}

/* 评论区域 */
.comments-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.comment-item {
  display: flex;
  gap: 1rem;
}

.comment-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
  background: var(--background-secondary);
  padding: 1rem;
  border-radius: 8px;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.comment-user {
  font-weight: 600;
  color: var(--text-primary);
}

.comment-time {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.comment-text {
  margin-bottom: 0.75rem;
  line-height: 1.5;
  color: var(--text-primary);
}

.comment-actions {
  display: flex;
  gap: 1.5rem;
}

.comment-action-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.75rem;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.85rem;
  border-radius: 12px;
  transition: all var(--transition-speed) ease;
}

.comment-action-btn:hover {
  background: var(--background-primary);
  color: var(--primary-color);
}

.comment-action-btn.liked {
  color: var(--danger-color);
}

.comment-action-btn.liked:hover {
  background: rgba(255, 60, 87, 0.1);
  color: var(--danger-color);
}

.post-comment-section {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.comment-input-wrapper {
  flex: 1;
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.comment-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 20px;
  background: var(--background-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: border-color var(--transition-speed) ease;
}

.comment-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.comment-btn {
  padding: 0.75rem 1.25rem;
  border-radius: 20px;
  font-size: 0.9rem;
  white-space: nowrap;
}

/* 加载更多 */
.load-more {
  text-align: center;
  margin-top: 2rem;
}

/* 图片查看器 */
.image-viewer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.image-viewer {
  position: relative;
  max-width: 90%;
  max-height: 90%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.close-btn {
  position: absolute;
  top: -40px;
  right: 0;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color var(--transition-speed) ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.image-viewer img {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 8px;
}

.viewer-controls {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-top: 1.5rem;
}

.nav-btn {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color var(--transition-speed) ease;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.image-counter {
  color: white;
  font-size: 1rem;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .message-board-container {
    padding: 1rem;
  }
  
  .message-tabs {
    justify-content: center;
  }
  
  .post-actions {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .filter-options {
    flex-direction: column;
    align-items: stretch;
  }
  
  .message-footer {
    gap: 1rem;
  }
  
  .message-image {
    width: calc(50% - 0.35rem);
  }
  
  .comment-input-wrapper {
    flex-direction: column;
  }
  
  .comment-btn {
    align-self: flex-end;
  }
}

@media (max-width: 480px) {
  .message-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .message-footer {
    justify-content: space-between;
  }
  
  .action-btn {
    padding: 0.35rem 0.75rem;
    font-size: 0.85rem;
  }
  
  .icon {
    font-size: 1rem;
  }
  
  .message-image {
    width: 100%;
  }
  
  .image-viewer-overlay {
    padding: 1rem;
  }
  
  .close-btn {
    top: -30px;
    width: 30px;
    height: 30px;
    font-size: 1.2rem;
  }
  
  .viewer-controls {
    gap: 1rem;
  }
  
  .nav-btn {
    width: 35px;
    height: 35px;
    font-size: 1rem;
  }
}
</style>