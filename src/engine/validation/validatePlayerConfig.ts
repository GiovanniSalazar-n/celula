import type { Player, PlayerId } from '../types/game';
import { MAX_TURN_LIMIT, MIN_TURN_LIMIT } from '../constants/gameConstants';

export type PlayerConfigValidationField =
  | 'players'
  | 'name'
  | 'color'
  | 'functionSource'
  | 'functionValidation'
  | 'confirmation';

export interface PlayerConfigValidationError {
  playerId?: PlayerId;
  field: PlayerConfigValidationField;
  message: string;
}

export interface PlayerConfigValidationResult {
  isValid: boolean;
  errors: PlayerConfigValidationError[];
}

export interface TurnLimitValidationResult {
  isValid: boolean;
  error: string | null;
}

export interface PlayerConfigValidationOptions {
  requireConfirmed?: boolean;
}

export function validatePlayerConfigs(
  players: readonly Player[],
  options: PlayerConfigValidationOptions = {},
): PlayerConfigValidationResult {
  const errors: PlayerConfigValidationError[] = [];
  const requireConfirmed = options.requireConfirmed ?? true;

  if (players.length !== 2) {
    errors.push({
      field: 'players',
      message: 'Exactly two local players are required.',
    });
  }

  for (const player of players) {
    if (player.name.trim() === '') {
      errors.push({
        playerId: player.id,
        field: 'name',
        message: 'Player name is required.',
      });
    }

    if (player.color.trim() === '') {
      errors.push({
        playerId: player.id,
        field: 'color',
        message: 'Player color is required.',
      });
    }

    if (player.functionSource.trim() === '') {
      errors.push({
        playerId: player.id,
        field: 'functionSource',
        message: 'Player function source is required.',
      });
    }

    if (!player.isFunctionValid) {
      errors.push({
        playerId: player.id,
        field: 'functionValidation',
        message: player.validationError || 'Player function must be valid before Play.',
      });
    }

    if (requireConfirmed && !player.isConfirmed) {
      errors.push({
        playerId: player.id,
        field: 'confirmation',
        message: 'Player must be confirmed before Play.',
      });
    }
  }

  const normalizedNames = players
    .map((player) => player.name.trim().toLocaleLowerCase())
    .filter(Boolean);
  const uniqueNames = new Set(normalizedNames);

  if (normalizedNames.length > 0 && uniqueNames.size !== normalizedNames.length) {
    errors.push({
      field: 'name',
      message: 'Player names must be unique.',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateTurnLimit(turnLimit: number): TurnLimitValidationResult {
  if (!Number.isInteger(turnLimit)) {
    return {
      isValid: false,
      error: 'Turn limit must be a whole number.',
    };
  }

  if (turnLimit < MIN_TURN_LIMIT || turnLimit > MAX_TURN_LIMIT) {
    return {
      isValid: false,
      error: `Turn limit must be between ${MIN_TURN_LIMIT} and ${MAX_TURN_LIMIT}.`,
    };
  }

  return {
    isValid: true,
    error: null,
  };
}
