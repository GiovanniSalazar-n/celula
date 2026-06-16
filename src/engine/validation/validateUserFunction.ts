import type { ActionCode } from '../types/game';
import { parseActionCode } from '../actions/parseActionCode';

export interface UserFunctionValidationResult {
  isValid: boolean;
  error: string | null;
  functionName?: string;
  actionCodes?: ActionCode[];
}

const FUNCTION_SIGNATURE = /^\s*def\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*:\s*$/m;
const LOOP_PATTERN = /^\s*(for|while)\b/m;
const IMPORT_PATTERN = /^\s*(import|from)\b/m;
const MUTATION_PATTERN = /^\s*(health|nearby)(?:\s*\[[^\]]+\])?\s*(=|\+=|-=|\*=|\/=|\/\/=|%=)/m;
const FORBIDDEN_STATE_PATTERN = /\b(board|turn|internal_state|internal|cells|team)\b|\bcell\s*\./;
const DANGEROUS_CALL_PATTERN =
  /\b(open|eval|exec|globals|locals|vars|dir|getattr|setattr|delattr|__import__|compile|input)\s*\(/;
const NETWORK_PATTERN = /\b(requests|socket|urllib|httpx|fetch)\b/;
const RETURN_PATTERN = /^\s*return\s+(.+?)\s*$/gm;
const LITERAL_RETURN_PATTERN = /^(['"])(.*?)\1$/;

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

  if (LOOP_PATTERN.test(source)) {
    return invalid('Loops are not allowed because functions must finish within 1 second.');
  }

  if (IMPORT_PATTERN.test(source)) {
    return invalid('Imports are not allowed.');
  }

  if (DANGEROUS_CALL_PATTERN.test(source)) {
    return invalid('Dangerous builtins are not allowed.');
  }

  if (NETWORK_PATTERN.test(source)) {
    return invalid('Network access is not allowed.');
  }

  if (MUTATION_PATTERN.test(source)) {
    return invalid('User functions cannot mutate provided arguments or game state.');
  }

  const body = source
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith('def '))
    .join('\n');

  if (FORBIDDEN_STATE_PATTERN.test(body)) {
    return invalid('User functions can only access health and nearby.');
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
      return invalid('Function returns must be literal valid action strings.');
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

function invalid(error: string): UserFunctionValidationResult {
  return {
    isValid: false,
    error,
  };
}
