import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/server.js';

const app = createApp();
const originalEngineRuntime = process.env.ENGINE_RUNTIME;

afterEach(() => {
  process.env.ENGINE_RUNTIME = originalEngineRuntime;
});

describe('validation routes', () => {
  it('validates a legal player function', async () => {
    const response = await request(app).post('/api/validation/player-function').send({
      code: `def action(cell, environment):
    return "d"`,
    });

    expect(response.status).toBe(200);
    expect(response.body.isValid).toBe(true);
  });

  it('rejects an invalid player function', async () => {
    const response = await request(app).post('/api/validation/player-function').send({
      code: `def action(cell, environment):
    return "not-real"`,
    });

    expect(response.status).toBe(200);
    expect(response.body.isValid).toBe(false);
  });

  it('validates and parses through Rust/WASM when enabled', async () => {
    process.env.ENGINE_RUNTIME = 'wasm';

    const response = await request(app).post('/api/validation/player-function').send({
      code: `def action(cell, environment):
    if environment["n"] == "enemy":
        return "an"
    return "d"`,
    });

    expect(response.status).toBe(200);
    expect(response.body.isValid).toBe(true);
    expect(response.body.program.body[0].type).toBe('if');
  });
});
