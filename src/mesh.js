import {B,BLOCKS,faceTile,ATLAS_COLS,ATLAS_ROWS,CELL} from './blocks.js';
import {SIZE,HEIGHT,index} from './world.js';
const faces=[
 {n:[1,0,0],v:[[1,0,1],[1,0,0],[1,1,1],[1,1,0]],shade:.77},
 {n:[-1,0,0],v:[[0,0,0],[0,0,1],[0,1,0],[0,1,1]],shade:.68},
 {n:[0,1,0],v:[[0,1,1],[1,1,1],[0,1,0],[1,1,0]],shade:1},
 {n:[0,-1,0],v:[[0,0,0],[1,0,0],[0,0,1],[1,0,1]],shade:.48},
 {n:[0,0,1],v:[[0,0,1],[1,0,1],[0,1,1],[1,1,1]],shade:.89},
 {n:[0,0,-1],v:[[1,0,0],[0,0,0],[1,1,0],[0,1,0]],shade:.73}
];
const group=()=>({position:[],normal:[],uv:[],color:[],indices:[]});
export function meshChunk(world,cx,cz){
 const opaque=group(),transparent=group(),a=world.generate(cx,cz),ox=cx*16,oz=cz*16;
 const get=(x,y,z)=>x>=0&&x<16&&z>=0&&z<16?(y<0?B.BEDROCK:y>=HEIGHT?0:a[index(x,y,z)]):world.get(x+ox,y,z+oz);
 for(let z=0;z<SIZE;z++)for(let x=0;x<SIZE;x++)for(let y=0;y<HEIGHT;y++){
  const id=a[index(x,y,z)];if(!id)continue;const info=BLOCKS[id],g=info.transparent&&id!==B.LEAVES?transparent:opaque;
  for(let f=0;f<6;f++){
   const{n,v,shade}=faces[f],other=get(x+n[0],y+n[1],z+n[2]);
   if(other!==0&&(!BLOCKS[other].transparent||other===id||(id===B.WATER&&other===B.GLASS)))continue;
   if(id===B.WATER&&f===3)continue;
   const tile=faceTile(id,f),u0=(tile%8*CELL+1)/(ATLAS_COLS*CELL),u1=(tile%8*CELL+17)/(ATLAS_COLS*CELL),v0=1-((tile/8|0)*CELL+17)/(ATLAS_ROWS*CELL),v1=1-((tile/8|0)*CELL+1)/(ATLAS_ROWS*CELL),base=g.position.length/3;
   const tangent=[0,1,2].filter(i=>n[i]===0);
   for(let i=0;i<4;i++){
    const vv=v[i];let yy=y+vv[1];if(id===B.WATER&&vv[1]===1&&get(x,y+1,z)!==B.WATER)yy-=.12;
    g.position.push(x+vv[0],yy,z+vv[2]);g.normal.push(...n);g.uv.push(i%2?u1:u0,i>=2?v1:v0);
    let brightness=shade;
    if(id!==B.WATER&&id!==B.GLASS){
     const q=[x+n[0],y+n[1],z+n[2]],s1=q.slice(),s2=q.slice(),corner=q.slice();const t1=tangent[0],t2=tangent[1];s1[t1]+=vv[t1]?1:-1;s2[t2]+=vv[t2]?1:-1;corner[t1]+=vv[t1]?1:-1;corner[t2]+=vv[t2]?1:-1;
     const occ=p=>{const b=get(...p);return b!==0&&!BLOCKS[b].transparent?1:0;};const o1=occ(s1),o2=occ(s2),ao=o1&&o2?3:o1+o2+occ(corner);brightness*=1-ao*.11;
    }
    if(id===B.GLOW)brightness=1.2;
    g.color.push(brightness,brightness,brightness*.98);
   }
   g.indices.push(base,base+1,base+2,base+2,base+1,base+3);
  }
 }
 const finish=g=>({position:new Float32Array(g.position),normal:new Float32Array(g.normal),uv:new Float32Array(g.uv),color:new Float32Array(g.color),indices:new Uint32Array(g.indices)});
 return{opaque:finish(opaque),transparent:finish(transparent)};
}
