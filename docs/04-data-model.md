# Data Model - Battle of Cells MVP

## Board

The board represents the simulation space.

```ts
type Board = {
  rows: 100;
  columns: 200;
  cells: Cell[];
};
```

Rules:

- The board always has 100 rows.
- The board always has 200 columns.
- The board size cannot change during a match.
- No square may contain more than one cell.
- Outside-board coordinates are invalid.

## Position

```ts
type Position = {
  row: number;
  column: number;
};
```

Rules:

- Row must be between `0` and `99`.
- Column must be between `0` and `199`.

## Player

```ts
type Player = {
  id: string;
  name: string;
  color: string;
  functionSource: string;
  isFunctionValid: boolean;
  isConfirmed: boolean;
};
```

Rules:

- There are exactly two players in the MVP.
- Player names cannot be repeated in the same match.
- Each player must select a color.
- Each player must have a valid function before Play.
- Each player must be confirmed before Play.

## Cell

```ts
type Cell = {
  id: string;
  teamId: string;
  color: string;
  position: Position;
  health: number;
  isAlive: boolean;
  creationTurn: number;
};
```

Rules:

- Cells do not have age in the MVP.
- Health must be between `0` and `100`.
- A cell with `0` health is dead.
- Dead cells are removed from the board immediately.
- A living cell may act once per turn.
- Newborn cells do not act in the turn where they are created.

## Match

```ts
type Match = {
  players: [Player, Player];
  board: Board;
  currentTurn: number;
  turnLimit: 5000;
  status: MatchStatus;
  isLocked: boolean;
  result?: MatchResult;
};
```

```ts
type MatchStatus =
  | "configuration"
  | "ready"
  | "running"
  | "paused"
  | "finished";
```

Rules:

- Current turn starts at `1`.
- Turn limit is `5000`.
- The match locks when Play is pressed.
- Locked matches cannot modify players, colors, code, rules, or initial conditions.

## Action Code

```ts
type ActionCode =
  | "mn" | "ms" | "me" | "mw" | "mne" | "mnw" | "mse" | "msw"
  | "an" | "as" | "ae" | "aw" | "ane" | "anw" | "ase" | "asw"
  | "rn" | "rs" | "re" | "rw" | "rne" | "rnw" | "rse" | "rsw"
  | "d";
```

## Action Type

```ts
type ActionType =
  | "move"
  | "eat"
  | "reproduce"
  | "rest"
  | "invalid";
```

## Direction

```ts
type Direction =
  | "n"
  | "s"
  | "e"
  | "w"
  | "ne"
  | "nw"
  | "se"
  | "sw";
```

## Neighbor State

```ts
type NeighborState =
  | "empty"
  | "allied"
  | "enemy"
  | "outside";
```

## Function Context

```ts
type CellFunctionContext = {
  cellHealth: number;
  cellPosition: Position;
  teamTotalHealth: number;
  currentTurn: number;
  boardSize: {
    rows: 100;
    columns: 200;
  };
  neighbors: Record<Direction, NeighborState>;
  hasNearbyAllies: boolean;
  hasNearbyEnemies: boolean;
};
```

Rules:

- This is the only data the user function can read.
- The function cannot mutate this data.
- The function cannot access hidden engine state.

## Match Result

```ts
type MatchResult = {
  winnerTeamId?: string;
  isDraw: boolean;
  finalTurn: number;
  terminationCause:
    | "team-eliminated"
    | "both-teams-eliminated"
    | "turn-limit";
  teamStats: TeamFinalStats[];
};
```

```ts
type TeamFinalStats = {
  teamId: string;
  playerName: string;
  color: string;
  livingCells: number;
  totalHealth: number;
};
```
