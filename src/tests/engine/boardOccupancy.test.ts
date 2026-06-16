import { describe, expect, it } from 'vitest';
import { createBoard, getCellAtPosition, isPositionEmpty } from '../../engine';
import { cellOneFixture, cellTwoFixture } from '../fixtures/gameFixtures';

describe('compact board occupancy', () => {
  it('tracks occupied and empty squares without creating a full board matrix', () => {
    const board = createBoard([cellOneFixture]);

    expect(board.occupancy).toBeInstanceOf(Map);
    expect(board.occupancy.size).toBe(1);
    expect(getCellAtPosition(board, cellOneFixture.position)).toBe(cellOneFixture);
    expect(isPositionEmpty(board, { row: 12, column: 12 })).toBe(true);
    expect(isPositionEmpty(board, cellOneFixture.position)).toBe(false);
  });

  it('rejects two living cells on the same square', () => {
    expect(() =>
      createBoard([
        cellOneFixture,
        {
          ...cellTwoFixture,
          position: cellOneFixture.position,
        },
      ]),
    ).toThrow('Multiple living cells cannot occupy the same square.');
  });
});
