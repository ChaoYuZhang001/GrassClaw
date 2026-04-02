import { safeJsonParse } from './utils.js';

export function createMemoryStorage(seed = {}) {
  const store = new Map(Object.entries(seed));
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    }
  };
}

export function readJson(storage, key, fallback) {
  const raw = storage.getItem(key);
  if (!raw) return fallback;
  return safeJsonParse(raw, fallback);
}

export function writeJson(storage, key, value) {
  storage.setItem(key, JSON.stringify(value));
  return value;
}
