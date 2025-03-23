import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as CANNON from 'cannon-es';

// === CHAT ===
// Variable pour stocker la valeur du chat
let chatValue = "";
var statusWolrd = "run";

// Récupération des éléments
const chatIcon = document.getElementById('chat-icon');
const chatWindow = document.getElementById('chat-window');
const chatInput = document.getElementById('chat-input');

// Au clic sur l'icône, basculer la classe active
chatIcon.addEventListener('click', () => {
  if (chatWindow.classList.contains('active')) {
    // Fermeture : la transition fera passer l'opacité de 0.8 à 0
    chatWindow.classList.remove('active');
  } else {
    // Ouverture : la transition fera passer l'opacité de 0 à 0.8
    chatWindow.classList.add('active');
    chatInput.focus(); // Met le focus dans l'input
  }
});

// Lorsqu'on appuie sur "Entrée", on enregistre le message dans chatValue
chatInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    chatValue = chatInput.value;
    //console.log("Chat Value:", chatValue);
    // Optionnel: vider le champ de saisie
    chatInput.value = '';
    // Optionnel: masquer la fenêtre après envoi
    // chatWindow.style.display = 'none';
  }
});

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
scene.add(new THREE.AmbientLight(0xffffff, 1));
const pointLight = new THREE.PointLight(0xffffff, 0.8);
pointLight.position.set(5, 500, 5);
//scene.add(pointLight);


const pointLight2 = new THREE.PointLight(0xffffff, 1);
pointLight2.position.set(5, 0, 5);
scene.add(pointLight2);

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
groundMesh.visible = false;
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
  '3D_Model/background.glb',
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
const boxGeo = new THREE.BoxGeometry(17, 5, 25);
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
  shape: new CANNON.Box(new CANNON.Vec3(8, 3, 12.5 )),
  position: new CANNON.Vec3(-1850, 0, -65)
});
boxBody.quaternion.setFromEuler(0,-Math.PI, 0);
boxBody.fixedRotation = true;
boxBody.updateMassProperties();
world.addBody(boxBody);

