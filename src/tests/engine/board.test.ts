import { describe, expect, it } from 'vitest';
import { BOARD_COLUMNS, BOARD_ROWS, createBoard, isInsideBoard, offsetPosition } from '../../engine';
import { cellOneFixture } from '../fixtures/gameFixtures';

describe('board and position rules', () => {
  it('creates the fixed 100 by 200 board', () => {
    const board = createBoard([]);

    expect(board.rows).toBe(BOARD_ROWS);
    expect(board.columns).toBe(BOARD_COLUMNS);
    expect(board.occupancy.size).toBe(0);
  });

  it('accepts only positions inside the fixed board', () => {
    expect(isInsideBoard({ row: 0, column: 0 })).toBe(true);
    expect(isInsideBoard({ row: 99, column: 199 })).toBe(true);
    expect(isInsideBoard({ row: -1, column: 0 })).toBe(false);
    expect(isInsideBoard({ row: 100, column: 0 })).toBe(false);
    expect(isInsideBoard({ row: 0, column: 200 })).toBe(false);
  });

  it('calculates documented direction offsets only', () => {
    expect(offsetPosition(cellOneFixture.position, 'n')).toEqual({ row: 9, column: 10 });
    expect(offsetPosition(cellOneFixture.position, 'sw')).toEqual({ row: 11, column: 9 });
  });
});
