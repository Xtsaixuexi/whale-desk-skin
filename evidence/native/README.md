# Native screenshot evidence

Captured 2026-11-08 from Windows DSH 0.2.1-rc.2, Skin Center 0.4.8 at
1282 x 822. Account and conversation sidebar was collapsed before capture;
images are unretouched window captures. The pet is provided by the separately
installed pet plugin and is not bundled in the skin.

The initial home captures used local ID whale-desk-112-validation to avoid
same-path CSS caching. They document the earlier sidebar repair. The current
native validation copy is whale-desk-112-native; its CSS/fonts/art match the
current source, and only manifest ID/display name differ.

Follow-up captures automation-dark.jpg, taskboard-dark.jpg and task-dialog-dark.jpg
show the task-page/dialog contrast fixes. Native search input/clear, sidebar
collapse/reopen and opening/cancelling the task dialog were exercised. No task
was created or executed. The original desktop pet position was retained; a pet
can overlap a modal button, so drag it away when needed.

These images do not establish cold-start, original-path upgrade, account
backend, model or send/streaming correctness.

The static-light/static-dark files are separately labeled fictional browser
fixtures showing the expanded layout; they are not native DSH screenshots.
