import { describe, expect, it } from "vitest";
import { createGame } from "../../src/game/engine.js";
import { DIRECTIONS, moveMainCell } from "../../src/game/movement.js";

describe("movement directions", () => {
  it("defines the 8 possible movement directions", () => {
    expect(DIRECTIONS).toHaveLength(8);
    expect(DIRECTIONS.map((direction) => direction.name)).toEqual([
      "up",
      "down",
      "left",
      "right",
      "up_left",
      "up_right",
      "down_left",
      "down_right"
    ]);
  });
});

describe("basic main cell movement", () => {
  it("cancels movement when the cell would leave the board", () => {
    const game = createGame({ playerStart: { x: 0, y: 0 } });
    const nextGame = moveMainCell(game, 1, { dx: -1, dy: 0, name: "left" });
    const playerTeam = nextGame.teams.find((team) => team.id === 1)!;

    expect(playerTeam.mainCell.position).toEqual({ x: 0, y: 0 });
    expect(playerTeam.trails).toEqual([]);
  });

  it("leaves a trail in the previous position when moving to an empty cell", () => {
    const game = createGame({ playerStart: { x: 1, y: 1 } });
    const nextGame = moveMainCell(game, 1, { dx: 1, dy: 0, name: "right" });
    const playerTeam = nextGame.teams.find((team) => team.id === 1)!;

    expect(playerTeam.mainCell.position).toEqual({ x: 2, y: 1 });
    expect(playerTeam.trails).toEqual([{ teamId: 1, position: { x: 1, y: 1 } }]);
  });

  it("does not move existing trails when the main cell moves again", () => {
    const game = createGame({ playerStart: { x: 1, y: 1 } });
    const afterFirstMove = moveMainCell(game, 1, { dx: 1, dy: 0, name: "right" });
    const afterSecondMove = moveMainCell(afterFirstMove, 1, { dx: 1, dy: 0, name: "right" });
    const playerTeam = afterSecondMove.teams.find((team) => team.id === 1)!;

    expect(playerTeam.mainCell.position).toEqual({ x: 3, y: 1 });
    expect(playerTeam.trails).toEqual([
      { teamId: 1, position: { x: 1, y: 1 } },
      { teamId: 1, position: { x: 2, y: 1 } }
    ]);
  });
});
