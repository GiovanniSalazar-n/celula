# Open Decisions - Battle of Cells

This file exists to prevent the coding agent from inventing rules when the requirements and flow diagram are not fully aligned.

## Decision 1: Age and Aging

### Final Decision

Age is not part of the MVP.

Ignore all age references from the flow diagram.

Do not implement:

- Cell age.
- Aging damage.
- Age-based death.
- Age-based reproduction restrictions.
- Age-based execution priority.
- Removing cells because they reached a certain age.

Cells only die when their health reaches 0.

## Decision 2: Execution Order

### Final Decision

Do not use age for execution order.

Use this deterministic MVP order:

1. Only cells that were alive at the start of the turn are eligible to act.
2. Cells created during the current turn do not act until the next turn.
3. Sort eligible cells by `creationTurn` ascending.
4. If tied, sort by row at the start of the turn.
5. If tied, sort by column at the start of the turn.
6. If tied, sort by internal cell ID.

## Decision 3: Reproduction Minimum Health

### Final Decision

Do not require minimum health for reproduction unless added later to the business requirements.

For the MVP:

- A living cell may attempt reproduction.
- The target square must be inside the board.
- The target square must be empty.
- The returned reproduction code must be valid.
- The original cell splits its current health with the new cell.
- If health is odd, the original keeps the extra point.
- The total health must be preserved.

## Decision 4: Direction Code for West

### Final Decision

Use `w` for west.

Valid west-related action codes are:

- `mw`
- `aw`
- `rw`

Do not use `o` in implementation.

## Decision 5: Eat Naming

### Final Decision

Use:

- UI label: `Eat`.
- Code prefix: `a`.

Example:

```ts
return "ae";

This means the cell attempts to eat an enemy to the east.