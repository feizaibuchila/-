// 日志中间件
const logger = (req, res, next) => {
  const start = Date.now();
  
  // 记录请求信息
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip;
  
  // 监听响应结束事件
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const contentLength = res.get('content-length') || 0;
    
    // 日志格式：时间 [IP] 方法 路径 状态码 响应时间 内容长度
    console.log(`[${new Date().toISOString()}] [${ip}] ${method} ${url} ${statusCode} ${duration}ms ${contentLength}B`);
  });
  
  next();
};

module.exports = logger;
