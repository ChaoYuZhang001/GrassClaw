import test from 'node:test';
import assert from 'node:assert/strict';
import { createGatewayClient } from '../src/index.js';

test('mock ping goes online', async () => {
  const client = createGatewayClient();
  const state = await client.ping('mock://grassclaw');
  assert.equal(state.status, 'online');
  assert.equal(state.lastPingMs, 42);
});

test('pair without code fails', async () => {
  const client = createGatewayClient();
  const state = await client.pair('');
  assert.equal(state.paired, false);
  assert.match(state.lastError, /required/);
});
