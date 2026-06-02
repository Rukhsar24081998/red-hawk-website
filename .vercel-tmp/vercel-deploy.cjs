#!/usr/bin/env node
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const isWindows = process.platform === 'win32';
const VERCEL = path.join(__dirname, 'node_modules', '.bin', 'vercel');

function log(msg) { console.error(msg); }

function checkLogin() {
  const r = spawnSync(VERCEL, ['whoami'], { encoding: 'utf8', stdio: ['pipe','pipe','pipe'] });
  const out = (r.stdout || '').trim();
  if (r.status === 0 && out) { log(`Logged in as: ${out}`); return true; }
  log('Not logged in!'); return false;
}

function deploy(projectPath) {
  log('');
  log('=== Deploying to Vercel Production ===');
  log('');
  const r = spawnSync(VERCEL, ['--prod', '--yes'], {
    cwd: projectPath,
    encoding: 'utf8',
    stdio: ['inherit', 'pipe', 'pipe'],
    timeout: 300000
  });
  const output = (r.stdout || '') + (r.stderr || '');
  log(output);
  if (r.status !== 0) { log('Deployment failed!'); process.exit(1); }

  // Extract URL
  const aliased = output.match(/Aliased:\s*(https:\/\/[^\s]+)/i);
  const production = output.match(/Production:\s*(https:\/\/[^\s]+)/i);
  const inspect = output.match(/Inspect:\s*(https:\/\/[^\s]+)/i);
  const anyUrl = output.match(/(https:\/\/[a-zA-Z0-9-]+\.vercel\.app)/);
  const url = (aliased && aliased[1]) || (production && production[1]) || (anyUrl && anyUrl[1]);

  log('');
  log('=== Deployment Successful! ===');
  if (url) log(`Live URL: ${url}`);
  console.log(JSON.stringify({ status: 'success', url: url || null, raw: output.slice(0,500) }));
}

function main() {
  const projectPath = path.resolve(__dirname, '..');
  log(`Project: ${projectPath}`);
  if (!checkLogin()) process.exit(1);
  deploy(projectPath);
}
main();
