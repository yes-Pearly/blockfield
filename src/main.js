import * as THREE from '../vendor/three.module.min.js';
import {B,BLOCKS,PALETTE,DEFAULT_HOTBAR,makeAtlas,blockIcon,loadTextures,assetURL,textureImage,faceTile,ATLAS_COLS,ATLAS_ROWS,CELL} from './blocks.js';
import {World,chunkKey,raycast,index,HEIGHT,SAVE_VERSION,validateSave} from './world.js';
import {stepPhysics,overlapsBlock,EYE_HEIGHT} from './physics.js';
import {loadSave,storeSave,loadSettings,storeSettings} from './storage.js';
import {Controls} from './controls.js';
import {fillIcons} from './icons.js';
import {Survival,ITEMS,itemName,newStack,insert,take,miningInfo,harvest,useTool,returnCrafting,newFurnace,tickFurnace} from './survival.js';
import {GameUI,fillSlot,itemIcon} from './game-ui.js';
import {parseResourcePack} from './resource-pack.js';

const $=id=>document.getElementById(id),clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
const coarse=matchMedia('(pointer:coarse)').matches||navigator.maxTouchPoints>0;
const defaults={controls:'auto',distance:coarse?3:4,sensitivity:1,fov:75,opacity:.3,volume:.3,autojump:true,coordinates:false,fps:false};
const settings={...defaults,...loadSettings()};for(const[key,min,max]of[['distance',2,6],['sensitivity',.3,2.5],['fov',55,100],['opacity',.15,.8],['volume',0,1]])settings[key]=Number.isFinite(settings[key])?clamp(settings[key],min,max):defaults[key];settings.distance=Math.round(settings.distance);if(!['auto','touch','desktop'].includes(settings.controls))settings.controls='auto';
fillIcons();
const atlasCanvas=await loadTextures().catch(()=>makeAtlas());
let game=new Survival(),mining=null,craftSize=2,fallPeak=null,wasGrounded=false,guiClock=0;
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas:$('game'),antialias:!coarse,powerPreference:'high-performance'});}
catch(error){fatal('La 3D WebGL est indisponible dans ce navigateur. Essaie Safari ou Chrome à jour, avec l’accélération graphique activée.');throw error;}
renderer.setPixelRatio(Math.min(devicePixelRatio,coarse?1.5:1.8));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor('#b3d6da');
const scene=new THREE.Scene();scene.background=new THREE.Color('#b3d6da');scene.fog=new THREE.Fog('#b3d6da',35,80);
const camera=new THREE.PerspectiveCamera(settings.fov,innerWidth/innerHeight,.05,250);camera.rotation.order='YXZ';scene.add(camera);
const atlas=new THREE.CanvasTexture(atlasCanvas);atlas.colorSpace=THREE.SRGBColorSpace;atlas.magFilter=THREE.NearestFilter;atlas.minFilter=renderer.capabilities.isWebGL2?THREE.NearestMipmapLinearFilter:THREE.NearestFilter;atlas.generateMipmaps=renderer.capabilities.isWebGL2;
const opaqueMaterial=new THREE.MeshBasicMaterial({map:atlas,vertexColors:true,alphaTest:.3});const transparentMaterial=new THREE.MeshBasicMaterial({map:atlas,vertexColors:true,transparent:true,opacity:.67,depthWrite:false});
const chunks=new Map(),queue=[],queued=new Set(),dirtyAfter=new Set();let worker=null,busy=false,token=0,world=null,player=null,hotbar=[...DEFAULT_HOTBAR],selected=0,state='menu',returnPanel='pause',ready=false,hasSaved=false,center='',currentChunk='',initialReady=null,initialCount=0,loaded=0;
let lastTarget=null,swing=0,walkPhase=0,actionTime=0,stepTime=0,frameCount=0,fps=0,fpsTime=0,lastTimestamp=0,accumulator=0,lastSaveTime=0,saveChain=Promise.resolve(),saveTimer=null,toastTimer=null;
const direction=new THREE.Vector3(),targetPos=new THREE.Vector3();
const sky=new THREE.Mesh(new THREE.SphereGeometry(210,24,12),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,vertexShader:'varying vec3 vDirection;void main(){vDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'varying vec3 vDirection;void main(){float h=max(0.0,normalize(vDirection).y);vec3 horizon=vec3(.70,.84,.85);vec3 zenith=vec3(.29,.61,.82);gl_FragColor=vec4(mix(horizon,zenith,pow(h,.55)),1.0);}',fog:false}));scene.add(sky);
const controls=new Controls($('game'),{pause:()=>pause(),close:()=>closePanel(),inventory:()=>{craftSize=2;openPanel('inventory');},flight:()=>toggleFlight(),action:action,select:selectSlot,slot:n=>selectSlot((selected+n+9)%9),pick:pickBlock,drop:()=>dropSelected(),gesture:()=>sound.unlock(),notice:toast},settings);

// Sparse wireframe with a slight expansion prevents z-fighting on the selected block.
const selection=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.006,1.006,1.006)),new THREE.LineBasicMaterial({color:'#273b27',transparent:true,opacity:.85}));selection.visible=false;scene.add(selection);
const itemMaterials=new Map();
function itemMaterial(id){if(!itemMaterials.has(id)){const t=new THREE.TextureLoader().load(itemIcon(id));t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;itemMaterials.set(id,new THREE.SpriteMaterial({map:t,transparent:true,alphaTest:.1}));}return itemMaterials.get(id);}
const heldSprite=new THREE.Sprite(new THREE.SpriteMaterial());heldSprite.position.set(.43,-.32,-.75);heldSprite.scale.set(.4,.4,.4);camera.add(heldSprite);heldSprite.visible=false;
const crackCanvas=document.createElement('canvas');crackCanvas.width=crackCanvas.height=16;const crackTexture=new THREE.CanvasTexture(crackCanvas);crackTexture.magFilter=THREE.NearestFilter;crackTexture.minFilter=THREE.NearestFilter;
const cracks=new THREE.Mesh(new THREE.BoxGeometry(1.009,1.009,1.009),new THREE.MeshBasicMaterial({map:crackTexture,transparent:true,alphaTest:.05,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}));cracks.visible=false;scene.add(cracks);let crackStage=-1;
const held=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({map:atlas,vertexColors:true,depthTest:false,depthWrite:false}));held.renderOrder=999;held.position.set(.43,-.36,-.75);held.rotation.set(.2,-.6,-.12);held.scale.setScalar(.24);camera.add(held);
function heldId(){return game.mode==='survival'?(game.slots[selected]?.id??0):hotbar[selected];}
function updateHeld(){
 const id=heldId(),item=ITEMS.get(id);heldSprite.visible=state==='playing'&&!!item&&!item.block;held.visible=state==='playing'&&(!item||!!item.block);held.material.color.set(item?'#ffffff':'#bc8b64');held.material.map=item?.block?atlas:null;held.material.needsUpdate=true;
 if(item&&!item.block){heldSprite.material.dispose();heldSprite.material=itemMaterial(id).clone();heldSprite.material.depthTest=false;heldSprite.material.depthWrite=false;return;}
 const geo=new THREE.BoxGeometry(1,1,1),uv=geo.attributes.uv,col=[];for(let f=0;f<6;f++){const tile=faceTile(id||B.DIRT,f);for(let i=f*4;i<f*4+4;i++){uv.setXY(i,(tile%8*CELL+1+uv.getX(i)*16)/(ATLAS_COLS*CELL),1-((tile/8|0)*CELL+1+(1-uv.getY(i))*16)/(ATLAS_ROWS*CELL));const v=[.77,.66,1,.5,.86,.72][f];col.push(v,v,v);}}geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));held.geometry.dispose();held.geometry=geo;held.scale.set(item?.block ? .24 : .17,item?.block ? .24 : .39,item?.block ? .24 : .17);
}
const gui=new GameUI({getGame:()=>game,notice:toast,change:()=>refreshInventory(),creative:()=>renderInventory(),select:selectSlot});
function refreshInventory(){updateHotbar();updateHeld();updateVitals();clearTimeout(saveTimer);saveTimer=setTimeout(()=>save(false),700);}
function updateVitals(){const survival=game.mode==='survival';document.body.classList.toggle('survival',survival);$('vitals').classList.toggle('hidden',!survival);$('mode-button').textContent='Mode : '+(survival?'Survie':'Créatif');for(const[id,value,image]of[['hearts',game.health,'heart'],['hunger',game.hunger,'hbhunger_icon']]){if($(id).dataset.value===String(value))continue;$(id).dataset.value=value;$(id).replaceChildren();for(let i=0;i<10;i++){const img=document.createElement('img');img.src=assetURL(image);img.alt='';img.classList.toggle('empty-vital',value<=i*2);img.classList.toggle('half-vital',value>i*2&&value<i*2+2);$(id).append(img);}$(id).setAttribute('aria-label',`${id==='hearts'?'Vie':'Faim'} : ${value} sur 20`);}$('air').classList.toggle('hidden',!survival||game.air>=20);$('air').textContent='○'.repeat(Math.ceil(game.air/2));}
function damage(amount){if(game.mode!=='survival'||amount<=0)return;game.damage(amount);$('damage-overlay').classList.add('hit');setTimeout(()=>$('damage-overlay').classList.remove('hit'),250);updateVitals();if(game.health<=0)die();}
function spawnDrop(id,count,x,y,z,durability){if(!ITEMS.has(id)||count<=0)return;if(game.drops.length>=256){const left=insert(game.slots,id,count,durability);if(!left)return;const similar=game.drops.find(d=>d.id===id&&d.count+left<=ITEMS.get(id).stack);if(similar){similar.count+=left;return;}return;}game.drops.push({id,count,...(durability!==undefined?{durability}:{}),x,y,z,vx:(Math.random()-.5)*1.5,vy:2,vz:(Math.random()-.5)*1.5,age:0});}
function clearDropSprites(){for(const d of game.drops)if(d.sprite)scene.remove(d.sprite);}
function updateDrops(dt){for(let i=game.drops.length-1;i>=0;i--){const d=game.drops[i];if(!d.sprite){d.sprite=new THREE.Sprite(itemMaterial(d.id));d.sprite.scale.setScalar(.32);scene.add(d.sprite);}if(dt>0){d.age+=dt;d.vy=Math.max(-12,d.vy-12*dt);const nextY=d.y+d.vy*dt;if(!BLOCKS[getBlock(d.x,nextY,d.z)]?.solid)d.y=nextY;else {d.y=Math.floor(nextY)+1.03;d.vy=0;d.vx*=.8;d.vz*=.8;}const nx=d.x+d.vx*dt,nz=d.z+d.vz*dt;if(!BLOCKS[getBlock(nx,d.y,nz)]?.solid){d.x=nx;d.z=nz;}else d.vx=d.vz=0;
 if(d.age>.5&&Math.hypot(d.x-player.x,d.y-(player.y+.6),d.z-player.z)<1.8&&game.mode==='survival'){const count=d.count;d.count=insert(game.slots,d.id,d.count,d.durability);if(d.count<count){refreshInventory();sound.play('place');}}
 }d.sprite.position.set(d.x,d.y+.12+Math.sin(d.age*3)*.04,d.z);if(d.count<=0||d.age>300||d.y<0){scene.remove(d.sprite);game.drops.splice(i,1);}}}
