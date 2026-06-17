import type {
  ActionCode,
  Direction,
  EatActionCode,
  MoveActionCode,
  NeighborState,
  ReproduceActionCode,
  RestActionCode,
} from '../types/game';

export const BOARD_ROWS = 100;
export const BOARD_COLUMNS = 200;
export const TURN_LIMIT = 5000;
export const MIN_TURN_LIMIT = 1;
export const MAX_TURN_LIMIT = 10000;
export const MAX_HEALTH = 100;
export const EAT_DAMAGE = 5;
export const REST_HEAL = 3;
export const MAX_ERRORS_PER_TURN = 100;
export const MAX_STORED_MATCH_ERRORS = 200;

export const DIRECTIONS = [
  'n',
  's',
  'e',
  'w',
  'ne',
  'nw',
  'se',
  'sw',
] as const satisfies readonly Direction[];

export const NEIGHBOR_STATES = [
  'empty',
  'allied',
  'enemy',
  'outside',
] as const satisfies readonly NeighborState[];

export const MOVE_ACTION_CODES = [
  'mn',
  'ms',
  'me',
  'mw',
  'mne',
  'mnw',
  'mse',
  'msw',
] as const satisfies readonly MoveActionCode[];

export const EAT_ACTION_CODES = [
  'an',
  'as',
  'ae',
  'aw',
  'ane',
  'anw',
  'ase',
  'asw',
] as const satisfies readonly EatActionCode[];

export const REPRODUCE_ACTION_CODES = [
  'rn',
  'rs',
  're',
  'rw',
  'rne',
  'rnw',
  'rse',
  'rsw',
] as const satisfies readonly ReproduceActionCode[];

export const REST_ACTION_CODE = 'd' as const satisfies RestActionCode;

export const ACTION_CODES = [
  ...MOVE_ACTION_CODES,
  ...EAT_ACTION_CODES,
  ...REPRODUCE_ACTION_CODES,
  REST_ACTION_CODE,
] as const satisfies readonly ActionCode[];

export const SIMULATION_SPEEDS = [
  { value: 1, label: '1x' },
  { value: 2, label: '2x' },
  { value: 5, label: '5x' },
] as const;
