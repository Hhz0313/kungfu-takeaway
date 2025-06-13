# 功夫宅急送 (Kungfu Takeaway)

哈工大校园功夫食堂点餐系统，支持管理员后台管理与用户在线点餐，采用前后端分离架构，基于 Vue 3 和 Node.js + Express 实现。

## 项目结构

```
kungfu-takeaway/
├── frontend/            # 前端项目（基于 Vite 创建的 Vue 3 应用）
├── backend/
│   ├── routes/          # 路由模块
│   ├── controllers/     # 控制器逻辑
│   ├── models/          # 数据模型与数据库操作（使用 SQLite）
│   ├── utils/           # 工具类（响应结构、ID 生成等）
│   ├── uploads/         # 上传的图片资源（如菜品图片）
│   ├── app.js           # Express 后端入口
│   └── package.json     # 后端依赖与脚本配置
└── README.md
```

## 技术栈

* 前端：Vue 3 + Vite + Tailwind CSS
* 后端：Node.js + Express
* 数据存储：SQLite（通过 `sqlite3` 模块操作）
* 文件上传：Multer 中间件
* 开发工具：VSCode + npm

## 功能模块

* 管理员端：

  * 分类管理
  * 菜品管理（支持图片上传与口味设置）
  * 套餐管理
  * 订单处理
  * 数据统计（营业额、热销榜等）

* 用户端：

  * 菜单浏览与筛选
  * 菜品详情与口味选择
  * 加入购物车、下单、查看订单
  * 地址管理与修改

## 启动方法

### 启动后端

1. 进入 backend 目录：

```bash
cd backend
```

2. 安装依赖：

```bash
npm install
```

3. 启动开发服务器：

```bash
npm run dev
```

后端服务器将在 `http://localhost:3000` 启动（可通过设置环境变量 `PORT` 修改端口）。首次运行时将自动初始化 SQLite 数据库文件。

### 启动前端

1. 进入 frontend 目录：

```bash
cd frontend
```

2. 安装依赖：

```bash
npm install
```

3. 启动开发服务器：

```bash
npm run dev
```

前端默认运行在 `http://localhost:8080`（或在 `vite.config.js` 中指定），API 请求将自动代理到后端。

## 接口说明

* 所有 API 接口遵循 RESTful 风格，统一前缀为 `/api/`。
* 接口文档将持续完善补充。
