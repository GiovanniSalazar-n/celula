import { parseActionCode, resolveAction } from './actions.js';
import { buildBoardFromCells, cloneBoard, createInitialCells, getCellIdAt, getNeighborPosition, getNeighborStates } from './board.js';
import { BOARD_COLS, BOARD_ROWS, DEFAULT_TURN_LIMIT } from './constants.js';
import { DIRECTIONS } from './directions.js';
import { buildTurnOrder } from './ordering.js';
import { evaluateManualStop, evaluateResult } from './scoring.js';
import { executeStrategy, getValidatedProgram, validateMatchSetup, validateStrategy } from './validation.js';
import type {
  Cell,
  Direction,
  MatchStartInput,
  PlayerDefinition,
  SerializedSimulationState,
  SimulationState,
  StrategyCellContext,
  StrategyEnvironmentContext,
  TeamId,
  TurnLog,
} from './types.js';

interface CreateSimulationOptions {
  rng?: () => number;
  startingCells?: Cell[];
  currentTurn?: number;
  logs?: TurnLog[];
  nextCellId?: number;
  status?: SimulationState['status'];
}

export function startMatch(input: MatchStartInput, rng: () => number = Math.random): { match: SimulationState | null; errors: string[] } {
  const issues = validateMatchSetup(input.players);
  if (issues.length > 0) {
    return { match: null, errors: issues };
  }

  const teams = input.players.map((player, index) => {
    const validation = validateStrategy(player.code);
    return {
      id: (index + 1) as TeamId,
      name: player.name.trim(),
      color: player.color,
      code: validation.normalizedCode ?? player.code,
      validation,
    };
  }) as [PlayerDefinition, PlayerDefinition];

  const match = createSimulationState(
    {
      teams,
      turnLimit: input.turnLimit ?? DEFAULT_TURN_LIMIT,
      boardRows: BOARD_ROWS,
      boardCols: BOARD_COLS,
    },
    { rng, status: 'paused' },
  );

  return { match, errors: [] };
}

export function createSimulationState(
  config: SimulationState['config'],
  options: CreateSimulationOptions = {},
): SimulationState {
  const startingCells =
    options.startingCells ??
    createInitialCells(
      [
        { name: config.teams[0].name, color: config.teams[0].color },
        { name: config.teams[1].name, color: config.teams[1].color },
      ],
      config.boardRows,
      config.boardCols,
      options.rng ?? Math.random,
    );
  const board = buildBoardFromCells(config.boardRows, config.boardCols, startingCells);

  return {
    status: options.status ?? 'paused',
    locked: true,
    config,
    board,
    cells: startingCells.map(cloneCell),
    currentTurn: options.currentTurn ?? 1,
    logs:
      options.logs ??
      [
        {
          turn: 0,
          type: 'system',
          message: `${config.teams[0].name} and ${config.teams[1].name} deployed to the board.`,
        },
      ],
    result: null,
    nextCellId: options.nextCellId ?? startingCells.length + 1,
  };
}

