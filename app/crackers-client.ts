// @ts-nocheck
// Diwali Crackers Online — Hand Gesture Celebration
// Single-file clean implementation

const CRACKER_TYPES = [
  { id:'anar', name:'Anar', hindi:'अनार', desc:'Golden fountain spray', emoji:'🌋', color:'#ff9a00', accent:'#ffd60a', chip:'Fountain', sound:'fountain' },
  { id:'rocket', name:'Rocket', hindi:'रॉकेट', desc:'Shoots up & bursts', emoji:'🚀', color:'#ff3b30', accent:'#ff6e40', chip:'Sky', sound:'rocket' },
  { id:'chakri', name:'Chakri', hindi:'चकरी', desc:'Spinning ground wheel', emoji:'🌀', color:'#00e676', accent:'#69f0ae', chip:'Spinner', sound:'chakri' },
  { id:'bomb', name:'Sutli Bomb', hindi:'सुतली बम', desc:'Thunderous boom', emoji:'💣', color:'#ff1744', accent:'#ff5252', chip:'Boom', sound:'bomb' },
  { id:'fuljhadi', name:'Fuljhadi', hindi:'फुलझड़ी', desc:'Hand sparkler shower', emoji:'✨', color:'#ffd60a', accent:'#ffe57f', chip:'Sparkler', sound:'sparkler' },
  { id:'laxmi', name:'Laxmi Bomb', hindi:'लक्ष्मी बम', desc:'Mega blast', emoji:'🧨', color:'#7b2cff', accent:'#b388ff', chip:'Mega', sound:'megabomb' },
  { id:'pop', name:'Pop Pop', hindi:'पॉप पॉप', desc:'Cute crackle snaps', emoji:'🎉', color:'#29b6f6', accent:'#80d8ff', chip:'Pops', sound:'pop' },
  { id:'skyshot', name:'Sky Shot', hindi:'आकाश शॉट', desc:'Multi-color sky burst', emoji:'🎆', color:'#ff4081', accent:'#ff80ab', chip:'Multi', sound:'skyshot' },
];

let activeCracker = 'anar';
let placedCrackers = [];
let particles = [];
let shockwaves = [];
let stats = { placed:0, bursts:0, streak:0 };
let soundOn = true;
let cameraOn = false;
let nightMode = false;
let autoCelebrateInterval = null;

