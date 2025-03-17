import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75, window.innerWidth / window.innerHeight, 1, 100000
);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg') });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.8));
const pointLight = new THREE.PointLight(0xffffff, 0.8);
pointLight.position.set(5, 500, 5);
scene.add(pointLight);

// Background
scene.background = new THREE.TextureLoader().load('space.jpg');

// Load track model
const loader = new GLTFLoader();
loader.load('race_2.glb', (gltf) => {
  const track = gltf.scene;
  track.scale.set(1, 1, 1);
  track.position.set(0, -360, 0);
  track.traverse((child) => {
    if (child.isMesh) child.frustumCulled = false;
  });
  scene.add(track);
}, undefined, console.error);

// Ground (green grass beneath track)
const groundGeometry = new THREE.PlaneGeometry(10000, 10000);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x28B831 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -36; // aligné juste en dessous de la piste
scene.add(ground);

// Load kart model
let kart;
loader.load('car_1.glb', (gltf) => {
  kart = gltf.scene;
  kart.scale.set(50, 50, 50);
  kart.position.set(-1850, 0, -38);
  kart.rotation.y = Math.PI;
  kart.traverse((child) => {
    if (child.isMesh) child.frustumCulled = false;
  });
  scene.add(kart);
}, undefined, console.error);

// Controls
const keys = { z: false, s: false, q: false, d: false };
const speed = 10;
const rotationSpeed = 0.03;

window.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

function moveKart() {
  if (!kart) return;

  if (keys.z) kart.translateZ(speed);
  if (keys.s) kart.translateZ(-speed);
  if (keys.q) kart.rotation.y += rotationSpeed;
  if (keys.d) kart.rotation.y -= rotationSpeed;
}

// Camera position - corrected first-person view
function updateCamera() {
  if (!kart) return;

  const offset = new THREE.Vector3(0, 50, -50); // Positionnement directement au-dessus du siège conducteur
  offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), kart.rotation.y);

  camera.position.copy(kart.position).add(offset);

  const forwardVector = new THREE.Vector3(0, 40, -20);
  forwardVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), kart.rotation.y);

  camera.lookAt(kart.position.clone().add(forwardVector));
}

function animate() {
  requestAnimationFrame(animate);

  moveKart();
  updateCamera();

  console.log(kart.position);

  renderer.render(scene, camera);
}

animate();