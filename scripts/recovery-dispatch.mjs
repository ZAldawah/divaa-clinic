// One-shot operator/approved scheduler command. Does not install a timer or send messages.
const origin=new URL(process.env.BOOKING_RECOVERY_ORIGIN || 'http://127.0.0.1:3119');
const secret=process.env.BOOKING_JOB_SECRET;
if(origin.username || origin.password || origin.pathname!=='/' || origin.search || origin.hash ||
  (origin.protocol!=='https:' && !(origin.protocol==='http:' && origin.hostname==='127.0.0.1')))throw new Error('Exact HTTPS origin or loopback HTTP origin required.');
if(!secret || secret.length<32)throw new Error('Inject the recovery credential securely.');
let last,visited=0;
try {
 for(let i=0;i<6;i++){
  const response=await fetch(new URL('/api/internal/recover',origin),{method:'POST',redirect:'error',headers:{Authorization:`Bearer ${secret}`},signal:AbortSignal.timeout(125000)});
  if(!response.ok)throw new Error('Recovery rejected or unavailable.');
  last=await response.json();
  if(!Number.isSafeInteger(last.visited) || !Number.isSafeInteger(last.health?.due) || !Number.isSafeInteger(last.health?.unresolved))throw new Error('Invalid recovery response.');
  visited+=last.visited;
  if(last.health.due===0 || last.visited===0)break;
 }
 console.log(JSON.stringify({visited,health:last.health,attention:last.health.due>0 || last.health.unresolved>0}));
 if(last.health.due>0 || last.health.unresolved>0)process.exitCode=2;
}catch{console.error('Recovery failed; operator attention required. No uncertain hold was released.');process.exitCode=1;}
