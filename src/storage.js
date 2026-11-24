import {validateSave} from './world.js?v=0.3.0';
let dbPromise;
function db(){return dbPromise??=new Promise((resolve,reject)=>{if(!globalThis.indexedDB)return reject(Error('IndexedDB indisponible'));const r=indexedDB.open('blockfield',1);r.onupgradeneeded=()=>r.result.createObjectStore('saves');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
export async function loadSave(){
 try{const d=await db();return await new Promise((resolve,reject)=>{const r=d.transaction('saves').objectStore('saves').get('world');r.onsuccess=()=>{try{resolve(r.result?validateSave(r.result):null);}catch(e){reject(e);}};r.onerror=()=>reject(r.error);});}
 catch(e){const raw=localStorage.getItem('blockfield-save');if(raw)return validateSave(JSON.parse(raw));if(e.message?.includes('compatible')||e.message?.includes('invalide'))throw e;return null;}
}
export async function storeSave(value){
 validateSave(value);
 try{const d=await db();await new Promise((resolve,reject)=>{const t=d.transaction('saves','readwrite');t.objectStore('saves').put(value,'world');t.oncomplete=resolve;t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error);});}
 catch(e){try{localStorage.setItem('blockfield-save',JSON.stringify(value));}catch{throw Error('Sauvegarde impossible : le stockage du navigateur est plein ou bloqué. Exporte ton monde.');}}
}
export function loadSettings(){try{return JSON.parse(localStorage.getItem('blockfield-settings'))??{};}catch{return{};}}
export function storeSettings(value){try{localStorage.setItem('blockfield-settings',JSON.stringify(value));}catch{/* Settings are optional; world saves report errors separately. */}}
