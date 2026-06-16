import { describe, expect, it } from 'vitest';
import { getTurnOrder } from '../../engine';
import { createMatchFixture, playerOneFixture } from '../fixtures/gameFixtures';

describe('turn order', () => {
  it('uses creation turn, start row, start column, then internal cell ID', () => {
    const cells = [
      {
        id: 'cell-d',
        teamId: playerOneFixture.id,
        color: playerOneFixture.color,
        position: { row: 5, column: 1 },
        health: 100,
        isAlive: true,
        creationTurn: 2,
      },
      {
        id: 'cell-c',
        teamId: playerOneFixture.id,
        color: playerOneFixture.color,
        position: { row: 1, column: 3 },
        health: 100,
        isAlive: true,
        creationTurn: 1,
      },
      {
        id: 'cell-a',
        teamId: playerOneFixture.id,
        color: playerOneFixture.color,
        position: { row: 1, column: 1 },
        health: 100,
        isAlive: true,
        creationTurn: 1,
      },
      {
        id: 'cell-b',
        teamId: playerOneFixture.id,
        color: playerOneFixture.color,
        position: { row: 1, column: 2 },
        health: 100,
        isAlive: true,
        creationTurn: 1,
      },
    ];

    expect(getTurnOrder(createMatchFixture(cells)).map((cell) => cell.id)).toEqual([
      'cell-a',
      'cell-b',
      'cell-c',
      'cell-d',
    ]);
  });
});