function dropSelected(){if(game.mode!=='survival'||state!=='playing')return;const item=take(game.slots,selected);if(!item)return;spawnDrop(item.id,1,player.x-Math.sin(player.yaw),player.y+1,player.z-Math.cos(player.yaw),item.durability);refreshInventory();}
function die(){if(state==='death')return;returnCrafting(game);for(let i=0;i<game.slots.length;i++){const stack=game.slots[i];if(stack)spawnDrop(stack.id,stack.count,player.x,player.y+.5,player.z,stack.durability);game.slots[i]=null;}mining=null;setState('death');save(false);}
function respawnPlayer(){Object.assign(player,world.spawn(),{vy:0,pitch:0,flying:false});game.health=20;game.hunger=20;game.saturation=5;game.exhaustion=0;game.air=20;fallPeak=null;updateStreaming(true);updateVitals();updateFlightUI();updateHeld();setState('playing');controls.capture();save(false);}

// Clouds are grouped into meshes, rather than hundreds of separate draw calls.
const cloudGroup=new THREE.Group();scene.add(cloudGroup);const cloudPositions=[],cloudIndices=[];
for(let i=0;i<28;i++){const x=((i*73)%310)-155,z=((i*113)%310)-155,w=9+(i%4)*4,d=5+(i%3)*3;const box=new THREE.BoxGeometry(w,1.8,d),base=cloudPositions.length/3;for(let v=0;v<box.attributes.position.count;v++)cloudPositions.push(box.attributes.position.getX(v)+x,box.attributes.position.getY(v)+68+(i%3)*2,box.attributes.position.getZ(v)+z);for(const n of box.index.array)cloudIndices.push(n+base);box.dispose();}
const cg=new THREE.BufferGeometry();cg.setAttribute('position',new THREE.Float32BufferAttribute(cloudPositions,3));cg.setIndex(cloudIndices);const clouds=new THREE.Mesh(cg,new THREE.MeshBasicMaterial({color:'#f7f9ed',transparent:true,opacity:.82}));cloudGroup.add(clouds);
const sun=new THREE.Mesh(new THREE.PlaneGeometry(12,12),new THREE.MeshBasicMaterial({color:'#fff5c9',fog:false,transparent:true,opacity:.95}));scene.add(sun);
const particles=[],particleMesh=new THREE.InstancedMesh(new THREE.BoxGeometry(.1,.1,.1),new THREE.MeshBasicMaterial({vertexColors:false}),120);particleMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);particleMesh.count=0;particleMesh.frustumCulled=false;scene.add(particleMesh);const dummy=new THREE.Object3D();
function burst(x,y,z,id){for(let i=0;i<9;i++){if(particles.length>=120)particles.shift();particles.push({x:x+.5,y:y+.5,z:z+.5,vx:(Math.random()-.5)*3,vy:Math.random()*3+1,vz:(Math.random()-.5)*3,life:.45+Math.random()*.3,color:new THREE.Color(BLOCKS[id].color)});}}
function updateParticles(dt){for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.life-=dt;if(p.life<=0){particles.splice(i,1);continue;}p.vy-=12*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;dummy.position.set(p.x,p.y,p.z);dummy.rotation.x+=dt;dummy.scale.setScalar(Math.min(1,p.life*4));dummy.updateMatrix();particleMesh.setMatrixAt(i,dummy.matrix);particleMesh.setColorAt(i,p.color);}particleMesh.count=particles.length;particleMesh.instanceMatrix.needsUpdate=true;if(particleMesh.instanceColor)particleMesh.instanceColor.needsUpdate=true;}
const sound={ctx:null,unlock(){try{this.ctx??=new(window.AudioContext||window.webkitAudioContext)();if(this.ctx.state==='suspended')this.ctx.resume().catch(()=>{});}catch{}},play(kind){if(!this.ctx||settings.volume===0)return;try{const c=this.ctx,t=c.currentTime,g=c.createGain();g.connect(c.destination);g.gain.setValueAtTime(settings.volume*(kind==='step'?.045:.11),t);g.gain.exponentialRampToValueAtTime(.001,t+.09);const o=c.createOscillator();o.type='triangle';o.frequency.setValueAtTime(kind==='break'?180:kind==='place'?260:100,t);o.frequency.exponentialRampToValueAtTime(50,t+.08);o.connect(g);o.start(t);o.stop(t+.1);}catch{}}};

