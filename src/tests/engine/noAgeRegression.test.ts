import { describe, expect, it } from 'vitest';
import { executeTurn } from '../../engine';
import { cellOneFixture, createMatchFixture } from '../fixtures/gameFixtures';

describe('no age regression', () => {
  it('engine cells do not expose age and turns do not add it', () => {
    const result = executeTurn(createMatchFixture([cellOneFixture]));
    const cell = result.board.cells[0] as unknown as Record<string, unknown>;

    expect('age' in cell).toBe(false);
  });
});
