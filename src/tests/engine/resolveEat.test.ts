import { describe, expect, it } from 'vitest';
import { resolveEat } from '../../engine';
import { cellOneFixture, cellTwoFixture, createMatchFixture } from '../fixtures/gameFixtures';

describe('resolveEat', () => {
  it('damages neighboring enemies by exactly 5 and never heals the attacker', () => {
    const attacker = { ...cellOneFixture, health: 30 };
    const defender = { ...cellTwoFixture, health: 12 };
    const match = createMatchFixture([attacker, defender]);

    const result = resolveEat(match, attacker.id, 'e');

    expect(result.status).toBe('success');
    expect(result.match.board.cells.find((cell) => cell.id === attacker.id)?.health).toBe(30);
    expect(result.match.board.cells.find((cell) => cell.id === defender.id)?.health).toBe(7);
  });

  it('removes dead cells immediately when health reaches 0', () => {
    const attacker = { ...cellOneFixture, health: 30 };
    const defender = { ...cellTwoFixture, health: 5 };
    const match = createMatchFixture([attacker, defender]);

    const result = resolveEat(match, attacker.id, 'e');

    expect(result.status).toBe('success');
    expect(result.match.board.cells.some((cell) => cell.id === defender.id)).toBe(false);
    expect(result.match.board.occupancy.has('10,11')).toBe(false);
  });

  it('cancels eat against allied, empty, or outside squares without changing health', () => {
    const alliedTarget = { ...cellTwoFixture, teamId: 'player-1' as const };
    const alliedMatch = createMatchFixture([cellOneFixture, alliedTarget]);

    expect(resolveEat(alliedMatch, cellOneFixture.id, 'e').status).toBe('invalid');

    const emptyMatch = createMatchFixture([cellOneFixture]);
    expect(resolveEat(emptyMatch, cellOneFixture.id, 'e').status).toBe('invalid');

    const outsideMatch = createMatchFixture([{ ...cellOneFixture, position: { row: 0, column: 0 } }]);
    expect(resolveEat(outsideMatch, cellOneFixture.id, 'n').status).toBe('invalid');
  });
});
