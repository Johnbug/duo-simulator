import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { AnimationMixer, Box3, LoopOnce, Vector3 } from 'three';
const directory=new URL('../public/assets/model/',import.meta.url);
const source=JSON.parse(fs.readFileSync(new URL('duo.gltf',directory),'utf8'));

test('all official model buffers and textures are packaged locally',()=>{
 for(const asset of [...source.buffers,...source.images]){
  assert.ok(asset.uri&&!asset.uri.startsWith('http'));
  const file=new URL(asset.uri,directory);assert.ok(fs.statSync(file).size>0,asset.uri);
 }
});
test('official hinge actually deforms the mesh from closed to half-open to flat',async()=>{
 globalThis.ProgressEvent=class{constructor(type,data){Object.assign(this,data)}};
 const geometry=structuredClone(source);
 geometry.buffers.forEach(b=>b.uri='data:application/octet-stream;base64,'+fs.readFileSync(new URL(b.uri,directory)).toString('base64'));
 geometry.materials=geometry.materials.map(m=>({name:m.name}));
 geometry.images=[];geometry.textures=[];geometry.extensionsUsed=[];
 const {scene,animations}=await new GLTFLoader().parseAsync(JSON.stringify(geometry),'');
 const mixer=new AnimationMixer(scene);const clip=animations.find(a=>a.name==='Slider');assert.ok(clip);
 const action=mixer.clipAction(clip).setLoop(LoopOnce,1);action.clampWhenFinished=true;
 const measure=t=>{
  action.reset().play();mixer.setTime(t);scene.updateMatrixWorld(true);
  scene.traverse(o=>{if(o.isSkinnedMesh)o.computeBoundingBox()});
  return new Box3().setFromObject(scene).getSize(new Vector3());
 };
 const closed=measure(0),half=measure(clip.duration/2),open=measure(clip.duration-0.000001);
 assert.ok(open.x>closed.x*1.8,'Open width must be nearly twice the closed width');
 assert.ok(half.y>closed.y*4,'Hinge must leave the screen plane at half fold');
 assert.ok(open.y<closed.y,'Open device must be thinner than closed device');
 // Reversing the same clip must return the exact closed geometry, without looping.
 assert.ok(measure(0).distanceTo(closed)<0.00001);
});
