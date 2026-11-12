export const STORAGE_KEY='hajribanao:v1';
export const MAX_EMPLOYEES=500;
export const MAX_ATTENDANCE=35000;
export const MAX_PAYMENTS=15000;
export const MAX_BACKUP_BYTES=5*1024*1024;
export const CURRENCIES=['PKR','INR','USD'];
const validId = id => typeof id==='string'&&/^[a-zA-Z0-9_-]{5,80}$/.test(id);
const str = (s,max=150) => typeof s==='string'&&s.trim().length<=max;
const nonNegativeInt = (n,max=1000000000000) => Number.isSafeInteger(n)&&n>=0&&n<=max;
const dateOK = s => {if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(s+'T00:00:00Z');return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===s&&s>='2000-01-01'&&s<='2100-12-31';};
export const monthOK = m => typeof m==='string'&&/^\d{4}-(0[1-9]|1[0-2])$/.test(m)&&m>='2000-01'&&m<='2100-12';
export const getMonth = date=>date.slice(0,7);
export const currentDate = ()=>{const d=new Date(),yy=d.getFullYear(),mm=String(d.getMonth()+1).padStart(2,'0'),dd=String(d.getDate()).padStart(2,'0');return `${yy}-${mm}-${dd}`;};
export const uid=()=>{if(globalThis.crypto?.randomUUID)return 'i'+crypto.randomUUID().replaceAll('-','');return 'i'+Date.now().toString(36)+Math.random().toString(36).slice(2,14);};
export const freshState=()=>({version:1,revision:0,settings:{business:'My Business',currency:'PKR',workDays:26,theme:'light',lang:'en'},employees:[],attendance:[],payments:[]});
const fail=m=>{throw new Error(m)};
export function validateState(state){
 if(!state||typeof state!=='object'||Array.isArray(state)||state.version!==1||!Number.isSafeInteger(state.revision)||state.revision<0)fail('Invalid app data version.');
 const z=state.settings;
 if(!z||!str(z.business,100)||!z.business.trim()||!CURRENCIES.includes(z.currency)||!Number.isInteger(z.workDays)||z.workDays<1||z.workDays>31||!['light','dark'].includes(z.theme)||!['en','ur'].includes(z.lang))fail('Invalid app settings.');
 if(!Array.isArray(state.employees)||state.employees.length>MAX_EMPLOYEES||!Array.isArray(state.attendance)||state.attendance.length>MAX_ATTENDANCE||!Array.isArray(state.payments)||state.payments.length>MAX_PAYMENTS)fail('Too many records or missing data.');
 const employeeIds=new Set(),attendanceIds=new Set(),paymentIds=new Set(),seenDays=new Set();
 const employees=state.employees.map(x=>{if(!x||!validId(x.id)||employeeIds.has(x.id)||!str(x.name,100)||!x.name.trim()||!str(x.role,70)||!str(x.phone,40)||!nonNegativeInt(x.salaryCents)||!dateOK(x.joinedAt)||typeof x.active!=='boolean')fail('Invalid employee record.');employeeIds.add(x.id);return {id:x.id,name:x.name.trim(),role:x.role.trim(),phone:x.phone.trim(),salaryCents:x.salaryCents,joinedAt:x.joinedAt,active:x.active};});
 const attendance=state.attendance.map(x=>{if(!x||!validId(x.id)||attendanceIds.has(x.id)||!employeeIds.has(x.employeeId)||!dateOK(x.date)||!['present','absent','leave'].includes(x.status))fail('Invalid attendance record.');const pair=x.employeeId+'|'+x.date;if(seenDays.has(pair))fail('Duplicate daily attendance.');seenDays.add(pair);attendanceIds.add(x.id);return {id:x.id,employeeId:x.employeeId,date:x.date,status:x.status};});
 const payments=state.payments.map(x=>{if(!x||!validId(x.id)||paymentIds.has(x.id)||!employeeIds.has(x.employeeId)||!dateOK(x.date)||!monthOK(x.month)||!['advance','salary'].includes(x.kind)||!nonNegativeInt(x.amountCents)||x.amountCents===0||!str(x.note,300))fail('Invalid salary payment.');paymentIds.add(x.id);return {id:x.id,employeeId:x.employeeId,date:x.date,month:x.month,kind:x.kind,amountCents:x.amountCents,note:x.note.trim()};});
 return {version:1,revision:state.revision,settings:{business:z.business.trim(),currency:z.currency,workDays:z.workDays,theme:z.theme,lang:z.lang},employees,attendance,payments};
}
export function parseMoney(value){const s=String(value).trim();if(!/^(?:\d{1,10})(?:\.\d{1,2})?$/.test(s))throw new Error('Enter a valid non-negative amount with up to 2 decimals.');const [whole,cents='']=s.split('.');const total=Number(whole)*100+Number(cents.padEnd(2,'0'));if(!nonNegativeInt(total))throw new Error('Amount too large.');return total;}
export const moneyInput=cents=>(cents/100).toFixed(2);
export function monthlySummary(state,employeeId,month){
 if(!monthOK(month))throw new Error('Invalid month.');const employee=state.employees.find(x=>x.id===employeeId);if(!employee)throw new Error('Employee not found.');
 let present=0,absent=0,leave=0;
 for(const a of state.attendance)if(a.employeeId===employeeId&&getMonth(a.date)===month){if(a.status==='present')present++;else if(a.status==='absent')absent++;else leave++;}
 const daysInMonth=new Date(Number(month.slice(0,4)),Number(month.slice(5,7)),0).getDate();
 const recorded=present+absent+leave,unmarked=Math.max(0,daysInMonth-recorded);
 const paidDays=Math.min(present+leave,state.settings.workDays);
 const earnedCents=Math.round(employee.salaryCents*paidDays/state.settings.workDays);
 const monthPayments=state.payments.filter(p=>p.employeeId===employeeId&&p.month===month);
 const advanceCents=monthPayments.filter(p=>p.kind==='advance').reduce((s,p)=>s+p.amountCents,0);
 const paidCents=monthPayments.filter(p=>p.kind==='salary').reduce((s,p)=>s+p.amountCents,0);
 return {employee,present,absent,leave,recorded,unmarked,paidDays,daysInMonth,earnedCents,advanceCents,paidCents,balanceCents:earnedCents-advanceCents-paidCents};
}
export function dailyStats(state,date){if(!dateOK(date))throw new Error('Invalid date.');const entries=state.attendance.filter(a=>a.date===date),active=state.employees.filter(e=>e.active&&e.joinedAt<=date);return {active:active.length,present:entries.filter(a=>a.status==='present'&&active.some(e=>e.id===a.employeeId)).length,absent:entries.filter(a=>a.status==='absent'&&active.some(e=>e.id===a.employeeId)).length,leave:entries.filter(a=>a.status==='leave'&&active.some(e=>e.id===a.employeeId)).length};}
const csvCell=value=>{let s=String(value??'');if(/^[\s]*[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
export const makeCSV=(rows)=>'\uFEFF'+rows.map(row=>row.map(csvCell).join(',')).join('\r\n')+'\r\n';
export const employeesCSV=s=>makeCSV([['Name','Role','Phone','Monthly Salary','Joined','Active'],...s.employees.map(e=>[e.name,e.role,e.phone,moneyInput(e.salaryCents),e.joinedAt,e.active?'Yes':'No'])]);
export const attendanceCSV=s=>makeCSV([['Date','Employee','Status'],...s.attendance.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(a=>[a.date,s.employees.find(e=>e.id===a.employeeId)?.name||'',a.status])]);
export const paymentsCSV=s=>makeCSV([['Date','Salary Month','Employee','Type','Amount','Note'],...s.payments.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(p=>[p.date,p.month,s.employees.find(e=>e.id===p.employeeId)?.name||'',p.kind,moneyInput(p.amountCents),p.note])]);
export const reportCSV=(s,month)=>makeCSV([['Employee','Present','Absent','Paid Leave','Earned','Advances','Salary Paid','Balance'],...s.employees.map(e=>{const m=monthlySummary(s,e.id,month);return [e.name,m.present,m.absent,m.leave,moneyInput(m.earnedCents),moneyInput(m.advanceCents),moneyInput(m.paidCents),moneyInput(m.balanceCents)];})]);
