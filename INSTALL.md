# 安装、更新与恢复

## 皮肤安装

下载仓库 ZIP 并解压，找到 `skins/whale-desk`，只复制这个文件夹。

默认位置：

```text
Windows: %USERPROFILE%\.dsh\skins\whale-desk
其他系统: ~/.dsh/skins/whale-desk（尚未实机验证）
自定义:  $DSH_HOME/skins/whale-desk
```

完成后的目录结构：

```text
whale-desk/
├── skin.json
├── skin.css
├── patches.css
├── DESK-OVERRIDES.css
├── assets/
├── preview/
├── NOTICE
└── ARTWORK.json
```

在 DSH“设置 → 皮肤”选择“鲸伴 · 水彩小书桌 / Whale Desk”。目录名必须是 `whale-desk`，与 `skin.json` 的 ID 一致。若没出现，完全退出并重新打开 DSH 后检查。

## 更新

1. 把已有的 `whale-desk` 整个文件夹复制到另一个备份位置。
2. 如果做过 DIY，单独保存 `whale-desk.config.json`，该文件含自选图片数据。
3. 用新发布的 `skins/whale-desk` 替换旧皮肤文件。
4. 如需保留 DIY，在新仓库运行配置工具重新应用保存的 JSON，再安装生成后的皮肤。
5. 在 DSH 重新选择皮肤，必要时重启。

不要把本仓库的默认包直接覆盖唯一的个人改稿。备份和个人配置不应上传到公开仓库。

## 桌宠和插件

皮肤包不会安装或切换桌宠。已有桌宠继续使用 DSH 自己的宠物设置；“设置 → 宠物”里的配图只是装饰。任务看板、Git graph、自动化、远程访问等能力依赖相应宿主功能或插件，皮肤只覆盖它们的显示。

原作者的 DIY Journal 设置插件只修改 `diy-journal`。编辑本皮肤请使用本仓库的离线配置器，见 [DIY 说明](docs/CUSTOMIZATION.md)。

## 排查

| 现象 | 检查方法 |
| --- | --- |
| 列表没有皮肤 | 检查是否套了两层 `whale-desk`，以及自定义 DSH 数据目录 |
| 图片或字体丢失 | 完整复制 `assets`；运行发布检查核对文件引用 |
| 更新后没变化 | 重新选择皮肤；彻底退出并重开 DSH |
| 字体仍是系统字体 | 检查字体文件及宿主加载状态；代码区域本来就保留等宽字体 |
| 桌宠没变化 | 宠物是独立资源，皮肤不会替换它 |
| 某个运行状态仍显示原生图标 | 本地 CSS 不能推断所有内部运行状态，脚本增强未注册 |
| 升级 DSH 后布局错位 | 记录 DSH、Skin Center 和皮肤版本，附去除个人信息的截图 |
| DIY 后看不清字 | 用配置器恢复默认配色；发布检查会检查配置的正文和强调色对比度 |

## 恢复与卸载

恢复：把更新前备份复制回原位置，重新选用皮肤。配置器有独立“恢复默认”导出功能；命令行也可运行 `node scripts/configure.mjs --reset`，该操作先备份、再移除 DIY 覆盖段。

卸载：先在 DSH 切换其他皮肤，再移除 `whale-desk` 文件夹。不要删除 `.dsh`、会话或宠物目录。
