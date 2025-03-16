import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Setup
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  60, window.innerWidth / window.innerHeight, 1, 100000
);
camera.position.set(0, 20, 100);

const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg') });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);


// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const pointLight = new THREE.PointLight(0xffffff, 0.8);
pointLight.position.set(5, 10, 5);
scene.add(pointLight);

// Background
scene.background = new THREE.TextureLoader().load('space.jpg');

// GLB Model
const loader = new GLTFLoader();
// Chargement corrigé du modèle
loader.load('race_2.glb', (gltf) => {
  const customModel = gltf.scene;

  customModel.scale.set(1, 1, 1); // garde ton échelle préférée
  customModel.position.set(0, -150, 0); // ajuste selon tes besoins

  customModel.traverse((child) => {
    if (child.isMesh) {
      child.frustumCulled = false; // <-- désactive le frustum culling
      child.geometry.computeVertexNormals();
      child.geometry.computeBoundingBox();
      child.geometry.computeBoundingSphere();
    }
  });

  scene.add(customModel);
}, undefined, console.error);

// Déplacement clavier
const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, z: false, s: false, q: false, d: false, ' ': false, Shift: false };
const speed = 10;

window.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

// Orientation caméra avec souris
let mouse = { x: 0, y: 0 };
window.addEventListener('mousemove', (e) => {
  mouse.x = -(e.clientX / window.innerWidth) * 2 + 1;
  mouse.y = -(e.clientY / window.innerHeight) * 0.5;
});

function moveCamera() {
  if (keys.ArrowUp || keys.z) camera.position.z -= speed;
  if (keys.ArrowDown || keys.s) camera.position.z += speed;
  if (keys.ArrowLeft || keys.q) camera.position.x -= speed;
  if (keys.ArrowRight || keys.d) camera.position.x += speed;
  if (keys[' ']) camera.position.y += speed;
  if (keys.shift && keys[' ']) camera.position.y -= speed * 2; // shift + espace pour descendre
}

function animate() {
  requestAnimationFrame(animate);

  // Mise à jour orientation caméra selon la souris
  //camera.rotation.y = mouse.x * 2;
  //camera.rotation.x = mouse.y * 2;

  moveCamera();
  renderer.render(scene, camera);
}

// Actualiser la position de la souris
window.addEventListener('mousemove', (event) => {
  mouse.x = -(event.clientX / window.innerWidth) * 5 + 1;
  mouse.y = -(event.clientY / window.innerHeight) * 5 + 1;
});

animate();