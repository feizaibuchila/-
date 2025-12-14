const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const AdminUser = require('../models/AdminUser');

// 简化的仪表盘数据接口
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    // 获取管理员数量
    const adminCount = await AdminUser.count();
    
    res.json({
      code: 200,
      msg: '获取成功',
      data: {
        adminCount,
        welcome: '欢迎使用薛之谦粉丝应援站管理系统'
      }
    });
  } catch (error) {
    console.error('获取仪表盘数据失败:', error);
    res.status(500).json({ code: 500, msg: '获取数据失败', data: null });
  }
});

module.exports = router;