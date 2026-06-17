export const DEFAULT_USER_FUNCTION_STEP_LIMIT = 1000;
export const STEP_LIMIT_ERROR = 'Step limit exceeded.';

export interface StepLimiter {
  consume: (steps?: number) => void;
}

export function createStepLimiter(limit = DEFAULT_USER_FUNCTION_STEP_LIMIT): StepLimiter {
  let usedSteps = 0;

  return {
    consume(steps = 1) {
      usedSteps += steps;
      if (usedSteps > limit) {
        throw new Error(STEP_LIMIT_ERROR);
      }
    },
  };
}