export function runSimulationTurn(state: SimulationState): SimulationState {
  if (state.result) {
    return { ...state, status: 'finished' };
  }

  const turn = state.currentTurn;
  const cells = state.cells.map(cloneCell);
  const board = cloneBoard(state.board);
  const cellsById = new Map(cells.map((cell) => [cell.id, cell]));
  const playerByTeamId = new Map(state.config.teams.map((team) => [team.id, team] as const));
  const programByTeamId = new Map(
    state.config.teams.map((team) => [team.id, getValidatedProgram(team)] as const),
  );
  const teamHealthById = buildTeamHealthIndex(cells);
  const logs: TurnLog[] = [];
  let nextCellId = state.nextCellId;

  for (const snapshot of buildTurnOrder(cells)) {
    const cell = cellsById.get(snapshot.id);
    if (!cell || !cell.alive) {
      continue;
    }

    const player = playerByTeamId.get(cell.teamId);
    const program = programByTeamId.get(cell.teamId) ?? null;

    if (!player || !program) {
      cell.lastAction = 'invalid';
      cell.lastActionStatus = 'invalid';
      logs.push({
        turn,
        type: 'error',
        message: `${cell.teamName} has no validated strategy. The cell lost its action.`,
        teamId: cell.teamId,
        cellId: cell.id,
      });
      continue;
    }

    const environment = buildEnvironmentContext(
      state,
      board,
      cellsById,
      cell,
      teamHealthById.get(cell.teamId) ?? 0,
    );
    const strategyCell: StrategyCellContext = {
      health: cell.health,
      age: cell.age,
      row: cell.position.row,
      col: cell.position.col,
    };
    const execution = executeStrategy(program, strategyCell, environment);

    if (execution.error || !execution.action) {
      cell.lastAction = 'invalid';
      cell.lastActionStatus = 'error';
      logs.push({
        turn,
        type: 'error',
        message: `${cell.teamName} produced a runtime error at (${cell.position.row}, ${cell.position.col}). The cell lost its action.`,
        teamId: cell.teamId,
        cellId: cell.id,
      });
      continue;
    }

    const parsedAction = parseActionCode(execution.action);
    if (!parsedAction) {
      cell.lastAction = execution.action;
      cell.lastActionStatus = 'invalid';
      logs.push({
        turn,
        type: 'error',
        message: `${cell.teamName} returned "${execution.action}", which is not a valid action code.`,
        teamId: cell.teamId,
        cellId: cell.id,
      });
      continue;
    }

    cell.lastAction = parsedAction.code;
    const actingHealthBefore = cell.health;
    const targetCellBefore =
      parsedAction.kind === 'eat'
        ? resolveTargetCell(board, cellsById, cell, parsedAction.direction)
        : null;
    const targetHealthBefore = targetCellBefore?.health ?? 0;

    resolveAction({ board, cells, currentTurn: turn }, cellsById, cell, parsedAction, () => {
      const childId = `cell-${nextCellId}`;
      nextCellId += 1;
      return childId;
    });

    if (parsedAction.kind === 'rest') {
      teamHealthById.set(cell.teamId, (teamHealthById.get(cell.teamId) ?? 0) + (cell.health - actingHealthBefore));
    }

    if (targetCellBefore) {
      teamHealthById.set(
        targetCellBefore.teamId,
        (teamHealthById.get(targetCellBefore.teamId) ?? 0) + (targetCellBefore.health - targetHealthBefore),
      );
    }
  }

  const livingCells = cells.filter((cell) => cell.alive);

  for (const cell of livingCells) {
    if (!cell.alive) {
      continue;
    }

    cell.age += 1;
    cell.createdDuringCurrentTurn = false;
  }

  const result = evaluateResult(state.config.teams, livingCells, turn, state.config.turnLimit);
  const updatedLogs = [...state.logs, ...logs];

  if (result) {
    updatedLogs.push({
      turn,
      type: 'result',
      message:
        result.winner === 'draw'
          ? `Match ended in a draw on turn ${turn}.`
          : `${result.teamSummaries.find((summary) => summary.id === result.winner)?.name ?? 'A team'} won on turn ${turn}.`,
    });

    return {
      ...state,
      status: 'finished',
      board,
      cells: livingCells,
      currentTurn: turn,
      logs: updatedLogs,
      result,
      nextCellId,
    };
  }

  return {
    ...state,
    board,
    cells: livingCells,
    currentTurn: turn + 1,
    logs: updatedLogs,
    result: null,
    nextCellId,
  };
}

export function advanceSimulation(state: SimulationState, steps: number = 1): SimulationState {
  let nextState = state;
  const safeSteps = Number.isFinite(steps) ? Math.max(1, Math.floor(steps)) : 1;

  for (let index = 0; index < safeSteps; index += 1) {
    nextState = runSimulationTurn(nextState);
    if (nextState.result) {
      return nextState;
    }
  }

  return nextState;
}

