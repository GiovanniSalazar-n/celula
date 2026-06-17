import { describe, expect, it } from 'vitest';
import { buildFunctionArgs } from '../../engine';

describe('buildFunctionArgs', () => {
  it('exposes only health and the eight nearby neighbor states', () => {
    const args = buildFunctionArgs(77, [
      'empty',
      'allied',
      'enemy',
      'outside',
      'empty',
      'allied',
      'enemy',
      'outside',
    ]);

    expect(Object.keys(args)).toEqual(['health', 'nearby']);
    expect(args.health).toBe(77);
    expect(args.nearby).toEqual([
      'empty',
      'allied',
      'enemy',
      'outside',
      'empty',
      'allied',
      'enemy',
      'outside',
    ]);
  });

  it('keeps the nearby argument read-only for callers', () => {
    const args = buildFunctionArgs(77, [
      'empty',
      'allied',
      'enemy',
      'outside',
      'empty',
      'allied',
      'enemy',
      'outside',
    ]);

    expect(Object.isFrozen(args)).toBe(true);
    expect(Object.isFrozen(args.nearby)).toBe(true);
  });
});
