# User Function Contract

## Purpose

Each player writes a function that controls the behavior of their cells. The function decides which action a cell will attempt to perform during its turn.

The function does not directly modify the game state. It only returns an action code.

## Function Restrictions

The function must follow these rules:

- Syntax is based on Python.
- Only simple conditionals are allowed in the MVP.
- Return values must be literal valid strings.
- Dynamically generated returns are not accepted in the MVP.
- MVP functions originally disallowed loops. Editor Language v2 allows only
  bounded `for` loops described in the addendum below.
- Imports are not allowed.
- File access is not allowed.
- Network access is not allowed.
- `eval` is not allowed.
- `exec` is not allowed.
- Dangerous function calls are not allowed.
- Maximum execution time is 1 second.

## Function Input Data

The function may receive only direct arguments provided by the system:

- Current cell health.
- The 8 neighboring square states.

The function must not access:

- Full enemy cell list.
- Full allied cell list.
- Internal game engine state.
- Hidden cell identifiers.
- Board mutation methods.
- Health mutation methods.
- Position mutation methods.

## Neighbor States

Each neighboring square must be represented as one of these states:

| State | Meaning |
|---|---|
| `empty` | The square exists and is unoccupied. |
| `allied` | The square exists and contains a cell from the same team. |
| `enemy` | The square exists and contains a rival cell. |
| `outside` | The square does not exist because it is outside the board. |

## Directions

| Direction | Code |
|---|---|
| North | `n` |
| South | `s` |
| East | `e` |
| West | `w` |
| Northeast | `ne` |
| Northwest | `nw` |
| Southeast | `se` |
| Southwest | `sw` |

## Valid Move Codes

| Code | Action |
|---|---|
| `mn` | Move north |
| `ms` | Move south |
| `me` | Move east |
| `mw` | Move west |
| `mne` | Move northeast |
| `mnw` | Move northwest |
| `mse` | Move southeast |
| `msw` | Move southwest |

## Valid Eat Codes

| Code | Action |
|---|---|
| `an` | Eat north |
| `as` | Eat south |
| `ae` | Eat east |
| `aw` | Eat west |
| `ane` | Eat northeast |
| `anw` | Eat northwest |
| `ase` | Eat southeast |
| `asw` | Eat southwest |

## Valid Reproduce Codes

| Code | Action |
|---|---|
| `rn` | Reproduce north |
| `rs` | Reproduce south |
| `re` | Reproduce east |
| `rw` | Reproduce west |
| `rne` | Reproduce northeast |
| `rnw` | Reproduce northwest |
| `rse` | Reproduce southeast |
| `rsw` | Reproduce southwest |

## Valid Rest Code

| Code | Action |
|---|---|
| `d` | Rest |

## Invalid Return Behavior

If the function returns a code that is not valid:

- The function must fail validation before the match starts.
- The player cannot be confirmed.
- The match cannot start.

If a function returns a valid code but the action cannot be executed because of board conditions:

- The action is canceled.
- The cell loses its action for that turn.
- The game continues.

## Runtime Error Behavior

If the function fails during simulation:

- The cell loses its action for that turn.
- The error is shown in the error panel.
- The simulation continues unless an end condition is reached.

## Timeout Behavior

If the function takes more than 1 second:

- Display the error message: `Timed out`.
- During validation, the function is rejected.
- During simulation, the cell loses its action.

## Editor Language v2 Addendum

Editor Language v2 extends the MVP editor language without exposing more engine
state. The function still receives only direct `health` and `nearby` arguments.

Additional allowed syntax:

- Bounded `for` loops over approved finite sources such as `nearby`,
  `range(...)`, and `emptyDirections(nearby)`.
- Local variables.
- Approved helpers: `range`, `len`, `sum`, `any`, `isEnemy`, and
  `emptyDirections`.

Still forbidden:

- `while` loops, including `while true`.
- Recursion.
- Imports.
- File access.
- Network access.
- `eval`.
- `exec`.
- `Function`.
- `fetch`.
- Browser globals such as `window`, `document`, and `localStorage`.
- Async code.
- Mutation of `health`, `nearby`, board, cells, team, turn, or internal state.

Runtime protection:

- A step limit must stop excessive execution.
- The 1 second timeout still applies.
- Runtime errors, step-limit failures, and timeouts consume only the current
  cell action.
