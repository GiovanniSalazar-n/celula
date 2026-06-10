export type TeamId = 1 | 2 | 3 | 4;

export type GameStatus = "setup" | "running" | "paused" | "player_lost" | "finished";

export interface Position {
  x: number;
  y: number;
}

export interface BoardSize {
  width: number;
  height: number;
}

export interface MainCell {
  teamId: TeamId;
  position: Position;
  alive: boolean;
}

export interface TrailCell {
  teamId: TeamId;
  position: Position;
}

export interface TeamState {
  id: TeamId;
  mainCell: MainCell;
  trails: TrailCell[];
}

export interface GameState {
  boardSize: BoardSize;
  status: GameStatus;
  tick: number;
  teams: TeamState[];
  winnerTeamId?: TeamId;
}

export interface CreateGameOptions {
  boardSize?: BoardSize;
  playerStart?: Position;
}
