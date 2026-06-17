# Research: Battle of Cells MVP

## Decision: Preserve Existing UI as Presentation Layer

**Decision**: Keep the current React component visual structure and adapt it to
real engine state instead of rebuilding the UI.

**Rationale**: The constitution and spec require the UI from
`Adudu02/First-Try-for-Cell-Battle-UI` to remain the visual foundation. Current
components already provide the desired neon lab HUD, board canvas, player
sidebars, control bar, logs panel, and result card.

**Alternatives considered**:
- Rebuild UI from scratch: rejected because it violates the constitution.
- Keep demo simulation unchanged: rejected because it contains forbidden rules
  such as age, random turn order, variable attack damage, and reproduction
  health thresholds.

## Decision: Build Pure TypeScript Engine Under `src/engine`

**Decision**: Implement all business rules in pure TypeScript modules under
`src/engine`, then expose a small adapter for React.

**Rationale**: This keeps rules testable without rendering UI and prevents React
components from deciding movement, eat, reproduction, turn order, victory, or
function safety.

**Alternatives considered**:
- Keep rules in `App.tsx` and `src/utils/simulation.ts`: rejected because the
  existing utilities mix demo behavior with UI-facing state and contain MVP
  violations.
- Add backend services for simulation: rejected because the MVP is local-only
  and no backend API is allowed.

## Decision: Use Vitest for Test-Driven Core Rules

**Decision**: Add Vitest and use it for unit tests under `src/tests/engine` and
focused UI integration tests under `src/tests/ui`.

**Rationale**: The project is a Vite/TypeScript app, and docs recommend Vitest.
Vitest can test pure engine modules quickly and fits the existing toolchain.

**Alternatives considered**:
- Jest: workable but adds more setup than needed for a Vite app.
- Browser-only manual testing: rejected because core rules require automated
  coverage before or alongside implementation.

## Decision: Fixed 5000 Turn Limit in Engine and UI

**Decision**: Treat 5000 as the fixed MVP turn limit. Existing UI settings for
100, 1000, or 10000 turns must be removed, disabled, or converted to display-only
for the MVP.

**Rationale**: The spec and constitution require a fixed turn limit and full
execution of turn 5000 before turn-limit evaluation.

**Alternatives considered**:
- Keep selectable turn limits: rejected as custom rule configuration outside the
  MVP.

## Decision: Remove Age From Domain Model and UI

**Decision**: Remove age fields, age displays, aging decay, and age-based labels.
Use `creationTurn` only for deterministic ordering.

**Rationale**: Age is explicitly deprecated for the MVP. Cells die only when
health reaches 0.

**Alternatives considered**:
- Keep age visually as "cycles": rejected because it can mislead implementation
  and contradicts source-of-truth docs.

## Decision: User Functions Use Real Python Syntax With Minimal Direct Arguments

**Decision**: Validate and execute real Python function syntax using a documented
shape similar to `def cell(health, nearby):`. The only gameplay data exposed to
player code is current cell health and the eight nearby neighbor states. Reject
imports, file/network access, eval, exec, dangerous builtins, state mutation,
dynamic returns, invalid action codes, infinite loops, and execution longer than
1 second.

**Rationale**: The latest spec and overview require Python-based syntax. The MVP
needs predictable, safe, local behavior functions that cannot mutate game state
or inspect full board internals. The direct-argument shape is easier for players
than a broad context object and keeps the algorithm surface intentionally small.

**Alternatives considered**:
- TypeScript-like user functions: rejected for this plan because the latest
  accepted spec says Python-based syntax.
- Broad `context` object with board, turn, health totals, position, and presence
  flags: rejected because the clarified spec limits the contract to current
  health and nearby neighbor states only.
- Keep existing helper functions such as `nearest_enemy()` and `random_direction()`:
  rejected because the spec limits the function context to current health and
  nearby neighbor states.

## Decision: Fully Random Initial Placement Per Match/Reload

**Decision**: Generate new random, distinct starting positions for the two
initial cells every time a match starts or the simulation is reloaded.

**Rationale**: The clarified spec explicitly requires fully random initial
placement for normal gameplay, with no fixed seed or reused placement.

**Alternatives considered**:
- Fixed seed for gameplay: rejected because it would make normal matches repeat
  placements.
- Reusing previous placement after reload: rejected because reload should produce
  a new random simulation.

## Decision: Manual End Simulation Uses Current Leader Tiebreak

**Decision**: When the user manually ends the simulation, produce a final result
with termination cause `manual-end` and decide the current leader by living cell
count, then total health, then draw.

**Rationale**: This makes End Simulation a complete MVP flow and matches the
same leader calculation used for turn-limit outcomes.

**Alternatives considered**:
- Always draw on manual end: rejected because the clarified spec asks for the
  current leader.
- Hide final result on manual end: rejected because the final result screen must
  communicate the termination cause.

## Decision: Simulation Speed Control Is UI State, Not Match Configuration

**Decision**: Add a simulation speed control to the simulation screen. Speed
changes affect automatic playback pacing but do not unlock or mutate locked
match configuration, rules, code, colors, names, initial conditions, or turn
limit.

**Rationale**: Players need control over viewing pace while the match rules
remain immutable after Play.

**Alternatives considered**:
- Fixed speed only: rejected because the clarified spec requires a speed control.
- Treat speed as editable match configuration: rejected because configuration is
  locked after Play.

## Decision: Avoid Full Board Recreation on Every Tick

