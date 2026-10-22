# 安装、更新与恢复

[返回首页](README.md) · [完整使用手册](docs/USER-GUIDE.md) · [DIY 配置](docs/CUSTOMIZATION.md) · [故障排查](docs/FAQ.md)

## 选择下载内容

| 下载内容 | 适合谁 | 包含什么 |
| --- | --- | --- |
| [最新完整仓库 ZIP](https://github.com/Xtsaixuexi/whale-desk-skin/archive/refs/heads/main.zip) | 初次使用、准备 DIY、需要最新说明书 | 皮肤、配置器、脚本、测试、完整图册与文档 |
| [v1.1.1 Release](https://github.com/Xtsaixuexi/whale-desk-skin/releases/tag/v1.1.1) 中的 `whale-desk-1.1.1.zip` | 只安装该版本皮肤 | 皮肤安装资源 |
| 同一 Release 中的 `whale-desk-github-1.1.1.zip` | 需要首次发布时的仓库快照 | 首次发布的工具与文档；不含后来补充的图册和说明书 |

**希望拿到最新文档，请下载第一项。** 已发布 Release 文件保留历史原样，文档更新不代表安装包版本发生变化。

皮肤本身不需要 Node.js、Python 或编译。只有“将导出的 DIY JSON 应用到皮肤”需要 Node.js 22+；阅读文档、查看图片和打开离线配置器不需要它。

## 第一步：解压并确认皮肤目录

先把 ZIP 完整解压。不要在压缩包预览窗口内直接打开配置器，也不要只下载 README 里的背景图。

完整仓库中找到 `skins/whale-desk`。安装用的文件夹里面应直接有这些内容：

```text
whale-desk/
├── skin.json                 皮肤 ID、名称与版本
├── skin.css                  基础主题
├── patches.css               DSH 实际加载的适配样式
├── DESK-OVERRIDES.css         维护者编辑的末尾覆盖层
├── assets/                   图片、图标、字体与字体许可
├── preview/                  皮肤列表使用的预览素材
├── NOTICE                    署名和使用说明
└── ARTWORK.json               素材来源与哈希记录
```

完整仓库外层还会有 `docs`、`tools` 和 `scripts`。这些供阅读、DIY 或维护使用，不必复制进 DSH 皮肤目录。仅安装包的外层结构可能不同，以找到直接包含 `skin.json` 的 `whale-desk` 文件夹为准。

## 第二步：放进正确的 DSH 数据目录

默认位置：

```text
Windows: %USERPROFILE%\.dsh\skins\whale-desk
其他系统: ~/.dsh/skins/whale-desk（尚未实机验证）
自定义数据目录: $DSH_HOME/skins/whale-desk
```

Windows 下可在文件资源管理器地址栏输入 `%USERPROFILE%\.dsh`。如果你安装时指定了其他数据目录，应使用实际的 `DSH_HOME`，不能仅凭默认路径判断。

1. 若目标里已有 `whale-desk`，先将它完整复制到其他备份位置。
2. 在正确数据目录内找到或建立 `skins` 文件夹。
3. 将解压出来的 `whale-desk` 整个文件夹放入 `skins`。
4. 确认最终文件为 `skins/whale-desk/skin.json`。

常见的错误是多套一层目录，例如 `skins/whale-desk/whale-desk/skin.json`，或把整个仓库外层 `whale-desk-skin-main` 直接当作皮肤安装。目录名应保持 `whale-desk`，与 manifest 的 ID 一致。

## 第三步：选择并确认生效

在 DSH 的“设置 → 皮肤”中选择 **鲸伴 · 水彩小书桌 / Whale Desk**。列表没有更新时，完全退出并重新打开 DSH，再检查一次。

首次安装可以按顺序观察：

| 检查位置 | 预期看到什么 |
| --- | --- |
| 皮肤列表 | 能识别鲸伴名称 |
| 新会话首页 | 奶油书桌、水彩鲸鱼娘与鲸鱼玩偶 |
| 顶栏 | “让灵感，慢慢发芽”与水彩摆件，窄窗口可能省略部分内容 |
| 输入区 | 木沿卡片、柔紫文字，默认最大宽度 760 px |
| 设置页 | 奶油面板与相应配图 |

检查外观不需要发送测试消息或消耗模型额度。若只有一部分变化，先按 [FAQ](docs/FAQ.md) 检查复制范围和宿主版本；不要连续覆盖未知目录。

## 更新并保留 DIY

1. 记下当前皮肤版本，在 `skin.json` 中可查看 `version`。
2. 备份已安装的整个 `whale-desk` 文件夹，存放到 DSH 数据目录之外。
3. 保存自己导出的配置 JSON。应用工具也会在目标皮肤内写入 `whale-desk.config.json`，有改稿时一并保存。
4. 下载并解压新仓库。需要保留 DIY 时，先在新仓库应用旧 JSON；[具体命令](docs/CUSTOMIZATION.md#应用到皮肤)。
5. 复制新生成的皮肤到安装位置，重新选择皮肤并检查；必要时重启 DSH。

不要直接用旧的整份 `patches.css` 覆盖新版来“保留 DIY”，这样会同时把新版的修复换回旧代码。重新应用 JSON 能保留当前配置工具支持的参数；你手写过的 CSS 仍需单独迁移。

## 恢复的三种情况

| 你要恢复什么 | 正确方法 |
| --- | --- |
| 当前版本的默认外观 | 对实际目标目录执行 `--reset` |
| 以前保存的一套 DIY | 重新应用那一份配置 JSON |
| 更新前的整个皮肤版本 | 将完整文件夹备份恢复到安装位置 |

恢复仓库内的皮肤默认值，在仓库根目录运行：

```powershell
node scripts/configure.mjs --reset
```

恢复 Windows 默认位置的已安装皮肤，在同一仓库根目录运行：

```powershell
node scripts/configure.mjs --reset --skin "$env:USERPROFILE\.dsh\skins\whale-desk"
```

若你使用自定义数据目录，替换 `--skin` 后的路径。该命令先备份，随后移除个人 DIY 覆盖段并写入默认配置。它不会恢复被手工删掉的素材，也不会回退皮肤版本。若只有安装包而没有 `scripts` 目录，可通过恢复完整备份来回退，或另行下载完整仓库使用工具。

## 卸载

先在 DSH 切换到其他皮肤。保存需要保留的配置和备份后，只移除 `skins/whale-desk` 文件夹。不要删除整个 `.dsh` 数据目录；会话、账户和宠物也不属于本皮肤的卸载范围。

## 桌宠与功能插件

皮肤不会安装、切换或卸载桌宠。“宠物设置插画”只是设置页面的配图。任务看板、Git graph、自动化、远程访问等依赖宿主或对应插件，皮肤只调整它们已有界面的外观。更多区分见 [使用手册](docs/USER-GUIDE.md#桌宠插件与皮肤)。

## 兼容性说明

已观察环境为 Windows、DSH `0.2.1-rc.2`、Skin Center `0.4.8`。这是观察记录，不是宣称其他版本不能用，也不是承诺所有功能已测。当前皮肤为 1.1.1，完整原生回归仍待完成；深色对比度待修项见 [测试状态](docs/TESTING.md)。
