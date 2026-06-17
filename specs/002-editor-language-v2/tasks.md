# Tasks: Editor Language v2

**Input**: Design documents from `specs/002-editor-language-v2/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/editor-language-v2-contract.md`, `quickstart.md`

**Tests**: Required before or alongside implementation. Existing MVP behavior must keep passing.

**Organization**: Tasks are ordered for safe incremental implementation, with the turn selector first per user priority.

## Phase 1: User Story 5 - Choose Match Turn Limit (Priority: First Increment)

**Goal**: Add a pre-match turn selector from 1 to 10000, defaulting to 5000, locked after Play.

**Independent Test**: Select turn limits 1, 5000, and 10000 before Play, start a match, verify the value locks, and verify turn-limit victory evaluates only after the selected final turn executes.

### Tests for User Story 5

- [X] T001 [P] [US5] Add turn-limit configuration tests for 1, 5000, 10000, and out-of-range values in `src/tests/engine/playerConfig.test.ts`
- [X] T002 [P] [US5] Add match-lock tests proving turn limit cannot change after Play in `src/tests/engine/matchLock.test.ts`
- [X] T003 [P] [US5] Add selected-final-turn victory tests in `src/tests/engine/evaluateVictory.test.ts`
- [X] T004 [P] [US5] Add configuration UI tests for turn selector display, validation, and locking in `src/tests/ui/configurationScreen.test.tsx`

### Implementation for User Story 5

- [X] T005 [US5] Add turn-limit constants and type fields in `src/engine/constants/gameConstants.ts` and `src/engine/types/game.ts`
- [X] T006 [US5] Validate turn limit in player or match configuration flow in `src/engine/validation/validatePlayerConfig.ts`
- [X] T007 [US5] Persist selected turn limit during match creation and lock it after Play in `src/engine/match/createInitialMatch.ts` and `src/engine/match/matchState.ts`
- [X] T008 [US5] Evaluate turn-limit victory using selected turn limit in `src/engine/victory/evaluateVictory.ts`
- [X] T009 [US5] Add the existing-style turn selector control in `src/App.tsx` and `src/components/ControlBar.tsx`

**Checkpoint**: Turn selector works independently and does not change any game action rule.

---

## Phase 2: Inspection and Baseline Protection

**Purpose**: Inspect current validation/runtime/editor files and protect existing MVP behavior before extending the language.

- [X] T010 Inspect current validation and execution flow in `src/engine/validation/validateUserFunction.ts`, `src/engine/validation/executeUserFunction.ts`, and `src/engine/validation/buildFunctionArgs.ts`
- [X] T011 Inspect current editor examples and feedback in `src/components/CodeEditor.tsx` and `src/App.tsx`
- [X] T012 Inspect current runtime test coverage in `src/tests/engine/validateUserFunction.test.ts` and `src/tests/engine/executeUserFunction.test.ts`
- [X] T013 [P] Add missing baseline tests for existing valid MVP templates in `src/tests/engine/validateUserFunction.test.ts`
- [X] T014 [P] Add missing baseline tests for runtime errors consuming only the current cell action in `src/tests/engine/executeUserFunction.test.ts`
- [X] T015 [P] Add missing baseline editor validation feedback tests in `src/tests/ui/codeEditor.test.tsx`

**Checkpoint**: Existing behavior has regression tests before v2 runtime changes.

---

## Phase 3: User Story 1 - Write Bounded Strategies (Priority: P1)

**Goal**: Let players validate and run bounded `for` loops with approved safe value helpers.

**Independent Test**: A strategy using a bounded loop plus helpers such as `range`, `len`, `min`, `max`, `sum`, and `any` validates and can run in a match.

### Tests for User Story 1

- [ ] T016 [P] [US1] Add validation tests for safe value helpers in `src/tests/engine/validateUserFunction.test.ts`
- [ ] T017 [P] [US1] Add execution tests for safe value helpers in `src/tests/engine/executeUserFunction.test.ts`
- [ ] T018 [P] [US1] Add bounded `for` loop validation tests for `range`, safe arrays, and helper direction lists in `src/tests/engine/validateUserFunction.test.ts`
- [ ] T019 [P] [US1] Add bounded loop execution tests in `src/tests/engine/executeUserFunction.test.ts`

