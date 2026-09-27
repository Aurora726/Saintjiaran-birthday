const app = document.getElementById('app');
const canvas = document.getElementById('street');
const ctx = canvas.getContext('2d');
const layer = document.getElementById('characterLayer');
const audio = document.getElementById('cityAudio');
const video = document.getElementById('paprikaVideo');
const soundToggle = document.getElementById('soundToggle');
const skipButton = document.getElementById('skipButton');
const videoPlayButton = document.getElementById('videoPlayButton');
const adventureAudio = document.getElementById('adventureAudio');
const birthdayAudio = document.getElementById('birthdayAudio');
const gameScene = document.getElementById('gameScene');
const collectibles = document.getElementById('collectibles');
const starMeter = document.getElementById('starMeter');
const ageStar = document.getElementById('ageStar');
const particles = document.getElementById('particles');
const traceGlow = document.getElementById('traceGlow');
const traceCore = document.getElementById('traceCore');
const trailGlow = document.getElementById('trailGlow');
const trailCore = document.getElementById('trailCore');
const starReveal = document.getElementById('starReveal');
const letterScene = document.getElementById('letterScene');
const letterPages = [...document.querySelectorAll('.letter-page')];
const letterPrev = document.getElementById('letterPrev');
const letterNext = document.getElementById('letterNext');
const letterDots = [...document.querySelectorAll('#letterDots i')];

const gameItems = [
  {id:'glasses',name:'观影眼镜',src:'./assets/game/cinema-glasses.svg'},
  {id:'soba-beer',name:'荞麦面与麒麟一番榨生啤',src:'./assets/game/soba-beer.svg'},
  {id:'paper-pen',name:'纸和笔',src:'./assets/game/paper-pen.svg'},
  {id:'tamagotchi',name:'拓麻歌子',src:'./assets/game/tamagotchi.svg'},
  {id:'controller',name:'游戏手柄',src:'./assets/game/controller.svg'}
];

const characters = [
  {name:'蓝色兔耳',src:'./assets/characters/blue-rabbit-greeting.png',side:-1,glow:'#71d9ff',height:1.04,spriteRatio:'.667'},
  {name:'红色小人',src:'./assets/characters/red-figure-greeting.png',side:1,glow:'#ff6e9f',height:.96,spriteRatio:'.5'},
  {name:'明日香 · 黑色外套',src:'./assets/characters/asuka-black.png',side:-1,glow:'#f6b17d',height:1.07},
  {name:'明日香 · 红色和服',src:'./assets/characters/asuka-kimono.png',side:1,glow:'#ff768f',height:1.04},
  {name:'明日香 · 蓝色连衣裙',src:'./assets/characters/asuka-blue.png',side:-1,glow:'#97bfff',height:1.04},
  {name:'EVA · 明日香',src:'./assets/characters/eva-asuka.png',side:1,glow:'#ff9c96',height:1.01},
  {name:'EVA · 渚薰',src:'./assets/characters/eva-kaworu.png',side:-1,glow:'#d7bfff',height:1.01},
  {name:'EVA · 碇真嗣',src:'./assets/characters/eva-shinji.png',side:1,glow:'#98c3ff',height:1.01},
  {name:'EVA · 真希波',src:'./assets/characters/eva-mari.png',side:-1,glow:'#f8a4e9',height:1.01},
  {name:'EVA · 绫波丽',src:'./assets/characters/eva-rei.png',side:1,glow:'#8ce5ff',height:1.01},
  {name:'林克',src:'./images/林克.jpeg',side:-1,glow:'#9ceda9',height:1.03,framed:true},
  {name:'塞尔达',src:'./assets/characters/zelda.png',side:1,glow:'#f8d277',height:1.03},
  {name:'马里奥',src:'./images/马里奥.jpeg',side:-1,glow:'#ff9b82',height:.89,framed:true},
  {name:'白色相簿 2',src:'./assets/characters/white-album.png',side:1,glow:'#b6d2ff',height:1.03},
  {name:'Monika',src:'./assets/characters/monika.png',side:-1,glow:'#efa2d7',height:1.02},
  {name:'Natsuki',src:'./assets/characters/natsuki.png',side:1,glow:'#ffabd7',height:1.02},
  {name:'Sayori',src:'./assets/characters/sayori.png',side:-1,glow:'#ffbabe',height:1.02},
  {name:'Yuri',src:'./assets/characters/yuri.png',side:1,glow:'#c9a8ff',height:1.02},
  {name:'PICO PARK',src:'./assets/characters/picopark.png',side:-1,glow:'#b9ffbc',height:.78}
];

