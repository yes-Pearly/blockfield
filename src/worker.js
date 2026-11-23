import {World} from './world.js';
import {meshChunk} from './mesh.js';
let world;
self.onmessage=({data:d})=>{
 try{
  if(d.type==='init'){world=new World(d.seed,d.edits);return;}
  if(d.type==='edit'){world.set(d.x,d.y,d.z,d.id);return;}
  if(d.type==='chunk'){
   const blocks=world.generate(d.cx,d.cz).slice(),mesh=meshChunk(world,d.cx,d.cz);const transfers=[blocks.buffer];for(const group of Object.values(mesh))for(const a of Object.values(group))transfers.push(a.buffer);
   self.postMessage({type:'chunk',cx:d.cx,cz:d.cz,token:d.token,blocks,mesh},transfers);world.trim(d.cx,d.cz,10);
  }
 }catch(error){self.postMessage({type:'error',message:error.message,token:d.token});}
};
