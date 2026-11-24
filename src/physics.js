import {isSolid,B} from './blocks.js?v=0.3.0';
export const RADIUS=.3,PLAYER_HEIGHT=1.8,EYE_HEIGHT=1.62;
export function overlapsBlock(player,x,y,z){return player.x+RADIUS>x&&player.x-RADIUS<x+1&&player.y+PLAYER_HEIGHT>y&&player.y<y+1&&player.z+RADIUS>z&&player.z-RADIUS<z+1;}
export function collides(get,p){
 for(let y=Math.floor(p.y+.001);y<=Math.floor(p.y+PLAYER_HEIGHT-.001);y++)for(let z=Math.floor(p.z-RADIUS+.001);z<=Math.floor(p.z+RADIUS-.001);z++)for(let x=Math.floor(p.x-RADIUS+.001);x<=Math.floor(p.x+RADIUS-.001);x++)if(isSolid(get(x,y,z)))return true;return false;
}
export function moveAxis(get,p,axis,amount){
 const original=p[axis];p[axis]+=amount;if(!collides(get,p))return false;
 p[axis]=original;let low=0,high=1;for(let i=0;i<10;i++){const t=(low+high)/2;p[axis]=original+amount*t;if(collides(get,p))high=t;else low=t;}p[axis]=original+amount*low;return true;
}
export function stepPhysics(player,input,get,dt){
 const water=get(Math.floor(player.x),Math.floor(player.y+.8),Math.floor(player.z))===B.WATER;
 const forward=input.forward??0,right=input.right??0,n=Math.max(1,Math.hypot(forward,right));const speed=(player.flying?8:water?2.8:4.317)*(input.sprint?1.6:1);const sy=Math.sin(player.yaw),cy=Math.cos(player.yaw);
 const dx=(-sy*forward+cy*right)/n*speed*dt,dz=(-cy*forward-sy*right)/n*speed*dt;
 const groundBefore=player.grounded;
 for(const[axis,delta]of[['x',dx],['z',dz]]){
  const before=player[axis];const blocked=moveAxis(get,player,axis,delta);
  // Optional touch auto-jump; the desktop walk remains predictable.
  if(blocked&&input.autoJump&&groundBefore&&!player.flying){const oldY=player.y;player.y+=1.01;player[axis]=before+delta;if(!collides(get,player)){player.vy=0;}else {player.y=oldY;player[axis]=before;}}
 }
 if(player.flying){player.vy=((input.jump?1:0)-(input.down?1:0))*speed;player.grounded=false;}
 else if(water){player.vy=Math.max(-2,player.vy-6*dt);if(input.jump)player.vy=3.4;}
 else {if(input.jump&&player.grounded){player.vy=8.4;player.grounded=false;}player.vy=Math.max(-50,player.vy-24*dt);}
 const hit=moveAxis(get,player,'y',player.vy*dt);player.grounded=hit&&player.vy<0;if(hit)player.vy=0;
 return{water};
}
