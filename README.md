# Battle of Cells

Spec-driven development workspace initialized with GitHub Spec Kit.

## Permanent Context

Battle of Cells is a local two-player browser simulation game. Before planning
or coding, read the relevant files in `docs/` and `specs/` plus the current
constitution in `.specify/memory/constitution.md`.

The MVP preserves and adapts the existing UI from
`Adudu02/First-Try-for-Cell-Battle-UI`; it does not rebuild the UI from zero.
The MVP is local-only: no online multiplayer, no backend API, no database, and
no login system.

## SDD Workflow

1. `$speckit-constitution` - maintain project principles.
2. `$speckit-specify` - create or update a feature specification.
3. `$speckit-clarify` - resolve unclear requirements when needed.
4. `$speckit-plan` - create the technical implementation plan.
5. `$speckit-tasks` - break the plan into actionable tasks.
6. `$speckit-implement` - implement tasks test-first.
7. `$speckit-analyze` - check alignment across artifacts when risk is high.

## Local Tooling

- Speckit CLI: `specify`
- Script type: PowerShell
- Project configuration: `.specify/`
- Local Codex Speckit skills: `.agents/skills/`

Run `specify check` to verify available agent integrations.
