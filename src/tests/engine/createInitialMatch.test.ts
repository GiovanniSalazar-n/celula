import { describe, expect, it } from 'vitest';
import { BOARD_COLUMNS, BOARD_ROWS, TURN_LIMIT, createInitialMatch } from '../../engine';
import { playerOneFixture, playerTwoFixture } from '../fixtures/gameFixtures';

describe('createInitialMatch', () => {
  it('creates a locked MVP match with fixed board, turn 1, and one cell per player', () => {
    const match = createInitialMatch([playerOneFixture, playerTwoFixture], {
      random: () => 0,
    });

    expect(match.isLocked).toBe(true);
    expect(match.currentTurn).toBe(1);
    expect(match.turnLimit).toBe(TURN_LIMIT);
    expect(match.board.rows).toBe(BOARD_ROWS);
    expect(match.board.columns).toBe(BOARD_COLUMNS);
    expect(match.board.cells).toHaveLength(2);
    expect(match.board.cells.map((cell) => cell.teamId)).toEqual(['player-1', 'player-2']);
    expect(match.board.occupancy.size).toBe(2);
  });

  it('places initial cells inside the board and on distinct squares', () => {
    const match = createInitialMatch([playerOneFixture, playerTwoFixture], {
      random: () => 0,
    });

    const [first, second] = match.board.cells;

    expect(first.position.row).toBeGreaterThanOrEqual(0);
    expect(first.position.row).toBeLessThan(BOARD_ROWS);
    expect(first.position.column).toBeGreaterThanOrEqual(0);
    expect(first.position.column).toBeLessThan(BOARD_COLUMNS);
    expect(second.position).not.toEqual(first.position);
  });
});
