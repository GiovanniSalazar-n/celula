import type { Match } from '../types/game';

export function canEditMatchConfiguration(match: Match): boolean {
  return !match.isLocked && match.status === 'configuration';
}
