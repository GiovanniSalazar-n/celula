# Editor Language v2 Contract

Editor Language v2 extends the existing Battle of Cells behavior-function
contract. It must not expose engine internals or change core game rules.

## Function Shape

```python
def cell(health, nearby):
    for state in nearby:
        if isEnemy(state):
            return "an"
    return "d"
```

The function still receives only:

- `health`: current cell health.
- `nearby`: exactly eight neighboring square states in this direction order:
  `n, s, e, w, ne, nw, se, sw`.

## Return Contract

The function must return one documented action code.

Valid codes remain:

- Move: `mn`, `ms`, `me`, `mw`, `mne`, `mnw`, `mse`, `msw`
- Eat: `an`, `as`, `ae`, `aw`, `ane`, `anw`, `ase`, `asw`
- Reproduce: `rn`, `rs`, `re`, `rw`, `rne`, `rnw`, `rse`, `rsw`
- Rest: `d`

## Allowed Syntax

Editor Language v2 allows:

- Function definition.
- `if`, `elif`, and `else`.
- Local variables.
- Comparisons and boolean expressions.
- Literal valid action-code returns.
- Bounded `for` loops.
- Calls to approved helper functions only.
- Comments and blank lines.

## Bounded Loop Rules

Allowed loop sources:

- `for state in nearby:`
- `for i in range(<bounded value>):`
- `for direction in emptyDirections(nearby):`

Validation must reject:

- Any `while` loop.
- `while true`.
- Recursive calls to `cell`.
- Loops over unknown, dynamic, or unapproved sources.
- Async loops or async functions.

Runtime must also enforce a step limit. If the step limit is exceeded, the
current cell loses its action and a clear runtime error is recorded.

## Approved Helpers

### `range(...)`

Returns a finite bounded sequence for `for` loops.

Rules:
- Must not create unbounded or excessively large sequences.
- Must consume runtime steps when iterated.

### `len(value)`

Returns the length of safe arrays or strings.

Rules:
- Must not inspect engine objects.
- Must not mutate the input.

### `sum(values)`

Returns the sum of safe numeric values.

Rules:
- Must not execute callbacks.
- Must consume steps proportional to the values inspected.

### `any(values)`

Returns whether any value is truthy.

Rules:
- Must not execute callbacks.
- Must consume steps proportional to inspected values.

### `isEnemy(value)`

Returns true when `value` is the neighbor state `enemy`.

Rules:
- Accepts only neighbor states or safe primitive values.
- Must not inspect board, team, or cell objects.

### `emptyDirections(nearby)`

Returns direction codes for neighboring states equal to `empty`.

Rules:
- Uses direction order `n, s, e, w, ne, nw, se, sw`.
- Returns only valid direction codes.
- Does not expose positions, board state, cell IDs, or mutable cells.

## Forbidden Syntax And Globals

Validation must reject:

- Imports.
- File access.
- Network access.
- `eval`.
- `exec`.
- `Function`.
- `fetch`.
- `window`.
- `document`.
- `localStorage`.
- `globalThis`.
- Dangerous builtins or dynamic global access.
- Async functions or `await`.
- Recursion.
- Direct mutation of `health`, `nearby`, helpers, board, turn, team, cell, or
  internal state.

## Runtime Outcomes

Valid return:
- The engine resolves that action using existing MVP rules.

Valid code but impossible action:
- The action is canceled and consumes the cell action.

Runtime error:
- Only the current cell loses its action.
- The match continues unless an end condition is reached.

Step limit or timeout:
- The current cell loses its action.
- A clear error is recorded.
- The simulation continues unless an end condition is reached.

## Turn Limit Configuration Contract

Editor Language v2 also plans bounded turn-limit selection.

Rules:
- Default remains `5000`.
- Supported presets must be bounded and may include `10000`.
- The selected turn limit locks after Play.
- Turn N executes fully before turn-limit victory evaluation.
- Existing MVP behavior must remain unchanged when `5000` is selected.
