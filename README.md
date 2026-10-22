# 鲸伴 · 水彩小书桌

**Whale Desk — 一盏暖灯，一张小书桌，陪你探索未至之境。**

为 DeepSeek Harness（DSH）设计的奶油暖木、水彩鲸鱼娘主题。保留原来的侧栏、对话区和工作台布局，把手账装订、胶带与撕纸换成温柔的木沿、陶瓷卡片与水彩花饰。

[English](README.en.md) · [完整使用手册](docs/USER-GUIDE.md) · [安装与更新](INSTALL.md) · [DIY 配置](docs/CUSTOMIZATION.md) · [常见问题](docs/FAQ.md) · [全部文档](docs/README.md)

## 从这里开始

| 你想做什么 | 直接阅读 |
| --- | --- |
| 第一次用，想知道安装和使用的全过程 | [新手使用手册](docs/USER-GUIDE.md) |
| 看看每个页面是什么样 | [100 张完整图册](docs/COMPONENTS.md) |
| 按步骤安装、升级或恢复旧版本 | [安装与恢复](INSTALL.md) |
| 调颜色、字体、输入框，替换 14 个位置的图片 | [DIY 参数与实例](docs/CUSTOMIZATION.md) |
| 装不出来、改了没变化、配置报错 | [常见问题与排查](docs/FAQ.md) |
| 了解和原项目的差异、哪些仍未测 | [功能对照](docs/PARITY.md) · [测试记录](docs/TESTING.md) |

**第一次 DIY 建议从小改动开始：** 先调整输入框宽度和顶栏题字，导出 JSON 后应用到皮肤。这里的网页编辑、导出配置、应用命令和 DSH 启用是四个步骤，手册都有对应的操作与完成标志。

![鲸伴 · 日光首页静态预览](evidence/whale-desk-light.png)

*使用随包皮肤 CSS 和虚构数据渲染的静态界面预览，不是 DSH 实机截图。完整交互测试范围见 [测试状态](docs/TESTING.md)。*

## 完整效果展示

### 晚灯 · 深色首页

![深色首页静态预览](evidence/whale-desk-dark.png)

### 对话与代码

| 日光 · 浅色 | 晚灯 · 深色 |
| --- | --- |
| ![浅色对话](evidence/whale-desk-messages-light.png) | ![深色对话](evidence/whale-desk-messages-dark.png) |

### 设置与用量

| 日光 · 浅色 | 晚灯 · 深色 |
| --- | --- |
| ![浅色设置](evidence/whale-desk-settings-light.png) | ![深色设置](evidence/whale-desk-settings-dark.png) |

**不止一张图：** [完整组件图册](docs/COMPONENTS.md) 包含 **40 类组件、80 张浅深色预览和 14 张独立配图**。加上上述 6 张界面预览，共 100 张展示图片。下载仓库后也可以打开 [离线画廊](docs/gallery.html)，按主题与栏目筛选。

组件覆盖新会话、工作区、会话状态、账户、输入框、模型菜单、消息、代码、文件、任务看板、自动化、问答、待办、子智能体、远程访问和设置等。展示栏目按原项目逐项对齐；[查看图片对照与生成说明](docs/PREVIEWS.md)。

## 让工作台像一个有人陪伴的角落

- **奶油暖木**：米白底色、浅木边框、柔和阴影，内容区域保留清晰的阅读底色。
- **水彩鲸鱼娘**：保留蓝发、鲸鱼玩偶和熟悉的角色元素，配上针织衫、雏菊与暖灯。
- **紫粉柔字**：正文使用霞鹜文楷，欢迎标题用龙藏体；代码区域保留等宽字体。
- **完整工作台材质**：首页、侧栏、输入区、消息、菜单、设置及任务面板延续同一配色。
- **适度留白**：输入区默认最大宽度 760 px，顶栏增加“让灵感，慢慢发芽”与水彩小摆件。
- **可继续 DIY**：离线配置器可以调整配色、字号、输入框宽度、顶栏题字，并逐区更换或隐藏配图。

## 安装

