# Battle of Cells - Project Overview

## Project Name

Battle of Cells

## Project Type

Local turn-based simulation game for two players.

## Main Objective

Build a playable MVP where two local players configure their species, write a Python function that controls their cells, validate that function, and run a locked turn-based simulation.

## MVP Scope

The first version must include:

- Local web app.
- Two local players.
- Fixed 100 x 200 board.
- One initial cell per player.
- Health system.
- Movement.
- Eat action.
- Reproduction.
- Resting.
- Turn system.
- User function validation.
- Action codes.
- Victory conditions.
- Match lock after pressing Play.
- Configuration screen.
- Simulation screen.
- Final result screen.

## Out of Scope

Do not implement these features in the MVP:

- Online multiplayer.
- User accounts.
- Login system.
- Backend API.
- Database.
- Obstacles.
- Resources.
- External food.
- Cell age.
- Aging damage.
- Death by age.
- Age-based execution priority.
- Advanced AI.
- More than two players.
- Custom board size.
- Extra actions outside move, eat, reproduce, and rest.

## Existing UI Base

This project uses the existing UI mockup from:

`https://github.com/Adudu02/First-Try-for-Cell-Battle-UI`

The UI should not be rebuilt from zero. The goal is to preserve the existing visual style and connect it to a real Battle of Cells engine.

## Main Flow

1. Open configuration screen.
2. Configure Player 1.
3. Validate Player 1 function.
4. Confirm Player 1.
5. Configure Player 2.
6. Validate Player 2 function.
7. Confirm Player 2.
8. Start simulation.
9. Create fixed 100 x 200 board.
10. Create one random initial cell for each player.
11. Start turn cycle.
12. Execute cell actions.
13. Apply victory/end conditions.
14. Show final result screen.

## Development Method

This project must follow:

- Spec-Driven Development.
- Test-Driven Development.
- Software Design Documentation.

The business rules and project docs are the source of truth.
