import { Router } from 'express';
import { validateStrategyWithRuntime } from '../game/engineRuntime.js';

export const validationRouter = Router();

validationRouter.post('/player-function', async (req, res) => {
  const code = typeof req.body?.code === 'string' ? req.body.code : '';
  const result = await validateStrategyWithRuntime(code);
  res.json(result);
});
