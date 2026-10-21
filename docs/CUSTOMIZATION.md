# 把小书桌变成自己的

## 离线配置器

双击仓库里的 [tools/editor.html](../tools/editor.html)。它是普通的离线 HTML，不安装插件，也不会连接 DSH 或网络。

可以调整：

- 浅色与深色的正文、次要文字、强调色、底色、柔色、边线和木沿。
- 输入区最大宽度（560–1100 px）、输入文字字号（14–20 px）。
- 文楷或系统字体、顶栏题字、水彩小摆件显示。
- 首页、11 个设置内容页、设置左栏、主侧栏的默认图片／自选单图／不显示。

界面里的预览是配色和素材示意，不是正在运行的 DSH。导入配置时会恢复选项；导出 JSON 才会保存，关闭网页不会自动保存。

## 应用

需要 Node.js 22 或更新版本。皮肤本身不需要 Node。

1. 在配置器中导出 `whale-desk.config.json`，记下下载位置。
2. 打开终端，进入仓库目录并运行（替换配置路径）：

```sh
node scripts/configure.mjs --config /path/to/whale-desk.config.json
```

默认更新仓库中的 `skins/whale-desk`。把生成后的整个皮肤文件夹复制到 DSH 皮肤目录，然后重新选择皮肤。

也可明确指定已安装皮肤位置，例如 PowerShell：

```powershell
node scripts/configure.mjs --config "$env:USERPROFILE\Downloads\whale-desk.config.json" --skin "$env:USERPROFILE\.dsh\skins\whale-desk"
```

命令会验证目录名及 manifest ID，只改 `patches.css` 末尾标记段和个人配置文件；旧文件保存到皮肤内 `.whale-desk-backups`。不会修改宿主程序、账号、宠物或会话。

## 恢复

```sh
node scripts/configure.mjs --reset
```

这会备份并移除个人覆盖段，恢复当前版本的默认样式。也可以在配置器里恢复默认并重新导出应用。要还原某次旧配置，重新应用备份的 JSON。

## 图片和发布

图片只接受 PNG、JPEG、WebP，建议每张不超过 8 MB。图片以内嵌数据保存在导出的 JSON 及应用后的 CSS 中。**应用后不要直接把含私人图片的 `patches.css` 上传 GitHub。** 配置文件和备份已忽略，但 CSS 是发布文件；发布检查会拒绝带个人 DIY 段的包。先保存个人配置，再执行 `--reset` 后发布。

此配置器是单图和主题参数编辑器，不含上游独立插件的双图层叠、胶带编辑、图片旋转／拖拽和 DSH 内嵌菜单。不要用原插件直接修改 `whale-desk`；它原本面向 `diy-journal`。

## 维护者修改

`DESK-OVERRIDES.css` 是覆盖层源文件；DSH 实际加载的是 `patches.css`。修改前者后运行：

```sh
node scripts/sync-overrides.mjs
node --test tests/configure.test.mjs
node scripts/check-release.mjs
```

新增版本仍应在实际 DSH 中验证；本地检查不能证明宿主的每个选择器都命中。
