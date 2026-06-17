# Research: Editor Language v2

## Decision: Deliver Turn Selector First

**Rationale**: The turn selector is independent of the user-code runtime and can
be tested without touching action rules. It gives an early safe increment while
preserving default 5000-turn behavior.

**Alternatives considered**:
- Implement language runtime first. Rejected because it touches validation,
  execution, and safety boundaries before the simpler UI/configuration change.

## Decision: Preserve Current Validation Public Surface

**Rationale**: Existing UI and tests already depend on validation functions.
Keeping wrapper compatibility lowers regression risk while allowing internals to
move into narrower modules.

**Alternatives considered**:
- Replace the validator from scratch. Rejected because the MVP already works and
  the feature explicitly says not to rewrite.

## Decision: Use Allow-Listed Helpers

**Rationale**: Only named helpers from the spec should be callable. This keeps
the safe language small and testable.

**Alternatives considered**:
- Expose broad builtins. Rejected because user code must not access dangerous
  APIs or internal state.

## Decision: Static Rejection Plus Runtime Step Limit

**Rationale**: Static validation catches forbidden syntax before Play, while a
step limit protects simulation turns from excessive but syntactically valid
work.

**Alternatives considered**:
- Timeout only. Rejected because timeout alone can still make dense simulations
  feel unresponsive before the timeout fires.

## Decision: Read-Only Neighbor Helper Context

**Rationale**: Helpers such as `isEnemy("n")` and `emptyDirections()` should
read only the current cell's eight neighbor states. They must not receive board,
cell, player, or match objects.

**Alternatives considered**:
- Pass richer board or team data. Rejected because it violates the project
  function safety contract.
