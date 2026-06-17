import { describe, expect, it } from 'vitest';
import { buildNearbyKey, decodeNearbyKey, executeUserFunction } from '../../engine';

describe('executeUserFunction', () => {
  it('executes real Python syntax with only health and nearby arguments', () => {
    const result = executeUserFunction(
      `def cell(health, nearby):
    if nearby[0] == "enemy":
        return "an"
    return "d"`,
      {
        health: 50,
        nearby: ['enemy', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty'],
      },
    );

    expect(result).toEqual({ action: 'an', error: null });
  });

  it('reports runtime errors and timeout-prone code without exposing game state', () => {
    expect(
      executeUserFunction('def cell(health, nearby):\n    return board.cells', {
        health: 50,
        nearby: ['empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty'],
      }).error,
    ).toContain('board is not defined');

    expect(
      executeUserFunction('def cell(health, nearby):\n    while True:\n        return "d"', {
        health: 50,
        nearby: ['empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty'],
      }).error,
    ).toBe('Timed out');
  });

  it('falls back to rest when execution returns an invalid value or action', () => {
    expect(
      executeUserFunction('def cell(health, nearby):\n    return 42', {
        health: 50,
        nearby: ['empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty'],
      }),
    ).toEqual({
      action: 'd',
      error: 'Function returned number, expected string.',
    });

    expect(
      executeUserFunction('def cell(health, nearby):\n    return "jump"', {
        health: 50,
        nearby: ['empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty'],
      }),
    ).toEqual({
      action: 'd',
      error: 'Invalid action code: jump',
    });
  });

  it('does not let user code mutate the caller nearby values', () => {
    const nearby = ['empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty'] as const;
    const result = executeUserFunction('def cell(health, nearby):\n    nearby[0] = "enemy"\n    return "d"', {
      health: 50,
      nearby,
    });

    expect(result).toEqual({ action: 'd', error: null });
    expect(nearby).toEqual(['empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty']);
  });

  it('executes safe value helpers', () => {
    const result = executeUserFunction(
      `def cell(health, nearby):
    total = sum([1, 2, 3])
    if len(nearby) == 8 and max(health, total) == health:
        return "d"
    return "mn"`,
      {
        health: 50,
        nearby: ['empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty'],
      },
    );

    expect(result).toEqual({ action: 'd', error: null });
  });

  it('executes read-only direction helpers', () => {
    const result = executeUserFunction(
      `def cell(health, nearby):
    if isEnemy("n"):
        return "an"
    if len(emptyDirections()) > 0:
        return "re"
    return "d"`,
      {
        health: 50,
        nearby: ['enemy', 'empty', 'empty', 'empty', 'allied', 'outside', 'empty', 'empty'],
      },
    );

    expect(result).toEqual({ action: 'an', error: null });
  });

  it('executes bounded for loops over helper direction lists', () => {
    const result = executeUserFunction(
      `def cell(health, nearby):
    for direction in emptyDirections():
        return "r" + direction
    return "d"`,
      {
        health: 50,
        nearby: ['allied', 'enemy', 'empty', 'outside', 'allied', 'enemy', 'outside', 'allied'],
      },
    );

    expect(result).toEqual({ action: 're', error: null });
  });

  it('stops excessive bounded execution with a step-limit error', () => {
    const result = executeUserFunction(
      `def cell(health, nearby):
    total = 0
    for i in range(0, 10000):
        total = total + i
    return "d"`,
      {
        health: 50,
        nearby: ['empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty'],
      },
    );

    expect(result).toEqual({ action: 'd', error: 'Step limit exceeded.' });
  });

  it('encodes nearby states without changing the documented direction order', () => {
    const nearby = ['empty', 'allied', 'enemy', 'outside', 'empty', 'empty', 'enemy', 'allied'] as const;

    expect(decodeNearbyKey(buildNearbyKey(nearby))).toEqual(nearby);
  });
});