export function init(){
if((globalThis as any).__diwaliInit) return; (globalThis as any).__diwaliInit=true;
const video = document.getElementById('video');
const canvas = document.getElementById('displayCanvas');
const ctx = canvas.getContext('2d');
const stageWrap = document.getElementById('stageWrap');
const shelfGrid = document.getElementById('shelfGrid');
const activeNameEl = document.getElementById('activeName');
const activeChip = document.getElementById('activeChip');
const statPlacedEl = document.getElementById('statPlaced');
const statBurstsEl = document.getElementById('statBursts');
const statStreakEl = document.getElementById('statStreak');
const statHandsEl = document.getElementById('statHands');
const burstCountHint = document.getElementById('burstCountHint');
const arsenalList = document.getElementById('arsenalList');
const camDot = document.getElementById('camDot');
const camLabel = document.getElementById('camLabel');
const startMessage = document.getElementById('startMessage');
const loadingMessage = document.getElementById('loadingMessage');
const detectedHandsEl = document.getElementById('detectedHands');
const leftBadge = document.getElementById('leftHandBadge');
const rightBadge = document.getElementById('rightHandBadge');

// Remove CSS mirroring — we will handle mirroring manually in canvas for precise control
video.style.transform = 'none';
canvas.style.transform = 'none';

// Audio
let audioCtx = null;
function ensureAudio(){
  if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if(audioCtx.state === 'suspended') audioCtx.resume();
}
function playSound(type){
  if(!soundOn) return;
  ensureAudio();
  const now = audioCtx.currentTime;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  const f = audioCtx.createBiquadFilter();
  o.connect(f); f.connect(g); g.connect(audioCtx.destination);
  g.gain.setValueAtTime(0.0001, now);
  if(type==='fountain'){
    o.type='sawtooth'; o.frequency.setValueAtTime(220, now);
    o.frequency.linearRampToValueAtTime(880, now+0.6);
    g.gain.linearRampToValueAtTime(0.25, now+0.02);
    g.gain.exponentialRampToValueAtTime(0.001, now+0.9);
    f.type='bandpass'; f.frequency.setValueAtTime(1200, now);
    o.start(now); o.stop(now+0.9);
    for(let i=0;i<6;i++){
      const c = audioCtx.createOscillator(); const cg = audioCtx.createGain();
      c.connect(cg); cg.connect(audioCtx.destination);
      c.frequency.setValueAtTime(1800+Math.random()*2000, now+i*0.08);
      cg.gain.setValueAtTime(0.12, now+i*0.08); cg.gain.exponentialRampToValueAtTime(0.001, now+i*0.08+0.07);
      c.start(now+i*0.08); c.stop(now+i*0.08+0.08);
    }
  } else if(type==='bomb' || type==='megabomb'){
    o.type='sine'; o.frequency.setValueAtTime(80, now);
    o.frequency.exponentialRampToValueAtTime(30, now+0.3);
    g.gain.linearRampToValueAtTime(0.6, now+0.01);
    g.gain.exponentialRampToValueAtTime(0.001, now+0.6);
    f.type='lowpass'; f.frequency.setValueAtTime(600, now);
    o.start(now); o.stop(now+0.6);
    const n = audioCtx.createBufferSource();
    const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate*0.4, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for(let i=0;i<data.length;i++) data[i]=(Math.random()*2-1)*Math.pow(1-i/data.length,2);
    n.buffer=buffer;
    const ng = audioCtx.createGain(); n.connect(ng); ng.connect(audioCtx.destination);
    ng.gain.setValueAtTime(0.5, now); ng.gain.exponentialRampToValueAtTime(0.001, now+0.4);
    n.start(now);
    if(type==='megabomb'){
      setTimeout(()=>playSound('bomb'),180);
      setTimeout(()=>playSound('firework'),350);
    }
  } else if(type==='rocket'){
    o.type='sawtooth'; o.frequency.setValueAtTime(150, now);
    o.frequency.linearRampToValueAtTime(900, now+0.8);
    g.gain.setValueAtTime(0.3, now); g.gain.linearRampToValueAtTime(0, now+0.8);
    f.type='highpass'; f.frequency.setValueAtTime(400, now);
    o.start(now); o.stop(now+0.8);
    setTimeout(()=>playSound('firework'),780);
  } else if(type==='sparkler'){
    for(let i=0;i<8;i++){
      const osc = audioCtx.createOscillator(); const gg=audioCtx.createGain();
      osc.connect(gg); gg.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(2000+Math.random()*3000, now+i*0.06);
      gg.gain.setValueAtTime(0.08, now+i*0.06); gg.gain.exponentialRampToValueAtTime(0.001, now+i*0.06+0.05);
      osc.start(now+i*0.06); osc.stop(now+i*0.06+0.06);
    }
  } else if(type==='pop'){
    o.type='square'; o.frequency.setValueAtTime(1000, now);
    o.frequency.exponentialRampToValueAtTime(200, now+0.12);
    g.gain.setValueAtTime(0.4, now); g.gain.exponentialRampToValueAtTime(0.001, now+0.15);
    o.start(now); o.stop(now+0.15);
  } else if(type==='skyshot' || type==='firework'){
    o.type='triangle'; o.frequency.setValueAtTime(440, now);
    o.frequency.linearRampToValueAtTime(1200, now+0.3);
    g.gain.setValueAtTime(0.35, now); g.gain.exponentialRampToValueAtTime(0.001, now+0.5);
    o.start(now); o.stop(now+0.5);
    setTimeout(()=>{
      const o2=audioCtx.createOscillator(); const g2=audioCtx.createGain();
      o2.connect(g2); g2.connect(audioCtx.destination);
      o2.frequency.setValueAtTime(600, audioCtx.currentTime); o2.frequency.exponentialRampToValueAtTime(1800, audioCtx.currentTime+0.25);
      g2.gain.setValueAtTime(0.3, audioCtx.currentTime); g2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime+0.35);
      o2.start(); o2.stop(audioCtx.currentTime+0.35);
    },220);
  } else if(type==='chakri'){
    o.type='sine'; o.frequency.setValueAtTime(300, now);
    o.frequency.linearRampToValueAtTime(600, now+0.6);
    g.gain.setValueAtTime(0.2, now); g.gain.linearRampToValueAtTime(0, now+0.7);
    o.start(now); o.stop(now+0.7);
    const w = audioCtx.createOscillator(); const wg=audioCtx.createGain();
    w.connect(wg); wg.connect(audioCtx.destination);
    w.frequency.setValueAtTime(800, now); w.frequency.linearRampToValueAtTime(1400, now+0.4);
    wg.gain.setValueAtTime(0.15, now); wg.gain.linearRampToValueAtTime(0, now+0.4);
    w.start(now); w.stop(now+0.4);
  } else {
    o.type='sine'; o.frequency.setValueAtTime(500, now);
    g.gain.setValueAtTime(0.3, now); g.gain.exponentialRampToValueAtTime(0.001, now+0.4);
    o.start(now); o.stop(now+0.4);
  }
}

// Shelf
function renderShelf(){
  shelfGrid.innerHTML='';
  CRACKER_TYPES.forEach(t=>{
    const div=document.createElement('div');
    div.className='cracker-card'+(t.id===activeCracker?' selected':'');
    div.dataset.id=t.id;
    div.innerHTML=`
      <div class="hover-ring"></div>
      <div class="cracker-icon" style="color:${t.color}">${t.emoji}</div>
      <div class="cracker-name">${t.name}</div>
      <div class="cracker-desc">${t.desc}</div>
      <div class="cracker-meta">
        <span class="chip fire">${t.chip}</span>
        <span class="chip">${t.hindi}</span>
      </div>
    `;
    div.addEventListener('click', ()=> selectCracker(t.id, 'tap'));
    div.addEventListener('dblclick', (e)=>{
      e.preventDefault();
      fireAt(canvas.width/2, canvas.height*0.45, t.id);
    });
    shelfGrid.appendChild(div);
  });
  updateActiveUI();
}
function selectCracker(id){
  activeCracker=id;
  const t = CRACKER_TYPES.find(c=>c.id===id);
  renderShelf();
  updateActiveUI();
  showToast(`Selected ${t.emoji} ${t.name} • Double-tap stage to burst!`, t.color);
  playSound('pop');
}
function updateActiveUI(){
  const t = CRACKER_TYPES.find(c=>c.id===activeCracker);
  activeNameEl.textContent=t.name;
  activeChip.style.borderColor=t.color;
  activeChip.style.color=t.color;
  renderArsenal();
}
function renderArsenal(){
  const counts={};
  placedCrackers.forEach(p=> counts[p.type]=(counts[p.type]||0)+1);
  arsenalList.innerHTML='';
  CRACKER_TYPES.forEach(t=>{
    const c = counts[t.id]||0;
    const el=document.createElement('div');
    el.className='arsenal-item';
    el.style.opacity=c?1:0.45;
    el.innerHTML=`
      <div class="icon" style="background:${t.color}20; border:1px solid ${t.color}40">${t.emoji}</div>
      <div class="info"><b>${t.name}</b><span>${t.desc}</span></div>
      <div class="count" style="color:${t.color}">${c}</div>
    `;
    el.addEventListener('click', ()=> selectCracker(t.id));
    arsenalList.appendChild(el);
  });
  statPlacedEl.textContent=stats.placed;
  statBurstsEl.textContent=stats.bursts;
  statStreakEl.textContent=stats.streak;
  statHandsEl.textContent = handLandmarker ? 'Hands AI ✓' : 'Mouse/Touch';
  burstCountHint.textContent=`${stats.bursts} bursts`;
}

