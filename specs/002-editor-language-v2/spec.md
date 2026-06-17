# Feature Specification: Editor Language v2

**Feature Branch**: `002-editor-language-v2`

**Created**: 2026-06-17

**Status**: Draft

**Input**: User description: "Add a new feature to the existing Battle of Cells MVP: Editor Language v2. The MVP already works. Do not rewrite the game from zero. Preserve the existing UI, engine, rules, and current working behavior. Improve the player algorithm text editor and function validator so users can write slightly more advanced strategies while keeping execution safe."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Write Bounded Strategies (Priority: P1)

A player writes a behavior function that uses bounded loops and safe helper
functions to inspect nearby cells, choose a valid action code, validate the
function, and use it in the existing two-player local match.

**Why this priority**: This is the core value of Editor Language v2: players can
write better strategies without losing the existing safe local game behavior.

**Independent Test**: Can be tested by entering a function with a bounded `for`
loop, safe helpers such as `range`, `len`, `min`, `max`, `sum`, and `any`, then
validating it and starting a match.

**Acceptance Scenarios**:

1. **Given** a player writes a function with a bounded `for` loop over nearby directions, **When** they validate the function, **Then** validation succeeds and the function can be used in a match.
2. **Given** a player writes a function using safe value helpers such as `range`, `len`, `min`, `max`, `sum`, or `any`, **When** they validate the function, **Then** validation succeeds if the function still returns a valid action code.
3. **Given** both players use existing MVP templates without v2 syntax, **When** they validate and start a match, **Then** the existing templates still work.

---

### User Story 2 - Use Read-Only Game Helpers (Priority: P1)

A player uses read-only helper functions such as `isEnemy("n")` and
`emptyDirections()` to make strategy code easier to read without receiving
mutable board, cell, player, or match state.

**Why this priority**: Direction helpers make common player algorithms easier,
while preserving the safety boundary that keeps user code away from internal
game state.

**Independent Test**: Can be tested by validating and running functions that use
`isEnemy`, `isAllied`, `isEmpty`, `isOutside`, `enemyDirections`,
`emptyDirections`, and `alliedDirections`.

**Acceptance Scenarios**:

1. **Given** a player writes `if isEnemy("n"): return "an"`, **When** a cell has an enemy to the north, **Then** the function returns the north eat action.
2. **Given** a player loops over `emptyDirections()`, **When** empty neighbor directions exist, **Then** the function can choose a movement or reproduction action from those directions.
3. **Given** a helper reads neighbor state, **When** it runs, **Then** it cannot mutate the board, cells, health, position, players, or match state.

---

### User Story 3 - Reject Dangerous Code Clearly (Priority: P1)

A player receives clear validation feedback before Play when their algorithm
uses forbidden syntax, dangerous APIs, unbounded loops, recursion, async code,
or direct state access.

**Why this priority**: Safe execution is mandatory; invalid code must never be
saved into a match or allowed to crash the simulation.

**Independent Test**: Can be tested by entering forbidden examples and verifying
that each one is rejected before Play with an understandable error.

**Acceptance Scenarios**:

1. **Given** a player writes `while True`, **When** they validate, **Then** validation fails with a clear unbounded-loop error.
2. **Given** a player writes code using `import`, `require`, `eval`, `exec`, `Function`, `fetch`, `window`, `document`, `localStorage`, promises, timers, or async behavior, **When** they validate, **Then** validation fails before the match can start.
3. **Given** a player writes a recursive function, **When** they validate, **Then** validation fails before the match can start.

---

### User Story 4 - Continue Match After Runtime Failures (Priority: P2)

When a previously validated function fails at runtime, times out, or exceeds the
operation limit, only the current cell loses its action and the match continues
unless a normal victory condition is reached.

**Why this priority**: A complete local simulation should stay resilient even
when one cell's algorithm fails during a turn.

**Independent Test**: Can be tested by running a match with a function that
throws a runtime error or exceeds a step limit and verifying only the acting
cell action is consumed.

**Acceptance Scenarios**:

