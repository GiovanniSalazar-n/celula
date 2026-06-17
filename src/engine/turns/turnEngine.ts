import { parseActionCode } from '../actions/parseActionCode';
import { getCellAtPosition } from '../board/occupancy';
import {
  DIRECTION_OFFSETS,
  isInsideBoard,
  isInsideCoordinates,
  offsetPosition,
  positionKey,
  positionKeyFromCoordinates,
} from '../board/position';
import {
  DIRECTIONS,
  EAT_DAMAGE,
  MAX_ERRORS_PER_TURN,
  MAX_HEALTH,
  MAX_STORED_MATCH_ERRORS,
  REST_HEAL,
} from '../constants/gameConstants';
import { decodeNearbyKey, executeUserFunctionWithNearbyKey } from '../validation/executeUserFunction';
import { evaluateVictory } from '../victory/evaluateVictory';
import type { Cell, Direction, GameError, Match, NeighborState, OccupancyKey, PlayerId, Position } from '../types/game';

export function getTurnOrder(match: Match): Cell[] {
  return match.board.cells
    .filter((cell) => cell.isAlive)
    .sort((left, right) => {
      if (left.creationTurn !== right.creationTurn) return left.creationTurn - right.creationTurn;
      if (left.position.row !== right.position.row) return left.position.row - right.position.row;
      if (left.position.column !== right.position.column) return left.position.column - right.position.column;
      return left.id.localeCompare(right.id);
    });
}

export function executeTurn(match: Match): Match {
  if (match.status === 'finished') {
    return match;
  }

  const eligibleCells = getTurnOrder(match);
  const cells = match.board.cells.slice();
  const occupancy = new Map<OccupancyKey, string>(match.board.occupancy);
  const idToIndex = new Map<string, number>();
  const errors: GameError[] = trimStoredErrors(match.errors);
  const errorCountsByTurn = countErrorsByTurn(errors);

  cells.forEach((cell, index) => {
    idToIndex.set(cell.id, index);
  });

  for (const eligibleCell of eligibleCells) {
    const currentIndex = idToIndex.get(eligibleCell.id);
    if (currentIndex === undefined) {
      continue;
    }

    const currentCell = cells[currentIndex];
    if (!currentCell?.isAlive || currentCell.health <= 0) {
      continue;
    }

    const player = match.players.find((candidate) => candidate.id === currentCell.teamId);
    if (!player) {
      continue;
    }

    const nearbyKey = buildNearbyKeyFromWorkingState(currentCell, cells, occupancy, idToIndex);
    const execution = executeUserFunctionWithNearbyKey(
      player.functionSource,
      currentCell.health,
      nearbyKey,
      () => decodeNearbyKey(nearbyKey),
    );

    if (execution.error) {
      pushGameError(errors, errorCountsByTurn, {
        turn: match.currentTurn,
        playerId: player.id,
        cellId: currentCell.id,
        type: execution.error === 'Timed out' ? 'timeout' : 'runtime',
        message: execution.error,
      });
      cells[currentIndex] = {
        ...currentCell,
        lastAction: 'runtime-error',
        lastActionStatus: 'invalid',
      };
      continue;
    }

    const parsed = parseActionCode(execution.action);
    if (parsed.isValid === false) {
      pushGameError(errors, errorCountsByTurn, {
        turn: match.currentTurn,
        playerId: player.id,
        cellId: currentCell.id,
        type: 'invalid-action',
        message: parsed.reason,
      });
      continue;
    }

    resolveActionInWorkingState({
      cells,
      occupancy,
      idToIndex,
      cellIndex: currentIndex,
      category: parsed.category,
      direction: parsed.direction,
      currentTurn: match.currentTurn,
      errors,
      errorCountsByTurn,
      playerId: player.id,
    });
  }

  const livingCells = cells.filter((cell) => cell.isAlive && cell.health > 0);
  const advancedMatch: Match = {
    ...match,
    board: {
      rows: match.board.rows,
      columns: match.board.columns,
      cells: livingCells,
      occupancy: new Map(occupancy),
    },
    errors,
    currentTurn: match.currentTurn + 1,
  };
  const result = evaluateVictory(
    advancedMatch,
    match.currentTurn >= match.turnLimit ? 'turn-limit' : undefined,
  );

  if (result) {
    return {
      ...advancedMatch,
      status: 'finished',
      result,
    };
  }

  return advancedMatch;
}