// Particles helpers
function spawnParticles(x,y,type){
  const t = CRACKER_TYPES.find(c=>c.id===type);
  const color = t ? t.color : '#ffd60a';
  const accent = t ? t.accent : '#ff9a00';

  if(type==='anar'){
    for(let i=0;i<90;i++){
      const angle = (Math.random()*0.9 -0.45) * Math.PI;
      const speed = 3 + Math.random()*7;
      const vx = Math.cos(angle + Math.PI/2) * speed * 0.7;
      const vy = Math.sin(angle + Math.PI/2) * speed - Math.random()*2;
      particles.push({
        x,y, vx, vy,
        life:0.7+Math.random()*0.6, maxLife:1.3,
        size:2+Math.random()*3,
        color: Math.random()>0.4? color : accent,
        gravity:0.18, drag:0.97, sparkle:true
      });
    }
    shockwaves.push({x,y, r:0, maxR:90, life:0, maxLife:0.35, color});
  } else if(type==='rocket'){
    const launchY = y;
    const targetY = y - 220 - Math.random()*180;
    const targetX = x + (Math.random()-0.5)*60;
    for(let i=0;i<20;i++){
      particles.push({
        x: x + (Math.random()-0.5)*6,
        y: launchY - i*10,
        vx:(Math.random()-0.5)*0.8, vy:-6 - Math.random()*2,
        life:0.5, maxLife:0.6, size:2.5, color:'#ff9a00', gravity:0, drag:0.98, trail:true
      });
    }
    setTimeout(()=>{
      for(let i=0;i<110;i++){
        const a = Math.random()*Math.PI*2;
        const s = 3+Math.random()*8;
        particles.push({
          x:targetX, y:targetY,
          vx:Math.cos(a)*s, vy:Math.sin(a)*s,
          life:1.0, maxLife:1.0, size:2+Math.random()*2.5, color: Math.random()>0.5? '#ffd60a' : color,
          gravity:0.09, drag:0.985, sparkle:true
        });
      }
      shockwaves.push({x:targetX, y:targetY, r:0, maxR:140, life:0, maxLife:0.45, color:'#ffd60a'});
      for(let i=0;i<18;i++){
        const a = Math.random()*Math.PI*2;
        particles.push({x:targetX,y:targetY,vx:Math.cos(a)*1.5, vy:Math.sin(a)*1.5, life:0.9, maxLife:0.9, size:1.5, color:'#ffffff', gravity:0.04, drag:0.99});
      }
    }, 320);
    return;
  } else if(type==='chakri'){
    const cx=x, cy=y;
    shockwaves.push({x:cx,y:cy,r:0,maxR:70,life:0,maxLife:0.6,color:'#00e676'});
    for(let i=0;i<70;i++){
      const a = (i/70)*Math.PI*2;
      const r = 8 + Math.random()*22;
      particles.push({
        x:cx+Math.cos(a)*r, y:cy+Math.sin(a)*r,
        vx:Math.cos(a+Math.PI/2)*4, vy:Math.sin(a+Math.PI/2)*4,
        life:0.7, maxLife:0.7, size:2.2, color: i%2? '#00e676':'#ffd60a',
        gravity:0.08, drag:0.97
      });
    }
    for(let i=0;i<40;i++){
      const a=Math.random()*Math.PI*2;
      particles.push({x:cx,y:cy,vx:Math.cos(a)*5, vy:Math.sin(a)*5-1, life:0.6, maxLife:0.6, size:1.8, color:'#ffffff', gravity:0.12, drag:0.98});
    }
  } else if(type==='bomb' || type==='laxmi'){
    const isMega = type==='laxmi';
    const count = isMega? 160 : 110;
    const maxR = isMega? 180 : 120;
    shockwaves.push({x,y,r:0,maxR, life:0, maxLife:0.4, color:isMega?'#7b2cff':color});
    shockwaves.push({x,y,r:0,maxR:maxR*0.6, life:0.06, maxLife:0.35, color:'#ffffff'});
    for(let i=0;i<count;i++){
      const a=Math.random()*Math.PI*2;
      const s= isMega? 2+Math.random()*9 : 2+Math.random()*7;
      particles.push({
        x,y, vx:Math.cos(a)*s, vy:Math.sin(a)*s,
        life:0.9, maxLife:0.9, size: isMega? 2+Math.random()*3.5 : 2+Math.random()*2.5,
        color: Math.random()>0.33? color : (Math.random()>0.5? '#ffd60a':'#ffffff'),
        gravity:0.09, drag:0.987, sparkle:true
      });
    }
    particles.push({x,y,vx:0,vy:0,life:0.18,maxLife:0.18,size:maxR, color:'#ffffff', flash:true});
  } else if(type==='fuljhadi'){
    for(let i=0;i<55;i++){
      const a=Math.random()*Math.PI*2;
      const s=Math.random()*4 + 1;
      particles.push({
        x,y, vx:Math.cos(a)*s, vy:Math.sin(a)*s - Math.random()*1,
        life:0.6+Math.random()*0.5, maxLife:1.1, size:1.2+Math.random()*2,
        color: Math.random()>0.2?'#ffd60a':'#ff9a00', gravity:0.11, drag:0.96, sparkle:true
      });
    }
  } else if(type==='skyshot'){
    const bursts = [
      {color:'#ff3b30', count:70},
      {color:'#ffd60a', count:60},
      {color:'#7b2cff', count:60},
      {color:'#00e676', count:60},
    ];
    bursts.forEach((b, idx)=>{
      setTimeout(()=>{
        const bx = x + (Math.random()-0.5)*80;
        const by = y - Math.random()*60 - 20;
        shockwaves.push({x:bx,y:by,r:0,maxR:70,life:0,maxLife:0.32,color:b.color});
        for(let i=0;i<b.count;i++){
          const a=Math.random()*Math.PI*2;
          const s=3+Math.random()*6;
          particles.push({x:bx,y:by,vx:Math.cos(a)*s, vy:Math.sin(a)*s, life:0.85, maxLife:0.85, size:1.8+Math.random()*2, color:b.color, gravity:0.07, drag:0.985, sparkle:true});
        }
      }, idx*160);
    });
  } else if(type==='pop'){
    for(let i=0;i<35;i++){
      const a=Math.random()*Math.PI*2;
      const s=1.5+Math.random()*4;
      particles.push({x,y,vx:Math.cos(a)*s, vy:Math.sin(a)*s, life:0.5, maxLife:0.5, size:2+Math.random()*2, color: Math.random()>0.5? '#29b6f6':'#ffd60a', gravity:0.12, drag:0.96});
    }
    shockwaves.push({x,y,r:0,maxR:55,life:0,maxLife:0.28,color:'#29b6f6'});
  }
}

