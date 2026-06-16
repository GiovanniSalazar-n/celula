# Business Rules - Battle of Cells MVP

## Game Type

Battle of Cells is a local turn-based simulation for two players.

## Objective

Each player programs the behavior of their cells, validates their function, and presses Play to run the simulation.

## Board

- Fixed size: 100 rows x 200 columns.
- No obstacles.
- No resources.
- No external food.
- No more than one cell per square.
- Outside-board positions are invalid.

## Match Lock

After Play is pressed:

- Code cannot be edited.
- Player names cannot be edited.
- Colors cannot be edited.
- Rules cannot be edited.
- Initial conditions cannot be edited.

Pause only stops visualization or automatic execution. It does not unlock editing.

## Cell Attributes

Each cell has:

- Internal ID.
- Team.
- Team color.
- Position.
- Health.
- Life status.
- Creation turn.

Cells do not have age in the MVP.

Health range: 0 to 100.

A cell dies at 0 health and is immediately removed.

## Actions

Each living cell performs one action per turn:

- Move.
- Eat.
- Reproduce.
- Rest.

If an action is valid by code but impossible on the board, the action is canceled and the cell loses its action.

## Movement

- One square per turn.
- Eight directions.
- Destination must be inside the board.
- Destination must be empty.
- Moving into an allied or enemy cell is canceled.
- Movement does not attack.

## Eat

- Eat uses prefix `a`.
- A cell may eat only enemy cells in a neighboring square.
- Damage: 5 health points.
- Allied cells cannot be eaten.
- Empty, outside, or allied target cancels the action.
- Eat does not heal the attacker.

## Reproduction

- Reproduction uses prefix `r`.
- Destination must be inside the board and empty.
- New cell belongs to the same team.
- Original cell splits health with the new cell.
- If health is odd, the original keeps the extra point.
- Newborn cell does not act on the same turn.
- No age condition is required.
- No minimum age or maximum age exists.
- No minimum health requirement exists unless added later to the requirements.

## Rest

- Rest code is `d`.
- Rest restores 3 health points.
- Health cannot exceed 100.

## Turn System

- The global turn starts at 1.
- Cells created during a turn do not act during that same turn.
- Actions are resolved one by one.
- The board updates immediately after each valid action.
- If a cell dies before its turn to act, it does not act.

## Execution Order

Do not use age for execution order.

Use this deterministic order:

1. Only cells alive at the start of the turn are eligible to act.
2. Newborn cells created during the current turn are not eligible until the next turn.
3. Sort eligible cells by `creationTurn` ascending.
4. If tied, sort by start-of-turn row ascending.
5. If tied, sort by start-of-turn column ascending.
6. If tied, sort by internal cell ID.

## Victory

The match ends when:

1. Only one team remains alive.
2. Both teams have no living cells.
3. Turn limit is reached.

Default turn limit: 5000.

Turn 5000 executes fully before final evaluation.

Victory by turn limit:

1. Most living cells wins.
2. If tied, highest total health wins.
3. If still tied, draw.
