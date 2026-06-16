import { describe, expect, it } from 'vitest';
import { ACTION_CODES, parseActionCode } from '../../engine';

describe('parseActionCode', () => {
  it('accepts every documented MVP action code', () => {
    for (const code of ACTION_CODES) {
      expect(parseActionCode(code).isValid, code).toBe(true);
    }
  });

  it('rejects aliases and unknown actions', () => {
    expect(parseActionCode('rso').isValid).toBe(false);
    expect(parseActionCode('ano').isValid).toBe(false);
    expect(parseActionCode('R').isValid).toBe(false);
    expect(parseActionCode('jump').isValid).toBe(false);
  });
});
