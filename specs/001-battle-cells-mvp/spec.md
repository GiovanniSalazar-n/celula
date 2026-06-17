# Feature Specification: Battle of Cells MVP

**Feature Branch**: `001-battle-cells-mvp`

**Created**: 2026-06-15

**Status**: Draft

**Input**: User description: "Build the MVP of Battle of Cells, a local turn-based simulation game for two players. Use the existing UI repository Adudu02/First-Try-for-Cell-Battle-UI as the visual foundation. Do not replace the UI from zero. Preserve the existing HUD style, layout, animations, and visual identity as much as possible."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configure and Validate Players (Priority: P1)

Two local players configure their team names, colors, and Python-based behavior
functions on the configuration screen. Each player validates their function and
can only be confirmed when their configuration is complete and valid.

**Why this priority**: The simulation cannot start without two valid local
players and safe behavior functions.

**Independent Test**: Can be tested by entering valid and invalid player data,
validating both functions, and confirming that Play is only available when both
players are confirmed.

**Acceptance Scenarios**:

1. **Given** both players have unique names, colors, and valid functions, **When** each player validates and confirms their setup, **Then** the Play button becomes available.
2. **Given** either player has a missing name, repeated name, missing color, missing function, or invalid function, **When** the configuration screen is displayed, **Then** Play remains blocked and clear validation errors are shown.
3. **Given** a player edits a previously valid function, **When** the edited function has not been validated again, **Then** that player is no longer confirmed and Play is blocked.
4. **Given** the function editor is visible, **When** a player writes or loads a function, **Then** row numbers are visible in the editor.
5. **Given** a player writes a behavior function, **When** the function is validated, **Then** the function receives only current health and the eight nearby neighbor states as direct arguments.

---

### User Story 2 - Start a Locked Local Match (Priority: P1)

After both players are confirmed, either player starts the match. The game
creates a fixed 100 by 200 board, places one random initial cell for each player,
locks all match configuration, and starts at turn 1.

**Why this priority**: This establishes the immutable starting state for the MVP
simulation and prevents mid-match changes.

**Independent Test**: Can be tested by starting from a valid configuration and
verifying that the board, initial cells, turn, and locked controls match the MVP
rules.

**Acceptance Scenarios**:

1. **Given** both players are confirmed, **When** Play is pressed, **Then** the match starts at turn 1 on a 100 row by 200 column board with one random initial cell per player.
2. **Given** the match has started, **When** a player attempts to edit names, colors, code, rules, turn limit, or initial conditions, **Then** the interface prevents the edit until the simulation ends.
3. **Given** the simulation is paused, **When** a player attempts to edit locked configuration, **Then** pause does not unlock any configuration controls.

---

### User Story 3 - Run the Turn-Based Cell Simulation (Priority: P1)

The simulation executes turns for living cells. Each eligible cell receives only
the allowed context, returns one action code, and attempts one move, eat,
reproduce, or rest action. The board updates immediately after each action.

**Why this priority**: The simulation engine is the core game experience.

**Independent Test**: Can be tested by running controlled board states through
turns and verifying action resolution, execution order, health changes, and
victory evaluation.

**Acceptance Scenarios**:

1. **Given** living cells exist at the start of a turn, **When** the turn executes, **Then** eligible cells act once in creation turn, start row, start column, and internal ID order.
2. **Given** a newborn cell is created during a turn, **When** the current turn continues, **Then** the newborn cell does not act until the next turn.
3. **Given** a cell returns a valid action that cannot be performed on the board, **When** the action is resolved, **Then** the action is canceled and the cell loses its action.
4. **Given** a cell dies because health reaches 0, **When** damage is applied, **Then** the cell is immediately removed from the board.

---

### User Story 4 - View Simulation State and Controls (Priority: P2)

Players watch the simulation on the preserved visual UI, including the 100 by
200 board, current turn, turn limit, living cells, total health, controls,
simulation speed, and invalid action errors.

**Why this priority**: Players need a clear presentation layer for the running
match, but it builds on the configuration and engine foundations.

**Independent Test**: Can be tested by starting a match and verifying that the
simulation screen displays state accurately without allowing configuration edits.

**Acceptance Scenarios**:

1. **Given** a match is running, **When** the simulation screen is shown, **Then** the board displays cells using team colors and shows current turn, turn limit, living cells, and total health per team.
2. **Given** invalid actions occur during simulation, **When** the error panel is visible, **Then** invalid action errors are shown clearly.
3. **Given** the simulation controls are visible, **When** players use Play, Pause, End Simulation, or speed controls, **Then** the simulation state changes without unlocking match configuration.

---

### User Story 5 - Finish and Restart a Match (Priority: P2)

When an end condition is reached, players see the result screen with winner or
draw information and can return to configuration for a new local match.