const settings = {lead:-2,interval:.84,travel:5.6,tail:2.2};
const totalJourney = settings.lead + (characters.length-1)*settings.interval + settings.travel + settings.tail;
let muted = false;
let scene = 'journey';
let journeyStart = 0;
let sceneTime = 0;
let lastFrame = 0;
let raf = 0;
let audioFade = 0;
let adventureFade = 0;
let birthdayFade = 0;
let letterAutoTimer = 0;
let letterPageIndex = 0;
let letterManual = false;
let gameStart = 0;
let collected = new Set();
let traceClosed = false;
let starClaimed = false;
let itemNodes = [];
let W = 0,H = 0,DPR = 1;
let characterNodes = [];

function makeStars(){
  const holder=document.getElementById('stars');
  for(let i=0;i<95;i++){
    const s=document.createElement('i');s.className='star';
    const seed=(i*73.71)%100;
    s.style.left=`${(i*61.37)%100}%`;s.style.top=`${(i*23.39)%47}%`;
    s.style.setProperty('--duration',`${1.1+seed/42}s`);
    s.style.setProperty('--delay',`${-seed/28}s`);
    if(i%11===0){s.style.width='3px';s.style.height='3px'}
    holder.appendChild(s);
  }
}

function createCharacters(){
  characterNodes=characters.map((entry,index)=>{
    const node=document.createElement('div');node.className=entry.framed?'character framed':'character';
    node.style.display='none';
    node.style.setProperty('--glow',entry.glow);
    node.style.setProperty('--bob',`${2.2+(index%4)*.37}s`);
    if(entry.spriteRatio){
      const sprite=document.createElement('div');sprite.className='sprite';
      sprite.style.aspectRatio=entry.spriteRatio;
      sprite.style.backgroundImage=`url("${entry.src}")`;
      node.appendChild(sprite);
    }else{
      const img=document.createElement('img');img.src=entry.src;img.alt='';img.loading='eager';
      node.appendChild(img);
    }
    layer.appendChild(node);
    return node;
  });
}

function resize(){
  DPR=Math.min(window.devicePixelRatio||1,2);W=window.innerWidth;H=window.innerHeight;
  canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);
  ctx.setTransform(DPR,0,0,DPR,0,0);
}

function project(depth,side){
  const d=Math.max(0,Math.min(1.2,depth));
  return {x:W/2+side*(W*(.06+.51*Math.pow(d,1.55))),y:H*(.445+.58*Math.pow(d,1.35))};
}

