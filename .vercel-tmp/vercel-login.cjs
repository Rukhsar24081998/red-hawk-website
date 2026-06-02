#!/usr/bin/env node
const { spawnSync, spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const isWindows = os.platform() === 'win32';
const VERCEL = path.join(__dirname, 'node_modules', '.bin', 'vercel');
const LOG_FILE = path.join(__dirname, 'login.log');

function log(msg) { console.error(msg); }

function checkLoginStatus() {
  try {
    const r = spawnSync(VERCEL, ['whoami'], { encoding: 'utf8', stdio: ['pipe','pipe','pipe'] });
    const out = (r.stdout || '').trim();
    if (r.status === 0 && out && !out.includes('Error')) { log(`Already logged in as: ${out}`); return true; }
  } catch {}
  return false;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function waitForUrl() {
  for (let i = 0; i < 40; i++) {
    await sleep(500);
    try {
      if (fs.existsSync(LOG_FILE)) {
        const c = fs.readFileSync(LOG_FILE, 'utf8');
        const m = c.match(/https:\/\/vercel\.com\/oauth\/device\?user_code=[A-Z0-9-]+/);
        if (m) return m[0];
      }
    } catch {}
  }
  return null;
}

function openBrowser(url) {
  try {
    if (os.platform() === 'darwin') spawnSync('open', [url], { stdio: 'ignore' });
    else if (os.platform() === 'win32') spawnSync('powershell', ['-Command', `Start-Process '${url}'`], { stdio: 'ignore' });
    else spawnSync('xdg-open', [url], { stdio: 'ignore' });
  } catch {}
}

async function main() {
  log('=== Vercel Login ===');
  if (checkLoginStatus()) {
    console.log(JSON.stringify({ status: 'already_logged_in' }));
    process.exit(0);
  }
  log('Starting login...');
  const logStream = fs.openSync(LOG_FILE, 'w');
  const child = spawn(VERCEL, ['login'], { detached: true, stdio: ['ignore', logStream, logStream] });
  child.unref();
  log(`Login process started (PID: ${child.pid})`);
  const url = await waitForUrl();
  if (url) {
    log(`Authorization URL: ${url}`);
    openBrowser(url);
    console.log(JSON.stringify({ status: 'needs_auth', auth_url: url }));
  } else {
    log('Could not get auth URL. Log:');
    try { log(fs.readFileSync(LOG_FILE, 'utf8')); } catch {}
    process.exit(1);
  }
}
main();
