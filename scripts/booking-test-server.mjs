import { spawn } from 'node:child_process';
process.argv.push('--synthetic','--admin');
await import('./booking-setup.mjs');
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3111'],{stdio:'inherit',env:{...process.env,NEXT_TELEMETRY_DISABLED:'1'},windowsHide:true});
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>{child.kill(signal);process.exit();});
child.on('exit',code=>process.exit(code ?? 1));
