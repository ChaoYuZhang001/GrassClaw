import { clamp, createEmitter, deepClone } from './utils.js';
import { readJson, writeJson } from './storage.js';

export const CONFIG_STORAGE_KEY = 'grassclaw:config';

export const defaultConfig = {
  name: 'GrassClaw',
  founder: '张超宇',
  version: '1.0.0-beta.1',
  slogan: '草台班子版超级龙虾 —— 敢玩敢教敢翻车',
  mode: 'auto',
  trustLevel: 68,
  emotionValue: 64,
  currentMood: '愉快',
  gatewayEndpoint: 'mock://grassclaw',
  features: {
    roast: true,
    rebellion: true,
    abstract: true,
    multiDragon: false,
    blackMode: false
  }
};

export function moodFromValue(value) {
  if (value >= 81) return '亢奋';
  if (value >= 61) return '愉快';
  if (value >= 41) return '平静';
  if (value >= 21) return '摸鱼';
  return '叛逆';
}

export function behaviorLevelFromTrust(trustLevel) {
  if (trustLevel <= 30) return '观察模式';
  if (trustLevel <= 70) return '共创模式';
  return '放手模式';
}

export function createConfigStore({ storage }) {
  const emitter = createEmitter();
  const initial = readJson(storage, CONFIG_STORAGE_KEY, deepClone(defaultConfig));
  const state = {
    ...deepClone(defaultConfig),
    ...initial,
    features: {
      ...defaultConfig.features,
      ...(initial.features || {})
    }
  };
  state.trustLevel = clamp(Number(state.trustLevel) || defaultConfig.trustLevel, 0, 100);
  state.emotionValue = clamp(Number(state.emotionValue) || defaultConfig.emotionValue, 0, 100);
  state.currentMood = moodFromValue(state.emotionValue);

  function snapshot() {
    return {
      ...state,
      features: { ...state.features },
      behaviorLevel: behaviorLevelFromTrust(state.trustLevel)
    };
  }

  function persist() {
    writeJson(storage, CONFIG_STORAGE_KEY, snapshot());
    emitter.emit(snapshot());
    return snapshot();
  }

  return {
    getState() {
      return snapshot();
    },
    subscribe(listener) {
      const un = emitter.subscribe(listener);
      listener(snapshot());
      return un;
    },
    setMode(mode) {
      state.mode = mode;
      return persist();
    },
    setGatewayEndpoint(endpoint) {
      state.gatewayEndpoint = String(endpoint || '').trim();
      return persist();
    },
    setTrustLevel(value) {
      state.trustLevel = clamp(Number(value), 0, 100);
      return persist();
    },
    adjustEmotion(delta) {
      state.emotionValue = clamp(state.emotionValue + Number(delta), 0, 100);
      state.currentMood = moodFromValue(state.emotionValue);
      return persist();
    },
    setEmotionValue(value) {
      state.emotionValue = clamp(Number(value), 0, 100);
      state.currentMood = moodFromValue(state.emotionValue);
      return persist();
    },
    toggleFeature(key, forcedValue) {
      state.features[key] = typeof forcedValue === 'boolean' ? forcedValue : !state.features[key];
      return persist();
    }
  };
}
