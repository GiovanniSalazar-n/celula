import { describe, expect, it } from 'vitest';
import { executeUserFunction } from '../../engine';

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
});
