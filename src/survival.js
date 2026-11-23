import {B,BLOCKS} from './blocks.js';
export const I=Object.freeze({STICK:100,COAL:101,DIAMOND:102,RAW_IRON:103,RAW_GOLD:104,IRON:105,GOLD:106,REDSTONE:107,APPLE:108,BREAD:109,CHARCOAL:110,BRICK:111});
export const ITEMS=new Map(BLOCKS.slice(1).map(b=>[b.id,{...b,stack:64,block:true}]));
for(const[id,name,texture,food,saturation]of[
 [100,'Bâton','default_stick'],[101,'Charbon','default_coal_lump'],[102,'Diamant','default_diamond'],[103,'Fer brut','mcl_raw_ores_raw_iron'],[104,'Or brut','mcl_raw_ores_raw_gold'],[105,'Lingot de fer','default_steel_ingot'],[106,'Lingot d’or','default_gold_ingot'],[107,'Poudre de redstone',null],[108,'Pomme','default_apple',4,2.4],[109,'Pain','farming_bread',5,6],[110,'Charbon de bois','mcl_core_charcoal'],[111,'Brique','default_clay_brick']])ITEMS.set(id,{id,name,texture,stack:64,food,saturation});
const materialDefs=[['bois','wood',2,1,59,'planks'],['pierre','stone',4,2,131,B.COBBLE],['fer','steel',6,3,250,I.IRON],['diamant','diamond',8,4,1561,I.DIAMOND]];
export const RECIPES=[
 {name:'Planches de chêne',pattern:[[B.LOG]],out:[B.PLANKS,4]},
 {name:'Planches de bouleau',pattern:[[B.BIRCH]],out:[B.BIRCHPLANKS,4]},
 {name:'Bâtons',pattern:[['planks'],['planks']],out:[I.STICK,4]},
 {name:'Établi',pattern:[['planks','planks'],['planks','planks']],out:[B.CRAFT,1]},
 {name:'Four',pattern:[[B.COBBLE,B.COBBLE,B.COBBLE],[B.COBBLE,0,B.COBBLE],[B.COBBLE,B.COBBLE,B.COBBLE]],out:[B.FURNACE,1]},
 {name:'Briques',pattern:[[I.BRICK,I.BRICK],[I.BRICK,I.BRICK]],out:[B.BRICKS,1]}
];
for(let m=0;m<4;m++)for(let k=0;k<3;k++){
 const[material,texture,speed,level,durability,ingredient]=materialDefs[m],kind=['pick','axe','shovel'][k],id=120+m*3+k,name=[`Pioche en ${material}`,`Hache en ${material}`,`Pelle en ${material}`][k];
 ITEMS.set(id,{id,name,texture:`default_tool_${texture}${kind}`,stack:1,tool:{kind,speed,level,durability}});
 const patterns=[[[ingredient,ingredient,ingredient],[0,I.STICK,0],[0,I.STICK,0]],[[ingredient,ingredient],[ingredient,I.STICK],[0,I.STICK]],[[ingredient],[I.STICK],[I.STICK]]];RECIPES.push({name,pattern:patterns[k],out:[id,1]});
}
export const itemName=id=>ITEMS.get(id)?.name??'';
export function newStack(id,count=1,durability){const item=ITEMS.get(id);if(!item)return null;const s={id,count};if(item.tool)s.durability=durability??item.tool.durability;return s;}
export const cloneSlots=slots=>slots.map(s=>s?{...s}:null);
export function insert(slots,id,count,durability){
 const item=ITEMS.get(id);if(!item||count<=0)return count;const max=item.stack;
 if(max>1)for(const s of slots)if(s?.id===id&&s.count<max){const n=Math.min(max-s.count,count);s.count+=n;count-=n;if(!count)return 0;}
 for(let i=0;i<slots.length&&count>0;i++)if(!slots[i]){const n=Math.min(max,count);slots[i]=newStack(id,n,durability);count-=n;}return count;
}
export function take(slots,index,count=1){const s=slots[index];if(!s)return null;const n=Math.min(s.count,count),out={...s,count:n};s.count-=n;if(s.count===0)slots[index]=null;return out;}
const accepts=(token,id)=>token==='planks'?[B.PLANKS,B.BIRCHPLANKS].includes(id):token===id;
function trim(grid){let minX=3,minY=3,maxX=-1,maxY=-1;for(let i=0;i<9;i++)if(grid[i]){minX=Math.min(minX,i%3);maxX=Math.max(maxX,i%3);minY=Math.min(minY,i/3|0);maxY=Math.max(maxY,i/3|0);}if(maxX<0)return[];return Array.from({length:maxY-minY+1},(_,y)=>Array.from({length:maxX-minX+1},(_,x)=>grid[(minY+y)*3+minX+x]??0));}
export function matchRecipe(grid,size=2){const pattern=trim(grid);if(!pattern.length)return null;return RECIPES.find(r=>r.pattern.length<=size&&r.pattern[0].length<=size&&r.pattern.length===pattern.length&&r.pattern[0].length===pattern[0].length&&[false,true].some(mirror=>r.pattern.every((row,y)=>row.every((token,x)=>accepts(token,pattern[y][mirror?row.length-1-x:x])))))??null;}
export function fillRecipe(game,recipe,size){
 if(recipe.pattern.length>size||recipe.pattern[0].length>size)return false;
 const slots=cloneSlots(game.slots);for(const id of game.crafting)if(id&&insert(slots,id,1))return false;
 const grid=Array(9).fill(0);for(let y=0;y<recipe.pattern.length;y++)for(let x=0;x<recipe.pattern[y].length;x++){
  const token=recipe.pattern[y][x];if(!token)continue;const i=slots.findIndex(s=>s&&accepts(token,s.id));if(i<0)return false;grid[y*3+x]=take(slots,i).id;
 }
 game.slots=slots;game.crafting=grid;return true;
}
export function craft(game,size){const recipe=matchRecipe(game.crafting,size);if(!recipe)return false;const slots=cloneSlots(game.slots);if(insert(slots,...recipe.out))return false;game.slots=slots;game.crafting.fill(0);return recipe;}
export function returnCrafting(game){for(let i=0;i<9;i++)if(game.crafting[i]&&!insert(game.slots,game.crafting[i],1))game.crafting[i]=0;}
const pickBlocks=new Set([B.STONE,B.COBBLE,B.SANDSTONE,B.BRICKS,B.BEDROCK,B.COAL,B.IRON,B.GOLD,B.DIAMOND,B.REDSTONE,B.OBSIDIAN,B.MOSS,B.STONEBRICK,B.FURNACE]);
const axeBlocks=new Set([B.PLANKS,B.LOG,B.CRAFT,B.BOOKS,B.BIRCH,B.BIRCHPLANKS]);
const shovelBlocks=new Set([B.GRASS,B.DIRT,B.SAND,B.CLAY,B.SNOW,B.GRAVEL]);
export function miningInfo(id,stack){
 const tool=ITEMS.get(stack?.id)?.tool,kind=pickBlocks.has(id)?'pick':axeBlocks.has(id)?'axe':shovelBlocks.has(id)?'shovel':null;
 const level=id===B.OBSIDIAN?4:[B.GOLD,B.DIAMOND,B.REDSTONE].includes(id)?3:id===B.IRON?2:pickBlocks.has(id)?1:0;
 const drop=level===0||!!(tool?.kind==='pick'&&tool.level>=level),suitable=tool?.kind===kind;
 const hardness=id===B.BEDROCK?Infinity:id===B.OBSIDIAN?50:id===B.LEAVES?.2:id===B.GLASS?.3:axeBlocks.has(id)?2:shovelBlocks.has(id)?.5:[B.COAL,B.IRON,B.GOLD,B.DIAMOND,B.REDSTONE].includes(id)?3:1.5;
 return{seconds:hardness*(drop?1.5:5)/(suitable?tool.speed:1),drop,kind};
}
export function harvest(id,stack,random=Math.random){
 if(!miningInfo(id,stack).drop||id===B.GLASS||id===B.BEDROCK)return[];
 if(id===B.LEAVES)return random()<.05?[[I.APPLE,1]]:random()<.03?[[I.STICK,1]]:[];
 const convert={[B.GRASS]:B.DIRT,[B.STONE]:B.COBBLE,[B.COAL]:I.COAL,[B.IRON]:I.RAW_IRON,[B.GOLD]:I.RAW_GOLD,[B.DIAMOND]:I.DIAMOND,[B.REDSTONE]:I.REDSTONE};
 return[[convert[id]??id,id===B.REDSTONE?4:1]];
}
export function useTool(game,index){const s=game.slots[index];if(!s||!ITEMS.get(s.id)?.tool)return false;s.durability--;if(s.durability<=0){game.slots[index]=null;return true;}return false;}
export const FUELS=new Map([[I.COAL,80],[I.CHARCOAL,80],[B.LOG,15],[B.BIRCH,15],[B.PLANKS,15],[B.BIRCHPLANKS,15],[I.STICK,5]]);
export const SMELTS=new Map([[I.RAW_IRON,I.IRON],[I.RAW_GOLD,I.GOLD],[B.SAND,B.GLASS],[B.COBBLE,B.STONE],[B.LOG,I.CHARCOAL],[B.BIRCH,I.CHARCOAL],[B.CLAY,I.BRICK]]);
export const newFurnace=()=>({input:null,fuel:null,output:null,burn:0,burnTotal:0,progress:0});
export function tickFurnace(f,dt){
 const out=SMELTS.get(f.input?.id),room=out&&(!f.output||(f.output.id===out&&f.output.count<64));
 if(f.burn<=0&&room&&FUELS.has(f.fuel?.id)){f.burn=f.burnTotal=FUELS.get(f.fuel.id);if(--f.fuel.count===0)f.fuel=null;}
 const heat=Math.min(dt,f.burn);f.burn=Math.max(0,f.burn-dt);
 if(room&&heat>0){f.progress+=heat;if(f.progress>=10){f.progress-=10;if(!f.output)f.output=newStack(out);else f.output.count++;if(--f.input.count===0)f.input=null;return true;}}
 else if(!room)f.progress=0;return false;
}
export class Survival{
 constructor(saved={}){this.mode=saved.mode??'creative';this.slots=cloneSlots(saved.slots??Array(36).fill(null));this.crafting=[...(saved.crafting??Array(9).fill(0))];this.health=saved.health??20;this.hunger=saved.hunger??20;this.saturation=saved.saturation??5;this.exhaustion=saved.exhaustion??0;this.air=20;this.regen=0;this.starve=0;this.drown=0;this.furnaces=structuredClone(saved.furnaces??{});this.drops=structuredClone(saved.drops??[]);}
 serialize(){return{mode:this.mode,slots:cloneSlots(this.slots),crafting:[...this.crafting],health:this.health,hunger:this.hunger,saturation:this.saturation,exhaustion:this.exhaustion,furnaces:structuredClone(this.furnaces),drops:this.drops.map(({id,count,durability,x,y,z,vx,vy,vz,age})=>({id,count,...(durability!==undefined?{durability}:{}),x,y,z,vx,vy,vz,age}))};}
 eat(index){const s=this.slots[index],item=ITEMS.get(s?.id);if(!item?.food||this.hunger>=20)return false;this.hunger=Math.min(20,this.hunger+item.food);this.saturation=Math.min(this.hunger,this.saturation+item.saturation);take(this.slots,index);return true;}
 damage(amount){if(this.mode==='survival')this.health=Math.max(0,this.health-amount);}
 tick(dt,{distance=0,sprinting=false,jumped=false,underwater=false}={}){
  if(this.mode!=='survival')return;
  this.exhaustion+=distance*(sprinting?.1:.01)+(jumped?(sprinting?.2:.05):0);
  while(this.exhaustion>=4){this.exhaustion-=4;if(this.saturation>0)this.saturation=Math.max(0,this.saturation-1);else this.hunger=Math.max(0,this.hunger-1);}
  if(this.hunger>=18&&this.health<20){this.regen+=dt;if(this.regen>=4){this.health=Math.min(20,this.health+1);this.exhaustion+=6;this.regen=0;}}else this.regen=0;
  if(this.hunger===0){this.starve+=dt;if(this.starve>=4){if(this.health>1)this.damage(1);this.starve=0;}}else this.starve=0;
  if(underwater){this.air=Math.max(0,this.air-dt*2);if(this.air===0){this.drown+=dt;if(this.drown>=1){this.damage(2);this.drown=0;}}}else{this.air=Math.min(20,this.air+dt*4);this.drown=0;}
 }
}
export function validateGameplay(g){
 if(!g||!['creative','survival'].includes(g.mode)||!Array.isArray(g.slots)||g.slots.length!==36||!Array.isArray(g.crafting)||g.crafting.length!==9)throw Error('Inventaire de survie invalide.');
 const stack=s=>{if(s===null)return;if(!s||!ITEMS.has(s.id)||!Number.isInteger(s.count)||s.count<1||s.count>ITEMS.get(s.id).stack)throw Error('Pile d’objets invalide.');const max=ITEMS.get(s.id).tool?.durability;if(max&&(!Number.isInteger(s.durability)||s.durability<1||s.durability>max))throw Error('Durabilité invalide.');};
 g.slots.forEach(stack);for(const id of g.crafting)if(id!==0&&!ITEMS.has(id))throw Error('Fabrication invalide.');
 for(const[k,max]of[['health',20],['hunger',20],['saturation',20],['exhaustion',10]])if(!Number.isFinite(g[k])||g[k]<0||g[k]>max)throw Error('État de survie invalide.');
 if(!g.furnaces||typeof g.furnaces!=='object'||Array.isArray(g.furnaces)||Object.keys(g.furnaces).length>10000)throw Error('Fours invalides.');
 for(const[key,f]of Object.entries(g.furnaces)){if(!/^-?\d+,\d+,-?\d+$/.test(key))throw Error('Position de four invalide.');const[x,y,z]=key.split(',').map(Number);if(Math.abs(x)>1e7||Math.abs(z)>1e7||y<1||y>=80)throw Error('Position de four invalide.');['input','fuel','output'].forEach(k=>stack(f[k]));for(const k of['burn','burnTotal','progress'])if(!Number.isFinite(f[k])||f[k]<0||f[k]>100)throw Error('Cuisson invalide.');}
 if(!Array.isArray(g.drops)||g.drops.length>256)throw Error('Objets au sol invalides.');for(const d of g.drops){stack(d);for(const k of['x','y','z','vx','vy','vz','age'])if(!Number.isFinite(d[k])||Math.abs(d[k])>1e7)throw Error('Objet au sol invalide.');}return g;
}
