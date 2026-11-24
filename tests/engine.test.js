import test from 'node:test';
import assert from 'node:assert/strict';
import {World,Generator,raycast,index,HEIGHT,validateSave,SAVE_VERSION} from '../src/world.js';
import {B,BLOCKS} from '../src/blocks.js';
import {meshChunk} from '../src/mesh.js';
import {stepPhysics,overlapsBlock} from '../src/physics.js';

test('generation is reproducible, seed-dependent, and independent of chunk request order',()=>{
 const a=new World('test'),b=new World('test');a.generate(-1,0);a.generate(0,0);b.generate(0,0);b.generate(-1,0);assert.deepEqual(a.generate(-1,0),b.generate(-1,0));assert.deepEqual(a.generate(0,0),b.generate(0,0));assert.notDeepEqual(a.generate(0,0),new World('other').generate(0,0));
});
test('negative coordinates, chunk eviction, and save round-trip preserve edits',()=>{
 const a=new World('edits');a.set(-1,51,-17,B.DIAMOND);a.set(16,53,0,B.GLASS);a.set(0,30,0,B.AIR);a.trim(100,100,1);assert.equal(a.chunks.size,0);assert.equal(a.get(-1,51,-17),B.DIAMOND);const b=new World(a.seed,a.serializeEdits());assert.equal(b.get(16,53,0),B.GLASS);assert.equal(b.get(-1,51,-17),B.DIAMOND);assert.equal(b.get(0,30,0),B.AIR);
});
test('spawn is above dry terrain with enough headroom',()=>{for(const seed of['Pearly — Les terres libres','0','neige','monde','12345']){const w=new World(seed),p=w.spawn();assert.ok(p.y>23);assert.equal(BLOCKS[w.get(p.x,p.y,p.z)].solid,false);assert.equal(BLOCKS[w.get(p.x,p.y+1,p.z)].solid,false);assert.equal(BLOCKS[w.get(p.x,p.y-.1,p.z)].solid,true);}});
test('bounds reject invalid edits and preserve the world floor',()=>{const w=new World();assert.equal(w.set(0,0,0,B.AIR),false);assert.equal(w.set(0,HEIGHT,0,B.STONE),false);assert.equal(w.set(.2,2,0,B.STONE),false);assert.equal(w.get(0,-10,0),B.BEDROCK);assert.equal(w.get(0,HEIGHT,0),B.AIR);});
test('grid raycasting reports the correct face in positive and negative directions',()=>{
 const get=(x,y,z)=>x===2&&y===1&&z===0?B.STONE:B.AIR;const hit=raycast(get,{x:.5,y:1.5,z:.5},{x:1,y:0,z:0});assert.equal(hit.x,2);assert.deepEqual(hit.normal,{x:-1,y:0,z:0});assert.equal(hit.distance,1.5);assert.equal(raycast(get,{x:10,y:1.5,z:.5},{x:1,y:0,z:0}),null);const h2=raycast(get,{x:4.5,y:1.5,z:.5},{x:-1,y:0,z:0});assert.deepEqual(h2.normal,{x:1,y:0,z:0});
});
test('raycasting skips water and respects reach',()=>{const get=(x)=>x===1?B.WATER:x===2?B.STONE:0;assert.equal(raycast(get,{x:.5,y:.5,z:.5},{x:1,y:0,z:0}).id,B.STONE);assert.equal(raycast(get,{x:.5,y:.5,z:.5},{x:1,y:0,z:0},1),null);});
function emptyWorld(){const w=new World('mesh');w.generate=(cx,cz)=>{const k=`${cx},${cz}`;if(!w.chunks.has(k))w.chunks.set(k,new Uint8Array(16*16*HEIGHT));return w.chunks.get(k);};return w;}
test('mesh removes internal faces, has outward winding, and sees neighboring chunks',()=>{
 const w=emptyWorld();w.set(15,10,0,B.STONE);let mesh=meshChunk(w,0,0).opaque;assert.equal(mesh.indices.length,36);w.set(16,10,0,B.STONE);mesh=meshChunk(w,0,0).opaque;assert.equal(mesh.indices.length,30);
 for(let t=0;t<mesh.indices.length;t+=3){const ids=[...mesh.indices.slice(t,t+3)],p=ids.map(i=>[...mesh.position.slice(i*3,i*3+3)]),a=p[1].map((v,i)=>v-p[0][i]),b=p[2].map((v,i)=>v-p[0][i]),cross=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],n=[...mesh.normal.slice(ids[0]*3,ids[0]*3+3)];assert.ok(cross.reduce((sum,v,i)=>sum+v*n[i],0)>0);}
});
test('water is blended while glass frames remain opaque cutouts',()=>{const w=emptyWorld();w.set(1,10,1,B.WATER);w.set(3,10,1,B.GLASS);w.set(5,10,1,B.STONE);const m=meshChunk(w,0,0);assert.equal(m.opaque.indices.length,72);assert.equal(m.transparent.indices.length,30);});
const floor=(x,y,z)=>y<1?B.STONE:0;
const person=()=>({x:.5,y:1.001,z:.5,yaw:0,vy:0,flying:false,grounded:true});
test('walking speed is frame-independent and diagonal motion is normalized',()=>{let a=person(),b=person();for(let i=0;i<60;i++)stepPhysics(a,{forward:1},floor,1/60);for(let i=0;i<120;i++)stepPhysics(b,{forward:1},floor,1/120);assert.ok(Math.abs(a.z-b.z)<.0001);let c=person();for(let i=0;i<60;i++)stepPhysics(c,{forward:1,right:1},floor,1/60);assert.ok(Math.abs(Math.hypot(c.x-.5,c.z-.5)-Math.abs(a.z-.5))<.0001);assert.ok(a.y>=.999);});
test('collision prevents walking through a wall; jumping lands back on the floor',()=>{const get=(x,y,z)=>y<1||z===-2&&y<4?B.STONE:0;const p=person();for(let i=0;i<120;i++)stepPhysics(p,{forward:1},get,1/60);assert.ok(p.z>=-.701);const j=person();let maxY=0;for(let i=0;i<150;i++){stepPhysics(j,{jump:i===1},floor,1/60);maxY=Math.max(maxY,j.y);}assert.ok(maxY>2.2);assert.ok(Math.abs(j.y-1)<.002);});
test('creative flight can ascend and descend; placement cannot intersect the player',()=>{const p=person();p.flying=true;for(let i=0;i<60;i++)stepPhysics(p,{jump:true},floor,1/60);assert.ok(p.y>8);for(let i=0;i<30;i++)stepPhysics(p,{down:true},floor,1/60);assert.ok(p.y<6);assert.equal(overlapsBlock(p,0,Math.floor(p.y),0),true);assert.equal(overlapsBlock(p,4,Math.floor(p.y),0),false);});
test('save import rejects malformed, unbounded and unknown content',()=>{
 const valid={format:'blockfield',version:SAVE_VERSION,seed:'test',edits:[[-16,5,0,B.STONE]],player:{x:1,y:31,z:2,yaw:0,pitch:0},hotbar:[1,2,3,4,5,6,7,8,9]};assert.equal(validateSave(valid),valid);for(const patch of[{version:999},{edits:[[0,-1,0,1]]},{edits:[[0,5,0,999]]},{player:{x:NaN}},{hotbar:[0]}])assert.throws(()=>validateSave({...valid,...patch}));
});
