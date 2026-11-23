import {B, BLOCKS,isSolid} from './blocks.js';
export const SIZE=16, HEIGHT=80, SEA=22, SAVE_VERSION=1;
export const chunkKey=(x,z)=>`${x},${z}`;
export const blockKey=(x,y,z)=>`${x},${y},${z}`;
export const index=(x,y,z)=>(y*SIZE+z)*SIZE+x;
export function seedNumber(text){let n=2166136261;for(const c of String(text)){n^=c.charCodeAt(0);n=Math.imul(n,16777619);}return n>>>0;}
function hash(x,y,z,s){let n=Math.imul(x,374761393)^Math.imul(y,668265263)^Math.imul(z,2147483647)^s;n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967295;}
const smooth=t=>t*t*(3-2*t),lerp=(a,b,t)=>a+(b-a)*t;
export class Generator{
 constructor(seed='Pearly'){this.seed=seedNumber(seed);}
 noise(x,z,salt=0){const ix=Math.floor(x),iz=Math.floor(z),u=smooth(x-ix),v=smooth(z-iz),s=this.seed^salt;return lerp(lerp(hash(ix,0,iz,s),hash(ix+1,0,iz,s),u),lerp(hash(ix,0,iz+1,s),hash(ix+1,0,iz+1,s),u),v)*2-1;}
 column(x,z){const n=this.noise(x*.007,z*.007,124);let h=29+n*15+this.noise(x*.029,z*.029,823)*6+this.noise(x*.075,z*.075,42)*2;const mountain=Math.max(0,this.noise(x*.012,z*.012,711)-.24);h+=mountain*30;const spawn=Math.max(0,1-Math.hypot(x-8,z-8)/18);h=lerp(h,30,spawn*.94);const height=Math.max(6,Math.min(HEIGHT-12,Math.floor(h)));return{height,desert:this.noise(x*.009,z*.009,369)>.29,snow:height>47};}
 generate(cx,cz){
  const a=new Uint8Array(SIZE*SIZE*HEIGHT);const ox=cx*SIZE,oz=cz*SIZE;
  for(let z=0;z<SIZE;z++)for(let x=0;x<SIZE;x++){
   const wx=ox+x,wz=oz+z,col=this.column(wx,wz),h=col.height;const sandy=col.desert||h<=SEA+1;const tunnel=this.noise(wx*.055,wz*.055,918),caveY=9+this.noise(wx*.035,wz*.035,538)*6;
   for(let y=0;y<=Math.max(h,SEA);y++){
    let id=y===0?B.BEDROCK:y>h?B.WATER:y===h?(col.snow?B.SNOW:sandy?B.SAND:B.GRASS):y>h-4?(sandy?B.SAND:B.DIRT):B.STONE;
    if(id===B.STONE){if(Math.abs(tunnel)<.15&&Math.abs(y-caveY)<3.2&&y<h-6)id=B.AIR;else {const r=hash(wx>>1,y>>1,wz>>1,this.seed);if(r>.963)id=B.COAL;else if(r>.944&&y<24)id=B.IRON;else if(r>.937&&y<16)id=B.GOLD;else if(r>.933&&y<11)id=B.DIAMOND;else if(r>.929&&y<13)id=B.REDSTONE;}}
    a[index(x,y,z)]=id;
   }
  }
  const set=(x,y,z,id,leaves=false)=>{x-=ox;z-=oz;if(x<0||x>=16||z<0||z>=16||y<0||y>=HEIGHT)return;const i=index(x,y,z);if(!leaves||a[i]===0)a[i]=id;};
  // Tree anchors depend on world coordinates, so chunk borders match exactly.
  for(let gz=Math.floor((oz-3)/7);gz<=Math.floor((oz+18)/7);gz++)for(let gx=Math.floor((ox-3)/7);gx<=Math.floor((ox+18)/7);gx++){
   if(hash(gx,72,gz,this.seed)>.45)continue;const tx=gx*7+1+Math.floor(hash(gx,34,gz,this.seed)*5),tz=gz*7+1+Math.floor(hash(gx,57,gz,this.seed)*5);if(Math.hypot(tx-8,tz-8)<7)continue;const c=this.column(tx,tz);if(c.desert||c.height<=SEA+1||c.snow)continue;
   const base=c.height+1,top=base+4+(hash(gx,56,gz,this.seed)*2|0),birch=hash(gx,91,gz,this.seed)>.78;
   for(let y=top-2;y<=top+1;y++){const r=y===top+1?1:2;for(let dz=-r;dz<=r;dz++)for(let dx=-r;dx<=r;dx++){if(Math.abs(dx)===r&&Math.abs(dz)===r&&(y!==top||hash(tx+dx,y,tz+dz,this.seed)>.5))continue;set(tx+dx,y,tz+dz,B.LEAVES,true);}}
   for(let y=base;y<=top;y++)set(tx,y,tz,birch?B.BIRCH:B.LOG);
  }
  return a;
 }
}
export class World{
 constructor(seed='Pearly',edits=[]){this.seed=String(seed);this.generator=new Generator(seed);this.chunks=new Map();this.edits=new Map();this.revision=0;for(const e of edits)this.record(...e);}
 record(x,y,z,id){const ck=chunkKey(Math.floor(x/SIZE),Math.floor(z/SIZE));if(!this.edits.has(ck))this.edits.set(ck,new Map());this.edits.get(ck).set(blockKey(x,y,z),[x,y,z,id]);}
 generate(cx,cz){const k=chunkKey(cx,cz);if(this.chunks.has(k))return this.chunks.get(k);const a=this.generator.generate(cx,cz);for(const [x,y,z,id]of this.edits.get(k)?.values()??[])a[index(((x%16)+16)%16,y,((z%16)+16)%16)]=id;this.chunks.set(k,a);return a;}
 get(x,y,z){x=Math.floor(x);y=Math.floor(y);z=Math.floor(z);if(y<0)return B.BEDROCK;if(y>=HEIGHT)return B.AIR;const cx=Math.floor(x/16),cz=Math.floor(z/16);return this.generate(cx,cz)[index(x-cx*16,y,z-cz*16)];}
 set(x,y,z,id){if(!Number.isInteger(x)||!Number.isInteger(y)||!Number.isInteger(z)||y<1||y>=HEIGHT||!BLOCKS[id])return false;const cx=Math.floor(x/16),cz=Math.floor(z/16);this.generate(cx,cz)[index(x-cx*16,y,z-cz*16)]=id;this.record(x,y,z,id);this.revision++;return true;}
 serializeEdits(){return Array.from(this.edits.values()).flatMap(m=>Array.from(m.values()));}
 trim(cx,cz,r=8){for(const[k]of this.chunks){const[x,z]=k.split(',').map(Number);if(Math.abs(x-cx)>r||Math.abs(z-cz)>r)this.chunks.delete(k);}}
 spawn(){for(let r=0;r<20;r++)for(let z=8-r;z<=8+r;z++)for(let x=8-r;x<=8+r;x++){const h=this.generator.column(x,z).height;if(h>SEA+1&&!isSolid(this.get(x,h+1,z))&&!isSolid(this.get(x,h+2,z)))return{x:x+.5,y:h+1.02,z:z+.5};}return{x:8.5,y:65,z:8.5};}
}
// Grid traversal is independent of rendering: selecting a block does not depend
// on whether its mesh has finished updating.
export function raycast(get,origin,dir,reach=6){
 let x=Math.floor(origin.x),y=Math.floor(origin.y),z=Math.floor(origin.z);const steps=[Math.sign(dir.x),Math.sign(dir.y),Math.sign(dir.z)],p=[origin.x,origin.y,origin.z],d=[dir.x,dir.y,dir.z],v=[x,y,z];const delta=d.map(n=>n===0?Infinity:Math.abs(1/n));const max=d.map((n,i)=>n===0?Infinity:((n>0?v[i]+1:v[i])-p[i])/n);let distance=0,normal={x:0,y:0,z:0};
 for(let i=0;i<200&&distance<=reach;i++){
  [x,y,z]=v;const id=get(x,y,z);if(id!==B.AIR&&id!==B.WATER)return{x,y,z,id,normal,distance};
  let axis=max[0]<max[1]?(max[0]<max[2]?0:2):(max[1]<max[2]?1:2);distance=max[axis];v[axis]+=steps[axis];max[axis]+=delta[axis];normal={x:0,y:0,z:0};normal[['x','y','z'][axis]]=-steps[axis];
 }return null;
}
export function validateSave(v){
 if(!v||v.format!=='blockfield'||v.version!==SAVE_VERSION||typeof v.seed!=='string'||v.seed.length>100||!Array.isArray(v.edits)||v.edits.length>500000)throw Error('Ce fichier n’est pas une sauvegarde Blockfield compatible.');
 for(const e of v.edits)if(!Array.isArray(e)||e.length!==4||!e.every(Number.isInteger)||Math.abs(e[0])>1e7||Math.abs(e[2])>1e7||e[1]<1||e[1]>=HEIGHT||e[3]<0||e[3]>=BLOCKS.length)throw Error('La sauvegarde contient des blocs invalides.');
 if(v.player){if(!['x','y','z','yaw','pitch'].every(k=>Number.isFinite(v.player[k]))||Math.abs(v.player.x)>1e7||Math.abs(v.player.z)>1e7||v.player.y<0||v.player.y>10000)throw Error('Position de joueur invalide.');}
 if(v.hotbar&&(!Array.isArray(v.hotbar)||v.hotbar.length!==9||!v.hotbar.every(n=>Number.isInteger(n)&&n>0&&n<BLOCKS.length)))throw Error('Inventaire invalide.');return v;
}
