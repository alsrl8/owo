import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { writeFile } from 'node:fs/promises';

// GLTFExporter uses FileReader for its final Blob even when no image exists.
globalThis.FileReader ??= class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then(buffer => { this.result = buffer; this.onloadend?.(); });
  }
};

const scene = new THREE.Scene();
const avatar = new THREE.Group();
avatar.name = 'Mina_custom_female_face';
scene.add(avatar);

const mat = (color, roughness = 0.85) => new THREE.MeshStandardMaterial({ color, roughness, metalness: 0 });
const skin = mat(0xf3bc9f);
const skinShadow = mat(0xe6a484);
const hair = mat(0x211c2b);
const hairShine = mat(0x3b3044);
const white = mat(0xfff9f4);
const iris = mat(0x5b3541);
const pupil = mat(0x21151b);
const brow = mat(0x30212c);
const lips = mat(0xa1485e);
brow.side = THREE.DoubleSide;
lips.side = THREE.DoubleSide;
const blush = mat(0xe58d91);
const tearBlue = mat(0x8fd8f5, 0.2);
const dress = mat(0x6a608f);

function add(name, geometry, material, position, scale = [1, 1, 1], rotation = [0, 0, 0]) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  mesh.rotation.set(...rotation);
  avatar.add(mesh);
  return mesh;
}
const sphere = new THREE.SphereGeometry(1, 32, 24);
add('neck', sphere, skinShadow, [0, -0.94, -0.05], [0.19, 0.3, 0.18]);
add('shoulders', sphere, dress, [0, -1.32, -0.11], [0.78, 0.42, 0.34]);
add('back_hair', sphere, hair, [0, -0.2, -0.28], [0.81, 1.16, 0.51]);
add('face', sphere, skin, [0, 0, 0], [0.69, 0.87, 0.6]);
add('left_ear', sphere, skin, [-0.68, -0.1, 0.05], [0.11, 0.19, 0.09]);
add('right_ear', sphere, skin, [0.68, -0.1, 0.05], [0.11, 0.19, 0.09]);
add('nose', sphere, skinShadow, [0, -0.16, 0.61], [0.055, 0.09, 0.07]);

// A cropped sphere forms the fringe without covering the face.
const cap = new THREE.SphereGeometry(1, 40, 16, 0, Math.PI * 2, 0, Math.PI * 0.40);
add('hair_cap', cap, hair, [0, 0.02, -0.03], [0.72, 0.92, 0.66]);
for (let i = 0; i < 9; i++) {
  const x = (i - 4) * 0.145;
  const length = 0.32 + (i % 3) * 0.065;
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(x * 0.8, 0.80, 0.30),
    new THREE.Vector3(x, 0.60, 0.54),
    new THREE.Vector3(x + 0.025, 0.54 - length * 0.2, 0.58)
  ]);
  add(`fringe_${i}`, new THREE.TubeGeometry(curve, 12, 0.065, 8, false), i % 3 === 0 ? hairShine : hair, [0, 0, 0]);
}
for (const side of [-1, 1]) {
  for (let i = 0; i < 4; i++) {
    const x = side * (0.61 + i * 0.045);
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(x * 0.86, 0.63, 0.15),
      new THREE.Vector3(x, 0.05, 0.24 + i * 0.025),
      new THREE.Vector3(x + side * 0.05, -0.65, 0.22),
      new THREE.Vector3(x + side * 0.10, -1.08 - i * 0.05, 0.11)
    ]);
    add(`${side < 0 ? 'left' : 'right'}_hair_${i}`, new THREE.TubeGeometry(curve, 20, 0.08, 8, false), i === 1 ? hairShine : hair, [0, 0, 0]);
  }
}

function morphGeometry(base, happyPositions, sadPositions) {
  const happy = new THREE.Float32BufferAttribute(happyPositions, 3);
  happy.name = 'happy';
  const sad = new THREE.Float32BufferAttribute(sadPositions, 3);
  sad.name = 'sad';
  base.morphAttributes.position = [happy, sad];
  return base;
}

