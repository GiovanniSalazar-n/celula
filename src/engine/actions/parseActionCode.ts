import {
  EAT_ACTION_CODES,
  MOVE_ACTION_CODES,
  REPRODUCE_ACTION_CODES,
  REST_ACTION_CODE,
} from '../constants/gameConstants';
import type { ActionCategory, ActionCode, Direction } from '../types/game';

export type ParsedActionCode =
  | {
      isValid: true;
      category: ActionCategory;
      code: ActionCode;
      direction?: Direction;
    }
  | {
      isValid: false;
      code: string;
      reason: string;
    };

const moveCodes = new Set<string>(MOVE_ACTION_CODES);
const eatCodes = new Set<string>(EAT_ACTION_CODES);
const reproduceCodes = new Set<string>(REPRODUCE_ACTION_CODES);

export function parseActionCode(rawCode: string): ParsedActionCode {
  const code = rawCode.trim().toLowerCase();

  if (code === REST_ACTION_CODE) {
    return { isValid: true, category: 'rest', code: REST_ACTION_CODE };
  }

  if (moveCodes.has(code)) {
    return {
      isValid: true,
      category: 'move',
      direction: code.slice(1) as Direction,
      code: code as ActionCode,
    };
  }

  if (eatCodes.has(code)) {
    return {
      isValid: true,
      category: 'eat',
      direction: code.slice(1) as Direction,
      code: code as ActionCode,
    };
  }

  if (reproduceCodes.has(code)) {
    return {
      isValid: true,
      category: 'reproduce',
      direction: code.slice(1) as Direction,
      code: code as ActionCode,
    };
  }

  return {
    isValid: false,
    code,
    reason: `Invalid action code: ${rawCode}`,
  };
}
