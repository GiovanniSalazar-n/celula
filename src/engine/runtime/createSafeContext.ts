import type { CellFunctionArgs } from '../types/game';
import { createSafeHelpers, type SafeHelpers } from './safeHelpers';
import type { StepLimiter } from './stepLimiter';

export interface SafeUserContext {
  health: number;
  nearby: readonly string[];
  helpers: SafeHelpers;
}

export function createSafeContext(args: CellFunctionArgs, stepLimiter: StepLimiter): SafeUserContext {
  return Object.freeze({
    health: args.health,
    nearby: Object.freeze([...args.nearby]),
    helpers: createSafeHelpers(args.nearby, stepLimiter),
  });
}
