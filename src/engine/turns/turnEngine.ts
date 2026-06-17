import { parseActionCode } from '../actions/parseActionCode';
import { createBoard } from '../board/createBoard';
import { getCellAtPosition } from '../board/occupancy';
import { isInsideBoard, offsetPosition, positionKey } from '../board/position';
import {
  EAT_DAMAGE,
  MAX_ERRORS_PER_TURN,
  MAX_HEALTH,
  MAX_STORED_MATCH_ERRORS,
  REST_HEAL,
} from '../constants/gameConstants';
import { buildFunctionArgs } from '../validation/buildFunctionArgs';
import { executeUserFunction } from '../validation/executeUserFunction';
import { evaluateVictory } from '../victory/evaluateVictory';
import type { Cell, Direction, GameError, Match, NeighborState, OccupancyKey, PlayerId, Position } from '../types/game';

export function getTurnOrder(match: Match): Cell[] {
  return match.board.cells
    .filter((cell) => cell.isAlive)
    .map((cell) => ({ ...cell, position: { ...cell.position } }))
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
  const cells = match.board.cells.map((cell) => ({ ...cell, position: { ...cell.position } }));
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

    const args = buildFunctionArgs(
      currentCell.health,
      buildNearbyStatesFromWorkingState(currentCell, cells, occupancy, idToIndex),
    );
    const execution = executeUserFunction(player.functionSource, args);

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
  const board = createBoard(livingCells);
  const advancedMatch: Match = {
    ...match,
    board,
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
    action.cells[action.cellIndex] = {
      ...cell,
      health: Math.min(MAX_HEALTH, cell.health + REST_HEAL),
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
    const destination = offsetPosition(cell.position, action.direction);
    if (!isInsideBoard(destination) || action.occupancy.has(positionKey(destination))) {
      markInvalid(action, cell, 'Move destination is outside or occupied.', `m${action.direction}`);
      return;
    }

    action.occupancy.delete(positionKey(cell.position));
    action.occupancy.set(positionKey(destination), cell.id);
    action.cells[action.cellIndex] = {
      ...cell,
      position: destination,
      lastAction: `m${action.direction}`,
      lastActionStatus: 'success',
    };
    return;
  }

  if (action.category === 'eat') {
    const targetPosition = offsetPosition(cell.position, action.direction);
    if (!isInsideBoard(targetPosition)) {
      markInvalid(action, cell, 'Eat target is outside the board.', `a${action.direction}`);
      return;
    }

    const targetId = action.occupancy.get(positionKey(targetPosition));
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
    const destination = offsetPosition(cell.position, action.direction);
    if (!isInsideBoard(destination) || action.occupancy.has(positionKey(destination))) {
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
        position: destination,
        health: childHealth,
        isAlive: true,
        creationTurn: action.currentTurn,
        lastAction: 'born',
        lastActionStatus: 'none' as const,
      };
      action.idToIndex.set(newborn.id, action.cells.length);
      action.cells.push(newborn);
      action.occupancy.set(positionKey(destination), newborn.id);
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
  return (['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'] as const).map((direction) => {
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

function buildNearbyStatesFromWorkingState(
  cell: Cell,
  cells: readonly Cell[],
  occupancy: ReadonlyMap<OccupancyKey, string>,
  idToIndex: ReadonlyMap<string, number>,
): NeighborState[] {
  return (['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'] as const).map((direction) => {
    const position = offsetPosition(cell.position, direction);

    if (!isInsideBoard(position)) {
      return 'outside';
    }

    const occupantId = occupancy.get(positionKey(position));
    const occupantIndex = occupantId ? idToIndex.get(occupantId) : undefined;
    const occupant = occupantIndex === undefined ? undefined : cells[occupantIndex];
    if (!occupant) {
      return 'empty';
    }

    return occupant.teamId === cell.teamId ? 'allied' : 'enemy';
  });
}
