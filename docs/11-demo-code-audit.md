# Demo Code Audit - Battle of Cells MVP

## UI Files

- `src/App.tsx`: mixes UI state with demo simulation rules and victory checks. It imports `spawnStartingCells`, `runSimulationTurn`, and `transpilePythonToJS`, then decides elimination and turn-limit results inside the React component.
- `src/components/CodeEditor.tsx`: preserves useful setup UI, but current copy contradicts MVP rules. It says movement and attack cost life, reproduction needs life greater than 40, rest heals 10, and examples include invalid `rso`.
- `src/components/GameBoard.tsx`: good canvas presentation base. It imports board dimensions from demo simulation utilities and looks up clicked cells by scanning the cell array.
- `src/components/ControlBar.tsx`: already has Play/Pause, Step, Restart, and speed controls. It still uses editable settings from demo state and lacks MVP End Simulation.
- `src/components/SidebarStats.tsx`: displays `SENIOR NODE (OLDEST)` and uses `age`, which is forbidden in the MVP.
- `src/components/LogsPanel.tsx`: currently labels telemetry as syntax/runtime errors; MVP simulation panel should show invalid-action errors only.
- `src/components/FinalResults.tsx`: supports demo reasons `eliminated`, `max_turns`, and `draw`; MVP needs explicit `team-eliminated`, `both-teams-eliminated`, `turn-limit`, and `manual-end`.

## Demo Types

- `src/types.ts` includes `age`, `life`, numeric `team`, and demo final reasons.
- MVP engine types must use no age field, health 0 to 100, fixed two players, compact board occupancy, and `manual-end` termination support.

## Demo Simulation Mismatches

- `src/utils/simulation.ts` spawns fixed center-left and center-right cells instead of fully random distinct positions.
- It normalizes `so`/`no` direction aliases, but MVP only allows `sw`/`nw`.
- It randomizes execution order with `sort(() => Math.random() - 0.5)`, while MVP order is deterministic.
- It uses attack damage 30 to 45, attack health cost, and attack healing; MVP Eat deals exactly 5 damage and never heals.
- It applies movement costs and failed-action penalties; MVP invalid actions only consume the action.
- It requires `life > 40` for reproduction; MVP has no minimum health requirement.
- It heals rest by 10; MVP Rest heals 3.
- It increments `age` and applies natural decay every turn; MVP has no age, aging damage, or death by age.
- It copies and recreates collections in ways that should not become the final board tick model for the fixed 100 x 200 board.

## Demo Function Runtime Mismatches

- `src/utils/interpreter.ts` transpiles Python-like syntax to JavaScript instead of validating/executing the clarified real Python contract.
- It requires `def take_action(cell):`; the clarified contract is a documented function shape like `def cell(health, nearby):`.
- It exposes helpers such as `nearest_enemy`, `nearest_friend`, `get_direction_to`, `random_direction`, counts, hidden IDs, age, distance, full cell scanning, and mutable-looking cell objects.
- It allows while loops with a JS loop guard; MVP validation must reject unsafe long-running execution and enforce a 1 second timeout.
- Preset templates return dynamic action strings such as `"a" + dir` and `"r" + random_direction()`, while MVP validation requires literal valid action returns.

## External API And Dependency Notes

- `package.json` includes `@google/genai`, `express`, `dotenv`, and `@types/express`.
- `.env.example` and `metadata.json` imply Gemini/server-side AI capability.
- Final MVP must run without `GEMINI_API_KEY`, backend API, Express, login, database, or online multiplayer.
