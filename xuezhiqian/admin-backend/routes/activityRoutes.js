const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const SupportActivity = require('../models/SupportActivity');
const { authenticateToken } = require('../middleware/auth');

// 创建上传目录
const uploadDir = path.join(__dirname, '..', 'public', 'upload', 'activity');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  },
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const mimetype = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('只允许上传JPEG、JPG、PNG格式的图片，且大小不超过2MB'));
  }
});

// POST /api/activities：创建应援活动
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { title, content, startTime, endTime, status } = req.body;
    
    // 验证必填字段
    if (!title || !content || !startTime || !endTime) {
      return res.status(400).json({ code: 400, msg: '请填写必填字段' });
    }
    
    // 创建活动
    const activity = await SupportActivity.create({
      title,
      content,
      startTime,
      endTime,
      status: status || 1,
      createdBy: req.adminUser.id || 1
    });
    
    res.status(200).json({ code: 200, msg: '创建成功', data: activity });
  } catch (error) {
    console.error('创建活动失败:', error);
    next(error);
  }
});

// GET /api/activities：活动列表查询
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const keyword = req.query.keyword || '';
    const status = req.query.status ? parseInt(req.query.status) : null;
    
    const where = {};
    if (keyword) {
      where.title = { [SupportActivity.sequelize.Op.like]: `%${keyword}%` };
    }
    if (status !== null) {
      where.status = status;
    }
    
    const { count, rows } = await SupportActivity.findAndCountAll({
      where,
      limit: size,
      offset: (page - 1) * size,
      order: [['createdAt', 'DESC']]
    });
    
    // 自动更新活动状态
    const now = new Date();
    const updatedRows = await Promise.all(rows.map(async (activity) => {
      const start = new Date(activity.startTime);
      const end = new Date(activity.endTime);
      let newStatus = activity.status;
      
      if (activity.status === 1) {
        if (now < start) {
          newStatus = 1; // 未开始
        } else if (now >= start && now <= end) {
          newStatus = 2; // 进行中
          await activity.update({ status: 2 });
        } else if (now > end) {
          newStatus = 3; // 已结束
          await activity.update({ status: 3 });
        }
      }
      
      return {
        ...activity.toJSON(),
        status: newStatus
      };
    }));
    
    res.status(200).json({
      code: 200,
      msg: '获取成功',
      data: {
        total: count,
        list: updatedRows
      }
    });
  } catch (error) {
    console.error('获取活动列表失败:', error);
    next(error);
  }
});

// GET /api/activities/:id：查询单个活动详情
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const activity = await SupportActivity.findByPk(req.params.id);
    if (!activity) {
      const error = new Error('活动不存在');
      error.statusCode = 400;
      return next(error);
    }
    
    res.status(200).json({ code: 200, msg: '获取成功', data: activity });
  } catch (error) {
    console.error('获取活动详情失败:', error);
    next(error);
  }
});

// PUT /api/activities/:id：修改活动信息
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { title, content, startTime, endTime, status, coverImg } = req.body;
    
    const activity = await SupportActivity.findByPk(req.params.id);
    if (!activity) {
      const error = new Error('活动不存在');
      error.statusCode = 400;
      return next(error);
    }
    
    // 更新活动信息
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (startTime !== undefined) updateData.startTime = startTime;
    if (endTime !== undefined) updateData.endTime = endTime;
    if (status !== undefined) updateData.status = status;
    if (coverImg !== undefined) updateData.coverImg = coverImg;
    
    await activity.update(updateData);
    
    res.status(200).json({ code: 200, msg: '更新成功', data: activity });
  } catch (error) {
    console.error('更新活动失败:', error);
    next(error);
  }
});

// DELETE /api/activities/:id：删除活动
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const activity = await SupportActivity.findByPk(req.params.id);
    if (!activity) {
      const error = new Error('活动不存在');
      error.statusCode = 400;
      return next(error);
    }
    
    // 如果有封面图，删除文件
    if (activity.coverImg) {
      const imagePath = path.join(uploadDir, path.basename(activity.coverImg));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await activity.destroy();
    res.status(200).json({ code: 200, msg: '删除成功' });
  } catch (error) {
    console.error('删除活动失败:', error);
    next(error);
  }
});

// POST /api/activities/upload：封面图上传接口
router.post('/upload', authenticateToken, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ code: 400, msg: '请选择要上传的文件' });
    }
    
    // 返回相对路径
    const relativePath = `/upload/activity/${req.file.filename}`;
    res.status(200).json({
      code: 200,
      msg: '上传成功',
      data: {
        url: relativePath
      }
    });
  } catch (error) {
    console.error('文件上传失败:', error);
    res.status(400).json({ code: 400, msg: error.message || '上传失败' });
  }
});

module.exports = router;