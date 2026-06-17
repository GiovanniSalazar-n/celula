export type PlayerId = 'player-1' | 'player-2';

export type MatchStatus =
  | 'configuration'
  | 'ready'
  | 'running'
  | 'paused'
  | 'finished';

export type Direction = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export type NeighborState = 'empty' | 'allied' | 'enemy' | 'outside';

export type ActionCategory = 'move' | 'eat' | 'reproduce' | 'rest';

export type MoveActionCode =
  | 'mn'
  | 'ms'
  | 'me'
  | 'mw'
  | 'mne'
  | 'mnw'
  | 'mse'
  | 'msw';

export type EatActionCode =
  | 'an'
  | 'as'
  | 'ae'
  | 'aw'
  | 'ane'
  | 'anw'
  | 'ase'
  | 'asw';

export type ReproduceActionCode =
  | 'rn'
  | 'rs'
  | 're'
  | 'rw'
  | 'rne'
  | 'rnw'
  | 'rse'
  | 'rsw';

export type RestActionCode = 'd';

export type ActionCode =
  | MoveActionCode
  | EatActionCode
  | ReproduceActionCode
  | RestActionCode;

export type TerminationCause =
  | 'team-eliminated'
  | 'both-teams-eliminated'
  | 'turn-limit'
  | 'manual-end';

export interface Position {
  row: number;
  column: number;
}

export interface Player {
  id: PlayerId;
  name: string;
  color: string;
  functionSource: string;
  isFunctionValid: boolean;
  validationError?: string;
  isConfirmed: boolean;
}

export interface Cell {
  id: string;
  teamId: PlayerId;
  color: string;
  position: Position;
  health: number;
  isAlive: boolean;
  creationTurn: number;
  lastAction?: ActionCode | string;
  lastActionStatus?: 'success' | 'failed' | 'invalid' | 'none';
}

export type OccupancyKey = number;

export interface Board {
  rows: 100;
  columns: 200;
  cells: Cell[];
  occupancy: ReadonlyMap<OccupancyKey, string>;
}

export interface CellFunctionArgs {
  health: number;
  nearby: readonly NeighborState[];
}

export interface GameError {
  turn: number;
  playerId?: PlayerId;
  cellId?: string;
  type: 'validation' | 'invalid-action' | 'runtime' | 'timeout';
  message: string;
}

export interface TeamStats {
  teamId: PlayerId;
  playerName: string;
  color: string;
  livingCells: number;
  totalHealth: number;
}

export interface MatchResult {
  winnerTeamId?: PlayerId;
  isDraw: boolean;
  finalTurn: number;
  terminationCause: TerminationCause;
  teamStats: TeamStats[];
}

export interface SimulationSpeed {
  value: number;
  label: string;
}

export interface Match {
  players: readonly [Player, Player];
  board: Board;
  currentTurn: number;
  turnLimit: 5000;
  status: MatchStatus;
  isLocked: boolean;
  errors: GameError[];
  result?: MatchResult;
  simulationSpeed: SimulationSpeed;
}