function fireAt(x,y,type){
  x = Math.max(40, Math.min(canvas.width-40, x));
  y = Math.max(40, Math.min(canvas.height-40, y));
  spawnParticles(x,y,type);
  stats.bursts++;
  stats.streak++;
  renderArsenal();
  const t = CRACKER_TYPES.find(c=>c.id===type);
  playSound(t ? t.sound : 'firework');
  showToast(`${t.emoji} ${t.name} burst!`, t.color);
  let idx=-1; let bestDist=9999;
  placedCrackers.forEach((p,i)=>{
    const d=Math.hypot(p.x - x, p.y - y);
    if(d<80 && d<bestDist){ bestDist=d; idx=i; }
  });
  if(idx>=0){ placedCrackers.splice(idx,1); renderArsenal(); }
  stageWrap.animate([{transform:'translate(0,0)'},{transform:`translate(${Math.random()*6-3}px,${Math.random()*4-2}px)`},{transform:'translate(0,0)'}],{duration:180, easing:'ease-out'});
}

function placeCracker(x,y,type){
  placedCrackers.push({id:Date.now()+Math.random(), x,y, type, scale:1, placedAt:performance.now()});
  stats.placed++;
  renderArsenal();
  showToast(`Placed ${CRACKER_TYPES.find(c=>c.id===type).emoji} — double-tap to fire!`, '#ffd60a');
  playSound('pop');
  for(let i=0;i<12;i++){
    const a=Math.random()*Math.PI*2;
    particles.push({x,y,vx:Math.cos(a)*1.5, vy:Math.sin(a)*1.5 -1, life:0.4, maxLife:0.4, size:1.5, color:'#ffffff', gravity:0.15, drag:0.94});
  }
}

// Camera
async function startCamera(){
  if(cameraOn) return;
  try{
    const stream = await navigator.mediaDevices.getUserMedia({video:{width:{ideal:1280}, height:{ideal:720}, facingMode:'user'}, audio:false});
    video.srcObject = stream;
    await video.play();
    cameraOn=true;
    camDot.classList.remove('off');
    camLabel.textContent='Camera ON';
    document.getElementById('btnCamera').classList.add('active');
    startMessage.classList.add('hidden');
    showToast('Camera started — show your hands!', '#00e676');
    initHandTracking();
  }catch(e){
    console.warn(e);
    showToast('Camera blocked — using mouse/touch fallback', '#ff3b30');
    cameraOn=false;
    camDot.classList.add('off');
    camLabel.textContent='Camera OFF';
  }
}
function stopCamera(){
  if(video.srcObject){
    video.srcObject.getTracks().forEach(t=>t.stop());
    video.srcObject=null;
  }
  cameraOn=false;
  camDot.classList.add('off');
  camLabel.textContent='Camera OFF';
  document.getElementById('btnCamera').classList.remove('active');
  showToast('Camera off — mouse/touch active', '#c2b8d6');
}
function toggleCamera(){ if(cameraOn) stopCamera(); else startCamera(); }

// Hand tracking
let handLandmarker = null;
let lastVideoTime = -1;
let hands = [];
let handStates = {
  Left: { isPinching:false, pinchStart:0, lastTap:0, pendingSingle:null, cursor:{x:0,y:0} },
  Right:{ isPinching:false, pinchStart:0, lastTap:0, pendingSingle:null, cursor:{x:0,y:0} },
  Mouse:{ isPinching:false, pinchStart:0, lastTap:0, pendingSingle:null, cursor:{x: canvas.width/2, y: canvas.height/2 } }
};
const PINCH_THRESH = 0.05;