**Why this priority**: A complete MVP needs a clear end state and replay loop.

**Independent Test**: Can be tested by reaching each termination cause and
verifying final result details and restart behavior.

**Acceptance Scenarios**:

1. **Given** only one team remains alive, **When** the turn evaluation completes, **Then** the final screen shows that team as winner with final stats.
2. **Given** both teams have no living cells, **When** the turn evaluation completes, **Then** the final screen shows a draw and the correct termination cause.
3. **Given** the selected final turn has fully executed, **When** neither team has been eliminated, **Then** the final screen compares living cells, then total health, then declares a winner or draw.
4. **Given** a player manually ends the simulation, **When** the final screen is shown, **Then** the current leader is decided by living cells, then total health, then draw.
5. **Given** the final screen is visible, **When** a player chooses to return to configuration, **Then** a new match can be configured from an editable configuration screen.

### Edge Cases

- Player names are empty, duplicated, or changed after a successful validation.
- Player colors are missing or changed after confirmation.
- A user function is missing, invalid, dynamically returns a value, times out, or throws during simulation.
- A function attempts an import, file access, network access, eval, exec, dangerous call, state mutation, or execution that does not finish within the allowed time.
- A function attempts to access board state, full cell lists, team objects, turn objects, internal IDs, mutable cells, or internal game state.
- A function returns a valid code for an impossible action, such as moving outside the board or eating an allied cell.
- A cell tries to move or reproduce into an occupied square.
- A cell tries to eat an empty, outside, or allied square.
- Rest is used at or near maximum health and must not exceed 100.
- Reproduction splits odd health, with the original cell keeping the extra point.
- Multiple cells share creation turn and must be ordered by start row, start column, then internal ID.
- A cell dies before its scheduled action and must not act.
- The selected final turn must execute completely before final turn-limit evaluation.
- Both teams are eliminated in the same turn.
- Pause is used during simulation and must not unlock configuration.
- A player returns to configuration and reloads the simulation; initial cell placement must be newly random rather than reused from the previous match.
- The board contains 20,000 squares; turn updates must avoid unnecessary whole-board recreation or copying.
- A user function contains a bounded `for` loop and must validate only when the
  loop source is finite and approved.
- A user function attempts `while`, `while true`, recursion, `Function`,
  `fetch`, `window`, `document`, `localStorage`, or async behavior and must be
  rejected before Play.
- A user function exceeds the runtime step limit and must cause only the
  current cell to lose its action.
- A player selects a turn limit other than 5000, up to 10000, and the selected
  value must lock after Play.
- A selected turn limit must not change move, eat, reproduce, rest, death, or
  victory tiebreak rules except for the final turn-limit turn number.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a local-only Battle of Cells MVP for exactly two local players.
