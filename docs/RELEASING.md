# 发布准备

发布仓库：[Xtsaixuexi/whale-desk-skin](https://github.com/Xtsaixuexi/whale-desk-skin)。首个版本为 `v1.1.1` 预发布。

发布前执行：

```sh
node --test tests/configure.test.mjs
node scripts/check-release.mjs
```

仓库应上传 README、docs、scripts、tools、tests、.github 以及完整 `skins/whale-desk`。不要上传个人配置、备份、DSH profile、聊天截图或另一个皮肤目录。

`skin.json` 的 `sourceUrl` 指向本仓库。上游归属另行保留在 README、NOTICE 和素材清单。

本版本仍需完整实机回归，建议首个 GitHub Release 标为预发布，并沿用 [TESTING.md](TESTING.md) 的真实状态。预览背景不能改称实机截图。未来补充截图时需实际运行该版本、记录版本与主题，并避免私人信息。

创意工坊收录是独立流程，GitHub 上传不等于已通过工坊审核；钩子受宿主信任规则约束。素材使用范围见 [LICENSE-ARTWORK](../LICENSE-ARTWORK)。

## 只更新说明书时

文档、FAQ、示例和导航可以独立更新到主分支，不必把它们写成新的皮肤功能。皮肤本体没有改变时，保留 `skin.json` 的版本和既有 Release 文件；在 README 提供当前仓库 ZIP，说明旧 Release 是历史快照。

新增或修改使用步骤前，核对 `tools/config-core.js`、`tools/editor.js` 与 `scripts/configure.mjs` 的实际行为。尤其检查默认目标目录、参数范围、图片大小、备份范围，以及“配置导入是替换而非合并”这些容易误解的细节。

检查 Markdown 相对链接与示例 JSON，确认示例能通过配置规范化；涉及应用命令的示例在临时皮肤副本执行，不改用户正在使用的皮肤。`node scripts/check-release.mjs` 会检查默认包引用与素材完整性。文档更改无需重新渲染 100 张图片；只有示例图的内容或样式改变才重新生成相应画廊，并同步图片清单。

## 个人改稿发布前

1. 保存个人配置 JSON 和完整皮肤备份。
2. 在准备发布的工作副本执行 `node scripts/configure.mjs --reset`，清除个人 DIY 覆盖段。
3. 检查 Git 变更，确认不包含个人照片、会话内容或本机账户数据。
4. 运行配置测试和发布检查，再提交可公开的代码与文档。

不要只忽略 JSON 而保留包含个人图片数据的 `patches.css`。备份目录和配置 JSON 已有忽略规则，但 CSS 是发布文件。
