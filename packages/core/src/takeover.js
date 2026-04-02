import { createEmitter, deepClone, uid } from './utils.js';
import { readJson, writeJson } from './storage.js';

export const TAKEOVER_STORAGE_KEY = 'grassclaw:takeover';
const defaults = { isTakingOver: false, steps: [], savedSkills: [], logs: [] };

export function createTakeoverStore({ storage, getConfig }) {
  const emitter = createEmitter();
  const initial = readJson(storage, TAKEOVER_STORAGE_KEY, deepClone(defaults));
  const state = {
    ...deepClone(defaults),
    ...initial,
    steps: Array.isArray(initial.steps) ? initial.steps : [],
    savedSkills: Array.isArray(initial.savedSkills) ? initial.savedSkills : [],
    logs: Array.isArray(initial.logs) ? initial.logs : []
  };

  function snapshot() {
    return {
      isTakingOver: state.isTakingOver,
      steps: [...state.steps],
      savedSkills: [...state.savedSkills],
      logs: [...state.logs]
    };
  }
  function persist() {
    writeJson(storage, TAKEOVER_STORAGE_KEY, snapshot());
    emitter.emit(snapshot());
    return snapshot();
  }
  function addLog(message, kind = 'info') {
    state.logs = [{ id: uid('log'), at: new Date().toISOString(), kind, message }, ...state.logs].slice(0, 50);
  }

  return {
    getState() { return snapshot(); },
    subscribe(listener) { const un = emitter.subscribe(listener); listener(snapshot()); return un; },
    start() { state.isTakingOver = true; state.steps = []; addLog('草台接管已启动。'); return persist(); },
    stop() { state.isTakingOver = false; addLog(`草台接管已停止，本轮共记录 ${state.steps.length} 步。`); return persist(); },
    clear() { state.steps = []; addLog('本轮录制步骤已清空。'); return persist(); },
    record(action) {
      if (!state.isTakingOver) { addLog('未处于接管状态，Record 被忽略。', 'warn'); return persist(); }
      const text = String(action || '').trim();
      if (!text) { addLog('空步骤不会被记录。', 'warn'); return persist(); }
      const config = getConfig();
      state.steps = [...state.steps, { id: uid('step'), action: text, timestamp: new Date().toISOString(), trustLevel: config.trustLevel, mood: config.currentMood }];
      addLog(`已记录操作：${text}`);
      return persist();
    },
    saveSkill(name = '草台行动') {
      if (state.steps.length === 0) { addLog('没有可保存的步骤。', 'warn'); return null; }
      const config = getConfig();
      const skill = { id: uid('skill'), name: String(name).trim() || '草台行动', creator: config.founder, trustRequired: config.trustLevel, mood: config.currentMood, mode: config.mode, createdAt: new Date().toISOString(), steps: [...state.steps], type: 'recorded' };
      state.savedSkills = [skill, ...state.savedSkills];
      addLog(`Skill「${skill.name}」已保存。`);
      persist();
      return skill;
    },
    deleteSkill(id) { state.savedSkills = state.savedSkills.filter((skill) => skill.id !== id); addLog(`Skill ${id} 已删除。`); return persist(); },
    exportSkill(id) { const skill = state.savedSkills.find((item) => item.id === id); return skill ? JSON.stringify(skill, null, 2) : null; },
    importSkill(raw) {
      try {
        const parsed = JSON.parse(raw);
        if (!parsed || !Array.isArray(parsed.steps)) throw new Error('invalid skill');
        const normalized = { ...parsed, id: parsed.id || uid('skill'), name: parsed.name || '导入技能', createdAt: parsed.createdAt || new Date().toISOString(), type: 'recorded' };
        state.savedSkills = [normalized, ...state.savedSkills];
        addLog(`Skill「${normalized.name}」已导入。`);
        persist();
        return normalized;
      } catch {
        addLog('导入 Skill 失败，JSON 不合法。', 'error');
        persist();
        return null;
      }
    }
  };
}
