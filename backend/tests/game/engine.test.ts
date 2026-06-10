import { describe, expect, it } from "vitest";
import { createGame, DEFAULT_BOARD_SIZE, isPositionInTeamQuadrant } from "../../src/game/engine.js";

const enemyTeams = [2, 3, 4] as const;

describe("game engine setup", () => {
  it("creates a 10x10 board by default", () => {
    const game = createGame({ playerStart: { x: 0, y: 0 } });

    expect(game.boardSize).toEqual(DEFAULT_BOARD_SIZE);
  });

  it("allows configuring the board size", () => {
    const game = createGame({
      boardSize: { width: 12, height: 8 },
      playerStart: { x: 0, y: 0 }
    });

    expect(game.boardSize).toEqual({ width: 12, height: 8 });
  });

  it("creates 4 teams with one live main cell each", () => {
    const game = createGame({ playerStart: { x: 1, y: 1 } });

    expect(game.teams).toHaveLength(4);
    expect(game.teams.map((team) => team.id)).toEqual([1, 2, 3, 4]);
    expect(game.teams.every((team) => team.mainCell.alive)).toBe(true);
  });

  it("accepts player start positions inside team 1 quadrant", () => {
    expect(isPositionInTeamQuadrant({ x: 0, y: 0 }, 1, DEFAULT_BOARD_SIZE)).toBe(true);
    expect(isPositionInTeamQuadrant({ x: 4, y: 4 }, 1, DEFAULT_BOARD_SIZE)).toBe(true);
  });

  it("rejects player start positions outside team 1 quadrant", () => {
    expect(isPositionInTeamQuadrant({ x: 5, y: 0 }, 1, DEFAULT_BOARD_SIZE)).toBe(false);
    expect(isPositionInTeamQuadrant({ x: 0, y: 5 }, 1, DEFAULT_BOARD_SIZE)).toBe(false);
  });

  it("places enemy main cells inside their own quadrants", () => {
    const game = createGame({ playerStart: { x: 0, y: 0 } });

    for (const teamId of enemyTeams) {
      const team = game.teams.find((candidate) => candidate.id === teamId);
      expect(team).toBeDefined();
      expect(isPositionInTeamQuadrant(team!.mainCell.position, teamId, game.boardSize)).toBe(true);
    }
  });
});
