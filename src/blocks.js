// Original, code-generated textures. No Mojang files are included.
export const B = Object.freeze({AIR:0,GRASS:1,DIRT:2,STONE:3,COBBLE:4,PLANKS:5,LOG:6,LEAVES:7,SAND:8,SANDSTONE:9,BRICKS:10,GLASS:11,WATER:12,BEDROCK:13,COAL:14,IRON:15,GOLD:16,DIAMOND:17,REDSTONE:18,OBSIDIAN:19,CLAY:20,SNOW:21,GRAVEL:22,WHITE:23,RED:24,ORANGE:25,YELLOW:26,LIME:27,GREEN:28,CYAN:29,BLUE:30,PURPLE:31,PINK:32,BLACK:33,CRAFT:34,TNT:35,BOOKS:36,GLOW:37,MOSS:38,STONEBRICK:39,BIRCH:40,BIRCHPLANKS:41});
const list=[
 ['Air','#ffffff','nature'],['Herbe','#779d45','nature'],['Terre','#926744','nature'],['Pierre','#888d91','nature'],['Pierre taillée','#747c7f','construction'],['Planches de chêne','#bb914f','construction'],['Bûche de chêne','#775536','nature'],['Feuilles de chêne','#4f873b','nature'],['Sable','#ddcc8b','nature'],['Grès','#c7b77c','construction'],['Briques','#b96b51','construction'],['Verre','#bddde3','construction'],['Eau','#448ba8','nature'],['Roche mère','#44454a','nature'],['Minerai de charbon','#484a4c','nature'],['Minerai de fer','#c49e82','nature'],['Minerai d’or','#e3bb4c','nature'],['Minerai de diamant','#67d4cf','nature'],['Minerai de redstone','#c14b43','nature'],['Obsidienne','#37304e','nature'],['Argile','#91a0af','nature'],['Neige','#e6edf1','nature'],['Gravier','#9b958e','nature'],['Laine blanche','#efeee6','couleurs'],['Laine rouge','#b9423c','couleurs'],['Laine orange','#e58839','couleurs'],['Laine jaune','#e1c746','couleurs'],['Laine vert clair','#8eb547','couleurs'],['Laine verte','#4c7544','couleurs'],['Laine cyan','#3a929a','couleurs'],['Laine bleue','#4b68ad','couleurs'],['Laine violette','#8053a5','couleurs'],['Laine rose','#d88d9e','couleurs'],['Laine noire','#34373e','couleurs'],['Établi décoratif','#9e713f','construction'],['TNT décorative','#ba4a3c','construction'],['Bibliothèque','#a67b45','construction'],['Pierre lumineuse','#e4c978','construction'],['Pierre moussue','#647e52','construction'],['Briques de pierre','#939697','construction'],['Bûche de bouleau','#d0ccb2','nature'],['Planches de bouleau','#d8c58a','construction']
];
export const BLOCKS=list.map(([name,color,category],id)=>({id,name,color,category,solid:id!==0&&id!==12,transparent:[0,7,11,12].includes(id),tile:id}));
export const PALETTE=BLOCKS.slice(1);
export const DEFAULT_HOTBAR=[1,2,3,4,5,6,7,11,10];
export const isSolid=id=>!!BLOCKS[id]?.solid;
export const faceTile=(id,face)=>id===B.GRASS?(face===2?42:face===3?B.DIRT:43):id===B.LOG?(face===2||face===3?44:B.LOG):id===B.BIRCH?(face===2||face===3?45:B.BIRCH):id===B.CRAFT?(face===2?46:B.CRAFT):id===B.TNT?(face===2||face===3?47:B.TNT):id;
export const ATLAS_COLS=8, ATLAS_ROWS=8, TILE=16, CELL=18;
function rng(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return(seed>>>0)/4294967296;};}
export function makeAtlas(){
 const canvas=document.createElement('canvas');canvas.width=ATLAS_COLS*CELL;canvas.height=ATLAS_ROWS*CELL;const ctx=canvas.getContext('2d');
 for(let t=0;t<48;t++){
  const r=rng(t*873+47),tile=document.createElement('canvas');tile.width=tile.height=16;const c=tile.getContext('2d');const id=t<42?t:t===42?1:t===43?2:t===44?6:t===45?40:t===46?34:35;
  c.fillStyle=BLOCKS[id].color;c.fillRect(0,0,16,16);
  for(let y=0;y<16;y++)for(let x=0;x<16;x++){const n=r();c.fillStyle=n>.5?`rgba(255,255,255,${(n-.5)*.22})`:`rgba(0,0,0,${(.5-n)*.28})`;c.fillRect(x,y,1,1);}
  const rect=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
  if(t===43){rect(0,0,16,3,'#719445');for(let x=0;x<16;x++)rect(x,3,1,Math.floor(r()*4),'#719445');}
  if([5,41].includes(t)){for(let y=3;y<16;y+=4){rect(0,y,16,1,t===5?'#87673c':'#ad9a63');rect((y*3)%16,y-3,1,3,'#927444');}for(let i=0;i<12;i++)rect(r()*16|0,r()*16|0,3,1,'#ffffff12');}
  if(t===6||t===40){for(let x=1;x<16;x+=3)rect(x,r()*3|0,1,13,t===6?'#4c392a':'#646457');if(t===40)for(let i=0;i<8;i++)rect(r()*14|0,r()*16|0,3,1,'#404139');}
  if(t===44||t===45){rect(1,1,14,14,'#c4a66c');c.strokeStyle='#795b35';for(let k=3;k<8;k+=2)c.strokeRect(8-k,8-k,k*2,k*2);}
  if(t===4||t===38){for(let y=0;y<16;y+=5)for(let x=-3;x<16;x+=6){const xx=x+(y%2)*3;rect(xx,y,5,4,t===38?'#73865b':'#92999a');rect(xx,y,5,1,t===38?'#8a9b67':'#a2aaab');}if(t===38)for(let i=0;i<16;i++)rect(r()*16|0,r()*16|0,2,2,'#456c39');}
  if([10,39,9].includes(t)){for(let y=3;y<16;y+=4){rect(0,y,16,1,t===10?'#d5b29a':'#6c726b');for(let x=(y%8?0:4);x<16;x+=8)rect(x,y-3,1,3,t===10?'#d5b29a':'#6c726b');}}
  if(t===11){rect(0,0,16,16,'#a6cbd2');rect(1,1,14,14,'#b8d6db');rect(2,2,1,8,'#e9faf7');rect(3,10,4,1,'#e9faf7');rect(10,3,2,2,'#dceeea');}
  if(t>=14&&t<=18){rect(0,0,16,16,'#858b8c');for(let i=0;i<13;i++){const x=r()*14|0,y=r()*14|0;rect(x,y,2,2,BLOCKS[t].color);rect(x,y,1,1,'#ffffff44');}}
  if(t===34){for(let x=2;x<16;x+=5)rect(x,2,2,12,'#5b412a');rect(0,2,16,2,'#d0a165');rect(0,13,16,2,'#5d432c');}
  if(t===46){rect(0,0,16,16,'#bb8c51');for(let x=2;x<15;x+=4)rect(x,2,1,12,'#654d32');for(let y=2;y<15;y+=4)rect(2,y,12,1,'#654d32');}
  if(t===35){rect(0,5,16,6,'#e5ded2');c.fillStyle='#32332f';c.font='bold 6px monospace';c.fillText('TNT',2,10);for(let x=1;x<16;x+=4){rect(x,0,1,5,'#7a332b');rect(x,11,1,5,'#7a332b');}}
  if(t===47){rect(2,2,12,12,'#cd6d52');rect(7,2,2,8,'#34362f');rect(8,1,2,3,'#d9bd8a');}
  if(t===36){rect(0,1,16,2,'#d6ac65');rect(0,8,16,2,'#d6ac65');rect(0,15,16,1,'#59422d');for(let x=1;x<15;x+=2){rect(x,3,1,5,['#a94b40','#487578','#dfb660'][x%3]);rect(x,10,1,5,['#426345','#b4493d','#698ca5'][x%3]);}}
  if(t===37)for(let i=0;i<24;i++)rect(r()*15|0,r()*15|0,2,2,'#fff0b6');
  const ox=(t%8)*CELL+1,oy=(t/8|0)*CELL+1;ctx.drawImage(tile,ox,oy);ctx.drawImage(tile,0,0,16,1,ox,oy-1,16,1);ctx.drawImage(tile,0,15,16,1,ox,oy+16,16,1);ctx.drawImage(tile,0,0,1,16,ox-1,oy,1,16);ctx.drawImage(tile,15,0,1,16,ox+16,oy,1,16);
 }
 return canvas;
}
const iconCache=new Map();
export function blockIcon(id){
 if(iconCache.has(id))return iconCache.get(id);const atlas=globalThis.__blockAtlas??=makeAtlas();const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d');ctx.imageSmoothingEnabled=false;
 const face=(points,t,shade)=>{ctx.save();ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.clip();const [p0,p1,,p3]=points;ctx.setTransform((p1[0]-p0[0])/16,(p1[1]-p0[1])/16,(p3[0]-p0[0])/16,(p3[1]-p0[1])/16,p0[0],p0[1]);ctx.drawImage(atlas,t%8*CELL+1,(t/8|0)*CELL+1,16,16,0,0,16,16);if(shade){ctx.fillStyle=`rgba(0,0,0,${shade})`;ctx.fillRect(0,0,16,16);}ctx.restore();};
 face([[32,3],[59,17],[32,32],[5,17]],faceTile(id,2),0);face([[5,17],[32,32],[32,61],[5,46]],faceTile(id,4),.13);face([[32,32],[59,17],[59,46],[32,61]],faceTile(id,0),.3);const url=c.toDataURL();iconCache.set(id,url);return url;
}
