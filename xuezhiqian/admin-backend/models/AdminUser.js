const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// 管理员表模型
const AdminUser = sequelize.define('AdminUser', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: {
        msg: '管理员账号不能为空'
      },
      len: {
        args: [1, 50],
        msg: '管理员账号长度不能超过50个字符'
      }
    }
  },
  password: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '密码不能为空'
      },
      len: {
        args: [1, 100],
        msg: '密码长度不能超过100个字符'
      }
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at' // 映射到数据库中的created_at列
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_login_at' // 映射到数据库中的last_login_at列
  }
}, {
  tableName: 'admin_users',
  timestamps: true,
  updatedAt: false // 管理员表不记录更新时间
});

module.exports = AdminUser;