interface WorkingStateAction {
  cells: Cell[];
  occupancy: Map<OccupancyKey, string>;
  idToIndex: Map<string, number>;
  cellIndex: number;
  category: 'move' | 'eat' | 'reproduce' | 'rest';
  direction?: Direction;
  currentTurn: number;
  errors: GameError[];
  errorCountsByTurn: Map<number, number>;
  playerId: PlayerId;
}

function resolveActionInWorkingState(action: WorkingStateAction): void {
  const cell = action.cells[action.cellIndex];

  if (!cell?.isAlive || cell.health <= 0) {
    return;
  }

  if (action.category === 'rest') {
    const nextHealth = Math.min(MAX_HEALTH, cell.health + REST_HEAL);
    if (nextHealth === cell.health && cell.lastAction === 'd' && cell.lastActionStatus === 'success') {
      return;
    }

    action.cells[action.cellIndex] = {
      ...cell,
      health: nextHealth,
      lastAction: 'd',
      lastActionStatus: 'success',
    };
    return;
  }

  if (!action.direction) {
    markInvalid(action, cell, 'Action direction is missing.');
    return;
  }

  if (action.category === 'move') {
    const offset = DIRECTION_OFFSETS[action.direction];
    const destinationRow = cell.position.row + offset.row;
    const destinationColumn = cell.position.column + offset.column;
    const destinationKey = positionKeyFromCoordinates(destinationRow, destinationColumn);

    if (!isInsideCoordinates(destinationRow, destinationColumn) || action.occupancy.has(destinationKey)) {
      markInvalid(action, cell, 'Move destination is outside or occupied.', `m${action.direction}`);
      return;
    }

    action.occupancy.delete(positionKey(cell.position));
    action.occupancy.set(destinationKey, cell.id);
    action.cells[action.cellIndex] = {
      ...cell,
      position: {
        row: destinationRow,
        column: destinationColumn,
      },
      lastAction: `m${action.direction}`,
      lastActionStatus: 'success',
    };
    return;
  }

  if (action.category === 'eat') {
    const offset = DIRECTION_OFFSETS[action.direction];
    const targetRow = cell.position.row + offset.row;
    const targetColumn = cell.position.column + offset.column;

    if (!isInsideCoordinates(targetRow, targetColumn)) {
      markInvalid(action, cell, 'Eat target is outside the board.', `a${action.direction}`);
      return;
    }

    const targetId = action.occupancy.get(positionKeyFromCoordinates(targetRow, targetColumn));
    const targetIndex = targetId ? action.idToIndex.get(targetId) : undefined;
    const target = targetIndex === undefined ? undefined : action.cells[targetIndex];
    if (!target || !target.isAlive || target.teamId === cell.teamId) {
      markInvalid(action, cell, 'Eat target must be an adjacent enemy.', `a${action.direction}`);
      return;
    }

    const nextHealth = Math.max(0, target.health - EAT_DAMAGE);
    action.cells[action.cellIndex] = {
      ...cell,
      lastAction: `a${action.direction}`,
      lastActionStatus: 'success',
    };
    action.cells[targetIndex] = {
      ...target,
      health: nextHealth,
      isAlive: nextHealth > 0,
    };

    if (nextHealth <= 0) {
      action.occupancy.delete(positionKey(target.position));
    }
    return;
  }

  if (action.category === 'reproduce') {
    const offset = DIRECTION_OFFSETS[action.direction];
    const destinationRow = cell.position.row + offset.row;
    const destinationColumn = cell.position.column + offset.column;
    const destinationKey = positionKeyFromCoordinates(destinationRow, destinationColumn);

    if (!isInsideCoordinates(destinationRow, destinationColumn) || action.occupancy.has(destinationKey)) {
      markInvalid(action, cell, 'Reproduction destination is outside or occupied.', `r${action.direction}`);
      return;
    }

    const childHealth = Math.floor(cell.health / 2);
    const parentHealth = cell.health - childHealth;
    const updatedParent = {
      ...cell,
      health: parentHealth,
      lastAction: `r${action.direction}`,
      lastActionStatus: 'success' as const,
    };
    action.cells[action.cellIndex] = updatedParent;

    if (childHealth > 0) {
      const newborn = {
        id: `${cell.teamId}-cell-${action.currentTurn}-${action.cells.length + 1}`,
        teamId: cell.teamId,
        color: cell.color,
        position: {
          row: destinationRow,
          column: destinationColumn,
        },
        health: childHealth,
        isAlive: true,
        creationTurn: action.currentTurn,
        lastAction: 'born',
        lastActionStatus: 'none' as const,
      };
      action.idToIndex.set(newborn.id, action.cells.length);
      action.cells.push(newborn);
      action.occupancy.set(destinationKey, newborn.id);
    }
  }
}