export function endSimulationEarly(state: SimulationState): SimulationState {
  if (state.result) {
    return {
      ...state,
      status: 'finished',
    };
  }

  const result = evaluateManualStop(state.config.teams, state.cells, state.currentTurn);

  return {
    ...state,
    status: 'finished',
    result,
    logs: [
      ...state.logs,
      {
        turn: state.currentTurn,
        type: 'result',
        message: `Match was ended early on turn ${state.currentTurn}.`,
      },
    ],
  };
}

export function serializeMatchState(state: SimulationState): SerializedSimulationState {
  return {
    status: state.status,
    locked: state.locked,
    config: state.config,
    cells: state.cells.map(cloneCell),
    currentTurn: state.currentTurn,
    logs: [...state.logs],
    result: state.result,
  };
}

function buildEnvironmentContext(
  state: SimulationState,
  board: SimulationState['board'],
  cellsById: Map<string, Cell>,
  cell: Cell,
  teamHealth: number,
): StrategyEnvironmentContext {
  const neighbors = getNeighborStates(board, cellsById, cell.position, cell.teamId);
  let hasAdjacentAlly = false;
  let hasAdjacentEnemy = false;
  let enemyCount = 0;
  let occupiedCount = 0;
  let emptyCount = 0;
  let firstEnemyDirection: StrategyEnvironmentContext['first_enemy_direction'] = 'none';
  let northOccupiedCount = 0;
  let southOccupiedCount = 0;
  let eastOccupiedCount = 0;
  let westOccupiedCount = 0;

  for (const direction of DIRECTIONS) {
    const neighbor = neighbors[direction];

    if (neighbor === 'allied') {
      hasAdjacentAlly = true;
      occupiedCount += 1;
    } else if (neighbor === 'enemy') {
      hasAdjacentEnemy = true;
      enemyCount += 1;
      occupiedCount += 1;
      if (firstEnemyDirection === 'none') {
        firstEnemyDirection = direction;
      }
    } else if (neighbor === 'empty') {
      emptyCount += 1;
    }

    if (neighbor !== 'empty' && neighbor !== 'outside') {
      if (direction === 'nw' || direction === 'n' || direction === 'ne') {
        northOccupiedCount += 1;
      }
      if (direction === 'sw' || direction === 's' || direction === 'se') {
        southOccupiedCount += 1;
      }
      if (direction === 'ne' || direction === 'e' || direction === 'se') {
        eastOccupiedCount += 1;
      }
      if (direction === 'nw' || direction === 'w' || direction === 'sw') {
        westOccupiedCount += 1;
      }
    }
  }

  return {
    ...neighbors,
    team_health: teamHealth,
    turn: state.currentTurn,
    rows: state.config.boardRows,
    cols: state.config.boardCols,
    has_adjacent_ally: hasAdjacentAlly,
    has_adjacent_enemy: hasAdjacentEnemy,
    enemy_count: enemyCount,
    occupied_count: occupiedCount,
    empty_count: emptyCount,
    first_enemy_direction: firstEnemyDirection,
    north_occupied_count: northOccupiedCount,
    south_occupied_count: southOccupiedCount,
    east_occupied_count: eastOccupiedCount,
    west_occupied_count: westOccupiedCount,
  };
}

function cloneCell(cell: Cell): Cell {
  return {
    ...cell,
    position: { ...cell.position },
  };
}

function buildTeamHealthIndex(cells: Cell[]): Map<TeamId, number> {
  const teamHealthById = new Map<TeamId, number>([
    [1, 0],
    [2, 0],
  ]);

  for (const cell of cells) {
    if (!cell.alive) {
      continue;
    }
    teamHealthById.set(cell.teamId, (teamHealthById.get(cell.teamId) ?? 0) + cell.health);
  }

  return teamHealthById;
}

function resolveTargetCell(
  board: SimulationState['board'],
  cellsById: Map<string, Cell>,
  cell: Cell,
  direction: Direction,
): Cell | null {
  const targetId = getCellIdAt(board, getNeighborPosition(cell.position, direction));
  return targetId ? cellsById.get(targetId) ?? null : null;
}
