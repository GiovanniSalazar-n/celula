# Implementation Plan: Battle of Cells MVP

**Branch**: `001-battle-cells-mvp` | **Date**: 2026-06-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-battle-cells-mvp/spec.md`

## Summary

Build the Battle of Cells MVP inside the existing Vite, React, and TypeScript
app from `Adudu02/First-Try-for-Cell-Battle-UI`. Preserve the current neon lab
HUD, layout, animations, and component design while replacing demo-only
simulation behavior with a pure TypeScript game engine under `src/engine`.

The MVP is local-only: exactly two local players, fixed 100 x 200 board, one
fully random starting cell per player on every match/reload, Python behavior
functions with only direct `health` and `nearby` arguments, locked match
configuration after Play, deterministic turn order, no age system, no backend,
no database, no login, and no online multiplayer.

## Editor Language v2 Extension Summary

Extend the existing user function validator and executor without rewriting the
MVP. Editor Language v2 keeps the current `def cell(health, nearby):` contract,
keeps user code isolated from engine state, and adds a small safe runtime layer
for bounded `for` loops and approved helper functions.

The v2 runtime must preserve all current gameplay rules, existing performance
fixes, and previous tests. Player code still returns one documented action code,
runtime errors still consume only the current cell action, and no user code may
mutate health, position, team, board, turn, cells, or internal engine state.

This plan also adds a post-MVP match configuration extension for selectable turn
limits. The default remains 5000 to preserve existing behavior. Allowed values
are bounded presets up to 10000, and the selected value locks after Play.

## Technical Context

**Language/Version**: TypeScript 5.8, React 19, Vite 6

**Primary Dependencies**: Existing React UI, Tailwind via `@tailwindcss/vite`,
Lucide React, Motion. Add Vitest for tests. Remove or isolate unused
`@google/genai`, `express`, and `dotenv` final-MVP dependencies if no remaining
code requires them.

**Storage**: In-memory browser state only. No database, backend API, or
persisted account data.

**Testing**: Vitest unit tests for engine rules and focused UI integration
tests for configuration lock, Play gating, simulation stats, and final result
flow.

**Target Platform**: Local browser app served by Vite.

**Project Type**: Single-page local web app with pure TypeScript game engine and
React presentation layer.

**Performance Goals**: Controls respond within 1 second during normal MVP use;
the 100 x 200 canvas board remains usable while rendering active cells and turn
updates; simulation ticks avoid unnecessary full-board recreation or copying.
Editor Language v2 must keep late-turn dense-colony performance fixes intact and
must not reintroduce unbounded allocations in validation, runtime, or UI tick
paths.

**Constraints**: Preserve existing UI identity; keep business rules out of React
components; no backend, no online multiplayer, no login, no database, no age
system, no Gemini/API requirement, default 5000 turn limit with bounded v2
selection up to 10000, minimal function context only, simulation speed control
required.

**Editor Language v2 Constraints**: Extend the current validator/executor
instead of replacing it. Add a dedicated runtime boundary under
`src/engine/runtime`. Allow only bounded `for` loops and approved helpers.
Reject unbounded `while`, `while true`, recursion, async code, browser globals,
network/file access, imports, `eval`, `exec`, and dynamic function construction.
Enforce both static validation and runtime step/timeout protection.

**Turn Limit v2 Constraint**: Existing matches and tests default to 5000 turns.
New configuration may select documented presets up to 10000, but the selected
limit is locked after Play and turn N must execute fully before turn-limit
victory evaluation.

**Scale/Scope**: Exactly two local players, fixed 20,000-square board, one
initial cell per player, four action categories, default turn limit 5000 with
bounded v2 selection up to 10000.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Source of truth: PASS. Plan decisions trace to `docs/`, the constitution, and
  `specs/001-battle-cells-mvp/spec.md`. No undocumented gameplay rule is added.
- MVP boundary: PASS. The plan keeps local-only play, two players, fixed
  100 x 200 board, one random initial cell per player, documented actions only,
  no backend API, no database, no login, no online multiplayer, and no age.
- Existing UI preservation: PASS. Existing `App.tsx`, `CodeEditor`,
  `GameBoard`, `ControlBar`, `SidebarStats`, `LogsPanel`, and `FinalResults`
  remain the visual foundation and are adapted rather than replaced.
- Engine/UI separation: PASS. New core logic belongs under `src/engine`; React
  consumes engine state and dispatches actions.
- User function safety: PASS. Validation and execution are planned as restricted
  engine services with real Python syntax, direct `health` and `nearby`
  arguments only, literal return checking, no imports/eval/exec/file or network
  access, no dangerous builtins or mutation APIs, and 1 second timeout behavior.
- Test-first rules: PASS. Core engine modules receive Vitest coverage before or
  alongside implementation; UI behavior gets integration/manual validation.

### Editor Language v2 Constitution Check

- Source of truth: PASS. This extension is based on the current user request and
  existing `/docs` and `/specs` context. The contract remains `health` plus
  `nearby`.
- MVP boundary: PASS for language runtime changes. Existing gameplay rules,
  board size, local-only scope, two-player scope, no backend, no login, no age,
  and no online multiplayer remain unchanged.
- Existing UI preservation: PASS. Editor copy and controls are adapted in place;
  the existing UI remains the foundation.
- Engine/UI separation: PASS. Validation and execution live under
  `src/engine/validation` and `src/engine/runtime`; React only displays errors,
  examples, and configured settings.
- User function safety: PASS. v2 adds safe helpers and bounded loops only inside
  an isolated runtime with forbidden syntax checks, read-only context, step
  limit, and timeout.
- Test-first rules: PASS. The plan requires tests for all new helpers, forbidden
  syntax, bounded loops, runtime errors, timeout behavior, and previous MVP
  behavior.
- Scope extension: JUSTIFIED. Selectable turn limits up to 10000 intentionally
  extend the previous fixed-5000 MVP rule. Default 5000 behavior remains
  unchanged; selected turn limit is locked after Play.

## Current Repository Findings

Existing UI files to preserve and adapt:

```text
src/App.tsx
src/components/CodeEditor.tsx
src/components/GameBoard.tsx
src/components/ControlBar.tsx
src/components/SidebarStats.tsx
src/components/LogsPanel.tsx
src/components/FinalResults.tsx
src/index.css
```

Existing demo/runtime files to replace or isolate behind the engine:

```text
src/types.ts
src/utils/interpreter.ts
src/utils/simulation.ts
```

Important mismatches found in the current mockup:

- `src/types.ts` includes `age`; MVP cells must not have age.
- `src/utils/simulation.ts` increments age and applies natural decay; both are
  forbidden.
- Demo turn order is randomized; MVP order must be deterministic.
- Demo attack/eat uses variable damage, costs health, and heals attacker; MVP
  Eat deals exactly 5 damage and never heals.
- Demo reproduction requires `life > 40`; MVP has no minimum health requirement.
- Demo Rest heals 10; MVP Rest heals 3.
- Demo direction examples include `so`; MVP uses `sw`.
- Demo settings allowed arbitrary non-5000 turn limits. MVP default remains
  5000; v2 turn-limit selection must be bounded and locked after Play.
- Existing `.env.example` and dependencies imply Gemini/Express runtime; final
  MVP must not require `GEMINI_API_KEY`, backend API, Express, or external AI.
- Existing board simulation patterns should not be copied if they recreate or
  clone the full 100 x 200 board every cycle/tick.

## Project Structure

### Documentation (this feature)

```text
specs/001-battle-cells-mvp/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── engine-contract.md
│   ├── ui-state-contract.md
│   └── user-function-contract.md
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
src/
├── engine/
│   ├── types/
│   │   └── game.ts
│   ├── constants/
│   │   └── gameConstants.ts
│   ├── board/
│   │   ├── createBoard.ts
│   │   └── position.ts
│   ├── actions/
│   │   ├── parseActionCode.ts
│   │   ├── resolveMove.ts
│   │   ├── resolveEat.ts
│   │   ├── resolveReproduce.ts
│   │   └── resolveRest.ts
│   ├── turns/
│   │   └── turnEngine.ts
│   ├── validation/
│   │   ├── validateUserFunction.ts
│   │   └── executeUserFunction.ts
│   ├── victory/
│   │   └── evaluateVictory.ts
│   ├── adapters/
│   │   └── gameViewState.ts
│   └── index.ts
├── components/
│   └── existing visual components adapted in place
├── screens/
│   ├── ConfigurationScreen.tsx
│   ├── SimulationScreen.tsx
│   └── FinalResultScreen.tsx
├── tests/
│   ├── engine/
│   └── ui/
├── App.tsx
├── main.tsx
└── index.css
```

**Structure Decision**: Keep the current single Vite app. Add `src/engine` for
pure business rules, `src/screens` as thin route-level composition if useful,
and `src/tests` for Vitest. Existing `src/components` remain the presentation
foundation.

### Editor Language v2 Source Additions

```text
src/engine/
  validation/
    validateUserFunction.ts
    forbiddenSyntax.ts
    allowedHelpers.ts
  runtime/
    createSafeContext.ts
    safeHelpers.ts
    executeUserFunction.ts
    stepLimiter.ts
    runtimeErrors.ts
    examples.ts
