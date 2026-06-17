import { describe, expect, it } from 'vitest';
import { canEditMatchConfiguration, createInitialMatch } from '../../engine';
import { playerOneFixture, playerTwoFixture } from '../fixtures/gameFixtures';

describe('match lock', () => {
  it('locks names, colors, functions, rules, turn limit, and initial conditions after Play', () => {
    const match = createInitialMatch([playerOneFixture, playerTwoFixture], { turnLimit: 10000 });

    expect(match.isLocked).toBe(true);
    expect(match.turnLimit).toBe(10000);
    expect(canEditMatchConfiguration(match)).toBe(false);
  });

  it('pause does not unlock configuration', () => {
    const match = {
      ...createInitialMatch([playerOneFixture, playerTwoFixture]),
      status: 'paused' as const,
    };

    expect(canEditMatchConfiguration(match)).toBe(false);
  });
});
