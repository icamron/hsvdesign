const $=s=>document.querySelector(s);
const portfolio={websites:[],logos:[],drone:[],seo:[]};let activeCategory='websites';
const notes={websites:'Every website is shaped around the business behind it. Select a project to visit the live site.',logos:'Distinct identities for businesses with a story to tell. Select a logo for a closer look.',drone:'Aerial photography and video from a different perspective. Select a project to explore.',seo:'Search strategies built around real businesses. Select a project to see the work.'};
function imagePlaceholder(title){const p=document.createElement('span');p.className='project-placeholder';p.textContent=title;return p}
function renderPortfolio(category){
 if(!Object.hasOwn(portfolio,category))throw new Error('Unknown portfolio category');activeCategory=category;
 const items=portfolio[category];document.querySelectorAll('[role=tab]').forEach(t=>{const active=t.dataset.category===category;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1});
 const grid=$('#portfolio-grid');grid.replaceChildren();grid.setAttribute('aria-labelledby','tab-'+category);
 items.forEach(item=>{
  const direct=category==='websites'&&!!item.url,card=document.createElement(direct?'a':'button');card.className='project-card '+(category==='logos'?'logo-card':category==='drone'?'drone-card':'');
  if(direct){card.href=item.url;card.target='_blank';card.rel='noopener'}else{card.type='button';card.addEventListener('click',()=>showProject(item))}
  const wrap=document.createElement('div');wrap.className='project-image';
  if(item.image){const image=document.createElement('img');image.src=item.image;image.alt=item.title+(item.type?' — '+item.type:'')+' by HsvDesign';image.loading='lazy';image.width=1024;image.height=690;image.addEventListener('error',()=>image.replaceWith(imagePlaceholder(item.title)),{once:true});wrap.append(image)}else wrap.append(imagePlaceholder(item.title));
  if(item.video){const badge=document.createElement('span');badge.className='play-label';badge.textContent='▶ Watch video';wrap.append(badge)}
  const h=document.createElement('h3');h.textContent=item.title;const meta=document.createElement('div');meta.className='project-meta';const type=document.createElement('span');type.textContent=item.type;const action=document.createElement('span');action.textContent=direct?'Visit website':item.video?'Watch video':'View project';meta.append(type,action);card.append(wrap,h,meta);grid.append(card);
 });
 $('#work-count').textContent=items.length+' '+(items.length===1?'project':'projects');$('#portfolio-note').textContent=notes[category];
 if(!items.length){const empty=document.createElement('div');empty.className='drone-overview';const h=document.createElement('h3');h.textContent='More work to come.';const p=document.createElement('p');p.textContent='Have a project in mind? Let’s talk about what we can build together.';const a=document.createElement('a');a.className='text-link';a.href='#contact';a.textContent='Start a conversation';empty.append(h,p,a);grid.append(empty)}
 return{category,projects:items.length};
}
function showProject(item){const image=$('#dialog-image');image.hidden=!item.image;if(item.image)image.src=item.image;image.alt=item.title;$('#dialog-title').textContent=item.title;$('#dialog-description').textContent=item.description||(item.type?item.type+' by HsvDesign.':'A project by HsvDesign.');const link=$('#dialog-link');link.hidden=!item.url;if(item.url)link.href=item.url;link.textContent=item.video?'Watch video':item.category==='websites'?'Visit website':'View project';$('#project-dialog').showModal()}
$('#project-dialog .dialog-close').addEventListener('click',()=>$('#project-dialog').close());
$('#project-dialog').addEventListener('click',e=>{if(e.target===$('#project-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close()}});
document.querySelectorAll('[role=tab]').forEach(t=>{t.addEventListener('click',()=>renderPortfolio(t.dataset.category));t.addEventListener('keydown',e=>{const tabs=[...document.querySelectorAll('[role=tab]')].filter(b=>!b.hidden),i=tabs.indexOf(t);let next;if(e.key==='ArrowRight')next=(i+1)%tabs.length;if(e.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;if(e.key==='Home')next=0;if(e.key==='End')next=tabs.length-1;if(next!==undefined){e.preventDefault();tabs[next].focus();renderPortfolio(tabs[next].dataset.category)}})});
function renderFeatured(){
 const featured=portfolio.websites.filter(p=>p.featured&&p.image&&p.url),container=$('.hero-work'),controls=$('.featured-controls');container.hidden=!featured.length;controls.replaceChildren();
 function select(index){const project=featured[index];$('#featured-image').src=project.image;$('#featured-image').alt=project.title+' website designed by HsvDesign';$('#featured-link').href=project.url;$('#featured-title').textContent=project.title;$('#featured-type').textContent=project.type.toUpperCase();$('#featured-count').textContent=String(index+1).padStart(2,'0')+' / '+String(featured.length).padStart(2,'0');controls.querySelectorAll('button').forEach((b,i)=>{b.classList.toggle('active',i===index);b.setAttribute('aria-pressed',String(i===index))})}
 featured.forEach((project,index)=>{const b=document.createElement('button');b.className='featured-dot';b.setAttribute('aria-label','Show '+project.title);b.addEventListener('click',()=>select(index));controls.append(b)});if(featured.length)select(0);
}
async function loadPortfolio(){
 const grid=$('#portfolio-grid');grid.setAttribute('aria-busy','true');$('#work-count').textContent='Loading work…';
 try{const r=await fetch('/api/portfolio',{cache:'no-store',signal:AbortSignal.timeout(15000)});if(!r.ok)throw new Error('Unavailable');const data=await r.json();for(const cat of Object.keys(portfolio))portfolio[cat]=data.projects.filter(p=>p.category===cat);$('#tab-seo').hidden=!portfolio.seo.length;$('#website-count').textContent=String(portfolio.websites.length).padStart(2,'0');renderFeatured();renderClients(data.clients||[]);renderPortfolio(activeCategory)}catch{grid.replaceChildren();const state=document.createElement('div');state.className='drone-overview';const p=document.createElement('p');p.textContent='Our portfolio couldn’t load right now.';const retry=document.createElement('button');retry.className='text-link';retry.type='button';retry.textContent='Try again';retry.addEventListener('click',loadPortfolio);state.append(p,retry);grid.append(state);$('#work-count').textContent='';$('#portfolio-note').textContent='Please try again in a moment.'}finally{grid.setAttribute('aria-busy','false')}
}
let clientLogos=[],logosPaused=false;
const motionQuery=matchMedia('(prefers-reduced-motion:reduce)');
function renderClients(items){clientLogos=items.filter(p=>p.image);const strip=$('#client-strip'),track=$('#client-track'),viewport=$('#client-carousel'),pause=$('#client-pause');strip.hidden=!clientLogos.length;track.replaceChildren();if(!clientLogos.length)return;const reduced=motionQuery.matches;pause.hidden=reduced;const repeats=reduced?1:Math.max(1,Math.ceil(viewport.clientWidth/(clientLogos.length*200)));const groupWidth=clientLogos.length*repeats*200;track.style.setProperty('--client-duration',groupWidth/35+'s');
 for(let groupIndex=0;groupIndex<(reduced?1:2);groupIndex++){const group=document.createElement('div');group.className='client-group';if(groupIndex)group.setAttribute('aria-hidden','true');for(let repeat=0;repeat<repeats;repeat++)for(const item of clientLogos){const el=document.createElement(item.url?'a':'div');el.className='client-logo'+(/(?:-bw-|black-white)/i.test(item.image)?' monochrome':'');if(item.url){el.href=item.url;el.target='_blank';el.rel='noopener';if(groupIndex||repeat)el.tabIndex=-1}if(repeat)el.setAttribute('aria-hidden','true');const image=document.createElement('img');image.src=item.image;image.alt=groupIndex||repeat?'':item.title;image.width=150;image.height=150;image.decoding='async';el.append(image);group.append(el)}track.append(group)}
 track.classList.toggle('is-paused',logosPaused);
}
$('#client-pause').addEventListener('click',()=>{logosPaused=!logosPaused;$('#client-track').classList.toggle('is-paused',logosPaused);$('#client-pause').setAttribute('aria-pressed',String(logosPaused));$('#client-pause').setAttribute('aria-label',logosPaused?'Resume logo scrolling':'Pause logo scrolling');$('#client-pause').textContent=logosPaused?'▶':'Ⅱ'});
new ResizeObserver(()=>renderClients(clientLogos)).observe($('#client-carousel'));motionQuery.addEventListener('change',()=>renderClients(clientLogos));
loadPortfolio();
function updateThemeLabel(){const dark=document.documentElement.dataset.theme==='dark';$('#theme').setAttribute('aria-label','Switch to '+(dark?'light':'dark')+' mode');$('#theme').setAttribute('title','Switch to '+(dark?'light':'dark')+' mode');$('#theme').innerHTML=dark?'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg>':'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M20.8 13A9 9 0 0 1 11 3.2 9 9 0 1 0 20.8 13Z"/></svg>'}
$('#theme').addEventListener('click',()=>{document.documentElement.dataset.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem('hsv-theme',document.documentElement.dataset.theme)}catch{}updateThemeLabel()});updateThemeLabel();
$('#menu').addEventListener('click',()=>{const open=$('#navigation').classList.toggle('open');$('#menu').setAttribute('aria-expanded',String(open));$('#menu').setAttribute('aria-label',open?'Close navigation':'Open navigation')});
$('#navigation').querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{$('#navigation').classList.remove('open');$('#menu').setAttribute('aria-expanded','false')}));
$('#year').textContent=new Date().getFullYear();
const form=$('#inquiry');let step=1;
function selectedServices(){return [...form.querySelectorAll('input[name=services]:checked')].map(e=>e.value)}
function setStep(n){step=n;$('#project-step').hidden=n===2;$('#contact-step').hidden=n===1;$('#project-step').disabled=n===2;$('#contact-step').disabled=n===1;$('#form-step-label').textContent=n===1?'01 / YOUR PROJECT':'02 / YOUR CONTACT DETAILS';$('#form-progress').style.width=n===1?'50%':'100%';$('#form-status').textContent='';if(n===2){$('#inquiry-summary').textContent='Your project: '+(selectedServices().join(', ')||'Let’s talk through the options');$('#name').focus()}else $('#message').focus()}
$('#contact-step').disabled=true;
$('#continue').addEventListener('click',()=>{if($('#message').reportValidity())setStep(2)});
$('#back').addEventListener('click',()=>setStep(1));
document.querySelectorAll('[data-service]').forEach(b=>b.addEventListener('click',()=>{form.hidden=false;$('#form-success').hidden=true;setStep(1);const input=[...form.querySelectorAll('input[name=services]')].find(x=>x.value===b.dataset.service);if(input)input.checked=true;$('#contact').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'})}));
form.addEventListener('submit',async e=>{
 e.preventDefault();if(step!==2||!form.reportValidity())return;
 const button=$('#send'),status=$('#form-status');button.disabled=true;button.textContent='Sending…';status.className='';status.textContent='Submitting your inquiry…';
 $('#project-step').disabled=false;
 const payload=Object.fromEntries(new FormData(form));payload.services=selectedServices().join(', ')||'Not specified';payload._replyto=payload.email;
 $('#project-step').disabled=true;
 if(payload._honey){button.disabled=false;button.textContent='Send my inquiry';status.textContent='Unable to submit this inquiry.';return}
 try{
  const response=await fetch('https://formsubmit.co/ajax/huntsvilledesigns@gmail.com',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(20000)});
  const data=await response.json();if(!response.ok||!(data.success===true||data.success==='true'))throw new Error('Submission rejected');
  form.hidden=true;$('#form-success').hidden=false;$('#form-success').setAttribute('tabindex','-1');$('#form-success').focus();
 }catch{status.className='error';status.textContent='We couldn’t confirm your submission. Your details are still here. Please try again, or email huntsvilledesigns@gmail.com.'}
 finally{button.disabled=false;button.textContent='Send my inquiry'}
});
$('#new-inquiry').addEventListener('click',()=>{form.reset();form.hidden=false;$('#form-success').hidden=true;setStep(1)});
// Portfolio filtering uses the same state for visitors and supported browser agents.
if(document.modelContext?.registerTool){try{Promise.resolve(document.modelContext.registerTool({name:'filter_hsvdesign_portfolio',title:'Filter HsvDesign portfolio',description:'Switch the visible portfolio between websites, logos, drone work, and SEO projects.',inputSchema:{type:'object',properties:{category:{type:'string',enum:['websites','logos','drone','seo']}},required:['category'],additionalProperties:false},annotations:{readOnlyHint:false},execute:({category})=>renderPortfolio(category)})).catch(()=>{})}catch{}}