### Implementation for User Story 1

- [ ] T020 [US1] Add safe value helper allow-list metadata in `src/engine/validation/allowedHelpers.ts`
- [ ] T021 [US1] Implement safe value helpers in `src/engine/runtime/safeHelpers.ts`
- [ ] T022 [US1] Extend validator support for bounded `for` loops in `src/engine/validation/validateUserFunction.ts`
- [ ] T023 [US1] Wire helper execution into the runtime wrapper in `src/engine/validation/executeUserFunction.ts`

**Checkpoint**: Bounded-loop strategies and safe value helpers work without exposing engine state.

---

## Phase 4: User Story 2 - Use Read-Only Game Helpers (Priority: P1)

**Goal**: Let players use direction helpers that read only the current cell neighbor context.

**Independent Test**: Strategies using `isEnemy("n")`, `emptyDirections()`, and related helpers validate and execute against only the eight neighbor states.

### Tests for User Story 2

- [ ] T024 [P] [US2] Add tests proving `nearby` exposes only eight neighbor states in `src/tests/engine/buildFunctionArgs.test.ts`
- [ ] T025 [P] [US2] Add validation tests for read-only game helpers in `src/tests/engine/validateUserFunction.test.ts`
- [ ] T026 [P] [US2] Add execution tests for `isEnemy`, `isAllied`, `isEmpty`, `isOutside`, `enemyDirections`, `emptyDirections`, and `alliedDirections` in `src/tests/engine/executeUserFunction.test.ts`
- [ ] T027 [P] [US2] Add mutation-rejection tests for helper context in `src/tests/engine/validateUserFunction.test.ts`

### Implementation for User Story 2

- [ ] T028 [US2] Create read-only safe context builder in `src/engine/runtime/createSafeContext.ts`
- [ ] T029 [US2] Implement read-only game helpers in `src/engine/runtime/safeHelpers.ts`
- [ ] T030 [US2] Route current `health` and `nearby` arguments through the safe context in `src/engine/validation/buildFunctionArgs.ts` and `src/engine/validation/executeUserFunction.ts`

**Checkpoint**: Helper strategies read neighbor state without board, player, match, cell ID, or mutable object access.

---

## Phase 5: User Story 3 - Reject Dangerous Code Clearly (Priority: P1)

**Goal**: Reject forbidden syntax before Play with clear errors.

**Independent Test**: Forbidden examples fail validation and cannot be saved or used to start a match.

### Tests for User Story 3

- [ ] T031 [P] [US3] Add forbidden syntax tests for imports, require, eval, exec, Function, fetch, browser globals, promises, timers, async code, and direct game-state access in `src/tests/engine/validateUserFunction.test.ts`
- [ ] T032 [P] [US3] Add recursion rejection tests in `src/tests/engine/validateUserFunction.test.ts`
- [ ] T033 [P] [US3] Add unbounded loop rejection tests for `while`, `while True`, unknown loop sources, and excessive static ranges in `src/tests/engine/validateUserFunction.test.ts`
- [ ] T034 [P] [US3] Add editor error message tests for forbidden syntax in `src/tests/ui/codeEditor.test.tsx`

### Implementation for User Story 3

- [ ] T035 [US3] Extract forbidden syntax checks into `src/engine/validation/forbiddenSyntax.ts`
- [ ] T036 [US3] Integrate forbidden syntax errors into `src/engine/validation/validateUserFunction.ts`
- [ ] T037 [US3] Improve user-facing validation messages in `src/components/CodeEditor.tsx`

**Checkpoint**: Unsafe code is blocked before match start with clear feedback.

---

## Phase 6: User Story 4 - Continue Match After Runtime Failures (Priority: P2)

**Goal**: Stop excessive execution and isolate runtime failures to the current acting cell.

**Independent Test**: Runtime error, timeout, and step-limit failures consume only the current cell action and the match continues.

### Tests for User Story 4

- [ ] T038 [P] [US4] Add step-limit tests for excessive bounded loops in `src/tests/engine/executeUserFunction.test.ts`
- [ ] T039 [P] [US4] Add timeout regression tests in `src/tests/engine/executeUserFunction.test.ts`
- [ ] T040 [P] [US4] Add turn-engine integration tests proving runtime failure consumes only current cell action in `src/tests/engine/turnEngine.test.ts`

