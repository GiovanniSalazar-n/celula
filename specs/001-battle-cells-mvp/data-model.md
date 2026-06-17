# Data Model: Battle of Cells MVP

## Board

Represents the fixed simulation area.

**Fields**:
- `rows`: fixed value `100`
- `columns`: fixed value `200`
- `cells`: collection of living cells
- `occupancy`: compact lookup for occupied squares

**Validation Rules**:
- Board size never changes during a match.
- Row positions are valid only from `0` to `99`.
- Column positions are valid only from `0` to `199`.
- No square may contain more than one living cell.
- Outside-board positions are invalid.
- Runtime updates avoid unnecessary full-board recreation or full copying on
  every simulation tick.

## Position

Represents a board coordinate.

**Fields**:
- `row`: integer
- `column`: integer

**Validation Rules**:
- `row` must be within board rows.
- `column` must be within board columns.

## Player

Represents one of exactly two local players.

**Fields**:
- `id`: stable player/team identifier
- `name`: non-empty display name
- `color`: selected team color
- `functionSource`: Python-based behavior function text
- `isFunctionValid`: validation status
- `validationError`: current validation error, if any
- `isConfirmed`: whether player is ready for Play

**Validation Rules**:
- Exactly two players exist in the MVP.
- Names cannot be empty.
- Names cannot be repeated.
- Color is required.
- Function source is required.
- Player cannot be confirmed unless function is valid.
- Editing name, color, or function after confirmation clears confirmation until
  validation/confirmation is repeated.
- Locked matches prevent edits.

## Cell

Represents a game unit controlled by a player function.

**Fields**:
- `id`: internal cell identifier
- `teamId`: owning player/team identifier
- `color`: owning team color
- `position`: current board position
- `health`: integer from `0` to `100`
- `isAlive`: life status
- `creationTurn`: turn when the cell was created
- `lastAction`: optional last attempted action code
- `lastActionStatus`: optional status for UI/debugging

**Validation Rules**:
- Cells do not have age.
- Health cannot exceed `100`.
- A cell dies when health reaches `0`.
- Dead cells are removed immediately from the board.
- A living eligible cell acts at most once per turn.
- A newborn cell does not act on the turn it is created.

## Match

Represents the full local game state.

**Fields**:
- `players`: exactly two players
- `board`: fixed board
- `currentTurn`: current turn, starting at `1`
- `turnLimit`: selected turn limit, default value `5000`, maximum `10000`
- `status`: configuration, ready, running, paused, or finished
- `isLocked`: whether configuration is locked
- `errors`: invalid action and runtime errors for display
- `result`: final result when finished
- `simulationSpeed`: playback speed for automatic simulation display

**State Transitions**:
- `configuration` -> `ready`: both players confirmed and functions valid
- `ready` -> `running`: Play is pressed, board is created, initial cells spawn
- `running` -> `paused`: Pause is pressed
- `paused` -> `running`: Play/resume is pressed
- `running` or `paused` -> `finished`: end condition or End Simulation
- `finished` -> `configuration`: user starts a new match

**Validation Rules**:
- `isLocked` becomes true when Play starts a match.
- Locked matches cannot edit players, colors, functions, rules, turn limit, or
  initial conditions.
- Pause does not unlock editing.
- Simulation speed may change during a locked match because it controls display
  pacing, not match rules or initial conditions.
- Manual End Simulation finishes the match with the current leader selected by
  living cells, then total health, then draw.
- Starting or reloading a match creates newly random initial cell positions.

## Action Code

Literal string returned by a user function.

**Valid Move Codes**:
- `mn`, `ms`, `me`, `mw`, `mne`, `mnw`, `mse`, `msw`

**Valid Eat Codes**:
- `an`, `as`, `ae`, `aw`, `ane`, `anw`, `ase`, `asw`

**Valid Reproduce Codes**:
- `rn`, `rs`, `re`, `rw`, `rne`, `rnw`, `rse`, `rsw`

**Valid Rest Code**:
- `d`

**Validation Rules**:
- Any other return value fails validation before Play.
- A valid code that is impossible on the board consumes the cell action and is
  recorded as an invalid action during simulation.

## Direction

One of eight neighboring directions.

**Values**:
- `n`, `s`, `e`, `w`, `ne`, `nw`, `se`, `sw`

**Validation Rules**:
- `o`, `no`, `so`, and other aliases are invalid for the MVP.

