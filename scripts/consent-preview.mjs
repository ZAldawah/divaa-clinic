// Operator-managed local interface preview. Never uses Google's transport.
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cwd = fileURLToPath(new URL('../', import.meta.url));
const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '--hostname', '127.0.0.1', '--port', '3014'], {
  cwd,
  env: { ...process.env, NEXT_PUBLIC_ANALYTICS_ENABLED: 'true', NEXT_PUBLIC_ANALYTICS_PREVIEW: 'true' },
  stdio: 'inherit',
  windowsHide: true,
});
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => child.kill(signal));
