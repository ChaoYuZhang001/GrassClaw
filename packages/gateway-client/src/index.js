import { createEmitter, uid } from '../../core/src/index.js';

const defaultState = {
  endpoint: 'mock://grassclaw',
  status: 'idle',
  lastPingMs: null,
  paired: false,
  lastError: '',
  lastEventAt: '',
  lastPairingCode: ''
};

export function createGatewayClient({ fetchImpl = globalThis.fetch } = {}) {
  const emitter = createEmitter();
  const state = { ...defaultState };

  function snapshot() { return { ...state }; }
  function emit() { emitter.emit(snapshot()); return snapshot(); }
  function normalizeEndpoint(endpoint) { return String(endpoint || '').trim() || 'mock://grassclaw'; }

  async function pingRemote() {
    const startedAt = Date.now();
    const response = await fetchImpl(`${state.endpoint.replace(/\/$/, '')}/health`, { method: 'GET', headers: { accept: 'application/json, text/plain;q=0.9, */*;q=0.8' } });
    if (!response.ok) throw new Error(`health check failed: ${response.status}`);
    state.status = 'online';
    state.lastPingMs = Date.now() - startedAt;
    state.lastError = '';
    state.lastEventAt = new Date().toISOString();
    return emit();
  }

  return {
    getState() { return snapshot(); },
    subscribe(listener) { const un = emitter.subscribe(listener); listener(snapshot()); return un; },
    setEndpoint(endpoint) { state.endpoint = normalizeEndpoint(endpoint); return emit(); },
    async ping(endpoint = state.endpoint) {
      state.endpoint = normalizeEndpoint(endpoint);
      state.status = 'connecting';
      emit();
      if (state.endpoint.startsWith('mock://')) {
        state.status = 'online';
        state.lastPingMs = 42;
        state.lastError = '';
        state.lastEventAt = new Date().toISOString();
        return emit();
      }
      try { return await pingRemote(); }
      catch (error) {
        state.status = 'offline';
        state.lastError = error instanceof Error ? error.message : String(error);
        state.lastEventAt = new Date().toISOString();
        return emit();
      }
    },
    async pair(pairingCode) {
      const code = String(pairingCode || '').trim();
      state.lastPairingCode = code;
      if (!code) {
        state.lastError = 'pairing code is required';
        state.paired = false;
        return emit();
      }
      if (state.endpoint.startsWith('mock://')) {
        state.paired = true;
        state.status = 'paired';
        state.lastError = '';
        state.lastEventAt = new Date().toISOString();
        return emit();
      }
      if (!fetchImpl) {
        state.paired = false;
        state.lastError = 'fetch implementation is not available';
        return emit();
      }
      try {
        const response = await fetchImpl(`${state.endpoint.replace(/\/$/, '')}/api/pair`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ requestId: uid('pair'), pairingCode: code, role: 'client' })
        });
        if (!response.ok) throw new Error(`pair failed: ${response.status}`);
        state.paired = true;
        state.status = 'paired';
        state.lastError = '';
        state.lastEventAt = new Date().toISOString();
        return emit();
      } catch (error) {
        state.paired = false;
        state.status = 'offline';
        state.lastError = error instanceof Error ? error.message : String(error);
        state.lastEventAt = new Date().toISOString();
        return emit();
      }
    }
  };
}
