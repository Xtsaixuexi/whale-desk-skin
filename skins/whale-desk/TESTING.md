# Validation / 验证范围

Version 1.1.2; checked 2026-11-08 on Windows. This is a limited compatibility
record, not a claim that every DSH workflow or host version has passed.

- 11 offline configuration/install tests passed.
- 36 isolated browser cases passed using source CSS, the installed Skin Center
  0.4.8 transform, and the market 0.4.16 transform. These are the same 36 cases
  in three pipelines, not 108 different features. Machine reports are in
  [validation](validation/browser-tests.json),
  [0.4.8](validation/browser-tests-0.4.8.json) and
  [0.4.16](validation/browser-tests-0.4.16.json).
- Coverage: sidebar collapse controls, legacy brand markup, theme changes,
  readable dark cards/menus, 11 reordered settings sections, unknown sections,
  responsive decoration hiding, system font reset, reduced motion/forced colors,
  wallpaper replacement, corrupt imports and asynchronous editor races.
- Native DSH 0.2.1-rc.2 / Skin Center 0.4.8: try-on and exit, apply/default,
  light/dark switching, settings identity, background slider, account menu,
  pet click feedback and drag were exercised. Fresh-path 1.1.2 CSS restored the
  collapsed sidebar control. Native evidence uses a validation copy with only
  its manifest ID/display name changed; CSS/art/fonts are byte-identical.
- Same-path replacement in an already open desktop window can retain old CSS.
  Restoring Default and reapplying is not always sufficient. Normal reopening
  after background work completes is recommended, but cold restart was not
  tested because the current host had running tasks.
- Model/send/streaming end-to-end validation was blocked by the host workspace
  not becoming ready and an account-page error. No paid messages were sent.
  Full pet actions/Live2D, keyboard-only operation, mobile and macOS/Linux are
  not verified. The skin does not implement those host features.
- Upstream full suite: 821/822 passed. The Windows addon directory-rename
  expectation failed; a focused rerun also had two worker startup/timing
  failures. A subsequent unmodified upstream focused baseline (24 tests) passed
  23 and reproduced the same Windows rename assertion with no Whale Desk assets
  present. See [baseline report](validation/upstream-worker-baseline.json). This
  failure predates the skin; its OS/dependency root cause is not established.
  The full upstream baseline suite was not rerun. No upstream assertions changed.

中文：已验证皮肤外观与部分真实操作；未完成账号后端、真实发送、冷启动、
手机和全部桌宠动作的验收。旧窗口原路径可能保留旧 CSS，已用仅改 ID/名称的
同文件验证副本确认侧栏修复，不将其当作原地更新已通过。

Character redistribution permission remains independently unverified. See
[NOTICE](NOTICE). Market inclusion requires maintainer/copyright review.
