const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// 粉丝表模型
const Fan = sequelize.define('Fan', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nickname: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '粉丝昵称不能为空'
      },
      len: {
        args: [1, 50],
        msg: '粉丝昵称长度不能超过50个字符'
      }
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true,
    validate: {
      len: {
        args: [0, 20],
        msg: '联系方式长度不能超过20个字符'
      }
    }
  },
  avatar: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      len: {
        args: [0, 255],
        msg: '头像地址长度不能超过255个字符'
      }
    }
  },
  joinTime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'join_time' // 映射到数据库中的join_time列
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    validate: {
      isIn: {
        args: [[0, 1]],
        msg: '状态值必须为0（禁用）或1（正常）'
      }
    }
  }
}, {
  tableName: 'fans',
  timestamps: false // 粉丝表使用自定义的时间字段
});

module.exports = Fan;