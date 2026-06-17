<!-- SPECKIT START -->
Current plan: `specs/002-editor-language-v2/plan.md`

For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan.
<!-- SPECKIT END -->

## Battle of Cells Permanent Context

Before planning or coding, read the relevant files in `docs/` and `specs/`.
The business rules and documentation are the source of truth.

MVP boundaries:
- Preserve and adapt the existing UI from `Adudu02/First-Try-for-Cell-Battle-UI`.
- Do not rebuild the UI from zero.
- Keep the game local-only with exactly two local players.
- Do not add online multiplayer, backend API, database, login, or accounts.
- Keep the board fixed at 100 rows by 200 columns.
- Keep core game engine logic separate from React UI.
- Validate user functions before simulation starts.
- Test core rules before or alongside implementation.
