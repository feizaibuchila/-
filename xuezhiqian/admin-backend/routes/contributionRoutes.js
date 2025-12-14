const express = require('express');
const router = express.Router();
const FanContribution = require('../models/FanContribution');
const Fan = require('../models/Fan');
const SupportActivity = require('../models/SupportActivity');
const { authenticateToken } = require('../middleware/auth');

// GET /api/contributions：投稿列表查询
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const activityId = req.query.activityId ? parseInt(req.query.activityId) : null;
    const status = req.query.status ? parseInt(req.query.status) : null;
    const keyword = req.query.keyword || '';
    
    const where = {};
    if (activityId) {
      where.activityId = activityId;
    }
    if (status !== null) {
      where.status = status;
    }
    if (keyword) {
      where.content = { [FanContribution.sequelize.Op.like]: `%${keyword}%` };
    }
    
    const { count, rows } = await FanContribution.findAndCountAll({
      where,
      include: [
        {
          model: Fan,
          attributes: ['nickname', 'avatar']
        },
        {
          model: SupportActivity,
          attributes: ['title']
        }
      ],
      limit: size,
      offset: (page - 1) * size,
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      code: 200,
      msg: '获取成功',
      data: {
        total: count,
        list: rows
      }
    });
  } catch (error) {
    console.error('获取投稿列表失败:', error);
    next(error);
  }
});

// GET /api/contributions/:id：查询单个投稿详情
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const contribution = await FanContribution.findByPk(req.params.id, {
      include: [
        {
          model: Fan,
          attributes: ['nickname', 'avatar', 'phone']
        },
        {
          model: SupportActivity,
          attributes: ['title', 'startTime', 'endTime']
        }
      ]
    });
    
    if (!contribution) {
      const error = new Error('投稿不存在');
      error.statusCode = 400;
      return next(error);
    }
    
    res.status(200).json({ code: 200, msg: '获取成功', data: contribution });
  } catch (error) {
    console.error('获取投稿详情失败:', error);
    next(error);
  }
});

// PUT /api/contributions/:id/review：投稿审核
router.put('/:id/review', authenticateToken, async (req, res, next) => {
  try {
    const { status } = req.body;
    
    // 验证状态值
    if (![2, 3].includes(status)) {
      const error = new Error('状态值无效');
      error.statusCode = 400;
      return next(error);
    }
    
    const contribution = await FanContribution.findByPk(req.params.id);
    if (!contribution) {
      const error = new Error('投稿不存在');
      error.statusCode = 400;
      return next(error);
    }
    
    // 只有待审核状态的才能被审核
    if (contribution.status !== 1) {
      const error = new Error('该投稿已被审核');
      error.statusCode = 400;
      return next(error);
    }
    
    await contribution.update({
      status
    });
    
    res.status(200).json({ code: 200, msg: '审核成功' });
  } catch (error) {
    console.error('审核投稿失败:', error);
    next(error);
  }
});

// DELETE /api/contributions/:id：删除投稿
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const contribution = await FanContribution.findByPk(req.params.id);
    if (!contribution) {
      const error = new Error('投稿不存在');
      error.statusCode = 400;
      return next(error);
    }
    
    await contribution.destroy();
    res.status(200).json({ code: 200, msg: '删除成功' });
  } catch (error) {
    console.error('删除投稿失败:', error);
    next(error);
  }
});

module.exports = router;