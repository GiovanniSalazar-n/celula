import { describe, expect, it } from 'vitest';
import { resolveRest } from '../../engine';
import { cellOneFixture, createMatchFixture } from '../fixtures/gameFixtures';

describe('resolveRest', () => {
  it('restores 3 health and caps at 100', () => {
    const match = createMatchFixture([{ ...cellOneFixture, health: 70 }]);
    const result = resolveRest(match, cellOneFixture.id);

    expect(result.status).toBe('success');
    expect(result.match.board.cells[0].health).toBe(73);

    const capped = resolveRest(createMatchFixture([{ ...cellOneFixture, health: 99 }]), cellOneFixture.id);
    expect(capped.match.board.cells[0].health).toBe(100);
  });
});
