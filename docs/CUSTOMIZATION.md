# DIY 配置详解

[返回首页](../README.md) · [使用手册](USER-GUIDE.md) · [安装与恢复](../INSTALL.md) · [常见问题](FAQ.md)

配置器用于调整现有皮肤的配色、输入区、顶栏题字和 14 个配图位置。它不会连接 DSH、修改会话或调用模型，也不直接写入已安装的皮肤；网页负责编辑与导出，命令行负责应用。

## 打开并保存配置

完整解压仓库后，用浏览器打开 [tools/editor.html](../tools/editor.html)。保留相邻的 `editor.css`、`editor.js`、`config-core.js` 及上一级的 `skins` 目录，不要单独复制一个 HTML 文件。

| 按钮 | 做什么 | 是否立即改变 DSH |
| --- | --- | --- |
| 导入配置 | 从 JSON 恢复编辑选项与自选图片 | 否 |
| 恢复默认 | 将当前网页中的所有选项重置 | 否，还需导出和应用 |
| 导出配置 | 保存 `whale-desk.config.json` | 否，还需执行应用命令 |
| 默认图片 | 恢复当前选中位置的默认素材 | 否 |
| 不放图片 | 隐藏当前选中位置的配图 | 否 |

关闭页面不会自动保存。浏览器如果把重复下载重命名为带编号的 JSON，请在应用命令中使用实际文件名，避免误用旧文件。

## 参数与影响范围

| 页面字段 | JSON 字段 | 默认值与范围 | 影响范围 |
| --- | --- | --- | --- |
| 输入框最大宽度 | `composerWidth` | 默认 760；560–1100 整数 px；网页滑块步长 10 | 主输入区的最大宽度；小窗口仍受可用空间约束 |
| 输入字号 | `fontSize` | 默认 16；14–20 整数 px | 输入区域文字，不是全界面统一缩放 |
| 顶栏题字 | `motto` | 默认“让灵感，慢慢发芽”；最多 24 个字符，可为空，不可含换行等控制字符 | 顶栏小句子，不改变“探索未至之境”标题 |
| 界面字体 | `font` | `wenkai` 或 `system` | 覆盖配置工具所支持的界面区域；艺术标题、代码并非统一替换 |
| 显示水彩小摆件 | `decorations` | `true` / `false`，默认开启 | 顶栏和输入托盘的小摆件，不会隐藏首页角色和所有设置插画 |
| 日光／晚灯 | `light` / `dark` | 各自一组七种颜色 | 编辑两套配色；不会切换 DSH 当前主题 |

编辑器的题字输入框还受浏览器 `maxlength` 限制，某些 emoji 可能占用多个字符位置；题字以短句为宜。窗口较窄时题字可能被省略号截断。

## 七种颜色如何配

| 名称 | 字段 | 浅色默认 | 深色默认 | 用途 |
| --- | --- | --- | --- | --- |
| 正文 | `ink` | `#704b6d` | `#f1ddea` | 主要文字 |
| 次要文字 | `muted` | `#80667d` | `#d0b6c8` | 说明、辅助信息 |
| 紫粉强调 | `accent` | `#935b88` | `#ddb2cf` | 强调文字与视觉重点 |
| 奶油底色 | `paper` | `#fffaf4` | `#302733` | 卡片基础底色 |
| 柔和衬色 | `soft` | `#f7eaf2` | `#483447` | 选中态和衬底 |
| 边线 | `line` | `#e1c9d7` | `#70556b` | 细边框与分隔 |
| 木沿 | `wood` | `#e8c8a9` | `#6c5148` | 托盘及木沿装饰 |

建议先保留正文和底色，只小幅调整衬色、边线、木沿；再改强调色。正文、次要文字、强调色与 `paper` 的对比度均须至少 4.5:1，工具会在导出和应用前验证。这个检查只覆盖这些指定色对，不等于所有插画、状态和叠加背景都通过可访问性测试。

出现对比度提示时，浅色方案通常需要加深文字或提亮底色；深色方案通常需要提亮文字或压暗底色。两套方案都会校验，只修改当前可见的一套不一定能消除另一套的错误。

## 图片位置速查

选择“位置”后再点“换一张图片”“默认图片”或“不放图片”；操作只针对当前选中的位置。

| 位置 | JSON 键 | 用途 |
| --- | --- | --- |
| 首页背景 | `home` | 书桌、鲸鱼娘与玩偶所在的整张背景 |
| 账号与余额 | `account` | 对应设置内容页 |
| 通用设置 | `general` | 对应设置内容页 |
| 模型 | `models` | 对应设置内容页 |
| 内置插件 | `plugins` | 对应设置内容页 |
| Agent 预设 | `presets` | 对应设置内容页 |
| 已归档会话 | `archive` | 对应设置内容页 |
| Web 插件 | `web` | 对应设置内容页 |
| 皮肤 | `skins` | 对应设置内容页 |
| 宠物设置插画 | `pets` | 静态设置插画，不是桌宠动画 |
| 创意工坊 | `workshop` | 对应设置内容页 |
| 使用统计 | `usage` | 对应设置内容页 |
| 设置左栏 | `settings-sidebar` | 设置导航下方的小角色 |
| 主侧栏 | `main-sidebar` | 主窗口侧栏下方的小插画 |

当前参数模型为每个位置一张图，浅深色共用这张素材；首页深色显示时额外叠加遮罩。工具没有为同一位置分别设置两张主题图片的字段。

### 准备什么样的图片

