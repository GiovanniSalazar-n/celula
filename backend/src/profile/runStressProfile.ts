import { formatStressProfileReport, runStressProfile } from './stressProfile.js';

function parseCliInteger(flag: string, fallback: number): number {
  const flagIndex = process.argv.findIndex((argument) => argument === flag);
  if (flagIndex === -1) {
    return fallback;
  }

  const nextValue = Number.parseInt(process.argv[flagIndex + 1] ?? '', 10);
  return Number.isFinite(nextValue) ? nextValue : fallback;
}

const summary = runStressProfile({
  turns: parseCliInteger('--turns', 250),
  turnLimit: parseCliInteger('--turn-limit', 5000),
  topSlowTurns: parseCliInteger('--top', 5),
});

console.log(formatStressProfileReport(summary));
