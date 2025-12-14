const { Sequelize } = require('sequelize');
require('dotenv').config();

// 创建数据库连接
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './xuezhiqian_fans.db', // SQLite数据库文件路径
  logging: false // 关闭日志输出
});

// 测试数据库连接
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');
  } catch (error) {
    console.error('数据库连接失败:', error);
  }
};

// 初始化数据库
const initDB = async () => {
  try {
    // 同步模型到数据库
    await sequelize.sync({
      alter: true // 根据模型自动修改表结构
    });
    console.log('数据库同步完成');
    
    // 初始化管理员账户
    await initAdminUser();
  } catch (error) {
    console.error('数据库初始化失败:', error);
  }
};

// 初始化管理员账户
const initAdminUser = async () => {
  try {
    const AdminUser = require('../models/AdminUser');
    const bcrypt = require('bcryptjs');
    // 检查是否已有管理员账户
    const adminExists = await AdminUser.findOne({ where: { username: 'admin' } });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      await AdminUser.create({
        username: 'admin',
        password: hashedPassword,
        createdAt: new Date()
      });
      console.log('管理员账户初始化成功');
    }
  } catch (error) {
    console.error('管理员账户初始化失败:', error);
  }
};

module.exports = {
  sequelize,
  testConnection,
  initDB
};