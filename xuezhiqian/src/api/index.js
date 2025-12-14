import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:3001/api', // 本地后端API地址
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 从本地存储获取token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    // 处理token过期或无效的情况
    if (error.response && error.response.status === 401) {
      // 清除本地存储的token
      localStorage.removeItem('token');
      // 重定向到登录页
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// 登录接口
export const login = (username, password, captcha) => {
  return api.post('/auth/login', { username, password, captcha });
};

// 获取验证码接口
export const getCaptcha = () => {
  return api.get('/auth/captcha');
};

// 获取用户信息接口
export const getUserInfo = () => {
  return api.get('/user/info');
};

// 获取演唱会列表接口
export const getConcerts = (page = 1, pageSize = 10, keyword = '') => {
  return api.get(`/concerts?page=${page}&pageSize=${pageSize}&keyword=${keyword}`);
};

// 获取专辑列表接口
export const getAlbums = (page = 1, pageSize = 10, keyword = '') => {
  return api.get(`/albums?page=${page}&pageSize=${pageSize}&keyword=${keyword}`);
};

// 获取新歌预告接口
export const getNewSongs = (page = 1, pageSize = 10, keyword = '') => {
  return api.get(`/newsongs?page=${page}&pageSize=${pageSize}&keyword=${keyword}`);
};

// 获取详情信息接口
export const getDetail = (id, type) => {
  return api.get(`/${type}/${id}`);
};

// VIP相关接口

export const getVipInfo = () => {
  return api.get('/vip/info');
};

export const buyVip = (plan) => {
  return api.post('/vip/buy', { plan });
};

export const getVipBenefits = () => {
  return api.get('/vip/benefits');
};

// 模拟数据生成函数
export const mockData = {
  // 模拟登录成功响应
  loginSuccess: () => ({
    code: 200,
    message: '登录成功',
    data: {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Inh1ZXpoaXFpYW5mYW4iLCJpZCI6MSwiZXhwIjoxNzE3NjkzMDIyfQ.1234567890abcdef',
      userInfo: {
        id: 1,
        username: 'xuezhiqianfan',
        nickname: '薛之谦的小迷弟/妹',
        avatar: 'https://picsum.photos/64/64?random=1',
        isVip: false,
        fansSince: '2018-05-20'
      }
    }
  }),
  
  // 模拟演唱会数据
  concerts: () => ({
    code: 200,
    message: '获取成功',
    data: {
      list: [
        {
          id: 1,
          title: '薛之谦「天外来物」世界巡回演唱会-上海站',
          date: '2024-06-15',
          location: '上海梅赛德斯奔驰文化中心',
          image: 'https://picsum.photos/300/200?random=10',
          description: '薛之谦2024全新巡演，带来视听盛宴',
          ticketStatus: '即将开售'
        },
        {
          id: 2,
          title: '薛之谦「天外来物」世界巡回演唱会-北京站',
          date: '2024-07-20',
          location: '北京工人体育场',
          image: 'https://picsum.photos/300/200?random=11',
          description: '薛之谦2024全新巡演北京站，精彩不容错过',
          ticketStatus: '预售中'
        },
        {
          id: 3,
          title: '薛之谦「天外来物」世界巡回演唱会-广州站',
          date: '2024-08-10',
          location: '广州天河体育中心',
          image: 'https://picsum.photos/300/200?random=12',
          description: '薛之谦2024全新巡演广州站，敬请期待',
          ticketStatus: '即将开售'
        }
      ],
      total: 3,
      page: 1,
      pageSize: 10
    }
  }),
  
  // 模拟专辑数据
  albums: () => ({
    code: 200,
    message: '获取成功',
    data: {
      list: [
        {
          id: 1,
          title: '无数',
          releaseDate: '2022-07-17',
          cover: 'https://picsum.photos/300/300?random=20',
          description: '薛之谦2022年全新专辑《无数》',
          tracks: 10
        },
        {
          id: 2,
          title: '尘',
          releaseDate: '2019-12-27',
          cover: 'https://picsum.photos/300/300?random=21',
          description: '薛之谦2019年专辑《尘》',
          tracks: 10
        },
        {
          id: 3,
          title: '意外',
          releaseDate: '2013-11-11',
          cover: 'https://picsum.photos/300/300?random=22',
          description: '薛之谦经典专辑《意外》',
          tracks: 10
        }
      ],
      total: 3,
      page: 1,
      pageSize: 10
    }
  }),
  
  // 模拟新歌预告数据
  newSongs: () => ({
    code: 200,
    message: '获取成功',
    data: {
      list: [
        {
          id: 1,
          title: '未完成的歌',
          artist: '薛之谦',
          releaseDate: '2024-08-01',
          cover: 'https://picsum.photos/300/300?random=30',
          status: '即将上线',
          preview: 'https://picsum.photos/100/100?random=40',
        },
        {
          id: 2,
          title: '星河',
          artist: '薛之谦',
          releaseDate: '2024-09-15',
          cover: 'https://picsum.photos/300/300?random=31',
            status: '制作中',
          preview: null
        }
      ],
      total: 2,
      page: 1,
      pageSize: 10
    }
  }),
  
  // 模拟VIP信息
  vipInfo: () => ({
    code: 200,
    message: '获取成功',
    data: {
      benefits: [
        {
          id: 1,
          title: '专辑购买优惠',
          description: 'VIP用户购买数字专辑享受8折优惠',
          icon: '🎵'
        },
        {
          id: 2,
          title: '演唱会优先购票',
          description: 'VIP用户可提前10分钟购买演唱会门票',
          icon: '🎫'
        },
        {
          id: 3,
          title: '专属周边',
          description: 'VIP用户可获得限量版专属周边',
          icon: '🎁'
        },
        {
          id: 4,
          title: '粉丝见面会优先',
          description: 'VIP用户优先获得粉丝见面会资格',
          icon: '🤝'
        }
      ],
      plans: [
        {
          id: 1,
          name: '月度VIP',
          price: 18,
          duration: '30天',
          description: '体验VIP特权一个月'
        },
        {
          id: 2,
          name: '年度VIP',
          price: 188,
          duration: '365天',
          description: '全年VIP特权，额外赠送专属周边'
        }
      ]
    }
  })
};

export default api;