// === Chargement du modèle de la voiture (kart) ===
let kart;
loader.load(
  '3D_Model/car_1.glb',
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


// === Vitesse voiture ===

// Variables globales pour stocker les bounding boxes
let circuitBB, dirtBB;// Variables globales pour stocker les terrains
let circuitTerrain, dirtTerrain;

// Lors du chargement du terrain circuit
loader.load(
  '3D_Model/road.glb',
  (gltf) => {
    circuitTerrain = gltf.scene;
    circuitTerrain.name = "circuit";
    circuitTerrain.position.set(0, -360, 0);
    circuitTerrain.traverse(child => {
      if (child.isMesh) child.frustumCulled = false;
    });
    scene.add(circuitTerrain);
    // Calcul de la bounding box pour le terrain circuit
    circuitBB = new THREE.Box3().setFromObject(circuitTerrain);
    console.log("BoundingBox circuit:", circuitBB);
  },
  undefined,
  console.error
);

// Lors du chargement du terrain dirt
loader.load(
  '3D_Model/dirt.glb',
  (gltf) => {
    dirtTerrain = gltf.scene;
    dirtTerrain.name = "dirt";
    dirtTerrain.position.set(0, -360, 0);
    dirtTerrain.traverse(child => {
      if (child.isMesh) child.frustumCulled = false;
    });
    scene.add(dirtTerrain);
    // Calcul de la bounding box pour le terrain dirt
    dirtBB = new THREE.Box3().setFromObject(dirtTerrain);
    console.log("BoundingBox dirt:", dirtBB);
  },
  undefined,
  console.error
);


// --- Variables globales pour stocker les données des terrains via image ---
let terrainPlanes = {}; // Exemple : { "road": { mesh, boundingBox, imageData, imgWidth, imgHeight }, "dirt": { ... } }

// Fonction qui crée un plan horizontal avec une texture et prépare ses données d'image
function createTerrainPlane(name, imageUrl, position, scale) {
  // Créez une géométrie plane aux dimensions souhaitées (scale.width et scale.depth)
  const geometry = new THREE.PlaneGeometry(scale.width, scale.depth);
  const texture = new THREE.TextureLoader().load(imageUrl, (tex) => {
    // Lorsque l'image est chargée, dessinez-la sur un canvas pour récupérer les données
    const image = tex.image;
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    // Stockez les données dans l'objet global
    terrainPlanes[name].imageData = imageData;
    terrainPlanes[name].imgWidth = image.width;
    terrainPlanes[name].imgHeight = image.height;
    console.log("Texture", name, "chargée avec dimensions", image.width, image.height);
  });
  texture.format = THREE.RGBAFormat;
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
  const plane = new THREE.Mesh(geometry, material);
  // Pour un plan horizontal, on le fait pivoter pour qu'il soit parallèle au sol
  plane.rotation.x = -Math.PI / 2;
  plane.position.set(position.x, position.y, position.z);
  plane.name = name;
  scene.add(plane);
  
  // Calculer le rectangle (bounding box horizontal) que couvre le plan
  const bbox = {
    minX: position.x - scale.width / 2,
    maxX: position.x + scale.width / 2,
    minZ: position.z - scale.depth / 2,
    maxZ: position.z + scale.depth / 2,
    y: position.y  // valeur constante, car le plan est horizontal
  };
  
  // Enregistrez le plan dans l'objet global
  terrainPlanes[name] = {
    mesh: plane,
    boundingBox: bbox,
    imageData: null,
    imgWidth: 0,
    imgHeight: 0
  };
}

// Exemple d'utilisation pour vos terrains
// Ajustez la position et la taille (scale) pour qu'elles correspondent à la zone de votre terrain.
// Par exemple, pour le road :
createTerrainPlane("road", "3D_Model/road.png", { x: 0, y: -20, z: 0 }, { width: 5000, depth: 5000 });
// Et pour le dirt :
createTerrainPlane("dirt", "3D_Model/dirt.png", { x: 0, y: -20, z: 0 }, { width: 5000, depth: 5000 });

// Fonction qui teste si la voiture (ici, on prend la position de boxMesh) se trouve sur la partie opaque d'un terrain donné
function isCarOnTerrain(terrainName) {
  const terrain = terrainPlanes[terrainName];
  if (!terrain || !terrain.imageData) return false;
  
  const bbox = terrain.boundingBox;
  const carPos = boxMesh.position;
  
  // Vérifiez que la position du véhicule (x, z) se trouve dans le rectangle du plan
  if (carPos.x < bbox.minX || carPos.x > bbox.maxX ||
      carPos.z < bbox.minZ || carPos.z > bbox.maxZ) {
    return false;
  }
  
  // Convertir la position du véhicule en coordonnées UV (de 0 à 1)
  const u = (carPos.x - bbox.minX) / (bbox.maxX - bbox.minX);
  // Attention : selon votre texture, l'axe Z peut être inversé par rapport à l'axe V.
  // Ici, nous supposons que v = 1 correspond au minZ et v = 0 au maxZ.
  const v = 1 - (carPos.z - bbox.minZ) / (bbox.maxZ - bbox.minZ);
  
  // Convertir les coordonnées UV en coordonnées pixel dans l'image
  const px = Math.floor(u * terrain.imgWidth);
  const py = Math.floor(v * terrain.imgHeight);
  const index = (py * terrain.imgWidth + px) * 4;
  const alpha = terrain.imageData.data[index + 3]; // Canal alpha
  
  // Seuil pour considérer la zone comme opaque (par exemple 128 sur 255)
  return alpha > 128;
}

// Fonction qui met à jour la vitesse de la voiture en fonction du terrain sur lequel elle se trouve
function updateCarSpeed() {
  let speedMultiplier = 1; // Vitesse normale par défaut
  if (isCarOnTerrain("road")) {
    speedMultiplier = 1;
    console.log("Véhicule sur road");
  } else if (isCarOnTerrain("dirt")) {
    speedMultiplier = 0.5;
    console.log("Véhicule sur dirt");
  }
  return speedMultiplier;
}



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
    movement.add(camDirection.clone().multiplyScalar(speed*updateCarSpeed()));
  }
  if (keys.s) {
    movement.add(camDirection.clone().multiplyScalar(-speed*updateCarSpeed()));
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
    color: 0xff00cf,
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

// === Création de cubes par commande ===
// Variables globales pour gérer l'étape de création
let cubeCreationStep = 0;
let firstCoords = { x: null, z: null };

/**
 * Fonction cubeLevelCreator qui crée un pavé via createCube().
 *
 * Lors de la première saisie, le joueur doit entrer "c <x1> <z1>".
 * Lors de la deuxième saisie, il doit entrer "c <x2> <z2>".
 *
 * Le pavé est créé avec : height = 60 et y = -20.
 * Les valeurs width et depth sont calculées par la différence absolue entre x₁ et x₂ et entre z₁ et z₂.
 * Les coordonnées du cube sont le milieu de ces deux valeurs.
 *
 * @param {string} command - La commande saisie (ex. "c 100 200" puis "c 300 400")
 */
function cubeLevelCreator(command) {
  // Découpage de la commande en parties
  let parts = command.trim().split(/\s+/);
  if (parts[0].toLowerCase() !== "c") return; // On ne traite que les commandes commençant par "c"
  
  if (cubeCreationStep === 0) {
    // Première saisie : on attend deux nombres pour x₁ et z₁
    if (parts.length < 3) {
      console.log("Erreur: veuillez fournir deux coordonnées, par ex: c 100 200");
      return;
    }
    let x1 = parseFloat(parts[1]);
    let z1 = parseFloat(parts[2]);
    if (isNaN(x1) || isNaN(z1)) {
      console.log("Erreur: les valeurs x et z doivent être des nombres.");
      return;
    }
    firstCoords.x = x1;
    firstCoords.z = z1;
    cubeCreationStep = 1;
  } else if (cubeCreationStep === 1) {
    // Deuxième saisie : on attend deux nombres pour x₂ et z₂
    if (parts.length < 3) {
      console.log("Erreur: veuillez fournir deux coordonnées, par ex: c 300 400");
      return;
    }
    let x2 = parseFloat(parts[1]);
    let z2 = parseFloat(parts[2]);
    if (isNaN(x2) || isNaN(z2)) {
      console.log("Erreur: les valeurs x et z doivent être des nombres.");
      return;
    }
    // Calcul des dimensions
    let width = Math.abs(x2 - firstCoords.x);
    let depth = Math.abs(z2 - firstCoords.z);
    // Calcul du centre pour positionner le cube
    let midX = (firstCoords.x + x2) / 2;
    let midZ = (firstCoords.z + z2) / 2;
    // Création du cube avec height = 60 et y = -20
    createCube(width, 60, depth, midX, -20, midZ, true, true);
    console.log("createCube(" + width + ", 60," + depth +
                "," + midX + ",-20," + midZ +" , true, true);");
    // Réinitialisation de l'état pour une nouvelle création
    cubeCreationStep = 0;
    //createCube() -> width: 30, height: 60, depth: 250, x: -1565, y: -20, z: 590
    firstCoords = { x: null, z: null };
  }
}

// === Création de cubes du terrain ===

createCube(85, 60,309,-1207.5,-20,1023.5 , true);
createCube(40, 60,40,-2138,-20,-580 , true);
createCube(40, 60,40,-1708,-20,-580 , true);
createCube(40, 60,2505,-1500,-20,-342 , true);
createCube(80, 60,235,-1550,-20,-1324 , true);
createCube(80, 60,235,-1550,-20,-938 , true);
createCube(80, 60,235,-1550,-20,-552 , true);
createCube(80, 60,235,-1550,-20,-171 , true);
createCube(80, 60,235,-1550,-20, 215 , true);
createCube(80, 60,235,-1550,-20, 600 , true);
createCube(715, 60,40,-1135,-20,895 , true);
createCube(1650, 60,40,5,-20,700 , true);
createCube(620, 60,350,1105,-20,775 , true);
createCube(513, 60,685,-1.5,-20,-1915 , true);
createCube(2050, 60,40,-195,-20,620 , true);
createCube(40, 60,190,-802.5,-20,795 , true);
createCube(80, 60,150,60,-20,1235 , true);
createCube(80, 60,375,60,-20,1572 , true);
createCube(465, 60,1624,-1282.5,-20,-782 , true);
createCube(60, 60,660,-1195,-20,310 , true);
createCube(880, 60,238,-640,-20,-668 , true);
createCube(1065, 60,125,267.5,-20,-725 , true);
createCube(315, 60,118,800,-20,-802.5 , true);
createCube(510, 60,705,1237,-20,-1167 , true);
createCube(245, 60,202,875,-20,-915 , true);
createCube(945, 60,275,1797.5,-20,-205 , true);
createCube(810, 60,168,923,-20,-152 , true);
createCube(855, 60,125,253,-20,-16 , true);


// === changement de la caméra ===
// Variables globales pour la position de la souris (initialisée au centre)
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

// Écouteur pour récupérer la position absolue de la souris
document.addEventListener('mousemove', (event) => {
  mouseX = event.clientX;
  mouseY = event.clientY;
});

// Gestion des touches pour le déplacement de la caméra
const camKeys = { z: false, s: false, q: false, d: false, space: false, shiftSpace: false };

window.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  if (key === 'z') camKeys.z = true;
  if (key === 's') camKeys.s = true;
  if (key === 'q') camKeys.q = true;
  if (key === 'd') camKeys.d = true;
  if (e.key === ' ') { // Espace
    if (e.shiftKey) {
      camKeys.shiftSpace = true;
    } else {
      camKeys.space = true;
    }
  }
});

