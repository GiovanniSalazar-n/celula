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

**Constraints**: Preserve existing UI identity; keep business rules out of React
components; no backend, no online multiplayer, no login, no database, no age
system, no Gemini/API requirement, fixed 5000 turn limit, minimal function
context only, simulation speed control required.

**Scale/Scope**: Exactly two local players, fixed 20,000-square board, one
initial cell per player, four action categories, turn limit 5000.

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
- Demo settings allow non-5000 turn limits; MVP turn limit is fixed at 5000.
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

## Complexity Tracking

No constitution violations are planned.
