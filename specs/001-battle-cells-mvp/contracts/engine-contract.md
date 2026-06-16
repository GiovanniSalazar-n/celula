# Engine Contract: Battle of Cells MVP

The engine is a pure TypeScript boundary. It owns business rules and exposes
state transitions to the React UI.

## Constants

- `BOARD_ROWS = 100`
- `BOARD_COLUMNS = 200`
- `TURN_LIMIT = 5000`
- `MAX_HEALTH = 100`
- `EAT_DAMAGE = 5`
- `REST_HEAL = 3`
- default simulation speed values for UI playback pacing

## Required Engine Modules

- `src/engine/types/game.ts`
- `src/engine/constants/gameConstants.ts`
- `src/engine/board/createBoard.ts`
- `src/engine/board/position.ts`
- `src/engine/actions/parseActionCode.ts`
- `src/engine/actions/resolveMove.ts`
- `src/engine/actions/resolveEat.ts`
- `src/engine/actions/resolveReproduce.ts`
- `src/engine/actions/resolveRest.ts`
- `src/engine/turns/turnEngine.ts`
- `src/engine/validation/validateUserFunction.ts`
- `src/engine/validation/executeUserFunction.ts`
- `src/engine/victory/evaluateVictory.ts`
- `src/engine/adapters/gameViewState.ts`
- `src/engine/index.ts`

## Public Engine Operations

### `createInitialMatch(players)`

Creates a locked match-ready state after both players are valid and confirmed.

**Inputs**:
- Two confirmed players with unique names, colors, and valid functions.

**Outputs**:
- Match with fixed board, `currentTurn = 1`, `turnLimit = 5000`, one random
  initial cell per player, and `isLocked = true`.

**Rules**:
- Initial positions must be inside the board and distinct.
- Initial positions are newly random on every match start or simulation reload.
- No backend or persistent storage is involved.
- The board model must support compact occupancy lookup and avoid requiring a
  full 100 x 200 matrix copy on every tick.

### `parseActionCode(actionCode)`

Parses a literal action code.

**Outputs**:
- Valid parsed move/eat/reproduce/rest action, or invalid result with reason.

**Rules**:
- Only documented direction and action codes are valid.
- Direction aliases such as `so` or `no` are invalid.

### `resolveMove(match, cell, direction)`

Attempts one-square movement.

**Rules**:
- Destination must be inside board and empty.
- Outside or occupied destination cancels action and consumes action.
- Movement does not damage enemies.

### `resolveEat(match, cell, direction)`

Attempts eat action.

**Rules**:
- Target must be an enemy in a neighboring square.
- Damage is exactly 5 health.
- Empty, outside, or allied target cancels action and consumes action.
- Eat does not heal attacker.
- Cells at 0 health are removed immediately.

### `resolveReproduce(match, cell, direction)`

Attempts reproduction.

**Rules**:
- Destination must be inside board and empty.
- New cell belongs to same team.
- Original and newborn split current health.
- Original keeps the extra point for odd health.
- Newborn does not act this turn.
- No age or minimum health requirement.

### `resolveRest(match, cell)`

Attempts rest.

**Rules**:
- Rest heals 3 health.
- Health cannot exceed 100.
- Action is consumed even at full health.

### `executeTurn(match)`

Executes one full turn.

**Rules**:
- Eligible cells are alive at start of turn.
- Newborn cells created during the current turn are excluded.
- Order: creation turn, start row, start column, internal ID.
- Board updates immediately after each valid action.
- Dead cells do not act.
- Turn 5000 executes fully before final turn-limit evaluation.
- Turn updates should update changed cells/occupancy data without recreating or
  copying the full board every tick.

### `evaluateVictory(match, cause?)`

Returns a result when the match is finished.

**Rules**:
- One team alive means that team wins.
- No teams alive means draw.
- At turn limit, compare living cells, then total health, then draw.
- At manual End Simulation, compare living cells, then total health, then draw,
  and use termination cause `manual-end`.

### `validateUserFunction(source)`

Validates player function source before confirmation.

**Rules**:
- Accepts real Python function syntax with a documented shape similar to
  `def cell(health, nearby):`.
- Exposes only direct `health` and `nearby` arguments to player code.
- `nearby` contains exactly eight neighbor states and only the values `empty`,
  `allied`, `enemy`, or `outside`.
- Rejects imports, file/network access, eval, exec, dangerous builtins, state
  mutation attempts, dynamic returns, invalid action codes, infinite loops, and
  timeouts.
- Does not expose board state, full cell lists, turn objects, team objects,
  internal IDs, mutable cells, or engine internals.

### `executeUserFunction(source, args)`

Executes a previously valid function with read-only direct arguments.

**Rules**:
- Function cannot mutate engine state.
- Function receives only current health and nearby neighbor states.
- Runtime error or timeout consumes action and records error.

### `toGameViewState(match)`

Maps engine match state to UI display state.

**Rules**:
- React consumes this output instead of reading internals or applying rules.
- React receives compact cell/occupancy view data; it must not require
  reconstructing a full 100 x 200 board on every tick.