## Neighbor State

Read-only state exposed to user functions for adjacent squares.

**Values**:
- `empty`
- `allied`
- `enemy`
- `outside`

## Cell Function Arguments

The only gameplay data a user function may read.

**Fields**:
- `health`: current cell health
- `nearby`: exactly the eight neighboring square states

**Validation Rules**:
- Function arguments are read-only snapshots.
- `nearby` may contain only `empty`, `allied`, `enemy`, and `outside` values.
- Board state, full cell lists, team objects, turn objects, internal IDs,
  mutable cell references, mutation methods, and engine internals are not
  exposed.

## Game Error

Represents a user-facing simulation or validation problem.

**Fields**:
- `turn`
- `playerId`
- `cellId`
- `type`
- `message`

**Validation Rules**:
- Simulation screen error panel shows invalid action errors only.
- Validation errors appear on the configuration screen.

## Team Stats

Aggregated state for display.

**Fields**:
- `teamId`
- `playerName`
- `color`
- `livingCells`
- `totalHealth`

## Match Result

Final outcome.

**Fields**:
- `winnerTeamId`: optional, absent for draw
- `isDraw`
- `finalTurn`
- `terminationCause`
- `teamStats`

**Termination Causes**:
- `team-eliminated`
- `both-teams-eliminated`
- `turn-limit`
- `manual-end`

**Validation Rules**:
- Automatic MVP victory causes are team eliminated, both teams eliminated, and
  turn limit.
- The selected final turn executes completely before turn-limit evaluation.
- Turn-limit winner is selected by living cells, then total health, then draw.
- Manual-end winner is selected by living cells, then total health, then draw.

## Editor Language v2 Additions

### Editor Language Runtime

Represents the isolated runtime boundary for player-authored functions.

**Fields**:
- `source`: player function text.
- `safeContext`: read-only values and approved helpers.
- `stepBudget`: maximum runtime steps allowed for one function call.
- `timeoutMs`: maximum elapsed runtime, default 1000.
- `compiledFunction`: cached executable representation when validation passes.

**Validation Rules**:
- Runtime receives only current `health`, current `nearby`, and approved helper
  bindings.
- Runtime must not receive board state, teams, turn objects, internal IDs,
  mutable cells, mutation methods, browser globals, or network/file APIs.
- Runtime errors, step-limit failures, or timeouts consume only the current
  acting cell action.
- Existing dense-colony performance fixes must remain active.

### Safe Context

Read-only data made available to a user function.

**Fields**:
- `health`: current cell health.
- `nearby`: exactly eight neighbor states in direction order
  `n, s, e, w, ne, nw, se, sw`.
- `helpers`: approved helper functions.

**Validation Rules**:
- `health` and `nearby` are immutable snapshots.
- `nearby` may contain only `empty`, `allied`, `enemy`, or `outside`.
- Helpers must not mutate input values or engine state.

### Safe Helper

Approved helper available in Editor Language v2.

**Values**:
- `range`
- `len`
- `sum`
- `any`
- `isEnemy`
- `emptyDirections`

**Validation Rules**:
- Helpers are allow-listed by name.
- `range` must produce a finite bounded sequence.
- `len`, `sum`, and `any` operate only on safe arrays or primitive values.
- `isEnemy` evaluates neighbor states only.
- `emptyDirections` returns direction codes for empty neighboring positions only.

### Step Budget

Limits the amount of work one function call may perform.

**Fields**:
- `maxSteps`: implementation-defined safe maximum.
- `usedSteps`: current function-call step count.
- `error`: step-limit error when the maximum is exceeded.

**Validation Rules**:
- Each loop iteration and helper iteration consumes steps.
- Exceeding the budget returns a runtime error for the current cell action only.
- Step limits supplement, but do not replace, the 1 second timeout.

### Turn Limit Configuration

Selectable match turn limit for the v2 configuration flow.

**Fields**:
- `selectedTurnLimit`: selected number of turns.
- `allowedTurnLimits`: bounded preset values.
- `defaultTurnLimit`: `5000`.
- `maxTurnLimit`: `10000`.

**Validation Rules**:
- Existing behavior defaults to 5000.
- Values must come from documented presets and must not exceed 10000.
- The selected turn limit locks after Play.
- Turn `selectedTurnLimit` executes fully before turn-limit victory evaluation.
