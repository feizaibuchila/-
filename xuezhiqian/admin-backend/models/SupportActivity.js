const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const AdminUser = require('./AdminUser');

// 应援活动表模型
const SupportActivity = sequelize.define('SupportActivity', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '活动标题不能为空'
      },
      len: {
        args: [1, 100],
        msg: '活动标题长度不能超过100个字符'
      }
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: '活动详情不能为空'
      }
    }
  },
  coverImg: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'cover_img', // 映射到数据库中的cover_img列
    validate: {
      len: {
        args: [0, 255],
        msg: '活动封面图地址长度不能超过255个字符'
      }
    }
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'start_time', // 映射到数据库中的start_time列
    validate: {
      notEmpty: {
        msg: '活动开始时间不能为空'
      }
    }
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'end_time', // 映射到数据库中的end_time列
    validate: {
      notEmpty: {
        msg: '活动结束时间不能为空'
      },
      // 确保结束时间晚于开始时间
      isAfter: {
        args: function() {
          return this.startTime || new Date();
        },
        msg: '活动结束时间必须晚于开始时间'
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
        msg: '状态值必须为1（未开始）、2（进行中）或3（已结束）'
      }
    }
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'created_by', // 映射到数据库中的created_by列
    references: {
      model: 'admin_users',
      key: 'id'
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at' // 映射到数据库中的created_at列
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW,
    field: 'updated_at' // 映射到数据库中的updated_at列
  }
}, {
  tableName: 'support_activities',
  timestamps: true
});

// 建立关联：SupportActivity 关联 AdminUser（多对一）
SupportActivity.belongsTo(AdminUser, {
  foreignKey: 'createdBy',
  targetKey: 'id',
  as: 'creator'
});

module.exports = SupportActivity;