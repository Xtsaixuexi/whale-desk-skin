# Native screenshot evidence

Captured 2026-11-08 from Windows DSH 0.2.1-rc.2, Skin Center 0.4.8 at
1282 x 822. Account and conversation sidebar was collapsed before capture;
images are unretouched window captures. The pet is provided by the separately
installed pet plugin and is not bundled in the skin.

The initial home captures used local ID whale-desk-112-validation to avoid
same-path CSS caching. Task captures used whale-desk-112-native. They document
the earlier repairs with the CSS/fonts/art from their respective validation
stage; only manifest ID/display name differed from that stage's skin package.

Follow-up captures automation-dark.jpg, taskboard-dark.jpg and task-dialog-dark.jpg
show the task-page/dialog contrast fixes. Native search input/clear, sidebar
collapse/reopen and opening/cancelling the task dialog were exercised. No task
was created or executed. The original desktop pet position was retained; a pet
can overlap a modal button, so drag it away when needed.

After the user's explicit restart approval, the original `whale-desk` directory
was activated and normally restarted. A new empty test workspace stayed selected.
One short prompt (no tools or file access requested) reached generating, completed,
and the expected reply. Its directory remained empty. A real dark-conversation
contrast defect was then corrected, followed by another normal restart.

chat-dark-after-restart.jpg and chat-model-menu-dark.jpg show the corrected
conversation and model menu after that second restart, using the original skin ID
and final shipped CSS. The test conversation survived, sidebar collapse/reopen
worked, and the model menu opened and closed with Escape. The pet was temporarily
moved left to expose the model control, then restored. A floating desktop assistant
overlay at the right edge is external to DSH and was left unretouched.

These checks do not establish every account endpoint, sustained token streaming,
stop/retry, all models, long code/file delivery, background tasks, or first install
on a clean machine. The earlier workspace reset's root cause is unestablished.

The static-light/static-dark files are separately labeled fictional browser
fixtures showing the expanded layout; they are not native DSH screenshots.
