# Agent Instructions - Battle of Cells

You are implementing Battle of Cells using Spec-Driven Development, Test-Driven Development, and Software Design Documentation.

## Source of Truth

Read these files before coding:

1. `docs/00-project-overview.md`
2. `docs/01-business-rules.md`
3. `docs/02-game-flow.md`
4. `docs/03-user-function-contract.md`
5. `docs/04-data-model.md`
6. `docs/05-ui-screens.md`
7. `docs/06-test-plan.md`
8. `docs/08-open-decisions.md`
9. `docs/09-existing-ui-integration.md`
10. `specs/battle-of-cells-mvp/requirements.md`
11. `specs/battle-of-cells-mvp/acceptance-criteria.md`
12. `specs/battle-of-cells-mvp/edge-cases.md`

Do not invent rules that are not documented.

## Existing UI Requirement

This project is based on the existing mockup UI repository:

`Adudu02/First-Try-for-Cell-Battle-UI`

Before implementing, inspect the current UI and preserve its design as much as possible.

The existing UI is the base presentation layer. The task is not to create a new UI from scratch. The task is to connect the existing UI to the real Battle of Cells engine.

If a component is mockup-only, adapt it instead of deleting it immediately.

## MVP Rules

This is a local two-player turn-based browser simulation.

Do not implement:

- Online multiplayer.
- Login system.
- Backend API.
- Database.
- Obstacles.
- Resources.
- External food.
- Cell age.
- Aging damage.
- Death by age.
- Age-based order.
- Extra actions.

## Development Rules

- Write tests for game rules.
- Keep game engine separate from React UI.
- Use pure functions where possible.
- Do not mix UI state with core simulation rules.
- Make invalid actions consume the cell action.
- Remove dead cells immediately.
- Do not allow match editing after Play.
- Newborn cells do not act on the same turn.
- Turn 5000 must execute fully before final evaluation.
- Execution order must not use age.

## Required Output

Implement the MVP in small, tested steps.

Update documentation when rules or architecture are clarified.
