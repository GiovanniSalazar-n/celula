import { describe, expect, it } from 'vitest';
import { resolveMove } from '../../engine';
import { cellOneFixture, cellTwoFixture, createMatchFixture } from '../fixtures/gameFixtures';

describe('resolveMove', () => {
  it('moves one square to an empty inside-board destination without changing health', () => {
    const match = createMatchFixture([cellOneFixture]);

    const result = resolveMove(match, cellOneFixture.id, 'e');
    const moved = result.match.board.cells[0];

    expect(result.status).toBe('success');
    expect(moved.position).toEqual({ row: 10, column: 11 });
    expect(moved.health).toBe(100);
  });

  it('cancels outside or occupied movement without changing health', () => {
    const outsideMatch = createMatchFixture([
      {
        ...cellOneFixture,
        position: { row: 0, column: 0 },
        health: 77,
      },
    ]);
    const outsideResult = resolveMove(outsideMatch, cellOneFixture.id, 'n');

    expect(outsideResult.status).toBe('invalid');
    expect(outsideResult.match.board.cells[0].position).toEqual({ row: 0, column: 0 });
    expect(outsideResult.match.board.cells[0].health).toBe(77);

    const occupiedMatch = createMatchFixture([cellOneFixture, cellTwoFixture]);
    const occupiedResult = resolveMove(occupiedMatch, cellOneFixture.id, 'e');

    expect(occupiedResult.status).toBe('invalid');
    expect(occupiedResult.match.board.cells[0].position).toEqual(cellOneFixture.position);
    expect(occupiedResult.match.board.cells[0].health).toBe(100);
  });
});
