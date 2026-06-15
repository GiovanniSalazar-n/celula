# Rust/WASM Engine Migration

## Goal

Move turn advancement toward a faster Rust engine while keeping the current web frontend and game rules intact.

The migration starts with a feature flag instead of replacing the TypeScript engine outright. This keeps the existing local game runnable while the Rust engine earns parity through tests and stress runs.

## Current Status

Implemented on this branch:

* `engine-wasm/`: Rust crate compiled with `wasm-pack`.
* `validate_strategy_json`: WASM export that validates and parses the Python-like strategy subset.
* `start_match_json`: WASM export that validates players and creates the initial match.
* `advance_simulation_json`: WASM export that advances the existing match JSON by one or more turns.
* `end_simulation_early_json`: WASM export that scores and finishes the active match.
* `backend/src/game/engineRuntime.ts`: backend runtime switch for TypeScript vs Rust/WASM.
* `/api/validation/player-function`: uses Rust/WASM validation when `ENGINE_RUNTIME=wasm`.
* `/api/game/start`: uses Rust/WASM match creation when `ENGINE_RUNTIME=wasm`.
* `/api/game/tick`: uses Rust/WASM turn advancement when `ENGINE_RUNTIME=wasm`.
* `/api/game/end`: uses Rust/WASM manual scoring when `ENGINE_RUNTIME=wasm`.
* `/health`: reports the active engine runtime and discovered WASM package path.

The React frontend is unchanged. It still receives the same serialized match shape.

## Runtime Modes

### TypeScript

Default mode:

```powershell
npm run dev
```

This uses the existing TypeScript turn engine.

### Rust/WASM

Build the WASM package and start the normal web app with Rust/WASM turn advancement:

```powershell
npm run dev:wasm
```

Manual equivalent:

```powershell
npm run build:wasm
$env:ENGINE_RUNTIME="wasm"
npm run dev
```

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:3000
```

Confirm the backend is using Rust/WASM:

```powershell
Invoke-WebRequest -UseBasicParsing http://localhost:3000/health
```

The JSON should include:

```json
"engineRuntime": {
  "mode": "wasm"
}
```

## Build And Test

Build everything:

```powershell
npm run build
```

Run all tests:

```powershell
npm test
```

Rust-only tests:

```powershell
npm run test:wasm
```

Build only the WASM package:

```powershell
npm run build:wasm
```

## Toolchain Requirements

See [../REQUIREMENTS.md](../REQUIREMENTS.md) for Windows, Linux, macOS, and Docker setup.

## Rule Compatibility

The Rust/WASM engine currently owns these rules in WASM mode:

* strategy validation and parsing for the safe Python-like subset,
* player setup validation,
* initial board and cell creation,
* deterministic start-of-turn order,
* move/eat/reproduce/rest actions,
* immediate board updates after each action,
* newborn cells do not act during their birth turn,
* age increments after the turn,
* elimination and turn-limit scoring,
* aggregated blocked-action logs,
* manual end scoring.

The TypeScript game modules remain as the default fallback and parity reference. In `ENGINE_RUNTIME=wasm`, the backend routes delegate validation, match creation, turn advancement, and manual end scoring to Rust/WASM.

## Next Work

The first Rust/WASM path still accepts and returns the full match JSON. That is intentionally conservative, but it means large-state serialization still exists.

Next performance work should move toward:

* a packed Rust state stored across ticks,
* compact frontend snapshots,
* parity tests that compare TypeScript and Rust/WASM across more rule fixtures,
* stress profiling through the runtime switch.
