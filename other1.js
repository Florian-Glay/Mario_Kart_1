import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as CANNON from 'cannon-es';

// === Scène, caméra, renderer ===
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000000
);
camera.position.set(0, 150, 300);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.8));
const pointLight = new THREE.PointLight(0xffffff, 0.8);
pointLight.position.set(5, 500, 5);
scene.add(pointLight);

// Background
scene.background = new THREE.TextureLoader().load('smoky-watercolor-cloud-background.jpg');

// === Monde physique ===
const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.82, 0)
});
world.broadphase = new CANNON.SAPBroadphase(world);
world.allowSleep = false;

// === Création du sol ===
// Affichage Three.js
const groundGeo = new THREE.PlaneGeometry(500, 500);
const groundMat = new THREE.MeshBasicMaterial({ 
  color: 0xffffff,
  side: THREE.DoubleSide,
  wireframe: false
});
const groundMesh = new THREE.Mesh(groundGeo, groundMat);
scene.add(groundMesh);

// Physique Cannon-es
const groundBody = new CANNON.Body({
  // Le sol est statique
  shape: new CANNON.Plane(),
  type: CANNON.Body.STATIC,
  position: new CANNON.Vec3(0, -25, 0)
});
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(groundBody);

// === Chargement de la carte (track) ===
const loader = new GLTFLoader();
loader.load(
  'race_2.glb',
  (gltf) => {
    const track = gltf.scene;
    track.scale.set(1, 1, 1);
    // Positionnez le track pour qu'il soit superposé au sol
    track.position.set(0, -360, 0);
    track.traverse((child) => {
      if (child.isMesh) child.frustumCulled = false;
    });
    scene.add(track);
  },
  undefined,
  console.error
);

// === Création de la boîte contrôlée (car) ===
// Mesh Three.js
const boxGeo = new THREE.BoxGeometry(17, 5, 17);
const boxMat = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  wireframe: true
});
const boxMesh = new THREE.Mesh(boxGeo, boxMat);
boxMesh.visible = false;
scene.add(boxMesh);

// Corps physique Cannon-es
const boxBody = new CANNON.Body({
  mass: 200,
  shape: new CANNON.Box(new CANNON.Vec3(8, 3, 8)),
  position: new CANNON.Vec3(-1850, 0, -65)
});
boxBody.quaternion.setFromEuler(0,-Math.PI, 0);
boxBody.fixedRotation = true;
boxBody.updateMassProperties();
world.addBody(boxBody);

// === Chargement du modèle de la voiture (kart) ===
let kart;
loader.load(
  'car_1.glb',
  (gltf) => {
    kart = gltf.scene;
    kart.scale.set(50, 50, 50);
    // Position initiale (sera remplacée dans l'animation)
    kart.position.set(-1850, 0, -38);
    // Orientation initiale
    kart.rotation.y = Math.PI;
    kart.traverse((child) => {
      if (child.isMesh) child.frustumCulled = false;
    });
    scene.add(kart);
  },
  undefined,
  console.error
);

// === Gestion des contrôles clavier (Z, Q, S, D) ===
const keys = { z: false, s: false, q: false, d: false };
window.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

// === Mise à jour des contrôles de la boîte ===
// Avec Z et S, la boîte est déplacée selon la direction de la caméra.
// Avec Q et D, une rotation est appliquée.
function updateBoxControl() {
  const speed = 200;
  
  let camDirection = new THREE.Vector3();
  camera.getWorldDirection(camDirection);
  camDirection.y = 0;
  camDirection.normalize();
  
  let movement = new THREE.Vector3(0, 0, 0);
  
  if (keys.z) {
    movement.add(camDirection.clone().multiplyScalar(speed));
  }
  if (keys.s) {
    movement.add(camDirection.clone().multiplyScalar(-speed));
  }
  
  // Mise à jour de la vitesse du corps sur les axes X et Z
  boxBody.velocity.x = movement.x;
  boxBody.velocity.z = movement.z;
  
  if (keys.z || keys.s || keys.q || keys.d) {
    boxBody.wakeUp();
  }
  
  const rotationSpeed = 1.5;
  if (keys.q) {
    boxBody.angularVelocity.y = rotationSpeed;
  } else if (keys.d) {
    boxBody.angularVelocity.y = -rotationSpeed;
  } else {
    boxBody.angularVelocity.y *= 0.9;
  }
}

