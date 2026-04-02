# Release Checklist

## Web / PWA

- [ ] 更新版本号
- [ ] 跑 `npm test`
- [ ] 跑 `npm run build:web`
- [ ] 检查 manifest、icon、service-worker 缓存版本
- [ ] 部署 `dist/apps/web`

## Desktop / Mobile

- [ ] 设置正式 bundle identifier
- [ ] 替换品牌图标与启动图
- [ ] 安装 Rust / Tauri CLI / Android Studio / Xcode
- [ ] 执行 `npm run tauri:build`
- [ ] 配置签名证书
