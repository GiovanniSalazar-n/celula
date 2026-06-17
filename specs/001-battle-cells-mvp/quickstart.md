# Quickstart: Validate Battle of Cells MVP

## Prerequisites

- Node.js available locally.
- Project dependencies installed with `npm install`.
- Battle of Cells MVP implementation completed from this plan.

## Commands

Install dependencies:

```bash
npm install
```

Run type checks:

```bash
npm run lint
```

Run tests:

```bash
npm test
```

Run the local app:

```bash
npm run dev
```

Open the local Vite URL shown by the dev server.

## Validation Scenario 1: Player Configuration and Play Gate

1. Open the configuration screen.
2. Confirm Player 1 and Player 2 setup cards are visible.
3. Clear Player 1 name.
4. Verify Play is blocked and a clear validation error is available.
5. Enter unique names and colors for both players.
6. Enter or load valid Python functions for both players, using the documented
   direct-argument shape such as `def cell(health, nearby):`.
7. Verify both function editors show row numbers.
8. Validate both functions.
9. Confirm both players.
10. Verify Play becomes available only after both players are valid and
    confirmed.

Expected outcome: invalid setup blocks Play; valid setup enables Play.

## Validation Scenario 1A: Function Context Safety

Use automated tests and the editor validation flow to verify:

- Valid functions receive only current `health` and `nearby` neighbor states.
- `nearby` contains exactly the eight surrounding states and only `empty`,
  `allied`, `enemy`, or `outside`.
- Functions cannot access board state, full cell lists, team objects, turn
  objects, internal IDs, mutable cells, or engine internals.
- Functions reject imports, file access, network access, eval, exec, dangerous
  builtins, dynamic action returns, mutation attempts, infinite loops, and
  execution longer than 1 second.

Expected outcome: player code has the smallest allowed read-only surface and
unsafe code blocks confirmation.

## Validation Scenario 2: Match Lock

1. Start a valid match.
2. Verify the simulation starts at turn 1.
3. Verify the board is fixed at 100 rows by 200 columns.
4. Restart or reload into a new simulation and verify initial positions are
   newly random rather than reused.
5. Try to edit player names, colors, functions, turn limit, rules, or initial
   conditions.
6. Pause the simulation and try the same edits.

Expected outcome: configuration remains locked after Play, including while
paused.

## Validation Scenario 3: Core Action Rules

Use automated tests and controlled match states to validate:

- Movement succeeds only into empty inside-board squares.
- Movement into outside or occupied squares fails and consumes action.
- Eat targets only neighboring enemies.
- Eat deals exactly 5 damage and does not heal attacker.
- Eat can kill and immediately remove a cell.
- Reproduction works into empty neighboring squares.
- Reproduction splits health and preserves total health.
- Newborn cells do not act on the creation turn.
- Rest heals 3 and never exceeds 100.

Expected outcome: all documented action behavior passes tests.

## Validation Scenario 4: Turn Order and Victory

Use automated tests and controlled match states to validate:

- Turn starts at 1.
- Eligible cells are alive at turn start.
- Newborn cells wait until the next turn.
- Execution order is creation turn, start row, start column, internal ID.
- Age is absent from the model and never affects order.
- Turn 5000 executes fully before turn-limit result.
- Turn-limit winner is living cells, then total health, then draw.
- Manual End Simulation winner is living cells, then total health, then draw.

Expected outcome: deterministic repeated runs with the same state produce the
same action order and result.

## Validation Scenario 5: UI Preservation

1. Compare the running app to the existing mockup visual identity.
2. Verify the dark neon HUD, player sidebars, board canvas, control bar, logs
   panel, and result card remain recognizable.
3. Verify age labels and custom turn-limit controls are removed or replaced with
   MVP-compliant text.
4. Verify simulation speed controls are visible during simulation and changing
   speed does not unlock match configuration.
5. Verify board updates do not rely on recreating or copying the full 100 x 200
   board on every tick.
6. Verify Gemini/API requirements are not needed to run the MVP.

Expected outcome: UI is adapted, not rebuilt, and no out-of-scope service is
required.

## Validation Scenario 6: Final Result Flow

1. Run or test a match where Team 1 eliminates Team 2.
2. Run or test a match where both teams are eliminated.
3. Run or test a match that reaches the turn limit.
4. Run or test a match where the user manually ends the simulation.
5. Verify final screen shows winner or draw, player names, living cells, total
   health, final turn, and termination cause.
6. Return to configuration.

Expected outcome: each final state is accurate, and a new match can be started
from editable configuration.

## Validation Scenario 7: Editor Language v2

Use automated tests and the editor validation flow to verify:

- A bounded `for` loop over `nearby` validates and executes.
- A bounded `for` loop using `range(...)` validates and executes.
- `while`, `while true`, recursion, async code, imports, file access, network
  access, `eval`, `exec`, `Function`, `fetch`, `window`, `document`,
  `localStorage`, and dynamic global access are rejected.
- Safe helpers `range`, `len`, `sum`, `any`, `isEnemy`, and `emptyDirections`
  work only with safe read-only values.
- Step limit stops excessive execution before it can freeze the simulation.
- The existing 1 second timeout still rejects long-running execution.
- Runtime errors, step-limit failures, and timeouts consume only the current
  cell action.
- Previous MVP templates and tests still pass unchanged.

Expected outcome: Editor Language v2 allows simple bounded strategies while
keeping user code isolated from engine state.

## Validation Scenario 8: Selectable Turn Limit

1. Open the configuration screen.
2. Verify the default turn limit is 5000.
3. Select a documented preset up to 10000.
4. Start a valid match.
5. Verify the selected turn limit is displayed on the simulation screen.
6. Verify turn-limit selection is locked after Play.
7. Use automated tests to prove turn N executes fully before turn-limit victory
   evaluation for the selected value.
8. Repeat with the default 5000 value and verify existing MVP behavior still
   passes.

Expected outcome: turn limit is configurable only within bounded presets,
defaults to 5000, locks after Play, and does not change core action rules.
