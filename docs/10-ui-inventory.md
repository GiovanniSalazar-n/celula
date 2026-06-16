# UI Inventory - Battle of Cells MVP

## Project Structure

```text
src/
  App.tsx
  main.tsx
  index.css
  types.ts
  components/
    CodeEditor.tsx
    ControlBar.tsx
    FinalResults.tsx
    GameBoard.tsx
    LogsPanel.tsx
    SidebarStats.tsx
  utils/
    interpreter.ts
    simulation.ts
```

## UI Components To Preserve

- `src/App.tsx`: screen routing, top lab header, setup/simulation/results composition, and current mock simulation state wiring.
- `src/components/CodeEditor.tsx`: two-player configuration surface, neon cards, color swatches, preset selector, code editor area, rules panel, and start button.
- `src/components/GameBoard.tsx`: canvas-based 100 x 200 board presentation, hover coordinates, selection reticle, dark grid style, and team color rendering.
- `src/components/ControlBar.tsx`: simulation status, turn display, Play/Pause, Step, Restart, and speed controls.
- `src/components/SidebarStats.tsx`: player sidebars, living count, total life, vitality meter, and action distribution panels.
- `src/components/LogsPanel.tsx`: bottom telemetry/error console.
- `src/components/FinalResults.tsx`: final result card, player stat cards, and restart/back controls.
- `src/index.css`: Tailwind entrypoint for the current visual system.

## App State

- `src/App.tsx` owns route-like screen state with `setup`, `simulation`, and `results`.
- `src/App.tsx` owns current `GameState`, player configs, simulation settings, cell array, logs, current turn, selected cell, and final stats.
- Current state uses demo types from `src/types.ts`; engine integration should replace this gradually with `GameViewState` and engine-owned rules.

## Mock Data And Demo Runtime

- `src/utils/interpreter.ts` provides preset code templates and a Python-like transpiler.
- `src/utils/simulation.ts` provides demo constants, fixed starting cells, and demo turn resolution.
- `src/types.ts` defines demo data fields such as `life`, `age`, numeric teams, and demo final reasons.

## Visual Identity

- Dark neon lab/HUD style with slate backgrounds, cyan/emerald accents, monospaced telemetry labels, and glowing team colors.
- Canvas board uses a 2:1 aspect ratio matching 200 columns by 100 rows.
- Side panels and controls use compact dashboard cards; preserve these instead of rebuilding from zero.
- Existing speed controls already appear in setup and simulation, but they must become MVP-compliant playback controls only.

## Integration Notes

- Keep existing components as the presentation layer.
- Move rule decisions to `src/engine`.
- Replace mock cell arrays with compact engine view data.
- Remove age labels and rule-copy contradictions when those components are adapted.
- Avoid full 100 x 200 board array reconstruction in UI tick/render paths.
