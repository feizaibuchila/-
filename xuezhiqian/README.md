# 薛之谦粉丝应援站

## 项目简介

薛之谦粉丝应援站是一个为薛之谦粉丝打造的综合性应援平台，提供音乐作品展示、演唱会信息、应援活动、互动社区等功能，旨在增强粉丝之间的联系和互动，为薛之谦提供强大的粉丝支持。

## 技术栈

### 前端
- Vue 3.5.22
- Vue Router 4.5.1
- Pinia 3.0.3
- Axios 1.12.2
- Vite 5.4.21

### 后端
- Node.js
- Express
- Sequelize
- SQLite
- JWT

## 项目结构

```
├── admin-backend/          # 管理后端
│   ├── config/             # 配置文件
│   ├── migrations/         # 数据库迁移
│   ├── models/             # 数据模型
│   ├── routes/             # 路由
│   ├── seeders/            # 数据种子
│   └── server.js           # 服务器入口
├── admin-frontend/         # 管理前端
├── src/                    # 粉丝端前端
│   ├── api/                # API请求
│   ├── assets/             # 静态资源
│   ├── components/         # 组件
│   ├── router/             # 路由
│   ├── store/              # 状态管理
│   ├── views/              # 页面
│   ├── App.vue             # 根组件
│   ├── main.js             # 入口文件
│   └── style.css           # 全局样式
├── index.html              # HTML模板
└── package.json            # 项目配置
```

## 启动说明

### 一、环境准备

1. 安装 Node.js 20.13.1 或更高版本
2. 安装 npm 或 yarn

### 二、前端启动

#### 1. 安装依赖

```bash
npm install
```

#### 2. 启动开发服务器

```bash
npm run dev
```

前端开发服务器将在 http://localhost:5175 启动

#### 3. 构建生产版本

```bash
npm run build
```

构建后的文件将生成在 `dist` 目录

### 三、后端启动

#### 1. 进入后端目录

```bash
cd admin-backend
```

#### 2. 安装依赖

```bash
npm install
```

#### 3. 配置环境变量

创建 `.env` 文件，配置以下内容：

```
PORT=3001
JWT_SECRET=your-jwt-secret-key
```

#### 4. 初始化数据库

```bash
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

#### 5. 启动后端服务器

```bash
npm start
```

后端服务器将在 http://localhost:3001 启动

### 四、管理前端启动

#### 1. 进入管理前端目录

```bash
cd admin-frontend
```

#### 2. 安装依赖

```bash
npm install
```

#### 3. 启动开发服务器

```bash
npm run dev
```

管理前端将在 http://localhost:5174 启动

## 功能模块

### 粉丝端功能

1. 首页：展示最新动态和重点内容
2. 音乐作品：展示薛之谦的音乐作品
3. 演唱会：展示演唱会信息和门票购买
4. VIP中心：提供VIP会员服务
5. 应援活动：展示和参与应援活动
6. 幸运转盘：粉丝互动游戏
7. 话题互动墙：粉丝交流互动
8. 歌词弹幕：歌词互动
9. 猜歌挑战：音乐互动游戏
10. 个人主页：粉丝个人信息和应援数据

### 管理端功能

1. 仪表盘：数据统计和概览
2. 粉丝管理：粉丝信息管理
3. 活动管理：应援活动管理
4. 投稿管理：粉丝投稿审核和管理

## API文档

### 粉丝相关API

- GET /api/fans：粉丝列表查询
- GET /api/fans/:id：单个粉丝详情
- PUT /api/fans/:id/status：修改粉丝状态
- DELETE /api/fans/:id：删除粉丝

### 活动相关API

- GET /api/activities：活动列表查询
- POST /api/activities：创建活动
- GET /api/activities/:id：单个活动详情
- PUT /api/activities/:id：更新活动
- DELETE /api/activities/:id：删除活动

### 投稿相关API

- GET /api/contributions：投稿列表查询
- GET /api/contributions/:id：单个投稿详情
- PUT /api/contributions/:id/status：修改投稿状态

## 数据库结构

### 主要表结构

1. admin_users：管理员用户表
2. fans：粉丝表
3. support_activities：应援活动表
4. fan_contributions：粉丝投稿表

## 开发规范

### 前端开发规范

1. 使用 Vue 3 Composition API
2. 组件命名使用 PascalCase
3. 路由命名使用 kebab-case
4. 状态管理使用 Pinia
5. 代码风格统一使用 Prettier

### 后端开发规范

1. 路由使用 RESTful API 设计
2. 错误处理统一使用中间件
3. 认证使用 JWT
4. 日志使用统一的日志中间件

## 部署说明

### 前端部署

1. 构建生产版本：`npm run build`
2. 将 `dist` 目录部署到静态文件服务器
3. 配置 Nginx 或其他 Web 服务器

### 后端部署

1. 确保环境变量配置正确
2. 启动生产服务器：`npm start`
3. 配置 Nginx 反向代理

## 注意事项

1. 开发环境下，前端访问后端 API 需要配置 CORS
2. 生产环境下，建议使用 HTTPS
3. 定期备份数据库
4. 注意 API 安全，避免 SQL 注入和 XSS 攻击

## 联系方式

如有问题或建议，请联系项目维护人员。

## 许可证

MIT License
