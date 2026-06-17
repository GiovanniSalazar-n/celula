import { describe, expect, it } from 'vitest';
import { evaluateVictory } from '../../engine';
import { cellOneFixture, cellTwoFixture, createMatchFixture } from '../fixtures/gameFixtures';

describe('evaluateVictory', () => {
  it('detects one-team and both-team elimination', () => {
    const p1Only = createMatchFixture([cellOneFixture]);
    expect(evaluateVictory(p1Only)?.winnerTeamId).toBe('player-1');
    expect(evaluateVictory(p1Only)?.terminationCause).toBe('team-eliminated');

    const noneAlive = createMatchFixture([]);
    const draw = evaluateVictory(noneAlive);
    expect(draw?.isDraw).toBe(true);
    expect(draw?.terminationCause).toBe('both-teams-eliminated');
  });

  it('uses living cells then health then draw for turn limit and manual end', () => {
    const p1Advantage = createMatchFixture([
      cellOneFixture,
      { ...cellOneFixture, id: 'cell-3', position: { row: 20, column: 20 } },
      { ...cellTwoFixture, health: 100 },
    ]);

    expect(evaluateVictory({ ...p1Advantage, currentTurn: 5001 }, 'turn-limit')?.winnerTeamId).toBe('player-1');

    const healthAdvantage = createMatchFixture([
      { ...cellOneFixture, health: 20 },
      { ...cellTwoFixture, health: 30 },
    ]);
    expect(evaluateVictory(healthAdvantage, 'manual-end')?.winnerTeamId).toBe('player-2');
    expect(evaluateVictory(healthAdvantage, 'manual-end')?.terminationCause).toBe('manual-end');

    const exactTie = createMatchFixture([
      { ...cellOneFixture, health: 30 },
      { ...cellTwoFixture, health: 30 },
    ]);
    expect(evaluateVictory(exactTie, 'manual-end')?.isDraw).toBe(true);
  });

  it('uses the selected turn limit before evaluating turn-limit victory', () => {
    const ongoing = createMatchFixture([cellOneFixture, cellTwoFixture]);

    expect(evaluateVictory({ ...ongoing, currentTurn: 10000, turnLimit: 10000 })).toBeUndefined();

    const afterSelectedLimit = evaluateVictory({ ...ongoing, currentTurn: 10001, turnLimit: 10000 });
    expect(afterSelectedLimit?.terminationCause).toBe('turn-limit');
    expect(afterSelectedLimit?.finalTurn).toBe(10000);
  });
});
