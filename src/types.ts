export interface Cell {
  id: string;
  team: 1 | 2;
  row: number;
  col: number;
  life: number;
  creationTurn: number;
  lastAction: string;
  lastActionStatus: 'success' | 'failed' | 'invalid' | 'none';
  status: 'alive' | 'dead';
}

export interface PlayerConfig {
  name: string;
  color: string;
  code: string;
  isValid: boolean;
  validationError: string | null;
  selectedTemplate: string;
  isConfirmed: boolean;
}

export interface SimulationSettings {
  maxTurns: number;
  speed: 1 | 2 | 5; // x1, x2, x5
  turnDelay: number; // calculated in ms
}

export interface LogEntry {
  turn: number;
  type: 'info' | 'battle' | 'system' | 'error' | 'reproduce';
  message: string;
}

export type GameState = 'setup' | 'running' | 'paused' | 'finished';

export interface FinalStats {
  winner: 1 | 2 | 'draw';
  reason: 'team-eliminated' | 'both-teams-eliminated' | 'turn-limit' | 'manual-end' | 'draw';
  finalTurn: number;
  p1FinalLiving: number;
  p1FinalLife: number;
  p2FinalLiving: number;
  p2FinalLife: number;
}
