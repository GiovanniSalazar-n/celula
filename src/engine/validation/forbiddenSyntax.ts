const IMPORT_PATTERN = /^\s*(import|from)\b/m;
const MUTATION_PATTERN = /^\s*(health|nearby)(?:\s*\[[^\]]+\])?\s*(=|\+=|-=|\*=|\/=|\/\/=|%=)/m;
const FORBIDDEN_STATE_PATTERN = /\b(board|turn|internal_state|internal|cells|team)\b|\bcell\s*\./;
const DANGEROUS_CALL_PATTERN =
  /\b(open|eval|exec|globals|locals|vars|dir|getattr|setattr|delattr|__import__|compile|input|require|Function)\s*\(/;
const NETWORK_PATTERN = /\b(requests|socket|urllib|httpx|fetch)\b/;
const BROWSER_GLOBAL_PATTERN = /\b(window|document|localStorage|globalThis)\b/;
const ASYNC_PATTERN = /\b(async|await|Promise|setTimeout|setInterval)\b/;

export function findForbiddenSyntax(source: string, functionName: string): string | null {
  if (/^\s*while\b/m.test(source)) {
    return 'while loops are not allowed.';
  }

  if (IMPORT_PATTERN.test(source)) {
    return 'Imports are not allowed.';
  }

  if (DANGEROUS_CALL_PATTERN.test(source)) {
    return 'Dangerous builtins are not allowed.';
  }

  if (NETWORK_PATTERN.test(source)) {
    return 'Network access is not allowed.';
  }

  if (BROWSER_GLOBAL_PATTERN.test(source)) {
    return 'Browser globals are not allowed.';
  }

  if (ASYNC_PATTERN.test(source)) {
    return 'Async, promises, and timers are not allowed.';
  }

  if (MUTATION_PATTERN.test(source)) {
    return 'User functions cannot mutate provided arguments or game state.';
  }

  const body = source
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith('def '))
    .join('\n');

  if (new RegExp(`\\b${functionName}\\s*\\(`).test(body)) {
    return 'Recursion is not allowed.';
  }

  if (FORBIDDEN_STATE_PATTERN.test(body)) {
    return 'User functions can only access health and nearby.';
  }

  return null;
}
