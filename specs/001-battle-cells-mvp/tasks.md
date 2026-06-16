# Tasks: Battle of Cells MVP

**Input**: Design documents from `specs/001-battle-cells-mvp/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Required by the spec, constitution, and user request. Core rule tests must be written before or alongside implementation.

**Organization**: Tasks are ordered for TDD and existing UI integration: inspect UI first, document mock data, add engine contracts, write tests, implement engine modules, connect UI, clean demo code, then verify and update docs.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel after prerequisites in the same phase are complete
- **[Story]**: Which user story the task belongs to: US1, US2, US3, US4, US5
- Every task includes an exact file path or directory path

## Phase 1: Setup and UI Inspection

**Purpose**: Preserve the existing UI by understanding it before changing behavior.

- [X] T001 Inspect current app composition in `src/App.tsx`
- [X] T002 Inspect current setup editor UI in `src/components/CodeEditor.tsx`
- [X] T003 Inspect current board rendering UI in `src/components/GameBoard.tsx`
- [X] T004 Inspect current simulation controls in `src/components/ControlBar.tsx`
- [X] T005 Inspect current player stats UI in `src/components/SidebarStats.tsx`
- [X] T006 Inspect current error/log panel UI in `src/components/LogsPanel.tsx`
- [X] T007 Inspect current final result UI in `src/components/FinalResults.tsx`
- [X] T008 Document reusable visual components, HUD layout, animations, and mock-data sources in `docs/10-ui-inventory.md`
- [X] T009 Document current MVP rule mismatches from `src/types.ts`, `src/utils/simulation.ts`, and `src/utils/interpreter.ts` in `docs/11-demo-code-audit.md`
- [X] T010 Add Vitest test script and dev dependency entries in `package.json`
- [X] T011 Add Vitest configuration to `vite.config.ts`
- [X] T012 Create test support directory `src/tests/fixtures`

**Checkpoint**: Existing UI is understood and documented before engine replacement begins.

## Phase 2: Foundational Engine Contracts

**Purpose**: Establish the pure engine shape that every user story depends on.

- [X] T013 Create engine directory structure under `src/engine`
- [X] T014 Create shared engine type definitions in `src/engine/types/game.ts`
- [X] T015 Create MVP constants in `src/engine/constants/gameConstants.ts`
- [X] T016 Create engine public exports in `src/engine/index.ts`
- [X] T017 Create shared test fixtures for players, cells, compact board occupancy, and matches in `src/tests/fixtures/gameFixtures.ts`
- [X] T018 Add compile-only export test for engine surface in `src/tests/engine/index.test.ts`

**Checkpoint**: Engine module boundaries exist, with no age field or age-based rule in engine types.

## Phase 3: User Story 1 - Configure and Validate Players (Priority: P1)

**Goal**: Two local players can configure names, colors, and real Python functions; Play is blocked until both are valid and confirmed.

**Independent Test**: Enter valid and invalid player data, validate functions, confirm both players, and verify Play only becomes available when both are valid.

### Tests for User Story 1

- [X] T019 [P] [US1] Add player configuration validation tests in `src/tests/engine/playerConfig.test.ts`
- [X] T020 [P] [US1] Add validator tests accepting real Python `def cell(health, nearby):` functions with literal valid returns in `src/tests/engine/validateUserFunction.test.ts`
- [X] T021 [P] [US1] Add validator tests proving player functions receive only `health` and `nearby` direct arguments in `src/tests/engine/validateUserFunction.test.ts`
- [X] T022 [P] [US1] Add validator tests proving `nearby` contains exactly eight values limited to `empty`, `allied`, `enemy`, and `outside` in `src/tests/engine/validateUserFunction.test.ts`
- [X] T023 [P] [US1] Add validator tests rejecting board, turn object, internal IDs, mutable cells, full cell lists, team object, and internal state access in `src/tests/engine/validateUserFunction.test.ts`
- [X] T024 [P] [US1] Add validator tests rejecting imports, file access, network access, eval, exec, dangerous builtins, state mutation, dynamic returns, infinite loops, and timeout in `src/tests/engine/validateUserFunction.test.ts`
- [X] T025 [P] [US1] Add UI Play gate tests for invalid and unconfirmed players in `src/tests/ui/configurationScreen.test.tsx`
- [X] T026 [P] [US1] Add row-numbered editor rendering test in `src/tests/ui/codeEditor.test.tsx`

### Implementation for User Story 1

- [X] T027 [US1] Implement player configuration validation helpers in `src/engine/validation/validatePlayerConfig.ts`
- [X] T028 [US1] Implement real Python function validator for `def cell(health, nearby):` style functions in `src/engine/validation/validateUserFunction.ts`
- [X] T029 [US1] Implement allowed action code literal validation in `src/engine/actions/parseActionCode.ts`
- [X] T030 [US1] Implement safe nearby argument validation helpers in `src/engine/validation/buildFunctionArgs.ts`
- [X] T031 [US1] Implement row-numbered editor presentation in `src/components/CodeEditor.tsx`
- [X] T032 [US1] Update player edit behavior to clear confirmation after name, color, or function changes in `src/components/CodeEditor.tsx`
- [X] T033 [US1] Add explicit Validate and Confirm controls for each player in `src/components/CodeEditor.tsx`
- [X] T034 [US1] Update Play button enabling logic to require two confirmed valid players in `src/components/CodeEditor.tsx`
- [X] T035 [US1] Replace setup cheat-sheet text with MVP action codes and `health`/`nearby` Python guidance in `src/components/CodeEditor.tsx`

**Checkpoint**: Configuration is independently usable and blocks Play until both players are valid and confirmed.

## Phase 4: User Story 2 - Start a Locked Local Match (Priority: P1)

**Goal**: Starting a match creates the fixed board, one fully random cell per player, turn 1, fixed 5000 turn limit, and locked configuration.

**Independent Test**: Start from valid configuration and verify initial board, initial cells, turn state, locked edit controls, and newly random placement on reload.

### Tests for User Story 2

- [X] T036 [P] [US2] Add board dimension and position boundary tests in `src/tests/engine/board.test.ts`
- [X] T037 [P] [US2] Add occupied-square and empty-square tests for compact occupancy lookup in `src/tests/engine/boardOccupancy.test.ts`
- [X] T038 [P] [US2] Add initial match creation and random distinct initial-cell tests in `src/tests/engine/createInitialMatch.test.ts`
- [X] T039 [P] [US2] Add tests proving initial placement is newly random on new match and simulation reload in `src/tests/engine/createInitialMatchRandomness.test.ts`
- [X] T040 [P] [US2] Add match lock tests for names, colors, functions, rules, turn limit, and initial conditions in `src/tests/engine/matchLock.test.ts`
- [ ] T041 [P] [US2] Add UI match lock test for paused simulation in `src/tests/ui/matchLock.test.tsx`

### Implementation for User Story 2

- [X] T042 [US2] Implement board creation helpers with compact occupancy support in `src/engine/board/createBoard.ts`
- [X] T043 [US2] Implement position boundary and neighbor helpers in `src/engine/board/position.ts`
- [X] T044 [US2] Implement occupancy helpers for empty and occupied squares in `src/engine/board/occupancy.ts`
- [X] T045 [US2] Implement fully random distinct initial match creation in `src/engine/match/createInitialMatch.ts`
- [X] T046 [US2] Implement match reload/new-match random placement behavior in `src/engine/match/createInitialMatch.ts`
- [X] T047 [US2] Implement match lock state transitions in `src/engine/match/matchState.ts`
- [X] T048 [US2] Remove custom turn-limit editing from configuration UI in `src/components/CodeEditor.tsx`
- [X] T049 [US2] Update simulation start flow to use engine initial match instead of `spawnStartingCells` in `src/App.tsx`

**Checkpoint**: A locked match can start with fixed MVP initial conditions and fully random starting placement.

## Phase 5: User Story 3 - Run the Turn-Based Cell Simulation (Priority: P1)

**Goal**: The engine executes deterministic turns and resolves move, eat, reproduce, rest, validation, execution, and victory without age.

**Independent Test**: Controlled board states prove action rules, turn order, newborn behavior, death removal, function execution, validation, and victory outcomes.

### Tests for User Story 3

- [X] T050 [P] [US3] Add action parser tests for all valid and invalid action codes in `src/tests/engine/parseActionCode.test.ts`
- [X] T051 [P] [US3] Add move resolver tests for inside, outside, occupied, allied, and enemy destination cases in `src/tests/engine/resolveMove.test.ts`
- [X] T052 [P] [US3] Add eat resolver tests for enemy, allied, empty, outside, 5 damage, no healing, and death removal in `src/tests/engine/resolveEat.test.ts`
- [X] T053 [P] [US3] Add reproduction resolver tests for empty target, occupied target, outside target, odd health split, total health preservation, and newborn metadata in `src/tests/engine/resolveReproduce.test.ts`
- [X] T054 [P] [US3] Add rest resolver tests for +3 health, full-health cap, and action consumption in `src/tests/engine/resolveRest.test.ts`
- [X] T055 [P] [US3] Add deterministic turn order tests using creation turn, start row, start column, and internal ID in `src/tests/engine/turnOrder.test.ts`
- [X] T056 [P] [US3] Add newborn-does-not-act and dead-cell-skips-action tests in `src/tests/engine/turnEngine.test.ts`
- [X] T057 [P] [US3] Add victory tests for one team eliminated, both teams eliminated, turn 5000 completion, living-cell tiebreak, health tiebreak, and draw in `src/tests/engine/evaluateVictory.test.ts`
- [X] T058 [P] [US3] Add manual End Simulation winner tests using living cells, total health, and draw tiebreaks in `src/tests/engine/evaluateVictory.test.ts`
- [X] T059 [P] [US3] Add function execution wrapper tests for `health`/`nearby` args, read-only data, runtime errors, infinite loops, and timeout behavior in `src/tests/engine/executeUserFunction.test.ts`
- [X] T060 [P] [US3] Add no-age regression test covering engine types and turn order behavior in `src/tests/engine/noAgeRegression.test.ts`
- [X] T061 [P] [US3] Add board update performance tests proving turn execution does not copy or recreate the full 100x200 board on every tick in `src/tests/engine/boardUpdatePerformance.test.ts`

### Implementation for User Story 3

- [X] T062 [US3] Implement strict action code parser in `src/engine/actions/parseActionCode.ts`
- [X] T063 [US3] Implement move resolver using compact occupancy updates in `src/engine/actions/resolveMove.ts`
- [X] T064 [US3] Implement eat resolver using compact occupancy updates and immediate death removal in `src/engine/actions/resolveEat.ts`
- [X] T065 [US3] Implement reproduction resolver using compact occupancy updates in `src/engine/actions/resolveReproduce.ts`
- [X] T066 [US3] Implement rest resolver in `src/engine/actions/resolveRest.ts`
- [X] T067 [US3] Implement read-only `health` and `nearby` function argument builder in `src/engine/validation/buildFunctionArgs.ts`
- [X] T068 [US3] Implement user function execution wrapper with real Python syntax safety and timeout handling in `src/engine/validation/executeUserFunction.ts`
- [X] T069 [US3] Implement deterministic turn engine without full-board recreation per tick in `src/engine/turns/turnEngine.ts`
- [X] T070 [US3] Implement victory resolver with turn-limit and manual-end tiebreaks in `src/engine/victory/evaluateVictory.ts`
- [X] T071 [US3] Replace demo turn execution import usage from `src/utils/simulation.ts` with engine calls in `src/App.tsx`
- [X] T072 [US3] Remove age, aging damage, random execution order, action health costs, attack healing, reproduction minimum health, and full-board tick recreation from active runtime paths in `src/utils/simulation.ts`

**Checkpoint**: Engine rules are test-covered and runnable without React rendering.

## Phase 6: User Story 4 - View Simulation State and Controls (Priority: P2)

**Goal**: Existing UI displays real engine state, speed controls, and efficient board updates while preserving the mockup visual identity.

**Independent Test**: Start a match and verify board, turn, stats, controls, speed control, invalid action errors, and locked configuration display correctly.

### Tests for User Story 4

- [ ] T073 [P] [US4] Add adapter tests for compact `GameViewState` mapping in `src/tests/engine/gameViewState.test.ts`
- [ ] T074 [P] [US4] Add simulation screen rendering tests for board, turn, fixed turn limit, stats, and locked controls in `src/tests/ui/simulationScreen.test.tsx`
- [ ] T075 [P] [US4] Add simulation speed control rendering and change tests in `src/tests/ui/simulationSpeed.test.tsx`
- [ ] T076 [P] [US4] Add board rendering tests proving `GameBoard` consumes compact cell view data without requiring a full 100x200 board array in `src/tests/ui/gameBoardPerformance.test.tsx`
- [ ] T077 [P] [US4] Add invalid-action error panel tests in `src/tests/ui/logsPanel.test.tsx`

### Implementation for User Story 4

- [ ] T078 [US4] Implement compact engine-to-UI adapter in `src/engine/adapters/gameViewState.ts`
- [ ] T079 [US4] Update shared UI types to match engine view state without age and with simulation speed in `src/types.ts`
- [ ] T080 [US4] Adapt board component to render compact engine cell view fields in `src/components/GameBoard.tsx`
- [ ] T081 [US4] Adapt sidebar stats to remove age labels and use living cells and total health in `src/components/SidebarStats.tsx`
- [ ] T082 [US4] Adapt control bar to fixed 5000 turn limit and add End Simulation plus speed controls in `src/components/ControlBar.tsx`
- [ ] T083 [US4] Adapt logs panel to show invalid-action errors only in `src/components/LogsPanel.tsx`
- [ ] T084 [US4] Create or adapt simulation screen composition with speed control support in `src/screens/SimulationScreen.tsx`
- [ ] T085 [US4] Connect simulation screen to compact engine view state and speed state in `src/App.tsx`

**Checkpoint**: Simulation screen reflects real engine state and keeps the existing visual design.

## Phase 7: User Story 5 - Finish and Restart a Match (Priority: P2)

**Goal**: Players see correct final results, including manual End Simulation results, and can return to editable configuration for a new match.

**Independent Test**: Force each termination cause and verify the final screen and restart behavior.

### Tests for User Story 5

- [ ] T086 [P] [US5] Add final result rendering tests for winner, draw, final turn, termination cause, living cells, and total health in `src/tests/ui/finalResultScreen.test.tsx`
- [ ] T087 [P] [US5] Add manual End Simulation final screen tests for living-cell, health, and draw tiebreak outcomes in `src/tests/ui/manualEndResult.test.tsx`
- [ ] T088 [P] [US5] Add new-match reset flow tests proving configuration unlocks and next initial placement is random in `src/tests/ui/newMatchFlow.test.tsx`

### Implementation for User Story 5

- [ ] T089 [US5] Adapt final result component to `MatchResultView` including `manual-end` termination cause in `src/components/FinalResults.tsx`
- [ ] T090 [US5] Create or adapt final result screen composition in `src/screens/FinalResultScreen.tsx`
- [ ] T091 [US5] Connect manual End Simulation, finished match state, and new-match reset flow in `src/App.tsx`

**Checkpoint**: Final screen accurately reports match outcome and returns to editable setup.

## Phase 8: Polish and Cross-Cutting Cleanup

**Purpose**: Remove out-of-scope demo paths, update docs, and verify the whole MVP.

- [X] T092 Remove or isolate unused Gemini and external AI references in `.env.example`
- [X] T093 Remove unused final-MVP dependencies for `@google/genai`, `express`, `dotenv`, and `@types/express` from `package.json` if no code imports them
- [X] T094 Remove or isolate demo-only interpreter helper APIs that expose full enemy/friend lists in `src/utils/interpreter.ts`
- [X] T095 Remove or isolate demo-only simulation runtime from `src/utils/simulation.ts`
- [X] T096 Update component copy that contradicts MVP rules in `src/components/CodeEditor.tsx`
- [X] T097 Update component copy that mentions age or senior nodes in `src/components/SidebarStats.tsx`
- [X] T098 Update component copy for final result termination causes in `src/components/FinalResults.tsx`
- [ ] T099 Update docs to describe real Python `health`/`nearby` contract in `docs/`
- [X] T100 Run full test suite with `npm test`
- [X] T101 Run type check with `npm run lint`
- [X] T102 Run production build with `npm run build`
- [X] T103 Fix failing tests, type errors, and build errors in affected `src/` files
- [ ] T104 Validate quickstart scenarios from `specs/001-battle-cells-mvp/quickstart.md`
- [ ] T105 Update implementation notes in `docs/10-ui-inventory.md`
- [ ] T106 Update demo cleanup notes in `docs/11-demo-code-audit.md`
- [ ] T107 Update README MVP run/test instructions in `README.md`
- [X] T108 Confirm no active code path implements age, aging damage, death by age, age-based execution order, broad user function context, or full-board tick recreation across `src/`

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup and UI Inspection**: Must complete before changing UI or runtime behavior.
- **Phase 2 Foundational Engine Contracts**: Depends on Phase 1; blocks engine story work.
- **US1 Configuration and Validation**: Depends on Phase 2; can begin before full turn engine exists.
- **US2 Locked Match Start**: Depends on Phase 2 and benefits from US1 validation.
- **US3 Simulation Engine**: Depends on Phase 2 and board helpers from US2.
- **US4 Simulation UI**: Depends on US2 and US3 engine state.
- **US5 Final Result UI**: Depends on US3 victory state and US4 adapter.
- **Polish**: Depends on desired user stories being complete.

### User Story Order

- **US1**: Configure and validate players, establishes Play gate.
- **US2**: Start a locked local match.
- **US3**: Run the turn-based simulation.
- **US4**: View simulation state and controls.
- **US5**: Finish and restart a match.

### Within Each User Story

- Tests come before implementation tasks.
- Engine tests precede engine modules.
- Engine modules precede React integration.
- React components consume adapter/view state, not business rules.
- No task may introduce age, aging damage, death by age, age-based execution order, broad user function context, or full-board tick recreation.

## Parallel Opportunities

- T001-T007 can be split across UI files during inspection.
- T019-T026 can run in parallel after Phase 2.
- T036-T041 can run in parallel after board/match type contracts exist.
- T050-T061 can run in parallel by resolver/test area.
- T073-T077 can run in parallel after adapter contract is known.
- T086-T088 can run in parallel after final result contract is known.
- T092-T099 can run in parallel after feature behavior is connected.

## Parallel Example: User Story 3

```bash
Task: "T051 Add move resolver tests in src/tests/engine/resolveMove.test.ts"
Task: "T052 Add eat resolver tests in src/tests/engine/resolveEat.test.ts"
Task: "T053 Add reproduction resolver tests in src/tests/engine/resolveReproduce.test.ts"
Task: "T054 Add rest resolver tests in src/tests/engine/resolveRest.test.ts"
```

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete US1, US2, and US3 to produce a test-covered playable engine.
3. Complete US4 to show the engine through the preserved UI.
4. Complete US5 to close the match loop.
5. Complete cleanup and verification.

### TDD Discipline

For every core rule, write or update the Vitest test first, confirm it fails for
the missing/demo behavior, then implement the smallest engine change to pass.

### Existing UI Discipline

Keep the existing visual components wherever possible. Adapt props, state, and
copy; do not replace the whole UI from zero.