- **FR-002**: The system MUST preserve and adapt the existing UI visual foundation from `Adudu02/First-Try-for-Cell-Battle-UI` rather than replacing the UI from zero.
- **FR-003**: The system MUST provide a configuration screen where Player 1 and Player 2 can define team name, team color, and a Python-based behavior function.
- **FR-004**: The function editor MUST display row numbers while players write or load their behavior functions.
- **FR-005**: The system MUST validate each player function before that player can be confirmed.
- **FR-006**: The system MUST block Play unless both players are confirmed and both functions are valid.
- **FR-007**: The system MUST show clear validation errors when player configuration or function validation fails.
- **FR-008**: The system MUST lock code, names, colors, rules, turn limit, and initial conditions after Play is pressed until the simulation ends.
- **FR-009**: The system MUST keep Pause limited to visualization or automatic execution control and MUST NOT use Pause to unlock editing.
- **FR-010**: The system MUST create a board fixed at 100 rows by 200 columns for every match.
- **FR-011**: The system MUST prevent more than one cell from occupying the same board square.
- **FR-012**: The system MUST create one random initial cell for each player at match start, and initial placement MUST be newly random for every match and every simulation reload.
- **FR-013**: Each cell MUST have an internal ID, team, color, position, health, life status, and creation turn.
- **FR-014**: Cells MUST NOT have age, aging damage, death by age, age-based reproduction restrictions, or age-based execution order.
- **FR-015**: Cell health MUST stay within 0 to 100, and a cell whose health reaches 0 MUST be immediately removed from the board.
- **FR-016**: The simulation MUST start at turn 1 and default to a turn limit of 5000.
- **FR-017**: The selected final turn MUST execute completely before final victory is evaluated by turn limit.
- **FR-018**: Each living eligible cell MUST perform at most one action per turn.
- **FR-019**: Eligible cells MUST be those alive at the start of the turn, excluding newborn cells created during the current turn.
- **FR-020**: Eligible cells MUST act in deterministic order by creation turn, start-of-turn row, start-of-turn column, then internal cell ID.
- **FR-021**: The only valid action categories MUST be move, eat, reproduce, and rest.
- **FR-022**: Valid move action codes MUST be `mn`, `ms`, `me`, `mw`, `mne`, `mnw`, `mse`, and `msw`.
- **FR-023**: Valid eat action codes MUST be `an`, `as`, `ae`, `aw`, `ane`, `anw`, `ase`, and `asw`.
- **FR-024**: Valid reproduce action codes MUST be `rn`, `rs`, `re`, `rw`, `rne`, `rnw`, `rse`, and `rsw`.
- **FR-025**: The valid rest action code MUST be `d`.
- **FR-026**: Movement MUST move one square in one of eight directions only when the destination is inside the board and empty.
- **FR-027**: Invalid movement into an outside or occupied square MUST cancel the action and consume that cell action.
- **FR-028**: Eat MUST target only enemy cells in one of eight neighboring squares and MUST cause 5 health damage.
- **FR-029**: Eating an empty square, outside square, or allied cell MUST cancel the action and consume that cell action.
- **FR-030**: Eating MUST NOT restore health to the attacker.
- **FR-031**: Reproduction MUST create a new allied cell only in a valid empty neighboring square.
- **FR-032**: Reproduction MUST split current health between the original and newborn cell, with the original keeping the extra point when health is odd.
- **FR-033**: Newborn cells MUST NOT act on the turn they are created.
- **FR-034**: Reproduction MUST NOT require age or minimum health in the MVP.
- **FR-035**: Rest MUST restore 3 health and MUST NOT increase health above 100.
- **FR-036**: User functions MUST use real Python syntax with a defined function that receives direct arguments similar to `health` and `nearby`, where `health` is the current cell health and `nearby` represents only the eight neighboring cells.
- **FR-037**: User functions MUST return one valid literal action code and MUST reject dynamically generated action returns.
- **FR-038**: User functions MUST reject imports, file access, network access, eval, exec, dangerous functions, state mutation attempts, and execution longer than 1 second.
- **FR-039**: User functions MUST NOT directly modify health, position, team, board, turn, cells, or internal game state.
- **FR-040**: User functions MUST receive only direct argument data for the current cell health and the eight neighboring square states; they MUST NOT receive board state, full cell lists, team objects, turn objects, internal IDs, mutable cell references, or internal game state.
- **FR-041**: Neighbor states exposed to user functions MUST be limited to `empty`, `allied`, `enemy`, and `outside`.
- **FR-042**: The simulation screen MUST display the 100 by 200 board, current turn, turn limit, Play, Pause, End Simulation, simulation speed control, living cells per team, and total health per team.
- **FR-043**: The simulation screen MUST show an error panel for invalid actions only.
- **FR-044**: The final result screen MUST show winner or draw, player names, living cells per team, final turn, and termination cause.
- **FR-045**: The final result screen MUST allow returning to configuration for a new match.
- **FR-046**: The match MUST end when only one team remains alive, both teams have no living cells, the selected turn limit has been reached after the final selected turn completes, or a player manually ends the simulation.
- **FR-047**: When the turn limit or manual End Simulation decides the match, the winner MUST be the team with the most living cells; if tied, the team with highest total health; if still tied, the result MUST be a draw.
- **FR-048**: During simulation, board state updates MUST avoid unnecessary full recreation or full copying of the fixed 100 by 200 board on every cycle or tick.
- **FR-049**: The MVP MUST NOT include online multiplayer, accounts, login, backend API, database, obstacles, resources, external food, extra players, custom board size, extra actions, cell age, or advanced AI.
- **FR-050**: Editor Language v2 MUST extend the existing user function validation and execution system without rewriting the MVP.
- **FR-051**: Editor Language v2 MUST keep the player-facing function shape limited to direct `health` and `nearby` arguments.
- **FR-052**: Editor Language v2 MUST allow bounded `for` loops over approved finite sources such as `nearby`, `range(...)`, and `emptyDirections(nearby)`.
- **FR-053**: Editor Language v2 MUST reject all `while` loops, including `while true`.
- **FR-054**: Editor Language v2 MUST reject recursion, async code, imports, file access, network access, `eval`, `exec`, `Function`, `fetch`, `window`, `document`, `localStorage`, browser globals, and dangerous builtins.
- **FR-055**: Editor Language v2 MUST provide only approved safe helpers: `range`, `len`, `sum`, `any`, `isEnemy`, and `emptyDirections`.
- **FR-056**: Editor Language v2 MUST execute user code through a read-only safe context and MUST NOT expose board state, full cell lists, teams, turn objects, internal IDs, mutable cells, or engine internals.
- **FR-057**: Editor Language v2 MUST enforce a runtime step limit in addition to the existing 1 second timeout.
- **FR-058**: Editor Language v2 runtime errors, step-limit failures, and timeouts MUST consume only the current acting cell action and MUST NOT stop the match unless a normal end condition is reached.
- **FR-059**: Existing MVP templates, validation behavior, gameplay rules, performance fixes, and tests MUST continue to pass after Editor Language v2 is added.
- **FR-060**: The system MUST allow players to select a bounded turn-limit preset before Play, with default 5000 and maximum 10000.
- **FR-061**: The selected turn limit MUST lock after Play and MUST NOT be editable until the simulation ends.
- **FR-062**: For a selected turn limit N, turn N MUST execute completely before final victory is evaluated by turn limit.

