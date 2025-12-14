// 错误处理中间件

// 404错误处理中间件
const notFoundHandler = (req, res, next) => {
  const error = new Error(`请求的资源 ${req.originalUrl} 不存在`);
  error.statusCode = 404;
  next(error);
};

// 全局错误处理中间件
const globalErrorHandler = (err, req, res, next) => {
  console.error('全局错误:', err);
  
  // 设置默认错误状态和消息
  let statusCode = err.statusCode || 500;
  let message = err.message || '服务器内部错误';
  let data = null;
  
  // 根据错误类型定制错误消息
  if (err.name === 'SequelizeValidationError') {
    // 数据库验证错误
    statusCode = 400;
    message = err.errors.map(error => error.message).join(', ');
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    // 唯一约束错误
    statusCode = 400;
    message = '该记录已存在';
  } else if (err.name === 'SequelizeDatabaseError') {
    // 数据库错误
    statusCode = 500;
    message = '数据库操作失败';
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    // JWT错误
    statusCode = 401;
    message = err.message;
  }
  
  // 返回统一格式的错误响应
  res.status(statusCode).json({
    code: statusCode,
    msg: message,
    data: data
  });
};

module.exports = {
  notFoundHandler,
  globalErrorHandler
};