function drawStreet(t){
  ctx.clearRect(0,0,W,H);
  const vY=H*.445;
  const road=ctx.createLinearGradient(0,vY,0,H);
  road.addColorStop(0,'#33254e');road.addColorStop(.35,'#1a173b');road.addColorStop(1,'#09091f');
  ctx.beginPath();ctx.moveTo(W*.48,vY);ctx.lineTo(W*.52,vY);ctx.lineTo(W*1.06,H);ctx.lineTo(-W*.06,H);ctx.closePath();ctx.fillStyle=road;ctx.fill();
  ctx.lineWidth=1;ctx.strokeStyle='#e09de750';
  for(let i=0;i<=12;i++){
    const a=i/12;
    const x=W*(.5+(a-.5)*1.15);
    ctx.beginPath();ctx.moveTo(W*.5,vY);ctx.lineTo(x,H);ctx.stroke();
  }
  const offset=(t*.35)%1;
  for(let i=0;i<22;i++){
    const p=(i+offset)/22;
    const y=vY+(H-vY)*Math.pow(p,1.75);
    const spread=W*.54*Math.pow(p,1.55);
    ctx.beginPath();ctx.moveTo(W/2-spread,y);ctx.lineTo(W/2+spread,y);
    ctx.strokeStyle=`rgba(236,145,224,${.06+p*.42})`;ctx.lineWidth=1+p*2;ctx.stroke();
  }
  for(const side of [-1,1]){
    const p1=project(0,side),p2=project(1.2,side);
    ctx.beginPath();ctx.moveTo(p1.x,p1.y);ctx.lineTo(p2.x,p2.y);
    ctx.strokeStyle=side<0?'#f87bdc':'#7ef0fd';ctx.lineWidth=3;ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=24;ctx.stroke();ctx.shadowBlur=0;
    const p3=project(0,side*1.27),p4=project(1.2,side*1.27);
    ctx.beginPath();ctx.moveTo(p3.x,p3.y);ctx.lineTo(p4.x,p4.y);ctx.strokeStyle=side<0?'#b35ef188':'#73d9ed88';ctx.lineWidth=2;ctx.stroke();
    for(let i=0;i<13;i++){
      const d=((i/13+(t*.115))%1.05);
      const pt=project(d,side);
      const h=H*(.012+.14*d*d);
      ctx.beginPath();ctx.moveTo(pt.x,pt.y);ctx.lineTo(pt.x,pt.y-h);
      ctx.strokeStyle=side<0?`rgba(255,110,213,${.2+d*.7})`:`rgba(122,238,252,${.2+d*.7})`;
      ctx.lineWidth=1+3*d;ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=12;ctx.stroke();ctx.shadowBlur=0;
      ctx.beginPath();ctx.arc(pt.x,pt.y-h,1+5*d,0,Math.PI*2);ctx.fillStyle=ctx.strokeStyle;ctx.fill();
    }
  }
  const vanishing=ctx.createRadialGradient(W/2,vY,0,W/2,vY,W*.38);
  vanishing.addColorStop(0,'#ffd5e7aa');vanishing.addColorStop(.22,'#fc9fc646');vanishing.addColorStop(1,'#d97bd000');
  ctx.fillStyle=vanishing;ctx.fillRect(0,vY-W*.38,W,W*.76);
  for(let i=0;i<18;i++){
    const d=((i/18+t*.19)%1);
    const y=vY+(H-vY)*d*d;
    const len=H*(.005+d*.055);
    ctx.beginPath();ctx.moveTo(W/2,y);ctx.lineTo(W/2,y+len);
    ctx.strokeStyle=`rgba(255,224,238,${.18+d*.7})`;ctx.lineWidth=1+d*6;ctx.shadowColor='#ffb6dd';ctx.shadowBlur=9;ctx.stroke();ctx.shadowBlur=0;
  }
}

function setAudioVolume(target,duration=650){
  cancelAnimationFrame(audioFade);
  const from=audio.volume;const start=performance.now();
  function step(now){const p=Math.min(1,(now-start)/duration);audio.volume=from+(target-from)*p;if(p<1)audioFade=requestAnimationFrame(step);else if(target===0&&scene!=='journey')audio.pause()}
  audioFade=requestAnimationFrame(step);
}

function setAdventureVolume(target,duration=650){
  cancelAnimationFrame(adventureFade);
  const from=adventureAudio.volume,start=performance.now();
  function step(now){
    const p=Math.min(1,(now-start)/duration);
    adventureAudio.volume=from+(target-from)*p;
    if(p<1)adventureFade=requestAnimationFrame(step);
    else if(target===0&&scene!=='game')adventureAudio.pause();
  }
  adventureFade=requestAnimationFrame(step);
}

function setBirthdayVolume(target,duration=650){
  cancelAnimationFrame(birthdayFade);
  const from=birthdayAudio.volume,start=performance.now();
  function step(now){
    const p=Math.min(1,(now-start)/duration);
    birthdayAudio.volume=from+(target-from)*p;
    if(p<1)birthdayFade=requestAnimationFrame(step);
    else if(target===0&&scene!=='letter')birthdayAudio.pause();
  }
  birthdayFade=requestAnimationFrame(step);
}

function updateSoundButton(){
  soundToggle.classList.toggle('is-muted',muted);
  soundToggle.setAttribute('aria-pressed',String(muted));
  soundToggle.setAttribute('aria-label',muted?'开启声音':'静音');
  soundToggle.querySelector('.sound-word').textContent=muted?'声音关闭':'声音开启';
  soundToggle.querySelector('.sound-icon').textContent=muted?'♪̸':'♫';
}

