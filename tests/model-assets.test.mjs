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
 // Source units are centimetres; the full bounds also include side buttons and cameras.
 const within=(actual,expected)=>Math.abs(actual/expected-1)<0.02;
 assert.ok(within(open.x,16.46),'Unfolded width must agree with Apple 164.6 mm specification');
 assert.ok(within(open.z,11.78),'Body height must agree with Apple 117.8 mm specification');
 assert.ok(within(closed.x,8.41),'Closed width must agree with Apple 84.1 mm specification');
 // Reversing the same clip must return the exact closed geometry, without looping.
 assert.ok(measure(0).distanceTo(closed)<0.00001);
});

test('inner and outer screen image corners appear upright and unmirrored',async()=>{
 const { Group }=await import('three');
 const { orientDuoModel }=await import('../lib/model-orientation.mjs');
 globalThis.ProgressEvent=class{constructor(type,data){Object.assign(this,data)}};
 const geometry=structuredClone(source);
 geometry.buffers.forEach(b=>b.uri='data:application/octet-stream;base64,'+fs.readFileSync(new URL(b.uri,directory)).toString('base64'));
 geometry.materials=geometry.materials.map(m=>({name:m.name}));geometry.images=[];geometry.textures=[];geometry.extensionsUsed=[];
 const {scene,animations}=await new GLTFLoader().parseAsync(JSON.stringify(geometry),'');
 const oriented=new Group();orientDuoModel(oriented);oriented.add(scene);
 const mixer=new AnimationMixer(scene);const clip=animations.find(a=>a.name==='Slider');
 const action=mixer.clipAction(clip).setLoop(LoopOnce,1);action.clampWhenFinished=true;
 for(const [time,name] of [[0,'skeleton_0_7_outerDisplayScreenTexture_geo'],[clip.duration-0.000001,'skeleton_0_3_screenTexture_geo']]){
  action.reset().play();mixer.setTime(time);oriented.updateMatrixWorld(true);
  const mesh=scene.getObjectByName(name),uv=mesh.geometry.attributes.uv;
  const corner=(u,v)=>{
   let index=0,distance=Infinity;
   for(let i=0;i<uv.count;i++){const d=(uv.getX(i)-u)**2+(uv.getY(i)-v)**2;if(d<distance){distance=d;index=i}}
   return mesh.getVertexPosition(index,new Vector3()).applyMatrix4(mesh.matrixWorld);
  };
  // With glTF's flipY=false texture mapping, image top-left is UV (0,0).
  const topLeft=corner(0,0),topRight=corner(1,0),bottomLeft=corner(0,1);
  assert.ok(topLeft.y>bottomLeft.y,`${name}: image top must be above its bottom`);
  assert.ok(topLeft.x<topRight.x,`${name}: image left must be left of its right`);
 }
});
