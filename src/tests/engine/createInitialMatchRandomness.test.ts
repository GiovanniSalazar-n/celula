import { describe, expect, it } from 'vitest';
import { createInitialMatch } from '../../engine';
import { playerOneFixture, playerTwoFixture } from '../fixtures/gameFixtures';

describe('initial placement randomness', () => {
  it('uses fresh random values for every match or reload', () => {
    const firstRandomValues = [0.1, 0.1, 0.2, 0.2];
    const secondRandomValues = [0.7, 0.7, 0.8, 0.8];

    const firstMatch = createInitialMatch([playerOneFixture, playerTwoFixture], {
      random: () => firstRandomValues.shift() ?? 0,
    });
    const secondMatch = createInitialMatch([playerOneFixture, playerTwoFixture], {
      random: () => secondRandomValues.shift() ?? 0,
    });

    expect(secondMatch.board.cells.map((cell) => cell.position)).not.toEqual(
      firstMatch.board.cells.map((cell) => cell.position),
    );
  });
});
