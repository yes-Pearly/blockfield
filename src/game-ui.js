import {assetURL} from './blocks.js?v=0.3.0';
import {ITEMS,RECIPES,newStack,insert,take,fillRecipe,craft,craftMany,matchRecipe,FUELS,SMELTS,itemName} from './survival.js?v=0.3.0';
import {exchange,quickMove,asStack} from './inventory.js?v=0.3.0';
import {skinPreview} from './skin-preview.js?v=0.3.0';
import {blockIcon} from './blocks.js?v=0.3.0';
const $=id=>document.getElementById(id);
export function itemIcon(id){const item=ITEMS.get(id);if(!item)return'';if(item.block)return blockIcon(id);return assetURL(item.texture)||assetURL('redstone-item');}
export function fillSlot(button,stack,{number}={}){
 stack=asStack(stack);button.replaceChildren();button.title='';button.dataset.itemName=stack?itemName(stack.id):'';button.setAttribute('aria-label',stack?`${itemName(stack.id)} × ${stack.count}`:'Emplacement vide');
 if(stack){const img=document.createElement('img');img.src=itemIcon(stack.id);img.alt='';button.append(img);if(stack.count>1){const n=document.createElement('span');n.className='stack-count';n.textContent=stack.count;button.append(n);}const tool=ITEMS.get(stack.id)?.tool;if(tool&&stack.durability<tool.durability){const bar=document.createElement('span'),i=document.createElement('i');bar.className='durability';i.style.width=`${100*stack.durability/tool.durability}%`;if(stack.durability/tool.durability<.25)i.style.background='#d63824';bar.append(i);button.append(bar);}}
 if(number!==undefined){const n=document.createElement('span');n.className='number';n.textContent=number;button.append(n);}
}
export class GameUI{
 constructor(api){this.api=api;this.size=2;this.furnaceKey=null;this.pointer={x:innerWidth/2,y:innerHeight/2};this.drag=null;this.suppressClick=0;
  this.cursor=document.createElement('div');this.cursor.id='inventory-cursor';this.cursor.className='hidden';this.tooltip=document.createElement('div');this.tooltip.id='item-tooltip';this.tooltip.className='hidden';document.body.append(this.cursor,this.tooltip);
  document.addEventListener('pointermove',e=>{this.pointer={x:e.clientX,y:e.clientY};this.cursor.style.left=`${e.clientX}px`;this.cursor.style.top=`${e.clientY}px`;this.tooltip.style.left=`${e.clientX+12}px`;this.tooltip.style.top=`${e.clientY-24}px`;const slot=e.target.closest?.('[data-item-name]');const name=slot?.dataset.itemName;this.tooltip.textContent=name??'';this.tooltip.classList.toggle('hidden',!name||!!this.api.getGame().cursor||!this.isOpen());});
  $('recipe-toggle').onclick=()=>$('recipe-book').classList.toggle('hidden');
  this.bind($('craft-result'),'result',opts=>{const game=api.getGame();const result=opts.shift?craftMany(game,this.size):craft(game,this.size,{toCursor:true});if(!result){api.notice('Libère de la place pour récupérer le résultat.');return;}this.changed();},{draggable:false});
  for(const kind of['input','fuel','output'])this.bind($(`furnace-${kind}`),`furnace:${kind}`,opts=>this.click(`furnace:${kind}`,opts),{draggable:kind!=='output'});
 }
 isOpen(){return !($('inventory-panel').classList.contains('hidden')&&$('furnace-panel').classList.contains('hidden'));}
 read(ref){const g=this.api.getGame(),[type,key]=ref.split(':');if(type==='inventory')return g.slots[+key];if(type==='craft')return asStack(g.crafting[+key]);if(type==='furnace')return g.furnaces[this.furnaceKey]?.[key];return null;}
 write(ref,value){const g=this.api.getGame(),[type,key]=ref.split(':');if(type==='inventory')g.slots[+key]=value;if(type==='craft')g.crafting[+key]=value??0;if(type==='furnace')g.furnaces[this.furnaceKey][key]=value;}
 accept(ref,id){return ref==='furnace:input'?SMELTS.has(id):ref==='furnace:fuel'?FUELS.has(id):true;}
 bind(button,ref,handler,{draggable=true}={}){
  button.dataset.slotRef=ref;button.onclick=e=>{if(performance.now()<this.suppressClick)return;handler({right:false,shift:e.shiftKey});};button.oncontextmenu=e=>{e.preventDefault();handler({right:true,shift:e.shiftKey});};
  let start=null,timer=null,long=false;
  button.onpointerdown=e=>{if(e.button!==0)return;start={id:e.pointerId,x:e.clientX,y:e.clientY,ref};long=false;button.setPointerCapture(e.pointerId);if(e.pointerType==='touch')timer=setTimeout(()=>{long=true;this.suppressClick=performance.now()+600;handler({right:true,shift:false});},500);};
  button.onpointermove=e=>{if(!start||start.id!==e.pointerId)return;if(Math.hypot(e.clientX-start.x,e.clientY-start.y)>8){clearTimeout(timer);if(draggable&&!long&&!this.drag&&this.read(ref)){this.drag={ref,stack:asStack(this.read(ref))};fillSlot(this.cursor,this.drag.stack);this.cursor.classList.remove('hidden');}if(this.drag){this.cursor.style.left=`${e.clientX}px`;this.cursor.style.top=`${e.clientY}px`;}}};
  button.onpointerup=e=>{clearTimeout(timer);if(this.drag){const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-slot-ref]')?.dataset.slotRef;const source=this.drag.ref;this.drag=null;this.suppressClick=performance.now()+350;if(target&&target!==source&&target!=='result'&&target!=='furnace:output'){const g=this.api.getGame();if(!g.cursor){const take=exchange(null,this.read(source));g.cursor=take.cursor;this.write(source,take.slot);}this.click(target,{right:false});}else this.renderCursor();}start=null;};
  button.onpointercancel=()=>{clearTimeout(timer);start=null;this.drag=null;this.renderCursor();};
 }
 click(ref,{right=false,shift=false}={}){
  const game=this.api.getGame();if(ref==='furnace:output'){
   const stack=this.read(ref);if(!stack)return;if(shift){const left=insert(game.slots,stack.id,stack.count,stack.durability);this.write(ref,left?{...stack,count:left}:null);}
   else {if(game.cursor&&(game.cursor.id!==stack.id||game.cursor.count+stack.count>ITEMS.get(stack.id).stack))return;game.cursor=game.cursor?{...game.cursor,count:game.cursor.count+stack.count}:{...stack};this.write(ref,null);}this.changed();return;
  }
  if(shift&&ref.startsWith('inventory:')){quickMove(game.slots,+ref.split(':')[1]);this.changed();return;}
  const result=exchange(game.cursor,this.read(ref),{right,accepts:id=>this.accept(ref,id)});if(!result.changed)return;game.cursor=result.cursor;this.write(ref,result.slot);this.changed();
 }
 renderCursor(){const stack=this.api.getGame().cursor;this.cursor.classList.toggle('hidden',!stack||!this.isOpen());if(stack)fillSlot(this.cursor,stack);this.cursor.style.left=`${this.pointer.x}px`;this.cursor.style.top=`${this.pointer.y}px`;this.tooltip.classList.add('hidden');}
 changed(){this.api.change();if(this.furnaceKey)this.renderFurnace();else this.renderInventory(this.size);this.renderCursor();}
 renderInventory(size=2){this.size=size;this.furnaceKey=null;const g=this.api.getGame(),survival=g.mode==='survival';$('inventory-panel').classList.toggle('java-gui',survival);$('inventory-panel').classList.toggle('workbench',survival&&size===3);$('creative-inventory').classList.toggle('hidden',survival);$('survival-inventory').classList.toggle('hidden',!survival);$('inventory-title').textContent=size===3?'Établi':'Inventaire';if(!survival){this.api.creative();this.renderCursor();return;}
  $('craft-label').textContent='Fabrication';$('craft-grid').classList.toggle('personal',size===2);$('craft-grid').replaceChildren();
  const indices=size===2?[0,1,3,4]:[0,1,2,3,4,5,6,7,8];for(const index of indices){const button=document.createElement('button');button.className='slot';fillSlot(button,g.crafting[index]);button.setAttribute('aria-label',`Fabrication ${indices.indexOf(index)+1} : ${itemName(asStack(g.crafting[index])?.id)||'vide'}`);this.bind(button,`craft:${index}`,opts=>this.click(`craft:${index}`,opts));$('craft-grid').append(button);}
  const recipe=matchRecipe(g.crafting,size);fillSlot($('craft-result'),recipe?newStack(...recipe.out):null);$('craft-result').disabled=!recipe;this.renderSlots('survival-slots');this.renderRecipes();$('survival-selected').textContent='';
  const player=$('survival-inventory').querySelector('.player-preview');if(player&&!player.firstElementChild?.matches('canvas'))player.replaceChildren(skinPreview());this.renderCursor();
 }
 renderRecipes(){const game=this.api.getGame();$('recipe-book').replaceChildren();for(const recipe of RECIPES){if(recipe.pattern.length>this.size||recipe.pattern[0].length>this.size)continue;const test={slots:game.slots.map(s=>s?{...s}:null),crafting:[...game.crafting]},available=fillRecipe(test,recipe,this.size);const button=document.createElement('button'),img=document.createElement('img'),label=document.createElement('span');img.src=itemIcon(recipe.out[0]);img.alt='';label.textContent=recipe.name;button.append(img,label);button.disabled=!available;button.classList.toggle('available',available);button.onclick=()=>{if(fillRecipe(game,recipe,this.size))this.changed();};$('recipe-book').append(button);}}
 renderSlots(container){const g=this.api.getGame();$(container).replaceChildren();for(const index of[...Array.from({length:27},(_,i)=>i+9),...Array.from({length:9},(_,i)=>i)]){const b=document.createElement('button');b.className='slot';b.classList.toggle('hotbar-row',index<9);fillSlot(b,g.slots[index]);this.bind(b,`inventory:${index}`,opts=>this.click(`inventory:${index}`,opts));$(container).append(b);}}
 openFurnace(key){this.furnaceKey=key;$('furnace-panel').classList.add('java-gui');this.renderFurnace();}
 renderFurnace(){const f=this.api.getGame().furnaces[this.furnaceKey];if(!f)return;this.renderSlots('furnace-slots');this.updateFurnace();this.renderCursor();}
 updateFurnace(){const f=this.api.getGame().furnaces[this.furnaceKey];if(!f)return;$('furnace-fire').classList.toggle('burning',f.burn>0);$('furnace-fire').style.setProperty('--burn',f.burnTotal?f.burn/f.burnTotal:0);$('cook-progress').style.width=`${Math.min(100,f.progress*10)}%`;for(const kind of['input','fuel','output'])fillSlot($(`furnace-${kind}`),f[kind]);$('furnace-status').textContent='';}
 hideCursor(){this.cursor.classList.add('hidden');this.tooltip.classList.add('hidden');}
}
