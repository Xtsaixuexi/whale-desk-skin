# 预览生成与校验

展示范围：6 张全界面、40 类组件的浅深两色共 80 张、14 张配图，共 100 张。所有预览带有静态示例标识。渲染器仅加载本仓库文件，不连接 DSH、不调用模型、不读取真实账户或浏览器个人资料。

## 复现

需要 Node.js 22+、Playwright 和 Chromium。将 Playwright 安装在独立工具目录，避免把依赖混入皮肤包；设置 `PLAYWRIGHT_MODULE_PATH` 指向该目录的 `node_modules`。使用自备浏览器时，设置 `PLAYWRIGHT_CHROMIUM_EXECUTABLE` 指向 Chromium 或 Chrome。未设置时使用 Playwright 默认 Chromium。

```sh
node scripts/render-previews.mjs
node scripts/build-gallery.mjs
node scripts/check-release.mjs
```

可先运行 `node scripts/render-previews.mjs --sample` 检查首页与输入区样张。完整生成成功后才更新清单。不同浏览器或系统的字体栅格化可能改变 PNG 哈希；清单记录本次生成的实际文件。

`scripts/preview-scenes.mjs` 定义 40 个虚构界面片段，`scripts/preview-layout.css` 只补充文档宿主布局。皮肤的 `skin.css` 与 `patches.css` 提供实际主题样式。部分示例布局和图标为文档替代物，不承诺精确还原宿主 DOM。

`docs/artwork` 从现有 SVG 中提取原始 PNG 像素，首页直接复制当前水彩书桌。继承插画没有重新绘制。图片来源、尺寸、SHA-256 见 [PREVIEW-MANIFEST.json](PREVIEW-MANIFEST.json)。

## 与上游展示范围对照

基线为 [上游固定提交 e6882040](https://github.com/Alphazerolan/diy-journal-skin/tree/e68820404ee7183b0f9b15d7dd444b9f48e03071)。

| 栏目 | 上游 | 本项目 |
| --- | --- | --- |
| 全界面展示 | 6 张 | 6 张静态预览 |
| 组件类别 | 40 类 | 同名 40 类 |
| 组件图片 | 76 张 | 80 张，全部含浅深两色 |
| 独立配图 | 14 张 | 14 张 |

额外深色预览为 `open-in-app`、`permission-picker`、`session-menu`、`view-options`。这一对照仅涉及文档图片覆盖；原生行为、设置插件和桌宠差异仍以 [PARITY.md](PARITY.md) 为准。