function startJourney(){
  cancelAnimationFrame(raf);
  scene='journey';sceneTime=0;journeyStart=performance.now();lastFrame=journeyStart;
  app.className='app state-journey';
  audio.currentTime=0;audio.volume=0;
  if(!muted){audio.play().then(()=>setAudioVolume(.72,1200)).catch(()=>{muted=true;updateSoundButton()});}
  raf=requestAnimationFrame(tick);
}

function updateCharacters(t){
  characterNodes.forEach((node,index)=>{
    const entry=characters[index];const start=settings.lead+index*settings.interval;
    const p=(t-start)/settings.travel;
    if(p<0||p>1.16){node.style.display='none';return}
    node.style.display='flex';
    const eased=Math.max(0,p);
    const pt=project(eased,entry.side);
    const scale=(.14+1.16*Math.pow(eased,1.5))*entry.height;
    const y=pt.y-(H*.013+eased*H*.03);
    const fadeIn=Math.min(1,eased/.12),fadeOut=Math.min(1,(1.16-eased)/.16);
    node.style.opacity=(fadeIn*fadeOut).toFixed(3);
    node.style.transform=`translate(${pt.x}px,${y}px) translate(-50%,-100%) scale(${scale})`;
    node.style.zIndex=String(Math.round(eased*100));
  });
}

function tick(now){
  const t=(now-journeyStart)/1000;
  const dt=Math.min(.05,(now-lastFrame)/1000);lastFrame=now;sceneTime+=dt;
  drawStreet(t);
  updateCharacters(t);
  if(t>=totalJourney){startFall();return}
  raf=requestAnimationFrame(tick);
}

function startFall(){
  scene='fall';app.className='app state-fall';
  setAudioVolume(0,2300);
  setTimeout(()=>{
    if(scene!=='fall')return;
    enterVideo();
  },2500);
}

function enterVideo(){
  scene='video';app.className='app state-video';
  characterNodes.forEach(node=>node.style.display='none');
  cancelAnimationFrame(audioFade);
  audio.volume=0;audio.pause();
  video.currentTime=0;
  video.muted=muted;
  videoPlayButton.hidden=true;
  video.play().catch(()=>{
    if(scene!=='video')return;
    muted=true;updateSoundButton();video.muted=true;
    video.play().catch(()=>{if(scene==='video')videoPlayButton.hidden=false});
  });
}

function finishVideo(){
  if(scene!=='video')return;
  video.pause();
  videoPlayButton.hidden=true;
  startGame();
}

function makeGameItems(){
  itemNodes=gameItems.map(item=>{
    const button=document.createElement('button');
    button.type='button';button.className=`collectible item-${item.id}`;
    button.setAttribute('aria-label',`收集${item.name}`);
    const img=document.createElement('img');img.src=item.src;img.alt='';
    button.appendChild(img);
    button.addEventListener('click',()=>collectItem(item.id));
    collectibles.appendChild(button);
    return button;
  });
  for(let i=0;i<gameItems.length;i++)starMeter.appendChild(document.createElement('i'));
}

function placeGameItems(){
  const radius=Math.min(W*.4,H*.3),centerX=W*.5,centerY=H*.54;
  const angles=[-90,54,198,-18,126];
  itemNodes.forEach((node,index)=>{
    const angle=angles[index]*Math.PI/180;
    node.style.left=`${centerX+Math.cos(angle)*radius}px`;
    node.style.top=`${centerY+Math.sin(angle)*radius}px`;
  });
}

function pointOf(element){
  const room=gameScene.getBoundingClientRect(),box=element.getBoundingClientRect();
  if(element.classList.contains('collectible'))return {x:parseFloat(element.style.left)/room.width*100,y:parseFloat(element.style.top)/room.height*100};
  return {x:(box.left+box.width/2-room.left)/room.width*100,y:(box.top+box.height/2-room.top)/room.height*100};
}