1. **Given** a validated function causes a runtime error for one cell, **When** that cell acts, **Then** only that cell loses the current action and the simulation continues.
2. **Given** a function exceeds the operation or step limit, **When** that cell acts, **Then** only that cell loses the current action and a clear error is shown.
3. **Given** a function times out, **When** that cell acts, **Then** only that cell loses the current action and the simulation continues.

---

### User Story 5 - Choose Match Turn Limit (Priority: P2)

A player chooses how many turns the simulation may run before Play, with the
turn limit capped at 10000. The selected value locks after Play and does not
change core game rules.

**Why this priority**: Players need control over match duration while preserving
local-only deterministic rules and preventing runaway simulations.

**Independent Test**: Can be tested by selecting turn limits at the lower bound,
default value, and upper cap, then verifying the value locks after Play and the
final selected turn executes fully before turn-limit victory evaluation.

**Acceptance Scenarios**:

1. **Given** a player selects a turn limit between 1 and 10000 before Play, **When** Play is pressed, **Then** the selected limit is locked for that match.
2. **Given** a player selects 10000 turns, **When** the simulation reaches turn 10000, **Then** turn 10000 executes completely before turn-limit victory is evaluated.
3. **Given** a player attempts to select a value outside 1 to 10000, **When** validation runs, **Then** the value is rejected or clamped before Play.

---

### Edge Cases

- A bounded `for` loop has a very large range and exceeds the step limit.
- A loop source is not known to be finite.
- A player attempts `while`, `while true`, recursion, async code, promises, or timers.
- A player attempts `import`, `require`, `eval`, `exec`, `Function`, `fetch`, `window`, `document`, or `localStorage`.
- A player attempts to mutate `health`, `nearby`, board, cells, players, match, position, or team data.
- A helper receives an invalid direction code.
- A helper is called with an unsupported value type.
- A function uses safe helpers but returns an invalid action code.
- A runtime error happens for one cell while other cells remain eligible to act.
- Turn limit is set to 1.
- Turn limit is set to 10000.
- Existing MVP functions without loops or helpers must still validate and run.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The feature MUST extend the existing Battle of Cells MVP without rewriting the game from zero.
- **FR-002**: The feature MUST preserve the existing UI style, player configuration flow, engine rules, board size, actions, victory rules, and current working behavior.
- **FR-003**: Player functions MUST continue to receive only the allowed read-only cell context and MUST NOT receive mutable board, cell, player, match, position, health, or internal engine objects.
- **FR-004**: The editor language MUST allow simple bounded `for` loops over safe finite ranges, arrays, or neighbor directions.
- **FR-005**: The editor language MUST reject unbounded loops, all `while` loops, and `while true`.
- **FR-006**: The editor language MUST reject recursion.
- **FR-007**: The runtime MUST enforce a maximum operation or step limit for each function execution.
- **FR-008**: The runtime MUST keep the existing timeout protection.
- **FR-009**: The editor language MUST allow these safe value helpers: `range(start, end)`, `len(value)`, `min(...values)`, `max(...values)`, `abs(value)`, `round(value)`, `floor(value)`, `ceil(value)`, `sum(values)`, `any(values)`, `all(values)`, and `clamp(value, min, max)`.
- **FR-010**: The editor language MUST allow these read-only game helpers: `isEnemy(direction)`, `isAllied(direction)`, `isEmpty(direction)`, `isOutside(direction)`, `enemyDirections()`, `emptyDirections()`, and `alliedDirections()`.
- **FR-011**: Game helpers MUST read only the current cell's provided neighbor context and MUST NOT mutate board, cells, health, position, players, or match state.
- **FR-012**: The validator MUST reject `import`, `require`, `eval`, `Function`, `exec`, file access, network access, browser globals, promises, timers, async code, direct game-state mutation, direct internal engine access, recursion, and unbounded loops before a match starts.
- **FR-013**: Browser globals forbidden by validation MUST include at least `window`, `document`, `localStorage`, and `fetch`.
- **FR-014**: Timer APIs forbidden by validation MUST include at least `setTimeout` and `setInterval`.
- **FR-015**: Invalid code MUST NOT be saved or used to start a match.
- **FR-016**: Validation errors MUST be clear and visible near the relevant editor or error panel.
- **FR-017**: Runtime errors MUST make only the current cell lose its action for the current turn.
- **FR-018**: Timeout or step-limit errors MUST make only the current cell lose its action for the current turn.
- **FR-019**: The simulation MUST continue after validation-safe runtime failures unless normal victory conditions are reached.
- **FR-020**: The editor MUST keep the existing visual style and MUST NOT be rebuilt from zero.
- **FR-021**: The editor MUST show or improve help text for valid action codes, loops, and helpers.
- **FR-022**: The editor MUST include examples for bounded loops and safe helpers.
- **FR-023**: Action codes MUST remain unchanged from the current MVP.
- **FR-024**: Game rules MUST remain unchanged: no age system, no online multiplayer, no backend, no database, no new actions, no board-size change, and no victory-rule change.
- **FR-025**: Existing MVP tests and behavior MUST continue passing.
- **FR-026**: New tests MUST cover bounded loops, helpers, forbidden syntax, timeout, step limit, runtime error isolation, and existing MVP compatibility.
- **FR-027**: The system MUST allow a user to choose a turn limit from 1 to 10000 before Play.
- **FR-028**: The chosen turn limit MUST lock after Play.
- **FR-029**: Turn-limit victory MUST evaluate only after the selected final turn has executed completely.
- **FR-030**: Values outside the 1 to 10000 turn range MUST be rejected or corrected before Play.

