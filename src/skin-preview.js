import * as THREE from '../vendor/three.module.min.js?v=0.3.0';
import {assetURL} from './blocks.js?v=0.3.0';
let preview;
export function skinPreview(){
 if(preview)return preview.canvas;
 const canvas=document.createElement('canvas');canvas.width=104;canvas.height=140;canvas.setAttribute('aria-hidden','true');
 try{
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:false});renderer.setSize(104,140,false);renderer.outputColorSpace=THREE.SRGBColorSpace;
  const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-13,13,35,0,.1,100);camera.position.set(0,0,60);camera.lookAt(0,0,0);
  const texture=new THREE.TextureLoader().load(assetURL('steve'),()=>renderer.render(scene,camera));texture.colorSpace=THREE.SRGBColorSpace;texture.magFilter=texture.minFilter=THREE.NearestFilter;
  const material=new THREE.MeshBasicMaterial({map:texture,vertexColors:true,alphaTest:.2});const group=new THREE.Group();scene.add(group);group.rotation.y=-.28;
  function part(w,h,d,u,v,x,y){const geo=new THREE.BoxGeometry(w,h,d),uv=geo.attributes.uv,colors=[];const rects=[[u+d+w,v+d,d,h],[u,v+d,d,h],[u+d,v,w,d],[u+d+w,v,w,d],[u+d,v+d,w,h],[u+2*d+w,v+d,w,h]];
   for(let f=0;f<6;f++){const[a,b,c,e]=rects[f],shade=[.75,.7,1,.5,.96,.8][f];for(let n=f*4;n<f*4+4;n++){uv.setXY(n,(a+uv.getX(n)*c)/64,1-(b+(1-uv.getY(n))*e)/64);colors.push(shade,shade,shade);}}
   geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));const mesh=new THREE.Mesh(geo,material);mesh.position.set(x,y,0);group.add(mesh);return mesh;
  }
  const head=part(8,8,8,0,0,0,28);part(8,12,4,16,16,0,18);const left=part(4,12,4,32,48,6,18),right=part(4,12,4,40,16,-6,18);left.rotation.z=.06;right.rotation.z=-.06;part(4,12,4,0,16,-2,6);part(4,12,4,16,48,2,6);
  canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();head.rotation.y=(e.clientX-r.left-r.width/2)/r.width*.6;head.rotation.x=(e.clientY-r.top-r.height/3)/r.height*.25;renderer.render(scene,camera);});
  renderer.render(scene,camera);preview={canvas,renderer};
 }catch{preview={canvas};}return canvas;
}
