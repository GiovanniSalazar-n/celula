import type { ActionCode } from '../types/game';
import { parseActionCode } from '../actions/parseActionCode';
import { ALLOWED_HELPERS } from './allowedHelpers';
import { findForbiddenSyntax } from './forbiddenSyntax';

export interface UserFunctionValidationResult {
  isValid: boolean;
  error: string | null;
  functionName?: string;
  actionCodes?: ActionCode[];
}

const FUNCTION_SIGNATURE = /^\s*def\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*:\s*$/m;
const RETURN_PATTERN = /^\s*return\s+(.+?)\s*$/gm;
const LITERAL_RETURN_PATTERN = /^(['"])(.*?)\1$/;
const CONCAT_RETURN_PATTERN = /^(['"])([mar])\1\s*\+\s*([A-Za-z_]\w*)$/;
const FOR_LOOP_PATTERN = /^\s*for\s+([A-Za-z_]\w*)\s+in\s+(.+?)\s*:\s*$/gm;
const RANGE_PATTERN = /^range\s*\(\s*(-?\d+)\s*(?:,\s*(-?\d+)\s*)?\)$/;
const LIST_LITERAL_PATTERN = /^\[[\s\S]*\]$/;
const DIRECTION_HELPER_PATTERN = /^(enemyDirections|emptyDirections|alliedDirections)\s*\(\s*\)$/;
const SAFE_LOOP_RANGE_LIMIT = 512;
const allowedHelperSet = new Set<string>(ALLOWED_HELPERS);

export function validateUserFunction(source: string): UserFunctionValidationResult {
  if (source.trim() === '') {
    return invalid('Function source is required.');
  }

  const signature = source.match(FUNCTION_SIGNATURE);
  if (!signature) {
    return invalid('Function must define a Python function.');
  }

  const [, functionName, rawArgs] = signature;
  const args = rawArgs
    .split(',')
    .map((arg) => arg.trim())
    .filter(Boolean);

  if (args.length !== 2 || args[0] !== 'health' || args[1] !== 'nearby') {
    return invalid('Function must receive exactly health and nearby arguments.');
  }

  const forbiddenSyntax = findForbiddenSyntax(source, functionName);
  if (forbiddenSyntax) {
    return invalid(forbiddenSyntax);
  }

  const loopAnalysis = analyzeForLoops(source);
  if (loopAnalysis.error) {
    return invalid(loopAnalysis.error);
  }

  const helperError = validateHelperCalls(source, functionName);
  if (helperError) {
    return invalid(helperError);
  }

  const actionCodes: ActionCode[] = [];
  const returnExpressions = [...source.matchAll(RETURN_PATTERN)];

  if (returnExpressions.length === 0) {
    return invalid('Function must return a literal valid action code.');
  }

  for (const match of returnExpressions) {
    const expression = match[1].trim();
    const literal = expression.match(LITERAL_RETURN_PATTERN);

    if (!literal) {
      const dynamicReturn = expression.match(CONCAT_RETURN_PATTERN);
      if (!dynamicReturn || !loopAnalysis.directionVariables.has(dynamicReturn[3])) {
        return invalid('Function returns must be literal valid action strings.');
      }

      actionCodes.push(`${dynamicReturn[2]}${dynamicReturn[3]}` as ActionCode);
      continue;
    }

    const parsed = parseActionCode(literal[2]);
    if (parsed.isValid === false) {
      return invalid(parsed.reason);
    }

    actionCodes.push(parsed.code);
  }

  return {
    isValid: true,
    error: null,
    functionName,
    actionCodes,
  };
}

function analyzeForLoops(source: string): { error: string | null; directionVariables: Set<string> } {
  const directionVariables = new Set<string>();
  const loops = [...source.matchAll(FOR_LOOP_PATTERN)];

  for (const loop of loops) {
    const variableName = loop[1];
    const sourceExpression = loop[2].trim();

    if (sourceExpression === 'nearby' || LIST_LITERAL_PATTERN.test(sourceExpression)) {
      continue;
    }

    if (DIRECTION_HELPER_PATTERN.test(sourceExpression)) {
      directionVariables.add(variableName);
      continue;
    }

    const range = sourceExpression.match(RANGE_PATTERN);
    if (range) {
      const start = range[2] === undefined ? 0 : Number(range[1]);
      const end = range[2] === undefined ? Number(range[1]) : Number(range[2]);
      if (Math.max(0, end - start) > SAFE_LOOP_RANGE_LIMIT) {
        return {
          error: `range loops must contain ${SAFE_LOOP_RANGE_LIMIT} or fewer steps.`,
          directionVariables,
        };
      }
      continue;
    }

    return {
      error: 'for loops must use nearby, range(...), safe arrays, or direction helpers.',
      directionVariables,
    };
  }

  return { error: null, directionVariables };
}

function validateHelperCalls(source: string, functionName: string): string | null {
  const body = source
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith('def '))
    .join('\n');
  const calls = [...body.matchAll(/\b([A-Za-z_]\w*)\s*\(/g)].map((match) => match[1]);
  const allowedCalls = new Set(['if', 'elif', 'for', 'return', functionName, ...allowedHelperSet]);

  for (const call of calls) {
    if (allowedCalls.has(call)) {
      continue;
    }

    return `Helper "${call}" is not allowed.`;
  }

  return null;
}

function invalid(error: string): UserFunctionValidationResult {
  return {
    isValid: false,
    error,
  };
}