function markInvalid(action: WorkingStateAction, cell: Cell, message: string, lastAction = 'invalid'): void {
  action.cells[action.cellIndex] = {
    ...cell,
    lastAction,
    lastActionStatus: 'invalid',
  };
  pushGameError(action.errors, action.errorCountsByTurn, {
    turn: action.currentTurn,
    playerId: action.playerId,
    cellId: cell.id,
    type: 'invalid-action',
    message,
  });
}

function pushGameError(
  errors: GameError[],
  errorCountsByTurn: Map<number, number>,
  error: GameError,
): void {
  const turnCount = errorCountsByTurn.get(error.turn) ?? 0;
  if (turnCount >= MAX_ERRORS_PER_TURN) {
    return;
  }

  errors.push(error);
  errorCountsByTurn.set(error.turn, turnCount + 1);

  if (errors.length > MAX_STORED_MATCH_ERRORS) {
    const removedErrors = errors.splice(0, errors.length - MAX_STORED_MATCH_ERRORS);

    for (const removedError of removedErrors) {
      const count = errorCountsByTurn.get(removedError.turn);
      if (count === undefined) {
        continue;
      }

      if (count <= 1) {
        errorCountsByTurn.delete(removedError.turn);
      } else {
        errorCountsByTurn.set(removedError.turn, count - 1);
      }
    }
  }
}

function trimStoredErrors(errors: readonly GameError[]): GameError[] {
  return errors.slice(-MAX_STORED_MATCH_ERRORS);
}

function countErrorsByTurn(errors: readonly GameError[]): Map<number, number> {
  const counts = new Map<number, number>();

  for (const error of errors) {
    counts.set(error.turn, (counts.get(error.turn) ?? 0) + 1);
  }

  return counts;
}

export function buildNearbyStates(match: Match, cell: Cell): NeighborState[] {
  return DIRECTIONS.map((direction) => {
    const position = offsetPosition(cell.position, direction);

    if (!isInsideBoard(position)) {
      return 'outside';
    }

    const occupant = getCellAtPosition(match.board, position);
    if (!occupant) {
      return 'empty';
    }

    return occupant.teamId === cell.teamId ? 'allied' : 'enemy';
  });
}

function buildNearbyKeyFromWorkingState(
  cell: Cell,
  cells: readonly Cell[],
  occupancy: ReadonlyMap<OccupancyKey, string>,
  idToIndex: ReadonlyMap<string, number>,
): number {
  let nearbyKey = 0;

  for (let index = 0; index < DIRECTIONS.length; index += 1) {
    const offset = DIRECTION_OFFSETS[DIRECTIONS[index]];
    const row = cell.position.row + offset.row;
    const column = cell.position.column + offset.column;

    if (!isInsideCoordinates(row, column)) {
      nearbyKey = (nearbyKey << 2) | 3;
      continue;
    }

    const occupantId = occupancy.get(positionKeyFromCoordinates(row, column));
    const occupantIndex = occupantId ? idToIndex.get(occupantId) : undefined;
    const occupant = occupantIndex === undefined ? undefined : cells[occupantIndex];
    if (!occupant) {
      nearbyKey <<= 2;
      continue;
    }

    nearbyKey = (nearbyKey << 2) | (occupant.teamId === cell.teamId ? 1 : 2);
  }

  return nearbyKey;
}
