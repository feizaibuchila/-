const express = require('express');
const router = express.Router();
const Fan = require('../models/Fan');
const FanContribution = require('../models/FanContribution');
const SupportActivity = require('../models/SupportActivity');
const { authenticateToken } = require('../middleware/auth');

// 统计数据接口 GET /api/dashboard/stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // 粉丝总数：查询fans表中status=1的记录数
    const fanTotal = await Fan.count({ where: { status: 1 } });
    
    // 待审核投稿数：查询fan_contributions表中status=1的记录数
    const pendingContribution = await FanContribution.count({ where: { status: 1 } });
    
    // 应援活动数：按状态分组统计
    const activities = await SupportActivity.findAll({
      attributes: ['status', [SupportActivity.sequelize.fn('COUNT', SupportActivity.sequelize.col('id')), 'count']],
      group: ['status'],
      raw: true
    });
    
    // 构建活动状态统计数组
    const statusMap = {
      1: '未开始',
      2: '进行中',
      3: '已结束'
    };
    
    const activityStats = [];
    for (let status in statusMap) {
      const activity = activities.find(a => parseInt(a.status) === parseInt(status));
      activityStats.push({
        status: parseInt(status),
        name: statusMap[status],
        count: activity ? parseInt(activity.count) : 0
      });
    }
    
    // 已通过投稿数：查询fan_contributions表中status=2的记录数
    const passedContribution = await FanContribution.count({ where: { status: 2 } });
    
    // 返回统计数据
    res.status(200).json({
      code: 200,
      msg: '获取成功',
      data: {
        fanTotal,
        pendingContribution,
        activityStats,
        passedContribution
      }
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    res.status(500).json({ code: 500, msg: '服务器内部错误' });
  }
});

// 获取最新待审核投稿列表
router.get('/latest-contributions', authenticateToken, async (req, res) => {
  try {
    const contributions = await FanContribution.findAll({
      where: { status: 1 },
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [{
        model: Fan,
        attributes: ['nickname']
      }],
      attributes: ['id', 'createdAt', 'status']
    });
    
    const formattedContributions = contributions.map(contribution => ({
      id: contribution.id,
      fanNickname: contribution.Fan ? contribution.Fan.nickname : '未知粉丝',
      submitTime: contribution.createdAt,
      status: contribution.status
    }));
    
    res.status(200).json({
      code: 200,
      msg: '获取成功',
      data: formattedContributions
    });
  } catch (error) {
    console.error('获取最新投稿失败:', error);
    res.status(500).json({ code: 500, msg: '服务器内部错误' });
  }
});

module.exports = router;