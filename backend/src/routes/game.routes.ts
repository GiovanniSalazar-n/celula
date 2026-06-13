import { Router } from 'express';
import { advanceSimulation, endSimulationEarly, serializeMatchState, startMatch } from '../game/engine.js';
import type { MatchStartInput, SimulationState } from '../game/types.js';

let activeMatch: SimulationState | null = null;

export function resetActiveMatchForTests() {
  activeMatch = null;
}

export const gameRouter = Router();

gameRouter.get('/state', (_req, res) => {
  res.json({
    match: activeMatch ? serializeMatchState(activeMatch) : null,
  });
});

gameRouter.post('/start', (req, res) => {
  const input = req.body as MatchStartInput;
  const { match, errors } = startMatch(input);

  if (!match) {
    return res.status(400).json({
      error: 'Invalid match configuration.',
      details: errors,
    });
  }

  activeMatch = match;
  return res.json({ match: serializeMatchState(activeMatch) });
});

gameRouter.post('/play', (_req, res) => {
  if (!activeMatch) {
    return res.status(404).json({ error: 'No active match.' });
  }

  if (activeMatch.result) {
    return res.status(409).json({ error: 'Cannot play a finished match.' });
  }

  activeMatch = {
    ...activeMatch,
    status: 'running',
  };

  return res.json({ match: serializeMatchState(activeMatch) });
});

gameRouter.post('/pause', (_req, res) => {
  if (!activeMatch) {
    return res.status(404).json({ error: 'No active match.' });
  }

  activeMatch = {
    ...activeMatch,
    status: activeMatch.result ? 'finished' : 'paused',
    locked: true,
  };

  return res.json({ match: serializeMatchState(activeMatch) });
});

gameRouter.post('/tick', (req, res) => {
  if (!activeMatch) {
    return res.status(404).json({ error: 'No active match.' });
  }

  if (!activeMatch.result) {
    const requestedSteps = typeof req.body?.steps === 'number' ? req.body.steps : 1;
    const nextState = advanceSimulation(activeMatch, requestedSteps);
    activeMatch = {
      ...nextState,
      status: nextState.result ? 'finished' : activeMatch.status,
    };
  }

  return res.json({ match: serializeMatchState(activeMatch) });
});

gameRouter.post('/end', (_req, res) => {
  if (!activeMatch) {
    return res.status(404).json({ error: 'No active match.' });
  }

  activeMatch = endSimulationEarly(activeMatch);
  return res.json({ match: serializeMatchState(activeMatch) });
});

gameRouter.post('/reset', (_req, res) => {
  activeMatch = null;
  return res.json({ match: null });
});
