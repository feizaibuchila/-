<template>
  <div class="topics-wall-view">
    <div class="container">
      <h1>话题互动墙</h1>
      
      <!-- 话题搜索和热门标签 -->
      <div class="topics-header">
        <div class="search-bar">
          <input 
            type="text" 
            v-model="searchKeyword" 
            placeholder="搜索话题或内容..."
            class="search-input"
          />
          <button class="btn search-btn">
            搜索
          </button>
        </div>
        <div class="hot-tags">
          <span class="tags-label">热门话题：</span>
          <button 
            v-for="tag in hotTags" 
            :key="tag" 
            class="tag-btn"
            @click="selectTag(tag)"
          >
            {{ tag }}
          </button>
        </div>
      </div>

      <!-- 发布动态区域 -->
      <div class="post-section">
        <div class="post-container">
          <div class="user-avatar">
            <img :src="userAvatar" alt="用户头像" />
          </div>
          <div class="post-content">
            <textarea 
              v-model="newPost.content" 
              placeholder="发布你的应援动态..." 
              rows="3"
              class="post-textarea"
            ></textarea>
            <div class="post-footer">
              <div class="post-tools">
                <button class="tool-btn" @click="triggerImageUpload">
                  <span class="icon">🖼️</span>
                  <span>添加图片</span>
                </button>
                <input 
                  ref="imageInput" 
                  type="file" 
                  accept="image/*" 
                  style="display: none" 
                  @change="handleImageUpload"
                />
                <button class="tool-btn" @click="showTopicModal = true">
                  <span class="icon">#</span>
                  <span>添加话题</span>
                </button>
                <button class="tool-btn" @click="showCopyModal = true">
                  <span class="icon">📝</span>
                  <span>文案库</span>
                </button>
              </div>
              <button 
                class="btn post-btn" 
                @click="submitPost"
                :disabled="!newPost.content.trim()"
              >
                发布
              </button>
            </div>
          </div>
        </div>
        <!-- 图片预览 -->
        <div v-if="newPost.images.length > 0" class="image-preview">
          <div 
            v-for="(image, index) in newPost.images" 
            :key="index" 
            class="preview-item"
          >
            <img :src="image" alt="预览图片" />
            <button class="remove-btn" @click="removeImage(index)">×</button>
          </div>
        </div>
      </div>

      <!-- 动态列表 -->
      <div class="posts-container">
        <div 
          v-for="post in filteredPosts" 
          :key="post.id" 
          class="post-card"
        >
          <div class="post-header">
            <div class="post-user">
              <img :src="post.avatar" alt="用户头像" class="avatar" />
              <div class="user-info">
                <div class="username">{{ post.username }}</div>
                <div class="post-time">{{ formatTime(post.createdAt) }}</div>
              </div>
            </div>
          </div>
          <div class="post-body">
            <p class="post-text" v-html="formatPostContent(post.content)"></p>
            <div v-if="post.images && post.images.length > 0" class="post-images">
              <img 
                v-for="(image, index) in post.images" 
                :key="index" 
                :src="image" 
                alt="发布图片" 
                class="post-image"
              />
            </div>
            <div v-if="post.topics && post.topics.length > 0" class="post-topics">
              <span 
                v-for="(topic, index) in post.topics" 
                :key="index" 
                class="topic-tag"
                @click="selectTag(topic)"
              >
                #{{ topic }}
              </span>
            </div>
          </div>
          <div class="post-actions">
            <button 
              class="action-btn" 
              :class="{ active: post.isLiked }"
              @click="toggleLike(post)"
            >
              <span class="icon">{{ post.isLiked ? '❤️' : '🤍' }}</span>
              <span>{{ post.likes }}</span>
            </button>
            <button class="action-btn" @click="toggleComment(post)">
              <span class="icon">💬</span>
              <span>{{ post.comments.length }}</span>
            </button>
            <button class="action-btn" @click="sharePost(post)">
              <span class="icon">🔄</span>
              <span>分享</span>
            </button>
          </div>
          <!-- 评论区 -->
          <div v-if="post.showComments" class="comments-section">
            <div v-if="post.comments && post.comments.length > 0" class="comments-list">
              <div 
                v-for="comment in post.comments" 
                :key="comment.id" 
                class="comment-item"
              >
                <img :src="comment.avatar" alt="评论用户头像" class="comment-avatar" />
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="comment-username">{{ comment.username }}</span>
                    <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
                  </div>
                  <p class="comment-text">{{ comment.content }}</p>
                </div>
              </div>
            </div>
            <div class="comment-input-area">
              <input 
                v-model="commentInputs[post.id]" 
                type="text" 
                placeholder="写下你的评论..."
                class="comment-input"
                @keyup.enter="submitComment(post)"
              />
              <button 
                class="btn comment-btn" 
                @click="submitComment(post)"
                :disabled="!commentInputs[post.id]?.trim()"
              >
                发送
              </button>
            </div>
          </div>
        </div>
        <div v-if="filteredPosts.length === 0" class="empty-state">
          暂无相关动态
        </div>
      </div>
    </div>

    <!-- 添加话题弹窗 -->
    <div v-if="showTopicModal" class="modal-overlay" @click.self="showTopicModal = false">
      <div class="modal-content">
        <h3>添加话题</h3>
        <div class="recent-topics">
          <h4>最近使用的话题</h4>
          <div class="topics-grid">
            <button 
              v-for="topic in recentTopics" 
              :key="topic" 
              class="topic-grid-item"
              @click="addTopic(topic)"
            >
              #{{ topic }}
            </button>
          </div>
        </div>
        <div class="popular-topics">
          <h4>热门话题</h4>
          <div class="topics-grid">
            <button 
              v-for="topic in popularTopics" 
              :key="topic.name" 
              class="topic-grid-item"
              @click="addTopic(topic.name)"
            >
              #{{ topic.name }}
              <span class="topic-count">({{ topic.count }})</span>
            </button>
          </div>
        </div>
        <div class="custom-topic">
          <input 
            v-model="customTopic" 
            type="text" 
            placeholder="自定义话题..."
            class="custom-topic-input"
          />
          <button 
            class="btn btn-primary" 
            @click="addCustomTopic"
            :disabled="!customTopic.trim()"
          >
            添加
          </button>
        </div>
        <button class="btn btn-secondary" @click="showTopicModal = false">关闭</button>
      </div>
    </div>

    <!-- 文案库弹窗 -->
    <div v-if="showCopyModal" class="modal-overlay" @click.self="showCopyModal = false">
      <div class="modal-content copy-modal">
        <h3>热门应援文案库</h3>
        <div class="copy-categories">
          <button 
            v-for="category in copyCategories" 
            :key="category" 
            :class="['category-tab', { active: activeCopyCategory === category }]"
            @click="activeCopyCategory = category"
          >
            {{ category }}
          </button>
        </div>
        <div class="copies-list">
          <div 
            v-for="copy in filteredCopies" 
            :key="copy.id" 
            class="copy-item"
          >
            <p class="copy-text">{{ copy.text }}</p>
            <button class="btn copy-btn" @click="copyToClipboard(copy.text)">
              复制
            </button>
          </div>
        </div>
        <button class="btn btn-secondary" @click="showCopyModal = false">关闭</button>
      </div>
    </div>

    <!-- 复制成功提示 -->
    <div v-if="showCopySuccess" class="copy-toast">
      复制成功！
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, reactive } from 'vue';
import { useUserStore } from '../store/index.js';