function setTrailTo(element){
  if(!element){trailGlow.setAttribute('d','');trailCore.setAttribute('d','');return}
  const p=pointOf(element);
  const from=collected.size?pointOf(itemNodes[collected.size-1]):{x:50,y:50};
  const d=`M ${from.x} ${from.y} L ${p.x} ${p.y}`;
  trailGlow.setAttribute('d',d);trailCore.setAttribute('d',d);
}

function drawTrace(close=false){
  const points=itemNodes.slice(0,collected.size).map(pointOf);
  const d=points.length?`M ${points[0].x} ${points[0].y}`+points.slice(1).map(p=>` L ${p.x} ${p.y}`).join('')+(close?` L ${points[0].x} ${points[0].y}`:''):'';
  traceGlow.setAttribute('d',d);traceCore.setAttribute('d',d);
}

function focusNext(){
  itemNodes.forEach(node=>{node.classList.remove('is-target');node.disabled=true});
  const index=collected.size;
  if(index>=gameItems.length){setTrailTo(null);return}
  const target=itemNodes[index];target.disabled=false;target.classList.add('is-target');
  requestAnimationFrame(()=>setTrailTo(target));
}

function burstAt(element){
  const p=pointOf(element);
  for(let i=0;i<16;i++){
    const mote=document.createElement('i');
    const a=i/16*Math.PI*2,dist=35+(i%4)*15;
    mote.style.left=`${p.x}%`;mote.style.top=`${p.y}%`;
    mote.style.setProperty('--dx',`${Math.cos(a)*dist}px`);
    mote.style.setProperty('--dy',`${Math.sin(a)*dist}px`);
    mote.style.setProperty('--delay',`${(i%4)*35}ms`);
    particles.appendChild(mote);
    setTimeout(()=>mote.remove(),1150);
  }
}

function collectItem(id,automatic=false){
  if(scene!=='game'||gameItems[collected.size]?.id!==id)return;
  const index=collected.size,node=itemNodes[index];
  if(node.disabled&&!automatic)return;
  collected.add(id);burstAt(node);node.classList.add('is-collected');node.disabled=true;
  starMeter.children[index].classList.add('is-lit');
  drawTrace();setTrailTo(null);
  if(collected.size===gameItems.length){
    setTimeout(()=>{if(scene!=='game')return;traceClosed=true;drawTrace(true);gameScene.classList.add('is-charging');setTimeout(showAgeStar,1050)},650);
  }else setTimeout(()=>{if(scene==='game')focusNext()},2800);
}

function showAgeStar(){
  if(scene!=='game'||collected.size!==gameItems.length||!ageStar.hidden)return;
  const spots=[{x:49,y:27},{x:64,y:32},{x:38,y:34},{x:54,y:60},{x:72,y:55}];
  const spot=spots[Math.floor(Math.random()*spots.length)];
  ageStar.style.left=`${spot.x}%`;ageStar.style.top=`${spot.y}%`;
  ageStar.hidden=false;gameScene.classList.remove('is-charging');
  requestAnimationFrame(()=>ageStar.classList.add('is-ready'));
}

function claimAgeStar(){
  if(scene!=='game'||ageStar.hidden||starClaimed)return;
  starClaimed=true;ageStar.disabled=true;burstAt(ageStar);
  ageStar.classList.add('is-claimed');
  ageStar.style.left='50%';ageStar.style.top='50%';
  setTimeout(()=>{if(scene==='game'){starReveal.hidden=false;requestAnimationFrame(()=>starReveal.classList.add('is-visible'))}},850);
  setTimeout(finishGame,3400);
}

function autoCollectRemaining(){
  if(scene!=='game'||starClaimed)return;
  if(collected.size<gameItems.length){collectItem(gameItems[collected.size].id,true);setTimeout(autoCollectRemaining,650)}
  else showAgeStar();
}