```

`src/engine/runtime` is the new user-code execution boundary. Existing public
exports may keep compatibility wrappers, but implementation should move toward
the runtime module so validation, safe context creation, helper definitions,
step limits, and runtime errors are clear and testable.

## Phase 0: Research Decisions

See [research.md](./research.md).

Key outcomes:

- Use pure TypeScript modules for the engine.
- Use Vitest for core rule tests.
- Keep existing React components and visual style; adapt props/state.
- Replace demo simulation/interpreter logic with contract-compliant engine
  modules.
- Use a safe real-Python function validation/execution boundary with only
  `health` and `nearby` exposed to player code.
- Treat manual End Simulation like a final result decided by living cells, then
  total health, then draw.
- Add simulation speed control while keeping configuration locked.
- Avoid full 100 x 200 board recreation/copying during simulation ticks.
- Remove or isolate Gemini/Express/demo dependencies before final MVP.

## Phase 1: Design Outputs

- Data model: [data-model.md](./data-model.md)
- Engine contract: [contracts/engine-contract.md](./contracts/engine-contract.md)
- UI state contract: [contracts/ui-state-contract.md](./contracts/ui-state-contract.md)
- User function contract: [contracts/user-function-contract.md](./contracts/user-function-contract.md)
- Editor Language v2 contract:
  [contracts/editor-language-v2-contract.md](./contracts/editor-language-v2-contract.md)
- Quickstart validation guide: [quickstart.md](./quickstart.md)

## Implementation Priority

1. Preserve and understand the existing UI.
2. Identify mockup-only and demo-only components/utilities.
3. Add Vitest setup.
4. Create engine types and constants.
5. Add tests for core rules before or alongside modules.
6. Implement board and cell logic.
7. Implement action parsing and move/eat/reproduce/rest resolvers.
8. Implement deterministic turn engine.
9. Implement victory evaluation.
10. Implement Python function validation and execution wrapper with only
    `health` and `nearby` arguments.
11. Connect engine state to existing UI through an adapter.
12. Connect configuration screen, including row-numbered editor and Play gate.
13. Connect simulation screen, controls, speed control, stats, board, and
    invalid action errors.
14. Connect final result screen, manual End Simulation result, and new-match
    flow.
15. Optimize board update flow to avoid unnecessary full-board copies per tick.
16. Clean unused mockup/demo code and remove Gemini/API requirement.

## Editor Language v2 Implementation Priority

1. Preserve the merged dense-colony performance fixes on `main`.
2. Inspect current `src/engine/validation/validateUserFunction.ts`, current
   execution code, templates, editor help text, and tests.
3. Add tests for existing behavior before changing runtime boundaries if a
   behavior is not already covered.
4. Split forbidden syntax checks into
   `src/engine/validation/forbiddenSyntax.ts`.
5. Define approved helpers in `src/engine/validation/allowedHelpers.ts` and
   `src/engine/runtime/safeHelpers.ts`.
6. Add `src/engine/runtime/createSafeContext.ts` so user code receives only
   read-only `health`, read-only `nearby`, and approved helper bindings.
7. Add bounded `for` loop validation for `range(...)`, direct `nearby`
   iteration, and approved helper results such as `emptyDirections(nearby)`.
8. Reject all `while` loops, including `while true`, recursion, imports,
   async/await, file/network access, `eval`, `exec`, `Function`, `fetch`,
   `window`, `document`, `localStorage`, `globalThis`, and dangerous builtins.
9. Add `src/engine/runtime/stepLimiter.ts` and enforce a runtime step budget in
   addition to the existing 1 second timeout.
10. Move execution implementation to `src/engine/runtime/executeUserFunction.ts`
    while preserving current public exports or wrapper compatibility.
11. Add examples/templates in `src/engine/runtime/examples.ts` for valid v2
    strategies that use bounded loops and helpers.
12. Update editor help text and validation feedback to explain loops, helpers,
    step limit, and forbidden syntax.
13. Add selectable turn-limit UI using bounded presets with default 5000 and
    max 10000; lock selected turn limit after Play.
14. Update engine match creation/victory tests so turn N executes fully for the
    selected limit.
15. Run `npm run lint`, `npm test`, `npm run build`, and a browser smoke test
    with existing MVP templates and new v2 examples.

## Complexity Tracking

Editor Language v2 adds complexity intentionally in two places:

1. **Safe editor runtime boundary**
   - Reason: Players need bounded loops and safe helper functions for more
     expressive strategies.
   - Simpler alternative rejected: Keep conditionals-only MVP syntax. Rejected
     because the v2 feature explicitly asks to permit bounded loops and helpers.
   - Guardrail: Runtime remains isolated, read-only, step-limited, timeout
     limited, and tested against forbidden syntax.

2. **Selectable turn limit up to 10000**
   - Reason: The new feature request asks for a way to choose the number of
     turns instead of only using the previous fixed maximum.
   - Simpler alternative rejected: Keep fixed 5000 turns. Rejected for v2
     because the requested extension explicitly includes configurable turn
     count.
   - Guardrail: Default remains 5000, allowed values are bounded presets, the
     selected limit locks after Play, and existing MVP behavior must still pass.
