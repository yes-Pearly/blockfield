import test from 'node:test';
import assert from 'node:assert/strict';
import {zipSync} from '../vendor/fflate.module.js';
import {parseResourcePack} from '../src/resource-pack.js';
import {readFileSync} from 'node:fs';
test('Java pack importer reads only recognized PNG textures and ignores unrelated files',()=>{const png=new Uint8Array(Buffer.from(JSON.parse(readFileSync(new URL('../assets/textures.json',import.meta.url),'utf8')).default_dirt.split(',')[1],'base64'));const zip=zipSync({'assets/minecraft/textures/block/dirt.png':png,'other.txt':new TextEncoder().encode('ignored'),'assets/minecraft/textures/block/stone.png':new Uint8Array([1,2,3])});const result=parseResourcePack(zip);assert.deepEqual(Object.keys(result),['default_dirt']);assert.match(result.default_dirt,/^data:image\/png;base64,/);});
test('unrecognized and invalid ZIP files are rejected',()=>{assert.throws(()=>parseResourcePack(new Uint8Array([1,2,3])));assert.throws(()=>parseResourcePack(zipSync({'unrelated.png':new Uint8Array(25)})));});
