import { parseActionCode } from '../actions/parseActionCode';
import { NEIGHBOR_STATES } from '../constants/gameConstants';
import type { ActionCode, CellFunctionArgs, NeighborState } from '../types/game';
import { transpilePythonToJS } from '../../utils/interpreter';
import { createSafeContext } from '../runtime/createSafeContext';
import { createStepLimiter } from '../runtime/stepLimiter';
import type { SafeHelpers } from '../runtime/safeHelpers';

export interface UserFunctionExecutionResult {
  action: ActionCode | 'd';
  error: string | null;
}

type CompiledUserFunction = (
  health: number,
  nearby: readonly string[],
  helpers: SafeHelpers,
  consumeStep: () => void,
) => unknown;

const MAX_EXECUTION_CACHE_ENTRIES_PER_SOURCE = 8192;
const compiledFunctionCache = new Map<string, CompiledUserFunction>();
const executionResultCache = new Map<string, Map<number, UserFunctionExecutionResult>>();
const neighborCode = new Map<string, number>(NEIGHBOR_STATES.map((state, index) => [state, index]));

export function executeUserFunction(source: string, args: CellFunctionArgs): UserFunctionExecutionResult {
  const nearbyKey = buildNearbyKey(args.nearby);
  return executeUserFunctionWithNearbyKey(source, args.health, nearbyKey, () => args.nearby);
}

export function executeUserFunctionWithNearbyKey(
  source: string,
  health: number,
  nearbyKey: number,
  createNearby: () => readonly NeighborState[],
): UserFunctionExecutionResult {
  if (/^\s*while\b/m.test(source)) {
    return { action: 'd', error: 'Timed out' };
  }

  try {
    const cacheKey = buildExecutionCacheKey(health, nearbyKey);
    const cachedResult = executionResultCache.get(source)?.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const args = {
      health,
      nearby: Object.freeze(createNearby()),
    };
    const stepLimiter = createStepLimiter();
    const context = createSafeContext(args, stepLimiter);
    const action = compileUserFunction(source)(
      context.health,
      context.nearby,
      context.helpers,
      () => stepLimiter.consume(),
    );

    if (typeof action !== 'string') {
      return cacheExecutionResult(source, cacheKey, {
        action: 'd',
        error: `Function returned ${typeof action}, expected string.`,
      });
    }

    const parsed = parseActionCode(action);
    if (parsed.isValid === false) {
      return cacheExecutionResult(source, cacheKey, { action: 'd', error: parsed.reason });
    }

    return cacheExecutionResult(source, cacheKey, { action: parsed.code, error: null });
  } catch (error) {
    return {
      action: 'd',
      error: error instanceof Error ? error.message : 'Runtime execution error.',
    };
  }
}

export function compileUserFunction(source: string): CompiledUserFunction {
  const cached = compiledFunctionCache.get(source);
  if (cached) {
    return cached;
  }

  const { jsCode, error } = transpilePythonToJS(source);

  if (error) {
    throw new Error(error);
  }

  const wrapper = new Function(
    'health',
    'nearby',
    'helpers',
    '__step',
    `
      const {
        range,
        len,
        min,
        max,
        abs,
        round,
        floor,
        ceil,
        sum,
        any,
        all,
        clamp,
        isEnemy,
        isAllied,
        isEmpty,
        isOutside,
        enemyDirections,
        emptyDirections,
        alliedDirections,
      } = helpers;
      ${jsCode}
      if (typeof cell !== 'function') {
        throw new Error("cell is not a function.");
      }
      return cell(health, nearby);
    `,
  ) as CompiledUserFunction;

  compiledFunctionCache.set(source, wrapper);
  return wrapper;
}

export function clearCompiledUserFunctionCache(): void {
  compiledFunctionCache.clear();
  executionResultCache.clear();
}

export function buildNearbyKey(nearby: readonly string[]): number {
  if (nearby.length !== 8) {
    throw new Error('nearby must contain exactly 8 neighbor states.');
  }

  let nearbyKey = 0;

  for (let index = 0; index < nearby.length; index += 1) {
    const code = neighborCode.get(nearby[index]);
    if (code === undefined) {
      throw new Error('nearby must contain only empty, allied, enemy, or outside states.');
    }

    nearbyKey = (nearbyKey << 2) | code;
  }

  return nearbyKey;
}

export function decodeNearbyKey(nearbyKey: number): readonly NeighborState[] {
  if (!Number.isInteger(nearbyKey) || nearbyKey < 0 || nearbyKey > 65535) {
    throw new Error('nearby key must encode exactly 8 neighbor states.');
  }

  const nearby = new Array<NeighborState>(8);

  for (let index = 7; index >= 0; index -= 1) {
    nearby[index] = NEIGHBOR_STATES[nearbyKey & 3];
    nearbyKey >>= 2;
  }

  return nearby;
}

function buildExecutionCacheKey(health: number, nearbyKey: number): number {
  if (!Number.isInteger(nearbyKey) || nearbyKey < 0 || nearbyKey > 65535) {
    throw new Error('nearby key must encode exactly 8 neighbor states.');
  }

  return health * 65536 + nearbyKey;
}

function cacheExecutionResult(
  source: string,
  cacheKey: number,
  result: UserFunctionExecutionResult,
): UserFunctionExecutionResult {
  let sourceCache = executionResultCache.get(source);
  if (!sourceCache) {
    sourceCache = new Map<number, UserFunctionExecutionResult>();
    executionResultCache.set(source, sourceCache);
  }

  if (!sourceCache.has(cacheKey) && sourceCache.size >= MAX_EXECUTION_CACHE_ENTRIES_PER_SOURCE) {
    const oldestKey = sourceCache.keys().next().value;
    if (oldestKey !== undefined) {
      sourceCache.delete(oldestKey);
    }
  }

  sourceCache.set(cacheKey, result);
  return result;
}
