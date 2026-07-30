import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import crypto from 'crypto';

/**
 * Authentication & UI Logic
 */

const getDashboardUI = (password: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Device Registration Bot - Toolz</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono&display=swap');
    body { font-family: 'Inter', sans-serif; background-color: #f8fafc; }
    .terminal { font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; height: 300px; overflow-y: auto; background: #0f172a; color: #cbd5e1; }
    .log-entry { border-bottom: 1px solid #1e293b; padding: 0.25rem 0.5rem; }
    .log-info { color: #38bdf8; }
    .log-error { color: #f43f5e; }
    .log-success { color: #10b981; }
    .log-warn { color: #fbbf24; }
  </style>
</head>
<body class="p-4 md:p-8">
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Device Bot Dashboard</h1>
        <p class="text-slate-500 text-sm">Automated registration and caching for device specifications.</p>
      </div>
      <div class="flex items-center gap-2" id="status-badge">
        <span class="relative flex h-3 w-3">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-3 w-3 bg-slate-500"></span>
        </span>
        <span class="text-sm font-semibold text-slate-500 uppercase tracking-wider">Disconnected</span>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <p class="text-xs font-medium text-slate-500 uppercase">Progress</p>
        <p class="text-xl font-bold text-slate-900" id="stat-progress">0%</p>
        <div class="w-full bg-slate-100 rounded-full h-1.5 mt-2">
          <div id="stat-progress-bar" class="bg-blue-600 h-1.5 rounded-full transition-all duration-500" style="width: 0%"></div>
        </div>
      </div>
      <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <p class="text-xs font-medium text-slate-500 uppercase">Processed</p>
        <p class="text-xl font-bold text-slate-900" id="stat-processed">0 / 0</p>
      </div>
      <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <p class="text-xs font-medium text-slate-500 uppercase">Successes</p>
        <p class="text-xl font-bold text-green-600" id="stat-success">0</p>
      </div>
      <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <p class="text-xs font-medium text-slate-500 uppercase">Failures</p>
        <p class="text-xl font-bold text-rose-600" id="stat-fail">0</p>
      </div>
    </div>

    <!-- Controls -->
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div class="flex flex-wrap gap-3">
        <button id="btn-start" class="px-6 py-2 bg-black text-white rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50">Start Bot</button>
        <button id="btn-pause" class="px-6 py-2 bg-white border border-slate-200 text-slate-900 rounded-lg font-medium hover:bg-slate-50 transition-colors hidden">Pause</button>
        <button id="btn-stop" class="px-6 py-2 bg-white border border-slate-200 text-rose-600 rounded-lg font-medium hover:bg-rose-50 transition-colors">Stop & Reset</button>
        <button id="btn-view-fails" class="px-6 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors">View Failures</button>
        <div class="flex-grow"></div>
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-slate-600">Delay (ms):</label>
          <input type="number" id="input-delay" value="1000" min="100" class="w-20 px-2 py-1 border border-slate-200 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500">
        </div>
      </div>
    </div>

    <!-- Terminal -->
    <div class="bg-slate-900 rounded-2xl shadow-lg overflow-hidden border border-slate-800">
      <div class="px-4 py-2 bg-slate-800 flex items-center justify-between">
        <span class="text-xs font-semibold text-slate-400 uppercase tracking-widest">Logs</span>
        <button id="btn-clear-logs" class="text-[10px] text-slate-500 hover:text-white uppercase">Clear UI</button>
      </div>
      <div id="terminal" class="terminal p-2">
        <div class="log-entry log-info">System ready. Waiting for user...</div>
      </div>
    </div>
  </div>

  <script>
    const PW = "${password}";
    let state = {
      status: 'stopped',
      currentIndex: 0,
      total: 0,
      successCount: 0,
      failCount: 0,
      delay: 1000
    };
    let timer = null;

    const elements = {
      status: document.getElementById('status-badge'),
      progressText: document.getElementById('stat-progress'),
      progressBar: document.getElementById('stat-progress-bar'),
      processed: document.getElementById('stat-processed'),
      success: document.getElementById('stat-success'),
      fail: document.getElementById('stat-fail'),
      terminal: document.getElementById('terminal'),
      btnStart: document.getElementById('btn-start'),
      btnPause: document.getElementById('btn-pause'),
      btnStop: document.getElementById('btn-stop'),
      inputDelay: document.getElementById('input-delay'),
      btnViewFails: document.getElementById('btn-view-fails')
    };

    function addLog(msg, type = 'info') {
      const entry = document.createElement('div');
      entry.className = \`log-entry log-\${type}\`;
      entry.textContent = \`[\${new Date().toLocaleTimeString()}] \${msg}\`;
      elements.terminal.appendChild(entry);
      elements.terminal.scrollTop = elements.terminal.scrollHeight;

      if (elements.terminal.children.length > 500) {
        elements.terminal.removeChild(elements.terminal.firstChild);
      }
    }

    async function api(action, body = {}) {
      try {
        const res = await fetch('/api/devicebot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pw: PW, action, ...body })
        });
        return await res.json();
      } catch (e) {
        console.error(e);
        return { error: 'Network error' };
      }
    }

    function updateUI() {
      const percent = state.total > 0 ? Math.round((state.currentIndex / state.total) * 100) : 0;
      elements.progressText.textContent = \`\${percent}%\`;
      elements.progressBar.style.width = \`\${percent}%\`;
      elements.processed.textContent = \`\${state.currentIndex} / \${state.total}\`;
      elements.success.textContent = state.successCount;
      elements.fail.textContent = state.failCount;

      // Status Badge
      const dot = elements.status.querySelector('.relative.inline-flex');
      const ping = elements.status.querySelector('.animate-ping');
      const text = elements.status.querySelector('span:last-child');

      if (state.status === 'running') {
        dot.className = 'relative inline-flex rounded-full h-3 w-3 bg-emerald-500';
        ping.className = 'animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75';
        text.textContent = 'Running';
        text.className = 'text-sm font-semibold text-emerald-600 uppercase tracking-wider';
        elements.btnStart.classList.add('hidden');
        elements.btnPause.classList.remove('hidden');
      } else if (state.status === 'paused') {
        dot.className = 'relative inline-flex rounded-full h-3 w-3 bg-amber-500';
        ping.className = 'hidden';
        text.textContent = 'Paused';
        text.className = 'text-sm font-semibold text-amber-600 uppercase tracking-wider';
        elements.btnStart.classList.remove('hidden');
        elements.btnStart.textContent = 'Resume Bot';
        elements.btnPause.classList.add('hidden');
      } else {
        dot.className = 'relative inline-flex rounded-full h-3 w-3 bg-slate-500';
        ping.className = 'hidden';
        text.textContent = 'Stopped';
        text.className = 'text-sm font-semibold text-slate-500 uppercase tracking-wider';
        elements.btnStart.classList.remove('hidden');
        elements.btnStart.textContent = 'Start Bot';
        elements.btnPause.classList.add('hidden');
      }
    }

    async function syncState() {
      const res = await api('get_state');
      if (res.state) {
        state = res.state;
        updateUI();
        if (res.logs) {
          res.logs.reverse().forEach(l => {
            const parsed = JSON.parse(l);
            addLog(parsed.msg, parsed.type);
          });
        }
      }
    }

    async function step() {
      if (state.status !== 'running') return;

      const res = await api('step', { delay: parseInt(elements.inputDelay.value) });
      if (res.error) {
        addLog(\`Step Error: \${res.error}\`, 'error');
      }

      if (res.state) {
        state = res.state;
        updateUI();
      }

      if (res.log) {
        addLog(res.log.msg, res.log.type);
        if (res.log.type === 'error' && Notification.permission === 'granted') {
          new Notification('Device Bot - Critical Error', { body: res.log.msg });
        }
      }

      if (state.status === 'running') {
        const d = parseInt(elements.inputDelay.value) || 1000;
        setTimeout(step, d);
      }
    }

    elements.btnStart.onclick = async () => {
      const res = await api('start', { delay: parseInt(elements.inputDelay.value) });
      if (res.success) {
        state.status = 'running';
        updateUI();
        step();
      }
    };

    elements.btnPause.onclick = async () => {
      const res = await api('pause');
      if (res.success) {
        state.status = 'paused';
        updateUI();
      }
    };

    elements.btnStop.onclick = async () => {
      if (!confirm('Are you sure you want to stop and reset ALL progress?')) return;
      const res = await api('stop');
      if (res.success) {
        state.status = 'stopped';
        state.currentIndex = 0;
        state.successCount = 0;
        state.failCount = 0;
        updateUI();
        addLog('Bot stopped and reset.', 'warn');
      }
    };

    elements.btnClearLogs.onclick = () => {
      elements.terminal.innerHTML = '';
    };

    elements.btnViewFails.onclick = async () => {
      const res = await api('get_failures');
      if (res.fails) {
        const list = Object.entries(res.fails)
          .map(([model, data]) => \`\${model}: \${data.count} fails (Last: \${data.errors.slice(-1)})\`)
          .join('\\n');
        alert(list || 'No failures recorded.');
      }
    };

    // Initialize
    syncState();

    // Browser Notification Setup
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  </script>
</body>
</html>
`;

const getPasswordPrompt = (error?: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Device Bot - Authentication</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f4f4f5; }
    form { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); width: 100%; max-width: 360px; }
    h1 { margin: 0 0 0.5rem 0; font-size: 1.25rem; font-weight: 600; text-align: center; }
    p { color: #6b7280; font-size: 0.875rem; text-align: center; margin-bottom: 1.5rem; }
    input { width: 100%; padding: 0.75rem; margin-bottom: 1rem; border: 1px solid #d1d5db; border-radius: 6px; box-sizing: border-box; font-size: 1rem; }
    button { width: 100%; padding: 0.75rem; background: #000; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 1rem; transition: background 0.2s; }
    button:hover { background: #1f2937; }
    .error { color: #ef4444; font-size: 0.875rem; margin-bottom: 1rem; text-align: center; background: #fef2f2; padding: 0.5rem; border-radius: 4px; border: 1px solid #fee2e2; }
  </style>
</head>
<body>
  <form method="POST">
    <h1>Device Bot</h1>
    <p>Authentication required to access the bot controller.</p>
    ${error ? `<div class="error">${error}</div>` : ''}
    <input type="password" name="pw" placeholder="Enter password" required autofocus>
    <button type="submit">Unlock Dashboard</button>
  </form>
</body>
</html>
`;

/**
 * Main Handler
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Explicitly catch missing environment variables before executing
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN || !process.env.SYNC_PASSWORD) {
    return res.status(500).json({
      error: "Missing Required Environment Variables",
      details: "Please add UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, and SYNC_PASSWORD to your environment settings."
    });
  }

  const redis = Redis.fromEnv();
  const SYNC_PASSWORD = process.env.SYNC_PASSWORD || '';
  const isLocal = process.env.NODE_ENV === 'development';
  const ip = (req.headers['x-forwarded-for'] as string || '').split(',')[0].trim() || 'unknown';

  // 1. Auth Logic (Same as sync-devices but adapted for JSON API)
  const providedPw = req.method === 'POST' ? req.body?.pw : req.query?.pw;
  let authenticated = isLocal || (providedPw && crypto.timingSafeEqual(Buffer.from(String(providedPw)), Buffer.from(SYNC_PASSWORD)));

  if (!authenticated) {
    if (req.method === 'POST' && req.body?.action) return res.status(401).json({ error: 'Unauthorized' });
    if (providedPw) return res.status(401).send(getPasswordPrompt('Invalid password.'));
    return res.status(401).send(getPasswordPrompt());
  }

  // 2. Dashboard Rendering
  if (req.method === 'GET' || (req.method === 'POST' && !req.body.action)) {
    return res.status(200).send(getDashboardUI(String(providedPw || '')));
  }

  // 3. Bot API Actions
  const action = req.body.action;

  try {
    const STATE_KEY = 'bot:state';
    const LOGS_KEY = 'bot:logs';
    const QUEUE_KEY = 'bot:queue';
    const FAILURES_KEY = 'bot:failures';

    const getState = async () => {
      const s = await redis.get(STATE_KEY);
      return (s as any) || { status: 'stopped', currentIndex: 0, total: 0, successCount: 0, failCount: 0, delay: 1000 };
    };

    const addLog = async (msg: string, type: 'info' | 'error' | 'success' | 'warn' = 'info') => {
      const log = JSON.stringify({ msg, type, ts: Date.now() });
      await redis.lpush(LOGS_KEY, log);
      await redis.ltrim(LOGS_KEY, 0, 499);
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
        // Initialize Queue
        await addLog('Initializing device queue from source...', 'info');
        try {
          const sourceUrl = 'https://raw.githubusercontent.com/pbakondy/android-device-list/master/devices.json';
          const response = await fetch(sourceUrl);
          if (!response.ok) throw new Error(`Failed to fetch source: ${response.statusText}`);
          const devices = await response.json();

          // Use a Set to unique models/names
          const uniqueModels = new Set<string>();
          for (const d of devices) {
            if (d.model) uniqueModels.add(d.model.trim());
            if (d.name) uniqueModels.add(d.name.trim());
          }

          const models = Array.from(uniqueModels).filter(m => m.length > 1);
          await redis.del(QUEUE_KEY);

          // Use a pipeline for significantly faster queue initialization
          const pipeline = redis.pipeline();
          const chunkSize = 2000;
          for (let i = 0; i < models.length; i += chunkSize) {
            pipeline.rpush(QUEUE_KEY, ...models.slice(i, i + chunkSize));
          }
          await pipeline.exec();

          state = {
            status: 'running',
            currentIndex: 0,
            total: models.length,
            successCount: 0,
            failCount: 0,
            delay: req.body.delay || 1000
          };
          await addLog(`Queue initialized with ${models.length} devices.`, 'success');
        } catch (initErr: any) {
          await addLog(`Queue Initialization Failed: ${initErr.message}`, 'error');
          return res.status(500).json({ error: 'Failed to initialize device list', details: initErr.message });
        }
      } else {
        state.status = 'running';
        await addLog('Bot resumed.', 'info');
      }
      await redis.set(STATE_KEY, state);
      return res.status(200).json({ success: true, state });
    }

    if (action === 'pause') {
      const state = await getState();
      state.status = 'paused';
      await redis.set(STATE_KEY, state);
      await addLog('Bot paused.', 'warn');
      return res.status(200).json({ success: true });
    }

    if (action === 'stop') {
      await redis.del(STATE_KEY, QUEUE_KEY, LOGS_KEY, FAILURES_KEY);
      return res.status(200).json({ success: true });
    }

    if (action === 'step') {
      const state = await getState();
      if (state.status !== 'running') return res.status(400).json({ error: 'Bot is not running' });

      // Get next item from queue
      const model = await redis.lindex(QUEUE_KEY, state.currentIndex);
      if (!model) {
        state.status = 'stopped';
        await redis.set(STATE_KEY, state);
        const finishLog = await addLog('All devices processed!', 'success');
        return res.status(200).json({ state, log: finishLog });
      }

      // Execute Specs Sync
      try {
        let baseUrl = 'http://localhost:3000';
        if (process.env.VERCEL_URL) {
          baseUrl = `https://${process.env.VERCEL_URL}`;
        }
        // req.headers.host is the most reliable for the active domain
        if (req.headers.host) {
          const protocol = req.headers.host.includes('localhost') ? 'http' : 'https';
          baseUrl = `${protocol}://${req.headers.host}`;
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        try {
          const specRes = await fetch(`${baseUrl}/api/specs?model=${encodeURIComponent(String(model))}`, {
            signal: controller.signal
          });

          if (specRes.ok) {
            state.successCount++;
            const log = await addLog(`Processed: ${model}`, 'success');
            state.currentIndex++;
            await redis.set(STATE_KEY, state);
            return res.status(200).json({ state, log });
          } else {
            const errData = await specRes.json().catch(() => ({}));
            throw new Error(errData.error || `HTTP ${specRes.status}`);
          }
        } finally {
          clearTimeout(timeout);
        }
      } catch (e: any) {
        state.failCount++;

        // Failure tracking
        const failInfo: any = (await redis.hget(FAILURES_KEY, String(model))) || { count: 0, errors: [] };
        failInfo.count++;
        failInfo.errors.push(e.message);
        failInfo.lastAttempt = Date.now();
        await redis.hset(FAILURES_KEY, { [String(model)]: failInfo });

        const logType = failInfo.count >= 20 ? 'error' : 'warn';
        const msg = failInfo.count >= 20
          ? `CRITICAL FAIL (${failInfo.count}): ${model} - ${e.message}`
          : `Failed: ${model} (Try ${failInfo.count}) - ${e.message}`;

        const log = await addLog(msg, logType as any);

        // Skip to next after log
        state.currentIndex++;
        await redis.set(STATE_KEY, state);

        return res.status(200).json({ state, log });
      }
    }

    return res.status(400).json({ error: 'Unknown action' });

  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
