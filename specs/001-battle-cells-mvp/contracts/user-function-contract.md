# User Function Contract: Battle of Cells MVP

Players write a real Python function that chooses one action for a cell. The
function cannot mutate the game and receives only direct arguments for the
current cell health and the eight nearby neighbor states.

## Function Shape

```python
def cell(health, nearby):
    if health < 50:
        return "d"
    return "mn"
```

The exact function name may be defined by implementation and documented in the
editor. The player-facing contract must remain direct arguments rather than a
full internal game context.

## Allowed Arguments

- `health`: current cell health.
- `nearby`: compact representation of exactly the eight neighboring square
  states around the current cell.

The function must not receive board state, full cell lists, team objects, turn
objects, internal IDs, mutable cell references, or internal engine state.

## Neighbor States

- `empty`
- `allied`
- `enemy`
- `outside`

## Direction Codes

- `n`
- `s`
- `e`
- `w`
- `ne`
- `nw`
- `se`
- `sw`

## Action Codes

**Move**:
- `mn`
- `ms`
- `me`
- `mw`
- `mne`
- `mnw`
- `mse`
- `msw`

**Eat**:
- `an`
- `as`
- `ae`
- `aw`
- `ane`
- `anw`
- `ase`
- `asw`

**Reproduce**:
- `rn`
- `rs`
- `re`
- `rw`
- `rne`
- `rnw`
- `rse`
- `rsw`

**Rest**:
- `d`

## Allowed Syntax

- Function definition.
- Python syntax that can be validated and run within the MVP safety limits.
- `if`, `elif`, and `else` conditionals.
- Boolean comparisons against allowed argument values.
- Literal string returns containing valid action codes.
- Comments and blank lines.

## Forbidden Syntax and Behavior

- Imports.
- File access.
- Network access.
- `eval`.
- `exec`.
- Dangerous built-ins or global object access.
- Dynamic return string construction.
- Direct mutation of health, position, team, board, turn, or internal game
  state.
- Access to full board state, full ally/enemy lists, team objects, turn objects,
  mutable cell references, or hidden cell IDs.
- Infinite loops or long-running execution.
- Execution longer than 1 second.

## Validation Outcomes

Valid function:
- Player can be confirmed.
- Match can start when both players are confirmed.

Invalid function:
- Player cannot be confirmed.
- Play remains blocked.
- Clear validation error is shown.

## Runtime Outcomes

Runtime error or timeout:
- Acting cell loses its action for that turn.
- Error is recorded.
- Simulation continues unless an end condition is reached.

Valid but impossible action:
- Action is canceled.
- Acting cell loses its action.
- Invalid action error may be shown in the simulation error panel.
