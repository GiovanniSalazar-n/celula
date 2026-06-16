# Game Flow - Battle of Cells

## Important Note

The original flow diagram contains references to age and aging. Those references are ignored for the MVP.

The MVP does not implement:

- Cell age.
- Aging damage.
- Death by age.
- Age-based action order.
- Age-based reproduction limits.

Cells only die when their health reaches 0.

## Main Flow

1. Start.
2. Show configuration screen.
3. Player 1 enters name and color.
4. Player 1 writes function.
5. Player 1 validates function.
6. If invalid, show error and ask for correction.
7. If valid, confirm Player 1.
8. Player 2 enters name and color.
9. Player 2 writes function.
10. Player 2 validates function.
11. If invalid, show error and ask for correction.
12. If valid, confirm Player 2.
13. Check both players are confirmed.
14. Validate both functions.
15. If valid, create 100 x 200 board.
16. Create one random initial cell per player.
17. Initialize turn = 1.
18. Show board, current turn, and statistics.
19. User presses Play.
20. Lock match configuration.
21. Start turn cycle.

## Turn Cycle

1. Check if current turn is less than or equal to 5000.
2. If current turn is greater than 5000, end by turn limit.
3. Check if more than one team is alive.
4. If only one team is alive, end by survival.
5. Take a snapshot of living cells at the start of the turn.
6. Exclude cells created during the current turn.
7. Sort eligible living cells by execution priority:
   1. Creation turn ascending.
   2. Start-of-turn row ascending.
   3. Start-of-turn column ascending.
   4. Internal cell ID.
8. Select next living cell.
9. If the cell is no longer alive, skip it.
10. Collect cell and environment data.
11. Send context to the user function.
12. Execute user function.
13. Validate returned action code.
14. Resolve action:
    - Move.
    - Eat.
    - Reproduce.
    - Rest.
    - Invalid action.
15. Continue until all eligible cells are processed.
16. Remove any cells with health less than or equal to 0.
17. Evaluate victory conditions.
18. If match is not finished, increment turn.
19. Repeat.

## Move Flow

1. Get movement direction.
2. Check if destination is inside the board.
3. Check if destination is unoccupied.
4. If valid, move cell.
5. If invalid, cancel action and consume the cell action.

## Eat Flow

1. Get eat direction.
2. Check if target position is inside the board.
3. Check if an enemy cell exists in that direction.
4. If valid, apply 5 damage.
5. If enemy reaches 0 health, remove enemy immediately.
6. If invalid, cancel action and consume the cell action.

## Reproduce Flow

1. Get reproduction direction.
2. Check if destination is inside the board.
3. Check if destination is unoccupied.
4. If valid, split original cell health.
5. Create new allied cell in the destination.
6. New cell does not act until the next turn.
7. If invalid, cancel action and consume the cell action.

## Rest Flow

1. Recover 3 health.
2. If health exceeds 100, set health to 100.
3. Consume the cell action.

## Final Flow

1. End simulation.
2. Calculate winner or draw.
3. Show final statistics.
4. Allow return to configuration.
