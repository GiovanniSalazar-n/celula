import { describe, expect, it } from 'vitest';
import { executeTurn, MAX_ERRORS_PER_TURN, MAX_STORED_MATCH_ERRORS } from '../../engine';
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

  it('bounds invalid action telemetry so crowded reproduction does not retain unbounded history', () => {
    const packedCells = Array.from({ length: MAX_ERRORS_PER_TURN + 80 }, (_, index) => ({
      ...cellOneFixture,
      id: `packed-${index}`,
      position: { row: 20, column: index },
    }));
    const existingErrors = Array.from({ length: MAX_STORED_MATCH_ERRORS + 50 }, (_, index) => ({
      turn: index + 1,
      playerId: playerOneFixture.id,
      cellId: `old-${index}`,
      type: 'invalid-action' as const,
      message: 'Old invalid action.',
    }));
    const match = {
      ...createMatchFixture(packedCells),
      players: [
        { ...playerOneFixture, functionSource: 'def cell(health, nearby):\n    return "re"' },
        playerTwoFixture,
      ] as const,
      currentTurn: 1200,
      errors: existingErrors,
    };

    const result = executeTurn(match);
    const currentTurnErrors = result.errors.filter((error) => error.turn === 1200);

    expect(currentTurnErrors.length).toBe(MAX_ERRORS_PER_TURN);
    expect(result.errors.length).toBeLessThanOrEqual(MAX_STORED_MATCH_ERRORS);
  });
});
