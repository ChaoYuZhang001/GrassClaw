import { behaviorLevelFromTrust, createBanner, createConfigStore, createMemoryStorage, createTakeoverStore, describeMood, getRandomRoast } from '../../../packages/core/src/index.js';
import { createGatewayClient } from '../../../packages/gateway-client/src/index.js';

const storage = typeof window !== 'undefined' && window.localStorage ? window.localStorage : createMemoryStorage();
const configStore = createConfigStore({ storage });
const takeoverStore = createTakeoverStore({ storage, getConfig: () => configStore.getState() });
const gatewayClient = createGatewayClient();

const uiState = { actionDraft: '打开控制台并开始草台排练', skillName: '草台行动', importJson: '', exportJson: '', pairingCode: '', lastRoast: getRandomRoast(), installPromptEvent: null, toast: '' };

function platformName() { if (typeof window === 'undefined') return 'server'; if (window.__TAURI__) return 'Tauri shell'; if (navigator.standalone) return 'PWA (iOS)'; if (window.matchMedia('(display-mode: standalone)').matches) return 'PWA'; return 'Browser'; }
function escapeHtml(value) { return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;'); }
function statusBadge(status) { if (status === 'online' || status === 'paired') return 'ok'; if (status === 'connecting') return 'warn'; return 'danger'; }
function downloadTextFile(filename, content) { const blob = new Blob([content], { type: 'application/json;charset=utf-8' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url); }
function showToast(message) { uiState.toast = message; render(); window.clearTimeout(showToast.timer); showToast.timer = window.setTimeout(() => { uiState.toast = ''; render(); }, 2400); }
showToast.timer = 0;
function registerInstallPrompt() { window.addEventListener('beforeinstallprompt', (event) => { event.preventDefault(); uiState.installPromptEvent = event; render(); }); }
function registerServiceWorker() { if ('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js').catch(() => undefined); }

function current() {
  const config = configStore.getState();
  return { config, takeover: takeoverStore.getState(), gateway: gatewayClient.getState(), banner: createBanner(config), moodDescription: describeMood(config.currentMood), platform: platformName(), canInstall: Boolean(uiState.installPromptEvent) };
}
function renderSkills(skills) {
  if (skills.length === 0) return '<p class="muted">还没有保存任何 Skill，先接管一次再说。</p>';
  return `<ul class="skill-list">${skills.map((skill) => `<li class="skill-item"><strong>${escapeHtml(skill.name)}</strong><div class="skill-meta"><span>${escapeHtml(skill.mode || 'auto')}</span><span>trust ${skill.trustRequired}</span><span>${escapeHtml(skill.mood)}</span><span>${escapeHtml(skill.steps.length)} steps</span></div><small>${escapeHtml(new Date(skill.createdAt).toLocaleString())}</small><div class="actions" style="margin-top:.8rem;"><button data-action="export-skill" data-id="${skill.id}">导出 JSON</button><button class="secondary" data-action="preview-skill" data-id="${skill.id}">预览</button><button class="ghost" data-action="delete-skill" data-id="${skill.id}">删除</button></div></li>`).join('')}</ul>`;
}
function renderSteps(steps) {
  if (steps.length === 0) return '<p class="muted">当前没有录制步骤。点击 Start 进入接管，再 Record。</p>';
  return `<ul class="step-list">${steps.map((step) => `<li class="step-item"><strong>${escapeHtml(step.action)}</strong><div class="step-meta"><span>${escapeHtml(step.mood)}</span><span>trust ${step.trustLevel}</span><span>${escapeHtml(new Date(step.timestamp).toLocaleString())}</span></div></li>`).join('')}</ul>`;
}
function renderLogs(logs) {
  if (logs.length === 0) return '<p class="muted">日志还很安静，先做点草台操作。</p>';
  return `<ul class="log-list">${logs.map((log) => `<li class="log-item"><strong>${escapeHtml(log.message)}</strong><small>${escapeHtml(log.kind)} · ${escapeHtml(new Date(log.at).toLocaleString())}</small></li>`).join('')}</ul>`;
}

function bindEvents() {
  const app = document.getElementById('app'); if (!app) return;
  app.querySelector('[data-field="mode"]')?.addEventListener('change', (event) => configStore.setMode(event.target.value));
  app.querySelector('[data-field="gateway-endpoint"]')?.addEventListener('input', (event) => { configStore.setGatewayEndpoint(event.target.value); gatewayClient.setEndpoint(event.target.value); });
  app.querySelector('[data-field="trust"]')?.addEventListener('input', (event) => configStore.setTrustLevel(Number(event.target.value)));
  app.querySelector('[data-field="emotion"]')?.addEventListener('input', (event) => configStore.setEmotionValue(Number(event.target.value)));
  app.querySelectorAll('[data-feature]').forEach((input) => input.addEventListener('change', (event) => configStore.toggleFeature(event.target.dataset.feature, event.target.checked)));
  app.querySelector('[data-field="pairing-code"]')?.addEventListener('input', (event) => { uiState.pairingCode = event.target.value; });
  app.querySelector('[data-field="action-draft"]')?.addEventListener('input', (event) => { uiState.actionDraft = event.target.value; });
  app.querySelector('[data-field="skill-name"]')?.addEventListener('input', (event) => { uiState.skillName = event.target.value; });
  app.querySelector('[data-field="import-json"]')?.addEventListener('input', (event) => { uiState.importJson = event.target.value; });
  app.querySelector('[data-action="random-roast"]')?.addEventListener('click', () => { uiState.lastRoast = getRandomRoast(); render(); });
  app.querySelector('[data-action="emotion-up"]')?.addEventListener('click', () => { configStore.adjustEmotion(8); uiState.lastRoast = getRandomRoast(); });
  app.querySelector('[data-action="emotion-down"]')?.addEventListener('click', () => { configStore.adjustEmotion(-12); uiState.lastRoast = getRandomRoast(); });
  app.querySelector('[data-action="ping-gateway"]')?.addEventListener('click', async () => { await gatewayClient.ping(configStore.getState().gatewayEndpoint); showToast('Gateway ping 已完成。'); });
  app.querySelector('[data-action="pair-gateway"]')?.addEventListener('click', async () => { await gatewayClient.pair(uiState.pairingCode); showToast('Pair 请求已处理。'); });
  app.querySelector('[data-action="takeover-start"]')?.addEventListener('click', () => { takeoverStore.start(); showToast('草台接管已启动。'); });
  app.querySelector('[data-action="takeover-stop"]')?.addEventListener('click', () => { takeoverStore.stop(); showToast('草台接管已停止。'); });
  app.querySelector('[data-action="takeover-clear"]')?.addEventListener('click', () => { takeoverStore.clear(); showToast('本轮录制步骤已清空。'); });
  app.querySelector('[data-action="record-step"]')?.addEventListener('click', () => { takeoverStore.record(uiState.actionDraft); showToast('Record 已执行。'); });
  app.querySelector('[data-action="save-skill"]')?.addEventListener('click', () => { const saved = takeoverStore.saveSkill(uiState.skillName); if (saved) { uiState.exportJson = JSON.stringify(saved, null, 2); showToast(`Skill「${saved.name}」已保存。`); } else { showToast('没有可保存的步骤。'); } });
  app.querySelector('[data-action="copy-banner"]')?.addEventListener('click', async () => { try { await navigator.clipboard.writeText(createBanner(configStore.getState())); showToast('横幅已复制。'); } catch { showToast('复制失败，请手动复制。'); } });
  app.querySelector('[data-action="import-skill"]')?.addEventListener('click', () => { const imported = takeoverStore.importSkill(uiState.importJson); if (imported) { uiState.exportJson = JSON.stringify(imported, null, 2); showToast(`Skill「${imported.name}」已导入。`); } else { showToast('导入失败，请检查 JSON。'); } });
  app.querySelector('[data-action="clear-import"]')?.addEventListener('click', () => { uiState.importJson = ''; render(); });
  app.querySelector('[data-action="install-app"]')?.addEventListener('click', async () => { if (!uiState.installPromptEvent) return; uiState.installPromptEvent.prompt(); await uiState.installPromptEvent.userChoice.catch(() => undefined); uiState.installPromptEvent = null; render(); });
  app.querySelectorAll('[data-action="delete-skill"]').forEach((button) => button.addEventListener('click', () => { takeoverStore.deleteSkill(button.dataset.id); showToast('Skill 已删除。'); }));
  app.querySelectorAll('[data-action="export-skill"]').forEach((button) => button.addEventListener('click', () => { const json = takeoverStore.exportSkill(button.dataset.id); if (!json) return; uiState.exportJson = json; const parsed = JSON.parse(json); downloadTextFile(`${parsed.name}.json`, json); render(); showToast('Skill JSON 已导出。'); }));
  app.querySelectorAll('[data-action="preview-skill"]').forEach((button) => button.addEventListener('click', () => { const json = takeoverStore.exportSkill(button.dataset.id); if (!json) return; uiState.exportJson = json; render(); }));
}

function render() {
  const app = document.getElementById('app'); if (!app) return;
  const { config, takeover, gateway, banner, moodDescription, platform, canInstall } = current();
  app.innerHTML = `<div class="app-shell"><section class="hero"><article class="card"><p class="eyebrow">GrassClaw · 1.0.0-beta.1</p><h1>把草台龙虾从设定稿，做成真的可安装产品。</h1><p class="lead">这版代码已经把 Web / PWA、Tauri 2 外壳、信任滑块、情绪系统、接管录制、Skill 库和 Gateway mock 打通成一条完整骨架。</p><div class="badges"><span class="badge"><strong>Platform</strong> ${escapeHtml(platform)}</span><span class="badge"><strong>Mode</strong> ${escapeHtml(config.mode)}</span><span class="badge ${statusBadge(gateway.status)}"><strong>Gateway</strong> ${escapeHtml(gateway.status)}</span><span class="badge"><strong>Behavior</strong> ${escapeHtml(behaviorLevelFromTrust(config.trustLevel))}</span></div>${canInstall ? `<div class="install-row"><div><strong>可安装版已准备好</strong><div class="muted">浏览器支持 PWA 的情况下，可直接安装到桌面或 iPad 主屏幕。</div></div><button data-action="install-app">安装 GrassClaw</button></div>` : ''}</article><article class="card"><pre class="banner">${escapeHtml(banner)}</pre></article></section><section class="layout"><article class="card span-4 stack"><div><h2>Hybrid 配置</h2><p class="muted">信任滑块会直接影响行为边界。情绪越低，越要收紧风险动作。</p></div><label>运行模式<select data-field="mode"><option value="local" ${config.mode === 'local' ? 'selected' : ''}>local</option><option value="cloud" ${config.mode === 'cloud' ? 'selected' : ''}>cloud</option><option value="auto" ${config.mode === 'auto' ? 'selected' : ''}>auto</option></select></label><label>Gateway Endpoint<input data-field="gateway-endpoint" value="${escapeHtml(config.gatewayEndpoint)}" placeholder="mock://grassclaw 或 https://your-gateway.example.com" /></label><div class="range-row"><div class="range-meta"><span>信任滑块</span><span>${config.trustLevel}</span></div><input type="range" min="0" max="100" data-field="trust" value="${config.trustLevel}" /><div class="range-meta"><span>行为等级</span><span>${escapeHtml(behaviorLevelFromTrust(config.trustLevel))}</span></div></div><div class="range-row"><div class="range-meta"><span>情绪值</span><span>${config.emotionValue}</span></div><input type="range" min="0" max="100" data-field="emotion" value="${config.emotionValue}" /><div class="range-meta"><span>${escapeHtml(config.currentMood)}</span><span>${escapeHtml(moodDescription)}</span></div></div><div class="toggle-list">${Object.entries(config.features).map(([key, value]) => `<label class="toggle-item"><span>${escapeHtml(key)}</span><input type="checkbox" data-feature="${escapeHtml(key)}" ${value ? 'checked' : ''} /></label>`).join('')}</div><div class="actions"><button data-action="random-roast">来句吐槽</button><button class="secondary" data-action="emotion-up">情绪 +8</button><button class="ghost" data-action="emotion-down">情绪 -12</button></div><pre class="json-preview">${escapeHtml(uiState.lastRoast)}</pre></article><article class="card span-4 stack"><div><h2>Gateway 连接</h2><p class="muted">默认走 mock。切成真实 endpoint 后，会先尝试 /health 和 /api/pair。</p></div><div class="kpi-grid"><div class="kpi"><span class="muted">状态</span><strong>${escapeHtml(gateway.status)}</strong></div><div class="kpi"><span class="muted">延迟</span><strong>${gateway.lastPingMs ?? '--'}ms</strong></div><div class="kpi"><span class="muted">配对</span><strong>${gateway.paired ? '已配对' : '未配对'}</strong></div></div><label>Pairing Code<input data-field="pairing-code" value="${escapeHtml(uiState.pairingCode)}" placeholder="输入配对码" /></label><div class="actions"><button data-action="ping-gateway">Ping Gateway</button><button class="secondary" data-action="pair-gateway">Pair</button></div><pre class="json-preview">${escapeHtml(JSON.stringify(gateway, null, 2))}</pre></article><article class="card span-4 stack"><div><h2>草台接管</h2><p class="muted">Start → Record → Save as Skill，整个闭环已经打通。</p></div><div class="badges"><span class="badge ${takeover.isTakingOver ? 'ok' : 'warn'}"><strong>Status</strong> ${takeover.isTakingOver ? '接管中' : '待命中'}</span><span class="badge"><strong>Steps</strong> ${takeover.steps.length}</span><span class="badge"><strong>Skills</strong> ${takeover.savedSkills.length}</span></div><div class="actions"><button data-action="takeover-start">Start</button><button class="secondary" data-action="takeover-stop">Stop</button><button class="ghost" data-action="takeover-clear">Clear</button></div><label>Record action<input data-field="action-draft" value="${escapeHtml(uiState.actionDraft)}" placeholder="例如：打开页面、点击按钮、填写表单" /></label><button data-action="record-step">Record</button><label>Skill name<input data-field="skill-name" value="${escapeHtml(uiState.skillName)}" placeholder="保存后的技能名称" /></label><div class="actions"><button data-action="save-skill">Save as Skill</button><button class="ghost" data-action="copy-banner">复制横幅</button></div></article><article class="card span-7 stack"><div><h2>已录制步骤</h2><p class="muted">每一步都带上当时的情绪和信任度，方便复盘和二次编辑。</p></div>${renderSteps(takeover.steps)}</article><article class="card span-5 stack"><div><h2>Skill 库</h2><p class="muted">导出 JSON 后即可做版本化、分享、或者塞回真实 Skill 系统。</p></div>${renderSkills(takeover.savedSkills)}</article><article class="card span-6 stack"><div><h2>导入 / 预览</h2><p class="muted">可以把别人的 Skill JSON 贴进来，也可以直接预览最近一次导出。</p></div><textarea data-field="import-json" placeholder="粘贴 Skill JSON">${escapeHtml(uiState.importJson)}</textarea><div class="actions"><button data-action="import-skill">导入 Skill</button><button class="secondary" data-action="clear-import">清空输入</button></div><pre class="json-preview">${escapeHtml(uiState.exportJson || '这里会显示最近一次预览或导出的 Skill JSON。')}</pre></article><article class="card span-6 stack"><div><h2>系统日志</h2><p class="muted">所有“优雅翻车”都会留下痕迹。</p></div>${renderLogs(takeover.logs)}</article></section><p class="footer">世界就是一个巨大的草台班子，而我们就是那个敢上台的龙虾。</p>${uiState.toast ? `<div class="toast">${escapeHtml(uiState.toast)}</div>` : ''}</div>`;
  bindEvents();
}

function bootstrap() {
  configStore.subscribe(() => render());
  takeoverStore.subscribe(() => render());
  gatewayClient.subscribe(() => render());
  gatewayClient.setEndpoint(configStore.getState().gatewayEndpoint);
  registerInstallPrompt();
  registerServiceWorker();
  render();
}
window.addEventListener('DOMContentLoaded', bootstrap);
