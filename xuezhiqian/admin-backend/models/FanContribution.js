const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Fan = require('./Fan');
const SupportActivity = require('./SupportActivity');

// 粉丝投稿/留言表模型
const FanContribution = sequelize.define('FanContribution', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fanId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'fan_id', // 映射到数据库中的fan_id列
    references: {
      model: 'fans',
      key: 'id'
    }
  },
  activityId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'activity_id', // 映射到数据库中的activity_id列
    references: {
      model: 'support_activities',
      key: 'id'
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '投稿/留言内容不能为空'
      }
    }
  },
  imgUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'img_url', // 映射到数据库中的img_url列
    validate: {
      len: {
        args: [0, 255],
        msg: '投稿图片地址长度不能超过255个字符'
      }
    }
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    validate: {
      isIn: {
        args: [[1, 2, 3]],
        msg: '状态值必须为1（待审核）、2（已通过）或3（已驳回）'
      }
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at' // 映射到数据库中的created_at列
  }
}, {
  tableName: 'fan_contributions',
  timestamps: false // 投稿表使用自定义的时间字段
});

// 建立关联：FanContribution 关联 Fan（多对一）
FanContribution.belongsTo(Fan, {
  foreignKey: 'fanId',
  targetKey: 'id',
  as: 'fan'
});

// 建立关联：FanContribution 关联 SupportActivity（多对一）
FanContribution.belongsTo(SupportActivity, {
  foreignKey: 'activityId',
  targetKey: 'id',
  as: 'activity'
});

module.exports = FanContribution;