**Decision**: Represent board occupancy and UI view updates so each tick updates
only changed cell/occupancy data instead of recreating or copying the full
20,000-square board.

**Rationale**: The fixed 100 x 200 board is large enough that whole-board
recreation per cycle is wasteful and explicitly disallowed by the clarified
spec.

**Alternatives considered**:
- Rebuild a 100 x 200 matrix every turn for convenience: rejected because it
  violates the performance requirement.
- Let React derive a full board grid from scratch every render: rejected for the
  same reason; the board component should consume compact cell/occupancy view
  data.

## Decision: Contract-First UI Adapter

**Decision**: Expose engine state to React through a `GameViewState` adapter with
players, cells, stats, errors, match status, current turn, turn limit, and final
result.

**Rationale**: The existing UI can retain layout while switching from demo
arrays to contract-compliant state. This gives React a stable read model and
keeps business rules in the engine.

**Alternatives considered**:
- Let components call individual engine resolvers directly: rejected because it
  spreads business logic into presentation code.

## Decision: Isolate or Remove Demo AI/Gemini and Express Artifacts

**Decision**: Remove unused final-MVP dependencies and environment requirements
for `GEMINI_API_KEY`, Express, and dotenv if no implementation code needs them;
otherwise isolate them so the Battle of Cells MVP does not require them.

**Rationale**: The MVP must run without external AI services or backend APIs.
`package.json` and `.env.example` currently imply external/API runtime needs that
are out of scope.

**Alternatives considered**:
- Keep the dependencies and env file unchanged: rejected for final MVP because
  it can falsely signal a backend or AI requirement.

## Decision: Editor Language v2 Extends the Existing Contract

**Decision**: Keep `def cell(health, nearby):` as the player-facing function
shape and extend only the language/runtime features around it. Editor Language
v2 allows bounded `for` loops and approved helpers while preserving direct
`health` and `nearby` arguments only.

**Rationale**: Existing MVP behavior and templates already depend on this
minimal contract. Extending the current validator/executor is safer than
introducing a new broad context object or exposing engine internals.

**Alternatives considered**:
- Replace the editor language entirely: rejected because it would risk changing
  working MVP behavior and templates.
- Add a full `context` object: rejected because it would broaden the user-code
  surface beyond the current safety contract.

## Decision: Bounded `for` Loops Only

**Decision**: Permit only statically bounded `for` loops over approved finite
sources such as `range(...)`, `nearby`, or helper outputs like
`emptyDirections(nearby)`. Reject all `while` loops, including `while true`, and
reject recursion.

**Rationale**: Players need simple iteration for counting nearby states and
choosing directions, but unbounded loops are the main safety and performance
risk. Static validation plus runtime step limiting gives two layers of
protection.

**Alternatives considered**:
- Continue rejecting all loops: rejected because v2 explicitly asks to permit
  loops.
- Allow `while` with a guard: rejected because proving termination is more
  complex and easier to get wrong.

## Decision: Safe Helper Runtime Module

**Decision**: Add helper definitions under `src/engine/runtime/safeHelpers.ts`
and expose only approved helpers through `createSafeContext`. Planned helpers:
`range`, `len`, `sum`, `any`, `isEnemy`, and `emptyDirections`.

**Rationale**: Helpers make common strategies easier while keeping the exposed
data surface small. Helpers operate on read-only primitive values and neighbor
state arrays, not on mutable cells or board objects.

**Alternatives considered**:
- Let user functions call arbitrary JavaScript/Python builtins: rejected because
  it would expose unsafe capabilities and browser globals.
- Add many board-aware helpers: rejected because the contract must not expose
  full board state, full cell lists, teams, IDs, or mutation APIs.

## Decision: Forbidden Syntax Is Its Own Validation Module

**Decision**: Move forbidden syntax checks into
`src/engine/validation/forbiddenSyntax.ts` and helper allow-list metadata into
`src/engine/validation/allowedHelpers.ts`.

**Rationale**: The current validator is becoming responsible for parsing,
security, allowed returns, and runtime policy. Splitting these concerns makes
tests clearer and prevents future safety rules from being hidden in a single
large function.

**Alternatives considered**:
- Keep adding regexes inside `validateUserFunction.ts`: rejected because v2 adds
  enough forbidden syntax cases that a dedicated module is easier to audit.

## Decision: Step Limit Plus Timeout

**Decision**: Add `src/engine/runtime/stepLimiter.ts` and enforce a maximum
runtime step budget in addition to the existing 1 second timeout.

**Rationale**: Timeout protects elapsed time, while step limiting protects the
main thread from excessive iterations in cases that execute quickly but too
often. Runtime errors from step limits must consume only the current cell action.

**Alternatives considered**:
- Timeout only: rejected because the browser can become unresponsive before a
  timeout check is observed.
- Worker-only execution: deferred because v2 can improve safety inside the
  current local architecture first.

## Decision: Selectable Turn Limit Is a Bounded v2 Extension

**Decision**: Add a configurable turn-limit setting with default `5000` and
bounded presets up to `10000`. The selected value locks after Play and turn N
must execute completely before turn-limit victory evaluation.

**Rationale**: The new request explicitly asks for a way to choose the number of
turns. Keeping default 5000 preserves existing MVP behavior, while bounded
presets prevent arbitrary long simulations from becoming a performance trap.

**Alternatives considered**:
- Keep only fixed 5000: rejected for Editor Language v2 because turn selection
  is explicitly requested.
- Allow arbitrary numeric input: rejected because it increases validation,
  performance, and UX risk without clear MVP value.
