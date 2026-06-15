# Requirements

## Node

Required:

* Node.js 22 or newer
* npm

Install dependencies:

```bash
npm install
```

## Rust/WASM Toolchain

Required for `npm run dev:wasm`, `npm run build`, and `npm test`:

* Rust via `rustup`
* `wasm32-unknown-unknown` target
* `wasm-pack`
* Visual Studio Build Tools with C++ support on Windows

Windows install:

```powershell
winget install Rustlang.Rustup
rustup target add wasm32-unknown-unknown
cargo install wasm-pack --version 0.15.0
```

If `cargo install wasm-pack` fails with `link.exe not found`, install Visual Studio Build Tools:

```powershell
winget install Microsoft.VisualStudio.2022.BuildTools --override "--wait --passive --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"
```

Then reopen PowerShell and verify:

```powershell
rustc --version
cargo --version
wasm-pack --version
```

If PowerShell cannot find Rust after install, add Cargo to the current terminal path:

```powershell
$env:Path += ";$env:USERPROFILE\.cargo\bin"
```

Linux/macOS install:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32-unknown-unknown
cargo install wasm-pack --version 0.15.0
```

## Docker

The Docker image installs Node, Rust, the WASM target, and `wasm-pack`.

Build and enter the dev container:

```bash
docker compose up -d --build
docker compose exec dev bash
```

Inside the container:

```bash
npm install
npm run dev:wasm
```

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:3000
```

## Main Commands

Run TypeScript runtime:

```bash
npm run dev
```

Run Rust/WASM runtime:

```bash
npm run dev:wasm
```

Build everything:

```bash
npm run build
```

Run all tests:

```bash
npm test
```
