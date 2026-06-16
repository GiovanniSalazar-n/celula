# UI State Contract: Battle of Cells MVP

React components render state and dispatch user intent. They do not decide core
game rules.

## Game View State

```ts
type GameViewState = {
  matchStatus: "configuration" | "ready" | "running" | "paused" | "finished";
  currentTurn: number;
  turnLimit: 5000;
  players: PlayerView[];
  cells: CellView[];
  stats: TeamStatsView[];
  errors: GameErrorView[];
  result?: MatchResultView;
  isLocked: boolean;
  simulationSpeed: SimulationSpeedView;
};
```

## Simulation Speed View

```ts
type SimulationSpeedView = {
  value: number;
  label: string;
  availableValues: number[];
};
```

## Player View

```ts
type PlayerView = {
  id: string;
  name: string;
  color: string;
  functionSource: string;
  isFunctionValid: boolean;
  validationError?: string;
  isConfirmed: boolean;
};
```

## Cell View

```ts
type CellView = {
  id: string;
  teamId: string;
  color: string;
  row: number;
  column: number;
  health: number;
  creationTurn: number;
  lastAction?: string;
  lastActionStatus?: "success" | "failed" | "invalid" | "none";
};
```

## Team Stats View

```ts
type TeamStatsView = {
  teamId: string;
  playerName: string;
  color: string;
  livingCells: number;
  totalHealth: number;
};
```

## Game Error View

```ts
type GameErrorView = {
  turn: number;
  playerId?: string;
  cellId?: string;
  type: "validation" | "invalid-action" | "runtime" | "timeout";
  message: string;
};
```

## Match Result View

```ts
type MatchResultView = {
  winnerTeamId?: string;
  isDraw: boolean;
  finalTurn: number;
  terminationCause:
    | "team-eliminated"
    | "both-teams-eliminated"
    | "turn-limit"
    | "manual-end";
  teamStats: TeamStatsView[];
};
```

## UI Events

The UI may request these actions:

- Edit player name before lock.
- Edit player color before lock.
- Edit or load player function before lock.
- Validate player function before lock.
- Confirm player before lock.
- Start match when both players are confirmed.
- Play/resume simulation.
- Pause simulation.
- Step one turn when paused.
- Change simulation speed while keeping match configuration locked.
- End simulation.
- Return to configuration after finished.

## Required Screen Mapping

### Configuration Screen

Uses existing setup cards and editor styling. Must show:
- Player 1 and Player 2 setup.
- Name input.
- Color selection.
- Algorithm editor with row numbers.
- Load algorithm option.
- Validate button and validation errors.
- Play button enabled only when both players are confirmed and valid.

### Simulation Screen

Uses existing board/HUD style. Must show:
- 100 x 200 board.
- Team-colored cells.
- Current turn.
- Fixed turn limit 5000.
- Play, Pause, Step, End Simulation, and speed controls.
- Invalid action error panel only.
- Living cells and total health per team.
- No editable match configuration.
- Compact board/cell rendering that avoids requiring a full 100 x 200 board
  recreation on every tick.

### Final Result Screen

Uses existing result modal/card style. Must show:
- Winner or draw.
- Player names and colors.
- Living cells per team.
- Total health per team.
- Final turn.
- Termination cause.
- Return to configuration/new match control.

## Preservation Rules

- Preserve current dark neon lab style, HUD composition, canvas board, sidebars,
  control bar, logs panel, and final card.
- Rename text labels if needed to match MVP rules.
- Remove age displays and replace with creation turn or neutral non-age stats.
- Remove or disable custom turn limit controls.
- Remove UI claims that contradict MVP rules, such as move/eat health costs or
  reproduction minimum health.
- Speed controls affect playback pacing only and must not unlock or alter match
  rules, player functions, initial conditions, or turn limit.