window.addEventListener('keyup', (e) => {
  const key = e.key.toLowerCase();
  if (key === 'z') camKeys.z = false;
  if (key === 's') camKeys.s = false;
  if (key === 'q') camKeys.q = false;
  if (key === 'd') camKeys.d = false;
  if (e.key === ' ') {
    camKeys.space = false;
    camKeys.shiftSpace = false;
  }
});

/**
 * Fonction moveCam qui :
 * - Calcule la rotation de la caméra en fonction de la position de la souris par rapport au centre de l'écran.
 * - Déplace la caméra directement sur les axes X, Y et Z en fonction des touches pressées.
 *
 * @param {number} deltaTime - Le temps écoulé depuis la dernière frame (en secondes)
 */
function moveCam(deltaTime) {
  const overlay = document.getElementById('vehicleCoordinates');
    if (overlay) {
      // Ici on prend les coordonnées du véhicule, par exemple boxBody.position
      overlay.innerHTML = `x: ${camera.position.x.toFixed(2)}<br>
                           y: ${camera.position.y.toFixed(2)}<br>
                           z: ${camera.position.z.toFixed(2)}`;
    }
  // Paramètres de sensibilité et de vitesse
  const sensitivity = 0.005;
  const moveSpeed = 500;
  
  // Calcul du centre de l'écran
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  
  // Calcul de l'angle de rotation souhaité (yaw et pitch)
  const desiredYaw = (mouseX - centerX) * sensitivity;
  const desiredPitch = (mouseY - centerY) * sensitivity;
  
  // Limiter la rotation verticale pour éviter un retournement
  const clampedPitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, desiredPitch));
  
  // Appliquer la rotation à la caméra
  camera.rotation.set(-clampedPitch, -desiredYaw, 0);
  
  // Déplacement direct sur les axes (indépendamment de l'orientation)
  if (camKeys.z) {
    camera.position.z -= moveSpeed * deltaTime;
  }
  if (camKeys.s) {
    camera.position.z += moveSpeed * deltaTime;
  }
  if (camKeys.q) {
    camera.position.x -= moveSpeed * deltaTime;
  }
  if (camKeys.d) {
    camera.position.x += moveSpeed * deltaTime;
  }
  if (camKeys.space) {
    camera.position.y += moveSpeed * deltaTime;
  }
  if (camKeys.shiftSpace) {
    camera.position.y -= moveSpeed * deltaTime;
  }
}



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


