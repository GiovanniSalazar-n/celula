# Existing UI Integration

## Existing UI Base

The project uses the existing mockup UI from:

`https://github.com/Adudu02/First-Try-for-Cell-Battle-UI`

This repository is the visual foundation for the Battle of Cells MVP.

## Important Rule

Do not rebuild the UI from zero unless absolutely necessary.

The coding agent must first inspect the existing project structure and understand:

- Current React components.
- Current layout.
- HUD design.
- Styling system.
- Existing animations.
- Existing mock data.
- Existing demo-only logic.

## Goal

Convert the mockup UI into a functional Battle of Cells MVP by connecting it to a real game engine.

The UI should become a presentation layer for the real game state.

## Current Tech Context

The base project uses:

- Vite.
- React.
- TypeScript.
- Tailwind.
- Lucide React.
- Motion.

## Integration Rules

The agent must:

1. Preserve the existing visual identity.
2. Reuse existing components when possible.
3. Rename components only if it improves clarity.
4. Avoid deleting UI code before understanding what it does.
5. Move mock data into test fixtures or remove it after real engine integration.
6. Keep game logic outside React components.
7. Connect UI through clear state/actions.
8. Keep the MVP local-only.
9. Avoid adding backend logic.
10. Avoid adding online multiplayer.
11. Avoid making Gemini or any AI API required for the final MVP.

## Suggested Mapping

| MVP Screen | Existing UI Usage |
|---|---|
| Configuration Screen | Player setup panels, algorithm editor area, validation feedback |
| Simulation Screen | HUD, board display, statistics panels, controls |
| Final Screen | Result modal or final statistics panel |

## Engine Integration

The UI must consume game state from the engine.

Recommended state shape:

```ts
type GameViewState = {
  matchStatus: "configuration" | "ready" | "running" | "paused" | "finished";
  currentTurn: number;
  turnLimit: number;
  players: Player[];
  cells: Cell[];
  stats: TeamStats[];
  errors: GameError[];
  result?: MatchResult;
};
```

React components should not directly decide business rules such as:

- Whether a movement is valid.
- Whether eat causes damage.
- Whether reproduction is allowed.
- Whether the match ends.
- Who wins.

Those decisions belong in `src/engine`.

## Files The Agent Should Create

```txt
src/engine/types/game.ts
src/engine/constants/gameConstants.ts
src/engine/board/createBoard.ts
src/engine/board/position.ts
src/engine/actions/parseActionCode.ts
src/engine/actions/resolveMove.ts
src/engine/actions/resolveEat.ts
src/engine/actions/resolveReproduce.ts
src/engine/actions/resolveRest.ts
src/engine/turns/turnEngine.ts
src/engine/validation/validateUserFunction.ts
src/engine/victory/evaluateVictory.ts
src/engine/index.ts
```

## Files The Agent Should Inspect First

The agent must inspect:

```txt
package.json
src/
components/
App.tsx
```

Actual paths may differ depending on the existing repository.

## UI Preservation Rules

When adapting the existing UI:

- Keep the current visual style whenever possible.
- Keep the HUD feeling and layout whenever possible.
- Keep animations if they do not interfere with game logic.
- Keep existing reusable components.
- Replace mock data with real engine state gradually.
- Do not delete large sections of UI before creating a working replacement.
- Avoid large rewrites when a small adaptation is enough.

## Mock Data Strategy

If the current UI uses mock data:

1. Identify all mock data files or hardcoded mock state.
2. Document what each mock value represents.
3. Replace mock values with `GameViewState` values from the engine.
4. Keep temporary fixtures only for tests or story/demo states.
5. Remove unused mock data after the real MVP flow works.

## Demo or AI Code Strategy

If the base UI includes Gemini, AI, or external API demo code:

- Do not make it required for the MVP.
- Remove it if it is unused.
- Isolate it if keeping it temporarily helps preserve the UI.
- The final MVP must run without `GEMINI_API_KEY`.
- The final MVP must not depend on external AI services.

## Do Not Do

Do not:

- Replace the existing UI with a basic generated layout.
- Mix engine logic directly into React components.
- Add multiplayer.
- Add login.
- Add database.
- Add backend API.
- Make Gemini API required for the game.
- Implement features outside the MVP.
- Implement cell age.
- Implement aging damage.
- Implement death by age.
- Use age in execution order.
