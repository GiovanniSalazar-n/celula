import { describe, expect, it } from 'vitest';
import { createInitialMatch, executeTurn } from '../../engine';
import { CODE_TEMPLATES } from '../../utils/interpreter';
import { playerOneFixture, playerTwoFixture } from '../fixtures/gameFixtures';

describe('colony expansion stress behavior', () => {
  it('runs aggressive expansion for repeated turns without runtime errors or runaway latency', () => {
    let match = createInitialMatch(
      [
        { ...playerOneFixture, functionSource: CODE_TEMPLATES.EXPANDING_COLONY },
        { ...playerTwoFixture, functionSource: CODE_TEMPLATES.EXPANDING_COLONY },
      ],
      {
        random: seededRandom(42),
      },
    );

    const startedAt = performance.now();
    for (let turn = 0; turn < 24; turn += 1) {
      match = executeTurn(match);
    }
    const elapsed = performance.now() - startedAt;

    expect(match.errors).toEqual([]);
    expect(match.board.cells.length).toBeGreaterThan(100);
    expect(match.board.occupancy.size).toBe(match.board.cells.length);
    expect(elapsed).toBeLessThan(750);
  });
});

function seededRandom(seed: number): () => number {
  let value = seed;

  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}
