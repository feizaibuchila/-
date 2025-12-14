const express = require('express');
const cors = require('cors');
const { testConnection, initDB } = require('./config/db');
require('dotenv').config();

// 清除模块缓存
delete require.cache[require.resolve('./routes/api')];
delete require.cache[require.resolve('./routes/adminRoutes')];
delete require.cache[require.resolve('./routes/dashboardRoutes')];
delete require.cache[require.resolve('./routes/fanRoutes')];
delete require.cache[require.resolve('./routes/activityRoutes')];
delete require.cache[require.resolve('./routes/contributionRoutes')];

// 引入路由
const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/adminRoutes.new');
const dashboardRoutes = require('./routes/dashboardRoutes');
const fanRoutes = require('./routes/fanRoutes');
const activityRoutes = require('./routes/activityRoutes');
const contributionRoutes = require('./routes/contributionRoutes');

// 引入自定义中间件
const logger = require('./middleware/logger');
const { authenticateToken, optionalAuthenticate } = require('./middleware/auth');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件配置
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8080'], // 允许的前端域名
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// 日志中间件
app.use(logger);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 根路径
app.get('/', (req, res) => {
  res.json({
    message: '薛之谦粉丝应援站管理端API',
    status: 'running',
    version: '1.0.0'
  });
});

// 使用路由
app.use('/api', apiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/fans', fanRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/contributions', contributionRoutes);

// 404处理
app.use(notFoundHandler);

// 全局错误处理中间件
app.use(globalErrorHandler);

// 启动服务器
const startServer = async () => {
  try {
    // 测试数据库连接
    await testConnection();
    
    // 初始化数据库
    await initDB();
    
    // 启动服务器
    app.listen(PORT, () => {
      console.log(`服务器已启动，监听端口: ${PORT}`);
      console.log(`API文档地址: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
};

// 启动应用
startServer();