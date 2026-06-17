import { parseActionCode } from '../actions/parseActionCode';
import type { ActionCode, CellFunctionArgs } from '../types/game';
import { buildFunctionArgs } from './buildFunctionArgs';
import { transpilePythonToJS } from '../../utils/interpreter';

export interface UserFunctionExecutionResult {
  action: ActionCode | 'd';
  error: string | null;
}

type CompiledUserFunction = (health: number, nearby: readonly string[]) => unknown;

const compiledFunctionCache = new Map<string, CompiledUserFunction>();

export function executeUserFunction(source: string, args: CellFunctionArgs): UserFunctionExecutionResult {
  if (/^\s*(for|while)\b/m.test(source)) {
    return { action: 'd', error: 'Timed out' };
  }

  try {
    const safeArgs = buildFunctionArgs(args.health, args.nearby);
    const action = compileUserFunction(source)(safeArgs.health, safeArgs.nearby);

    if (typeof action !== 'string') {
      return { action: 'd', error: `Function returned ${typeof action}, expected string.` };
    }

    const parsed = parseActionCode(action);
    if (parsed.isValid === false) {
      return { action: 'd', error: parsed.reason };
    }

    return { action: parsed.code, error: null };
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
    `
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
}
