# 组件与配图

[返回首页](../README.md) · [离线画廊](gallery.html) · [功能对照](PARITY.md) · [验证状态](TESTING.md)

完整展示包含 **6 张界面预览、40 类组件 × 浅深两色共 80 张预览、14 张独立配图**。栏目与上游组件文件名逐项对齐，额外补齐了上游四个仅有浅色预览的深色版本。

界面与组件图片由随包 CSS 加文档示例布局渲染，使用虚构数据，并非 DSH 实机截图。菜单与面板仅展示静态外观，示例 DOM 不保证与每个宿主版本完全一致；这些图片不能证明交互无 bug。配图是现有素材的原像素导出。

## 导览

- **首页与侧栏**：[新会话按钮](#new-conversation) · [工作区目录与会话列表](#workspace-directory) · [会话小飞机与运行状态](#planes) · [工作区悬浮信息](#workspace-hover) · [会话悬浮信息](#session-hover) · [侧栏视图选项](#view-options) · [个人账户卡](#account) · [账户菜单](#account-menu) · [今日用量与余额](#daily-usage)
- **对话与阅读**：[用户消息与助手回复](#messages) · [代码块与语言栏](#code-fold) · [当前会话标题](#session-heading) · [触发通知 · 收起](#trigger-closed) · [触发通知 · 展开](#trigger-open) · [交互问答面板](#question-pad)
- **输入与发送**：[输入托盘与会话选项](#composer) · [发送、运行与插话](#send-controls) · [排队消息](#queued-message) · [模型选择](#model-selector) · [权限模式](#permission-picker) · [权限确认面板](#full-access) · [添加与指令](#add-command)
- **任务与插件**：[子智能体任务列表](#subagents) · [对话待办](#todos) · [任务看板](#taskboard) · [自动化计划列表](#automation-planner) · [自动化任务详情](#automation-detail) · [对话中的计划卡](#automation-card) · [插件管理](#plugin-page)
- **文件与工作工具**：[交付文件](#files) · [文件变更摘要](#changed-files) · [右侧工作台入口](#workspace) · [会话更多菜单](#session-menu) · [打开方式菜单](#open-in-app) · [会话统计与上下文](#stats)
- **专用窗口与设置**：[远程访问面板](#remote-book) · [归档会话预览](#session-preview) · [更新入口与下载提示](#update-tip) · [设置 · 账号与余额](#settings-account) · [设置 · 使用统计](#settings-usage)

## 全界面

### 首页

| 日光 · 浅色 | 晚灯 · 深色 |
| --- | --- |
| ![首页浅色](../evidence/whale-desk-light.png) | ![首页深色](../evidence/whale-desk-dark.png) |

### 对话

| 日光 · 浅色 | 晚灯 · 深色 |
| --- | --- |
| ![对话浅色](../evidence/whale-desk-messages-light.png) | ![对话深色](../evidence/whale-desk-messages-dark.png) |

### 设置

| 日光 · 浅色 | 晚灯 · 深色 |
| --- | --- |
| ![设置浅色](../evidence/whale-desk-settings-light.png) | ![设置深色](../evidence/whale-desk-settings-dark.png) |

## 首页与侧栏

<a id="new-conversation"></a>

### 新会话按钮

浅色与深色静态示例，功能行为由 DSH 宿主提供。

![新会话按钮浅色](components/new-conversation-light.png)

<details>
<summary>查看深色版本</summary>

![新会话按钮深色](components/new-conversation-dark.png)

</details>

<a id="workspace-directory"></a>

### 工作区目录与会话列表

浅色与深色静态示例，功能行为由 DSH 宿主提供。

![工作区目录与会话列表浅色](components/workspace-directory-light.png)

<details>
<summary>查看深色版本</summary>

![工作区目录与会话列表深色](components/workspace-directory-dark.png)

</details>

<a id="planes"></a>

### 会话小飞机与运行状态

浅色与深色静态示例，功能行为由 DSH 宿主提供。

![会话小飞机与运行状态浅色](components/planes-light.png)

<details>
<summary>查看深色版本</summary>

![会话小飞机与运行状态深色](components/planes-dark.png)

</details>

<a id="workspace-hover"></a>

### 工作区悬浮信息

浅色与深色静态示例，功能行为由 DSH 宿主提供。

![工作区悬浮信息浅色](components/workspace-hover-light.png)

<details>
<summary>查看深色版本</summary>

![工作区悬浮信息深色](components/workspace-hover-dark.png)

</details>

<a id="session-hover"></a>

### 会话悬浮信息

浅色与深色静态示例，功能行为由 DSH 宿主提供。

![会话悬浮信息浅色](components/session-hover-light.png)

<details>
<summary>查看深色版本</summary>

![会话悬浮信息深色](components/session-hover-dark.png)

</details>

<a id="view-options"></a>

### 侧栏视图选项

浅色与深色静态示例，功能行为由 DSH 宿主提供。

![侧栏视图选项浅色](components/view-options-light.png)

<details>
<summary>查看深色版本</summary>

![侧栏视图选项深色](components/view-options-dark.png)

</details>

<a id="account"></a>

### 个人账户卡

浅色与深色静态示例，功能行为由 DSH 宿主提供。

![个人账户卡浅色](components/account-light.png)

<details>
<summary>查看深色版本</summary>

![个人账户卡深色](components/account-dark.png)

</details>

<a id="account-menu"></a>

### 账户菜单

浅色与深色静态示例，功能行为由 DSH 宿主提供。

![账户菜单浅色](components/account-menu-light.png)

<details>
<summary>查看深色版本</summary>

![账户菜单深色](components/account-menu-dark.png)

</details>

<a id="daily-usage"></a>

### 今日用量与余额

浅色与深色静态示例，功能行为由 DSH 宿主提供。

![今日用量与余额浅色](components/daily-usage-light.png)

<details>
<summary>查看深色版本</summary>

![今日用量与余额深色](components/daily-usage-dark.png)

</details>

## 对话与阅读

<a id="messages"></a>

### 用户消息与助手回复

浅色与深色静态示例，功能行为由 DSH 宿主提供。

![用户消息与助手回复浅色](components/messages-light.png)

<details>
<summary>查看深色版本</summary>

![用户消息与助手回复深色](components/messages-dark.png)

</details>

<a id="code-fold"></a>

### 代码块与语言栏

浅色与深色静态示例，功能行为由 DSH 宿主提供。

![代码块与语言栏浅色](components/code-fold-light.png)

<details>
<summary>查看深色版本</summary>

![代码块与语言栏深色](components/code-fold-dark.png)

</details>

<a id="session-heading"></a>

### 当前会话标题

浅色与深色静态示例，功能行为由 DSH 宿主提供。

![当前会话标题浅色](components/session-heading-light.png)

<details>
<summary>查看深色版本</summary>

![当前会话标题深色](components/session-heading-dark.png)

</details>

<a id="trigger-closed"></a>

### 触发通知 · 收起

浅色与深色静态示例，功能行为由 DSH 宿主提供。

![触发通知 · 收起浅色](components/trigger-closed-light.png)

<details>
<summary>查看深色版本</summary>

![触发通知 · 收起深色](components/trigger-closed-dark.png)

</details>

<a id="trigger-open"></a>

### 触发通知 · 展开

浅色与深色静态示例，功能行为由 DSH 宿主提供。

![触发通知 · 展开浅色](components/trigger-open-light.png)

<details>
<summary>查看深色版本</summary>

![触发通知 · 展开深色](components/trigger-open-dark.png)

</details>

<a id="question-pad"></a>

### 交互问答面板

浅色与深色静态示例，功能行为由 DSH 宿主提供。

![交互问答面板浅色](components/question-pad-light.png)

<details>
<summary>查看深色版本</summary>

![交互问答面板深色](components/question-pad-dark.png)

</details>

## 输入与发送

<a id="composer"></a>

### 输入托盘与会话选项

浅色与深色静态示例，功能行为由 DSH 宿主提供。

![输入托盘与会话选项浅色](components/composer-light.png)

<details>
<summary>查看深色版本</summary>

![输入托盘与会话选项深色](components/composer-dark.png)

</details>

<a id="send-controls"></a>

### 发送、运行与插话

浅色与深色静态示例，功能行为由 DSH 宿主提供。

![发送、运行与插话浅色](components/send-controls-light.png)

<details>
<summary>查看深色版本</summary>

![发送、运行与插话深色](components/send-controls-dark.png)

</details>

<a id="queued-message"></a>

### 排队消息

浅色与深色静态示例，功能行为由 DSH 宿主提供。

![排队消息浅色](components/queued-message-light.png)

<details>
<summary>查看深色版本</summary>

![排队消息深色](components/queued-message-dark.png)

</details>

<a id="model-selector"></a>

### 模型选择

浅色与深色静态示例，功能行为由 DSH 宿主提供。

![模型选择浅色](components/model-selector-light.png)

<details>
<summary>查看深色版本</summary>

![模型选择深色](components/model-selector-dark.png)

</details>

<a id="permission-picker"></a>

### 权限模式

浅色与深色静态示例，功能行为由 DSH 宿主提供。

![权限模式浅色](components/permission-picker-light.png)

<details>
<summary>查看深色版本</summary>

![权限模式深色](components/permission-picker-dark.png)

</details>

<a id="full-access"></a>

### 权限确认面板

浅色与深色静态示例，功能行为由 DSH 宿主提供。

![权限确认面板浅色](components/full-access-light.png)

<details>
<summary>查看深色版本</summary>

![权限确认面板深色](components/full-access-dark.png)

</details>

<a id="add-command"></a>

### 添加与指令

浅色与深色静态示例，功能行为由 DSH 宿主提供。

![添加与指令浅色](components/add-command-light.png)

<details>
<summary>查看深色版本</summary>

![添加与指令深色](components/add-command-dark.png)

</details>

## 任务与插件

<a id="subagents"></a>

### 子智能体任务列表

浅色与深色静态示例，功能行为由 DSH 宿主提供。

![子智能体任务列表浅色](components/subagents-light.png)

<details>
<summary>查看深色版本</summary>

![子智能体任务列表深色](components/subagents-dark.png)

</details>

<a id="todos"></a>

### 对话待办

浅色与深色静态示例，功能行为由 DSH 宿主提供。

![对话待办浅色](components/todos-light.png)

<details>
<summary>查看深色版本</summary>

![对话待办深色](components/todos-dark.png)

</details>

<a id="taskboard"></a>

### 任务看板

浅色与深色静态示例，功能行为由 DSH 宿主提供。

![任务看板浅色](components/taskboard-light.png)

<details>
<summary>查看深色版本</summary>

![任务看板深色](components/taskboard-dark.png)

</details>

<a id="automation-planner"></a>

### 自动化计划列表

浅色与深色静态示例，功能行为由 DSH 宿主提供。

![自动化计划列表浅色](components/automation-planner-light.png)

<details>
<summary>查看深色版本</summary>

![自动化计划列表深色](components/automation-planner-dark.png)

</details>

<a id="automation-detail"></a>

### 自动化任务详情

浅色与深色静态示例，功能行为由 DSH 宿主提供。

![自动化任务详情浅色](components/automation-detail-light.png)

<details>
<summary>查看深色版本</summary>

![自动化任务详情深色](components/automation-detail-dark.png)

</details>

<a id="automation-card"></a>

### 对话中的计划卡

浅色与深色静态示例，功能行为由 DSH 宿主提供。

![对话中的计划卡浅色](components/automation-card-light.png)

<details>
<summary>查看深色版本</summary>

![对话中的计划卡深色](components/automation-card-dark.png)

</details>

<a id="plugin-page"></a>

### 插件管理

浅色与深色静态示例，功能行为由 DSH 宿主提供。

![插件管理浅色](components/plugin-page-light.png)

<details>
<summary>查看深色版本</summary>

![插件管理深色](components/plugin-page-dark.png)

</details>

## 文件与工作工具

<a id="files"></a>

### 交付文件

浅色与深色静态示例，功能行为由 DSH 宿主提供。

![交付文件浅色](components/files-light.png)

<details>
<summary>查看深色版本</summary>

![交付文件深色](components/files-dark.png)

</details>

<a id="changed-files"></a>

### 文件变更摘要

浅色与深色静态示例，功能行为由 DSH 宿主提供。

![文件变更摘要浅色](components/changed-files-light.png)

<details>
<summary>查看深色版本</summary>

![文件变更摘要深色](components/changed-files-dark.png)

</details>

<a id="workspace"></a>

### 右侧工作台入口

浅色与深色静态示例，功能行为由 DSH 宿主提供。

![右侧工作台入口浅色](components/workspace-light.png)

<details>
<summary>查看深色版本</summary>

![右侧工作台入口深色](components/workspace-dark.png)

</details>

<a id="session-menu"></a>

### 会话更多菜单

浅色与深色静态示例，功能行为由 DSH 宿主提供。

![会话更多菜单浅色](components/session-menu-light.png)

<details>
<summary>查看深色版本</summary>

![会话更多菜单深色](components/session-menu-dark.png)

</details>

<a id="open-in-app"></a>

### 打开方式菜单

浅色与深色静态示例，功能行为由 DSH 宿主提供。

![打开方式菜单浅色](components/open-in-app-light.png)

<details>
<summary>查看深色版本</summary>

![打开方式菜单深色](components/open-in-app-dark.png)

</details>

<a id="stats"></a>

### 会话统计与上下文

浅色与深色静态示例，功能行为由 DSH 宿主提供。

![会话统计与上下文浅色](components/stats-light.png)

<details>
<summary>查看深色版本</summary>

![会话统计与上下文深色](components/stats-dark.png)

</details>

## 专用窗口与设置

<a id="remote-book"></a>

### 远程访问面板

浅色与深色静态示例，功能行为由 DSH 宿主提供。

![远程访问面板浅色](components/remote-book-light.png)

<details>
<summary>查看深色版本</summary>

![远程访问面板深色](components/remote-book-dark.png)

</details>

<a id="session-preview"></a>

### 归档会话预览

浅色与深色静态示例，功能行为由 DSH 宿主提供。

![归档会话预览浅色](components/session-preview-light.png)

<details>
<summary>查看深色版本</summary>

![归档会话预览深色](components/session-preview-dark.png)

</details>

<a id="update-tip"></a>

### 更新入口与下载提示

浅色与深色静态示例，功能行为由 DSH 宿主提供。

![更新入口与下载提示浅色](components/update-tip-light.png)

<details>
<summary>查看深色版本</summary>

![更新入口与下载提示深色](components/update-tip-dark.png)

</details>

<a id="settings-account"></a>

### 设置 · 账号与余额

浅色与深色静态示例，功能行为由 DSH 宿主提供。

![设置 · 账号与余额浅色](components/settings-account-light.png)

<details>
<summary>查看深色版本</summary>

![设置 · 账号与余额深色](components/settings-account-dark.png)

</details>

<a id="settings-usage"></a>

### 设置 · 使用统计

浅色与深色静态示例，功能行为由 DSH 宿主提供。

![设置 · 使用统计浅色](components/settings-usage-light.png)

<details>
<summary>查看深色版本</summary>

![设置 · 使用统计深色](components/settings-usage-dark.png)

</details>

## 完整配图库

首页使用新生成的水彩书桌，其余 13 张继承插画保留原像素。导出图仅便于 GitHub 浏览，不替换皮肤内 SVG。来源与许可见 [ARTWORK.json](../skins/whale-desk/ARTWORK.json) 和 [LICENSE-ARTWORK](../LICENSE-ARTWORK)。

### 首页 · 水彩小书桌

![鲸伴水彩小书桌](artwork/home.png)

### 设置-账号与余额

![鲸鱼存钱罐](artwork/account.png)

### 设置-通用设置

![整理晨间小屋](artwork/general.png)

### 设置-模型

![星图学习时间](artwork/models.png)

### 设置-内置插件

![拼好一只小鲸鱼](artwork/plugins.png)

### 设置-Agent预设

![准备下一次冒险](artwork/presets.png)

### 设置-已归档会话

![收藏温柔回忆](artwork/archive.png)

### 设置-Web插件

![海边电话](artwork/web.png)

### 设置-皮肤

![挑选今日配色](artwork/skins.png)

### 设置-宠物

![草地上的小伙伴](artwork/pets.png)

### 设置-创意工坊

![手账文具小摊](artwork/workshop.png)

### 设置-使用统计

![数一数今日星光](artwork/usage.png)

### 设置界面左栏

![拿手账招手的透明贴纸](artwork/settings-sidebar.png)

### 主界面左栏

![休息一小会](artwork/main-sidebar.png)

### 新增水彩装饰

![水彩鲸鱼与花饰](../skins/whale-desk/assets/desk/watercolor-vignette.png)

## 文件与复现

- `components/`：80 张组件预览，保持上游组件命名。
- `artwork/`：14 张独立配图。
- `../evidence/`：6 张全界面静态预览，性质见该目录 README。
- [PREVIEW-MANIFEST.json](PREVIEW-MANIFEST.json)：100 张图片的来源、尺寸和 SHA-256。
- [预览生成说明](PREVIEWS.md)：重新渲染和校验方法。
