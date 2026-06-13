import { DIRECTIONS, DIRECTION_DELTAS } from './directions.js';
import type { BoardPosition, BoardState, Cell, Direction, NeighborState, TeamId } from './types.js';

interface TeamSeed {
  name: string;
  color: string;
}

function toKey(position: BoardPosition): string {
  return `${position.row},${position.col}`;
}

export function createBoard(rows: number, cols: number): BoardState {
  return {
    rows,
    cols,
    occupancy: new Map<string, string>(),
  };
}

export function cloneBoard(board: BoardState): BoardState {
  return {
    rows: board.rows,
    cols: board.cols,
    occupancy: new Map(board.occupancy),
  };
}

export function isInsideBoard(board: BoardState, position: BoardPosition): boolean {
  return position.row >= 0 && position.row < board.rows && position.col >= 0 && position.col < board.cols;
}

export function getCellIdAt(board: BoardState, position: BoardPosition): string | undefined {
  return board.occupancy.get(toKey(position));
}

export function placeCell(board: BoardState, cell: Cell): void {
  if (!isInsideBoard(board, cell.position)) {
    throw new Error('Cannot place a cell outside the board.');
  }

  if (getCellIdAt(board, cell.position)) {
    throw new Error('Cannot place more than one cell in the same square.');
  }

  board.occupancy.set(toKey(cell.position), cell.id);
}

export function removeCell(board: BoardState, position: BoardPosition): void {
  board.occupancy.delete(toKey(position));
}

export function moveCell(board: BoardState, from: BoardPosition, to: BoardPosition, cellId: string): void {
  board.occupancy.delete(toKey(from));
  board.occupancy.set(toKey(to), cellId);
}

export function buildBoardFromCells(rows: number, cols: number, cells: Cell[]): BoardState {
  const board = createBoard(rows, cols);

  for (const cell of cells) {
    if (!cell.alive) {
      continue;
    }
    placeCell(board, cell);
  }

  return board;
}

export function getNeighborPosition(position: BoardPosition, direction: Direction): BoardPosition {
  const [rowDelta, colDelta] = DIRECTION_DELTAS[direction];
  return {
    row: position.row + rowDelta,
    col: position.col + colDelta,
  };
}

export function getNeighborStates(
  board: BoardState,
  cellsById: Map<string, Cell>,
  position: BoardPosition,
  teamId: TeamId,
): Record<Direction, NeighborState> {
  const result = {} as Record<Direction, NeighborState>;

  for (const direction of DIRECTIONS) {
    const target = getNeighborPosition(position, direction);

    if (!isInsideBoard(board, target)) {
      result[direction] = 'outside';
      continue;
    }

    const occupantId = getCellIdAt(board, target);
    if (!occupantId) {
      result[direction] = 'empty';
      continue;
    }

    const occupant = cellsById.get(occupantId);
    result[direction] = occupant && occupant.teamId === teamId ? 'allied' : 'enemy';
  }

  return result;
}

export function createInitialCells(
  teams: [TeamSeed, TeamSeed],
  rows: number,
  cols: number,
  rng: () => number,
): Cell[] {
  const board = createBoard(rows, cols);
  const result: Cell[] = [];

  teams.forEach((team, index) => {
    let position: BoardPosition;
    do {
      position = {
        row: Math.floor(rng() * rows),
        col: Math.floor(rng() * cols),
      };
    } while (getCellIdAt(board, position));

    const cell: Cell = {
      id: `cell-${index + 1}`,
      teamId: (index + 1) as TeamId,
      teamName: team.name,
      teamColor: team.color,
      position,
      health: 100,
      age: 1,
      alive: true,
      creationTurn: 0,
      createdDuringCurrentTurn: false,
      lastAction: 'none',
      lastActionStatus: 'none',
    };

    placeCell(board, cell);
    result.push(cell);
  });

  return result;
}
