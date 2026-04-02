export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function uid(prefix = 'gc') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function deepClone(value) {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

export function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function createEmitter() {
  const listeners = new Set();
  return {
    emit(payload) {
      listeners.forEach((listener) => listener(payload));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}