// === Caméra à la 3e personne ===
// La caméra suit la boîte contrôlée.
function updateCamera() {
  const localOffset = new THREE.Vector3(0, 40, -60);
  const worldOffset = localOffset.clone().applyQuaternion(boxMesh.quaternion);
  const desiredCameraPos = new THREE.Vector3().copy(boxMesh.position).add(worldOffset);
  camera.position.lerp(desiredCameraPos, 0.1);
  camera.lookAt(boxMesh.position);
}

// === Création de cube ===

// Liste globale pour stocker tous les cubes créés
const cubesList = [];

/**
 * Crée un cube/pavé et l'ajoute à la scène et au monde physique.
 *
 * @param {number} width - La largeur du cube.
 * @param {number} height - La hauteur du cube.
 * @param {number} depth - La profondeur (longueur) du cube.
 * @param {number} x - La position X dans le monde.
 * @param {number} y - La position Y dans le monde.
 * @param {number} z - La position Z dans le monde.
 * @param {boolean} isStatic - Si vrai, le cube est statique (masse = 0) ; sinon, il a une masse de 20.
 * @param {boolean} isVisible - Si vrai, le cube est visible ; sinon, il est invisible
 * @returns {object} Un objet contenant le mesh et le body du cube.
 */
function createCube(width, height, depth, x, y, z, isStatic, isVisible = false) {
  // Création du mesh Three.js
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    wireframe: true
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.visible = isVisible;
  scene.add(mesh);

  // Création du corps physique Cannon-es
  const shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
  const body = new CANNON.Body({
    shape: shape,
    position: new CANNON.Vec3(x, y, z)
  });
  isStatic ? body.mass = 200 : body.type = CANNON.Body.STATIC;
  world.addBody(body);

  // Enregistrement du cube dans la liste
  cubesList.push({ mesh, body });
  return { mesh, body };
}

// Création de cubes
createCube(30, 60, 4000, -2300, -20, -250, true);
createCube(4600, 60, 30, 0, -20, 1750, true);
createCube(4600, 60, 30, 0, -20, -2230, true);
createCube(30, 60, 4000, 2260, -20, -250, true);

// === Affichage coordonnées ===

// Fonction pour créer l'overlay d'affichage des coordonnées
function createOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'vehicleCoordinates';
    overlay.style.position = 'absolute';
    overlay.style.top = '10px';
    overlay.style.right = '10px';
    overlay.style.color = 'white';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.padding = '10px';
    overlay.style.fontFamily = 'monospace';
    overlay.style.zIndex = '100';
    document.body.appendChild(overlay);
  }
  
  // Fonction pour mettre à jour les coordonnées du véhicule
  function updateVehicleCoordinates() {
    const overlay = document.getElementById('vehicleCoordinates');
    if (overlay) {
      // Ici on prend les coordonnées du véhicule, par exemple boxBody.position
      overlay.innerHTML = `x: ${boxBody.position.x.toFixed(2)}<br>
                           y: ${boxBody.position.y.toFixed(2)}<br>
                           z: ${boxBody.position.z.toFixed(2)}`;
    }
  }
  
  // Créer l'overlay dès le début
  createOverlay();
  



// === Boucle d'animation ===
const timeStep = 1 / 60;
function animate() {
  requestAnimationFrame(animate);
  
  updateBoxControl();
  
  // Mise à jour du monde physique
  world.step(timeStep);
  
  // Synchronisation du mesh de la boîte avec son corps physique
  boxMesh.position.copy(boxBody.position);
  boxMesh.quaternion.copy(boxBody.quaternion);
  
  // Le kart suit la boîte (position et rotation)
  if (kart) {
    // Vous pouvez éventuellement ajouter un décalage pour ajuster l'attache
    kart.position.copy(boxMesh.position);
    kart.quaternion.copy(boxMesh.quaternion);
  }
  
  // Synchronisation du sol
  groundMesh.position.copy(groundBody.position);
  groundMesh.quaternion.copy(groundBody.quaternion);

  // Mise à jour des cubes
  cubesList.forEach(cube => {
    cube.mesh.position.copy(cube.body.position);
    cube.mesh.quaternion.copy(cube.body.quaternion);
  });
  
  // Mise à jour de la caméra
  updateCamera();
  updateVehicleCoordinates()
  
  renderer.render(scene, camera);
}
animate();

// === Ajustement lors du redimensionnement de la fenêtre ===
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