async function initHandTracking(){
  if(handLandmarker) return;
  loadingMessage.classList.remove('hidden');
  try{
    const visionUrl = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs';
    // Use Function to avoid webpack bundling the dynamic CDN import
    const vision: any = await (Function('u', 'return import(u)') as any)(visionUrl);
    const { FilesetResolver, HandLandmarker } = vision;
    const fileset = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
    );
    handLandmarker = await HandLandmarker.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
        delegate: 'GPU'
      },
      runningMode: 'VIDEO',
      numHands: 2,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
    loadingMessage.classList.add('hidden');
    showToast('Hand tracking ready — both hands tracked!', '#00e676');
    requestAnimationFrame(predictLoop);
  }catch(err){
    console.error('Hand tracking load failed', err);
    loadingMessage.classList.add('hidden');
    showToast('Hand AI failed — mouse/touch still works', '#ff9a00');
    handLandmarker=null;
  }
}

function handlePinch(handLabel, isPinchingNow, cursorX, cursorY){
  const state = handStates[handLabel];
  state.cursor.x=cursorX; state.cursor.y=cursorY;
  if(isPinchingNow !== state.isPinching){
    if(isPinchingNow){
      state.isPinching=true;
      state.pinchStart=performance.now();
    } else {
      state.isPinching=false;
      const dur = performance.now() - state.pinchStart;
      if(dur < 400){
        const now=performance.now();
        const sinceLastTap = now - state.lastTap;
        if(sinceLastTap < 550 && sinceLastTap>80){
          if(state.pendingSingle){ clearTimeout(state.pendingSingle); state.pendingSingle=null; }
          onDoubleTap(handLabel, cursorX, cursorY);
          state.lastTap=0;
        } else {
          state.lastTap=now;
          state.pendingSingle = setTimeout(()=>{
            onSingleTap(handLabel, cursorX, cursorY);
            state.pendingSingle=null;
            state.lastTap=0;
          }, 560);
        }
      }
    }
  } else {
    if(state.isPinching && activeCracker==='fuljhadi'){
      if(Math.random()<0.55){
        spawnParticles(cursorX, cursorY, 'fuljhadi');
      }
    }
  }
}

function onSingleTap(handLabel, x, y){
  const global = canvasToGlobal(x,y);
  const shelfHit = hitTestShelf(global.x, global.y);
  if(shelfHit){
    selectCracker(shelfHit);
    return;
  }
  const rect = stageWrap.getBoundingClientRect();
  const isInsideStage = global.x>=rect.left && global.x<=rect.right && global.y>=rect.top && global.y<=rect.bottom;
  if(isInsideStage){
    placeCracker(x,y, activeCracker);
  }
}
function onDoubleTap(handLabel, x, y){
  const global = canvasToGlobal(x,y);
  const shelfHit = hitTestShelf(global.x, global.y);
  if(shelfHit){
    fireAt(canvas.width/2, canvas.height*0.45, shelfHit);
    return;
  }
  fireAt(x,y, activeCracker);
}
function hitTestShelf(gx, gy){
  const cards = shelfGrid.querySelectorAll('.cracker-card');
  for(const card of cards){
    const r=card.getBoundingClientRect();
    if(gx>=r.left && gx<=r.right && gy>=r.top && gy<=r.bottom){
      return card.dataset.id;
    }
  }
  return null;
}
function canvasToGlobal(cx, cy){
  const rect = stageWrap.getBoundingClientRect();
  const gx = rect.left + (cx / canvas.width) * rect.width;
  const gy = rect.top + (cy / canvas.height) * rect.height;
  return {x:gx, y:gy};
}

// mouse fallback
canvas.addEventListener('mousemove', (e)=>{
  const rect=canvas.getBoundingClientRect();
  const x = ((e.clientX - rect.left)/rect.width)*canvas.width;
  const y = ((e.clientY - rect.top)/rect.height)*canvas.height;
  // Because we mirror video manually via ctx scale, mouse coords should also be mirrored to match hand coords?
  // Hand coords use (1 - x) mapping to appear mirrored. For mouse we keep direct coords but we will mirror via global transform?
  // To keep consistent, mouse should also be mirrored: cursor at mirrored position.
  // But easier: keep mouse direct (no mirror) — it's intuitive for user.
  handStates.Mouse.cursor={x,y};
  updateHoverStates(e.clientX, e.clientY);
});
canvas.addEventListener('mousedown', (e)=>{
  const rect=canvas.getBoundingClientRect();
  const x = ((e.clientX - rect.left)/rect.width)*canvas.width;
  const y = ((e.clientY - rect.top)/rect.height)*canvas.height;
  handlePinch('Mouse', true, x,y);
  ensureAudio();
});
window.addEventListener('mouseup', (e)=>{
  const rect=canvas.getBoundingClientRect();
  const x = ((e.clientX - rect.left)/rect.width)*canvas.width;
  const y = ((e.clientY - rect.top)/rect.height)*canvas.height;
  if(handStates.Mouse.isPinching) handlePinch('Mouse', false, x,y);
});
canvas.addEventListener('touchstart',(e)=>{
  e.preventDefault();
  const t=e.touches[0];
  const rect=canvas.getBoundingClientRect();
  const x = ((t.clientX - rect.left)/rect.width)*canvas.width;
  const y = ((t.clientY - rect.top)/rect.height)*canvas.height;
  handlePinch('Mouse', true, x,y);
},{passive:false});
canvas.addEventListener('touchend',(e)=>{
  const t=e.changedTouches[0];
  const rect=canvas.getBoundingClientRect();
  const x = ((t.clientX - rect.left)/rect.width)*canvas.width;
  const y = ((t.clientY - rect.top)/rect.height)*canvas.height;
  handlePinch('Mouse', false, x,y);
},{passive:false});
stageWrap.addEventListener('mousemove', (e)=> updateHoverStates(e.clientX, e.clientY));
function updateHoverStates(gx,gy){
  const hit = hitTestShelf(gx,gy);
  shelfGrid.querySelectorAll('.cracker-card').forEach(c=>{
    c.classList.toggle('hover', c.dataset.id===hit);
  });
}

