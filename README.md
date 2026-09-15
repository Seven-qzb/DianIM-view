# DianIM-view (点点密信多端协同平台)

点点密信企业级即时通讯与多端协同生态平台，集成统一多端门户（APP端与PC端）、采用严格的 **MVP (Model-View-Presenter)** 分层架构进行统一逻辑编排与跨端复用。

## 🌟 核心特性

- **统一多端门户 (Portal View)**：提供沉浸式现代毛玻璃风格的双端入口卡片，支持一键切换与体验「APP移动端」与「PC桌面端」。
- **MVP 架构分层**：
  - **Model (`src/models/`)**：统一的数据模型、状态管理、消息加密与协同逻辑核心。
  - **Presenter (`src/presenters/`)**：业务控制器，连接 Model 与 View，处理多端双向数据流与指令交互。
  - **View (`src/views/`)**：纯视图层，负责 UI 渲染与用户事件绑定，实现 APP 端与 PC 端的高保真呈现与逻辑联动。
- **高保真多端体验**：
  - **APP 移动端**：模拟真实移动端视口、底部多功能栏、语音消息转换、群聊与私聊无缝切换。
  - **PC 桌面端**：多端互通、聊天记录高级条件筛选、消息免打扰/置顶、提醒跟踪、群成员管理等专业协同功能。
- **开箱即用**：包含完整 TypeScript 源码及优化打包构建产物（`dist/`）。

---

## 📁 目录结构

```text
DianIM-view/
├── dist/                   # 生产打包编译产物 (可直接部署)
│   ├── assets/             # 编译生成的 CSS / JS 静态资源
│   └── index.html          # 打包产物入口页面
├── src/
│   ├── models/             # 数据模型与状态层
│   ├── presenters/         # 业务逻辑与控制器层
│   ├── views/              # APP端、PC端、门户端视图层
│   ├── components/         # 基础公共组件
│   ├── types/              # TypeScript 核心类型定义
│   ├── App.tsx             # 顶层多端路由调度
│   └── main.tsx            # 应用启动入口
├── package.json            # 依赖与脚本配置
├── vite.config.ts          # Vite 构建配置
└── tsconfig.json           # TypeScript 配置
```

---

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动本地开发服务

```bash
npm run dev
```

启动后可在浏览器中访问 `http://localhost:3000` 体验统一门户及多端联动。

### 3. 项目打包构建

```bash
npm run build
```

打包完成后，产物输出至 `dist/` 目录。
