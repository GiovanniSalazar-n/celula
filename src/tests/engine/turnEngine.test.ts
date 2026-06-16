import { describe, expect, it } from 'vitest';
import { executeTurn } from '../../engine';
import { cellOneFixture, cellTwoFixture, createMatchFixture, playerOneFixture, playerTwoFixture } from '../fixtures/gameFixtures';

describe('executeTurn', () => {
  it('prevents newborn cells from acting on the turn they are created', () => {
    const match = {
      ...createMatchFixture([cellOneFixture, cellTwoFixture]),
      players: [
        { ...playerOneFixture, functionSource: 'def cell(health, nearby):\n    return "rn"' },
        { ...playerTwoFixture, functionSource: 'def cell(health, nearby):\n    return "d"' },
      ] as const,
    };

    const result = executeTurn(match);
    const newborn = result.board.cells.find((cell) => cell.id !== cellOneFixture.id && cell.id !== cellTwoFixture.id);

    expect(newborn?.lastAction).toBe('born');
    expect(result.currentTurn).toBe(2);
  });

  it('skips cells that died before their scheduled action', () => {
    const fragileEnemy = {
      ...cellTwoFixture,
      health: 5,
      position: { row: 10, column: 11 },
    };
    const match = {
      ...createMatchFixture([cellOneFixture, fragileEnemy]),
      players: [
        { ...playerOneFixture, functionSource: 'def cell(health, nearby):\n    return "ae"' },
        { ...playerTwoFixture, functionSource: 'def cell(health, nearby):\n    return "mw"' },
      ] as const,
    };

    const result = executeTurn(match);

    expect(result.board.cells.some((cell) => cell.id === fragileEnemy.id)).toBe(false);
  });

  it('runtime errors consume the action without healing or changing health', () => {
    const match = {
      ...createMatchFixture([{ ...cellOneFixture, health: 50 }]),
      players: [
        { ...playerOneFixture, functionSource: 'def cell(health, nearby):\n    return missing_name' },
        playerTwoFixture,
      ] as const,
    };

    const result = executeTurn(match);
    const cell = result.board.cells.find((candidate) => candidate.id === cellOneFixture.id);

    expect(cell?.health).toBe(50);
    expect(result.errors[0]).toMatchObject({
      type: 'runtime',
      cellId: cellOneFixture.id,
    });
  });
});
