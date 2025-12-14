import { defineStore } from 'pinia';

export const useCartStore = defineStore('cart', {
  state: () => {
    // 从localStorage加载状态
    const savedItems = localStorage.getItem('cartItems');
    return {
      items: savedItems ? JSON.parse(savedItems) : [
        {
          id: 1,
          type: 'ticket',
          name: '薛之谦2024演唱会上海站',
          date: '2024-06-15',
          price: 880,
          quantity: 2,
          status: 'pending' // pending, purchased
        },
        {
          id: 2,
          type: 'album',
          name: '天外来物 限量版专辑',
          price: 198,
          quantity: 1,
          status: 'pending'
        }
      ]
    };
  },
  
  getters: {
    // 获取购物车总金额
    getTotalAmount: (state) => {
      return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    
    // 获取待支付的商品
    getPendingItems: (state) => {
      return state.items.filter(item => item.status === 'pending');
    }
  },
  
  actions: {
    // 保存状态到localStorage
    saveState() {
      localStorage.setItem('cartItems', JSON.stringify(this.items));
    },
    
    // 添加商品到购物车
    addToCart(item) {
      const existingItem = this.items.find(i => i.id === item.id);
      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        this.items.push(item);
      }
      this.saveState();
    },
    
    // 更新商品数量
    updateQuantity(itemId, quantity) {
      const item = this.items.find(i => i.id === itemId);
      if (item) {
        item.quantity = quantity;
        // 如果数量为0，从购物车移除
        if (quantity <= 0) {
          this.removeFromCart(itemId);
        } else {
          this.saveState();
        }
      }
    },
    
    // 从购物车移除商品
    removeFromCart(itemId) {
      this.items = this.items.filter(item => item.id !== itemId);
      this.saveState();
    },
    
    // 清空购物车
    clearCart() {
      this.items = [];
      this.saveState();
    },
    
    // 更新商品状态
    updateItemStatus(itemId, status) {
      const item = this.items.find(i => i.id === itemId);
      if (item) {
        item.status = status;
        this.saveState();
      }
    }
  }
});
