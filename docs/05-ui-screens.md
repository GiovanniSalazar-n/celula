# UI Screens - Battle of Cells MVP

## Screen 1: Configuration Screen

The configuration screen is shown before the simulation starts.

### Required Features

The screen must allow:

- Configure Player 1.
- Configure Player 2.
- Enter player name.
- Select player color.
- Write or load player algorithm.
- Validate player algorithm.
- Show validation errors.
- Confirm each player.
- Start simulation only when both players are confirmed and both functions are valid.

### Validation Rules

The Play button must be disabled if:

- Player 1 is missing.
- Player 2 is missing.
- A player name is empty.
- Player names are repeated.
- A player color is missing.
- A player function is missing.
- A player function is invalid.
- A player is not confirmed.

### Configuration Lock

After Play is pressed:

- Player names cannot be edited.
- Player colors cannot be edited.
- Player code cannot be edited.
- Match rules cannot be edited.
- Initial conditions cannot be edited.

## Screen 2: Simulation Screen

The simulation screen shows the match after it starts.

### Required Elements

The screen must include:

- Full 100 x 200 board.
- Cells shown using team color.
- Current turn indicator.
- Turn limit indicator.
- Play button.
- Pause button.
- Error panel.
- Basic statistics panel.
- Living cells per team.
- Total health per team.

### Simulation Rules

During simulation:

- The interface must not allow editing player configuration.
- The interface must not allow editing code.
- The interface must not allow changing colors.
- The interface must not allow changing turn limit.
- Pause only stops visualization or automatic execution.
- Pause does not unlock editing.

## Screen 3: Final Screen

The final screen appears when the simulation ends.

### Required Elements

The final screen must display:

- Winner or draw.
- Player/team names.
- Team colors.
- Number of living cells per team.
- Total health per team.
- Final turn.
- Cause of termination.
- Option to return to configuration.
- Option to start a new match.

### Termination Causes

The final screen must identify one of these causes:

- One team eliminated.
- Both teams eliminated.
- Turn limit reached.

## Error Panel

The error panel must show:

- Function validation errors.
- Runtime function errors.
- Timeout errors.
- Invalid action errors if useful for debugging.

Errors should be clear and understandable to the user.

## Statistics Panel

The statistics panel must show:

- Current turn.
- Turn limit.
- Player 1 living cells.
- Player 2 living cells.
- Player 1 total health.
- Player 2 total health.
