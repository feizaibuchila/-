// 认证中间件
const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');

// 从环境变量获取JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'xuezhiqian_admin_jwt_secret';

// 验证JWT token中间件
const authenticateToken = async (req, res, next) => {
  try {
    // 获取Authorization头
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        code: 401,
        msg: '未授权访问，请提供有效的token',
        data: null
      });
    }
    
    // 提取token
    const token = authHeader.split(' ')[1];
    
    // 验证token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 查找用户
    const adminUser = await AdminUser.findByPk(decoded.id);
    if (!adminUser) {
      return res.status(401).json({
        code: 401,
        msg: '用户不存在或已被删除',
        data: null
      });
    }
    
    // 将用户信息挂载到请求对象
    req.adminUser = adminUser;
    req.user = decoded;
    
    next();
  } catch (error) {
    let msg = '认证失败';
    if (error.name === 'JsonWebTokenError') {
      msg = '无效的token';
    } else if (error.name === 'TokenExpiredError') {
      msg = 'token已过期';
    }
    
    return res.status(401).json({
      code: 401,
      msg: msg,
      data: null
    });
  }
};

// 可选认证中间件 - 用于某些不需要强制认证的接口
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const adminUser = await AdminUser.findByPk(decoded.id);
      if (adminUser) {
        req.adminUser = adminUser;
        req.user = decoded;
      }
    }
    next();
  } catch (error) {
    // 可选认证，token无效时继续执行
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuthenticate
};