function predictLoop(){
  if(video.readyState >= 2 && handLandmarker){
    const now = performance.now();
    if(video.currentTime !== lastVideoTime){
      lastVideoTime = video.currentTime;
      const results = handLandmarker.detectForVideo(video, now);
      hands = [];
      if(results.landmarks){
        for(let i=0;i<results.landmarks.length;i++){
          const lm = results.landmarks[i];
          const handed = results.handednesses[i][0].categoryName;
          hands.push({landmarks:lm, handedness:handed});
          const thumb = lm[4];
          const index = lm[8];
          const d = Math.hypot(thumb.x - index.x, thumb.y - index.y);
          const isPinch = d < PINCH_THRESH;
          // Map to canvas with mirroring: (1 - x) because video is drawn mirrored
          const cx = (1 - index.x) * canvas.width;
          const cy = index.y * canvas.height;
          handlePinch(handed, isPinch, cx, cy);
        }
        detectedHandsEl.textContent = `${hands.length} ${hands.length===1?'hand':'hands'}`;
        leftBadge.textContent = hands.some(h=>h.handedness==='Left') ? 'LEFT HAND — tracking ✓' : 'LEFT HAND — waiting';
        leftBadge.classList.toggle('active', hands.some(h=>h.handedness==='Left'));
        rightBadge.textContent = hands.some(h=>h.handedness==='Right') ? 'RIGHT HAND — tracking ✓' : 'RIGHT HAND — waiting';
        rightBadge.classList.toggle('active', hands.some(h=>h.handedness==='Right'));
        if(hands.length===0){
          leftBadge.classList.remove('active'); rightBadge.classList.remove('active');
        }
      } else {
        detectedHandsEl.textContent='0 hands';
      }
    }
  }
  requestAnimationFrame(predictLoop);
}

// Rendering
let lastTime=performance.now();
let fps=30;

function drawRoundRect(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}