// === Fonction de l'interpréteur de commande ===
function commandeInterpretor(){
  let commande = chatValue;
  chatValue = "";
  if(commande === "run"){
    statusWolrd = "run";
    console.log("Commande:", commande);
  }
  if(commande === "stop"){
    statusWolrd = "stop";
    console.log("Commande:", commande);
  }
  if(commande === "rundev"){
    statusWolrd = "rundev";
    console.log("Commande:", commande);
  }
  // Si la commande commence par "c", on passe par cubeLevelCreator
  if(commande.trim().toLowerCase().startsWith("c")){
    cubeLevelCreator(commande);
  }
}


// === Fonction du Jeu en Run ===
function gameRun(){
  // Mise à jour du monde physique
  world.step(timeStep);
  updateBoxControl();
  // Synchronisation du mesh de la boîte avec son corps physique
  boxMesh.position.copy(boxBody.position);
  boxMesh.quaternion.copy(boxBody.quaternion);
  
  // Le kart suit la boîte (position et rotation)
  if (kart) {
    // Vecteur d'offset dans l'espace local de la boîte (ici, -5 unités sur l'axe Z local)
    const localOffset = new THREE.Vector3(0, 0, -5);
    localOffset.applyQuaternion(boxMesh.quaternion);
    kart.position.copy(boxMesh.position).add(localOffset);
    kart.quaternion.copy(boxMesh.quaternion);
    pointLight2.position.set(boxMesh.position.x, boxMesh.position.y + 20, boxMesh.position.z);
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
}

// === Fonction du Jeu en Run ===
function gameRunDev(){
  // Mise à jour du monde physique
  world.step(timeStep);
  const deltaTime = clock.getDelta(); // Temps écoulé depuis la dernière frame en secondes
  moveCam(deltaTime);
  // Synchronisation du sol
  groundMesh.position.copy(groundBody.position);
  groundMesh.quaternion.copy(groundBody.quaternion);
  // Mise à jour des cubes
  cubesList.forEach(cube => {
    cube.mesh.position.copy(cube.body.position);
    cube.mesh.quaternion.copy(cube.body.quaternion);
  });
}

// === Boucle d'animation ===
const timeStep = 1 / 60;
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  commandeInterpretor();
  
  if (statusWolrd === "run") {
    gameRun();
  }
  else if (statusWolrd === "stop") {
    
  }
  else if (statusWolrd === "rundev") {
    gameRunDev();
  }
  
  
  renderer.render(scene, camera);
}
animate();

// === Ajustement lors du redimensionnement de la fenêtre ===
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
