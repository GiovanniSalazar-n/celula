# Test Plan - Battle of Cells MVP

## Testing Strategy

The project must follow Test-Driven Development for core game logic.

Core rules must be tested before or alongside implementation.

The game engine must be testable without React UI.

## Recommended Test Tool

Use Vitest for unit tests.

## Test Categories

### 1. Board Tests

Test that:

- Board has 100 rows.
- Board has 200 columns.
- Positions outside the board are invalid.
- Two cells cannot occupy the same square.
- Empty squares can be detected.
- Occupied squares can be detected.

### 2. Player Configuration Tests

Test that:

- Two players are required.
- Player names cannot be empty.
- Player names cannot be repeated.
- Player colors are required.
- Player functions are required.
- Invalid functions block confirmation.
- Valid functions allow confirmation.
- Play is blocked until both players are confirmed.

### 3. Match Lock Tests

Test that after Play:

- Player names cannot be edited.
- Player colors cannot be edited.
- User functions cannot be edited.
- Rules cannot be changed.
- Initial cells cannot be changed.
- Pause does not unlock editing.

### 4. Movement Tests

Test that:

- A cell can move to an empty neighboring square.
- A cell cannot move outside the board.
- A cell cannot move into an allied cell.
- A cell cannot move into an enemy cell.
- Failed movement consumes the cell action.
- Movement does not damage enemies.

### 5. Eat Tests

Test that:

- A cell can eat an enemy in a neighboring square.
- Eat causes 5 damage.
- Eat can kill an enemy cell.
- Dead enemy cells are removed immediately.
- A cell cannot eat an allied cell.
- A cell cannot eat an empty square.
- A cell cannot eat outside the board.
- Failed eat consumes the cell action.
- Eat does not heal the attacker.

### 6. Reproduction Tests

Test that:

- A cell can reproduce into an empty neighboring square.
- A cell cannot reproduce outside the board.
- A cell cannot reproduce into an occupied square.
- Reproduction consumes the cell action.
- New cell belongs to the same team.
- Health is split evenly when health is even.
- Original cell keeps the extra point when health is odd.
- Total health is preserved after reproduction.
- Newborn cell does not act during the same turn.

### 7. Rest Tests

Test that:

- Rest recovers 3 health.
- Rest consumes the cell action.
- Health cannot exceed 100.
- A cell at 100 health can rest but does not gain extra health.

### 8. Function Validation Tests

Test that:

- Valid literal action returns are accepted.
- Invalid action returns are rejected.
- Loops are rejected.
- Imports are rejected.
- Dangerous calls are rejected.
- Non-literal dynamic returns are rejected.
- Timeout causes validation failure.
- Errors are shown clearly.

### 9. Turn System Tests

Test that:

- Turn starts at 1.
- Cells act once per turn.
- Dead cells do not act.
- Newborn cells wait until the next turn.
- Board updates immediately after each valid action.
- Later cells interact with the current board state.
- Execution order uses creation turn, start row, start column, and internal ID.
- Execution order does not use age.

### 10. Victory Tests

Test that:

- Match ends when only one team remains.
- Match ends in draw if both teams are eliminated.
- Turn 5000 executes fully.
- At turn limit, living cells are compared first.
- If living cells are tied, total health is compared.
- If living cells and total health are tied, result is draw.

### 11. UI Integration Tests

Test that:

- Configuration screen blocks Play when invalid.
- Simulation screen displays board and stats.
- Simulation screen prevents editing after Play.
- Final screen shows winner or draw.
- Final screen allows starting a new match.