function startGame(){
  scene='game';app.className='app state-game';
  placeGameItems();
  gameStart=performance.now();collected=new Set();traceClosed=false;starClaimed=false;
  itemNodes.forEach(node=>{node.disabled=true;node.classList.remove('is-collected','is-target')});
  [...starMeter.children].forEach(node=>node.classList.remove('is-lit'));
  ageStar.hidden=true;ageStar.disabled=false;ageStar.classList.remove('is-ready','is-claimed');
  starReveal.hidden=true;starReveal.classList.remove('is-visible');
  gameScene.classList.remove('is-charging');
  drawTrace();setTrailTo(null);
  adventureAudio.currentTime=0;adventureAudio.volume=0;
  if(!muted)adventureAudio.play().then(()=>setAdventureVolume(.62,1300)).catch(()=>{muted=true;updateSoundButton()});
  requestAnimationFrame(focusNext);
  setTimeout(autoCollectRemaining,46000);
  setTimeout(()=>{if(scene==='game'&&!starClaimed){if(ageStar.hidden)showAgeStar();claimAgeStar()}},54000);
  setTimeout(finishGame,59000);
}

function finishGame(){
  if(scene!=='game')return;
  enterLetter();
}

function showLetterPage(index,manual=false){
  if(scene!=='letter'||index<0||index>=letterPages.length)return;
  if(manual)letterManual=true;
  clearTimeout(letterAutoTimer);
  letterPageIndex=index;
  letterPages.forEach((page,i)=>{
    page.classList.toggle('is-current',i===index);
    page.setAttribute('aria-hidden',String(i!==index));
  });
  letterDots.forEach((dot,i)=>dot.classList.toggle('is-current',i===index));
  letterPrev.disabled=index===0;
  letterNext.disabled=index===letterPages.length-1;
  if(!letterManual&&index<letterPages.length-1)letterAutoTimer=setTimeout(()=>showLetterPage(index+1),14000);
}

function enterLetter(){
  scene='letter';app.className='app state-letter';
  setAdventureVolume(0,1200);
  birthdayAudio.currentTime=0;birthdayAudio.volume=0;
  if(!muted)birthdayAudio.play().then(()=>setBirthdayVolume(.57,1900)).catch(()=>{muted=true;updateSoundButton()});
  letterPageIndex=0;letterManual=false;
  setTimeout(()=>{
    if(scene!=='letter')return;
    letterScene.classList.add('is-open');
    showLetterPage(0);
  },1100);
}

soundToggle.addEventListener('click',()=>{
  muted=!muted;updateSoundButton();
  if(scene==='video'){
    video.muted=muted;
    if(!muted&&video.paused)video.play().then(()=>{videoPlayButton.hidden=true}).catch(()=>{videoPlayButton.hidden=false});
    return;
  }
  if(scene==='game'){
    if(muted)setAdventureVolume(0,350);
    else adventureAudio.play().then(()=>setAdventureVolume(.62,500)).catch(()=>{muted=true;updateSoundButton()});
    return;
  }
  if(scene==='letter'){
    if(muted)setBirthdayVolume(0,450);
    else birthdayAudio.play().then(()=>setBirthdayVolume(.57,750)).catch(()=>{muted=true;updateSoundButton()});
    return;
  }
  if(muted){setAudioVolume(0,350)}
  else if(scene==='journey'||scene==='fall'){audio.play().then(()=>setAudioVolume(scene==='journey'?.72:0,500)).catch(()=>{})}
});
skipButton.addEventListener('click',finishVideo);
video.addEventListener('ended',finishVideo);
videoPlayButton.addEventListener('click',()=>{
  video.muted=muted;
  video.play().then(()=>{videoPlayButton.hidden=true}).catch(()=>{videoPlayButton.hidden=false});
});
ageStar.addEventListener('click',claimAgeStar);
letterPrev.addEventListener('click',()=>showLetterPage(letterPageIndex-1,true));
letterNext.addEventListener('click',()=>showLetterPage(letterPageIndex+1,true));
window.addEventListener('keydown',event=>{
  if(scene!=='letter')return;
  if(event.key==='ArrowRight')showLetterPage(letterPageIndex+1,true);
  if(event.key==='ArrowLeft')showLetterPage(letterPageIndex-1,true);
});
window.addEventListener('resize',()=>{resize();placeGameItems();if(scene==='game'){drawTrace(traceClosed);if(collected.size<gameItems.length)setTrailTo(itemNodes[collected.size])}});
makeStars();createCharacters();makeGameItems();resize();placeGameItems();drawStreet(0);updateSoundButton();
if(new URLSearchParams(location.search).get('preview')==='letter')enterLetter();
else if(new URLSearchParams(location.search).get('preview')==='game')startGame();
else startJourney();
