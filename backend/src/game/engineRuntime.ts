import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { advanceSimulation, endSimulationEarly, startMatch } from './engine.js';
import { validateStrategy } from './validation.js';
import type { MatchStartInput, SimulationState, ValidationResult } from './types.js';

interface WasmEngineModule {
  validate_strategy_json(code: string): string;
  start_match_json(inputJson: string, seed: number): string;
  advance_simulation_json(stateJson: string, steps: number): string;
  end_simulation_early_json(stateJson: string): string;
}

interface StartMatchResult {
  match: SimulationState | null;
  errors: string[];
}

let wasmModulePromise: Promise<WasmEngineModule> | null = null;

export function getEngineRuntimeMode(): 'typescript' | 'wasm' {
  return process.env.ENGINE_RUNTIME === 'wasm' ? 'wasm' : 'typescript';
}

export async function validateStrategyWithRuntime(code: string): Promise<ValidationResult> {
  if (getEngineRuntimeMode() !== 'wasm') {
    return validateStrategy(code);
  }

  const wasmEngine = await loadWasmEngine();
  return JSON.parse(wasmEngine.validate_strategy_json(code)) as ValidationResult;
}

export async function startMatchWithRuntime(input: MatchStartInput): Promise<StartMatchResult> {
  if (getEngineRuntimeMode() !== 'wasm') {
    return startMatch(input);
  }

  const wasmEngine = await loadWasmEngine();
  const seed = createStartSeed();
  return JSON.parse(wasmEngine.start_match_json(JSON.stringify(input), seed)) as StartMatchResult;
}

export async function advanceSimulationWithRuntime(
  state: SimulationState,
  steps: number = 1,
): Promise<SimulationState> {
  if (getEngineRuntimeMode() !== 'wasm') {
    return advanceSimulation(state, steps);
  }

  const wasmEngine = await loadWasmEngine();
  const resultJson = wasmEngine.advance_simulation_json(JSON.stringify(state), normalizeSteps(steps));
  return JSON.parse(resultJson) as SimulationState;
}

export async function endSimulationEarlyWithRuntime(state: SimulationState): Promise<SimulationState> {
  if (getEngineRuntimeMode() !== 'wasm') {
    return endSimulationEarly(state);
  }

  const wasmEngine = await loadWasmEngine();
  return JSON.parse(wasmEngine.end_simulation_early_json(JSON.stringify(state))) as SimulationState;
}

export function getEngineRuntimeInfo() {
  const mode = getEngineRuntimeMode();
  return {
    mode,
    availableModes: ['typescript', 'wasm'],
    wasmPackagePath: findWasmPackagePath(),
    notes:
      mode === 'wasm'
        ? ['Rust/WASM owns validation, match creation, turn advancement, and manual end scoring.']
        : ['TypeScript game-domain runtime is active. Set ENGINE_RUNTIME=wasm to use Rust/WASM.'],
  };
}

async function loadWasmEngine(): Promise<WasmEngineModule> {
  wasmModulePromise ??= import(pathToFileURL(requireWasmPackagePath()).href).then((module) => {
    const exports = (module.default ?? module) as WasmEngineModule;
    if (typeof exports.advance_simulation_json !== 'function') {
      throw new Error('The Rust/WASM engine package does not export advance_simulation_json.');
    }
    return exports;
  });

  return wasmModulePromise;
}

function normalizeSteps(steps: number): number {
  return Number.isFinite(steps) ? Math.max(1, Math.floor(steps)) : 1;
}

function createStartSeed(): number {
  return Math.floor((Date.now() + Math.random() * 0xffffffff) % 0xffffffff);
}

function requireWasmPackagePath(): string {
  const packagePath = findWasmPackagePath();
  if (!packagePath) {
    throw new Error('Rust/WASM engine package is missing. Run `npm run build:wasm` first.');
  }
  return packagePath;
}

function findWasmPackagePath(): string | null {
  let current = path.dirname(fileURLToPath(import.meta.url));

  for (let depth = 0; depth < 8; depth += 1) {
    const candidate = path.join(current, 'engine-wasm', 'pkg', 'battle_cells_engine_wasm.js');
    if (fs.existsSync(candidate)) {
      return candidate;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }

  return null;
}
