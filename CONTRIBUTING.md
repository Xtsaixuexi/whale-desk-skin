# 贡献指南

感谢帮这张小书桌变得更舒服。

1. 保留 DSH 的原生布局、文字与交互语义；视觉修改不要改变权限、发送或任务状态。
2. 优先修改 `skins/whale-desk/DESK-OVERRIDES.css`，然后运行 `node scripts/sync-overrides.mjs` 同步到真正加载的 `patches.css`。个人 DIY 用配置器，不直接改基线样式。
3. 新增素材要更新 `ARTWORK.json`、NOTICE 和相应许可；保留所有上游署名。
4. 运行 `node --test tests/configure.test.mjs` 和 `node scripts/check-release.mjs`。
5. 如修改界面，记录浅色／深色和宽／窄窗口测试。截图需去除个人信息；静态样例明确标注。

提交说明写清楚：哪个页面有什么问题、改动后的表现、实际验证过哪些操作、还有什么未测。不要把源代码覆盖写成实机兼容认证。

本仓库不接收会话数据库、账户配置、宠物私有包、访问令牌或自选私人照片。个人配置与备份已加入忽略规则。