function renderLoop(now){
  const dt = Math.min(0.05, (now - lastTime)/1000);
  lastTime=now;
  fps = fps*0.9 + (1/dt)*0.1;

  // Draw video mirrored
  if(cameraOn && video.readyState>=2){
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0,0, canvas.width, canvas.height);
    ctx.restore();
    if(nightMode){
      ctx.fillStyle='rgba(10,6,24,0.35)';
      ctx.fillRect(0,0,canvas.width,canvas.height);
    }
  } else {
    const g = ctx.createLinearGradient(0,0,0,canvas.height);
    g.addColorStop(0, nightMode?'#0a0618':'#1a1040');
    g.addColorStop(1, nightMode?'#0a0618':'#2a184a');
    ctx.fillStyle=g;
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.save();
    ctx.globalAlpha=0.15;
    ctx.strokeStyle='#ffd60a';
    ctx.lineWidth=2;
    for(let r=40; r<300; r+=40){
      ctx.beginPath();
      ctx.arc(canvas.width/2, canvas.height/2, r, 0, Math.PI*2);
      ctx.stroke();
    }
    ctx.globalAlpha=1;
    for(let i=0;i<6;i++){
      const x = 120 + i*180 + Math.sin(now*0.001 + i)*10;
      const y = canvas.height - 70;
      ctx.fillStyle='#ff9a00';
      ctx.beginPath();
      ctx.ellipse(x,y,28,12,0,0,Math.PI*2);
      ctx.fill();
      ctx.fillStyle='#ffd60a';
      ctx.beginPath();
      ctx.ellipse(x, y-8, 6, 14, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle='#fff7a0';
      ctx.beginPath();
      ctx.arc(x, y-16, 4+Math.sin(now*0.005+i)*1, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
    ctx.fillStyle='#ffd60a';
    ctx.font='700 24px Poppins, sans-serif';
    ctx.textAlign='center';
    ctx.fillText('📸 Camera Off — Mouse/Touch Active', canvas.width/2, 60);
    ctx.fillStyle='#c2b8d6';
    ctx.font='13px Poppins, sans-serif';
    ctx.fillText('Enable camera for hand-gesture magic • Or just click & double-click!', canvas.width/2, 84);
  }

  // Placed crackers
  placedCrackers.forEach(p=>{
    const bob = Math.sin(now*0.004 + p.id)*4;
    const t = CRACKER_TYPES.find(c=>c.id===p.type);
    ctx.save();
    ctx.translate(p.x, p.y + bob);
    ctx.fillStyle=t.color+'30';
    ctx.beginPath();
    ctx.arc(0,0,34,0,Math.PI*2);
    ctx.fill();
    if(((now - p.placedAt)/1000)%1.0 <0.5){
      ctx.fillStyle='#ffd60a';
      ctx.beginPath();
      ctx.arc(6,-14, 3+Math.random()*2,0,Math.PI*2);
      ctx.fill();
    }
    ctx.fillStyle='rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(0,18,18,6,0,0,Math.PI*2);
    ctx.fill();
    ctx.font='28px serif';
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.fillText(t.emoji, 0, 0);
    ctx.font='700 9px Poppins, sans-serif';
    const label = t.name.toUpperCase();
    const w = ctx.measureText(label).width + 10;
    ctx.fillStyle='#ffd60a';
    drawRoundRect(ctx, -w/2, 12, w, 14, 7);
    ctx.fill();
    ctx.fillStyle='#1a0d00';
    ctx.fillText(label, 0, 20);
    ctx.restore();
  });

  // Particles
  ctx.save();
  for(let i=particles.length-1;i>=0;i--){
    const p=particles[i];
    p.life -= dt;
    if(p.life<=0){ particles.splice(i,1); continue; }
    if(!p.flash){
      p.vy += p.gravity ?? 0.12;
      p.vx *= p.drag ?? 0.98;
      p.vy *= p.drag ?? 0.98;
      p.x += p.vx * 60 * dt;
      p.y += p.vy * 60 * dt;
    }
    const alpha = p.life / p.maxLife;
    if(p.flash){
      ctx.globalAlpha = alpha*0.9;
      ctx.fillStyle=p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1 - alpha)*1.5 + 10, 0, Math.PI*2);
      ctx.fill();
      ctx.globalAlpha=1;
      continue;
    }
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    if(p.sparkle){
      ctx.shadowBlur=8; ctx.shadowColor=p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha + 0.5, 0, Math.PI*2);
      ctx.fill();
      ctx.shadowBlur=0;
      if(Math.random()<0.3){
        ctx.strokeStyle=p.color;
        ctx.lineWidth=1;
        ctx.beginPath();
        ctx.moveTo(p.x-3,p.y); ctx.lineTo(p.x+3,p.y);
        ctx.moveTo(p.x,p.y-3); ctx.lineTo(p.x,p.y+3);
        ctx.stroke();
      }
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.globalAlpha=1;
  }
  ctx.restore();

  // Shockwaves
  ctx.save();
  for(let i=shockwaves.length-1;i>=0;i--){
    const s=shockwaves[i];
    s.life += dt;
    if(s.life>=s.maxLife){ shockwaves.splice(i,1); continue; }
    const prog = s.life / s.maxLife;
    const r = s.r + (s.maxR - s.r)*prog;
    const a = 1 - prog;
    ctx.strokeStyle=s.color;
    ctx.globalAlpha=a*0.8;
    ctx.lineWidth= (1-prog)*3 + 1;
    ctx.beginPath();
    ctx.arc(s.x, s.y, r, 0, Math.PI*2);
    ctx.stroke();
    ctx.globalAlpha=1;
  }
  ctx.restore();

  // Hand landmarks (mirrored coords already: (1 - x))
  hands.forEach(h=>{
    const lm=h.landmarks;
    ctx.save();
    ctx.strokeStyle = h.handedness==='Left' ? '#00e676' : '#29b6f6';
    ctx.lineWidth=2;
    ctx.globalAlpha=0.9;
    const connections = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[0,9],[9,10],[10,11],[11,12],[0,13],[13,14],[14,15],[15,16],[0,17],[17,18],[18,19],[19,20],[5,9],[9,13],[13,17]];
    connections.forEach(([a,b])=>{
      const pa=lm[a], pb=lm[b];
      const ax=(1 - pa.x)*canvas.width, ay=pa.y*canvas.height;
      const bx=(1 - pb.x)*canvas.width, by=pb.y*canvas.height;
      ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(bx,by); ctx.stroke();
    });
    lm.forEach(pt=>{
      const x=(1 - pt.x)*canvas.width, y=pt.y*canvas.height;
      ctx.fillStyle=h.handedness==='Left' ? '#00e676' : '#29b6f6';
      ctx.beginPath(); ctx.arc(x,y, 3.5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#0a0618';
      ctx.beginPath(); ctx.arc(x,y,1.5,0,Math.PI*2); ctx.fill();
    });
    const idx=lm[8];
    const cx=(1 - idx.x)*canvas.width, cy=idx.y*canvas.height;
    const isPinching = Math.hypot(lm[4].x - idx.x, lm[4].y - idx.y) < PINCH_THRESH;
    ctx.globalAlpha=1;
    ctx.strokeStyle=isPinching? '#ffd60a' : (h.handedness==='Left'?'#00e676':'#29b6f6');
    ctx.lineWidth=isPinching?3:2;
    ctx.beginPath(); ctx.arc(cx,cy, isPinching? 14:18,0,Math.PI*2); ctx.stroke();
    ctx.fillStyle=isPinching?'#ffd60a':'#ffffff';
    ctx.beginPath(); ctx.arc(cx,cy, isPinching?8:5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=h.handedness==='Left'?'#00e676':'#29b6f6';
    ctx.font='700 10px Poppins, sans-serif';
    ctx.textAlign='center';
    ctx.fillText(h.handedness.toUpperCase(), cx, cy-22);
    ctx.restore();
  });

  // Mouse cursor when no hands
  if(hands.length===0){
    const mx=handStates.Mouse.cursor.x, my=handStates.Mouse.cursor.y;
    ctx.save();
    ctx.strokeStyle='#ffd60a';
    ctx.lineWidth=2;
    ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.arc(mx,my,16,0,Math.PI*2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle='#ffd60a';
    ctx.beginPath(); ctx.arc(mx,my,4,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#ffd60a';
    ctx.font='700 10px Poppins, sans-serif';
    ctx.textAlign='center';
    ctx.fillText('MOUSE', mx, my-20);
    ctx.restore();
  }

  document.getElementById('fpsChip').innerHTML= `${Math.round(fps)} FPS • <span id="detectedHands">${hands.length} ${hands.length===1?'hand':'hands'}</span>`;
  requestAnimationFrame(renderLoop);
}

// Toast
let toastTimer=null;
function showToast(msg, color='#ffd60a'){
  const t=document.getElementById('toast');
  t.textContent=msg;
  t.style.borderColor=color+'60';
  t.style.background=color+'22';
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=> t.classList.remove('show'), 2600);
}

// Bindings
document.getElementById('btnCamera').addEventListener('click', toggleCamera);
document.getElementById('btnEnableCamera').addEventListener('click', startCamera);
document.getElementById('btnSound').addEventListener('click', toggleSound);
document.getElementById('btnSoundToggle2').addEventListener('click', toggleSound);
function toggleSound(){
  soundOn=!soundOn;
  document.getElementById('btnSound').textContent = soundOn?'🔊 Sound ON':'🔇 Sound OFF';
  document.getElementById('btnSoundToggle2').textContent = soundOn?'🔊 Sound':'🔇 Sound';
  document.getElementById('btnSound').classList.toggle('active', soundOn);
  showToast(soundOn?'Sound enabled':'Sound muted', soundOn?'#00e676':'#c2b8d6');
  if(soundOn) ensureAudio();
}
document.getElementById('btnClear').addEventListener('click', ()=>{
  placedCrackers=[]; particles=[]; shockwaves=[];
  stats.placed=0; stats.streak=0;
  renderArsenal();
  showToast('Stage cleared',' #c2b8d6');
});
document.getElementById('btnCelebrate').addEventListener('click', toggleAutoCelebrate);
document.getElementById('btnPlaceRandom').addEventListener('click', ()=>{
  for(let i=0;i<3;i++){
    const t=CRACKER_TYPES[Math.floor(Math.random()*CRACKER_TYPES.length)];
    placeCracker(200+Math.random()*(canvas.width-400), 150+Math.random()*(canvas.height-200), t.id);
  }
});
document.getElementById('btnBurstAll').addEventListener('click', ()=>{
  if(placedCrackers.length===0){
    for(let i=0;i<5;i++){
      setTimeout(()=>{
        const t=CRACKER_TYPES[Math.floor(Math.random()*CRACKER_TYPES.length)];
        fireAt(200+Math.random()*(canvas.width-400), 120+Math.random()*(canvas.height-250), t.id);
      }, i*140);
    }
  } else {
    const copy=[...placedCrackers];
    copy.forEach((p,i)=> setTimeout(()=> fireAt(p.x,p.y,p.type), i*110));
  }
});
document.getElementById('btnNightMode').addEventListener('click', ()=>{
  nightMode=!nightMode;
  document.getElementById('btnNightMode').classList.toggle('active', nightMode);
  document.body.style.background = nightMode?'#04020a':'#0a0618';
  showToast(nightMode?'🌙 Night mode — diyas glowing':'☀️ Day mode',' #ffd60a');
});
document.getElementById('btnTopUp').addEventListener('click', ()=>{
  for(let i=0;i<5;i++){
    const t=CRACKER_TYPES[Math.floor(Math.random()*CRACKER_TYPES.length)];
    placeCracker(180+Math.random()*(canvas.width-360), 140+Math.random()*(canvas.height-220), t.id);
  }
});
function toggleAutoCelebrate(){
  const btn=document.getElementById('btnCelebrate');
  if(autoCelebrateInterval){
    clearInterval(autoCelebrateInterval);
    autoCelebrateInterval=null;
    btn.textContent='✨ Auto Celebrate';
    btn.classList.remove('active');
    showToast('Auto celebration stopped',' #c2b8d6');
  } else {
    btn.textContent='⏹ Stop Celebration';
    btn.classList.add('active');
    showToast('🎉 Auto celebration started!',' #ffd60a');
    autoCelebrateInterval=setInterval(()=>{
      const t=CRACKER_TYPES[Math.floor(Math.random()*CRACKER_TYPES.length)];
      const x= 200+Math.random()*(canvas.width-400);
      const y= 120+Math.random()*(canvas.height-280);
      fireAt(x,y,t.id);
    }, 650);
    setTimeout(()=>{
      if(autoCelebrateInterval){
        clearInterval(autoCelebrateInterval); autoCelebrateInterval=null;
        btn.textContent='✨ Auto Celebrate'; btn.classList.remove('active');
        showToast('Celebration finished — Happy Diwali! 🪔','#ffd60a');
      }
    }, 12000);
  }
}

canvas.addEventListener('dblclick', (e)=>{
  const rect=canvas.getBoundingClientRect();
  const x=((e.clientX-rect.left)/rect.width)*canvas.width;
  const y=((e.clientY-rect.top)/rect.height)*canvas.height;
  fireAt(x,y,activeCracker);
});

// Keyboard
window.addEventListener('keydown', (e)=>{
  if(e.code==='Space'){
    e.preventDefault();
    fireAt(canvas.width/2, canvas.height/2, activeCracker);
  }
  if(e.code==='KeyC'){
    placedCrackers=[]; particles=[]; renderArsenal();
  }
  if(e.key>='1' && e.key<='8'){
    const idx=parseInt(e.key)-1;
    if(CRACKER_TYPES[idx]) selectCracker(CRACKER_TYPES[idx].id);
  }
});
canvas.addEventListener('contextmenu', e=> e.preventDefault());

// Init
renderShelf();
renderArsenal();
updateActiveUI();
requestAnimationFrame(renderLoop);
requestAnimationFrame(predictLoop);
setTimeout(()=> showToast('Welcome! Select cracker, single-tap to place & double-tap to burst 🎆','#ffd60a'), 900);

}
