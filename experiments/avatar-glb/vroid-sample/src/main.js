import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRMLoaderPlugin } from '@pixiv/three-vrm';
import './style.css';

const viewer = document.querySelector('#viewer');
const stage = document.querySelector('#stage');
const loading = document.querySelector('#loading');
const buttons = [...document.querySelectorAll('[data-mood]')];
const descriptions = {
  neutral: ['기본 표정', '실제 VRoid VRM 캐릭터가 자연스럽게 서 있습니다.'],
  happy: ['웃기', 'VRM 모델의 웃는 표정을 켭니다.'],
  cry: ['울기', '슬픈 표정과 떨어지는 눈물을 함께 표현합니다.'],
  dance: ['기뻐하며 춤추기', '웃는 표정과 팔·다리·몸의 반복 동작을 동시에 재생합니다.']
};

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
camera.position.set(0, 1.25, 4.1);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
viewer.append(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0x7778a6, 3));
const key = new THREE.DirectionalLight(0xffffff, 2.1);
key.position.set(2, 4, 4);
scene.add(key);
const rim = new THREE.DirectionalLight(0xa99cff, 1.5);
rim.position.set(-2, 2, -3);
scene.add(rim);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.92, 0);
controls.enablePan = false;
controls.minDistance = 2.4;
controls.maxDistance = 7;
controls.update();

let vrm;
let mood = 'neutral';
let expressionNames = [];
const bones = {};
const baseRotations = {};
const clock = new THREE.Clock();

function resize() {
  const { width, height } = viewer.getBoundingClientRect();
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}
new ResizeObserver(resize).observe(viewer);
resize();

function setExpression(name, weight) {
  if (expressionNames.includes(name)) vrm.expressionManager.setValue(name, weight);
}

function setMood(next) {
  if (!vrm || !descriptions[next]) return;
  mood = next;
  const happy = next === 'happy' || next === 'dance';
  setExpression('happy', happy ? 1 : 0);
  setExpression('sad', next === 'cry' ? 1 : 0);
  stage.dataset.mood = next;
  if (next === 'happy' || next === 'cry') {
    camera.position.set(0, 1.55, 2.15);
    controls.target.set(0, 1.52, 0);
  } else {
    camera.position.set(0, 1.25, 4.1);
    controls.target.set(0, 0.92, 0);
  }
  controls.update();
  document.querySelector('#mood-title').textContent = descriptions[next][0];
  document.querySelector('#mood-description').textContent = descriptions[next][1];
  buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mood === next)));
}
buttons.forEach(button => button.addEventListener('click', () => setMood(button.dataset.mood)));
window.avatarDemo = { setMood, getMood: () => mood, getExpressions: () => expressionNames.map(name => [name, vrm?.expressionManager.getValue(name)]) };

const loader = new GLTFLoader();
loader.register(parser => new VRMLoaderPlugin(parser));
loader.load('/models/Sendagaya_Shino.vrm', gltf => {
  vrm = gltf.userData.vrm;
  scene.add(vrm.scene);
  vrm.scene.rotation.y = Math.PI;
  vrm.scene.traverse(object => { object.frustumCulled = false; });
  expressionNames = vrm.expressionManager.expressions.map(expression => expression.expressionName);
  for (const name of ['hips', 'spine', 'leftUpperArm', 'rightUpperArm', 'leftUpperLeg', 'rightUpperLeg']) {
    const bone = vrm.humanoid.getNormalizedBoneNode(name);
    if (bone) { bones[name] = bone; baseRotations[name] = bone.quaternion.clone(); }
  }
  buttons.forEach(button => { button.disabled = false; });
  loading.hidden = true;
  setMood('neutral');
}, undefined, error => {
  console.error(error);
  loading.textContent = 'VRM 모델을 불러오지 못했습니다. 개발자 도구를 확인하세요.';
});

const extraRotation = new THREE.Quaternion();
const axisX = new THREE.Vector3(1, 0, 0);
const axisY = new THREE.Vector3(0, 1, 0);
const axisZ = new THREE.Vector3(0, 0, 1);
function rotateBone(name, axis, angle) {
  const bone = bones[name];
  if (!bone) return;
  extraRotation.setFromAxisAngle(axis, angle);
  bone.quaternion.copy(baseRotations[name]).multiply(extraRotation);
}
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const t = clock.elapsedTime;
  if (vrm) {
    const dance = mood === 'dance';
    const beat = Math.sin(t * 7);
    rotateBone('hips', axisY, dance ? Math.sin(t * 3.5) * 0.18 : 0);
    rotateBone('spine', axisZ, dance ? beat * 0.13 : 0);
    rotateBone('leftUpperArm', axisZ, dance ? -0.85 + beat * 0.5 : 1.1);
    rotateBone('rightUpperArm', axisZ, dance ? 0.85 + beat * 0.5 : -1.1);
    rotateBone('leftUpperLeg', axisX, dance ? beat * 0.25 : 0);
    rotateBone('rightUpperLeg', axisX, dance ? -beat * 0.25 : 0);
    vrm.update(delta);
  }
  controls.update();
  renderer.render(scene, camera);
}
animate();
