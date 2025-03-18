import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as CANNON from 'cannon-es';


// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75, window.innerWidth / window.innerHeight, 1, 100000
);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg') });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// Wolrd collide

const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -98.2, 0)
});


// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.8));
const pointLight = new THREE.PointLight(0xffffff, 0.8);
pointLight.position.set(5, 500, 5);
scene.add(pointLight);

// Background
scene.background = new THREE.TextureLoader().load('space.jpg');

// Load track model
const loader = new GLTFLoader();
// Déclaration globale
let debugMesh = null;
let terrainBody = null; // si besoin pour le body associé
let terrainShape = null; // si besoin pour le body associé

loader.load('race_2.glb', (gltf) => {
  const track = gltf.scene;
  track.position.set(0, -360, 0);

  track.traverse((child) => {
    if (child.isMesh) {
      child.frustumCulled = false;
      
      // Assurez-vous que la matrice mondiale est à jour
      child.updateMatrixWorld(true);
      
      // Cloner et transformer la géométrie en espace global
      const clonedGeometry = child.geometry.clone();
      clonedGeometry.applyMatrix4(child.matrixWorld);
      
      // Extraction des données géométriques transformées
      const vertices = Array.from(clonedGeometry.attributes.position.array);
      const indices = Array.from(clonedGeometry.index.array);

      // Création du body physique en utilisant le Trimesh
      terrainBody = new CANNON.Body({ mass: 0, type: CANNON.Body.STATIC });
      terrainShape = new CANNON.Trimesh(vertices, indices);
      terrainBody.addShape(terrainShape);
      // Ici, comme la géométrie est déjà en espace global, on peut laisser position à zéro
      terrainBody.position.set(0, -360, 0);
      world.addBody(terrainBody);

      // Création du DebugMesh (pour visualiser le collision mesh)
      debugMesh = new THREE.Mesh(
        clonedGeometry,
        new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
      );
      debugMesh.position.set(0, -360, 0);
      scene.add(debugMesh);
    }
  });

  scene.add(track);
}, undefined, console.error);

//COLLIDE
const groundGeo = new THREE.PlaneGeometry(10000, 10000);
const groundMat = new THREE.MeshBasicMaterial({ 
  color: 0xffffff,
  side : THREE.DoubleSide,
  wireframe : true
});
const groundMesh = new THREE.Mesh(groundGeo, groundMat);
scene.add(groundMesh);

const groundBody = new CANNON.Body({
  //mass: 10,
  shape: new CANNON.Plane(),
  type : CANNON.Body.STATIC,
  position: new CANNON.Vec3(0, -25, 0),
});
world.addBody(groundBody);
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);

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


// BOX 

const boxGeo = new THREE.BoxGeometry(17, 5, 17);
const boxMat = new THREE.MeshBasicMaterial({
   color: 0x00ff00,
    wireframe: true
  });
const boxMesh = new THREE.Mesh(boxGeo, boxMat);
scene.add(boxMesh);

const boxBody = new CANNON.Body({
  mass: 200,
  shape: new CANNON.Box(new CANNON.Vec3(8, 3, 8)),
  position: new CANNON.Vec3(0, 300, 0),
});
world.addBody(boxBody);


// Controls
const keys = { z: false, s: false, q: false, d: false };
const speed = 10;
const rotationSpeed = 0.03;

window.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

function moveKart() {
  if (!kart) return;

  if (keys.z) {
    kart.translateZ(speed);
  }
  if (keys.s) {
    kart.translateZ(-speed);
  }
  if (keys.q) {
    kart.rotation.y += rotationSpeed;
  }
  if (keys.d) {
    kart.rotation.y -= rotationSpeed;
  }  
}

function moveBody() {
  if (!kart) return;
  
  if (kart){
    boxBody.position.set(kart.position.x,boxBody.position.y , kart.position.z);
    boxBody.quaternion.copy(kart.quaternion);
    kart.position.y = boxBody.position.y;
  }
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

const timeStep = 1 / 60;

function animate() {
  world.step(timeStep);
  requestAnimationFrame(animate);

  debugMesh.position.copy(terrainBody.position);
  debugMesh.quaternion.copy(terrainBody.quaternion);

  boxMesh.position.copy(boxBody.position);
  boxMesh.quaternion.copy(boxBody.quaternion);

  groundMesh.position.copy(groundBody.position);
  groundMesh.quaternion.copy(groundBody.quaternion);

  moveKart();
  moveBody();
  updateCamera();


  //console.log(kart.position);

  renderer.render(scene, camera);
}

animate();