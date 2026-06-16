import type { Board, Cell, Match, Player } from '../../engine';
import { BOARD_COLUMNS, BOARD_ROWS, SIMULATION_SPEEDS, TURN_LIMIT } from '../../engine';

export const playerOneFixture: Player = {
  id: 'player-1',
  name: 'Anabaena-Cyan',
  color: '#22d3ee',
  functionSource: 'def cell(health, nearby):\n    return "d"',
  isFunctionValid: true,
  isConfirmed: true,
};

export const playerTwoFixture: Player = {
  id: 'player-2',
  name: 'Dicty-Magenta',
  color: '#f43f5e',
  functionSource: 'def cell(health, nearby):\n    return "d"',
  isFunctionValid: true,
  isConfirmed: true,
};

export const cellOneFixture: Cell = {
  id: 'cell-1',
  teamId: 'player-1',
  color: playerOneFixture.color,
  position: { row: 10, column: 10 },
  health: 100,
  isAlive: true,
  creationTurn: 1,
  lastActionStatus: 'none',
};

export const cellTwoFixture: Cell = {
  id: 'cell-2',
  teamId: 'player-2',
  color: playerTwoFixture.color,
  position: { row: 10, column: 11 },
  health: 100,
  isAlive: true,
  creationTurn: 1,
  lastActionStatus: 'none',
};

export function createBoardFixture(cells: Cell[] = [cellOneFixture, cellTwoFixture]): Board {
  return {
    rows: BOARD_ROWS,
    columns: BOARD_COLUMNS,
    cells,
    occupancy: new Map(cells.map((cell) => [`${cell.position.row},${cell.position.column}`, cell.id])),
  };
}

export function createMatchFixture(cells: Cell[] = [cellOneFixture, cellTwoFixture]): Match {
  return {
    players: [playerOneFixture, playerTwoFixture],
    board: createBoardFixture(cells),
    currentTurn: 1,
    turnLimit: TURN_LIMIT,
    status: 'running',
    isLocked: true,
    errors: [],
    simulationSpeed: SIMULATION_SPEEDS[1],
  };
}
