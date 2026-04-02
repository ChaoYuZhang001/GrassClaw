# GrassClaw

> 草台班子版超级龙虾 —— 敢玩敢教敢翻车

GrassClaw 是一个跨平台 Agent 外壳与控制台工程，目标是把“本地满血 + 云端可控 + 人机共创 + 草台人格”做成一套真正能安装、能发布、能继续扩展的代码库。

## 这份仓库包含什么

- Web / PWA 控制台：浏览器、iPad、桌面浏览器直接可用
- Tauri 2 原生外壳：同一套前端承接 Windows / macOS / iOS / Android
- 草台核心域模型：信任滑块、情绪系统、接管录制、Skill 导入导出、本地持久化
- Gateway 客户端抽象：先支持 mock / HTTP ping / pairing，后续替换成真实网关协议
- 纯 Node 脚本链路：不依赖额外前端框架也能启动、构建、测试

## 快速开始

```bash
npm run dev:web
```

打开：

```text
http://localhost:4173/apps/web/
```

测试与构建：

```bash
npm test
npm run build:web
```

## 打包路线

- 浏览器 / iPad：直接部署 `dist/apps/web`
- Windows / macOS / iOS / Android：使用 `apps/desktop/src-tauri` 继续打包

详见：

- `docs/platform-strategy.md`
- `docs/release-checklist.md`
- `docs/github-publish.md`

## 当前功能

- 信任滑块与行为等级
- 情绪值与 5 种情绪状态
- 草台接管 Start / Stop / Record / Save as Skill
- Skill 导入 / 导出 / 删除 / 本地持久化
- Gateway mock / ping / pairing 基础流程
- PWA manifest 与 service worker
- Tauri 2 壳工程与能力文件
- Node 原生测试

## 许可

MIT
