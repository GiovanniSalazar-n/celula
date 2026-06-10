export interface ScoreInput {
  ticksSurvived: number;
  trailsEaten: number;
  mainCellsKilled: number;
  result: "win" | "loss";
}

export function calculateScore(_input: ScoreInput): number {
  throw new Error("Not implemented yet: Fase 4 will calculate score.");
}
