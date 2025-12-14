const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');
const { authenticateToken } = require('../middleware/auth');

// 从环境变量获取JWT密钥，如果没有则使用默认值
const JWT_SECRET = process.env.JWT_SECRET || 'xuezhiqian_admin_jwt_secret';

// 登录接口
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 查找管理员用户
    const adminUser = await AdminUser.findOne({ where: { username } });
    
    // 账号不存在
    if (!adminUser) {
      return res.status(400).json({
        code: 400,
        msg: '账号不存在',
        data: null
      });
    }
    
    // 密码错误
    const isPasswordValid = await bcrypt.compare(password, adminUser.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        code: 400,
        msg: '密码错误',
        data: null
      });
    }
    
    // 更新最后登录时间
    await adminUser.update({ lastLoginAt: new Date() });
    
    // 生成JWT token，设置2小时过期时间
    const token = jwt.sign(
      { id: adminUser.id, username: adminUser.username },
      JWT_SECRET,
      { expiresIn: '2h' }
    );
    
    // 准备用户信息（隐藏password字段）
    const userInfo = {
      id: adminUser.id,
      username: adminUser.username,
      createdAt: adminUser.createdAt,
      lastLoginAt: adminUser.lastLoginAt
    };
    
    // 返回成功响应
    res.json({
      code: 200,
      msg: '登录成功',
      data: {
        token,
        userInfo
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({
      code: 500,
      msg: '登录失败，请稍后重试',
      data: null
    });
  }
});

// 获取当前登录管理员信息
router.get('/info', authenticateToken, async (req, res) => {
  try {
    // 从请求对象中获取用户信息
    const adminUser = req.adminUser;
    
    // 准备返回数据（隐藏password字段）
    const userInfo = {
      id: adminUser.id,
      username: adminUser.username,
      createdAt: adminUser.createdAt,
      lastLoginAt: adminUser.lastLoginAt
    };
    
    res.json({
      code: 200,
      msg: '获取管理员信息成功',
      data: userInfo
    });
  } catch (error) {
    console.error('获取管理员信息失败:', error);
    res.status(500).json({
      code: 500,
      msg: '获取管理员信息失败',
      data: null
    });
  }
});

// 修改密码
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const adminUser = req.adminUser;
    
    // 验证旧密码
    const isPasswordValid = await bcrypt.compare(oldPassword, adminUser.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        code: 400,
        msg: '旧密码错误',
        data: null
      });
    }
    
    // 验证新密码长度
    if (!newPassword || newPassword.length < 6 || newPassword.length > 16) {
      return res.status(400).json({
        code: 400,
        msg: '新密码长度应为6-16位',
        data: null
      });
    }
    
    // 验证新密码是否与旧密码相同
    if (oldPassword === newPassword) {
      return res.status(400).json({
        code: 400,
        msg: '新密码不能与旧密码相同',
        data: null
      });
    }
    
    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // 更新密码
    await adminUser.update({ password: hashedPassword });
    
    res.json({
      code: 200,
      msg: '密码修改成功',
      data: null
    });
  } catch (error) {
    console.error('修改密码失败:', error);
    res.status(500).json({
      code: 500,
      msg: '修改密码失败',
      data: null
    });
  }
});

module.exports = router;