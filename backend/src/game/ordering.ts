import type { Cell } from './types.js';

export interface TurnOrderEntry {
  id: string;
  age: number;
  creationTurn: number;
  row: number;
  col: number;
}

export function buildTurnOrder(cells: Cell[]): TurnOrderEntry[] {
  return cells
    .filter((cell) => cell.alive)
    .map((cell) => ({
      id: cell.id,
      age: cell.age,
      creationTurn: cell.creationTurn,
      row: cell.position.row,
      col: cell.position.col,
    }))
    .sort((left, right) => {
      if (left.age !== right.age) {
        return left.age - right.age;
      }
      if (left.creationTurn !== right.creationTurn) {
        return left.creationTurn - right.creationTurn;
      }
      if (left.row !== right.row) {
        return left.row - right.row;
      }
      return left.col - right.col;
    });
}
