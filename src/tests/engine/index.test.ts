import { describe, expect, it } from 'vitest';
import {
  ACTION_CODES,
  BOARD_COLUMNS,
  BOARD_ROWS,
  EAT_DAMAGE,
  MAX_HEALTH,
  NEIGHBOR_STATES,
  REST_HEAL,
  TURN_LIMIT,
  type Cell,
  type CellFunctionArgs,
} from '../../engine';
import { cellOneFixture, createMatchFixture } from '../fixtures/gameFixtures';

describe('engine public surface', () => {
  it('exports fixed MVP constants and action codes', () => {
    expect(BOARD_ROWS).toBe(100);
    expect(BOARD_COLUMNS).toBe(200);
    expect(TURN_LIMIT).toBe(5000);
    expect(MAX_HEALTH).toBe(100);
    expect(EAT_DAMAGE).toBe(5);
    expect(REST_HEAL).toBe(3);
    expect(ACTION_CODES).toContain('d');
    expect(ACTION_CODES).toContain('mne');
    expect(ACTION_CODES).toContain('asw');
    expect(ACTION_CODES).toContain('rne');
  });

  it('keeps user function args limited to health and eight nearby states', () => {
    const args: CellFunctionArgs = {
      health: 75,
      nearby: ['empty', 'allied', 'enemy', 'outside', 'empty', 'empty', 'enemy', 'allied'],
    };

    expect(Object.keys(args)).toEqual(['health', 'nearby']);
    expect(args.nearby).toHaveLength(8);
    expect(args.nearby.every((state) => NEIGHBOR_STATES.includes(state))).toBe(true);
  });

  it('defines cells without an age field', () => {
    const cell: Cell = cellOneFixture;

    expect('age' in cell).toBe(false);
    expect(cell.creationTurn).toBe(1);
  });

  it('defines matches with compact occupancy rather than a full board matrix', () => {
    const match = createMatchFixture();

    expect(match.board.rows).toBe(100);
    expect(match.board.columns).toBe(200);
    expect(match.board.occupancy.get('10,10')).toBe('cell-1');
    expect('matrix' in match.board).toBe(false);
  });
});
