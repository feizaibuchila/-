<template>
  <div class="albums-container">
    <!-- 导航栏 -->
    <Navbar />
    
    <!-- 页面内容 -->
    <main class="albums-main-content">
      <section class="albums-header">
        <h1>薛之谦音乐作品</h1>
        <p>聆听薛之谦的经典歌曲，感受音乐魅力</p>
      </section>
      
      <section class="albums-list">
        <div class="album-card" v-for="album in albums" :key="album.id">
          <div class="album-cover">
            <img :src="album.cover" :alt="album.title">
            <div class="play-overlay">
              <button class="play-btn">🎵</button>
            </div>
          </div>
          <div class="album-info">
            <h3 class="album-title">{{ album.title }}</h3>
            <p class="album-year">{{ album.year }}</p>
            <p class="album-tracks">{{ album.tracks.length }} 首歌曲</p>
          </div>
        </div>
      </section>
      
      <section class="popular-songs">
        <h2>热门歌曲</h2>
        <div class="songs-list">
          <div class="song-item" v-for="song in popularSongs" :key="song.id">
            <div class="song-rank">{{ song.rank }}</div>
            <div class="song-info">
              <h4 class="song-title">{{ song.title }}</h4>
              <p class="song-album">{{ song.album }}</p>
            </div>
            <div class="song-actions">
              <button class="play-song-btn">▶</button>
              <button class="like-song-btn">❤️</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import Navbar from '../components/Navbar.vue';

export default {
  name: 'AlbumsView',
  components: {
    Navbar
  },
  setup() {
    const albums = ref([]);
    const popularSongs = ref([]);
    
    // 模拟音乐专辑数据
    const mockAlbums = [
      {
        id: 1,
        title: '尘',
        year: '2019',
        cover: 'https://picsum.photos/id/1/300/300',
        tracks: [
          { id: 1, title: '木偶人' },
          { id: 2, title: '笑场' },
          { id: 3, title: '病态' },
          { id: 4, title: '尘' }
        ]
      },
      {
        id: 2,
        title: '违背的青春',
        year: '2018',
        cover: 'https://picsum.photos/id/2/300/300',
        tracks: [
          { id: 5, title: '违背的青春' },
          { id: 6, title: '那是你离开了北京的生活' },
          { id: 7, title: '像风一样' }
        ]
      },
      {
        id: 3,
        title: '渡 The Crossing',
        year: '2017',
        cover: 'https://picsum.photos/id/3/300/300',
        tracks: [
          { id: 8, title: '暧昧' },
          { id: 9, title: '高尚' },
          { id: 10, title: '动物世界' },
          { id: 11, title: '骆驼' }
        ]
      }
    ];
    
    // 模拟热门歌曲数据
    const mockPopularSongs = [
      { id: 1, title: '演员', album: '绅士', rank: 1 },
      { id: 2, title: '认真的雪', album: '薛之谦', rank: 2 },
      { id: 3, title: '刚刚好', album: '初学者', rank: 3 },
      { id: 4, title: '绅士', album: '绅士', rank: 4 },
      { id: 5, title: '丑八怪', album: '意外', rank: 5 }
    ];
    
    onMounted(() => {
      // 模拟数据加载
      albums.value = mockAlbums;
      popularSongs.value = mockPopularSongs;
    });
    
    return {
      albums,
      popularSongs
    };
  }
};
</script>

<style scoped>
.albums-container {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.albums-main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.albums-header {
  text-align: center;
  margin-bottom: 60px;
}

.albums-header h1 {
  font-size: 36px;
  color: #333;
  margin-bottom: 16px;
}

.albums-header p {
  font-size: 18px;
  color: #666;
}

.albums-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
  margin-bottom: 60px;
}

.album-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.album-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.album-cover {
  position: relative;
  padding-top: 100%;
}

.album-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.album-card:hover .play-overlay {
  opacity: 1;
}

.play-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: white;
  border: none;
  font-size: 24px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.play-btn:hover {
  transform: scale(1.1);
}

.album-info {
  padding: 20px;
}

.album-title {
  font-size: 20px;
  margin: 0 0 8px 0;
  color: #333;
}

.album-year, .album-tracks {
  font-size: 14px;
  color: #666;
  margin: 4px 0;
}

.popular-songs h2 {
  font-size: 28px;
  margin-bottom: 24px;
  color: #333;
}

.songs-list {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.song-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.song-item:last-child {
  border-bottom: none;
}

.song-rank {
  width: 40px;
  font-size: 20px;
  font-weight: bold;
  color: #ff6b6b;
  text-align: center;
}

.song-info {
  flex: 1;
  padding: 0 20px;
}

.song-title {
  font-size: 16px;
  margin: 0 0 4px 0;
  color: #333;
}

.song-album {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.song-actions {
  display: flex;
  gap: 10px;
}

.play-song-btn, .like-song-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.play-song-btn:hover, .like-song-btn:hover {
  background-color: #f0f0f0;
}
</style>