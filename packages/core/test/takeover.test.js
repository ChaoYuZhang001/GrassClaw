import test from 'node:test';
import assert from 'node:assert/strict';
import { createConfigStore, createMemoryStorage, createTakeoverStore } from '../src/index.js';

test('takeover records and saves skills', () => {
  const storage = createMemoryStorage();
  const config = createConfigStore({ storage });
  const takeover = createTakeoverStore({ storage, getConfig: () => config.getState() });
  takeover.start();
  takeover.record('打开控制台');
  takeover.record('拖动信任滑块');
  const skill = takeover.saveSkill('我的草台技能');
  assert.ok(skill);
  assert.equal(skill.steps.length, 2);
  assert.equal(takeover.getState().savedSkills.length, 1);
});

test('invalid import returns null', () => {
  const storage = createMemoryStorage();
  const config = createConfigStore({ storage });
  const takeover = createTakeoverStore({ storage, getConfig: () => config.getState() });
  assert.equal(takeover.importSkill('{'), null);
});
