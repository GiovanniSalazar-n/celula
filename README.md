# Battle of Cells

Battle of Cells is a local two-player simulation where each player programs a safe Python-like strategy to control a colony of cells.

## Stack

* Frontend: React + Vite + TypeScript
* Backend: Node.js + Express + TypeScript
* Experimental engine runtime: Rust + WebAssembly
* Tests: Vitest, React Testing Library, Supertest

## Install

```bash
npm install
```

For a new device, install the toolchain listed in [REQUIREMENTS.md](REQUIREMENTS.md). The Rust/WASM runtime needs Rust, the `wasm32-unknown-unknown` target, and `wasm-pack`.

## Run

Backend:

```bash
npm run dev:backend
```

Frontend:

```bash
npm run dev:frontend
```

Or run both together:

```bash
npm run dev
```

Run with experimental Rust/WASM turn advancement:

```bash
npm run dev:wasm
```

In this mode, the backend delegates strategy validation, match creation, turn advancement, and manual match ending to Rust/WASM.

Frontend URL: [http://localhost:5173](http://localhost:5173)  
Backend URL: [http://localhost:3000](http://localhost:3000)

## Tests

All tests:

```bash
npm test
```

Build Rust/WASM only:

```bash
npm run build:wasm
```

Backend only:

```bash
npm run test:backend
```

Frontend only:

```bash
npm run test:frontend
```

Stress profile:

```bash
npm run profile:stress -- --turns 250 --top 5
```

Longer stress profile:

```bash
npm run profile:stress -- --turns 1000 --top 10
```

## Docker

The dev container installs Node, Rust, the WASM target, and `wasm-pack`:

```bash
docker compose up -d --build
docker compose exec dev bash
npm install
npm run dev:wasm
```

## Documentation

See [REQUIREMENTS.md](REQUIREMENTS.md) and the [docs](docs) directory for the specification, architecture, API, test plan, roadmap, flow, decisions, profiling notes, and Rust/WASM engine migration guide.
