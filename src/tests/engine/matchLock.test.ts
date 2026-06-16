import { describe, expect, it } from 'vitest';
import { canEditMatchConfiguration, createInitialMatch } from '../../engine';
import { playerOneFixture, playerTwoFixture } from '../fixtures/gameFixtures';

describe('match lock', () => {
  it('locks names, colors, functions, rules, turn limit, and initial conditions after Play', () => {
    const match = createInitialMatch([playerOneFixture, playerTwoFixture]);

    expect(match.isLocked).toBe(true);
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
