const express = require('express');
const router = express.Router();
const Fan = require('../models/Fan');
const { authenticateToken } = require('../middleware/auth');
require('dotenv').config();

// GET /api/fans：粉丝列表查询（支持分页、模糊搜索昵称/手机号）
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    // 获取查询参数
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const keyword = req.query.keyword || '';
    
    // 构建查询条件
    const where = {};
    if (keyword) {
      where[Fan.sequelize.Op.or] = [
        { nickname: { [Fan.sequelize.Op.like]: `%${keyword}%` } },
        { phone: { [Fan.sequelize.Op.like]: `%${keyword}%` } }
      ];
    }
    
    // 查询数据
    const { count, rows } = await Fan.findAndCountAll({
      where,
      limit: size,
      offset: (page - 1) * size,
      order: [['joinTime', 'DESC']]
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
    // 将错误传递给全局错误处理中间件
    next(error);
  }
});

// GET /api/fans/:id：根据id查询单个粉丝详情
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const fan = await Fan.findByPk(req.params.id);
    if (!fan) {
      const error = new Error('粉丝不存在');
      error.statusCode = 400;
      return next(error);
    }
    res.status(200).json({ code: 200, msg: '获取成功', data: fan });
  } catch (error) {
    next(error);
  }
});

// PUT /api/fans/:id/status：修改粉丝状态
router.put('/:id/status', authenticateToken, async (req, res, next) => {
  try {
    const { status } = req.body;
    
    // 验证状态值
    if (![0, 1].includes(status)) {
      const error = new Error('状态值无效');
      error.statusCode = 400;
      return next(error);
    }
    
    const fan = await Fan.findByPk(req.params.id);
    if (!fan) {
      const error = new Error('粉丝不存在');
      error.statusCode = 400;
      return next(error);
    }
    
    fan.status = status;
    await fan.save();
    
    res.status(200).json({ code: 200, msg: '状态更新成功' });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/fans/:id：删除单个粉丝（物理删除）
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const fan = await Fan.findByPk(req.params.id);
    if (!fan) {
      const error = new Error('粉丝不存在');
      error.statusCode = 400;
      return next(error);
    }
    
    await fan.destroy();
    res.status(200).json({ code: 200, msg: '删除成功' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
