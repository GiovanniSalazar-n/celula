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