function fatal(message){$('fatal').classList.remove('hidden');$('fatal-message').textContent=message;}
function toast(text){$('toast').textContent=text;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),3200);}
function getBlock(x,y,z){return world?.get(x,y,z)??0;}
function disposeChunks(){for(const group of chunks.values()){scene.remove(group);group.children.forEach(m=>m.geometry.dispose());}chunks.clear();}
function geometry(data){const g=new THREE.BufferGeometry();for(const[name,size]of[['position',3],['normal',3],['uv',2],['color',3]])g.setAttribute(name,new THREE.BufferAttribute(data[name],size));g.setIndex(new THREE.BufferAttribute(data.indices,1));g.computeBoundingSphere();return g;}
function installChunk(d){
 const k=chunkKey(d.cx,d.cz),old=chunks.get(k);if(old){scene.remove(old);old.children.forEach(m=>m.geometry.dispose());}
 const g=new THREE.Group();g.position.set(d.cx*16,0,d.cz*16);for(const[name,material]of[['opaque',opaqueMaterial],['transparent',transparentMaterial]])if(d.mesh[name].indices.length)g.add(new THREE.Mesh(geometry(d.mesh[name]),material));scene.add(g);chunks.set(k,g);
 // Keep edits made during an in-flight worker request authoritative.
 for(const[x,y,z,id]of world.edits.get(k)?.values()??[])d.blocks[index(x-d.cx*16,y,z-d.cz*16)]=id;world.chunks.set(k,d.blocks);
}
function enqueue(cx,cz,urgent=false){const key=chunkKey(cx,cz);if(queued.has(key)){if(urgent)dirtyAfter.add(key);return;}queued.add(key);const request={cx,cz,key};if(urgent)queue.unshift(request);else queue.push(request);pump();}
function pump(){if(busy||!worker||queue.length===0)return;busy=true;const d=queue.shift();worker.postMessage({type:'chunk',cx:d.cx,cz:d.cz,token:++token});}
function updateStreaming(force=false){
 if(!world||!player)return;const cx=Math.floor(player.x/16),cz=Math.floor(player.z/16),newCenter=chunkKey(cx,cz);if(!force&&center===newCenter)return;center=newCenter;
 const r=settings.distance,needed=[];for(let dz=-r;dz<=r;dz++)for(let dx=-r;dx<=r;dx++)if(dx*dx+dz*dz<=(r+.5)*(r+.5))needed.push({cx:cx+dx,cz:cz+dz,dist:dx*dx+dz*dz});needed.sort((a,b)=>a.dist-b.dist);
 // Drop obsolete requests before queuing the new neighborhood.
 for(let i=queue.length-1;i>=0;i--)if(Math.abs(queue[i].cx-cx)>r+1||Math.abs(queue[i].cz-cz)>r+1){queued.delete(queue[i].key);queue.splice(i,1);}
 for(const n of needed)if(!chunks.has(chunkKey(n.cx,n.cz)))enqueue(n.cx,n.cz);
 for(const[k,g]of chunks){const[x,z]=k.split(',').map(Number);if(Math.abs(x-cx)>r+1||Math.abs(z-cz)>r+1){scene.remove(g);g.children.forEach(m=>m.geometry.dispose());chunks.delete(k);}}
 world.trim(cx,cz,r+2);scene.fog.near=Math.max(18,(r-1)*16);scene.fog.far=r*16+9;
}
async function initWorld(seed,save=null,newMode='survival'){
 controls.setActive(false);clearDropSprites();worker?.terminate();disposeChunks();game=new Survival(save?.game??{mode:save?'creative':newMode});mining=null;fallPeak=null;queue.length=0;queued.clear();dirtyAfter.clear();busy=false;center='';initialCount=0;loaded=0;ready=false;
 $('play').disabled=true;$('play-label').textContent='Préparation du monde…';
 world=new World(seed,save?.edits??[]);const spawn=world.spawn();player={...spawn,yaw:-.7,pitch:-.2,vy:0,flying:false,grounded:false,...save?.player};player.pitch=clamp(player.pitch,-1.5,1.5);player.vy=0;if(game.mode==='survival')player.flying=false;
 hotbar=save?.hotbar??[...DEFAULT_HOTBAR];selected=0;hasSaved=!!save;updateHotbar();updateHeld();updateFlightUI();updateVitals();
 const epochWorld=world;worker=new Worker(new URL('./worker.js',import.meta.url),{type:'module'});worker.postMessage({type:'init',seed:world.seed,edits:world.serializeEdits()});
 worker.onerror=e=>{if(epochWorld===world)fatal('Le calcul du monde s’est interrompu. Recharge la page. '+(e.message??''));};
 worker.onmessage=({data:d})=>{
  if(epochWorld!==world)return;
  if(d.type==='error'){fatal('Une erreur est survenue pendant la génération : '+d.message);return;}
  if(d.type!=='chunk')return;const k=chunkKey(d.cx,d.cz);busy=false;queued.delete(k);installChunk(d);loaded++;
  const pcx=Math.floor(player.x/16),pcz=Math.floor(player.z/16);if(!ready&&Math.abs(d.cx-pcx)<=1&&Math.abs(d.cz-pcz)<=1){initialCount++;$('loading-progress').style.width=`${Math.min(100,initialCount/9*100)}%`;if(initialCount>=9){ready=true;$('play').disabled=false;$('play-label').textContent=hasSaved?'Reprendre le monde':'Entrer dans le monde';$('new-world').classList.remove('hidden');$('menu-status').textContent=(game.mode==='survival'?'Survie':'Créatif')+' • Graine : '+world.seed;initialReady?.();initialReady=null;}}
  if(dirtyAfter.delete(k))enqueue(d.cx,d.cz,true);pump();
 };
 updateStreaming(true);return new Promise(resolve=>{initialReady=resolve;});
}
function markDirty(x,z){const cx=Math.floor(x/16),cz=Math.floor(z/16);enqueue(cx,cz,true);const lx=((x%16)+16)%16,lz=((z%16)+16)%16;if(lx===0)enqueue(cx-1,cz,true);if(lx===15)enqueue(cx+1,cz,true);if(lz===0)enqueue(cx,cz-1,true);if(lz===15)enqueue(cx,cz+1,true);}
function setBlock(x,y,z,id){if(!world.set(x,y,z,id))return false;worker.postMessage({type:'edit',x,y,z,id});markDirty(x,z);clearTimeout(saveTimer);saveTimer=setTimeout(()=>save(false),1200);return true;}
function breakTarget(h){
 const heldStack=game.slots[selected];if(h.y===0||h.id===B.BEDROCK&&game.mode==='survival')return false;
 if(!setBlock(h.x,h.y,h.z,B.AIR))return false;
 if(game.mode==='survival'){
  for(const[id,count]of harvest(h.id,heldStack))spawnDrop(id,count,h.x+.5,h.y+.3,h.z+.5);
  if(useTool(game,selected))toast('Ton outil s’est cassé.');
 }
 if(h.id===B.FURNACE){const key=`${h.x},${h.y},${h.z}`,f=game.furnaces[key];if(f){for(const k of['input','fuel','output'])if(f[k])spawnDrop(f[k].id,f[k].count,h.x+.5,h.y+.3,h.z+.5,f[k].durability);delete game.furnaces[key];}}
 burst(h.x,h.y,h.z,h.id);sound.play('break');refreshInventory();return true;
}
function action(kind){
 if(state!=='playing'||!ready)return;updateTarget();const h=lastTarget;actionTime=performance.now();swing=1;
 if(kind==='break'){if(!h)return;if(game.mode==='creative')breakTarget(h);else if(h.y>0&&h.id!==B.BEDROCK){const key=`${h.x},${h.y},${h.z}`;if(mining?.key!==key)mining={key,time:0,id:heldId()};}return;}
 if(h&&!controls.read().down){if(h.id===B.CRAFT){craftSize=3;openPanel('inventory');return;}if(h.id===B.FURNACE){const key=`${h.x},${h.y},${h.z}`;game.furnaces[key]??=newFurnace();setState('furnace');gui.openFurnace(key);return;}}
 if(game.mode==='survival'&&ITEMS.get(heldId())?.food){if(game.eat(selected)){sound.play('place');refreshInventory();}else toast('Tu n’as pas faim.');return;}
 const id=heldId();if(!h||!ITEMS.get(id)?.block)return;
 const x=h.x+h.normal.x,y=h.y+h.normal.y,z=h.z+h.normal.z;if(y<1||y>=HEIGHT){toast('Limite de construction : 79 blocs.');return;}if(BLOCKS[id].solid&&overlapsBlock(player,x,y,z))return;if(getBlock(x,y,z)!==0&&getBlock(x,y,z)!==B.WATER)return;
 if(setBlock(x,y,z,id)){if(game.mode==='survival')take(game.slots,selected);if(id===B.FURNACE)game.furnaces[`${x},${y},${z}`]=newFurnace();sound.play('place');refreshInventory();}
}
function tickMining(dt){
 const h=lastTarget;if(game.mode!=='survival'||!controls.holds.has('break')||!h||h.y===0||h.id===B.BEDROCK){mining=null;cracks.visible=false;$('mining-bar').classList.add('hidden');return;}
 const key=`${h.x},${h.y},${h.z}`;if(mining?.key!==key||mining.id!==heldId())mining={key,time:0,id:heldId()};mining.time+=dt;const info=miningInfo(h.id,game.slots[selected]),progress=Math.min(1,mining.time/Math.max(.05,info.seconds));$('mining-bar').classList.remove('hidden');$('mining-bar').firstElementChild.style.width=`${progress*100}%`;cracks.visible=true;cracks.position.copy(selection.position);const stage=Math.min(9,Math.floor(progress*10));if(stage!==crackStage){crackStage=stage;const c=crackCanvas.getContext('2d'),img=textureImage('crack_anylength');c.clearRect(0,0,16,16);if(img)c.drawImage(img,0,stage*16,16,16,0,0,16,16);crackTexture.needsUpdate=true;}
 swing=Math.max(swing,.3+Math.sin(mining.time*15)*.15);if(progress>=1){breakTarget(h);mining=null;cracks.visible=false;}
}
function updateTarget(){camera.getWorldDirection(direction);lastTarget=raycast(getBlock,camera.position,direction,game.mode==='survival'?4.5:6);selection.visible=state==='playing'&&!!lastTarget;if(lastTarget){selection.position.set(lastTarget.x+.5,lastTarget.y+.5,lastTarget.z+.5);$('target-label').textContent=BLOCKS[lastTarget.id].name;}else $('target-label').textContent='';}
function selectSlot(n){selected=clamp(n,0,8);updateHotbar();updateHeld();$('selected-label').style.opacity='1';setTimeout(()=>{$('selected-label').style.opacity='.65';},1700);}
function updateHotbar(){
 for(const id of['hotbar','inventory-hotbar']){$(id).replaceChildren();hotbar.forEach((block,i)=>{const b=document.createElement('button');b.classList.toggle('selected',i===selected);b.setAttribute('aria-pressed',i===selected?'true':'false');const stack=game.mode==='survival'?game.slots[i]:newStack(block);fillSlot(b,stack,{number:id==='hotbar'?i+1:undefined});b.addEventListener('click',()=>selectSlot(i));$(id).append(b);});}
 $('selected-label').textContent=itemName(heldId());
}
function pickBlock(){if(!lastTarget||game.mode!=='creative')return;const found=hotbar.indexOf(lastTarget.id);if(found>=0)selectSlot(found);else{hotbar[selected]=lastTarget.id;selectSlot(selected);}toast(BLOCKS[lastTarget.id].name);}
function toggleFlight(){if(state!=='playing'||game.mode!=='creative')return;player.flying=!player.flying;player.vy=0;updateFlightUI();toast(player.flying?(controls.touch?'Vol activé · Monte et descends avec les boutons à droite.':'Vol activé · Espace pour monter, Maj pour descendre.'):'Vol désactivé');}
function updateFlightUI(){document.body.classList.toggle('flying',!!player?.flying);$('flight').classList.toggle('active',!!player?.flying);$('flight').setAttribute('aria-label',player?.flying?'Désactiver le vol':'Activer le vol');$('flight').title=(player?.flying?'Désactiver le vol':'Activer le vol')+' (F)';$('world-mode').textContent=game.mode==='survival'?'Survie':player?.flying?'Créatif · En vol':'Créatif';}
function setState(value){state=value;document.body.classList.toggle('playing',value==='playing');$('menu').classList.toggle('hidden',value!=='menu');$('hud').classList.toggle('hidden',value==='menu'||value==='loading');$('modal-layer').classList.toggle('hidden',!['pause','inventory','settings','help','new','furnace','death'].includes(value));document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('hidden',p.id!==`${value}-panel`));controls.setActive(value==='playing');selection.visible=false;mining=null;cracks.visible=false;$('mining-bar').classList.add('hidden');updateHeld();}
function startPlay(){if(!ready)return;sound.unlock();setState('playing');controls.capture();$('touch-hint').style.opacity='1';setTimeout(()=>$('touch-hint').style.opacity='0',8000);save(false);}
function pause(){if(state!=='playing')return;setState('pause');save(false);}
function openPanel(name){if(name==='settings'||name==='help'||name==='new')returnPanel=state==='menu'?'menu':'pause';setState(name);if(name==='inventory')gui.renderInventory(craftSize);if(name==='settings')syncSettings();if(name==='new'){$('seed-input').value='';$('replace-warning').classList.toggle('hidden',!hasSaved);}}
function closePanel(){if(state==='menu'||state==='loading'||state==='death')return;if(state==='inventory'){returnCrafting(game);refreshInventory();craftSize=2;}if(['settings','help','new'].includes(state))setState(returnPanel);else{setState('playing');controls.capture();}}
function snapshot(){return{format:'blockfield',version:SAVE_VERSION,seed:world.seed,updatedAt:new Date().toISOString(),edits:world.serializeEdits(),game:game.serialize(),hotbar:[...hotbar],player:{x:player.x,y:player.y,z:player.z,yaw:player.yaw,pitch:player.pitch,flying:!!player.flying}};}
async function save(notify=true){
 if(!world||!ready)return;const data=snapshot(),savedWorld=world;$('save-status').textContent='Sauvegarde en cours…';
 const task=saveChain.catch(()=>{}).then(()=>storeSave(data));saveChain=task;
 try{await task;if(world===savedWorld){hasSaved=true;lastSaveTime=performance.now();$('save-status').textContent='Monde sauvegardé · '+new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});if(notify)toast('Monde sauvegardé sur cet appareil.');}}
 catch(e){$('save-status').textContent=e.message;toast(e.message);}
}
function exportWorld(){if(!world||!ready)return;const blob=new Blob([JSON.stringify(snapshot())],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`minecraft-web-${world.seed.replace(/[^a-z0-9-]/gi,'-').slice(0,32)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);toast('Ton monde a été exporté.');}
async function importWorld(file){
 if(!file)return;try{if(file.size>50*1024*1024)throw Error('Ce fichier est trop volumineux (50 Mo maximum).');const data=validateSave(JSON.parse(await file.text()));if(hasSaved&&!confirm('Importer ce monde remplacera la sauvegarde locale. As-tu exporté ton monde actuel si tu veux le garder ?'))return;
  setState('loading');$('loading').classList.remove('hidden');await initWorld(data.seed,data);await save(false);$('loading').classList.add('hidden');startPlay();toast('Monde importé.');
 }catch(e){$('loading').classList.add('hidden');setState('menu');toast(e instanceof SyntaxError?'Le fichier JSON est illisible.':e.message);}finally{$('import-file').value='';}
}
let category='all';
function renderInventory(){
 const q=$('block-search').value.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();const list=Array.from(ITEMS.values()).filter(b=>(category==='all'||b.category===category||category==='tools'&&b.tool)&&b.name.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().includes(q));$('block-grid').replaceChildren();
 for(const block of list){const b=document.createElement('button'),img=document.createElement('img'),label=document.createElement('span');img.src=itemIcon(block.id);img.alt='';label.textContent=block.name;b.append(img,label);b.title=block.name;b.addEventListener('click',()=>{hotbar[selected]=block.id;updateHotbar();updateHeld();$('inventory-instruction').textContent=`${block.name} ajouté à l’emplacement ${selected+1}.`;sound.play('place');});$('block-grid').append(b);}if(!list.length){const p=document.createElement('p');p.className='empty';p.textContent='Aucun bloc trouvé. Essaie un autre nom.';$('block-grid').append(p);}
}
function applySettings(){controls.applyMode();document.body.classList.toggle('has-coordinates',settings.coordinates);document.documentElement.style.setProperty('--touch-opacity',settings.opacity);$('coordinates').classList.toggle('hidden',!settings.coordinates);$('performance').classList.toggle('hidden',!settings.fps);camera.fov=settings.fov;camera.updateProjectionMatrix();if(world)updateStreaming(true);storeSettings(settings);}
function syncSettings(){for(const key of['controls','distance','sensitivity','fov','opacity','volume'])$(`setting-${key}`).value=settings[key];for(const key of['autojump','coordinates','fps'])$(`setting-${key}`).checked=settings[key];updateSettingLabels();}
function updateSettingLabels(){$('distance-value').textContent=`${settings.distance} portions · ${settings.distance*16} blocs`;$('sensitivity-value').textContent=`${settings.sensitivity.toFixed(1)}×`;$('fov-value').textContent=`${settings.fov}°`;$('opacity-value').textContent=`${Math.round((1-settings.opacity)*100)} %`;$('volume-value').textContent=`${Math.round(settings.volume*100)} %`;}

$('play').onclick=startPlay;$('new-world').onclick=()=>openPanel('new');$('menu-settings').onclick=()=>openPanel('settings');$('menu-help').onclick=()=>openPanel('help');$('menu-import').onclick=()=>$('import-file').click();$('pause-settings').onclick=()=>openPanel('settings');$('pause-help').onclick=()=>openPanel('help');$('resume').onclick=()=>{setState('playing');controls.capture();};$('pause-button').onclick=pause;$('inventory-button').onclick=()=>{craftSize=2;openPanel('inventory');};$('flight').onclick=toggleFlight;$('save-now').onclick=()=>save();$('export-world').onclick=exportWorld;
$('quit').onclick=async()=>{await save(false);setState('menu');$('play-label').textContent='Reprendre le monde';$('new-world').classList.remove('hidden');};
$('respawn').onclick=()=>{respawnPlayer();toast('Retour au point de départ.');};
$('death-respawn').onclick=respawnPlayer;
$('mode-button').onclick=()=>{returnCrafting(game);game.mode=game.mode==='creative'?'survival':'creative';player.flying=false;player.vy=0;game.health=Math.max(1,game.health);fallPeak=null;updateFlightUI();refreshInventory();toast(game.mode==='survival'?'Mode Survie : inventaire limité et récolte activée.':'Mode Créatif : blocs illimités et vol disponibles.');save(false);};
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else toast('Sur cet appareil, ajoute le jeu à l’écran d’accueil pour jouer en plein écran.');}catch{toast('Le plein écran n’est pas disponible dans ce navigateur.');}};
$('create-world').onclick=async()=>{if(!ready)return;const seed=$('seed-input').value.trim()||`Monde-${Math.random().toString(36).slice(2,8)}`;setState('loading');$('loading').classList.remove('hidden');await initWorld(seed,null,$('new-mode').value);$('loading').classList.add('hidden');startPlay();};
$('import-file').onchange=e=>importWorld(e.target.files[0]);document.querySelectorAll('[data-close]').forEach(b=>b.onclick=closePanel);document.querySelectorAll('[data-back]').forEach(b=>b.onclick=closePanel);
$('block-search').oninput=renderInventory;document.querySelectorAll('[data-category]').forEach(b=>b.onclick=()=>{category=b.dataset.category;document.querySelectorAll('[data-category]').forEach(t=>{t.classList.toggle('active',t===b);t.setAttribute('aria-selected',t===b?'true':'false');});renderInventory();});
for(const key of['controls','distance','sensitivity','fov','opacity','volume','autojump','coordinates','fps'])$(`setting-${key}`).addEventListener('input',e=>{settings[key]=['autojump','coordinates','fps'].includes(key)?e.target.checked:key==='controls'?e.target.value:Number(e.target.value);updateSettingLabels();applySettings();});
window.addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)save(false);});window.addEventListener('pagehide',()=>save(false));
setInterval(()=>{if(ready&&state!=='loading')save(false);},20000);

function playerTick(dt){
 const look=controls.consumeLook();player.yaw-=look.x;player.pitch=clamp(player.pitch-look.y,-1.54,1.54);const input=controls.read();if(game.mode==='survival'&&game.hunger<6)input.sprint=false;
 const safeGet=(x,y,z)=>{if(y<0)return B.BEDROCK;if(y>=HEIGHT)return B.AIR;return chunks.has(chunkKey(Math.floor(x/16),Math.floor(z/16)))?getBlock(x,y,z):B.BEDROCK;};
 const before={x:player.x,y:player.y,z:player.z,grounded:player.grounded};const result=stepPhysics(player,input,safeGet,dt);if(player.y<1){damage(20);if(game.mode==='creative')Object.assign(player,world.spawn(),{vy:0});}
 const distance=Math.hypot(player.x-before.x,player.z-before.z),moving=distance>.001;walkPhase+=moving?dt*(input.sprint?14:10):0;
 if(result.water||player.flying)fallPeak=null;else if(!player.grounded)fallPeak=Math.max(fallPeak??before.y,player.y);else if(!before.grounded&&fallPeak!==null){const amount=Math.floor(fallPeak-player.y-3);fallPeak=null;if(amount>0)damage(amount);}
 const health=game.health;game.tick(dt,{distance,sprinting:input.sprint,jumped:input.jump&&before.grounded&&!player.grounded,underwater:getBlock(player.x,player.y+EYE_HEIGHT,player.z)===B.WATER});if(game.health<health){$('damage-overlay').classList.add('hit');setTimeout(()=>$('damage-overlay').classList.remove('hit'),250);}if(game.health<=0)die();
 if(moving&&player.grounded){stepTime+=dt;if(stepTime>.38){sound.play('step');stepTime=0;}}updateStreaming();
}
function frame(timestamp){
 requestAnimationFrame(frame);const dt=Math.min((timestamp-lastTimestamp)/1000||.016,.08);lastTimestamp=timestamp;frameCount++;fpsTime+=dt;if(fpsTime>=.6){fps=Math.round(frameCount/fpsTime);fpsTime=frameCount=0;}
 if(player&&world){
  if(state==='playing'){
   accumulator=Math.min(accumulator+dt,.1);while(accumulator>=1/60){playerTick(1/60);accumulator-=1/60;}
   camera.position.set(player.x,player.y+EYE_HEIGHT,player.z);camera.rotation.set(player.pitch,player.yaw,0,'YXZ');updateTarget();
   if(performance.now()-actionTime>180){if(controls.holds.has('break')&&game.mode==='creative')action('break');else if(controls.holds.has('place'))action('place');}tickMining(dt);
   swing=Math.max(0,swing-dt*5);held.position.set((camera.aspect<.8?.17:.43)-Math.sin(swing*Math.PI)*.1,-.36-Math.sin(walkPhase)*.012-Math.sin(swing*Math.PI)*.08,-.75);held.rotation.z=-.12-Math.sin(swing*Math.PI)*.3;heldSprite.position.x=camera.aspect<.8?.17:.43;heldSprite.scale.setScalar(camera.aspect<.8?.22:.4);heldSprite.position.y=-.32-Math.sin(swing*Math.PI)*.1;
   const underwater=getBlock(player.x,player.y+EYE_HEIGHT,player.z)===B.WATER;sky.visible=!underwater;document.body.classList.toggle('underwater',underwater);scene.fog.color.set(underwater?'#438b9e':'#b3d6da');scene.background.set(underwater?'#438b9e':'#b3d6da');scene.fog.near=underwater?1:Math.max(18,(settings.distance-1)*16);scene.fog.far=underwater?22:settings.distance*16+9;
   if(settings.coordinates)$('coordinates').textContent=`XYZ ${player.x.toFixed(1)} / ${player.y.toFixed(1)} / ${player.z.toFixed(1)}`;
  }else if(state==='menu'){
   const spawn=world.spawn(),angle=timestamp*.000012;camera.position.set(spawn.x+Math.sin(angle+.7)*26,spawn.y+12,spawn.z+Math.cos(angle+.7)*26);targetPos.set(spawn.x,spawn.y+1,spawn.z);camera.lookAt(targetPos);held.visible=false;heldSprite.visible=false;selection.visible=false;sky.visible=true;document.body.classList.remove('underwater');scene.background.set('#b3d6da');scene.fog.color.set('#b3d6da');
  }
  if(settings.fps)$('performance').textContent=`${fps} FPS · ${chunks.size} portions · ${Math.round(renderer.info.render.triangles/1000)}k triangles`;
  sky.position.copy(camera.position);cloudGroup.position.set(Math.floor(camera.position.x/180)*180+(timestamp*.0002)%30,0,Math.floor(camera.position.z/180)*180);sun.position.copy(camera.position).add(new THREE.Vector3(-80,95,-130));sun.lookAt(camera.position);
 }
 if(player){const active=['playing','inventory','furnace'].includes(state);updateDrops(state==='playing'?dt:0);if(active)for(const f of Object.values(game.furnaces))tickFurnace(f,dt);guiClock+=dt;if(guiClock>.2){guiClock=0;updateVitals();if(state==='furnace')gui.updateFurnace();}}
 updateParticles(dt);renderer.render(scene,camera);
}
applySettings();requestAnimationFrame(frame);
try{let saved=null;try{saved=await loadSave();}catch(e){toast(e.message);}await initWorld(saved?.seed??'Blockfield',saved);}
catch(e){fatal('Le jeu n’a pas pu préparer le monde : '+e.message);}

// Read-only counters for diagnostics, without exposing mutation commands.
Object.defineProperty(window,'blockfield',{get:()=>({version:'0.2.0',state,ready,seed:world?.seed,loadedChunks:chunks.size,pending:queue.length+(busy?1:0),edits:world?.serializeEdits().length??0,player:player?{...player}:null,fps,renderer:{calls:renderer.info.render.calls,triangles:renderer.info.render.triangles},touch:controls.touch})});

$('import-textures').onclick=()=>$('texture-file').click();
$('texture-file').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{const textures=parseResourcePack(new Uint8Array(await file.arrayBuffer()));localStorage.setItem('blockfield-java-textures',JSON.stringify(textures));await save(false);location.reload();}catch(error){toast(error.message);}finally{e.target.value='';}};
$('reset-textures').onclick=async()=>{localStorage.removeItem('blockfield-java-textures');await save(false);location.reload();};

try{const t=JSON.parse(localStorage.getItem('blockfield-java-textures')??'null');$('texture-status').textContent=t?'Textures Java locales : '+Object.keys(t).length+' image(s)':'Textures par défaut : Pixel Perfection / VoxeLibre';}catch{}
