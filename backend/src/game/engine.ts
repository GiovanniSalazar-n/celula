import type { BoardSize, CreateGameOptions, GameState, Position, TeamId, TeamState } from "./types.js";

export const DEFAULT_BOARD_SIZE: BoardSize = { width: 10, height: 10 };

const TEAM_IDS: TeamId[] = [1, 2, 3, 4];

export interface QuadrantBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export function createGame(options: CreateGameOptions = {}): GameState {
  const boardSize = options.boardSize ?? DEFAULT_BOARD_SIZE;
  validateBoardSize(boardSize);

  const playerStart = options.playerStart ?? { x: 0, y: 0 };

  if (!isPositionInTeamQuadrant(playerStart, 1, boardSize)) {
    throw new Error("Player start position must be inside team 1 quadrant.");
  }

  const teams = TEAM_IDS.map((teamId): TeamState => {
    const position = teamId === 1 ? playerStart : chooseDefaultStartForTeam(teamId, boardSize);

    return {
      id: teamId,
      mainCell: {
        teamId,
        position,
        alive: true
      },
      trails: []
    };
  });

  ensureUniqueMainCellPositions(teams);

  return {
    boardSize,
    status: "setup",
    tick: 0,
    teams
  };
}

export function isPositionInTeamQuadrant(position: Position, teamId: TeamId, boardSize: BoardSize): boolean {
  if (!isPositionInsideBoard(position, boardSize)) {
    return false;
  }

  const quadrant = getQuadrantForTeam(teamId, boardSize);

  return (
    position.x >= quadrant.minX &&
    position.x <= quadrant.maxX &&
    position.y >= quadrant.minY &&
    position.y <= quadrant.maxY
  );
}

export function getQuadrantForTeam(teamId: TeamId, boardSize: BoardSize): QuadrantBounds {
  validateBoardSize(boardSize);

  const leftMaxX = Math.floor(boardSize.width / 2) - 1;
  const rightMinX = Math.floor(boardSize.width / 2);
  const topMaxY = Math.floor(boardSize.height / 2) - 1;
  const bottomMinY = Math.floor(boardSize.height / 2);

  switch (teamId) {
    case 1:
      return { minX: 0, maxX: leftMaxX, minY: 0, maxY: topMaxY };
    case 2:
      return { minX: rightMinX, maxX: boardSize.width - 1, minY: 0, maxY: topMaxY };
    case 3:
      return { minX: 0, maxX: leftMaxX, minY: bottomMinY, maxY: boardSize.height - 1 };
    case 4:
      return { minX: rightMinX, maxX: boardSize.width - 1, minY: bottomMinY, maxY: boardSize.height - 1 };
  }
}

function chooseDefaultStartForTeam(teamId: TeamId, boardSize: BoardSize): Position {
  const quadrant = getQuadrantForTeam(teamId, boardSize);

  return {
    x: quadrant.minX,
    y: quadrant.minY
  };
}

function isPositionInsideBoard(position: Position, boardSize: BoardSize): boolean {
  return position.x >= 0 && position.x < boardSize.width && position.y >= 0 && position.y < boardSize.height;
}

function validateBoardSize(boardSize: BoardSize): void {
  if (!Number.isInteger(boardSize.width) || !Number.isInteger(boardSize.height)) {
    throw new Error("Board size must use integer dimensions.");
  }

  if (boardSize.width < 2 || boardSize.height < 2) {
    throw new Error("Board size must be at least 2x2 to support four quadrants.");
  }
}

function ensureUniqueMainCellPositions(teams: TeamState[]): void {
  const occupied = new Set<string>();

  for (const team of teams) {
    const key = `${team.mainCell.position.x},${team.mainCell.position.y}`;

    if (occupied.has(key)) {
      throw new Error("Two main cells cannot start in the same position.");
    }

    occupied.add(key);
  }
}
