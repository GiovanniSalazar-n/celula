import { describe, expect, it } from 'vitest';
import type { Player } from '../../engine';
import { validatePlayerConfigs, validateTurnLimit } from '../../engine';
import { playerOneFixture, playerTwoFixture } from '../fixtures/gameFixtures';

function player(overrides: Partial<Player> = {}): Player {
  return {
    ...playerOneFixture,
    id: overrides.id ?? playerOneFixture.id,
    name: overrides.name ?? playerOneFixture.name,
    color: overrides.color ?? playerOneFixture.color,
    functionSource: overrides.functionSource ?? playerOneFixture.functionSource,
    isFunctionValid: overrides.isFunctionValid ?? playerOneFixture.isFunctionValid,
    validationError: overrides.validationError,
    isConfirmed: overrides.isConfirmed ?? playerOneFixture.isConfirmed,
  };
}

describe('validatePlayerConfigs', () => {
  it('accepts exactly two complete, valid, confirmed players', () => {
    const result = validatePlayerConfigs([playerOneFixture, playerTwoFixture]);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects anything other than exactly two players', () => {
    const result = validatePlayerConfigs([playerOneFixture]);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual({
      field: 'players',
      message: 'Exactly two local players are required.',
    });
  });

  it('rejects empty player names after trimming whitespace', () => {
    const result = validatePlayerConfigs([player({ name: '   ' }), playerTwoFixture]);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual({
      playerId: 'player-1',
      field: 'name',
      message: 'Player name is required.',
    });
  });

  it('rejects duplicate player names case-insensitively after trimming', () => {
    const result = validatePlayerConfigs([
      player({ id: 'player-1', name: ' Cytos ' }),
      player({ id: 'player-2', name: 'cytos' }),
    ]);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual({
      field: 'name',
      message: 'Player names must be unique.',
    });
  });

  it('rejects missing colors', () => {
    const result = validatePlayerConfigs([player({ color: '' }), playerTwoFixture]);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual({
      playerId: 'player-1',
      field: 'color',
      message: 'Player color is required.',
    });
  });

  it('rejects missing function source', () => {
    const result = validatePlayerConfigs([player({ functionSource: '  ' }), playerTwoFixture]);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual({
      playerId: 'player-1',
      field: 'functionSource',
      message: 'Player function source is required.',
    });
  });

  it('rejects invalid functions and preserves the validator error when present', () => {
    const result = validatePlayerConfigs([
      player({ isFunctionValid: false, validationError: 'Import statements are not allowed.' }),
      playerTwoFixture,
    ]);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual({
      playerId: 'player-1',
      field: 'functionValidation',
      message: 'Import statements are not allowed.',
    });
  });

  it('rejects unconfirmed players when checking Play readiness', () => {
    const result = validatePlayerConfigs([player({ isConfirmed: false }), playerTwoFixture]);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual({
      playerId: 'player-1',
      field: 'confirmation',
      message: 'Player must be confirmed before Play.',
    });
  });

  it('can ignore the legacy confirmation gate when validation is the Play gate', () => {
    const result = validatePlayerConfigs(
      [player({ isConfirmed: false }), { ...playerTwoFixture, isConfirmed: false }],
      { requireConfirmed: false },
    );

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('accepts turn limits from 1 to 10000', () => {
    expect(validateTurnLimit(1)).toEqual({ isValid: true, error: null });
    expect(validateTurnLimit(5000)).toEqual({ isValid: true, error: null });
    expect(validateTurnLimit(10000)).toEqual({ isValid: true, error: null });
  });

  it('rejects turn limits outside 1 to 10000', () => {
    expect(validateTurnLimit(0)).toEqual({
      isValid: false,
      error: 'Turn limit must be between 1 and 10000.',
    });
    expect(validateTurnLimit(10001)).toEqual({
      isValid: false,
      error: 'Turn limit must be between 1 and 10000.',
    });
    expect(validateTurnLimit(1.5)).toEqual({
      isValid: false,
      error: 'Turn limit must be a whole number.',
    });
  });
});
