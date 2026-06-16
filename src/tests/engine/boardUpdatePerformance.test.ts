import { describe, expect, it } from 'vitest';
import { createBoard, executeTurn } from '../../engine';
import { cellOneFixture, createMatchFixture } from '../fixtures/gameFixtures';

describe('board update performance shape', () => {
  it('uses compact occupancy instead of a full 100 by 200 matrix', () => {
    const result = executeTurn(createMatchFixture([cellOneFixture]));

    expect(result.board.occupancy).toBeInstanceOf(Map);
    expect(result.board.occupancy.size).toBeLessThan(20000);
    expect(Array.isArray(result.board.occupancy)).toBe(false);
  });

  it('board creation does not allocate full-grid occupancy for sparse cells', () => {
    expect(createBoard([cellOneFixture]).occupancy.size).toBe(1);
  });
});