function ribbon(name, material, points, happyY, sadY, width = 0.025) {
  const positions = [], happy = [], sad = [], normals = [], indices = [];
  points.forEach(([x, y, z], i) => {
    for (const edge of [-1, 1]) {
      positions.push(x, y + edge * width, z);
      happy.push(x, happyY(x, y) + edge * width, z);
      sad.push(x, sadY(x, y) + edge * width, z);
      normals.push(0, 0, 1);
    }
    if (i < points.length - 1) {
      const k = i * 2;
      indices.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
    }
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setIndex(indices);
  morphGeometry(geometry, happy, sad);
  add(name, geometry, material, [0, 0, 0]);
}

for (const side of [-1, 1]) {
  const eyeX = side * 0.29;
  const eye = new THREE.SphereGeometry(1, 28, 18);
  const base = eye.attributes.position.array;
  const happy = [], sad = [];
  for (let i = 0; i < base.length; i += 3) {
    happy.push(base[i], base[i + 1] * 0.62, base[i + 2]);
    sad.push(base[i], base[i + 1] * 0.72 - 0.08, base[i + 2]);
  }
  morphGeometry(eye, happy, sad);
  add(`${side < 0 ? 'left' : 'right'}_eye`, eye, white, [eyeX, 0.07, 0.55], [0.165, 0.105, 0.055]);
  add(`${side < 0 ? 'left' : 'right'}_iris`, sphere, iris, [eyeX, 0.065, 0.605], [0.062, 0.072, 0.02]);
  add(`${side < 0 ? 'left' : 'right'}_pupil`, sphere, pupil, [eyeX, 0.065, 0.627], [0.034, 0.044, 0.012]);
  add(`${side < 0 ? 'left' : 'right'}_catchlight`, sphere, white, [eyeX - 0.022, 0.089, 0.641], [0.013, 0.013, 0.007]);
  add(`${side < 0 ? 'left' : 'right'}_cheek`, sphere, blush, [side * 0.45, -0.16, 0.48], [0.12, 0.035, 0.014]);
  const tear = new THREE.SphereGeometry(1, 16, 12);
  const tearBase = tear.attributes.position.array;
  const tearHappy = [], tearSad = [];
  for (let i = 0; i < tearBase.length; i += 3) {
    tearHappy.push(tearBase[i], tearBase[i + 1], tearBase[i + 2]);
    tearSad.push(tearBase[i], tearBase[i + 1], tearBase[i + 2] + 16);
  }
  morphGeometry(tear, tearHappy, tearSad);
  add(`${side < 0 ? 'left' : 'right'}_tear`, tear, tearBlue, [side * 0.31, -0.20, 0.07], [0.035, 0.06, 0.035]);
  const browPoints = [];
  for (let i = 0; i <= 12; i++) {
    const u = i / 12;
    const x = eyeX + (u - 0.5) * 0.34;
    browPoints.push([x, 0.34 + 0.025 * (1 - Math.abs(2 * u - 1)), 0.63]);
  }
  ribbon(`${side < 0 ? 'left' : 'right'}_brow`, brow, browPoints,
    (x, y) => y + 0.065,
    (x, y) => y + 0.10 * (1 - Math.abs(x) / 0.55) - 0.06 * Math.abs(x) / 0.55,
    0.018);
}

const mouthPoints = [];
for (let i = 0; i <= 24; i++) {
  const u = i / 24 * 2 - 1;
  mouthPoints.push([u * 0.24, -0.43 + 0.012 * u * u, 0.62]);
}
ribbon('mouth', lips, mouthPoints,
  (x) => -0.46 + 0.17 * (x / 0.24) ** 2,
  (x) => -0.40 - 0.10 * (x / 0.24) ** 2,
  0.023);

const exporter = new GLTFExporter();
const buffer = await exporter.parseAsync(scene, { binary: true, onlyVisible: true, trs: true });
await writeFile(new URL('../public/models/mina-face.glb', import.meta.url), Buffer.from(buffer));
console.log(`Wrote mina-face.glb (${buffer.byteLength} bytes)`);
