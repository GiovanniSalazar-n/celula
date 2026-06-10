import type { GameState, Position, TeamId } from "./types.js";

export const DIRECTIONS = [
  { dx: 0, dy: -1, name: "up" },
  { dx: 0, dy: 1, name: "down" },
  { dx: -1, dy: 0, name: "left" },
  { dx: 1, dy: 0, name: "right" },
  { dx: -1, dy: -1, name: "up_left" },
  { dx: 1, dy: -1, name: "up_right" },
  { dx: -1, dy: 1, name: "down_left" },
  { dx: 1, dy: 1, name: "down_right" }
] as const;

export type Direction = (typeof DIRECTIONS)[number];

export function moveMainCell(game: GameState, teamId: TeamId, direction: Direction): GameState {
  const team = game.teams.find((candidate) => candidate.id === teamId);

  if (!team || !team.mainCell.alive) {
    return cloneGame(game);
  }

  const currentPosition = team.mainCell.position;
  const nextPosition = {
    x: currentPosition.x + direction.dx,
    y: currentPosition.y + direction.dy
  };

  if (!isInsideBoard(nextPosition, game)) {
    return cloneGame(game);
  }

  return {
    ...game,
    teams: game.teams.map((candidate) => {
      if (candidate.id !== teamId) {
        return cloneTeam(candidate);
      }

      return {
        ...candidate,
        mainCell: {
          ...candidate.mainCell,
          position: nextPosition
        },
        trails: [
          ...candidate.trails,
          {
            teamId,
            position: currentPosition
          }
        ]
      };
    })
  };
}

function isInsideBoard(position: Position, game: GameState): boolean {
  return position.x >= 0 && position.x < game.boardSize.width && position.y >= 0 && position.y < game.boardSize.height;
}

function cloneGame(game: GameState): GameState {
  return {
    ...game,
    teams: game.teams.map(cloneTeam)
  };
}

function cloneTeam(team: GameState["teams"][number]): GameState["teams"][number] {
  return {
    ...team,
    mainCell: {
      ...team.mainCell,
      position: { ...team.mainCell.position }
    },
    trails: team.trails.map((trail) => ({
      ...trail,
      position: { ...trail.position }
    }))
  };
}
