import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './style.css';

const viewer = document.querySelector('#viewer');
const loading = document.querySelector('#loading');
const buttons = [...document.querySelectorAll('[data-expression]')];
const strengthInput = document.querySelector('#strength');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 30);
camera.position.set(0, -0.1, 4.1);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
viewer.append(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xffffff, 0x9d719b, 2.4));
const key = new THREE.DirectionalLight(0xffebda, 2);
key.position.set(-2, 3, 4);
scene.add(key);
const rim = new THREE.DirectionalLight(0xc99bed, 1.6);
rim.position.set(2, 1, -3);
scene.add(rim);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, -0.17, 0);
controls.enablePan = false;
controls.minDistance = 2.3;
controls.maxDistance = 5;
controls.maxPolarAngle = Math.PI * 0.7;
controls.update();

let faceMeshes = [];
let expression = 'neutral';
let displayedHappy = 0;
let displayedSad = 0;
const descriptions = {
  neutral: ['기본 얼굴', '평온한 눈과 입 모양입니다.'],
  happy: ['웃기', '입꼬리·눈·눈썹이 함께 바뀝니다.'],
  sad: ['울기', '입꼬리와 눈썹이 내려가고 눈물이 나타납니다.']
};

function resize() {
  const rect = viewer.getBoundingClientRect();
  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();
  renderer.setSize(rect.width, rect.height, false);
}
new ResizeObserver(resize).observe(viewer);
resize();

function setExpression(next) {
  if (!descriptions[next]) return;
  expression = next;
  document.querySelector('#state-title').textContent = descriptions[next][0];
  document.querySelector('#state-description').textContent = descriptions[next][1];
  buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.expression === next)));
}
buttons.forEach(button => button.addEventListener('click', () => setExpression(button.dataset.expression)));
strengthInput.addEventListener('input', () => { document.querySelector('#strength-value').textContent = `${strengthInput.value}%`; });
window.faceDemo = { setExpression, getExpression: () => expression, getWeights: () => [displayedHappy, displayedSad], getMorphMeshCount: () => faceMeshes.length };

new GLTFLoader().load('/models/mina-face.glb', gltf => {
  scene.add(gltf.scene);
  gltf.scene.traverse(object => {
    if (object.isMesh && object.morphTargetDictionary && 'happy' in object.morphTargetDictionary && 'sad' in object.morphTargetDictionary) {
      faceMeshes.push(object);
    }
  });
  if (faceMeshes.length < 5) throw new Error('GLB facial blendshapes were not loaded');
  buttons.forEach(button => { button.disabled = false; });
  strengthInput.disabled = false;
  loading.hidden = true;
  setExpression('neutral');
}, undefined, error => {
  console.error(error);
  loading.textContent = 'GLB 모델을 불러오지 못했습니다.';
});

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);
  const strength = Number(strengthInput.value) / 100;
  const targetHappy = expression === 'happy' ? strength : 0;
  const targetSad = expression === 'sad' ? strength : 0;
  const blend = Math.min(1, delta * 12);
  displayedHappy += (targetHappy - displayedHappy) * blend;
  displayedSad += (targetSad - displayedSad) * blend;
  for (const mesh of faceMeshes) {
    mesh.morphTargetInfluences[mesh.morphTargetDictionary.happy] = displayedHappy;
    mesh.morphTargetInfluences[mesh.morphTargetDictionary.sad] = displayedSad;
  }
  controls.update();
  renderer.render(scene, camera);
}
animate();
