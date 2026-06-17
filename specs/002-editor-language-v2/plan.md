# Implementation Plan: Editor Language v2

**Branch**: `002-editor-language-v2` | **Date**: 2026-06-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-editor-language-v2/spec.md`

## Summary

Extend the existing Battle of Cells MVP editor language without rewriting the
game. The current local two-player simulation, board rules, victory rules,
performance fixes, and UI identity remain the baseline. This feature adds a
pre-match turn limit selector from 1 to 10000, then improves the player
algorithm validator/runtime with bounded `for` loops, approved safe helpers,
read-only neighbor helpers, step-limit protection, and clearer editor feedback.

## Technical Context

**Language/Version**: TypeScript 5.8, React 19, Vite 6

**Primary Dependencies**: Existing React UI, Vitest, Testing Library, Lucide React, Motion

**Storage**: In-memory browser state only. No backend, database, account, or persisted match storage.

**Testing**: Vitest unit tests under `src/tests/engine` and focused UI tests under `src/tests/ui`

**Target Platform**: Local browser app served by Vite

**Project Type**: Single-page local web app with a pure TypeScript game engine and React presentation layer

**Performance Goals**: Preserve dense-colony responsiveness and avoid full-board recreation or copying on each tick. User functions must be bounded by timeout and step limit.

**Constraints**: Do not modify game rules. Keep two local players, fixed 100 x 200 board, documented action codes, no age, no backend, no online multiplayer, no database, no login. Preserve the existing UI and current working behavior.

**Scale/Scope**: Editor/runtime extension plus configurable turn limit. Default turn limit remains 5000; allowed values are 1 to 10000 and lock after Play.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Source of truth: PASS. This plan follows `/docs`, `specs/001-battle-cells-mvp`, and `specs/002-editor-language-v2/spec.md`.
- MVP boundary: PASS. No backend, database, online multiplayer, login, extra players, board-size changes, new actions, or age system are introduced.
- Existing UI preservation: PASS. Existing editor/configuration UI is adapted in place.
- Engine/UI separation: PASS. Validation/runtime changes remain under engine modules; React displays state, controls, examples, and errors.
- User function safety: PASS. User code receives only read-only safe context and approved helpers; dangerous syntax remains forbidden.
- Test-first rules: PASS. Tasks must add tests before implementation for turn limit, helper behavior, forbidden syntax, loop limits, step limits, and editor feedback.

## Current Repository Findings

Runtime and validation files to inspect first:

```text
src/engine/validation/buildFunctionArgs.ts
src/engine/validation/executeUserFunction.ts
src/engine/validation/validatePlayerConfig.ts
src/engine/validation/validateUserFunction.ts
```

Existing UI files to preserve and adapt:

```text
src/App.tsx
src/components/CodeEditor.tsx
src/components/ControlBar.tsx
src/components/FinalResults.tsx
src/components/GameBoard.tsx
src/components/LogsPanel.tsx
src/components/SidebarStats.tsx
```

Existing tests to extend:

```text
src/tests/engine/executeUserFunction.test.ts
src/tests/engine/validateUserFunction.test.ts
src/tests/engine/playerConfig.test.ts
src/tests/engine/matchLock.test.ts
src/tests/engine/evaluateVictory.test.ts
src/tests/ui/codeEditor.test.tsx
src/tests/ui/configurationScreen.test.tsx
```

## Project Structure

### Documentation (this feature)

```text
specs/002-editor-language-v2/
  plan.md
  research.md
  data-model.md
  quickstart.md
  contracts/
    editor-language-v2-contract.md
  tasks.md
```

### Source Code (repository root)

```text
src/
  engine/
    validation/
      buildFunctionArgs.ts
      validateUserFunction.ts
      executeUserFunction.ts
      validatePlayerConfig.ts
      forbiddenSyntax.ts
      allowedHelpers.ts
    runtime/
      createSafeContext.ts
      safeHelpers.ts
      stepLimiter.ts
      runtimeErrors.ts
      examples.ts
    match/
      createInitialMatch.ts
      matchState.ts
    victory/
      evaluateVictory.ts
  components/
    CodeEditor.tsx
  tests/
    engine/
    ui/
```

**Structure Decision**: Keep the current single Vite app. Add narrow runtime
modules under `src/engine/runtime` only as needed. Preserve current validation
public exports or wrapper compatibility so existing UI and tests keep working.

## Phase 0: Research Decisions

See [research.md](./research.md).

Key decisions:

- Add the turn selector first because it is independent of language runtime risk.
- Keep current MVP behavior as regression baseline before adding v2 syntax.
- Implement helpers as allow-listed functions with read-only inputs.
- Reject unsafe syntax statically before Play.
- Enforce step limit at runtime in addition to the existing timeout.
- Keep user code isolated from engine objects and mutation paths.

## Phase 1: Design Outputs

- Data model: [data-model.md](./data-model.md)
- Editor language contract: [contracts/editor-language-v2-contract.md](./contracts/editor-language-v2-contract.md)
- Quickstart validation guide: [quickstart.md](./quickstart.md)

## Implementation Priority

1. Add turn selector between 1 and 10000.
2. Inspect current validation/runtime/editor files.
3. Add tests for existing behavior.
4. Add tests for allowed helpers.
5. Add tests for forbidden syntax.
6. Add tests for loop limits.
7. Implement safe helper functions.
8. Implement read-only context helpers.
9. Implement bounded loop support.
10. Implement step limit protection.
11. Improve editor help text and error messages.
12. Run all tests.
13. Fix regressions.
14. Update docs.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Configurable turn limit changes the prior fixed-5000 MVP boundary | The new feature explicitly requires user-selectable turn count capped at 10000 | Keeping only fixed 5000 would fail the accepted feature scope; default 5000 behavior remains unchanged |
