'use client';
import { orientDuoModel } from '@/lib/model-orientation.mjs';
import { useEffect, useRef, useState } from 'react';
import type { Group, Mesh, MeshPhysicalMaterial, Texture, WebGLRenderer } from 'three';

type Props = { angle: number; finish: string; pose: string; portrait: boolean; dragging: boolean; yaw: number; pitch: number; visible: boolean; onFallback: () => void };
type Controls = { update: (props: Props) => void };

/** Apple's original skinned model and hinge clip, rendered with independent lighting. */
export function DuoModel(props: Props) {
  const host = useRef<HTMLDivElement>(null);
  const controller = useRef<Controls | null>(null);
  const latest = useRef(props);
  const [status, setStatus] = useState('loading');
  useEffect(() => { latest.current = props; controller.current?.update(props); }, [props]);
  useEffect(() => {
    const mount = host.current;
    if (!mount) return;
    const element: HTMLDivElement = mount;
    let disposed = false;
    let renderer: WebGLRenderer | undefined;
    let cleanup = () => {};
    async function load() {
      const THREE = await import('three');
      const [{ GLTFLoader }, { RoomEnvironment }] = await Promise.all([
        import('three/addons/loaders/GLTFLoader.js'), import('three/addons/environments/RoomEnvironment.js'),
      ]);
      if (disposed) return;
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;
      element.appendChild(renderer.domElement);
      renderer.domElement.setAttribute('aria-hidden', 'true');
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);
      const pmrem = new THREE.PMREMGenerator(renderer);
      const room = new RoomEnvironment();
      const environment = pmrem.fromScene(room, 0.04);
      scene.environment = environment.texture;
      scene.environmentIntensity = 1.05;
      room.dispose(); pmrem.dispose();
      scene.add(new THREE.HemisphereLight(0xffffff, 0x778296, 2.3));
      const key = new THREE.DirectionalLight(0xfff9ec, 3.5); key.position.set(-10, 14, 20); scene.add(key);
      const fill = new THREE.DirectionalLight(0xc6dfff, 1.7); fill.position.set(12, -5, 8); scene.add(fill);
      const presentation = new THREE.Group();
      const centered = new THREE.Group();
      const oriented = new THREE.Group();
      orientDuoModel(oriented);
      centered.add(oriented); presentation.add(centered); scene.add(presentation);
      let root: Group | undefined;
      let mixer: InstanceType<typeof THREE.AnimationMixer> | undefined;
      let action: InstanceType<typeof THREE.AnimationAction> | undefined;
      const materials = new Set<MeshPhysicalMaterial>();
      const textures = new Set<Texture>();
      const originals = new Map<MeshPhysicalMaterial, InstanceType<typeof THREE.Color>>();
      const current = { ...latest.current };
      let displayAngle = current.angle;
      let currentYaw = current.yaw;
      let currentPitch = current.pitch;
      let frame = 0;
      let previous = 0;
      let lastPoseTime = -1;
      let lastFinish = '';
      let screenInner: MeshPhysicalMaterial | undefined;
      let screenOuter: MeshPhysicalMaterial | undefined;
      const textureLoader = new THREE.TextureLoader();
      const screenTextures: Record<string, Texture> = {};
      const names = { landscape: 'QcYncVIkzdbhIbJ', portrait: 'iFSuhcVrhLhMisa', laptop: 'vHeRSOZUeAIaYwi', closed: 'KwwxLhAVqcKFMjD', tent: 'qAIPDzqFGVVDXZp' };
      const resize = () => {
        const width = element.clientWidth, height = element.clientHeight;
        if (!width || !height || !renderer) return;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        const distance = Math.max(29, 19 / (2 * Math.tan(THREE.MathUtils.degToRad(16)) * camera.aspect));
        camera.position.set(0, 0, distance);
        camera.lookAt(0, 0, 0); camera.updateProjectionMatrix();
      };
      const observer = new ResizeObserver(resize); observer.observe(element); resize();
      const onContextLost = (event: Event) => { event.preventDefault(); setStatus('error'); };
      renderer.domElement.addEventListener('webglcontextlost', onContextLost);
      cleanup = () => {
        cancelAnimationFrame(frame); observer.disconnect(); mixer?.stopAllAction();
        if (root) root.traverse(object => {
          const mesh = object as Mesh;
          mesh.geometry?.dispose();
        });
        materials.forEach(material => material.dispose()); textures.forEach(texture => texture.dispose());
        environment.dispose(); renderer?.domElement.removeEventListener('webglcontextlost', onContextLost);
        renderer?.dispose(); renderer?.domElement.remove(); controller.current = null;
      };
      const [gltf, loadedScreens] = await Promise.all([
        new GLTFLoader().loadAsync('/assets/model/duo.gltf'),
        Promise.all(Object.entries(names).map(async ([name, file]) => {
          const texture = await textureLoader.loadAsync(`/assets/model/${file}.avif`);
          texture.colorSpace = THREE.SRGBColorSpace; texture.flipY = false;
          texture.anisotropy = Math.min(8, renderer!.capabilities.getMaxAnisotropy());
          return [name, texture] as const;
        })),
      ]);
      root = gltf.scene;
      loadedScreens.forEach(([name, texture]) => { screenTextures[name] = texture; textures.add(texture); });
      root.traverse(object => {
        const mesh = object as Mesh;
        if (!mesh.isMesh) return;
        mesh.frustumCulled = false;
        (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach(m => {
          const material = m as MeshPhysicalMaterial;
          materials.add(material); originals.set(material, material.color.clone());
          Object.values(material).forEach(value => { if (value && typeof value === 'object' && (value as Texture).isTexture) textures.add(value as Texture); });
          if (material.transparent) material.depthWrite = false;
          material.envMapIntensity = 1.0;
          if (mesh.name.includes('outerDisplayScreenTexture')) screenOuter = material;
          else if (mesh.name.includes('screenTexture_geo')) {
            screenInner = material;
            // Calibrate the inner anti-glare layer for this independent lighting setup.
            // Broad reflections provide the matte finish; emissive display pixels stay sharp.
            material.clearcoatRoughnessMap = null;
            material.clearcoatRoughness = 0.68;
            material.clearcoat = 0.7;
            material.envMapIntensity = 0.7;
          }
          // The outer display keeps the original glass material.
        });
      });
      if (disposed) { cleanup(); return; }
      oriented.add(root);
      mixer = new THREE.AnimationMixer(root);
      const clip = gltf.animations.find(c => c.name === 'Slider');
      if (!clip) throw new Error('Hinge animation unavailable');
      action = mixer.clipAction(clip); action.setLoop(THREE.LoopOnce, 1); action.clampWhenFinished = true; action.play();
      const center = new THREE.Vector3();
      const bounds = new THREE.Box3();
      const updatePose = () => {
        // Re-evaluate the original skinned hinge without looping the fully open endpoint.
        const time = Math.min(clip.duration - 0.000001, displayAngle / 180 * clip.duration);
        if (Math.abs(time - lastPoseTime) > 0.000001) {
          centered.position.set(0, 0, 0); presentation.rotation.set(0, 0, 0); presentation.updateMatrixWorld(true);
          action!.reset().play(); mixer!.setTime(time); root!.updateMatrixWorld(true);
          root!.traverse(object => { if ((object as import('three').SkinnedMesh).isSkinnedMesh) (object as import('three').SkinnedMesh).computeBoundingBox(); });
          centered.position.set(0, 0, 0); presentation.rotation.set(0, 0, 0); presentation.updateMatrixWorld(true);
          bounds.setFromObject(oriented); bounds.getCenter(center); centered.position.copy(center).multiplyScalar(-1);
          lastPoseTime = time;
        }
        if (lastFinish !== current.finish) {
          materials.forEach(material => {
            const original = originals.get(material)!; material.color.copy(original);
            // Recolor titanium and ceramic surfaces only; preserve lenses and display textures.
            if (current.finish === 'night' && !material.map && material !== screenInner && material !== screenOuter && original.r > 0.35 && !material.transparent) {
              material.color.setRGB(original.r * 0.095, original.g * 0.115, original.b * 0.155);
            }
          });
          lastFinish = current.finish;
        }
        if (screenInner) {
          screenInner.emissiveMap = screenTextures[current.portrait ? 'portrait' : current.pose === 'laptop' ? 'laptop' : 'landscape'];
          screenInner.emissive.set(0xffffff); screenInner.emissiveIntensity = 1; screenInner.toneMapped = false;
        }
        if (screenOuter) {
          screenOuter.emissiveMap = screenTextures[current.pose === 'tent' ? 'tent' : 'closed'];
          screenOuter.emissive.set(0xffffff); screenOuter.emissiveIntensity = 1; screenOuter.toneMapped = false;
        }
        const z = current.portrait ? -Math.PI / 2 : (current.pose === 'tent' || current.pose === 'laptop') ? Math.PI / 2 : 0;
        presentation.rotation.set(currentPitch, currentYaw, z);
      };
      controller.current = { update(next) { Object.assign(current, next); resize(); } };
      const animate = (time: number) => {
        if (disposed) return;
        const dt = Math.min((time - previous) / 1000 || 0.016, 0.05); previous = time;
        const smooth = 1 - Math.exp(-dt * 12);
        displayAngle = current.dragging ? current.angle : THREE.MathUtils.lerp(displayAngle, current.angle, smooth);
        if (Math.abs(displayAngle - current.angle) < 0.03) displayAngle = current.angle;
        currentYaw = THREE.MathUtils.lerp(currentYaw, current.yaw, smooth);
        currentPitch = THREE.MathUtils.lerp(currentPitch, current.pitch, smooth);
        if (current.visible) { updatePose(); renderer!.render(scene, camera); }
        frame = requestAnimationFrame(animate);
      };
      Object.assign(current, latest.current); updatePose(); renderer.render(scene, camera);
      setStatus('ready'); frame = requestAnimationFrame(animate);
    }
    load().catch(error => { if (!disposed) { console.warn('Duo model could not load', error); setStatus('error'); } });
    return () => { disposed = true; cleanup(); };
  }, []);
  return <div className="model-surface" ref={host} data-model-status={status}>
    {status !== 'ready' && <div className="model-loading"><img src="/assets/star-white.webp" alt="Apple  iPhone Duo"/>{status === 'loading' ? <p><span className="model-spinner"/> 正在载入 Apple 三维模型</p> : <><p>当前浏览器暂时无法显示三维模型</p><button onClick={props.onFallback}>继续使用 App 体验</button></>}</div>}
  </div>;
}
