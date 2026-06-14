# Stress Profiling

## Goal

Measure how the known aggressive reproduction strategy behaves before changing the engine design again.

## Strategy Under Test

The profiling command uses the exact aggressive strategy currently identified as the target workload. Both teams run the same code so the simulation reaches the high-population case quickly.

## Command

```bash
npm run profile:stress -- --turns 250 --top 5
```

Optional flags:

* `--turns`: how many turns to execute before stopping if the match has not ended.
* `--turn-limit`: simulation turn limit passed into the engine.
* `--top`: how many slowest turns to print in the summary.

## Output

The report includes:

* requested turns,
* executed turns,
* whether the match finished naturally,
* final turn marker,
* max population reached,
* final population,
* average simulation milliseconds per turn,
* average serialization milliseconds per turn,
* slowest turns with cell growth context.

## How To Read It

If `simulation ms/turn` dominates, the engine loop or strategy interpreter is the main issue.

If `serialization ms/turn` grows sharply with population, frontend payload size is part of the slowdown even before rendering.

If both rise together with population, the next step should focus on algorithmic and data-layout redesign rather than another language switch by itself.

## Current Results

This branch has had two optimization passes so far:

1. compiled executors for validated strategies plus lower-overhead turn setup,
2. dense board occupancy storage plus direct ordered-cell iteration.

The second pass reduced per-turn lookup and ordering overhead without changing game rules.

### 250-turn run

* max population: `2483`
* average setup: `0.323ms`
* average action loop: `2.397ms`
* average cleanup: `0.048ms`
* average result: `0.057ms`
* average simulation: `2.826ms`
* average serialization: `0.090ms`
* average total: `2.916ms`

### 1000-turn run after pass 1

* max population: `19364`
* average setup: `2.953ms`
* average action loop: `19.092ms`
* average cleanup: `0.334ms`
* average result: `0.402ms`
* average simulation: `22.784ms`
* average serialization: `0.505ms`
* average total: `23.289ms`

### 1000-turn run after pass 2

* max population: `19364`
* average setup: `2.125ms`
* average action loop: `13.174ms`
* average cleanup: `0.290ms`
* average result: `0.416ms`
* average simulation: `16.007ms`
* average serialization: `0.559ms`
* average total: `16.565ms`

Relative to pass 1, the second pass improved:

* average setup by about `28%`,
* average action loop by about `31%`,
* average simulation time by about `30%`,
* average total time by about `29%`.

## Interpretation

The action loop is still the dominant cost, but it is materially smaller than before. Serialization remains comparatively small. That means the engine is now in a better release state, but the remaining big wins would still come from backend compute changes, not transport changes.

If another optimization round is needed, the next meaningful targets should be:

* faster strategy execution,
* less per-cell environment object construction,
* lower remaining setup overhead for large turn snapshots,
* denser cell storage than full object cloning per turn.
