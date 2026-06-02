#!/usr/bin/env node
const { spawnSync } = require('child_process');
const os = require('os');
const isWindows = os.platform() === 'win32';
const ALLOWED_COMMANDS = new Set(['node', 'npm', 'pnpm', 'yarn', 'vercel']);
function log(msg) { console.error(msg); }
function commandExists(cmd) {
  if (!ALLOWED_COMMANDS.has(cmd)) throw new Error(`Command not in whitelist: ${cmd}`);
  try {
    if (isWindows) { const r = spawnSync('where', [cmd], { stdio: 'ignore' }); return r.status === 0; }
    else { const r = spawnSync('sh', ['-c', `command -v "$1"`, '--', cmd], { stdio: 'ignore' }); return r.status === 0; }
  } catch { return false; }
}
function getCommandOutput(cmd, args) {
  try {
    const r = spawnSync(cmd, args, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'], shell: isWindows });
    return r.status === 0 ? (r.stdout || '').trim() : null;
  } catch { return null; }
}
function checkNode() {
  if (!commandExists('node')) { log('Error: Node.js not installed'); process.exit(1); }
  log(`Node.js: ${getCommandOutput('node', ['-v'])}`);
}
function checkVercel() {
  if (commandExists('vercel')) { log(`Vercel CLI: ${getCommandOutput('vercel', ['--version']) || 'unknown'}`); return true; }
  return false;
}
function detectPackageManager() {
  if (commandExists('pnpm')) return 'pnpm';
  if (commandExists('yarn')) return 'yarn';
  if (commandExists('npm')) return 'npm';
  return null;
}
function installVercel(pm) {
  log(`Installing Vercel CLI via ${pm}...`);
  const cmds = { pnpm: ['pnpm', ['add', '-g', 'vercel']], yarn: ['yarn', ['global', 'add', 'vercel']], npm: ['npm', ['install', '-g', 'vercel']] };
  const [c, a] = cmds[pm];
  const r = spawnSync(c, a, { stdio: 'inherit', shell: isWindows });
  if (r.status !== 0) { log('Installation failed'); process.exit(1); }
}
function main() {
  log('=== Vercel CLI Install ===');
  checkNode();
  if (checkVercel()) { log('Already installed.'); console.log(JSON.stringify({ status: 'already_installed' })); process.exit(0); }
  const pm = detectPackageManager();
  if (!pm) { log('No package manager found'); process.exit(1); }
  installVercel(pm);
  if (checkVercel()) { log('Installed successfully!'); console.log(JSON.stringify({ status: 'success' })); }
  else { log('Install failed - vercel not found after install'); process.exit(1); }
}
main();