### Implementation for User Story 4

- [ ] T041 [US4] Implement runtime step counter in `src/engine/runtime/stepLimiter.ts`
- [ ] T042 [US4] Add runtime error types and messages in `src/engine/runtime/runtimeErrors.ts`
- [ ] T043 [US4] Enforce step limit and timeout behavior in `src/engine/validation/executeUserFunction.ts`
- [ ] T044 [US4] Ensure turn engine records runtime failures without ending the match in `src/engine/turns/turnEngine.ts`

**Checkpoint**: Long or failing user code no longer threatens the simulation loop.

---

## Phase 7: Editor Guidance and Templates

**Purpose**: Improve help text, examples, and validation feedback while preserving the existing UI.

- [ ] T045 [P] Add v2 examples for loops and helpers in `src/engine/runtime/examples.ts`
- [ ] T046 Update editor help text for valid action codes, helpers, loops, and forbidden syntax in `src/components/CodeEditor.tsx`
- [ ] T047 Update player configuration template wiring in `src/App.tsx`
- [ ] T048 [P] Add UI tests for v2 template insertion and validation feedback in `src/tests/ui/codeEditor.test.tsx`

---

## Phase 8: Verification and Documentation

**Purpose**: Run the full safety net, fix regressions, and update docs.

- [ ] T049 Run all tests with `npm test`
- [ ] T050 Run type checking with `npm run lint`
- [ ] T051 Run production build with `npm run build`
- [ ] T052 Fix any regressions found in `src/engine`, `src/components`, or `src/tests`
- [ ] T053 Update user function documentation in `docs/03-user-function-contract.md`
- [ ] T054 Update test plan documentation in `docs/06-test-plan.md`
- [ ] T055 Update feature quickstart notes in `specs/002-editor-language-v2/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Turn Selector)**: Starts first by user priority and is independently testable.
- **Phase 2 (Inspection and Baseline)**: Must complete before language runtime changes.
- **Phase 3 (Bounded Strategies)**: Depends on Phase 2.
- **Phase 4 (Read-Only Helpers)**: Depends on Phase 2; can share helper infrastructure with Phase 3.
- **Phase 5 (Forbidden Syntax)**: Depends on Phase 2 and should complete before broad runtime rollout.
- **Phase 6 (Runtime Failures)**: Depends on Phases 3 and 5.
- **Phase 7 (Editor Guidance)**: Depends on helper and validation behavior being defined.
- **Phase 8 (Verification and Docs)**: Depends on desired implementation phases.

### User Story Dependencies

- **US5**: Independent first increment.
- **US1**: Can start after baseline inspection.
- **US2**: Can start after baseline inspection; integrates with US1 helper surface.
- **US3**: Can start after baseline inspection.
- **US4**: Depends on executable loop/helper behavior and forbidden syntax handling.

### TDD Rule

For each behavior phase, complete tests first and confirm they fail for missing
behavior before implementation.

---

## Parallel Opportunities

- T001-T004 can be written in parallel because they touch different tests.
- T013-T015 can be written in parallel during baseline protection.
- T016-T019 can be written in parallel for US1.
- T024-T027 can be written in parallel for US2.
- T031-T034 can be written in parallel for US3.
- T038-T040 can be written in parallel for US4.
- T045 and T048 can be prepared in parallel with editor copy after runtime examples are defined.

## Parallel Example: US1

```bash
Task: "Add validation tests for safe value helpers in src/tests/engine/validateUserFunction.test.ts"
Task: "Add execution tests for safe value helpers in src/tests/engine/executeUserFunction.test.ts"
Task: "Add bounded loop validation tests for range, safe arrays, and helper direction lists in src/tests/engine/validateUserFunction.test.ts"
```

## Implementation Strategy

1. Ship the turn selector first and verify existing rules are unchanged.
2. Protect existing validation/runtime/editor behavior with tests.
3. Add helper and loop tests before implementation.
4. Add the smallest safe runtime surface that satisfies the tests.
5. Improve editor guidance after behavior is stable.
6. Run all tests, lint, and build before considering the feature complete.