- 网页接受 PNG、JPEG、WebP，每张最多 8 MB；不接受 SVG、GIF、视频、图片网址或本地文件路径字符串。
- 当前默认首页素材为 1536 × 1024。DIY 时可从相近比例开始，给中央标题与输入区留空；窗口比例改变时，实际可见范围和形变以宿主渲染为准。
- 设置内容配图适合横向、主体集中的构图；侧栏图面积小，尽量减少小字与复杂细节。
- 透明 PNG 或 WebP 适合小摆件式画面；JPEG 无透明通道。配置器不提供裁剪、旋转、拖拽定位或去背景功能，需先准备好图片。
- 自选图片内嵌在 JSON 和应用后的 CSS 中。多张大图会增大文件、导入和加载成本；建议在清晰度足够时减少体积。

图片编码总量受 60 MiB 文本长度限制，配置文件读取上限为 64 MiB。Base64 数据通常比原始图片大，因此 14 张都接近单张上限时不能一起使用。遇到“图片总量过大”，需要减小图片或恢复部分默认图。

## 应用到皮肤

### 方法 A：先应用到仓库，再安装

需要 Node.js 22 或更新版本。在解压后的仓库根目录打开 PowerShell；这里应能看见 `scripts`、`tools`、`skins`。先执行 `node --version` 检查是否已安装。

导出配置后运行：

```powershell
node scripts/configure.mjs --config "$env:USERPROFILE\Downloads\whale-desk.config.json"
```

如果浏览器下载到了其他目录，替换 JSON 路径。成功后会输出 `skin`、`backup`、`reset`、`bytes` 等字段及“已写入并备份”的提示。检查 `skin` 是否为本次希望修改的目标。

随后将生成的整个 `skins/whale-desk` 安装到 DSH，再重新选择皮肤。默认命令不会自动修改其他位置的已安装副本。

### 方法 B：明确指定已安装皮肤

仍在完整仓库根目录运行，例如 Windows 默认数据目录：

```powershell
node scripts/configure.mjs --config "$env:USERPROFILE\Downloads\whale-desk.config.json" --skin "$env:USERPROFILE\.dsh\skins\whale-desk"
```

使用自定义 DSH 数据目录时，替换 `--skin` 路径。命令会检查目标目录名和 manifest ID，拒绝误写其他皮肤或符号链接目标。成功后重新选择皮肤，必要时重启 DSH。

### 哪些文件会改变

工具会替换 `patches.css` 末尾的个人 DIY 标记段，并写入 `whale-desk.config.json`。每次先把旧 `patches.css` 和当时存在的配置 JSON 放入 `.whale-desk-backups` 下的新备份目录。重复应用会替换上一次 DIY 段，不会无限叠加。

它不修改 `DESK-OVERRIDES.css`、素材源文件、宿主程序、账户、会话或宠物包。`preview/desk.png` 和 GitHub 图册也不会随个人换图自动更新。

## 可直接使用的示例

| 示例文件 | 效果 |
| --- | --- |
| [紧凑书写](examples/compact-writing.json) | 最大宽度 680 px、输入字号 17、题字“先写一个小想法” |
| [安静阅读](examples/quiet-reading.json) | 默认宽度、输入字号 18、系统字体、关闭水彩摆件并隐藏主侧栏配图 |
| [默认参数](examples/defaults.json) | 完整默认配色与参数，便于手工比较 |

示例可导入配置器，也可在仓库根目录直接应用：

```powershell
node scripts/configure.mjs --config docs/examples/compact-writing.json
```

**应用的是一整套配置，不是与当前改稿合并。** 未填写字段会使用程序默认值；导入上述示例会丢弃网页中尚未导出的自选设置。先导出保存自己的版本，再试用示例。

手写 JSON 的最小示例：

```json
{
  "schemaVersion": 1,
  "composerWidth": 680,
  "fontSize": 17,
  "motto": "先写一个小想法"
}
```

图片对象中，省略某个键或使用 `null` 表示采用默认图，`false` 表示隐藏；自选图是完整的 `data:image/...;base64,...` 字符串，建议交给网页生成，避免手工填写。

## 恢复与备份

恢复当前仓库皮肤默认外观：

```powershell
node scripts/configure.mjs --reset
```

恢复指定已安装副本：

```powershell
node scripts/configure.mjs --reset --skin "$env:USERPROFILE\.dsh\skins\whale-desk"
```

恢复某次保存的设计，用 `--config` 重新应用对应 JSON；恢复某个旧版本，用安装前保存的完整目录。`--reset` 与 `--config` 不能在同一次命令里使用。

## 个人改稿与公开发布

个人配置和备份已加入 Git 忽略规则，但应用后的 `patches.css` 是跟踪文件，其中会带自选图片数据。不要仅凭“JSON 已忽略”就判断私人照片不会被提交。

`node scripts/check-release.mjs` 用于检查可公开发布的默认包，**会主动拒绝含个人 DIY 标记段的包**。个人配置应用成功后出现这条拒绝，不代表皮肤坏了。要发布默认包时，先保存 JSON，再执行 `--reset`；不要为了让检查通过而丢掉唯一的改稿。

## 进一步修改源样式

维护者的覆盖源文件是 `skins/whale-desk/DESK-OVERRIDES.css`，DSH 加载的是 `patches.css`。编辑源覆盖层后，在不含个人改稿的工作副本运行：

```powershell
node scripts/sync-overrides.mjs
node --test tests/configure.test.mjs
node scripts/check-release.mjs
```

主标题、品牌文字、布局层级、自定义动画和插件功能不属于当前配置器字段。修改这些内容需要编辑相应素材或代码，并重新做实际 DSH 验证；不要把静态图册当作自动适配测试。
