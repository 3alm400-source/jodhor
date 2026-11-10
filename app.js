
const LOGO=`<img alt="" style="width:100%;height:100%;object-fit:contain" src="logo.png" onerror="this.outerHTML=LOGO0">`;const LOGO0=`<svg viewBox="0 0 100 100"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7dffa0"/><stop offset="1" stop-color="#1f9d45"/></linearGradient></defs><circle cx="50" cy="50" r="47" fill="#111" stroke="#c9ccd3" stroke-width="2"/><path d="M50 68V44" stroke="#d9e36a" stroke-width="3" stroke-linecap="round"/><path d="M50 46C36 46 28 38 28 30c10 0 20 4 22 16z" fill="url(#lg)"/><path d="M50 46c14 0 22-8 22-16-10 0-20 4-22 16z" fill="url(#lg)"/><path d="M50 68c-4 6-10 8-14 14M50 68c0 7-2 11-3 16M50 68c4 6 10 8 14 14" stroke="#f1f1f1" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;
const $=s=>document.querySelector(s), E=(t,h)=>{const e=document.createElement(t);e.innerHTML=h||'';return e};
const toast=m=>{const t=$('#toast');t.textContent=m;t.style.display='block';setTimeout(()=>t.style.display='none',2000)};
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* ===== AES-256-GCM + PBKDF2 ===== */
const enc=new TextEncoder(),dec=new TextDecoder();
const b64=b=>btoa(String.fromCharCode(...new Uint8Array(b))),ub=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function key(p,salt){const k=await crypto.subtle.importKey('raw',enc.encode(p),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:200000,hash:'SHA-256'},k,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
async function seal(txt,p){const s=crypto.getRandomValues(new Uint8Array(16)),i=crypto.getRandomValues(new Uint8Array(12));const c=await crypto.subtle.encrypt({name:'AES-GCM',iv:i},await key(p,s),enc.encode(txt));return{s:b64(s),i:b64(i),c:b64(c)}}
async function open_(o,p){return dec.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:ub(o.i)},await key(p,ub(o.s)),ub(o.c)))}
const LS={get:k=>{try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
let U=null,PW=null,DB=null;
const save=async()=>{const v=LS.get('u:'+U);v.d=await seal(JSON.stringify(DB),PW);LS.set('u:'+U,v)};
const T=n=>DB.t[n]||(DB.t[n]=[]);
/* ===== Domain config ===== */
const GEST={'ماعز':{m:5},'نعاج':{m:5},'أبقار':{m:9,d:10},'أبل':{m:13},'أرانب':{d:30},'دجاج':{d:21},'دجاج (ديك رومي/بط)':{d:28}};
const FEEDKG={'ماعز':1.5,'نعاج':1.5,'أبقار':8,'أبل':6,'دجاج':.12,'أرانب':.15,'دجاج (ديك رومي/بط)':.15};
const ANIM=Object.keys(GEST);
const fmtD=d=>d.toISOString().slice(0,10);
const birthOf=(s,type,off=0)=>{const g=GEST[type];if(!s||!g)return '';const x=new Date(s+'T00:00:00Z');x.setUTCMonth(x.getUTCMonth()+(g.m||0));x.setUTCDate(x.getUTCDate()+(g.d||0)+off);return fmtD(x)};
const idFromDate=s=>s?s.split('-').reverse().join(''):'';
const SHOPS=['ملابس','بقالة','مغازة','بناء','جزار','نجار','حداد','كهربائي','ميكانيكي','صيدلية'];
const PFX={'ملابس':'00','بقالة':'01','مغازة':'11','بناء':'11','جزار':'01','نجار':'11','حداد':'11','كهربائي':'11','ميكانيكي':'11','صيدلية':'11','مستندات':'10'};
const LIGHTS={green:['أخضر','موجود في المخزن','#58d46a'],white:['أبيض','تم فرزها','#fff'],red:['أحمر','خارج المخزن','#ff5a5a'],blue:['أزرق','سلعة مفروزة','#4ea1ff'],rg:['أحمر+أخضر','شحن مباشر بدون فرز','#e8d44d'],br:['أزرق+أحمر','مفروشة','#b86bff']};
const lamp=k=>{const l=LIGHTS[k];return l?`<span class="dot" style="background:${l[2]};color:${l[2]}"></span>${l[0]}`:''};
const F=(k,l,t='text',o)=>({k,l,t,o});
const TABLES={
 animals:{ico:'🐐',name:'الحيوانات',f:[F('type','النوع','select',ANIM),F('tag','الاسم/العلامة'),F('mate','تاريخ التلقيح (يحسب الولادة تلقائيا)','date'),F('born','تاريخ الميلاد = المعرّف الوحيد','date'),F('qty','العدد','number')],
  auto:(r,all)=>{const b=idFromDate(r.born),n=all.filter(x=>x.born==r.born).length;return{id:n?b+'-'+(n+1):b}},
  cols:[['البطاقة',r=>`<b>${esc(r.id)}</b>`],['العلف اليومي (كغ)',r=>((FEEDKG[r.type]||1)*(+r.qty||1)).toFixed(1)]]},
 feed:{ico:'🌾',name:'العلف',f:[F('type','النوع','select',['قمح','شعير','ذرة']),F('kg','الكمية (كغ)','number'),F('date','التاريخ','date')]},
 food:{ico:'🥬',name:'الاستهلاك',f:[F('type','المنتج','select',['معدنوس','فجل','بطاطا','طماطم','فلفل','بصل','سلق','بسباس']),F('other','اسم آخر (اختياري)'),F('kg','الكمية','number'),F('date','التاريخ','date')]},
 mating:{ico:'📅',name:'التلقيح والولادة',f:[F('type','النوع','select',ANIM),F('tag','الحيوان/البطاقة'),F('date','تاريخ التلقيح','date')],
  cols:[['الولادة المتوقعة',r=>`<b>${birthOf(r.date,r.type)}</b>`],['نافذة (-3 / +3 أيام)',r=>r.date?birthOf(r.date,r.type,-3)+' ← '+birthOf(r.date,r.type,3):'']]},
 shop:{ico:'🏪',name:'المتاجر',f:[F('shop','المتجر','select',SHOPS),F('name','اسم المنتج'),F('place','المكان في المتجر'),F('qty','الكمية','number')],
  auto:(r,all)=>({code:(PFX[r.shop]||'11')+String(all.length+1).padStart(9,'0')}),cols:[['رقم المنتج (11 رقم)',r=>`<b>${esc(r.code)}</b>`]]},
 pallets:{ico:'📦',name:'جدول الباليط',f:[F('full','الاسم الكامل'),F('short','الاسم المختصر'),F('len','الطول','number'),F('wid','العرض','number'),F('cls','الصنف','select',['صنف 1','صنف 2','صنف 3']),F('iron','حديد','select',['لون 1','لون 2','لون 3']),F('pal','رقم palette','number'),F('rep','التقرير اليومي'),F('light','الضوء','select',Object.keys(LIGHTS).map(k=>k))],
  cols:[['الحالة',r=>lamp(r.light)],['الأبعاد',r=>(r.len||0)+'×'+(r.wid||0)]]},
 contacts:{ico:'📞',name:'سجل الهواتف',f:[F('name','الاسم'),F('phone','الهاتف','tel'),F('note','ملاحظة')],cols:[['اتصال',r=>r.phone?`<a style="color:var(--gr)" href="tel:${esc(r.phone)}">☎</a>`:'']]},
};
const DOCS={'اعتراف بدين':'أنا الممضي أسفله {name}، حامل بطاقة التعريف رقم {id}، أقرّ وأعترف بأنني مدين للسيد(ة) {other} بمبلغ قدره {amt}، وألتزم بسداده في أجل أقصاه {date}.\n\nحرر في {date} — الإمضاء:',
'مطلب عمل':'إلى السيد(ة) المدير(ة)،\nالموضوع: مطلب عمل\n\nأنا الممضي أسفله {name}، حامل بطاقة التعريف رقم {id}، أتقدم إليكم بمطلب للعمل لديكم بصفة {amt}. وتفضلوا بقبول فائق الاحترام.\n\n{date} — الإمضاء:',
'توكيل':'أنا الممضي أسفله {name}، حامل بطاقة التعريف رقم {id}، أوكّل السيد(ة) {other} للقيام نيابة عني بـ {amt}.\n\n{date} — الإمضاء:',
'تصريح على الشرف':'أنا الممضي أسفله {name}، حامل بطاقة التعريف رقم {id}، أصرّح على شرفي بأن {amt}، وأتحمل كامل المسؤولية القانونية عن صحة ما ورد.\n\n{date} — الإمضاء:',
'تقرير يومي':'التقرير اليومي — {date}\nالمعد: {name}\nالمهام المنجزة: {amt}\nملاحظات: {other}',
'شهادة عمل':'نحن الموقعون أسفله نشهد بأن السيد(ة) {name}، حامل(ة) بطاقة التعريف رقم {id}، يعمل(تعمل) لدينا بصفة {amt}، وقد سُلّمت له هذه الشهادة بطلب منه لاستعمالها في ما يسمح به القانون.\n\n{city} في {date} — الإمضاء والختم:',
'وصل استلام':'أنا الممضي أسفله {name}، حامل بطاقة التعريف رقم {id}، أقرّ باستلامي من السيد(ة) {other} ما يلي: {amt}.\n\n{city} في {date} — الإمضاء:',
'طلب إجازة':'إلى السيد(ة) المدير(ة)،\nالموضوع: طلب إجازة\n\nأتشرف بأن أطلب من سيادتكم الموافقة على منحي إجازة {amt} ابتداءً من {date}. وتفضلوا بقبول فائق الاحترام.\n\nمقدم الطلب: {name} — ب.ت.و: {id}',
'استقالة':'إلى السيد(ة) {other}،\nالموضوع: تقديم استقالة\n\nأنا الممضي أسفله {name}، حامل بطاقة التعريف رقم {id}، أعلمكم برغبتي في الاستقالة من منصبي ({amt}) ابتداءً من {date}. وتفضلوا بقبول فائق الاحترام.',
'عقد بيع حيوان':'بين الممضيين أسفله: البائع {name} (ب.ت.و {id}) والمشتري {other}، تم الاتفاق على بيع: {amt}. ويقرّ المشتري بمعاينته وقبوله للمبيع، ويُسلَّم الثمن عند الإمضاء.\n\n{city} في {date}\nإمضاء البائع:                    إمضاء المشتري:'};
async function saveFile(name,data){try{const d=window.claude?await window.claude.use('downloads'):null;if(d){await d.save({filename:name,data:new Blob([data])});return}}catch(e){if(e&&e.code=='declined')return}
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data]));a.download=name;a.click()}
/* ===== Views ===== */
const app=$('#app');
function authView(mode='in'){
 app.innerHTML=`<div class="auth"><div style="width:110px;margin:auto">${LOGO}</div><h1 style="margin:10px 0">جذور</h1><p style="color:var(--mu);margin:0 0 14px">منصة الفلاحة والمخزن — مشفّرة بـ AES-256</p>
 <div class="panel" id="af">${mode=='rec'?`<div><label>اسم المستخدم</label><input id="u"></div><div><label>رمز الاستعادة</label><input id="rc"></div><button class="btn" id="go">استرجاع كلمة السر</button>`:`<div><label>اسم المستخدم</label><input id="u" autocomplete="username"></div><div><label>كلمة السر</label><input id="p" type="password" autocomplete="current-password"></div>${mode=='up'?'<div><label>رمز استعادة (يحدده المدير)</label><input id="rc"></div>':''}<button class="btn" id="go">${mode=='up'?'إنشاء حساب':'دخول'}</button>`}
 <div class="row">${mode!='in'?'<button class="btn g" data-m="in">لدي حساب</button>':'<button class="btn g" data-m="up">حساب جديد</button>'}<button class="btn g" data-m="rec">نسيت كلمة السر</button></div></div></div>`;
 app.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>authView(b.dataset.m));
 $('#go').onclick=async()=>{
  const u=$('#u').value.trim(),p=$('#p')?.value,rc=$('#rc')?.value;if(!u)return toast('أدخل اسم المستخدم');
  try{
   if(mode=='up'){if(!p||p.length<6||!rc)return toast('كلمة سر 6 أحرف على الأقل + رمز استعادة');if(LS.get('u:'+u))return toast('الاسم مستعمل');
    LS.set('u:'+u,{rec:await seal(p,rc)});U=u;PW=p;DB={t:{},set:{},links:{}};await save();home()}
   else if(mode=='rec'){const v=LS.get('u:'+u);toast('كلمة السر: '+await open_(v.rec,rc));}
   else{const v=LS.get('u:'+u);if(!v)return toast('مستخدم غير موجود');DB=JSON.parse(await open_(v.d,p));U=u;PW=p;home()}
  }catch(e){toast('بيانات غير صحيحة')}};
}
function shell(title,body,back=true){
 app.innerHTML=`<div class="top">${back?'<button class="btn g" id="bk">‹ الرئيسية</button>':''}<div style="width:32px">${LOGO}</div><b>جذور</b><div class="sp"></div><span class="badge">${esc(U)}</span><button class="btn g" id="lo">خروج</button></div><div class="wrap"><h2 style="margin:6px 0">${title}</h2>${body}</div>`;
 $('#lo').onclick=()=>{U=PW=DB=null;authView()};if(back)$('#bk').onclick=home;
}
function home(){
 const n=k=>T(k).length;
 shell('',`<div class="panel hero">${LOGO}<div><h1>أهلاً ${esc(U)}</h1><p>اليوم ${new Date().toLocaleDateString('ar-TN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p></div></div>
 <div class="panel"><div class="row"><div style="flex:3 1 200px"><label>بحث برقم المنتج / الباركود / الاسم</label><input id="q" placeholder="اكتب أو امسح الكود"></div><button class="btn" id="sq">بحث</button><button class="btn g" id="sc">📷 قراءة باركود</button><button class="btn g" id="dly">تقرير يومي</button></div><div id="vid"></div><div id="res"></div></div>
 <div class="grid">${Object.entries(TABLES).map(([k,t])=>`<div class="tile" data-t="${k}"><i>${t.ico}</i>${t.name}<br><small style="color:var(--mu)">${n(k)} سجل</small></div>`).join('')}
 <div class="tile" data-v="wh"><i>🏭</i>المخزن الكبير<br><small style="color:var(--mu)">10 Blok × 3 Line × 30</small></div>
 <div class="tile" data-v="docs"><i>📄</i>الوثائق</div><div class="tile" data-v="soc"><i>🌐</i>التواصل</div><div class="tile" data-v="inst"><i>⬇️</i>تنزيل التطبيق<br><small style="color:var(--mu)">يعمل بدون إنترنت</small></div><div class="tile" data-v="set"><i>⚙️</i>الإعدادات</div></div>
 <p class="leg" style="margin-top:14px"><span>🔒 البيانات مشفّرة محليا (AES-256-GCM)</span><span>📴 تعمل دون إنترنت بعد فتح الصفحة (تُحفظ على جهازك)</span></p>`,false);
 document.querySelectorAll('[data-t]').forEach(e=>e.onclick=()=>table(e.dataset.t));
 document.querySelectorAll('[data-v]').forEach(e=>e.onclick=()=>({wh,docs:()=>docs(),soc,set:settings}[e.dataset.v])());
 const run=()=>{const q=$('#q').value.trim().toLowerCase();if(!q)return;let h='';
  for(const[k,t]of Object.entries(TABLES))T(k).filter(r=>JSON.stringify(r).toLowerCase().includes(q)).forEach(r=>h+=`<tr><td>${t.name}</td><td>${esc(Object.values(r).filter(x=>x).slice(0,4).join(' • '))}</td></tr>`);
  $('#res').innerHTML=h?`<div class="tw"><table>${h}</table></div>`:'<p style="color:var(--mu)">لا نتيجة</p>'};
 $('#sq').onclick=run;$('#q').onkeydown=e=>e.key=='Enter'&&run();$('#dly').onclick=()=>docs('تقرير يومي');
 $('#sc').onclick=async()=>{if(!('BarcodeDetector'in window))return toast('المتصفح لا يدعم قراءة الباركود، اكتب الرقم يدويا');
  try{const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});const v=E('video');v.srcObject=s;v.setAttribute('playsinline','');v.play();$('#vid').replaceChildren(v);const bd=new BarcodeDetector();
  const tick=async()=>{if(!v.isConnected){s.getTracks().forEach(t=>t.stop());return}const c=await bd.detect(v).catch(()=>[]);if(c[0]){$('#q').value=c[0].rawValue;s.getTracks().forEach(t=>t.stop());$('#vid').innerHTML='';run()}else setTimeout(tick,400)};tick()}catch(e){toast('تعذر فتح الكاميرا')}};
}
function table(k){
 const t=TABLES[k],rows=T(k);
 shell(t.ico+' '+t.name,`<div class="panel"><div class="row">${t.f.map(f=>`<div><label>${f.l}</label>${f.t=='select'?`<select data-k="${f.k}">${f.o.map(o=>`<option value="${o}">${k=='pallets'&&f.k=='light'?LIGHTS[o][0]+' — '+LIGHTS[o][1]:o}</option>`).join('')}</select>`:`<input data-k="${f.k}" type="${f.t}">`}</div>`).join('')}<button class="btn" id="add">إضافة</button></div></div>
 <div class="row noprint"><input id="flt" placeholder="تصفية الجدول"><button class="btn g" id="csv">تصدير CSV</button></div>
 <div class="tw"><table><thead><tr>${(t.cols||[]).map(c=>`<th>${c[0]}</th>`).join('')}${t.f.map(f=>`<th>${f.l}</th>`).join('')}<th>إجراء</th></tr></thead><tbody id="tb"></tbody></table></div>`);
 const draw=()=>{const q=($('#flt').value||'').toLowerCase();$('#tb').innerHTML=rows.map((r,i)=>[r,i]).filter(([r])=>JSON.stringify(r).toLowerCase().includes(q)).map(([r,i])=>`<tr>${(t.cols||[]).map(c=>`<td>${c[1](r)}</td>`).join('')}${t.f.map(f=>`<td>${f.k=='light'&&k=='pallets'?'':esc(r[f.k])}${f.k=='light'&&k=='pallets'?lamp(r.light):''}</td>`).join('')}<td><button class="btn d" data-i="${i}">حذف</button></td></tr>`).join('')||`<tr><td colspan="20" style="color:var(--mu)">لا سجلات بعد — أضف أول سجل من الأعلى</td></tr>`;
  $('#tb').querySelectorAll('[data-i]').forEach(b=>b.onclick=async()=>{rows.splice(+b.dataset.i,1);await save();draw()})};
 $('#add').onclick=async()=>{const r={};document.querySelectorAll('.panel [data-k]').forEach(i=>r[i.dataset.k]=i.value);if(!Object.values(r).some(v=>v))return toast('املأ البيانات');
  if(k=='animals'&&!r.born&&r.mate)r.born=birthOf(r.mate,r.type);if(k=='animals'&&!r.born)return toast('تاريخ الميلاد مطلوب لبطاقة التعريف');
  Object.assign(r,t.auto?t.auto(r,rows):{});rows.push(r);await save();draw();toast('تمت الإضافة')};
 $('#flt').oninput=draw;
 if(k=='animals'){const f=()=>{const m=$('[data-k=mate]').value;if(m)$('[data-k=born]').value=birthOf(m,$('[data-k=type]').value)};['mate','type'].forEach(x=>$('[data-k='+x+']').addEventListener('input',f))}
 $('#csv').onclick=()=>{const h=t.f.map(f=>f.l).join(',');const c=rows.map(r=>t.f.map(f=>'"'+String(r[f.k]??'').replace(/"/g,'""')+'"').join(',')).join('\n');saveFile(k+'.csv','\ufeff'+h+'\n'+c)};
 draw();
}
function wh(){
 const W=DB.t.wh||(DB.t.wh={});let sel=1;
 shell('🏭 المخزن الكبير',`<div class="panel"><div class="row"><div><label>Blok</label><select id="bk2">${Array.from({length:10},(_,i)=>`<option>${i+1}</option>`).join('')}</select></div><div class="leg" style="flex:3 1 260px">${Object.values(LIGHTS).map(l=>`<span><i class="dot" style="background:${l[2]};color:${l[2]}"></i>${l[1]}</span>`).join('')}</div></div><div id="g"></div></div>`);
 const draw=()=>{let h='';for(let l=1;l<=3;l++){h+=`<h3 style="margin:10px 0 6px;font-size:14px;color:var(--sv)">Line ${l}</h3><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(44px,1fr));gap:5px">`;
  for(let p=1;p<=30;p++){const id=`${sel}-${l}-${p}`,s=W[id],c=s?LIGHTS[s][2]:'#2a2a2f';h+=`<button class="btn g" style="padding:6px 0;border-color:${c};color:${s?c:'var(--mu)'};box-shadow:${s?'0 0 8px '+c+'66':'none'}" data-id="${id}">${p}</button>`}h+='</div>'}
  $('#g').innerHTML=h;$('#g').querySelectorAll('[data-id]').forEach(b=>b.onclick=async()=>{const ks=[undefined,...Object.keys(LIGHTS)],cur=ks.indexOf(W[b.dataset.id]);const nx=ks[(cur+1)%ks.length];nx?W[b.dataset.id]=nx:delete W[b.dataset.id];await save();draw();toast(nx?LIGHTS[nx][1]:'فارغ')})};
 $('#bk2').onchange=e=>{sel=e.target.value;draw()};draw();
 $('.wrap').insertAdjacentHTML('beforeend','<p style="color:var(--mu)">المس خانة لتغيير حالتها (فارغ ← أخضر ← أبيض ← أحمر ← أزرق ← أحمر+أخضر ← أزرق+أحمر). 10 × 3 × 30 = 900 palette.</p>');
}
const TH=['كلاسيكي','فلاحي أخضر','حديث','ملكي ذهبي','فضي','بسيط','داكن','زخرفي'];
const SPECIAL=['فاتورة','بطاقة الخلاصة','بطاقة تعريف حيوان'];
function docs(pre){
 const A=T('animals');
 shell('📄 الوثائق والبطاقات',`<div class="panel noprint"><div class="row"><div><label>نوع الوثيقة</label><select id="dt">${[...Object.keys(DOCS),...SPECIAL].map(d=>`<option ${d==pre?'selected':''}>${d}</option>`).join('')}</select></div><div><label>التصميم</label><select id="th">${TH.map((t,i)=>`<option value="${i+1}">${t}</option>`).join('')}</select></div><div><label>الاسم الكامل</label><input id="n"></div><div><label>رقم بطاقة التعريف</label><input id="i"></div><div><label>الطرف الآخر / الزبون</label><input id="o"></div><div><label>المبلغ / الموضوع</label><input id="a"></div><div><label>المدينة</label><input id="c"></div><div><label>التاريخ</label><input id="d" type="date" value="${fmtD(new Date())}"></div></div><div id="ex" style="margin-top:8px"></div><div class="row" style="margin-top:10px"><button class="btn" id="mk">إنجاز الوثيقة</button><button class="btn g" id="pr">طباعة / PDF</button></div></div><div class="paper" id="pp"></div>`);
 const v=id=>esc($('#'+id)?.value||'');
 const ex=()=>{const t=$('#dt').value;$('#ex').innerHTML=t=='فاتورة'?`<label>البنود (سطر لكل بند: البيان | الكمية | السعر)</label><textarea id="it" rows="4" placeholder="خروف | 2 | 450&#10;علف شعير | 10 | 1.2"></textarea><label style="margin-top:6px">الضريبة %</label><input id="tx" type="number" value="0">`:t=='بطاقة تعريف حيوان'?`<label>اختر الحيوان</label><select id="an">${A.map((r,i)=>`<option value="${i}">${esc(r.id)} — ${esc(r.type)} ${esc(r.tag)}</option>`).join('')||'<option>لا حيوانات مسجلة</option>'}</select>`:''};
 const build=()=>{
  const t=$('#dt').value,d=$('#d').value;let body;
  if(t=='فاتورة'){const L=($('#it')?.value||'').split('\n').map(s=>s.split('|').map(x=>x.trim())).filter(x=>x[0]);let sum=0;
   const rows=L.map((x,i)=>{const q=+x[1]||1,p=+x[2]||0;sum+=q*p;return `<tr><td>${i+1}</td><td>${esc(x[0])}</td><td>${q}</td><td>${p.toFixed(3)}</td><td>${(q*p).toFixed(3)}</td></tr>`}).join('');
   const tx=+($('#tx')?.value)||0,tv=sum*tx/100;
   body=`<p>الزبون: <b>${v('o')||'…'}</b></p><table class="it"><tr><th>#</th><th>البيان</th><th>الكمية</th><th>السعر</th><th>المجموع</th></tr>${rows}</table><p>المجموع: ${sum.toFixed(3)} د.ت — الضريبة (${tx}%): ${tv.toFixed(3)}<br><b class="big">الإجمالي: ${(sum+tv).toFixed(3)} د.ت</b></p>`}
  else if(t=='بطاقة الخلاصة'){const by={};A.forEach(r=>by[r.type]=(by[r.type]||0)+(+r.qty||1));
   const fd=A.reduce((s,r)=>s+(FEEDKG[r.type]||1)*(+r.qty||1),0),fs=T('feed').reduce((s,r)=>s+(+r.kg||0),0),today=fmtD(new Date());
   const soon=T('mating').map(r=>({r,b:birthOf(r.date,r.type)})).filter(x=>x.b>=today).sort((a,b)=>a.b<b.b?-1:1).slice(0,5);
   const li=Object.keys(LIGHTS).map(k=>LIGHTS[k][0]+': '+T('pallets').filter(r=>r.light==k).length).join(' • ');
   body=`<table class="st"><tr><th>الحيوانات</th><td>${Object.entries(by).map(([k,x])=>esc(k)+': '+x).join(' • ')||'—'}</td></tr><tr><th>العلف اليومي المقدّر</th><td>${fd.toFixed(1)} كغ</td></tr><tr><th>مخزون العلف المسجّل</th><td>${fs} كغ</td></tr><tr><th>ولادات قريبة</th><td>${soon.map(x=>esc(x.r.type)+' '+esc(x.r.tag)+' ← '+x.b).join('<br>')||'—'}</td></tr><tr><th>منتجات المتاجر</th><td>${T('shop').length}</td></tr><tr><th>الباليط</th><td>${li}</td></tr><tr><th>خانات المخزن المشغولة</th><td>${Object.keys(DB.t.wh||{}).length} / 900</td></tr></table>`}
  else if(t=='بطاقة تعريف حيوان'){const r=A[+($('#an')?.value)];
   body=r?`<div style="text-align:center"><div class="big" style="letter-spacing:5px">${esc(r.id)}</div><p>المعرّف الوحيد (تاريخ الميلاد)</p></div><table class="st"><tr><th>النوع</th><td>${esc(r.type)}</td></tr><tr><th>الاسم / العلامة</th><td>${esc(r.tag)}</td></tr><tr><th>تاريخ الميلاد</th><td>${esc(r.born)}</td></tr><tr><th>العدد</th><td>${esc(r.qty||1)}</td></tr><tr><th>العلف اليومي</th><td>${((FEEDKG[r.type]||1)*(+r.qty||1)).toFixed(1)} كغ</td></tr></table>`:'لا توجد حيوانات مسجلة بعد.'}
  else body=`<div class="pb">${DOCS[t].replaceAll('{name}',v('n')||'…').replaceAll('{id}',v('i')||'…').replaceAll('{other}',v('o')||'…').replaceAll('{amt}',v('a')||'…').replaceAll('{date}',d).replaceAll('{city}',v('c')||'…')}</div>`;
  $('#pp').className='paper th'+$('#th').value;
  $('#pp').innerHTML=`<div class="ph"><div style="width:44px;height:60px">${LOGO}</div><div><b>${esc(t)}</b><small>${esc(U)}</small></div><span class="no">N° ${d.replace(/-/g,'')}</span></div>${body}<div class="pf"><span>${v('c')} ${d}</span><span>الإمضاء / الختم</span></div>`};
 $('#dt').onchange=()=>{ex();build()};$('#th').onchange=build;$('#mk').onclick=build;$('#pr').onclick=()=>window.print();
 ex();build();
}
function soc(){
 const L=DB.links;const N=[['فيسبوك','facebook.com/','#4c8bf5'],['واتساب','wa.me/','#3ad06f'],['تيك توك','tiktok.com/@','#e8e9ec'],['تلغرام','t.me/','#4ea1ff']];
 shell('🌐 التواصل الاجتماعي',`<div class="panel">${N.map(([n,b,c])=>`<div class="row" style="margin-bottom:8px"><div style="flex:3 1 200px"><label>${n}</label><input data-s="${n}" value="${esc(L[n]||'')}" placeholder="${b}اسمك أو رقمك"></div><a class="btn" style="text-align:center;text-decoration:none;color:#000;background:${c}" data-o="${n}" target="_blank" rel="noopener">فتح ${n}</a></div>`).join('')}<button class="btn" id="sv">حفظ</button></div>`);
 const upd=()=>N.forEach(([n,b])=>{const v=$(`[data-s="${n}"]`).value.trim();$(`[data-o="${n}"]`).href=v?(v.startsWith('http')?v:'https://'+b+v.replace(/^[@+]/,'')):'#'});upd();
 document.querySelectorAll('[data-s]').forEach(i=>i.oninput=upd);
 $('#sv').onclick=async()=>{document.querySelectorAll('[data-s]').forEach(i=>L[i.dataset.s]=i.value);await save();toast('تم الحفظ')};
}
async function settings(){
 const have=DB.set.pw;let ok=!have;
 if(have){const p=prompt('كلمة سر الإعدادات');ok=p&&await hash(p)==have}
 if(!ok)return toast('كلمة السر خاطئة');
 shell('⚙️ الإعدادات',`<div class="panel"><div class="row"><div><label>كلمة سر الإعدادات الجديدة</label><input id="sp" type="password"></div><button class="btn" id="ssp">حفظ</button></div></div>
 <div class="panel"><p>الحساب: <b>${esc(U)}</b> — التشفير: AES-256-GCM / PBKDF2 (200,000 دورة)</p><button class="btn g" id="bkp">نسخة احتياطية مشفّرة</button> <button class="btn d" id="wipe">مسح كل البيانات</button></div>`);
 $('#ssp').onclick=async()=>{const v=$('#sp').value;if(v.length<4)return toast('4 أحرف على الأقل');DB.set.pw=await hash(v);await save();toast('تم الحفظ')};
 $('#bkp').onclick=()=>{saveFile('jodhor-backup.json',localStorage.getItem('u:'+U))};
 $('#wipe').onclick=async()=>{if(confirm('مسح كل البيانات نهائيا؟')){DB.t={};await save();toast('تم المسح')}};
}
const hash=async s=>b64(await crypto.subtle.digest('SHA-256',enc.encode('set:'+s)));
if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
authView(LS.get('u:')?'in':'up');
