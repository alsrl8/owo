import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const modelUrls = {
  custom: '/avatar-models/mina-face.glb',
  external: '/avatar-models/mpfb.glb',
};

const expressions = {
  custom: {
    warm: { happy: 1 },
    neutral: {},
    overwhelmed: { sad: 0.9 },
  },
  external: {
    warm: { mouthSmileLeft: 0.85, mouthSmileRight: 0.85, eyeSquintLeft: 0.2, eyeSquintRight: 0.2 },
    neutral: { browInnerUp: 0.12 },
    overwhelmed: { browInnerUp: 0.7, eyeWideLeft: 0.35, eyeWideRight: 0.35, mouthFrownLeft: 0.5, mouthFrownRight: 0.5, jawOpen: 0.16 },
  },
};

export function createAvatarViewer(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0, 0);
  container.append(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.01, 100);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x9b8d9b, 2.8));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(2, 3, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffdbe8, 1);
  rim.position.set(-2, 2, -3);
  scene.add(rim);

  const models = new Map();
  const loader = new GLTFLoader();
  const clock = new THREE.Clock();
  let style = null;
  let emotion = 'warm';
  let requestId = 0;
  let active = null;
  let frameId;
  let visible = true;

  function resize() {
    const { width, height } = container.getBoundingClientRect();
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);

  function frameModel(object, modelStyle) {
    const bounds = new THREE.Box3().setFromObject(object);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    if (modelStyle === 'external') {
      const faceHeight = bounds.min.y + size.y * 0.92;
      camera.position.set(center.x, faceHeight, center.z + size.y * 0.42);
      camera.lookAt(center.x, faceHeight, center.z);
    } else {
      camera.position.set(center.x, center.y, center.z + Math.max(size.x, size.y) * 1.55);
      camera.lookAt(center);
    }
    camera.updateProjectionMatrix();
  }

  function setEmotion(next) {
    if (!expressions.custom[next]) return;
    emotion = next;
  }

  async function setStyle(next) {
    if (!modelUrls[next]) throw new Error('알 수 없는 아바타 모델입니다.');
    const id = ++requestId;
    let modelPromise = models.get(next);
    if (!modelPromise) {
      modelPromise = loader.loadAsync(modelUrls[next]).then((gltf) => {
        const meshes = [];
        gltf.scene.traverse((object) => {
          if (object.isMesh && object.morphTargetDictionary) meshes.push(object);
        });
        return { object: gltf.scene, meshes };
      });
      models.set(next, modelPromise);
    }
    let model;
    try {
      model = await modelPromise;
    } catch (error) {
      models.delete(next);
      throw error;
    }
    if (id !== requestId) return;
    if (active) scene.remove(active.object);
    active = model;
    style = next;
    scene.add(model.object);
    frameModel(model.object, next);
    resize();
  }

  function animate() {
    frameId = requestAnimationFrame(animate);
    const blend = Math.min(1, clock.getDelta() * 12);
    if (!visible) return;
    if (active) {
      const weights = expressions[style][emotion];
      for (const mesh of active.meshes) {
        for (const [name, index] of Object.entries(mesh.morphTargetDictionary)) {
          const current = mesh.morphTargetInfluences[index] || 0;
          mesh.morphTargetInfluences[index] = current + ((weights[name] || 0) - current) * blend;
        }
      }
    }
    renderer.render(scene, camera);
  }
  animate();

  return {
    setEmotion,
    setStyle,
    setVisible(next) {
      visible = next;
      if (visible) resize();
    },
    destroy() {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
