# Contract: Editor Language v2

## Function Shape

Player code keeps the existing shape:

```python
def cell(health, nearby):
    return "d"
```

The function receives only:

- `health`
- `nearby`
- approved helper bindings

It must not receive board, cells, team, turn, match, position, internal IDs, or
mutable engine objects.

## Allowed Helpers

Value helpers:

- `range(start, end)`
- `len(value)`
- `min(...values)`
- `max(...values)`
- `abs(value)`
- `round(value)`
- `floor(value)`
- `ceil(value)`
- `sum(values)`
- `any(values)`
- `all(values)`
- `clamp(value, min, max)`

Read-only game helpers:

- `isEnemy(direction)`
- `isAllied(direction)`
- `isEmpty(direction)`
- `isOutside(direction)`
- `enemyDirections()`
- `emptyDirections()`
- `alliedDirections()`

## Allowed Loops

Allowed:

- bounded `for` loops over safe finite sources
- loops over `range(...)` when the range is bounded
- loops over safe arrays
- loops over helper direction lists

Forbidden:

- all `while` loops
- `while true`
- recursion
- async loops
- loops over unknown or unbounded sources

## Forbidden Syntax And Globals

Validation must reject:

- `import`
- `require`
- `eval`
- `Function`
- `exec`
- file access
- network access
- `window`
- `document`
- `localStorage`
- `fetch`
- direct mutation of game state
- direct internal engine access
- recursion
- unbounded loops
- async code
- promises
- `setTimeout`
- `setInterval`

## Runtime Contract

- Runtime errors consume only the current cell action.
- Timeout consumes only the current cell action.
- Step-limit failure consumes only the current cell action.
- Simulation continues unless normal victory conditions are reached.

## Turn Limit Contract

- Default is 5000.
- User may choose 1 to 10000 before Play.
- Selected value locks after Play.
- The final selected turn executes completely before victory evaluation.
