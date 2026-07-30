import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import crypto from 'crypto';

/**
 * Authentication & UI Logic (Material 3 Expressive Design)
 */

const getDashboardUI = (password: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Device Bot — Material Dashboard</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Roboto+Mono&display=swap" rel="stylesheet">
  <style>
    :root {
      --md-sys-color-primary: #d1e4ff;
      --md-sys-color-on-primary: #003258;
      --md-sys-color-primary-container: #00497d;
      --md-sys-color-on-primary-container: #d1e4ff;
      --md-sys-color-secondary: #bbc7db;
      --md-sys-color-surface: #1a1c1e;
      --md-sys-color-on-surface: #e2e2e6;
      --md-sys-color-surface-variant: #43474e;
      --md-sys-color-on-surface-variant: #c3c7d0;
      --md-sys-color-outline: #8d9199;
      --md-sys-color-error: #ffdad6;
      --bg-card: #232528;
      --bg-dialog: #232528;
    }

    body {
      font-family: 'Google Sans', sans-serif;
      background-color: var(--md-sys-color-surface);
      color: var(--md-sys-color-on-surface);
      margin: 0;
      -webkit-font-smoothing: antialiased;
    }

    .m3-card {
      background: var(--bg-card);
      border-radius: 28px;
      padding: 24px;
      border: 1px solid var(--md-sys-color-surface-variant);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .m3-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    }

    .m3-button {
      border-radius: 100px;
      padding: 12px 24px;
      font-weight: 500;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .m3-button-filled {
      background-color: var(--md-sys-color-primary);
      color: var(--md-sys-color-on-primary);
    }
    .m3-button-tonal {
      background-color: var(--md-sys-color-primary-container);
      color: var(--md-sys-color-on-primary-container);
    }
    .m3-button-outlined {
      border: 1px solid var(--md-sys-color-outline);
      color: var(--md-sys-color-primary);
    }
    .m3-button:active {
      transform: scale(0.96);
    }

    .terminal {
      font-family: 'Roboto Mono', monospace;
      background: #000000;
      color: #e2e2e6;
      border-radius: 24px;
      height: 400px;
      overflow-y: auto;
      padding: 20px;
      font-size: 0.85rem;
      border: 1px solid var(--md-sys-color-surface-variant);
    }
    .log-item {
      padding: 10px 14px;
      border-radius: 12px;
      margin-bottom: 6px;
      border-left: 4px solid transparent;
      background: rgba(255, 255, 255, 0.03);
    }
    .log-item.success { border-color: #81C784; background: rgba(129, 199, 132, 0.08); }
    .log-item.error { border-color: #E57373; background: rgba(229, 115, 115, 0.08); }
    .log-item.warn { border-color: #FFD54F; background: rgba(255, 213, 79, 0.08); }
    .log-details { font-size: 0.75rem; color: #aeb2bb; margin-top: 6px; }

    /* Modal Styles */
    #modal-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.7); display: none; align-items: center; justify-content: center; z-index: 100;
      backdrop-filter: blur(4px);
    }
    .m3-dialog {
      background: var(--bg-dialog); border-radius: 28px; width: 90%; max-width: 600px; max-height: 80vh;
      overflow-y: auto; padding: 32px; box-shadow: 0 24px 48px rgba(0,0,0,0.4);
      border: 1px solid var(--md-sys-color-surface-variant);
    }

    .progress-bar-container {
      height: 6px; background: var(--md-sys-color-surface-variant); border-radius: 3px; overflow: hidden;
    }
    .progress-bar-fill {
      height: 100%; background: var(--md-sys-color-primary); transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Stats Accent Colors */
    .stat-blue { background: rgba(209, 228, 255, 0.08); color: #d1e4ff; }
    .stat-green { background: rgba(129, 199, 132, 0.08); color: #81c784; }
    .stat-red { background: rgba(229, 115, 115, 0.08); color: #e57373; }
    .stat-neutral { background: rgba(255, 255, 255, 0.05); color: #e2e2e6; }
  </style>
</head>
<body class="p-4 lg:p-12">
  <div class="max-w-6xl mx-auto space-y-8">

    <!-- App Bar -->
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Device Registration Bot</h1>
        <p class="text-slate-500 mt-1">Material 3 Expressive Operations</p>
      </div>
      <div id="status-chip" class="px-4 py-2 rounded-full text-sm font-medium bg-slate-100 text-slate-600 flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-slate-400"></span>
        <span>Disconnected</span>
      </div>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Sidebar: Controls & Stats -->
      <div class="space-y-6">
        <section class="m3-card">
          <h2 class="text-lg font-bold mb-4">Operations</h2>
          <div class="flex flex-col gap-3">
            <button id="btn-start" class="m3-button m3-button-filled w-full justify-center">Start Registration</button>
            <button id="btn-pause" class="m3-button m3-button-tonal w-full justify-center hidden">Pause Bot</button>
            <button id="btn-stop" class="m3-button m3-button-outlined w-full justify-center text-red-600 border-red-200 hover:bg-red-50">Reset Progress</button>
          </div>

          <div class="mt-6 space-y-2">
            <label class="text-xs font-bold text-slate-500 uppercase">Step Delay</label>
            <div class="flex items-center gap-3">
              <input type="range" id="input-delay-range" min="200" max="5000" step="100" value="1000" class="flex-grow">
              <span id="delay-val" class="text-sm font-mono bg-slate-100 px-2 py-1 rounded">1000ms</span>
            </div>
          </div>
        </section>

        <section class="m3-card">
          <h2 class="text-lg font-bold mb-4">Statistics</h2>
          <div class="space-y-4">
            <div>
              <div class="flex justify-between text-sm mb-2">
                <span class="font-medium">Total Progress</span>
                <span id="stat-progress-text">0%</span>
              </div>
              <div class="progress-bar-container">
                <div id="stat-progress-bar" class="progress-bar-fill" style="width: 0%"></div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4 pt-2">
              <div class="stat-blue p-3 rounded-2xl">
                <span class="text-[10px] uppercase font-bold opacity-70">Processed</span>
                <div id="stat-processed" class="text-xl font-bold">0</div>
              </div>
              <div class="stat-neutral p-3 rounded-2xl opacity-70">
                <span class="text-[10px] uppercase font-bold">Queue Total</span>
                <div id="stat-total" class="text-xl font-bold">0</div>
              </div>
              <div class="stat-green p-3 rounded-2xl">
                <span class="text-[10px] uppercase font-bold opacity-70">Success</span>
                <div id="stat-success" class="text-xl font-bold">0</div>
              </div>
              <div class="stat-red p-3 rounded-2xl">
                <span class="text-[10px] uppercase font-bold opacity-70">Failures</span>
                <div id="stat-fail" class="text-xl font-bold">0</div>
              </div>
            </div>
            <button id="btn-view-fails" class="m3-button m3-button-outlined w-full justify-center text-xs mt-2">Open Failure Audit</button>
          </div>
        </section>
      </div>

      <!-- Main: Terminal Logs -->
      <div class="lg:col-span-2">
        <section class="m3-card h-full flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold">Execution Stream</h2>
            <button id="btn-clear-logs" class="text-xs text-slate-400 hover:text-slate-600 font-medium">Clear Dashboard</button>
          </div>
          <div id="terminal" class="terminal flex-grow">
            <div class="log-item">Ready for input. Click Start to begin synchronization.</div>
          </div>
        </section>
      </div>
    </div>
  </div>

  <!-- Failure Modal -->
  <div id="modal-overlay">
    <div class="m3-dialog">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-red-600">Failure Audit</h2>
        <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600">✕</button>
      </div>
      <div id="fails-list" class="space-y-4">
        <p class="text-slate-500 italic">No failures recorded in current session.</p>
      </div>
    </div>
  </div>

  <script>
    const PW = "${password}";
    let state = { status: 'stopped', currentIndex: 0, total: 0, successCount: 0, failCount: 0 };
    let isRequesting = false;

    const dom = {
      statusChip: document.getElementById('status-chip'),
      progressText: document.getElementById('stat-progress-text'),
      progressBar: document.getElementById('stat-progress-bar'),
      processed: document.getElementById('stat-processed'),
      total: document.getElementById('stat-total'),
      success: document.getElementById('stat-success'),
      fail: document.getElementById('stat-fail'),
      terminal: document.getElementById('terminal'),
      btnStart: document.getElementById('btn-start'),
      btnPause: document.getElementById('btn-pause'),
      btnStop: document.getElementById('btn-stop'),
      btnFails: document.getElementById('btn-view-fails'),
      delayRange: document.getElementById('input-delay-range'),
      delayVal: document.getElementById('delay-val'),
      modal: document.getElementById('modal-overlay'),
      failsList: document.getElementById('fails-list')
    };

    function addLog(msg, type = 'info', input = '', output = '') {
      const item = document.createElement('div');
      item.className = \`log-item \${type}\`;

      let html = \`<div class="font-medium">\${msg}</div>\`;
      if (input || output) {
        html += \`<div class="log-details">\`;
        if (input) html += \`<div><strong>→ Input:</strong> \${input}</div>\`;
        if (output) html += \`<div><strong>← Output:</strong> \${output}</div>\`;
        html += \`</div>\`;
      }

      item.innerHTML = html;
      dom.terminal.appendChild(item);
      dom.terminal.scrollTop = dom.terminal.scrollHeight;
      if (dom.terminal.children.length > 300) dom.terminal.removeChild(dom.terminal.firstChild);
    }

    async function callApi(action, body = {}) {
      try {
        const res = await fetch('/api/devicebot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pw: PW, action, ...body })
        });
        return await res.json();
      } catch (e) {
        console.error(e);
        return { error: 'Network Connection Lost' };
      }
    }

    function updateUI() {
      const percent = state.total > 0 ? Math.round((state.currentIndex / state.total) * 100) : 0;
      dom.progressText.textContent = \`\${percent}%\`;
      dom.progressBar.style.width = \`\${percent}%\`;
      dom.processed.textContent = state.currentIndex;
      dom.total.textContent = state.total;
      dom.success.textContent = state.successCount;
      dom.fail.textContent = state.failCount;

      // Status Styling
      const dot = dom.statusChip.querySelector('span:first-child');
      const text = dom.statusChip.querySelector('span:last-child');

      if (state.status === 'running') {
        dom.statusChip.className = 'px-4 py-2 rounded-full text-sm font-medium bg-blue-50 text-blue-700 flex items-center gap-2';
        dot.className = 'w-2 h-2 rounded-full bg-blue-500 animate-pulse';
        text.textContent = 'Active Execution';
        dom.btnStart.classList.add('hidden');
        dom.btnPause.classList.remove('hidden');
      } else if (state.status === 'paused') {
        dom.statusChip.className = 'px-4 py-2 rounded-full text-sm font-medium bg-amber-50 text-amber-700 flex items-center gap-2';
        dot.className = 'w-2 h-2 rounded-full bg-amber-500';
        text.textContent = 'Process Paused';
        dom.btnStart.classList.remove('hidden');
        dom.btnStart.textContent = 'Resume Execution';
        dom.btnPause.classList.add('hidden');
      } else {
        dom.statusChip.className = 'px-4 py-2 rounded-full text-sm font-medium bg-slate-100 text-slate-600 flex items-center gap-2';
        dot.className = 'w-2 h-2 rounded-full bg-slate-400';
        text.textContent = 'Standby';
        dom.btnStart.classList.remove('hidden');
        dom.btnStart.textContent = 'Start Registration';
        dom.btnPause.classList.add('hidden');
      }
    }

    async function step() {
      if (state.status !== 'running' || isRequesting) return;

      isRequesting = true;
      try {
        const res = await callApi('step');
        if (res.state) {
          state = res.state;
          updateUI();
        }
        if (res.log) {
          addLog(res.log.msg, res.log.type, res.log.input, res.log.output);
        } else if (res.error) {
          addLog(\`Execution Error: \${res.error}\`, 'error');
        }
      } finally {
        isRequesting = false;
        if (state.status === 'running') {
          setTimeout(step, parseInt(dom.delayRange.value));
        }
      }
    }

    dom.btnStart.onclick = async () => {
      const res = await callApi('start');
      if (res.success) {
        state.status = 'running';
        updateUI();
        step();
      }
    };

    dom.btnPause.onclick = async () => {
      const res = await callApi('pause');
      if (res.success) {
        state.status = 'paused';
        updateUI();
      }
    };

    dom.btnStop.onclick = async () => {
      if (!confirm('Are you sure? This will wipe ALL progress and logs from the database.')) return;
      const res = await callApi('stop');
      if (res.success) {
        location.reload();
      }
    };

    dom.delayRange.oninput = () => {
      dom.delayVal.textContent = \`\${dom.delayRange.value}ms\`;
    };

    dom.btnFails.onclick = async () => {
      dom.modal.style.display = 'flex';
      dom.failsList.innerHTML = '<div class="text-slate-400 animate-pulse">Loading failure logs...</div>';
      const res = await callApi('get_failures');
      if (res.fails && Object.keys(res.fails).length > 0) {
        dom.failsList.innerHTML = Object.entries(res.fails).map(([model, data]) => `
          <div class="p-4 bg-white/5 rounded-2xl border border-white/10">
            <div class="flex justify-between items-start mb-2">
              <span class="font-bold text-blue-200">\${model}</span>
              <span class="px-2 py-0.5 bg-red-900/40 text-red-300 text-[10px] font-bold rounded uppercase">\${data.count} Retries</span>
            </div>
            <div class="text-xs text-slate-400 font-mono">\${data.errors.slice(-1)}</div>
          </div>
        `).join('');
      } else {
        dom.failsList.innerHTML = '<p class="text-slate-500 italic text-center py-8">No failed devices found.</p>';
      }
    };

    window.closeModal = () => dom.modal.style.display = 'none';
    window.onclick = (e) => { if (e.target == dom.modal) closeModal(); };

    // Initial Sync
    (async () => {
      const res = await callApi('get_state');
      if (res.state) {
        state = res.state;
        updateUI();
        if (res.logs) {
          res.logs.reverse().forEach(l => {
            const p = JSON.parse(l);
            addLog(p.msg, p.type, p.input, p.output);
          });
        }
      }
    })();
  </script>
</body>
</html>
`;

const getPasswordPrompt = (error?: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Protected Access — Toolz</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #fdfcff; }
    form { background: #232528; padding: 32px; border-radius: 28px; border: 1px solid #43474e; width: 100%; max-width: 380px; text-align: center; color: #e2e2e6; }
    h1 { margin: 0 0 12px 0; font-size: 1.5rem; color: #d1e4ff; }
    p { color: #c3c7d0; font-size: 0.9rem; margin-bottom: 24px; }
    input { width: 100%; padding: 12px 16px; margin-bottom: 16px; border: 1px solid #73777f; border-radius: 8px; box-sizing: border-box; background: #1a1c1e; color: white; }
    button { width: 100%; padding: 12px; background: #d1e4ff; color: #003258; border: none; border-radius: 100px; cursor: pointer; font-weight: 500; }
    .error { color: #ffdad6; font-size: 0.8rem; margin-bottom: 16px; background: #93000a; padding: 8px; border-radius: 4px; }
  </style>
</head>
<body>
  <form method="POST">
    <h1>Device Bot</h1>
    <p>Authentication required to manage operations.</p>
    ${error ? `<div class="error">${error}</div>` : ''}
    <input type="password" name="pw" placeholder="Auth Key" required autofocus>
    <button type="submit">Verify & Access</button>
  </form>
</body>
</html>
`;

/**
 * Main Handler
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN || !process.env.SYNC_PASSWORD) {
    return res.status(500).json({ error: "Missing Required Environment Variables" });
  }

  const redis = Redis.fromEnv();
  const SYNC_PASSWORD = process.env.SYNC_PASSWORD;
  const isLocal = process.env.NODE_ENV === 'development';

  const providedPw = req.method === 'POST' ? req.body?.pw : req.query?.pw;
  let authenticated = isLocal || (providedPw && crypto.timingSafeEqual(Buffer.from(String(providedPw)), Buffer.from(SYNC_PASSWORD)));

  if (!authenticated) {
    if (req.method === 'POST' && req.body?.action) return res.status(401).json({ error: 'Unauthorized' });
    if (providedPw) return res.status(401).send(getPasswordPrompt('Invalid Auth Key.'));
    return res.status(401).send(getPasswordPrompt());
  }

  if (req.method === 'GET' || (req.method === 'POST' && !req.body.action)) {
    return res.status(200).send(getDashboardUI(String(providedPw || '')));
  }

  const action = req.body.action;

  try {
    const STATE_KEY = 'bot:state';
    const LOGS_KEY = 'bot:logs';
    const QUEUE_KEY = 'bot:queue';
    const FAILURES_KEY = 'bot:failures';

    const getState = async () => {
      const s = await redis.get(STATE_KEY);
      return (s as any) || { status: 'stopped', currentIndex: 0, total: 0, successCount: 0, failCount: 0 };
    };

    const addLog = async (msg: string, type: string, input = '', output = '') => {
      const log = JSON.stringify({ msg, type, input, output, ts: Date.now() });
      await redis.lpush(LOGS_KEY, log);
      await redis.ltrim(LOGS_KEY, 0, 299);
      return JSON.parse(log);
    };

    if (action === 'get_state') {
      const state = await getState();
      const logs = await redis.lrange(LOGS_KEY, 0, 50);
      return res.status(200).json({ state, logs });
    }

    if (action === 'get_failures') {
      const fails = await redis.hgetall(FAILURES_KEY);
      return res.status(200).json({ fails });
    }

    if (action === 'start') {
      let state = await getState();
      if (state.status === 'stopped') {
        await addLog('Initializing system queue...', 'info');
        const sourceUrl = 'https://raw.githubusercontent.com/pbakondy/android-device-list/master/devices.json';
        const response = await fetch(sourceUrl);
        const devices = await response.json();

        const unique = new Set<string>();
        for (const d of devices) {
          if (d.model?.trim().length > 1) unique.add(d.model.trim());
          if (d.name?.trim().length > 1) unique.add(d.name.trim());
        }

        const models = Array.from(unique);
        await redis.del(QUEUE_KEY);
        const pipeline = redis.pipeline();
        for (let i = 0; i < models.length; i += 2000) {
          pipeline.rpush(QUEUE_KEY, ...models.slice(i, i + 2000));
        }
        await pipeline.exec();

        state = { status: 'running', currentIndex: 0, total: models.length, successCount: 0, failCount: 0 };
        await addLog(`Queue built: ${models.length} items.`, 'success');
      } else {
        state.status = 'running';
        await addLog('System resumed.', 'info');
      }
      await redis.set(STATE_KEY, state);
      return res.status(200).json({ success: true, state });
    }

    if (action === 'pause') {
      const state = await getState();
      state.status = 'paused';
      await redis.set(STATE_KEY, state);
      await addLog('System paused by user.', 'warn');
      return res.status(200).json({ success: true });
    }

    if (action === 'stop') {
      await redis.del(STATE_KEY, QUEUE_KEY, LOGS_KEY, FAILURES_KEY);
      return res.status(200).json({ success: true });
    }

    if (action === 'step') {
      const state = await getState();
      if (state.status !== 'running') return res.status(400).json({ error: 'System inactive' });

      const model = await redis.lindex(QUEUE_KEY, state.currentIndex);
      if (!model) {
        state.status = 'stopped';
        await redis.set(STATE_KEY, state);
        return res.status(200).json({ state, log: await addLog('Operations complete!', 'success') });
      }

      const input = String(model);
      let output = '';

      try {
        const host = req.headers.host || 'localhost:3000';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const baseUrl = `${protocol}://${host}`;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 18000);

        try {
          const specRes = await fetch(`${baseUrl}/api/specs?model=${encodeURIComponent(input)}`, {
            signal: controller.signal
          });
          const data = await specRes.json();

          if (specRes.ok) {
            output = data.search_name || 'Specs Cached';
            state.successCount++;
            state.currentIndex++;
            await redis.set(STATE_KEY, state);
            return res.status(200).json({ state, log: await addLog(`Success: ${input}`, 'success', input, output) });
          } else {
            throw new Error(data.error || `HTTP ${specRes.status}`);
          }
        } finally {
          clearTimeout(timeout);
        }
      } catch (e: any) {
        output = e.message;
        state.failCount++;

        const failData: any = (await redis.hget(FAILURES_KEY, input)) || { count: 0, errors: [] };
        failData.count++;
        failData.errors.push(output);
        await redis.hset(FAILURES_KEY, { [input]: failData });

        state.currentIndex++;
        await redis.set(STATE_KEY, state);

        const type = failData.count > 5 ? 'error' : 'warn';
        return res.status(200).json({ state, log: await addLog(`Failed: ${input}`, type, input, output) });
      }
    }

    return res.status(400).json({ error: 'Invalid operation' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
