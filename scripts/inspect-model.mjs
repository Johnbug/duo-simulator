import fs from 'node:fs';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {AnimationMixer,Box3,Vector3,LoopOnce} from 'three';
globalThis.ProgressEvent=class {constructor(type,args){Object.assign(this,args)}};
const g=JSON.parse(fs.readFileSync('public/assets/model/duo.gltf'));
g.buffers.forEach(b=>{b.uri='data:application/octet-stream;base64,'+fs.readFileSync('public/assets/model/'+b.uri).toString('base64')});
// Geometry-only inspection avoids image decoding; shipped materials stay intact.
g.materials=g.materials.map(m=>({name:m.name,pbrMetallicRoughness:{baseColorFactor:m.pbrMetallicRoughness?.baseColorFactor}}));g.images=[];g.textures=[];g.extensionsUsed=[];
const model=await new GLTFLoader().parseAsync(JSON.stringify(g),'');
const mixer=new AnimationMixer(model.scene);const clip=model.animations.find(a=>a.name==='Slider');const action=mixer.clipAction(clip);action.setLoop(LoopOnce,1);action.clampWhenFinished=true;action.play();
for(const t of [0,0.5,1,1.5,1.99999]){action.reset().play();mixer.setTime(t);model.scene.updateMatrixWorld(true);model.scene.traverse(o=>{if(o.isSkinnedMesh)o.computeBoundingBox()});const b=new Box3().setFromObject(model.scene);console.log(t,'size',b.getSize(new Vector3()).toArray(),'center',b.getCenter(new Vector3()).toArray());}

for(const t of [0,1,1.99999]){action.reset().play();mixer.setTime(t);model.scene.updateMatrixWorld(true);for(const name of ['skeleton_0_3_screenTexture_geo','skeleton_0_7_outerDisplayScreenTexture_geo']){const o=model.scene.getObjectByName(name);o.computeBoundingBox();console.log(t,name,'bounds',o.boundingBox.min.toArray(),o.boundingBox.max.toArray());}}
