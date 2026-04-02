import test from 'node:test';
import assert from 'node:assert/strict';
import { behaviorLevelFromTrust, createConfigStore, createMemoryStorage, moodFromValue } from '../src/index.js';

test('mood mapping', () => {
  assert.equal(moodFromValue(90), '亢奋');
  assert.equal(moodFromValue(70), '愉快');
  assert.equal(moodFromValue(50), '平静');
  assert.equal(moodFromValue(30), '摸鱼');
  assert.equal(moodFromValue(10), '叛逆');
});

test('trust mapping', () => {
  assert.equal(behaviorLevelFromTrust(10), '观察模式');
  assert.equal(behaviorLevelFromTrust(50), '共创模式');
  assert.equal(behaviorLevelFromTrust(90), '放手模式');
});

test('config persists', () => {
  const storage = createMemoryStorage();
  const store = createConfigStore({ storage });
  store.setTrustLevel(99);
  store.setEmotionValue(18);
  const restored = createConfigStore({ storage });
  assert.equal(restored.getState().trustLevel, 99);
  assert.equal(restored.getState().currentMood, '叛逆');
});
