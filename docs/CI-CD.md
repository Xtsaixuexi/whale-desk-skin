# 自动检查与安装候选包

更新于 2026-11-17。[查看 Actions](https://github.com/Xtsaixuexi/whale-desk-skin/actions/workflows/check.yml)。

## 每次更新会做什么

主分支推送、Pull Request 和手动 Run workflow 都会触发同一流水线。

| 作业 | 内容 | 失败后 |
| --- | --- | --- |
| Files and tools · Ubuntu / Windows | 11 项配置工具测试；引用、素材哈希、预览清单、默认包检查 | 阻止生成候选包 |
| Chromium regression | 锁定 Playwright 版本，运行 44 项隔离浏览器回归 | 保存 JSON 报告和失败截图，阻止生成候选包 |
| Verified installation candidate | 从 Git 跟踪文件打包，检查包内引用、CRC 与逐文件字节一致性 | 不上传不完整安装包 |

浏览器测试使用项目自己的虚构数据页面，不操作用户账号、不调用模型。
它不能替代 DSH 原生浅深色截图、桌宠测试、跨设备或授权审核。
历史上 Skin Center 0.4.8 / 0.4.16 的转换回归仍属本地记录；本次云端浏览器作业只检查源 CSS。

## 下载检查结果

打开 Actions → 对应提交的运行记录 → Artifacts：

- `browser-report-提交号`：JSON 结果；有测试断言失败时另附截图。
- `whale-desk-candidate-提交号`：安装 ZIP、`package-manifest.json` 和 `SHA256SUMS.txt`。

Artifacts 保留 14 天，下载需要登录 GitHub。安装 ZIP 解压后得到 `whale-desk` 目录，按[安装说明](../INSTALL.md)放入 DSH 皮肤目录。

候选包保留运行 CSS、素材、字体、预览（含最新原生聊天图）、许可、来源表和中英文说明；不包含开发用 `DESK-OVERRIDES.css`、测试文档、`validation/`、历史聊天证据、配置器或独立 companion 应用。
说明中指向测试文档的链接会改为对应提交的源码链接。包内 CSS 与素材保持原字节。

`package-manifest.json` 记录来源提交、是否存在本地未提交修改、每个文件及 ZIP 的 SHA-256。
打包后重新读取 ZIP 核验所有条目，遇到缺失资源、符号链接或包外引用会失败。

## 本地运行

需要 Node.js 22、Python 3.12 和 Git。在仓库根目录执行：

```sh
npm ci --ignore-scripts
npm test
npm run check
npx --no-install playwright install chromium
npm run test:browser
npm run package:skin
```

安装包输出到 `dist/`。如需把浏览器报告另存到临时目录，设置环境变量 `BROWSER_REPORT_DIR=artifacts/browser`；未设置时沿用项目的本地证据路径。
不要把 `workingTreeDirty: true` 的本地产物当成对应提交的精确构建。

## CI 通过与市场收录

这条流水线生成可下载的安装候选包，不自动发布 GitHub Release、不打版本标签，也不自动重新打开或合并市场 PR。
运行权限为 `contents: read`，不需要新增令牌；后续任务以检查成功为前提。

截至 2026-11-17，市场 #106 已关闭，维护者要求角色许可依据及最新干净实机截图。
市场旧 CI 运行 `42482206767` 显示失败，但返回零作业、零检查项，没有代码测试失败日志；不能据此声称测试已经执行。
作者授权声明与维护责任见 [NOTICE](../skins/whale-desk/NOTICE)，相关核验事项由作者直接与维护者对接。
完整记录见[投稿状态](MARKET-SUBMISSION.md)。
