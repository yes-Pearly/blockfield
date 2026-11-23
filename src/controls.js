export class Controls{
 constructor(canvas,callbacks,settings){
  this.canvas=canvas;this.callbacks=callbacks;this.settings=settings;this.keys=new Set();this.holds=new Set();this.lookX=0;this.lookY=0;this.stick={x:0,y:0};this.pointer=null;this.joyPointer=null;this.lastSpace=0;this.active=false;this.touch=false;this.buttonResetters=[];
  this.applyMode();
  window.addEventListener('keydown',e=>this.key(e,true));window.addEventListener('keyup',e=>this.key(e,false));window.addEventListener('blur',()=>{this.reset();if(this.active)this.callbacks.pause();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){this.reset();if(this.active)this.callbacks.pause();}});
  document.addEventListener('pointerlockchange',()=>{if(!document.pointerLockElement&&this.active&&!this.touch)this.callbacks.pause();});
  canvas.addEventListener('contextmenu',e=>e.preventDefault());
  canvas.addEventListener('pointerdown',e=>{
   if(!this.active)return;this.callbacks.gesture();e.preventDefault();
   if(e.pointerType==='touch'||this.touch){if(this.pointer!==null)return;this.pointer=e.pointerId;this.lastX=e.clientX;this.lastY=e.clientY;canvas.setPointerCapture(e.pointerId);}
   else if(document.pointerLockElement===canvas){if(e.button===1)this.callbacks.pick();else this.startHold(e.button===2?'place':'break');}
   else {this.capture();this.startHold(e.button===2?'place':'break');this.pointer=e.pointerId;this.lastX=this.startX=e.clientX;this.lastY=this.startY=e.clientY;canvas.setPointerCapture(e.pointerId);}
  });
  canvas.addEventListener('pointermove',e=>{
   if(!this.active)return;
   if(document.pointerLockElement===canvas&&e.pointerType!=='touch'){this.lookX+=e.movementX;this.lookY+=e.movementY;}
   else if(this.pointer===e.pointerId){this.lookX+=e.clientX-this.lastX;this.lookY+=e.clientY-this.lastY;this.lastX=e.clientX;this.lastY=e.clientY;}
  });
  const end=e=>{if(e.pointerId===this.pointer){this.pointer=null;}if(e.pointerType==='mouse'&&!this.touch)this.holds.delete(e.button===2?'place':'break');};canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);canvas.addEventListener('lostpointercapture',()=>{this.pointer=null;});
  window.addEventListener('pointerup',e=>{if(e.pointerType==='mouse'){this.holds.delete(e.button===2?'place':'break');}});
  canvas.addEventListener('wheel',e=>{if(this.active){e.preventDefault();callbacks.slot(Math.sign(e.deltaY));}},{passive:false});
  const joy=document.getElementById('joystick'),stick=document.getElementById('stick');
  const move=e=>{if(this.joyPointer!==e.pointerId)return;const r=joy.getBoundingClientRect();let dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2;const max=r.width*.3,len=Math.hypot(dx,dy);if(len>max){dx*=max/len;dy*=max/len;}const dead=.12;this.stick.x=Math.abs(dx/max)<dead?0:dx/max;this.stick.y=Math.abs(dy/max)<dead?0:dy/max;stick.style.transform=`translate(${dx}px,${dy}px)`;};
  joy.addEventListener('pointerdown',e=>{if(!this.active||this.joyPointer!==null)return;e.preventDefault();this.callbacks.gesture();this.joyPointer=e.pointerId;joy.setPointerCapture(e.pointerId);move(e);});joy.addEventListener('pointermove',move);
  const joyEnd=e=>{if(this.joyPointer!==e.pointerId)return;this.joyPointer=null;this.stick.x=this.stick.y=0;stick.style.transform='';};joy.addEventListener('pointerup',joyEnd);joy.addEventListener('pointercancel',joyEnd);joy.addEventListener('lostpointercapture',joyEnd);
  for(const[id,action]of[['break-block','break'],['place-block','place'],['jump','jump'],['down','down']]){
   const b=document.getElementById(id);let pointer=null;this.buttonResetters.push(()=>{pointer=null;b.classList.remove('held');});b.addEventListener('pointerdown',e=>{if(!this.active||pointer!==null)return;e.preventDefault();this.callbacks.gesture();pointer=e.pointerId;b.setPointerCapture(e.pointerId);b.classList.add('held');this.startHold(action);});const release=e=>{if(pointer!==e.pointerId)return;pointer=null;this.holds.delete(action);b.classList.remove('held');};b.addEventListener('pointerup',release);b.addEventListener('pointercancel',release);b.addEventListener('lostpointercapture',release);
  }
 }
 applyMode(){this.touch=this.settings.controls==='touch'||(this.settings.controls==='auto'&&(matchMedia('(pointer:coarse)').matches||navigator.maxTouchPoints>0));document.body.classList.toggle('controls-touch',this.touch);}
 setActive(active){this.active=active;this.reset();if(!active&&document.pointerLockElement)document.exitPointerLock();}
 capture(){if(!this.active||this.touch)return;try{const promise=this.canvas.requestPointerLock?.();promise?.catch(()=>this.callbacks.notice('Glisse sur le monde pour regarder si la souris ne se capture pas.'));}catch{this.callbacks.notice('Glisse sur le monde pour regarder autour de toi.');}}
 startHold(action){this.holds.add(action);if(action==='break'||action==='place')this.callbacks.action(action);}
 reset(){for(const release of this.buttonResetters??[])release();this.keys.clear();this.holds.clear();this.stick.x=this.stick.y=0;this.lookX=this.lookY=0;this.pointer=this.joyPointer=null;const s=document.getElementById('stick');if(s)s.style.transform='';document.querySelectorAll('.held').forEach(b=>b.classList.remove('held'));}
 key(e,down){
  if(!down){this.keys.delete(e.code);return;}
  if(e.code==='Escape'){if(this.active)this.callbacks.pause();else this.callbacks.close();return;}
  if(['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName))return;
  if(!this.active){if(e.code==='KeyE')this.callbacks.close();return;}
  const codes=['Space','ShiftLeft','ShiftRight','ControlLeft','ControlRight','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyA','KeyS','KeyD','KeyZ','KeyQ','KeyF','KeyE','KeyG','Digit1','Digit2','Digit3','Digit4','Digit5','Digit6','Digit7','Digit8','Digit9'];if(codes.includes(e.code))e.preventDefault();if(e.repeat)return;this.keys.add(e.code);this.callbacks.gesture();
  if(e.code==='KeyE')this.callbacks.inventory();if(e.code==='KeyF')this.callbacks.flight();if(e.code==='KeyG')this.callbacks.drop?.();if(/^Digit[1-9]$/.test(e.code))this.callbacks.select(Number(e.code.slice(-1))-1);
  if(e.code==='Space'){const now=performance.now();if(now-this.lastSpace<280){this.callbacks.flight();this.lastSpace=0;}else this.lastSpace=now;}
 }
 read(){const k=this.keys;const has=(...codes)=>codes.some(c=>k.has(c));return{forward:(has('KeyW','KeyZ','ArrowUp')?1:0)-(has('KeyS','ArrowDown')?1:0)-this.stick.y,right:(has('KeyD','ArrowRight')?1:0)-(has('KeyA','KeyQ','ArrowLeft')?1:0)+this.stick.x,jump:has('Space')||this.holds.has('jump'),down:has('ShiftLeft','ShiftRight')||this.holds.has('down'),sprint:has('ControlLeft','ControlRight'),autoJump:this.touch&&this.settings.autojump};}
 consumeLook(){const f=(this.touch?.004:.0022)*this.settings.sensitivity;const out={x:this.lookX*f,y:this.lookY*f};this.lookX=this.lookY=0;return out;}
}
