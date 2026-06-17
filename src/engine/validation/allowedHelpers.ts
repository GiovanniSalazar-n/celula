export const SAFE_VALUE_HELPERS = [
  'range',
  'len',
  'min',
  'max',
  'abs',
  'round',
  'floor',
  'ceil',
  'sum',
  'any',
  'all',
  'clamp',
] as const;

export const READ_ONLY_GAME_HELPERS = [
  'isEnemy',
  'isAllied',
  'isEmpty',
  'isOutside',
  'enemyDirections',
  'emptyDirections',
  'alliedDirections',
] as const;

export const ALLOWED_HELPERS = [
  ...SAFE_VALUE_HELPERS,
  ...READ_ONLY_GAME_HELPERS,
] as const;

export type AllowedHelperName = typeof ALLOWED_HELPERS[number];
