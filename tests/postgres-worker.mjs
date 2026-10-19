import { getStore,limit,consumeOAuthState } from '../src/lib/booking/store.mjs';
import { getAuth,requireAdmin } from '../src/lib/booking/auth.mjs';
import { book,recover } from '../src/lib/booking/service.mjs';
import { calendar } from '../src/lib/booking/calendar.mjs';
const db=getStore(),cal=calendar(db);
process.send?.({ready:true});
process.on('message',async msg=>{
 try {
  if(msg.crash==='pending')cal.get=async()=>process.exit(71);
  if(msg.crash==='inserted'){const insert=cal.insert.bind(cal);cal.insert=async(e,gate)=>{await insert(e,gate);process.exit(72);};}
  if(msg.action==='oauth') {process.send?.({ok:true,result:Boolean(await consumeOAuthState(db,msg.hash,msg.session))});return;}
  if(msg.action==='login'){const r=await getAuth().api.signInEmail({body:{email:msg.email,password:msg.password},asResponse:true});process.send?.({ok:true,result:{status:r.status,cookie:r.headers.get('set-cookie')}});return;}
  if(msg.action==='session'){const s=await requireAdmin(new Headers({cookie:msg.cookie}));process.send?.({ok:true,result:{userId:s.user.id}});return;}
  const result=msg.action==='recover'?await recover(db,cal,{max:100,budgetMs:60000}):msg.action==='limit'?await limit(db,msg.key,msg.max):await book(db,cal,msg.input,msg.now);
  process.send?.({ok:true,result});
 }catch(e){process.send?.({ok:false,status:e.status,code:e.code});}
 finally{await db.end();process.disconnect();}
});
