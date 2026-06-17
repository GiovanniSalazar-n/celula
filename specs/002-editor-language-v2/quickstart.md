# Quickstart: Editor Language v2 Validation

## Prerequisites

Install dependencies:

```bash
npm install
```

## Automated Checks

Run type checking:

```bash
npm run lint
```

Run tests:

```bash
npm test
```

Build the app:

```bash
npm run build
```

## Manual Smoke Test

Start the app:

```bash
npm run dev
```

Validate these flows:

1. Configure both players with existing MVP templates and start a match.
2. Select turn limits 1, 5000, and 10000 before Play and confirm the selected
   value locks after Play.
3. Validate a bounded-loop strategy that uses `range`, `len`, `sum`, or `any`.
4. Validate a strategy that uses `isEnemy("n")` and `emptyDirections()`.
5. Confirm forbidden code such as `while True`, `import`, `eval`, `fetch`,
   `window`, `document`, and `setTimeout` is rejected before Play.
6. Confirm runtime failures only consume the current cell action and the match
   continues.

## Expected Result

Existing MVP behavior still works, new v2 examples validate, unsafe code is
blocked before Play, and long or failing user functions do not crash the match.
