# Data Model: Editor Language v2

## Turn Limit Setting

Represents the pre-match maximum turn count.

- `value`: integer from 1 to 10000
- `default`: 5000
- `locked`: true after Play

Validation:

- Values below 1 are rejected or corrected before Play.
- Values above 10000 are rejected or corrected before Play.
- The selected value cannot change during a match.

## Editor Language Function

Represents a player-authored behavior function.

- `source`: editor text
- `validationResult`: success or error list
- `acceptedHelpers`: allow-listed helper names only
- `returns`: one valid action code

Validation:

- Must not use forbidden syntax or globals.
- Must not access mutable game state.
- Must return a valid action code.

## Safe Helper

Represents a callable helper exposed to user code.

- `name`: approved helper name
- `kind`: value helper or read-only game helper
- `inputs`: safe primitive values, arrays, or direction codes
- `output`: safe primitive value or direction list

Validation:

- Helper must be explicitly allow-listed.
- Helper must not mutate inputs or engine state.

## Read-Only Neighbor Context

Represents the only game context available to player code beyond health.

- `nearby`: exactly eight neighbor states
- `directionOrder`: `n`, `s`, `e`, `w`, `ne`, `nw`, `se`, `sw`
- `states`: `empty`, `allied`, `enemy`, `outside`

Validation:

- Must not include board coordinates, cell IDs, player objects, match objects,
  mutable cells, or mutation methods.

## Runtime Failure

Represents a cell-level execution failure during simulation.

- `kind`: runtime error, timeout, or step limit
- `message`: user-facing clear error
- `cellId`: current acting cell only
- `turn`: current turn

Behavior:

- Only the current cell loses its action.
- The match continues unless normal victory conditions are reached.