### Key Entities

- **Player**: One of the two local participants; has a team name, color, behavior function, validation status, and confirmation status.
- **Behavior Function**: A Python-based player-authored function that receives direct read-only arguments for current health and nearby neighbor states, then returns one literal action code.
- **Board**: The fixed 100 row by 200 column simulation space containing only cells and no obstacles, resources, or external food.
- **Cell**: A living or removed game unit with internal ID, team, color, position, health, life status, and creation turn.
- **Action Code**: A literal command returned by a behavior function to attempt move, eat, reproduce, or rest.
- **Match**: A local simulation containing two players, the board, current turn, turn limit, locked status, and final result.
- **Match Result**: The final outcome containing winner or draw, final turn, termination cause, living cells, and health totals.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Two players can complete valid configuration and start a locked match in under 3 minutes using the existing visual UI flow.
- **SC-002**: 100% of invalid player configurations listed in the requirements block Play and show a clear reason.
- **SC-003**: 100% of documented action codes resolve according to the MVP rules in controlled tests.
- **SC-004**: 100% of documented invalid action situations consume the acting cell action without corrupting board state.
- **SC-005**: Turn ordering is deterministic across repeated runs with the same starting state and player functions.
- **SC-006**: The selected final turn completes before final turn-limit result evaluation in all turn-limit scenarios.
- **SC-007**: The final screen correctly identifies winner or draw and termination cause for team elimination, both-team elimination, turn-limit outcomes, and manual End Simulation outcomes.
- **SC-008**: The MVP runs without requiring login, accounts, backend services, databases, online multiplayer, or external AI services.
- **SC-009**: Players can change simulation speed during a running match without editing locked match configuration.
- **SC-010**: Editor Language v2 accepts bounded loops and approved helpers while rejecting all listed unsafe syntax and globals in automated tests.
- **SC-011**: Runtime step-limit and timeout failures affect only the current acting cell and allow the match to continue.
- **SC-012**: Turn-limit selection defaults to 5000, supports bounded presets up to 10000, locks after Play, and preserves existing 5000-turn behavior.

## Quality Requirements *(mandatory)*

- **QR-001**: Performance target: the UI remains usable while rendering the 100 by 200 board and running local turns, with controls responding within 1 second during normal MVP use.
- **QR-002**: Security/data handling: user functions execute with restricted read-only context, cannot access files or network, cannot import modules, cannot call eval or exec, and cannot mutate internal game state.
- **QR-003**: Accessibility/usability: validation and simulation errors are readable, associated with the relevant player or action, and do not rely only on color.
- **QR-004**: Observability/error handling: validation failures show clear errors before Play; simulation displays invalid action errors only in the simulation error panel.
- **QR-005**: Manual verification required for unautomated behavior: visual preservation of the existing HUD style, layout, animations, and identity must be checked against the existing UI.
- **QR-006**: Existing UI preservation: the feature adapts the existing UI repository as the visual foundation and avoids replacing the UI from zero.
- **QR-007**: Engine/UI separation: core game rules are validated independently from the React presentation layer, and React displays engine state rather than deciding business rules.
- **QR-008**: User function safety: validation enforces Python-based syntax restrictions, allowed direct arguments only, literal valid string returns, no unsafe operations, and a 1 second timeout.
- **QR-009**: Board update performance: the running simulation avoids unnecessary full-board recreation or copying on every cycle or tick.

## Assumptions

- The latest user request and project overview define user functions as Python-based; any older TypeScript-like wording in legacy docs is superseded for this MVP spec.
- The existing UI repository has already been copied or will be made available in this project before implementation planning begins.
- Random initial cell placement means each player receives one valid empty position within the fixed board, with fully random placement each match and each simulation reload.
- End Simulation is a manual control that ends the current simulation and sends players to the final result flow with a manual termination cause; the winner is decided by living cells, then total health, then draw.
- Invalid user functions block validation and Play; runtime errors from previously valid functions consume the acting cell action and keep the simulation running unless an end condition is reached.