export default {
  name: 'TopicsWallView',
  setup() {
    const userStore = useUserStore();
    const searchKeyword = ref('');
    const selectedTag = ref('');
    const showTopicModal = ref(false);
    const showCopyModal = ref(false);
    const customTopic = ref('');
    const activeCopyCategory = ref('all');
    const showCopySuccess = ref(false);
    const imageInput = ref(null);
    const posts = ref([]);
    const commentInputs = reactive({});
    
    // 用户信息
    const userAvatar = computed(() => userStore.userInfo?.avatar || 'https://picsum.photos/40/40?random=1');
    const username = computed(() => userStore.userInfo?.name || '谦友');
    
    // 热门标签
    const hotTags = ref([
      '薛之谦新歌', '薛之谦演唱会', '薛之谦应援', '谦友大家庭', 
      '薛之谦让世界和平', '薛之谦生日', '薛之谦专辑', '谦谦君子'
    ]);
    
    // 最近使用的话题
    const recentTopics = ref(['薛之谦新歌', '薛之谦演唱会']);
    
    // 热门话题
    const popularTopics = ref([
      { name: '薛之谦新歌', count: 2345 },
      { name: '薛之谦演唱会', count: 1892 },
      { name: '薛之谦应援', count: 1567 },
      { name: '谦友大家庭', count: 1234 },
      { name: '薛之谦让世界和平', count: 987 },
      { name: '薛之谦生日', count: 765 },
      { name: '薛之谦专辑', count: 654 },
      { name: '谦谦君子', count: 543 }
    ]);
    
    // 文案分类
    const copyCategories = ['all', '歌词', '应援', '日常', '生日'];
    
    // 文案库
    const copyLibrary = ref([
      // 歌词类
      { id: 1, text: '用力爱过的人，不该计较', category: '歌词' },
      { id: 2, text: '我想摸你的头发，只是简单的试探啊', category: '歌词' },
      { id: 3, text: '你还要我怎样，要怎样', category: '歌词' },
      { id: 4, text: '其实说分不开的也不见得，其实感情最怕的就是拖着', category: '歌词' },
      
      // 应援类
      { id: 5, text: '世界和平 薛之谦值得 谦友一直在', category: '应援' },
      { id: 6, text: '薛之谦，我们陪你走完这漫漫人生路', category: '应援' },
      { id: 7, text: '你在舞台发光，我在人海点灯', category: '应援' },
      { id: 8, text: '薛之谦，谦友永远是你坚强的后盾', category: '应援' },
      
      // 日常类
      { id: 9, text: '今天也是为薛之谦打call的一天', category: '日常' },
      { id: 10, text: '沉迷薛之谦无法自拔', category: '日常' },
      { id: 11, text: '又是想念薛之谦的一天', category: '日常' },
      
      // 生日类
      { id: 12, text: '薛之谦生日快乐，愿你被世界温柔以待', category: '生日' },
      { id: 13, text: '陪你过的第X个生日，未来还要一起走', category: '生日' }
    ]);
    
    // 新发布的动态
    const newPost = reactive({
      content: '',
      images: [],
      topics: []
    });
    
    // 计算属性
    const filteredPosts = computed(() => {
      let result = posts.value;
      
      // 搜索关键词过滤
      if (searchKeyword.value.trim()) {
        const keyword = searchKeyword.value.toLowerCase();
        result = result.filter(post => 
          post.content.toLowerCase().includes(keyword) ||
          (post.topics && post.topics.some(topic => topic.toLowerCase().includes(keyword)))
        );
      }
      
      // 话题标签过滤
      if (selectedTag.value) {
        result = result.filter(post => 
          post.topics && post.topics.includes(selectedTag.value)
        );
      }
      
      return result;
    });
    
    const filteredCopies = computed(() => {
      if (activeCopyCategory.value === 'all') {
        return copyLibrary.value;
      }
      return copyLibrary.value.filter(copy => copy.category === activeCopyCategory.value);
    });
    
    // 初始化模拟数据
    const initPosts = () => {
      posts.value = [
        {
          id: 1,
          username: '谦友一号',
          avatar: 'https://picsum.photos/40/40?random=10',
          content: '刚刚抢到了薛之谦演唱会的门票！太开心了！',
          images: ['https://picsum.photos/600/400?random=100'],
          topics: ['薛之谦演唱会', '谦友大家庭'],
          createdAt: Date.now() - 1000 * 60 * 30, // 30分钟前
          likes: 42,
          isLiked: false,
          showComments: false,
          comments: [
            {
              id: 101,
              username: '谦友二号',
              avatar: 'https://picsum.photos/40/40?random=11',
              content: '恭喜！太羡慕了！',
              createdAt: Date.now() - 1000 * 60 * 20
            },
            {
              id: 102,
              username: '谦友三号',
              avatar: 'https://picsum.photos/40/40?random=12',
              content: '我也抢到了，到时候一起应援！',
              createdAt: Date.now() - 1000 * 60 * 10
            }
          ]
        },
        {
          id: 2,
          username: '谦友四号',
          avatar: 'https://picsum.photos/40/40?random=13',
          content: '新歌真的好好听！循环播放一整天了～',
          images: [],
          topics: ['薛之谦新歌'],
          createdAt: Date.now() - 1000 * 60 * 60 * 2, // 2小时前
          likes: 78,
          isLiked: true,
          showComments: false,
          comments: [
            {
              id: 103,
              username: '谦友五号',
              avatar: 'https://picsum.photos/40/40?random=14',
              content: '同意！歌词写得太好了',
              createdAt: Date.now() - 1000 * 60 * 60 * 1
            }
          ]
        },
        {
          id: 3,
          username: '谦友六号',
          avatar: 'https://picsum.photos/40/40?random=15',
          content: '世界和平 薛之谦值得 谦友一直在',
          images: ['https://picsum.photos/600/400?random=101', 'https://picsum.photos/600/400?random=102'],
          topics: ['薛之谦应援', '薛之谦让世界和平'],
          createdAt: Date.now() - 1000 * 60 * 60 * 5, // 5小时前
          likes: 128,
          isLiked: false,
          showComments: false,
          comments: []
        }
      ];
    };
    
    // 方法
    const selectTag = (tag) => {
      selectedTag.value = tag;
      searchKeyword.value = '';
    };
    
    const triggerImageUpload = () => {
      imageInput.value?.click();
    };
    
    const handleImageUpload = (event) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          if (newPost.images.length >= 9) { // 最多9张图片
            alert('最多只能上传9张图片');
            break;
          }
          const reader = new FileReader();
          reader.onload = (e) => {
            newPost.images.push(e.target.result);
          };
          reader.readAsDataURL(files[i]);
        }
        // 清空input以允许再次选择同一文件
        event.target.value = '';
      }
    };
    
    const removeImage = (index) => {
      newPost.images.splice(index, 1);
    };
    
    const addTopic = (topic) => {
      if (!newPost.topics.includes(topic)) {
        newPost.topics.push(topic);
        // 添加到最近使用的话题
        if (!recentTopics.value.includes(topic)) {
          recentTopics.value.unshift(topic);
          if (recentTopics.value.length > 10) {
            recentTopics.value.pop();
          }
        }
      }
      showTopicModal.value = false;
    };
    
    const addCustomTopic = () => {
      if (customTopic.value.trim()) {
        addTopic(customTopic.value.trim());
        customTopic.value = '';
      }
    };
    
    const copyToClipboard = (text) => {
      navigator.clipboard.writeText(text).then(() => {
        showCopySuccess.value = true;
        setTimeout(() => {
          showCopySuccess.value = false;
        }, 2000);
      });
    };
    
    const submitPost = () => {
      if (!newPost.content.trim()) return;
      
      const post = {
        id: Date.now(),
        username: username.value,
        avatar: userAvatar.value,
        content: newPost.content,
        images: [...newPost.images],
        topics: [...newPost.topics],
        createdAt: Date.now(),
        likes: 0,
        isLiked: false,
        showComments: false,
        comments: []
      };
      
      posts.value.unshift(post);
      
      // 重置表单
      newPost.content = '';
      newPost.images = [];
      newPost.topics = [];
      
      // 给用户添加经验值和谦币
      userStore.addExperience(5);
      userStore.addQianbi(10);
    };
    
    const toggleLike = (post) => {
      post.isLiked = !post.isLiked;
      post.likes += post.isLiked ? 1 : -1;
      
      // 点赞获得谦币
      if (post.isLiked) {
        userStore.addQianbi(1);
      }
    };
    
    const toggleComment = (post) => {
      post.showComments = !post.showComments;
      if (post.showComments && !commentInputs[post.id]) {
        commentInputs[post.id] = '';
      }
    };
    
    const submitComment = (post) => {
      const content = commentInputs[post.id];
      if (!content?.trim()) return;
      
      const comment = {
        id: Date.now(),
        username: username.value,
        avatar: userAvatar.value,
        content: content.trim(),
        createdAt: Date.now()
      };
      
      post.comments.push(comment);
      commentInputs[post.id] = '';
      
      // 评论获得经验值和谦币
      userStore.addExperience(3);
      userStore.addQianbi(5);
    };
    
    const sharePost = (post) => {
      // 模拟分享功能
      alert('分享成功！获得5谦币奖励');
      userStore.addQianbi(5);
    };
    
    const formatTime = (timestamp) => {
      const now = Date.now();
      const diff = now - timestamp;
      
      if (diff < 60 * 1000) {
        return '刚刚';
      } else if (diff < 60 * 60 * 1000) {
        return `${Math.floor(diff / (60 * 1000))}分钟前`;
      } else if (diff < 24 * 60 * 60 * 1000) {
        return `${Math.floor(diff / (60 * 60 * 1000))}小时前`;
      } else {
        return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`;
      }
    };
    
    const formatPostContent = (content) => {
      // 将 #话题# 格式化为可点击的标签
      let formattedContent = content;
      formattedContent = formattedContent.replace(/#([^#]+)#/g, '<span class="hashtag">#$1</span>');
      return formattedContent;
    };
    
    // 初始化
    onMounted(() => {
      initPosts();
    });
    
    return {
      searchKeyword,
      selectedTag,
      showTopicModal,
      showCopyModal,
      customTopic,
      activeCopyCategory,
      showCopySuccess,
      imageInput,
      newPost,
      posts,
      commentInputs,
      userAvatar,
      hotTags,
      recentTopics,
      popularTopics,
      copyCategories,
      filteredPosts,
      filteredCopies,
      selectTag,
      triggerImageUpload,
      handleImageUpload,
      removeImage,
      addTopic,
      addCustomTopic,
      copyToClipboard,
      submitPost,
      toggleLike,
      toggleComment,
      submitComment,
      sharePost,
      formatTime,
      formatPostContent
    };
  }
};
</script>

<style scoped>
.topics-wall-view {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 2rem 0;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1rem;
}

.topics-wall-view h1 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.5rem;
  color: #333;
}

/* 话题搜索和热门标签 */
.topics-header {
  margin-bottom: 2rem;
}

.search-bar {
  display: flex;
  margin-bottom: 1.5rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #d9d9d9;
  border-radius: 4px 0 0 4px;
  font-size: 1rem;
}

.search-btn {
  padding: 0.75rem 1.5rem;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
}

.hot-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.tags-label {
  font-weight: 500;
}

.tag-btn {
  padding: 0.4rem 0.8rem;
  background-color: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.tag-btn:hover {
  background-color: #1890ff;
  color: white;
  border-color: #1890ff;
}

/* 发布动态区域 */
.post-section {
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.post-container {
  display: flex;
  gap: 1rem;
}

.user-avatar img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.post-content {
  flex: 1;
}

.post-textarea {
  width: 100%;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 0.75rem;
  resize: vertical;
  font-size: 1rem;
  margin-bottom: 1rem;
  font-family: inherit;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-tools {
  display: flex;
  gap: 1.5rem;
}

.tool-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  transition: color 0.3s;
}

.tool-btn:hover {
  color: #1890ff;
}

.tool-btn .icon {
  font-size: 1.2rem;
}

.post-btn {
  background-color: #1890ff;
  color: white;
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.post-btn:hover:not(:disabled) {
  background-color: #40a9ff;
}

.post-btn:disabled {
  background-color: #d9d9d9;
  cursor: not-allowed;
}

.image-preview {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.preview-item {
  position: relative;
  width: 100px;
  height: 100px;
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.remove-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 24px;
  height: 24px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 动态列表 */
.posts-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.post-card {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.post-header {
  margin-bottom: 1rem;
}

.post-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.username {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.post-time {
  font-size: 0.85rem;
  color: #999;
}

.post-body {
  margin-bottom: 1rem;
}

.post-text {
  margin-bottom: 1rem;
  line-height: 1.6;
  white-space: pre-wrap;
}

.post-text :deep(.hashtag) {
  color: #1890ff;
  cursor: pointer;
}

.post-images {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.post-image {
  width: calc(50% - 0.25rem);
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 4px;
}

.post-topics {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.topic-tag {
  padding: 0.25rem 0.75rem;
  background-color: #f0f0f0;
  border-radius: 16px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
}

.topic-tag:hover {
  background-color: #e6f7ff;
  color: #1890ff;
}

.post-actions {
  display: flex;
  gap: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  transition: color 0.3s;
}

.action-btn:hover,
.action-btn.active {
  color: #ff4d4f;
}

.action-btn .icon {
  font-size: 1.2rem;
}

/* 评论区 */
.comments-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.comment-item {
  display: flex;
  gap: 0.75rem;
}

.comment-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.25rem;
}

.comment-username {
  font-weight: 500;
  font-size: 0.9rem;
}

.comment-time {
  font-size: 0.8rem;
  color: #999;
}

.comment-text {
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
}

.comment-input-area {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.comment-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 0.9rem;
}

.comment-btn {
  padding: 0.5rem 1rem;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.comment-btn:hover:not(:disabled) {
  background-color: #40a9ff;
}

.comment-btn:disabled {
  background-color: #d9d9d9;
  cursor: not-allowed;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #999;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content h3 {
  margin-bottom: 1.5rem;
  text-align: center;
}

.recent-topics,
.popular-topics {
  margin-bottom: 1.5rem;
}

.recent-topics h4,
.popular-topics h4 {
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.topics-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.topic-grid-item {
  padding: 0.5rem 1rem;
  background-color: #f0f0f0;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

.topic-grid-item:hover {
  background-color: #e6f7ff;
  color: #1890ff;
}

.topic-count {
  font-size: 0.8rem;
  color: #999;
  margin-left: 0.25rem;
}

.custom-topic {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.custom-topic-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

/* 文案库弹窗 */
.copy-modal .btn-secondary {
  width: 100%;
}

.copy-categories {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.category-tab {
  padding: 0.5rem 1rem;
  background-color: #f0f0f0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.category-tab.active {
  background-color: #1890ff;
  color: white;
}

.copies-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
  max-height: 300px;
  overflow-y: auto;
}

.copy-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
}

.copy-text {
  flex: 1;
  margin: 0;
  line-height: 1.6;
}

.copy-btn {
  padding: 0.4rem 0.8rem;
  background-color: #52c41a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* 复制成功提示 */
.copy-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 1rem 2rem;
  border-radius: 4px;
  z-index: 1001;
}

/* 按钮通用样式 */
.btn {
  padding: 0.5rem 1rem;
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

.btn-primary:hover:not(:disabled) {
  background-color: #40a9ff;
}

.btn-primary:disabled {
  background-color: #d9d9d9;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .post-images {
    flex-direction: column;
  }
  
  .post-image {
    width: 100%;
  }
  
  .post-actions {
    gap: 1rem;
  }
  
  .hot-tags {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .search-bar {
    flex-direction: column;
  }
  
  .search-input {
    border-radius: 4px;
    margin-bottom: 0.75rem;
  }
  
  .search-btn {
    border-radius: 4px;
  }
  
  .post-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .post-tools {
    width: 100%;
    justify-content: space-around;
  }
  
  .custom-topic {
    flex-direction: column;
  }
}
</style>