[下载 v1.1.1 预发布版](https://github.com/Xtsaixuexi/whale-desk-skin/releases/tag/v1.1.1)：仅安装请选择 `whale-desk-1.1.1.zip`；完整仓库包另含 DIY 工具和文档。

**获取最新完整图册：** [下载当前仓库 ZIP](https://github.com/Xtsaixuexi/whale-desk-skin/archive/refs/heads/main.zip)。图册在 v1.1.1 首次发布后补充；该版本 Release 中的旧仓库 ZIP 保留原样，最新图片请下载这里。

1. 下载并解压仓库，把 **`skins/whale-desk` 文件夹**复制到 DSH 数据目录下的 `skins` 中。
2. 默认路径为 Windows 的 `%USERPROFILE%\.dsh\skins\whale-desk`；自定义数据目录以 `DSH_HOME` 为准。
3. 在 DSH 的“设置 → 皮肤”选择 **鲸伴 · 水彩小书桌 / Whale Desk**。列表未更新时重新启动 DSH。

使用皮肤无需 Python、Node.js 或构建。离线 DIY 配置器可用浏览器打开；将导出的配置应用到皮肤时需要 Node.js 22 或更新版本。详细步骤见 [INSTALL.md](INSTALL.md)。

## 包含哪些内容

| 区域 | 适配内容 |
| --- | --- |
| 首页与导航 | 品牌字标、欢迎标题、水彩顶栏、工作区、会话列表、账户与用量卡 |
| 输入与阅读 | 收窄的输入托盘、工作区与模型控件、用户消息、助手回复、代码块和交付文件 |
| 任务与工具 | 任务看板、自动化、待办、子智能体列表、插件管理、右侧工作区入口 |
| 菜单与弹窗 | 模型、添加与指令、会话菜单、统计浮层、问答与通用面板的样式 |
| 设置配图 | 账号、通用、模型、插件、预设、归档、Web 插件、皮肤、宠物、工坊、使用统计 |
| 主题与可访问性 | 浅色／深色配色、键盘焦点、窄屏规则；部分组件保留上游装饰 |

以上是**代码与素材覆盖范围**，不代表所有页面、宿主版本及交互已经通过实机测试。1.1.0 已确认加载、顶栏、字标、输入区比例和使用统计页面；1.1.1 增加配置与发布配套，仍需完整实机回归。

## 和 DIY 手账本是什么关系

本项目基于 [Alphazerolan/diy-journal-skin](https://github.com/Alphazerolan/diy-journal-skin) **1.14.1** 制作，保留其组件样式基础和 14 张配图的来源记录。首页换用新生成的书桌背景，其余 13 个插画位置保留原图并调整外框。水彩花饰为新增素材。

这是一套独立皮肤，使用独立的 `whale-desk` ID。原项目的文件、字体许可与作者署名保留。

**没有打包的东西：**

- **独立桌宠包**：原皮肤仓库也没有桌宠动画包。宠物设置插画不等于可移动桌宠；本机已安装的宠物由 DSH 自己管理。
- **原作者的设置插件**：它是另一个仓库，并且写入 `diy-journal`。本项目提供自己的离线配置器；不提供原插件的双照片拼贴、胶带编辑或 DSH 内嵌设置入口。
- **受信任的动态钩子**：默认只用 CSS 与宿主可见状态。已有小飞机的原生状态选择器保留；需要脚本推断的额外状态不承诺生效，不修改宿主信任机制。

逐项差异见 [功能对照](docs/PARITY.md)。

## 自己做下一版

双击 [tools/editor.html](tools/editor.html)，选择配色、宽度与各区域图片，导出配置 JSON。然后在仓库目录执行：

```sh
node scripts/configure.mjs --config /path/to/whale-desk.config.json
```

工具默认更新本仓库的皮肤，也可通过 `--skin` 指定已安装副本，并自动备份上一次样式与配置。编辑器不联网、不读取 DSH 会话，也不会上传所选图片。个性化配置和备份默认由 Git 忽略。更多操作见 [DIY 配置说明](docs/CUSTOMIZATION.md)。

不想从空白开始，可以导入 [紧凑书写](docs/examples/compact-writing.json)、[安静阅读](docs/examples/quiet-reading.json) 或 [默认参数](docs/examples/defaults.json)。示例按整套配置应用，未填写项回到默认值；试用前请先导出自己的改稿。

`check-release.mjs` 是公开默认包的发布检查，会拒绝带个人 DIY 段的 CSS；它不属于个人配置成功后必须执行的步骤。准备公开发布时，先保存个人配置，再恢复默认并检查。

## 仓库里每个文件夹有什么

| 路径 | 用途 |
| --- | --- |
| `skins/whale-desk` | 安装到 DSH 的皮肤本体，图片、字体与样式都在这里 |
| `tools` | 在本机浏览器打开的离线配置器 |
| `scripts` | 配置应用、样式同步、预览生成与发布检查工具 |
| `docs` | 完整手册、DIY 参数、FAQ、对照说明、组件图册和示例 JSON |
| `docs/components` / `docs/artwork` | 80 张组件预览 / 14 张独立配图 |
| `evidence` | 6 张带静态示例标识的完整界面预览 |
| `tests` / `.github` | 配置验证、自动检查与问题模板 |

只使用皮肤时复制 `skins/whale-desk` 即可；准备 DIY 或查阅最新说明时保留完整仓库。[文档索引](docs/README.md) 按使用阶段整理了所有入口。

## 兼容性与已知限制

- 格式：DSH Skin v2；已观察环境：Windows、DSH `0.2.1-rc.2`、Skin Center `0.4.8`。
- 部分选择器依赖 DSH 当前组件类名，应用更新后可能需要调整。
- 深色样式与图片遮罩已提供，完整深色实机回归尚未完成。
- 远程访问和权限面板只适配外观，不增加权限、不启动服务。
- 桌宠显示已观察到，拖动、菜单及动作切换尚未完成测试。

## 来源与许可

代码与文档沿用 [MIT 许可](LICENSE)，保留 Alphazerolan 版权声明。字体为 SIL OFL 1.1，详见皮肤内的许可文件。

随附插画和角色画面仅限个人非商业使用；角色、字体与品牌权利仍归相应权利人。本项目为非官方二创，不代表 DeepSeek 官方授权。角色署名依据上游公开记录保留，角色再分发授权尚未独立核实。详见 [NOTICE](skins/whale-desk/NOTICE)、[素材范围](LICENSE-ARTWORK) 与 [逐图来源](skins/whale-desk/ARTWORK.json)。

[更新记录](CHANGELOG.md) · [贡献指南](CONTRIBUTING.md) · [发布准备](docs/RELEASING.md)
