<template>
  <div class="mall-view">
    <div class="container">
      <h1>积分商城</h1>
      
      <!-- 用户积分信息 -->
      <div class="user-balance">
        <div class="balance-card">
          <div class="balance-icon">💰</div>
          <div class="balance-info">
            <div class="balance-label">我的谦币</div>
            <div class="balance-value">{{ qianbi }}</div>
          </div>
          <button class="btn btn-primary" @click="goToTasks">
            去赚币
          </button>
        </div>
      </div>

      <!-- 商品分类 -->
      <div class="category-tabs">
        <button 
          v-for="category in categories" 
          :key="category.key"
          :class="['category-btn', { active: activeCategory === category.key }]"
          @click="activeCategory = category.key"
        >
          {{ category.title }}
        </button>
      </div>

      <!-- 商品列表 -->
      <div class="products-container">
        <div v-for="product in filteredProducts" :key="product.id" class="product-card">
          <div class="product-image">
            <img :src="product.image" alt="商品图片" />
            <div v-if="product.stock === 0" class="sold-out-overlay">
              已售罄
            </div>
          </div>
          <div class="product-info">
            <h3 class="product-title">{{ product.title }}</h3>
            <p class="product-description">{{ product.description }}</p>
            <div class="product-footer">
              <div class="product-price">
                <span class="price-icon">💰</span>
                <span class="price-value">{{ product.price }}</span>
              </div>
              <div class="product-stock" v-if="product.stock > 0">
                剩余 {{ product.stock }} 件
              </div>
              <button 
                v-if="product.stock > 0 && qianbi >= product.price" 
                class="btn buy-btn" 
                @click="buyProduct(product)"
              >
                立即兑换
              </button>
              <button 
                v-else-if="qianbi < product.price" 
                class="btn disabled-btn" 
                disabled
              >
                谦币不足
              </button>
              <button 
                v-else 
                class="btn disabled-btn" 
                disabled
              >
                已售罄
              </button>
            </div>
          </div>
        </div>
        <div v-if="filteredProducts.length === 0" class="empty-state">
          当前分类暂无商品
        </div>
      </div>

      <!-- 我的订单 -->
      <div class="my-orders">
        <h2>我的兑换记录</h2>
        <div v-if="orders.length > 0" class="orders-list">
          <div v-for="order in orders" :key="order.id" class="order-card">
            <div class="order-image">
              <img :src="order.productImage" alt="商品图片" />
            </div>
            <div class="order-info">
              <h4>{{ order.productName }}</h4>
              <div class="order-details">
                <span class="order-date">{{ formatDate(order.createdAt) }}</span>
                <span class="order-status" :class="order.status">{{ order.statusText }}</span>
              </div>
            </div>
            <div class="order-price">
              <span class="price-icon">💰</span>
              <span class="price-value">{{ order.price }}</span>
            </div>
          </div>
        </div>
        <div v-else class="empty-orders">
          暂无兑换记录
        </div>
      </div>
    </div>

    <!-- 兑换确认弹窗 -->
    <div v-if="showBuyModal" class="modal-overlay" @click.self="showBuyModal = false">
      <div class="modal-content">
        <h3>确认兑换</h3>
        <div v-if="selectedProduct" class="product-preview">
          <img :src="selectedProduct.image" alt="商品图片" />
          <div class="product-preview-info">
            <h4>{{ selectedProduct.title }}</h4>
            <p>{{ selectedProduct.description }}</p>
            <div class="product-price">
              <span class="price-icon">💰</span>
              <span class="price-value">{{ selectedProduct.price }}</span>
            </div>
          </div>
        </div>
        <div class="modal-message">
          确认使用 {{ selectedProduct?.price }} 谦币兑换此商品吗？
        </div>
        <div class="modal-actions">
          <button class="btn btn-primary" @click="confirmBuy">确认兑换</button>
          <button class="btn btn-secondary" @click="showBuyModal = false">取消</button>
        </div>
      </div>
    </div>

    <!-- 兑换成功弹窗 -->
    <div v-if="showSuccessModal" class="modal-overlay" @click.self="showSuccessModal = false">
      <div class="modal-content success-modal">
        <div class="success-icon">🎉</div>
        <h3>兑换成功！</h3>
        <p>您的商品已成功兑换，请耐心等待处理</p>
        <button class="btn btn-primary" @click="showSuccessModal = false">确定</button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted } from 'vue';
