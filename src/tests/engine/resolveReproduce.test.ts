import { describe, expect, it } from 'vitest';
import { resolveReproduce } from '../../engine';
import { cellOneFixture, cellTwoFixture, createMatchFixture } from '../fixtures/gameFixtures';

describe('resolveReproduce', () => {
  it('creates an allied newborn in an empty neighboring square and preserves total health', () => {
    const parent = { ...cellOneFixture, health: 51 };
    const match = createMatchFixture([parent]);

    const result = resolveReproduce(match, parent.id, 'e', 7);
    const updatedParent = result.match.board.cells.find((cell) => cell.id === parent.id);
    const newborn = result.match.board.cells.find((cell) => cell.id !== parent.id);

    expect(result.status).toBe('success');
    expect(updatedParent?.health).toBe(26);
    expect(newborn?.health).toBe(25);
    expect(newborn?.teamId).toBe(parent.teamId);
    expect(newborn?.creationTurn).toBe(7);
  });

  it('has no minimum health requirement in the MVP', () => {
    const parent = { ...cellOneFixture, health: 2 };
    const match = createMatchFixture([parent]);

    const result = resolveReproduce(match, parent.id, 'e', 3);

    expect(result.status).toBe('success');
    expect(result.match.board.cells.find((cell) => cell.id === parent.id)?.health).toBe(1);
    expect(result.match.board.cells.find((cell) => cell.id !== parent.id)?.health).toBe(1);
  });

  it('cancels reproduction outside or into occupied squares without changing health', () => {
    const outsideMatch = createMatchFixture([{ ...cellOneFixture, position: { row: 0, column: 0 }, health: 12 }]);
    const outsideResult = resolveReproduce(outsideMatch, cellOneFixture.id, 'n', 1);
    expect(outsideResult.status).toBe('invalid');
    expect(outsideResult.match.board.cells[0].health).toBe(12);

    const occupiedMatch = createMatchFixture([cellOneFixture, cellTwoFixture]);
    const occupiedResult = resolveReproduce(occupiedMatch, cellOneFixture.id, 'e', 1);
    expect(occupiedResult.status).toBe('invalid');
    expect(occupiedResult.match.board.cells).toHaveLength(2);
  });
});