### Key Entities

- **Editor Language Function**: A player-authored behavior function that returns one valid action code using allowed syntax, helpers, and read-only context.
- **Safe Helper**: A permitted helper function that operates only on safe values or the current cell's read-only neighbor context.
- **Read-Only Neighbor Context**: The current cell's eight neighboring states, exposed without internal board, cell, player, or match objects.
- **Validation Result**: The user-facing result of checking a player function before it can be used.
- **Runtime Failure**: An execution-time error, timeout, or step-limit failure that consumes only the current cell action.
- **Turn Limit Setting**: A pre-match value from 1 to 10000 that controls when turn-limit victory is evaluated.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of existing MVP tests continue passing after Editor Language v2 is added.
- **SC-002**: At least one bounded-loop strategy can be validated and used in a match for each player.
- **SC-003**: All listed forbidden syntax and global access examples are rejected before Play in automated tests.
- **SC-004**: Safe value helpers and read-only game helpers are each covered by automated tests and return expected results.
- **SC-005**: Runtime error, timeout, and step-limit cases each affect only the current acting cell in automated tests.
- **SC-006**: A user can understand valid action codes, loop rules, and helper examples from the editor without leaving the configuration screen.
- **SC-007**: Turn limit values 1, 5000, and 10000 are each accepted and locked after Play, while out-of-range values are rejected or corrected.

## Quality Requirements *(mandatory)*

- **QR-001**: Performance target: valid user functions should not make the simulation unresponsive; excessive work must be stopped by a step limit or timeout.
- **QR-002**: Security/data handling: user functions must not access files, network, browser globals, internal engine objects, or mutation APIs.
- **QR-003**: Accessibility/usability: validation errors and helper guidance must be readable and associated with the relevant player editor.
- **QR-004**: Observability/error handling: forbidden syntax, validation failures, runtime errors, timeouts, and step-limit errors must produce clear messages.
- **QR-005**: Manual verification required for unautomated behavior: visually confirm the editor keeps the existing Battle of Cells UI style and configuration flow.
- **QR-006**: Existing UI preservation: the existing editor and configuration screen must be adapted in place rather than replaced.
- **QR-007**: Engine/UI separation: editor validation and runtime behavior must remain separate from UI presentation.
- **QR-008**: User function safety: the safe helper surface must be allow-listed, read-only, bounded, and tested.

## Assumptions

- Existing Battle of Cells MVP behavior on `main` is the baseline and must not be regressed.
- Direction helper functions use the existing direction codes: `n`, `s`, `e`, `w`, `ne`, `nw`, `se`, and `sw`.
- `enemyDirections()`, `emptyDirections()`, and `alliedDirections()` return direction codes in the existing neighbor order.
- Turn limit selection is pre-match configuration and becomes immutable after Play.
- The default turn limit remains 5000 unless the user chooses another value.
