import type { Match, MatchResult, PlayerId, TeamStats, TerminationCause } from '../types/game';

export function evaluateVictory(
  match: Match,
  cause?: 'turn-limit' | 'manual-end',
): MatchResult | undefined {
  const teamStats = buildTeamStats(match);
  const livingTeams = teamStats.filter((stat) => stat.livingCells > 0);

  if (cause === 'manual-end' || cause === 'turn-limit') {
    return leaderResult(teamStats, cause, match.currentTurn);
  }

  if (livingTeams.length === 0) {
    return {
      isDraw: true,
      finalTurn: match.currentTurn,
      terminationCause: 'both-teams-eliminated',
      teamStats,
    };
  }

  if (livingTeams.length === 1) {
    return {
      winnerTeamId: livingTeams[0].teamId,
      isDraw: false,
      finalTurn: match.currentTurn,
      terminationCause: 'team-eliminated',
      teamStats,
    };
  }

  if (match.currentTurn > match.turnLimit) {
    return leaderResult(teamStats, 'turn-limit', match.currentTurn - 1);
  }

  return undefined;
}

export function buildTeamStats(match: Match): TeamStats[] {
  return match.players.map((player) => {
    const livingCells = match.board.cells.filter((cell) => cell.isAlive && cell.teamId === player.id);

    return {
      teamId: player.id,
      playerName: player.name,
      color: player.color,
      livingCells: livingCells.length,
      totalHealth: livingCells.reduce((total, cell) => total + cell.health, 0),
    };
  });
}

function leaderResult(
  teamStats: TeamStats[],
  terminationCause: TerminationCause,
  finalTurn: number,
): MatchResult {
  const [first, second] = teamStats;
  const winnerTeamId = pickLeader(first, second);

  return {
    winnerTeamId,
    isDraw: winnerTeamId === undefined,
    finalTurn,
    terminationCause,
    teamStats,
  };
}

function pickLeader(first: TeamStats, second: TeamStats): PlayerId | undefined {
  if (first.livingCells > second.livingCells) return first.teamId;
  if (second.livingCells > first.livingCells) return second.teamId;
  if (first.totalHealth > second.totalHealth) return first.teamId;
  if (second.totalHealth > first.totalHealth) return second.teamId;
  return undefined;
}
