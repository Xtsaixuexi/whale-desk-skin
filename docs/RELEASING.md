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
