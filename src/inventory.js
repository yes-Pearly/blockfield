import {ITEMS,newStack,cloneSlots,insert} from './survival.js?v=0.3.0';
export const asStack=value=>value?(typeof value==='number'?newStack(value):{...value}):null;
export const sameStack=(a,b)=>a?.id===b?.id&&(a?.durability??null)===(b?.durability??null);

// One transaction for both mouse and touch. Callers apply the returned pair
// together; a refused placement leaves both sides intact.
export function exchange(cursor,slot,{right=false,accepts=()=>true}={}){
 cursor=asStack(cursor);slot=asStack(slot);
 if(!cursor){if(!slot)return{cursor:null,slot:null,changed:false};const count=right?Math.ceil(slot.count/2):slot.count;const picked={...slot,count};slot.count-=count;return{cursor:picked,slot:slot.count?slot:null,changed:true};}
 if(!accepts(cursor.id))return{cursor,slot,changed:false};
 if(!slot){const count=right?1:cursor.count,placed={...cursor,count};cursor.count-=count;return{cursor:cursor.count?cursor:null,slot:placed,changed:true};}
 if(sameStack(cursor,slot)){
  const n=Math.min(right?1:cursor.count,ITEMS.get(slot.id).stack-slot.count);if(!n)return{cursor,slot,changed:false};slot.count+=n;cursor.count-=n;return{cursor:cursor.count?cursor:null,slot,changed:true};
 }
 if(right)return{cursor,slot,changed:false};return{cursor:slot,slot:cursor,changed:true};
}
export function quickMove(slots,index){
 if(!slots[index])return false;const copy=cloneSlots(slots),source=copy[index],indices=index<9?Array.from({length:27},(_,i)=>i+9):Array.from({length:9},(_,i)=>i),target=indices.map(i=>copy[i]);
 const left=insert(target,source.id,source.count,source.durability);if(left===source.count)return false;indices.forEach((i,n)=>{copy[i]=target[n];});copy[index]=left?{...source,count:left}:null;slots.splice(0,slots.length,...copy);return true;
}
