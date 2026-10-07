// Bounded local test harness. Creates a new cluster, runs tests, stops only its child.
import { spawn } from 'node:child_process';
import { mkdtemp, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import pg from 'pg';
const root=process.env.PAPERCLIP_RUN_SCRATCH_DIR || process.env.BOOKING_TEST_SCRATCH_DIR;
const bin=process.env.BOOKING_TEST_PG_BIN;
if(!root || !bin)throw new Error('Explicit scratch directory and BOOKING_TEST_PG_BIN are required.');
const folder=await mkdtemp(join(resolve(root),'age19-pg-'));
const executable=name=>join(bin,`${name}${process.platform==='win32'?'.exe':''}`);
async function command(file,args,env=process.env){return new Promise((resolve,reject)=>{
 const p=spawn(file,args,{env,stdio:'inherit',windowsHide:true});p.once('error',reject);p.once('exit',c=>c===0?resolve():reject(new Error(`Test command exited ${c}`)));
});}
await command(executable('initdb'),['-D',folder,'-U','postgres','-A','trust','--encoding=UTF8','--locale=C']);
const server=spawn(executable('postgres'),['-D',folder,'-h','127.0.0.1','-p','55419'],{stdio:['ignore','ignore','pipe'],windowsHide:true});
server.stderr.on('data',()=>{});
let stopped=false,serverError;
server.once('error',e=>{serverError=e;});server.once('exit',()=>{stopped=true;});
const url='postgresql://postgres@127.0.0.1:55419/postgres';
try {
 let ready=false;
 for(let i=0;i<40;i++){
  if(serverError || stopped)throw new Error('Isolated PostgreSQL could not start; do not reuse another server.');
  const client=new pg.Client({connectionString:url,connectionTimeoutMillis:500});
  try{await client.connect();const r=await client.query('SHOW data_directory');if(resolve(r.rows[0].data_directory)!==resolve(folder))throw new Error('Port belongs to another cluster.');ready=true;}
  catch(e){if(e.message==='Port belongs to another cluster.')throw e;}
  finally{await client.end().catch(()=>{});}
  if(ready)break;await new Promise(r=>setTimeout(r,250));
 }
 if(!ready)throw new Error('Isolated PostgreSQL readiness failed.');
 const tests=(await readdir('tests')).filter(f=>f.endsWith('.test.mjs')).map(f=>join('tests',f));
 const env={...process.env,BOOKING_TEST_DATABASE_URL:url};
 delete env.DATABASE_URL;delete env.BOOKING_SYNTHETIC_DATABASE_URL;
 await command(process.execPath,['--test',...tests],env);
} finally {
 // Fast shutdown rolls back this synthetic cluster only, no deletion or shared service control.
 if(!stopped)await command(executable('pg_ctl'),['-D',folder,'-m','fast','-w','stop']);
}
