import type { Match } from '../types/game';

export interface ActionResolution {
  match: Match;
  status: 'success' | 'invalid';
  message?: string;
}
