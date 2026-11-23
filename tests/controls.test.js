import test from 'node:test';
import assert from 'node:assert/strict';
import {Controls} from '../src/controls.js';

class Element{
 constructor(){this.listeners={};this.style={};this.classList={toggle(){},add(){},remove(){}};}
 addEventListener(name,fn){(this.listeners[name]??=[]).push(fn);}
 fire(type,values={}){const e={type,pointerId:1,pointerType:'touch',clientX:50,clientY:50,button:0,preventDefault(){},...values};for(const f of this.listeners[type]??[])f(e);}
 setPointerCapture(){}
 getBoundingClientRect(){return{left:0,top:0,width:100,height:100};}
}
test('multiple fingers can move, look, jump and build independently; cancellation releases controls',()=>{
 const elements=new Map();const element=id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id);};
 globalThis.document={getElementById:element,querySelectorAll:()=>[],addEventListener(){},body:element('body'),pointerLockElement:null,activeElement:null};globalThis.window=new Element();let actions=[];
 const canvas=element('canvas'),c=new Controls(canvas,{gesture(){},pause(){},close(){},action:a=>actions.push(a),pick(){},slot(){},inventory(){},flight(){},select(){},notice(){}},{controls:'touch',sensitivity:1,autojump:true});c.setActive(true);
 element('joystick').fire('pointerdown',{pointerId:11,clientX:50,clientY:20});canvas.fire('pointerdown',{pointerId:22,clientX:200,clientY:100});canvas.fire('pointermove',{pointerId:22,clientX:220,clientY:110});element('jump').fire('pointerdown',{pointerId:33});element('place-block').fire('pointerdown',{pointerId:44});
 assert.equal(c.read().forward,1);assert.equal(c.read().jump,true);assert.deepEqual(actions,['place']);assert.ok(c.consumeLook().x>0);assert.equal(c.holds.has('place'),true);
 element('joystick').fire('pointercancel',{pointerId:11});assert.equal(c.read().forward,0);assert.equal(c.read().jump,true);canvas.fire('pointermove',{pointerId:22,clientX:240,clientY:110});assert.ok(c.consumeLook().x>0);
 canvas.fire('pointerup',{pointerId:22});assert.equal(c.holds.has('place'),true);
 element('jump').fire('lostpointercapture',{pointerId:33});assert.equal(c.read().jump,false);element('place-block').fire('pointerup',{pointerId:44});assert.equal(c.holds.has('place'),false);c.reset();assert.equal(c.pointer,null);assert.equal(c.joyPointer,null);assert.equal(c.keys.size,0);
});
