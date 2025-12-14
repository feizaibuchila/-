import { createRouter, createWebHistory } from 'vue-router';

// 使用懒加载导入所有组件，提高初始加载速度

const routes = [
  {
    path: '/',
    name: 'login',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/concerts',
    name: 'concerts',
    component: () => import('../views/ConcertsView.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/tickets/:id',
    name: 'ticketPurchase',
    component: () => import('../views/TicketPurchaseView.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/my-tickets',
    name: 'myTickets',
    component: () => import('../views/MyTicketsView.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/detail/:type/:id',
    name: 'detail',
    component: () => import('../views/DetailView.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/vip',
    name: 'vip',
    component: () => import('../views/VIPCenter.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/vip-view',
    name: 'vipView',
    component: () => import('../views/VipView.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/tickets',
    name: 'tickets',
    component: () => import('../views/TicketsView.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/albums/:id',
    name: 'albums',
    component: () => import('../views/AlbumsView.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/activities',
    name: 'activities',
    component: () => import('../views/ActivitiesView.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/spin-wheel',
    name: 'spinWheel',
    component: () => import('../views/SpinWheelView.vue'),
    meta: {
      requiresAuth: true
    }
  },
  // 新增功能路由
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfileView.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: () => import('../views/TasksView.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/mall',
    name: 'Mall',
    component: () => import('../views/MallView.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/topics',
    name: 'TopicsWall',
    component: () => import('../views/TopicsWallView.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/lyrics-danmaku',
    name: 'LyricsDanmaku',
    component: () => import('../views/LyricsDanmakuView.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/guess-song',
    name: 'GuessSong',
    component: () => import('../views/GuessSongView.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/activity-calendar',
    name: 'ActivityCalendar',
    component: () => import('../views/ActivityCalendarView.vue'),
    meta: {
      requiresAuth: true
    }
  },
  // 404页面
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 简单的路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  
  if (to.meta.requiresAuth) {
    if (!token) {
      // 如果需要认证但没有token，先设置一个模拟token
      localStorage.setItem('token', 'mock-token');
    }
    next();
  } else {
    next();
  }
});

export default router;