import { useUserStore } from '../store/index.js';
import { useRouter } from 'vue-router';

export default {
  name: 'MallView',
  setup() {
    const userStore = useUserStore();
    const router = useRouter();
    const activeCategory = ref('lottery');
    const showBuyModal = ref(false);
    const showSuccessModal = ref(false);
    const selectedProduct = ref(null);
    const products = ref([]);
    const orders = ref([]);

    const categories = [
      { key: 'lottery', title: '抽奖资格' },
      { key: 'digital', title: '电子礼包' },
      { key: 'physical', title: '周边商品' }
    ];

    // 计算属性
    const qianbi = computed(() => userStore.getQianbi);
    const filteredProducts = computed(() => {
      return products.value.filter(product => product.category === activeCategory.value);
    });

    // 初始化商品数据
    const initProducts = () => {
      products.value = [
        // 抽奖资格类
        {
          id: 1,
          title: '演唱会门票抽奖资格',
          description: '有机会获得薛之谦演唱会门票一张',
          price: 200,
          stock: 10,
          image: 'https://picsum.photos/400/300?random=101',
          category: 'lottery'
        },
        {
          id: 2,
          title: '签名专辑抽奖资格',
          description: '有机会获得薛之谦签名实体专辑',
          price: 150,
          stock: 5,
          image: 'https://picsum.photos/400/300?random=102',
          category: 'lottery'
        },
        // 电子礼包类
        {
          id: 3,
          title: '专属电子海报套装',
          description: '薛之谦高清电子海报10张，可用于手机壁纸',
          price: 50,
          stock: 999,
          image: 'https://picsum.photos/400/300?random=103',
          category: 'digital'
        },
        {
          id: 4,
          title: '歌词壁纸合集',
          description: '精选薛之谦经典歌词壁纸，多种风格',
          price: 30,
          stock: 999,
          image: 'https://picsum.photos/400/300?random=104',
          category: 'digital'
        },
        {
          id: 5,
          title: '数字应援礼包',
          description: '包含电子手环、虚拟徽章等数字应援道具',
          price: 80,
          stock: 500,
          image: 'https://picsum.photos/400/300?random=105',
          category: 'digital'
        },
        // 周边商品类
        {
          id: 6,
          title: '应援T恤',
          description: '薛之谦官方应援T恤，舒适面料',
          price: 300,
          stock: 20,
          image: 'https://picsum.photos/400/300?random=106',
          category: 'physical'
        },
        {
          id: 7,
          title: '应援手环',
          description: '发光应援手环，演唱会必备',
          price: 100,
          stock: 50,
          image: 'https://picsum.photos/400/300?random=107',
          category: 'physical'
        }
      ];
    };

    // 初始化订单数据
    const initOrders = () => {
      orders.value = [
        {
          id: 1,
          productName: '专属电子海报套装',
          productImage: 'https://picsum.photos/400/300?random=103',
          price: 50,
          createdAt: new Date(Date.now() - 86400000), // 1天前
          status: 'completed',
          statusText: '已完成'
        },
        {
          id: 2,
          productName: '演唱会门票抽奖资格',
          productImage: 'https://picsum.photos/400/300?random=101',
          price: 200,
          createdAt: new Date(Date.now() - 172800000), // 2天前
          status: 'processing',
          statusText: '处理中'
        }
      ];
    };

    // 方法
    const goToTasks = () => {
      router.push('/tasks');
    };

    const buyProduct = (product) => {
      if (userStore.getQianbi >= product.price) {
        selectedProduct.value = product;
        showBuyModal.value = true;
      } else {
        alert('谦币不足，请去完成任务获取更多谦币！');
      }
    };

    const confirmBuy = () => {
      if (selectedProduct.value) {
        // 扣除谦币
        const success = userStore.useQianbi(selectedProduct.value.price);
        
        if (success) {
          // 创建订单
          const newOrder = {
            id: Date.now(),
            productName: selectedProduct.value.title,
            productImage: selectedProduct.value.image,
            price: selectedProduct.value.price,
            createdAt: new Date(),
            status: 'processing',
            statusText: '处理中'
          };
          
          orders.value.unshift(newOrder);
          
          // 减少库存
          const productIndex = products.value.findIndex(p => p.id === selectedProduct.value.id);
          if (productIndex !== -1) {
            products.value[productIndex].stock--;
          }
          
          // 显示成功弹窗
          showBuyModal.value = false;
          showSuccessModal.value = true;
          selectedProduct.value = null;
        }
      }
    };

    const formatDate = (date) => {
      const d = new Date(date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    // 初始化
    onMounted(() => {
      initProducts();
      initOrders();
    });

    return {
      activeCategory,
      categories,
      filteredProducts,
      qianbi,
      orders,
      showBuyModal,
      showSuccessModal,
      selectedProduct,
      goToTasks,
      buyProduct,
      confirmBuy,
      formatDate
    };
  }
};
</script>

<style scoped>
.mall-view {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.mall-view h1 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.5rem;
  color: #333;
}

/* 用户积分信息 */
.user-balance {
  margin-bottom: 3rem;
}

.balance-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.balance-icon {
  font-size: 3rem;
}

.balance-info .balance-label {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
}

.balance-info .balance-value {
  font-size: 2.5rem;
  font-weight: bold;
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
  background-color: white;
  color: #667eea;
  font-weight: 500;
}

.btn-primary:hover {
  background-color: #f0f0f0;
}

/* 分类选项卡 */
.category-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  background-color: white;
  padding: 0.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.category-btn {
  flex: 1;
  padding: 1rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1.1rem;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.category-btn.active {
  background-color: #1890ff;
  color: white;
}

/* 商品列表 */
.products-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.product-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.product-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.sold-out-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
}

.product-info {
  padding: 1.5rem;
}

.product-title {
  margin: 0 0 0.75rem 0;
  font-size: 1.3rem;
}

.product-description {
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.6;
  font-size: 0.95rem;
}

.product-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  font-weight: 500;
  color: #ff4d4f;
}

.price-icon {
  font-size: 1.4rem;
}

.product-stock {
  color: #666;
  font-size: 0.9rem;
}

.buy-btn {
  background-color: #52c41a;
  color: white;
}

.buy-btn:hover {
  background-color: #73d13d;
}

.disabled-btn {
  background-color: #d9d9d9;
  color: #999;
  cursor: not-allowed;
}

/* 我的订单 */
.my-orders {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.my-orders h2 {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-card {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
}

.order-image {
  width: 80px;
  height: 80px;
  overflow: hidden;
  border-radius: 4px;
  margin-right: 1.5rem;
}

.order-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.order-info {
  flex: 1;
}

.order-info h4 {
  margin: 0 0 0.5rem 0;
}

.order-details {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.order-date {
  color: #666;
  font-size: 0.9rem;
}

.order-status {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.order-status.processing {
  background-color: #fff7e6;
  color: #fa8c16;
}

.order-status.completed {
  background-color: #f6ffed;
  color: #52c41a;
}

.order-price {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #ff4d4f;
}

/* 空状态 */
.empty-state,
.empty-orders {
  text-align: center;
  padding: 3rem;
  color: #999;
}

.empty-orders {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
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

.product-preview {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.product-preview img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
}

.product-preview-info h4 {
  margin: 0 0 0.5rem 0;
}

.product-preview-info p {
  color: #666;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  line-height: 1.5;
}

.modal-message {
  margin-bottom: 2rem;
  font-size: 1.1rem;
  text-align: center;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

/* 成功弹窗 */
.success-modal {
  text-align: center;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.success-modal h3 {
  margin-bottom: 0.5rem;
}

.success-modal p {
  color: #666;
  margin-bottom: 2rem;
}

.success-modal .btn-primary {
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .balance-card {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }
  
  .category-tabs {
    flex-direction: column;
  }
  
  .products-container {
    grid-template-columns: 1fr;
  }
  
  .order-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .order-image {
    width: 100%;
    height: 150px;
    margin-right: 0;
  }
  
  .product-preview {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}
</style>