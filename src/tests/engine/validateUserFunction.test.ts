import { describe, expect, it } from 'vitest';
import { buildFunctionArgs, parseActionCode, validateUserFunction } from '../../engine';
import { CODE_TEMPLATES } from '../../utils/interpreter';

describe('validateUserFunction', () => {
  it('accepts every built-in strategy template', () => {
    for (const [name, source] of Object.entries(CODE_TEMPLATES)) {
      const result = validateUserFunction(source);

      expect(result, name).toMatchObject({
        isValid: true,
        error: null,
      });
    }
  });

  it('accepts real Python function syntax with health and nearby arguments', () => {
    const result = validateUserFunction(`
def cell(health, nearby):
    if health < 50:
        return "d"
    return "mn"
`);

    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
    expect(result.actionCodes).toEqual(['d', 'mn']);
  });

  it('accepts any documented literal action return', () => {
    const result = validateUserFunction(`
def cell(health, nearby):
    if nearby[0] == "enemy":
        return "an"
    if nearby[1] == "empty":
        return "rse"
    return "mne"
`);

    expect(result.isValid).toBe(true);
    expect(result.actionCodes).toEqual(['an', 'rse', 'mne']);
  });

  it('rejects broad context or extra function arguments', () => {
    const result = validateUserFunction(`
def cell(health, nearby, board):
    return "d"
`);

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Function must receive exactly health and nearby arguments.');
  });

  it('rejects access to board, turn object, internal IDs, mutable cells, full cell lists, team object, or internal state', () => {
    const forbiddenSources = [
      'def cell(health, nearby):\n    return board.width',
      'def cell(health, nearby):\n    return turn.number',
      'def cell(health, nearby):\n    return internal_state',
      'def cell(health, nearby):\n    return cells[0]',
      'def cell(health, nearby):\n    return team.name',
      'def cell(health, nearby):\n    return cell.id',
    ];

    for (const source of forbiddenSources) {
      expect(validateUserFunction(source).isValid).toBe(false);
    }
  });

  it('rejects imports, file access, network access, eval, exec, and dangerous builtins', () => {
    const forbiddenSources = [
      'def cell(health, nearby):\n    import os\n    return "d"',
      'def cell(health, nearby):\n    from os import path\n    return "d"',
      'def cell(health, nearby):\n    open("x.txt")\n    return "d"',
      'def cell(health, nearby):\n    requests.get("https://example.com")\n    return "d"',
      'def cell(health, nearby):\n    eval("1 + 1")\n    return "d"',
      'def cell(health, nearby):\n    exec("return d")\n    return "d"',
      'def cell(health, nearby):\n    globals()\n    return "d"',
    ];

    for (const source of forbiddenSources) {
      expect(validateUserFunction(source).isValid).toBe(false);
    }
  });

  it('rejects state mutation attempts', () => {
    const result = validateUserFunction(`
def cell(health, nearby):
    health = 100
    return "d"
`);

    expect(result.isValid).toBe(false);
    expect(result.error).toBe('User functions cannot mutate provided arguments or game state.');
  });

  it('rejects dynamic returns and invalid action literals', () => {
    expect(
      validateUserFunction(`
def cell(health, nearby):
    direction = "n"
    return "m" + direction
`).isValid,
    ).toBe(false);

    expect(
      validateUserFunction(`
def cell(health, nearby):
    return "jump"
`).isValid,
    ).toBe(false);
  });

  it('rejects loops and timeout-prone code', () => {
    const loopResult = validateUserFunction(`
def cell(health, nearby):
    while True:
        pass
    return "d"
`);

    expect(loopResult.isValid).toBe(false);
    expect(loopResult.error).toBe('Loops are not allowed because functions must finish within 1 second.');
  });
});

describe('buildFunctionArgs', () => {
  it('returns only health and eight nearby neighbor states', () => {
    const args = buildFunctionArgs(80, [
      'empty',
      'allied',
      'enemy',
      'outside',
      'empty',
      'empty',
      'enemy',
      'allied',
    ]);

    expect(Object.keys(args)).toEqual(['health', 'nearby']);
    expect(args.health).toBe(80);
    expect(args.nearby).toHaveLength(8);
  });

  it('rejects nearby values outside the four allowed states', () => {
    expect(() =>
      buildFunctionArgs(80, ['empty', 'food', 'enemy', 'outside', 'empty', 'empty', 'enemy', 'allied']),
    ).toThrow('nearby must contain only empty, allied, enemy, or outside states.');
  });

  it('rejects nearby lists that do not contain exactly eight states', () => {
    expect(() => buildFunctionArgs(80, ['empty'])).toThrow('nearby must contain exactly 8 neighbor states.');
  });
});

describe('parseActionCode', () => {
  it('accepts documented action codes and rejects aliases or unknown actions', () => {
    expect(parseActionCode('d')).toEqual({ isValid: true, category: 'rest', code: 'd' });
    expect(parseActionCode('mne')).toEqual({
      isValid: true,
      category: 'move',
      direction: 'ne',
      code: 'mne',
    });
    expect(parseActionCode('rso').isValid).toBe(false);
    expect(parseActionCode('jump').isValid).toBe(false);
  });
});
