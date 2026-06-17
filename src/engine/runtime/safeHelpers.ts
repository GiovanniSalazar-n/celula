import { DIRECTIONS } from '../constants/gameConstants';
import type { Direction, NeighborState } from '../types/game';
import type { StepLimiter } from './stepLimiter';
import { RUNTIME_ERROR_MESSAGES } from './runtimeErrors';

const directionIndex = new Map<Direction, number>(DIRECTIONS.map((direction, index) => [direction, index]));

export interface SafeHelpers {
  range: (start: number, end?: number) => number[];
  len: (value: { length: number }) => number;
  min: (...values: number[]) => number;
  max: (...values: number[]) => number;
  abs: (value: number) => number;
  round: (value: number) => number;
  floor: (value: number) => number;
  ceil: (value: number) => number;
  sum: (values: readonly number[]) => number;
  any: (values: readonly unknown[]) => boolean;
  all: (values: readonly unknown[]) => boolean;
  clamp: (value: number, min: number, max: number) => number;
  isEnemy: (direction: Direction) => boolean;
  isAllied: (direction: Direction) => boolean;
  isEmpty: (direction: Direction) => boolean;
  isOutside: (direction: Direction) => boolean;
  enemyDirections: () => Direction[];
  emptyDirections: () => Direction[];
  alliedDirections: () => Direction[];
}

export function createSafeHelpers(nearby: readonly NeighborState[], stepLimiter: StepLimiter): SafeHelpers {
  const stateForDirection = (direction: Direction): NeighborState => {
    stepLimiter.consume();
    const index = directionIndex.get(direction);
    if (index === undefined) {
      throw new Error(RUNTIME_ERROR_MESSAGES.invalidDirection);
    }
    return nearby[index];
  };

  const directionsForState = (state: NeighborState): Direction[] => {
    stepLimiter.consume(DIRECTIONS.length);
    return DIRECTIONS.filter((direction, index) => nearby[index] === state);
  };

  return {
    range(start: number, end?: number): number[] {
      const actualStart = end === undefined ? 0 : start;
      const actualEnd = end === undefined ? start : end;
      if (!Number.isFinite(actualStart) || !Number.isFinite(actualEnd)) {
        throw new Error('range bounds must be finite numbers.');
      }

      const length = Math.max(0, Math.trunc(actualEnd) - Math.trunc(actualStart));
      stepLimiter.consume(Math.min(length, 100));
      return Array.from({ length }, (_, index) => Math.trunc(actualStart) + index);
    },
    len(value: { length: number }): number {
      stepLimiter.consume();
      return value.length;
    },
    min(...values: number[]): number {
      stepLimiter.consume(values.length);
      return Math.min(...values);
    },
    max(...values: number[]): number {
      stepLimiter.consume(values.length);
      return Math.max(...values);
    },
    abs(value: number): number {
      stepLimiter.consume();
      return Math.abs(value);
    },
    round(value: number): number {
      stepLimiter.consume();
      return Math.round(value);
    },
    floor(value: number): number {
      stepLimiter.consume();
      return Math.floor(value);
    },
    ceil(value: number): number {
      stepLimiter.consume();
      return Math.ceil(value);
    },
    sum(values: readonly number[]): number {
      stepLimiter.consume(values.length);
      return values.reduce((total, value) => total + value, 0);
    },
    any(values: readonly unknown[]): boolean {
      stepLimiter.consume(values.length);
      return values.some(Boolean);
    },
    all(values: readonly unknown[]): boolean {
      stepLimiter.consume(values.length);
      return values.every(Boolean);
    },
    clamp(value: number, min: number, max: number): number {
      stepLimiter.consume();
      return Math.min(max, Math.max(min, value));
    },
    isEnemy(direction: Direction): boolean {
      return stateForDirection(direction) === 'enemy';
    },
    isAllied(direction: Direction): boolean {
      return stateForDirection(direction) === 'allied';
    },
    isEmpty(direction: Direction): boolean {
      return stateForDirection(direction) === 'empty';
    },
    isOutside(direction: Direction): boolean {
      return stateForDirection(direction) === 'outside';
    },
    enemyDirections(): Direction[] {
      return directionsForState('enemy');
    },
    emptyDirections(): Direction[] {
      return directionsForState('empty');
    },
    alliedDirections(): Direction[] {
      return directionsForState('allied');
    },
  };
}
