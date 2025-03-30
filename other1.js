import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as CANNON from 'cannon-es';

// === CHAT ===
// Variable pour stocker la valeur du chat
let chatValue = "";
var statusWolrd = "select";
var courseState = "start"
var level_cube = 1;
var nbTour = 1;
var start_place = [
  {x:-2003, z:-505},{x:-1975, z:-465},{x:-1947, z:-425},{x:-1919, z:-385},{x:-1891, z:-345},
  {x:-1863, z:-305},{x:-1989, z:-270},{x:-1961, z:-230},{x:-1933, z:-190},{x:-1905, z:-150},
  {x:-1877, z:-105},{x:-1850, z:-65}
]

// Récupération des éléments
const chatIcon = document.getElementById('chat-icon');
const chatWindow = document.getElementById('chat-window');
const chatInput = document.getElementById('chat-input');
//document.body.removeChild('vehicleCoordinates');

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

// === Camera 1 ===
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000000
);
camera.position.set(0, 150, 300);

// === camera 2 ===
const camera_2 = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000000
);
camera_2.position.set(0, 150, 300);

// === camera 3 ===
const camera_3 = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000000
);
camera_3.position.set(0, 150, 300);

// === camera map ===
const camera_map = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000000
);
// Positionnement de la caméra pour une vue en diagonale depuis le haut
camera_map.position.set(200, 200, 200);
// La caméra regarde vers le centre de la scène (ou un point de votre choix)
camera_map.lookAt(new THREE.Vector3(0, 0, 0));

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);




// === SELECT === 
// --- Création de la scène ---
const scene_select = new THREE.Scene();

// --- Création d'un arrière-plan en dégradé diagonal ---
// On crée un canvas qui va servir à générer une texture
const canvasBG = document.createElement("canvas");
canvasBG.width = 512;
canvasBG.height = 512;
const context = canvasBG.getContext("2d");

// Création du dégradé diagonal
const gradient = context.createLinearGradient(0, 0, canvasBG.width, canvasBG.height);
gradient.addColorStop(0, "#0033cc"); // Bleu profond
gradient.addColorStop(1, "#66ccff"); // Bleu clair
context.fillStyle = gradient;
context.fillRect(0, 0, canvasBG.width, canvasBG.height);

// Création d'une texture à partir du canvas et affectation comme arrière-plan de la scène
const bgTexture = new THREE.CanvasTexture(canvasBG);
scene_select.background = bgTexture;

// --- Création d'une caméra pour scene_select ---
const camera_select = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  1,
  10000
);
camera_select.position.set(0, 0, 359); // Ajustez la position selon vos besoins
camera_select.lookAt(new THREE.Vector3(0, 0, 0));

// --- Création des particules ---
// Nombre de particules
const particlesCount = 10000;
const positions = new Float32Array(particlesCount * 3);


// Définition d'une zone d'apparition pour les particules
const areaSize = 20000;
for (let i = 0; i < particlesCount; i++) {
  // Position aléatoire dans l'espace (x, y, z)
  positions[i * 3] = Math.random() * areaSize - areaSize / 2;      // x
  positions[i * 3 + 1] = Math.random() * areaSize - areaSize / 2;  // y
  positions[i * 3 + 2] = Math.random() * areaSize - areaSize / 2;  // z
}

const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const particlesMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 2,
  sizeAttenuation: true,
});

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene_select.add(particles);


// Lights
const pointLight = new THREE.PointLight(0xffffff, 0.8);
pointLight.position.set(5, 500, 5);
//scene.add(pointLight);


const pointLight2 = new THREE.PointLight(0xffffff, 1);
pointLight2.position.set(5, 0, 5);
//scene.add(pointLight2);

const pointLight3 = new THREE.PointLight(0xffffff, 1);
pointLight3.position.set(5, 0, 5);
//scene.add(pointLight3);

scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(0, 300, 0);
dirLight.castShadow = true;
// Ajustez le shadow camera pour couvrir la scène si besoin
scene.add(dirLight);

const dirLight_2 = new THREE.DirectionalLight(0xffffff, 1);
dirLight_2.position.set(window.innerWidth * 1, window.innerHeight * 1, 100);
dirLight_2.castShadow = true;
// Ajustez le shadow camera pour couvrir la scène si besoin
scene_select.add(dirLight_2);

// Background
scene.background = new THREE.TextureLoader().load('Image/smoky-watercolor-cloud-background.jpg');

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
  position: new CANNON.Vec3(start_place[11].x, -20, start_place[11].z)
});
boxBody.quaternion.setFromEuler(0,-Math.PI, 0);
boxBody.fixedRotation = true;
boxBody.updateMassProperties();
world.addBody(boxBody);

// === Chargement du modèle de la voiture (kart) ===
let kart;//,mixer;
loader.load(
  '3D_Model/car_5.glb',
  (gltf) => {
    kart = gltf.scene;
    kart.scale.set(100, 100, 100);
    // Position initiale (sera remplacée dans l'animation)
    kart.position.set(-2000, -20, -500);
    // Orientation initiale
    kart.rotation.y = Math.PI;
    kart.traverse((child) => {
      if (child.isMesh){
        child.frustumCulled = false;

        const mat = child.material;
        if (mat && mat.metalness !== undefined) {
          mat.roughness = 0.8;   // plus rugueux = moins de reflets brillants
          mat.metalness = 0.0;   // zéro métal = moins d'éblouissement
          mat.envMapIntensity = 0.5;     // réflexions HDRI modérées
          mat.toneMapped = true;         // affecté par le tone mapping
          mat.emissive.set(0x000000);    // pas d’auto-éclairage
        }
      }
    });
    scene.add(kart);

    // // Si le modèle contient des animations, on les active via AnimationMixer
    // if (gltf.animations && gltf.animations.length > 0) {
    //   mixer = new THREE.AnimationMixer(kart);
    //   const action = mixer.clipAction(gltf.animations[0]); // on utilise la première animation
    //   action.play();
    // }

  },
  undefined,
  console.error
);


// === 2eme VOITURE ===
const boxGeo_2 = new THREE.BoxGeometry(17, 5, 25);
const boxMat_2 = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  wireframe: true
});
const boxMesh_2 = new THREE.Mesh(boxGeo_2, boxMat_2);
boxMesh_2.visible = false;
scene.add(boxMesh_2);

// Corps physique Cannon-es
const boxBody_2 = new CANNON.Body({
  mass: 200,
  shape: new CANNON.Box(new CANNON.Vec3(8, 3, 12.5 )),
  position: new CANNON.Vec3(start_place[10].x, -20, start_place[10].z)
});
boxBody_2.quaternion.setFromEuler(0,-Math.PI, 0);
boxBody_2.fixedRotation = true;
boxBody_2.updateMassProperties();
world.addBody(boxBody_2);

// === Chargement du modèle de la voiture (kart) ===
let kart_2;
loader.load(
  '3D_Model/mario_arma.glb',
  (gltf) => {
    kart_2 = gltf.scene;
    kart_2.scale.set(1, 1, 1);
    // Position initiale (sera remplacée dans l'animation)
    kart_2.position.set(-1950, -500, 65);
    // Orientation initiale
    kart_2.rotation.y = Math.PI;
    kart_2.traverse((child) => {
      if (child.isMesh){
        child.frustumCulled = false;
        const mat = child.material;
        if (mat && mat.metalness !== undefined) {
          mat.roughness = 0.8;   // plus rugueux = moins de reflets brillants
          mat.metalness = 0.0;   // zéro métal = moins d'éblouissement
          mat.envMapIntensity = 0.5;     // réflexions HDRI modérées
          mat.toneMapped = true;         // affecté par le tone mapping
          mat.emissive.set(0x000000);    // pas d’auto-éclairage
        }
      } 
    });
    scene.add(kart_2);
  },
  undefined,
  console.error
);

// === 3eme VOITURE ===
const boxGeo_3 = new THREE.BoxGeometry(17, 5, 25);
const boxMat_3 = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  wireframe: true
});
const boxMesh_3 = new THREE.Mesh(boxGeo_3, boxMat_3);
boxMesh_3.visible = false;
scene.add(boxMesh_3);

// Corps physique Cannon-es
const boxBody_3 = new CANNON.Body({
  mass: 200,
  shape: new CANNON.Box(new CANNON.Vec3(8, 3, 12.5 )),
  position: new CANNON.Vec3(start_place[9].x, -20, start_place[9].z)
});
boxBody_3.quaternion.setFromEuler(0,-Math.PI, 0);
boxBody_3.fixedRotation = true;
boxBody_3.updateMassProperties();
world.addBody(boxBody_3);

// === Chargement du modèle de la voiture (kart) ===
let kart_3;
loader.load(
  '3D_Model/mario_arma.glb',
  (gltf) => {
    kart_3 = gltf.scene;
    kart_3.scale.set(1, 1, 1);
    // Position initiale (sera remplacée dans l'animation)
    kart_3.position.set(-1650, -500, 300);
    // Orientation initiale
    kart_3.rotation.y = Math.PI;
    kart_3.traverse((child) => {
      if (child.isMesh){
        child.frustumCulled = false;
        const mat = child.material;
        if (mat && mat.metalness !== undefined) {
          mat.roughness = 0.8;   // plus rugueux = moins de reflets brillants
          mat.metalness = 0.0;   // zéro métal = moins d'éblouissement
          mat.envMapIntensity = 0.5;     // réflexions HDRI modérées
          mat.toneMapped = true;         // affecté par le tone mapping
          mat.emissive.set(0x000000);    // pas d’auto-éclairage
        }
      } 
    });
    scene.add(kart_3);
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
  },
  undefined,
  console.error
);


// --- Variables globales pour stocker les données des terrains via image ---
let terrainPlanes = {}; // Exemple : { "road": { mesh, boundingBox, imageData, imgWidth, imgHeight }, "dirt": { ... } }

// Fonction de débogage qui affiche des points sur les zones actives du terrain
function debugDisplayTerrain(terrainName, debugColor, samplingStep = 5) {
  const terrain = terrainPlanes[terrainName];
  if (!terrain || !terrain.imageData) return;
  const { boundingBox, imageData, imgWidth, imgHeight } = terrain;
  const positions = [];
  
  // Parcourir l'image avec un pas pour limiter le nombre de points
  for (let i = 0; i < imgWidth; i += samplingStep) {
    for (let j = 0; j < imgHeight; j += samplingStep) {
      const index = (j * imgWidth + i) * 4;
      const alpha = imageData.data[index + 3];
      if (alpha > 128) {
        // Calculer les coordonnées UV
        const u = i / imgWidth;
        const v = j / imgHeight;
        // Conversion en coordonnées mondiales (attention à l'inversion de V)
        const x = boundingBox.minX + u * (boundingBox.maxX - boundingBox.minX);
        const z = boundingBox.minZ + (1 - v) * (boundingBox.maxZ - boundingBox.minZ);
        const y = -25; // même hauteur que le plan
        positions.push(x, y + 0.1, z); // 0.1 pour légèrement surélever les points
      }
    }
  }
  
  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ color: debugColor, size: 1 });
  const points = new THREE.Points(geom, mat);
  scene.add(points);
}

// Modification de la fonction createTerrainPlane pour appeler debugDisplayTerrain une fois la texture chargée
function createTerrainPlane(name, imageUrl, position, scale, draw) {
  // Créer la géométrie et charger la texture
  const geometry = new THREE.PlaneGeometry(scale.width, scale.depth);
  const texture = new THREE.TextureLoader().load(imageUrl, (tex) => {
    const image = tex.image;
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    // Stocker les données dans l'objet global
    terrainPlanes[name].imageData = imageData;
    terrainPlanes[name].imgWidth = image.width;
    terrainPlanes[name].imgHeight = image.height;
    
    // Appeler la fonction de débogage pour afficher les zones actives
    // Vous pouvez définir la couleur différemment pour "road" et "dirt"
    if (draw) {
      if(name === "road") {
        debugDisplayTerrain(name, 0xff0000); // par exemple en rouge pour la route
      } else if(name === "dirt") {
        debugDisplayTerrain(name, 0x00ff00); // en vert pour le terrain dirt
      }
      else{ 
        debugDisplayTerrain(name, 0x0000ff); // en vert pour le terrain boost
      }
    }
  });
  texture.format = THREE.RGBAFormat;
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: false, wireframe: false });
  const plane = new THREE.Mesh(geometry, material);
  plane.rotation.x = -Math.PI / 2;
  plane.position.set(position.x, position.y, position.z);
  plane.name = name;
  scene.add(plane);
  
  // Calculer le rectangle que couvre le plan
  const bbox = {
    minX: position.x - scale.width / 2,
    maxX: position.x + scale.width / 2,
    minZ: position.z - scale.depth / 2,
    maxZ: position.z + scale.depth / 2,
    y: position.y
  };
  
  // Enregistrer le plan dans l'objet global
  terrainPlanes[name] = {
    mesh: plane,
    boundingBox: bbox,
    imageData: null,
    imgWidth: 0,
    imgHeight: 0
  };
}

const mult = 0;
// Exemple d'utilisation pour vos terrains
// Ajustez la position et la taille (scale) pour qu'elles correspondent à la zone de votre terrain.
// Par exemple, pour le road :
createTerrainPlane("road", "Image/road.png", { x: -45, y: -45, z: -240 }, { width: 4600, depth: 4020 },false);
// Et pour le dirt :
createTerrainPlane("dirt", "Image/dirt.png", { x: -45, y: -45, z: -240 }, { width: 4600, depth: 4020 }, false);
// Et pour le boost :
createTerrainPlane("boostTrap", "Image/boostTrap.png", { x: -45, y: -45, z: -240 }, { width: 4600, depth: 4020 }, false);

createTerrainPlane("step_1", "Image/step_1.png", { x: -45, y: -45, z: -240 }, { width: 4600, depth: 4020 }, false);
createTerrainPlane("step_2", "Image/step_2.png", { x: -45, y: -45, z: -240 }, { width: 4600, depth: 4020 }, false);
createTerrainPlane("step_3", "Image/step_3.png", { x: -45, y: -45, z: -240 }, { width: 4600, depth: 4020 }, false);
createTerrainPlane("step_4", "Image/step_4.png", { x: -45, y: -45, z: -240 }, { width: 4600, depth: 4020 }, false);

// Fonction qui teste si la voiture (ici, on prend la position de boxMesh) se trouve sur la partie opaque d'un terrain donné
function isCarOnTerrain(terrainName, carMesh) {
  const terrain = terrainPlanes[terrainName];
  if (!terrain || !terrain.imageData) return false;
  
  const bbox = terrain.boundingBox;
  const carPos = carMesh.position;
  
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
  return alpha > 200;
}

// Fonction qui met à jour la vitesse de la voiture en fonction du terrain sur lequel elle se trouve
function updateCarSpeed(boxCar) {
  let speedMultiplier = 1; // Vitesse normale par défaut
  if (isCarOnTerrain("road",boxCar)) {
    speedMultiplier = 1;
  } else if (isCarOnTerrain("dirt",boxCar)) {
    speedMultiplier = 0.5;
  }
  
  return speedMultiplier;
}

var tour = [false,false,false,false];

function tourUpdate(boxCarMesh){
  if (isCarOnTerrain("step_4",boxCarMesh)) {
    if(!tour[0]) tour[0] = true;
    if(tour[0] && tour[1] && tour[2] && tour[3]){
      tour = [false,false,false,false];
      console.log("Tour Complet");
    } 
  }
  if (isCarOnTerrain("step_1",boxCarMesh)) {
    if(tour[0] && !tour[1]) tour[1] = true;
  }
  if (isCarOnTerrain("step_2",boxCarMesh)) {
    if(tour[1] && !tour[2]) tour[2] = true;
  }
  if (isCarOnTerrain("step_3",boxCarMesh)) {
    if(tour[2] && !tour[3]) tour[3] = true;
  }
}


// === Gestion des contrôles clavier (Z, Q, S, D) ===
const keys = { z: false, s: false, q: false, d: false , o:false, l:false, k:false, m:false, g:false, b:false, v:false, n:false};
//window.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
//window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

const doubleTapThreshold = 200; // en millisecondes
const boostDuration = 1; // durée du boost en secondes
// Pour le boost après un drift continu
let lastLeftKeyReleaseTime = 0;
let lastRightKeyReleaseTime = 0;
let isDriftingLeft = false;
let isDriftingRight = false;
let driftActiveTime = 0;
let isBoostActive = false;
let boostTimer = 0;
var boostMultiplier = 0; // facteur d'accélération du boost
var gotBoost = false;
var hadBoost = false;

let lastLeftKeyReleaseTime_2 = 0;
let lastRightKeyReleaseTime_2 = 0;
let isDriftingLeft_2 = false;
let isDriftingRight_2 = false;
let driftActiveTime_2 = 0;
let isBoostActive_2 = false;
let boostTimer_2 = 0;
var boostMultiplier_2 = 0;
var gotBoost_2 = false;
var hadBoost_2 = false;

let lastLeftKeyReleaseTime_3 = 0;
let lastRightKeyReleaseTime_3 = 0;
let isDriftingLeft_3 = false;
let isDriftingRight_3 = false;
let driftActiveTime_3 = 0;
let isBoostActive_3 = false;
let boostTimer_3 = 0;
var boostMultiplier_3 = 0;
var gotBoost_3 = false;
var hadBoost_3 = false;



window.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  // player 1
  if (key === 'q') {
    const now = Date.now();
    // Si on a relâché et qu'on réappuie dans les 50ms, on active le drift
    if (lastLeftKeyReleaseTime && (now - lastLeftKeyReleaseTime < doubleTapThreshold)) {
      isDriftingLeft = true;
    }
    keys['q'] = true;
  }
  if (key === 'd') {
    const now = Date.now();
    if (lastRightKeyReleaseTime && (now - lastRightKeyReleaseTime < doubleTapThreshold)) {
      isDriftingRight = true;
    }
    keys['d'] = true;
  }// player 2
  if (key === 'k') {
    const now = Date.now();
    // Si on a relâché et qu'on réappuie dans les 50ms, on active le drift
    if (lastLeftKeyReleaseTime_2 && (now - lastLeftKeyReleaseTime_2 < doubleTapThreshold)) {
      isDriftingLeft_2 = true;
    }
    keys['k'] = true;
  }
  if (key === 'm') {
    const now = Date.now();
    if (lastRightKeyReleaseTime_2 && (now - lastRightKeyReleaseTime_2 < doubleTapThreshold)) {
      isDriftingRight_2 = true;
    }
    keys['m'] = true;
  }//player 3
  if (key === 'v') {
    const now = Date.now();
    // Si on a relâché et qu'on réappuie dans les 50ms, on active le drift
    if (lastLeftKeyReleaseTime_3 && (now - lastLeftKeyReleaseTime_3 < doubleTapThreshold)) {
      isDriftingLeft_3 = true;
    }
    keys['v'] = true;
  }
  if (key === 'n') {
    const now = Date.now();
    if (lastRightKeyReleaseTime_3 && (now - lastRightKeyReleaseTime_3 < doubleTapThreshold)) {
      isDriftingRight_3 = true;
    }
    keys['n'] = true;
  }
  else{
    keys[key] = true;
  }
});

window.addEventListener('keyup', (e) => {
  const key = e.key.toLowerCase();
  // player 1
  if (key === 'q') {
    lastLeftKeyReleaseTime = Date.now();
    isDriftingLeft = false;
    keys['q'] = false;
  }
  if (key === 'd') {
    lastRightKeyReleaseTime = Date.now();
    isDriftingRight = false;
    keys['d'] = false;
  }// player 2
  if (key === 'k') {
    lastLeftKeyReleaseTime_2 = Date.now();
    isDriftingLeft_2 = false;
    keys['k'] = false;
  }
  if (key === 'm') {
    lastRightKeyReleaseTime_2 = Date.now();
    isDriftingRight_2 = false;
    keys['m'] = false;
  }
  // player 3
  if (key === 'v') {
    lastLeftKeyReleaseTime_3 = Date.now();
    isDriftingLeft_3 = false;
    keys['v'] = false;
  }
  if (key === 'n') {
    lastRightKeyReleaseTime_3 = Date.now();
    isDriftingRight_3 = false;
    keys['n'] = false;
  }
  else{
    keys[key] = false;
  }
});

// === Mise à jour des contrôles de la boîte ===
// Avec Z et S, la boîte est déplacée selon la direction de la caméra.
// Avec Q et D, une rotation est appliquée.
function updateBoxControl(boxCarMesh, boxCarBody, cam, keyMove, keyBack, keyLeft, keyRight,deltaTime, player) {
  const baseSpeed = 200 * level_cube;
  const rotationSpeed = 0.7 * level_cube;
  const driftRotationSpeed = rotationSpeed * 1.5; // Vous pouvez ajuster ce multiplicateur

  // Calcul de la direction de la caméra
  let camDirection = new THREE.Vector3();
  cam.getWorldDirection(camDirection);
  camDirection.y = 0;
  camDirection.normalize();
  if (isCarOnTerrain("boostTrap",boxCarMesh)) {
    if(player == 1){
      boostTimer = boostDuration;
      hadBoost = true;
    }
    if(player == 2){
      boostTimer_2 = boostDuration;
      hadBoost_2 = true;
    }
    if(player == 3){
      boostTimer_3 = boostDuration;
      hadBoost_3 = true;
    }
  }
  
  let movement = new THREE.Vector3(0, 0, 0);
  
  if (keyMove) {
    let currentSpeed = baseSpeed * updateCarSpeed(boxCarMesh);
    currentSpeed *= (1 + (player == 1 ? boostMultiplier : player == 2 ? boostMultiplier_2 : boostMultiplier_3));
    // Multiplie par deltaTime pour obtenir un déplacement en fonction du temps
    movement.add(camDirection.clone().multiplyScalar(currentSpeed * deltaTime*40));
  }
  
  if (keyBack) {
    let currentSpeed = baseSpeed * updateCarSpeed(boxCarMesh);
    currentSpeed *= (1 + (player == 1 ? boostMultiplier : player == 2 ? boostMultiplier_2 : boostMultiplier_3));
    movement.add(camDirection.clone().multiplyScalar(-currentSpeed * deltaTime*40));
  }
  
  // Mise à jour de la vélocité du corps (en supposant que le moteur physique attend des m/s)
  boxCarBody.velocity.x = movement.x;
  boxCarBody.velocity.z = movement.z;
  
  if (keyMove || keyBack || keyLeft || keyRight) {
    boxCarBody.wakeUp();
  }
  
  // Gestion de la rotation/dérapage
  if (keyLeft) {
    if ((player == 1 && isDriftingLeft) || (player == 2 && isDriftingLeft_2) || (player == 3 && isDriftingLeft_3)) {
      boxCarBody.angularVelocity.y = driftRotationSpeed;
      spawnDriftParticle(boxCarMesh, 'left',player);
    } else {
      boxCarBody.angularVelocity.y = rotationSpeed;
    }
  } else if (keyRight) {
    if ((player == 1 && isDriftingRight) || (player == 2 && isDriftingRight_2) || (player == 3 && isDriftingRight_3)) {
      boxCarBody.angularVelocity.y = -driftRotationSpeed;
      spawnDriftParticle(boxCarMesh, 'right',player);
    } else {
      boxCarBody.angularVelocity.y = -rotationSpeed;
    }
  } else {
    boxCarBody.angularVelocity.y *= 0.9;
  }
}


function boostUpdate(dlt) {
  const deltaTime = dlt;

  // PLAYER 1
  // Si l'utilisateur effectue un drift (appui sur Q ou D)
  if (isDriftingRight || isDriftingLeft) {
    driftActiveTime += deltaTime;
    if (!isBoostActive && driftActiveTime >= 1) {
      isBoostActive = true;
      boostTimer = boostDuration;
    }
  } else {
    // Réinitialisation si aucune touche de drift n'est pressée
    driftActiveTime = 0;
    if(isBoostActive){
      gotBoost = true;
      isBoostActive = false;
    }else{
      gotBoost = false;
      isBoostActive = false;
    }
  }
  
  // Décrémenter le timer du boost
  if (gotBoost || hadBoost) {
    boostTimer -= deltaTime;
    gotBoost = false;
    hadBoost = true;
    if (boostTimer <= 0) {
      hadBoost = false;
      driftActiveTime = 0;
    }
    boostMultiplier = 1; // boost de 2x
  }
  else {
    boostMultiplier *= 0.9; // pas de boost
  }

  // PLAYER 2

  if (isDriftingRight_2 || isDriftingLeft_2) {
    driftActiveTime_2 += deltaTime;
    if (!isBoostActive_2 && driftActiveTime_2 >= 1) {
      isBoostActive_2 = true;
      boostTimer_2 = boostDuration;
    }
  } else {
    // Réinitialisation si aucune touche de drift n'est pressée
    driftActiveTime_2 = 0;
    if(isBoostActive_2){
      gotBoost_2 = true;
      isBoostActive_2 = false;
    }else{
      gotBoost_2 = false;
      isBoostActive_2 = false;
    }
  }
  
  // Décrémenter le timer du boost
  if (gotBoost_2 || hadBoost_2) {
    boostTimer_2 -= deltaTime;
    gotBoost_2 = false;
    hadBoost_2 = true;
    if (boostTimer_2 <= 0) {
      hadBoost_2 = false;
      driftActiveTime_2 = 0;
    }
    boostMultiplier_2 = 1; // boost de 2x
  }
  else {
    boostMultiplier_2 *= 0.9; // pas de boost
  }

  // PLAYER 3

  if (isDriftingRight_3 || isDriftingLeft_3) {
    driftActiveTime_3 += deltaTime;
    if (!isBoostActive_3 && driftActiveTime_3 >= 1) {
      isBoostActive_3 = true;
      boostTimer_3 = boostDuration;
    }
  } else {
    // Réinitialisation si aucune touche de drift n'est pressée
    driftActiveTime_3 = 0;
    if(isBoostActive_3){
      gotBoost_3 = true;
      isBoostActive_3 = false;
    }else{
      gotBoost_3 = false;
      isBoostActive_3 = false;
    }
  }
  
  // Décrémenter le timer du boost
  if (gotBoost_3 || hadBoost_3) {
    boostTimer_3 -= deltaTime;
    gotBoost_3 = false;
    hadBoost_3 = true;
    if (boostTimer_3 <= 0) {
      hadBoost_3 = false;
      driftActiveTime_3 = 0;
    }
    boostMultiplier_3 = 1; // boost de 2x
  }
  else {
    boostMultiplier_3 *= 0.9; // pas de boost
  }
}

// === Caméra à la 3e personne ===
// La caméra suit la boîte contrôlée.
function updateCamera(boxCarMesh, camera, rot_speed) {
  const localOffset = new THREE.Vector3(0, 32, -48);
  const worldOffset = localOffset.clone().applyQuaternion(boxCarMesh.quaternion);
  const desiredCameraPos = new THREE.Vector3().copy(boxCarMesh.position).add(worldOffset);
  camera.position.lerp(desiredCameraPos, 0.1 * rot_speed);
  camera.lookAt(boxCarMesh.position);
}


let driftParticles = [];

function spawnDriftParticle(carMesh, direction, player) {
  // Calculer une position d'apparition : légèrement derrière la voiture,
  // avec un décalage réduit pour concentrer la traînée.
  const offset = new THREE.Vector3();
  if (direction === 'left') {
    offset.set(1, 0, -3); // décalage réduit pour un effet serré
  } else {
    offset.set(-1, 0, -3);
  }
  // Appliquer la rotation de la voiture à l'offset
  offset.applyQuaternion(carMesh.quaternion);
  // Ajouter une petite variation aléatoire pour densifier la traînée
  offset.x += (Math.random() - 0.5) * 2;
  offset.y += (Math.random() - 0.5) * 2;
  offset.z += (Math.random() - 0.5) * 2;
  
  const spawnPos = new THREE.Vector3().copy(carMesh.position).add(offset);
  // Déterminer la couleur : orange en boost, bleu sinon
  const particleColor = (player == 1 ? isBoostActive : player == 2 ? isBoostActive_2 : isBoostActive_3) ? 0xff8800 : 0x00aaff;
  
  // Créer une petite sphère bleue avec un effet luminescent
  const geometry = new THREE.SphereGeometry(0.3, 8, 8); // particule plus petite
  const material = new THREE.MeshBasicMaterial({
    color: particleColor, // bleu lumineux
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending, // pour un effet lumineux
    depthWrite: false, // évite d'écrire dans le buffer de profondeur
  });
  const particle = new THREE.Mesh(geometry, material);
  particle.position.copy(spawnPos);
  particle.userData = { lifetime: 0 }; // pour gérer la durée de vie
  scene.add(particle);
  driftParticles.push(particle);
}

function updateDriftParticles(dlt) {
  const deltaTime = dlt;
  // À intégrer dans votre fonction animate()
  for (let i = driftParticles.length - 1; i >= 0; i--) {
    const p = driftParticles[i];
    p.userData.lifetime += deltaTime;
    // Diminuer l'opacité sur 1 seconde
    p.material.opacity = Math.max(0, 1 - p.userData.lifetime);
    if (p.userData.lifetime > 0.2) {
      scene.remove(p);
      driftParticles.splice(i, 1);
    }
  }
}

// ===================================================================================================
//
// CREATIVE MODE
//
//====================================================================================================

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
createCube(513, 60,685,-1.5,-20,-1915 ,true);
createCube(2050, 60,40,-195,-20,620 , true);
createCube(40, 60,190,-802.5,-20,795 ,true);
createCube(80, 60,150,60,-20,1235 , true);
createCube(80, 60,375,60,-20,1572 , true);
createCube(465, 60,1624,-1282.5,-20,-782, true);
createCube(60, 60,660,-1195,-20,310 ,true);
createCube(880, 60,238,-640,-20,-668,true);
createCube(1065, 60,125,267.5,-20,-725,true);
createCube(315, 60,118,800,-20,-802.5,true);
createCube(510, 60,705,1237,-20,-1167,true);
createCube(245, 60,202,875,-20,-915,true);
createCube(945, 60,275,1797.5,-20,-205,true);
createCube(810, 60,168,923,-20,-152,true);
createCube(855, 60,125,253,-20,-16,true);


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

// Création des IA
const aiVehicles = [];
for (let i = 0; i < 11; i++) {
  // On suppose que start_place est un tableau d'objets avec des propriétés x et z
  aiVehicles.push(createAIVehicle('3D_Model/mario_arma.glb', { x: start_place[i].x, y: -22, z: start_place[i].z }, 1));
}


// === Fonction de l'interpréteur de commande ===
function commandeInterpretor(){
  let commande = chatValue;
  chatValue = "";
  if(commande === "runsolo" || commande === "run"){
    statusWolrd = "runsolo";

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
  if(commande === "runsplit"){
    statusWolrd = "runsplit";
    console.log("Commande:", commande);
  }
  if(commande === "runsplit3"){
    statusWolrd = "runsplit3";
    console.log("Commande:", commande);
  }
  if(commande === "runsplit4"){
    statusWolrd = "runsplit4";
    console.log("Commande:", commande);
  }
  if(commande === "select"){
    statusWolrd = "select";
    console.log("Commande:", commande);
  }
  if(commande === "50cc"){
    level_cube = 1;
    console.log("Commande:", commande);
  }
  if(commande === "150cc"){
    level_cube = 2;
    console.log("Commande:", commande);
  }
  if(commande === "100cc"){
    level_cube = 1.5;
    console.log("Commande:", commande);
  }
  if(commande === "200cc"){
    level_cube = 2.5;
    console.log("Commande:", commande);
  }
  
  // Si la commande commence par "c", on passe par cubeLevelCreator
  if(commande.trim().toLowerCase().startsWith("c")){
    cubeLevelCreator(commande);
  }
}

// Création de la voiture IA (par exemple, avec le modèle "mario_arma.glb")
// Position de départ : { x: -2050, y: 0, z: 0 } et scale : 50 (à ajuster selon votre besoin)


// === Fonction du Jeu en Run ===
function gameRun(){
  // Mise à jour du monde physique
  world.step(timeStep);
  if(kart_2) kart_2.visible = false;
  if(kart_3) kart_3.visible = false;
  //const delta = clock.getDelta();
  //if (mixer) mixer.update(delta);
  updateBoxControl(boxMesh,boxBody,camera,keys.z,keys.s,keys.q,keys.d,timeStep,1);
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
    //pointLight2.position.set(boxMesh.position.x, boxMesh.position.y + 20, boxMesh.position.z);
  }
  
  // Synchronisation du sol
  groundMesh.position.copy(groundBody.position);
  groundMesh.quaternion.copy(groundBody.quaternion);

  // Mise à jour des cubes
  cubesList.forEach(cube => {
    cube.mesh.position.copy(cube.body.position);
    cube.mesh.quaternion.copy(cube.body.quaternion);
  });
  tourUpdate(boxMesh);
  // Mise à jour de la caméra
  updateCamera(boxMesh, camera, level_cube);
  //updateVehicleCoordinates()

  // Mise à jour de la voiture IA
  // Mise à jour de toutes les IA
  aiVehicles.forEach(ai => {
    updateAIVehicle(ai, timeStep);
  });
}

// === Fonction du Jeu en Run ===
function gameRun_2(){
  // Mise à jour du monde physique
  if(kart_2) kart_2.visible = true;
  if(kart_3) kart_3.visible = false;
  world.step(timeStep);
  updateBoxControl(boxMesh,boxBody,camera,keys.z,keys.s,keys.q,keys.d,timeStep,1);
  updateBoxControl(boxMesh_2,boxBody_2,camera_2,keys.o,keys.l,keys.k,keys.m,timeStep,2);
  // Synchronisation du mesh de la boîte avec son corps physique
  boxMesh.position.copy(boxBody.position);
  boxMesh.quaternion.copy(boxBody.quaternion);
  boxMesh_2.position.copy(boxBody_2.position);
  boxMesh_2.quaternion.copy(boxBody_2.quaternion);
  
  // Le kart suit la boîte (position et rotation)
  if (kart) {
    // Vecteur d'offset dans l'espace local de la boîte (ici, -5 unités sur l'axe Z local)
    const localOffset = new THREE.Vector3(0, 0, -5);
    localOffset.applyQuaternion(boxMesh.quaternion);
    kart.position.copy(boxMesh.position).add(localOffset);
    kart.quaternion.copy(boxMesh.quaternion);
    //pointLight2.position.set(boxMesh.position.x, boxMesh.position.y + 20, boxMesh.position.z);
  }
  // Le kart suit la boîte (position et rotation)
  if (kart_2) {
    // Vecteur d'offset dans l'espace local de la boîte (ici, -5 unités sur l'axe Z local)
    const localOffset_2 = new THREE.Vector3(0, 0, -5);
    localOffset_2.applyQuaternion(boxMesh_2.quaternion);
    kart_2.position.copy(boxMesh_2.position).add(localOffset_2);
    kart_2.quaternion.copy(boxMesh_2.quaternion);
    //pointLight3.position.set(boxMesh_2.position.x, boxMesh_2.position.y + 20, boxMesh_2.position.z);
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
  updateCamera(boxMesh, camera, level_cube);
  updateCamera(boxMesh_2, camera_2, level_cube);
  //updateVehicleCoordinates()
}

// === Fonction du Jeu en Run ===
function gameRun_3(){
  if(kart_2) kart_2.visible = true;
  if(kart_3) kart_3.visible = true;
  // Mise à jour du monde physique
  world.step(timeStep);
  updateBoxControl(boxMesh,boxBody,camera,keys.z,keys.s,keys.q,keys.d,timeStep,1);
  updateBoxControl(boxMesh_2,boxBody_2,camera_2,keys.o,keys.l,keys.k,keys.m,timeStep,2);
  updateBoxControl(boxMesh_3,boxBody_3,camera_3,keys.g,keys.b,keys.v,keys.n,timeStep,3);
  // Synchronisation du mesh de la boîte avec son corps physique
  boxMesh.position.copy(boxBody.position);
  boxMesh.quaternion.copy(boxBody.quaternion);
  boxMesh_2.position.copy(boxBody_2.position);
  boxMesh_2.quaternion.copy(boxBody_2.quaternion);
  boxMesh_3.position.copy(boxBody_3.position);
  boxMesh_3.quaternion.copy(boxBody_3.quaternion);
  
  // Le kart suit la boîte (position et rotation)
  if (kart) {
    const localOffset = new THREE.Vector3(0, 0, -5);
    localOffset.applyQuaternion(boxMesh.quaternion);
    kart.position.copy(boxMesh.position).add(localOffset);
    kart.quaternion.copy(boxMesh.quaternion);
  }
  if (kart_2) {
    const localOffset_2 = new THREE.Vector3(0, 0, -5);
    localOffset_2.applyQuaternion(boxMesh_2.quaternion);
    kart_2.position.copy(boxMesh_2.position).add(localOffset_2);
    kart_2.quaternion.copy(boxMesh_2.quaternion);
  }

  if (kart_3) {
    const localOffset_3 = new THREE.Vector3(0, 0, -5);
    localOffset_3.applyQuaternion(boxMesh_3.quaternion);
    kart_3.position.copy(boxMesh_3.position).add(localOffset_3);
    kart_3.quaternion.copy(boxMesh_3.quaternion);
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
  updateCamera(boxMesh, camera, level_cube);
  updateCamera(boxMesh_2, camera_2, level_cube);
  updateCamera(boxMesh_3, camera_3, level_cube);
  //updateVehicleCoordinates()
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

// === SELECT FUNCTIONS ===

function particulesSelectMenu(){
  const positionsAttr = particlesGeometry.attributes.position;
    for (let i = 0; i < positionsAttr.count; i++) {
      let x = positionsAttr.getX(i);
      // Incrémentation de la position X pour simuler un mouvement vers la droite
      x += 0.5;
      // Si la particule dépasse la limite droite, on la remet à gauche
      if (x > areaSize / 2) {
        x = -areaSize / 2;
      }
      positionsAttr.setX(i, x) ;
    }
    positionsAttr.needsUpdate = true;
}


function select_menu(delta){
  
  // Mise à jour du temps écoulé
  rotatePerso(perso_1);
  rotatePerso(perso_2);
  // Transition fluide de la caméra
  if (isTransitioning) {
    transitionElapsed += delta;
    let progress = transitionElapsed / transitionDuration;
    if (progress >= 1) {
      progress = 1;
      isTransitioning = false;
    }
    const easedProgress = easeInOutQuad(progress);

    // Interpolation linéaire (x, y) entre transitionStart et transitionTarget
    camera_select.position.x = THREE.MathUtils.lerp(
      transitionStart.x,
      transitionTarget.x,
      easedProgress
    );
    camera_select.position.y = THREE.MathUtils.lerp(
      transitionStart.y,
      transitionTarget.y,
      easedProgress
    );
  }
  scene_select.children.forEach((mesh) => {
    if (mesh.isMesh && mesh.userData && mesh.userData.name === "retour") {
      if (camera_select.position.x == 0 && camera_select.position.y == 0) {
        mesh.visible = false;
      } else {
        mesh.visible = true;
        const planData = mesh.userData;
        // Recalcule la position et la taille de chaque plan
        const { ratioW, ratioH } = getScaleRatios();
        // Repositionnement
        const newX = plansList[planData.index].x * ratioW;
        const newY = plansList[planData.index].y * ratioH;
        mesh.position.set(newX + camera_select.position.x, newY + camera_select.position.y, mesh.position.z);
        //mesh.position.set(-575 + camera_select.position.x, -252 + camera_select.position.y, 0);
      }
    }
  });
}

// ===================================================================================================
//
// THE SCENE_SELECT
//
//====================================================================================================


// === Chargement du modèle de la voiture (kart) ===
let perso_1;
loader.load('3D_Model/mario_arma.glb', (gltf) => {
  perso_1 = gltf.scene;
  perso_1.name = "perso";
  perso_1.spec = 1;
  
  // Échelle de référence
  const baseScale = 5;
  
  // --- 1) On stocke la position de référence dans userData ---
  perso_1.userData.refPos = { x: 1280, y: 0.9 * 551 };
  perso_1.userData.refScale = baseScale;
  
  // --- 2) On calcule les ratios actuels ---
  const { ratioW, ratioH } = getScaleRatios();
  // Souvent, on prend un ratio “minimum” ou “maximum” pour l’échelle 3D.
  const ratioMin = Math.min(ratioW, ratioH);
  
  // --- 3) Positionner le modèle en tenant compte des ratios ---
  const scaledX = perso_1.userData.refPos.x * ratioW;
  const scaledY = perso_1.userData.refPos.y * ratioH;
  perso_1.position.set(scaledX, scaledY, 0);
  
  // --- 4) Ajuster la taille (scale) du modèle si besoin ---
  perso_1.scale.set(baseScale * ratioMin, baseScale * ratioMin, baseScale * ratioMin);
  
  // --- 5) Orientations, matériaux, etc. ---
  perso_1.rotation.x = Math.PI / 10;
  perso_1.traverse((child) => {
    if (child.isMesh) {
      child.frustumCulled = false;
      // Remplacer le matériau PBR par un MeshBasicMaterial
      const oldMat = child.material;
      let map = oldMat.map || null;
      child.material = new THREE.MeshBasicMaterial({
        map: map,
        color: oldMat.color || 0xffffff,
        side: THREE.DoubleSide,
      });
    }
  });

  const label = createSelectionLabel();
  label.name = "selection_label";
  label.position.set(0, 20, 0); // positionner le label au-dessus du perso
  perso_1.add(label);

  scene_select.add(perso_1);
});
// Supposons que maxCameras est défini quelque part (par exemple 2, 3, etc.)
const maxCameras = 2;
const selection_perso = new Array(maxCameras).fill(null);

// On ajoute le nouveau perso pour cette caméra
selection_perso[0] = perso_1;


let perso_2;
loader.load('3D_Model/car_5.glb', (gltf) => {
  perso_2 = gltf.scene;
  perso_2.name = "perso";
  perso_2.spec = 2;
  
  // Échelle de référence
  const baseScale = 100;
  
  // --- 1) On stocke la position de référence dans userData ---
  perso_2.userData.refPos = { x: 1080, y: 0.9 * 551 };
  perso_2.userData.refScale = baseScale;
  
  // --- 2) On calcule les ratios actuels ---
  const { ratioW, ratioH } = getScaleRatios();
  // Souvent, on prend un ratio “minimum” ou “maximum” pour l’échelle 3D.
  const ratioMin = Math.min(ratioW, ratioH);
  
  // --- 3) Positionner le modèle en tenant compte des ratios ---
  const scaledX = perso_2.userData.refPos.x * ratioW;
  const scaledY = perso_2.userData.refPos.y * ratioH;
  perso_2.position.set(scaledX, scaledY, 0);
  
  // --- 4) Ajuster la taille (scale) du modèle si besoin ---
  perso_2.scale.set(baseScale * ratioMin, baseScale * ratioMin, baseScale * ratioMin);
  
  // --- 5) Orientations, matériaux, etc. ---
  perso_2.rotation.x = Math.PI / 10;
  perso_2.traverse((child) => {
    if (child.isMesh) {
      child.frustumCulled = false;
      // Remplacer le matériau PBR par un MeshBasicMaterial
      const oldMat = child.material;
      let map = oldMat.map || null;
      child.material = new THREE.MeshBasicMaterial({
        map: map,
        color: oldMat.color || 0xffffff,
        side: THREE.DoubleSide,
      });
    }
  });

  scene_select.add(perso_2);
});

function rotatePerso(perso){
  if(perso) perso.rotation.y += 0.02;
}

const nb_menu_select = 5;  // Nombre de positions pour la navigation Espace/Shift+Espace

// Liste des plans (images) à afficher
const plansList = [
  {name: "home",image: "Image/mario.png",fitByHeight: true, x: 349,y: 0,z: 0,selection: false},
  {name: "solo",image: "Image/solo_unselect.png", image_select:"Image/solo_select.png",
    fitByHeight: false,size: 0.5, x: -300,y: 150,z: 0,selection: true},
  {name: "multi",image: "Image/multi_unselect.png", image_select:"Image/multi_select.png",
    fitByHeight: false,size: 0.5, x: -300,y: 0,z: 0,selection: true},
  {name: "config",image: "Image/config_unselect.png", image_select:"Image/config_select.png",
    fitByHeight: false,size: 0.5, x: -300,y: -150,z: 0,selection: true},

  {name: "50cc",image: "Image/50cc_unselect.png", image_select:"Image/50cc_select.png",
    fitByHeight: false,size: 0.5, x: 0,y: 160+551,z: 0,selection: true},
  {name: "100cc",image: "Image/100cc_unselect.png", image_select:"Image/100cc_select.png",
    fitByHeight: false,size: 0.5, x: 0,y: 40+551,z: 0,selection: true},
  {name: "150cc",image: "Image/150cc_unselect.png", image_select:"Image/150cc_select.png",
    fitByHeight: false,size: 0.5, x: 0,y: -80+551,z: 0,selection: true},
  {name: "200cc",image: "Image/200cc_unselect.png", image_select:"Image/200cc_select.png",
    fitByHeight: false,size: 0.5, x: 0,y: -200+551,z: 0,selection: true},
  
  {name: "50cc",image: "Image/50cc_unselect.png", image_select:"Image/50cc_select.png",
    fitByHeight: false,size: 0.5, x: 0,y: 160-551,z: 0,selection: true},
  {name: "100cc",image: "Image/100cc_unselect.png", image_select:"Image/100cc_select.png",
    fitByHeight: false,size: 0.5, x: 0,y: 40-551,z: 0,selection: true},
  {name: "150cc",image: "Image/150cc_unselect.png", image_select:"Image/150cc_select.png",
    fitByHeight: false,size: 0.5, x: 0,y: -80-551,z: 0,selection: true},
  {name: "200cc",image: "Image/200cc_unselect.png", image_select:"Image/200cc_select.png",
    fitByHeight: false,size: 0.5, x: 0,y: -200-551,z: 0,selection: true},

  {name: "retour",image: "Image/retour_unselect.png", image_select:"Image/retour_select.png",
    fitByHeight: false,size: 0.3, x: -575,y: -252,z: 0,selection: true},

  {name: "ok_solo_kart",image: "Image/ok_unselect.png", image_select:"Image/ok_select.png",
    fitByHeight: false,size: 0.5, x: 1280,y: 351,z: 0,selection: true},

  {name: "ok_solo_tour",image: "Image/ok_unselect.png", image_select:"Image/ok_select.png",
    fitByHeight: false,size: 0.5, x: 2560,y: 351,z: 0,selection: true},

  {name: "tour_1",image: "Image/tour_1.png", fitByHeight: false,size: 0.2, x: 2260,y: 551,z: 0,selection: false},
  {name: "tour_2",image: "Image/tour_2.png", fitByHeight: false,size: 0.2, x: 2560,y: 551,z: 0,selection: false},
  {name: "tour_3",image: "Image/tour_3.png", fitByHeight: false,size: 0.2, x: 2860,y: 551,z: 0,selection: false},
];

// Indice du plan actuel pour la navigation
let planIndex = 0;
let selection_var = "";

// Variables pour la transition fluide de la caméra
let isTransitioning = false;
let transitionStart = new THREE.Vector3();
let transitionTarget = new THREE.Vector3();
const transitionDuration = 1.0;  // Durée de la transition en secondes
let transitionElapsed = 0;

// Fonction d'easing (easeInOutQuad)
function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

/****************************************
 * 2) Scène, caméra, renderer (exemple)
 ****************************************/

// Raycaster pour détecter survol/clic
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

/****************************************
 * 3) Chargement des textures et création des plans
 ****************************************/
const textureLoader = new THREE.TextureLoader();

// Chargement des textures et création des plans
plansList.forEach((plan, index) => {
  textureLoader.load(plan.image, (textureNormal) => {
    textureNormal.anisotropy = renderer.capabilities.getMaxAnisotropy();
    textureNormal.minFilter = THREE.LinearMipMapLinearFilter;
    textureNormal.magFilter = THREE.LinearFilter;

    // Dimensions de l'image
    const imgWidth = textureNormal.image.width;
    const imgHeight = textureNormal.image.height;
    const aspect = imgWidth / imgHeight;

    // On calcule les ratios pour position et taille
    const { ratioW, ratioH } = getScaleRatios();
    const ratioMin = Math.min(ratioW, ratioH);

    // Calcul de la taille finale
    let finalWidth, finalHeight;
    if (plan.fitByHeight) {
      finalHeight = window.innerHeight;
      finalWidth  = finalHeight * aspect;
    } else {
      finalWidth  = imgWidth  * (plan.size || 1) * ratioMin;
      finalHeight = imgHeight * (plan.size || 1) * ratioMin;
    }

    // Création de la géométrie
    const geometry = new THREE.PlaneGeometry(finalWidth, finalHeight);

    // Matériaux normal / hover
    let normalMaterial, hoverMaterial = null;
    if (plan.selection) {
      if (plan.image_select) {
        const textureHover = textureLoader.load(plan.image_select);
        textureHover.anisotropy = renderer.capabilities.getMaxAnisotropy();
        textureHover.minFilter = THREE.LinearMipMapLinearFilter;
        textureHover.magFilter = THREE.LinearFilter;

        hoverMaterial = new THREE.MeshBasicMaterial({
          map: textureHover,
          transparent: true,
          alphaTest: 0.01,
          side: THREE.DoubleSide,
          color: 0xffffff
        });
      } else {
        hoverMaterial = new THREE.MeshBasicMaterial({
          map: textureNormal,
          transparent: true,
          alphaTest: 0.01,
          side: THREE.DoubleSide,
          color: 0xffffaa
        });
      }
    }

    normalMaterial = new THREE.MeshBasicMaterial({
      map: textureNormal,
      transparent: true,
      alphaTest: 0.01,
      side: THREE.DoubleSide,
      color: 0xffffff
    });

    // Mesh
    const planeMesh = new THREE.Mesh(geometry, normalMaterial);

    // Position (en tenant compte des ratios)
    const scaledX = plan.x * ratioW;
    const scaledY = plan.y * ratioH;
    planeMesh.position.set(scaledX, scaledY, plan.z || 0);

    // Stocke des infos utiles dans userData
    planeMesh.userData = {
      index: index,
      name: plan.name,
      selection: plan.selection === true,
      normalMaterial: normalMaterial,
      hoverMaterial: hoverMaterial,
      fitByHeight: plan.fitByHeight,
      aspect: aspect,
      originalWidth: imgWidth,
      originalHeight: imgHeight,
      size: plan.size || 1
    };

    // Ajout à la scène
    scene_select.add(planeMesh);
  });
});


/****************************************
 * 4) Redimensionnement de la fenêtre
 ****************************************/

function onWindowResize() {
  // Met à jour la caméra
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  camera_select.aspect = window.innerWidth / window.innerHeight;
  camera_select.updateProjectionMatrix();
  updateCameraZ();
  selection_travel(menu_name);
  console.log(camera_select.position.z);
  // Met à jour la taille du renderer
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Recalcule la position et la taille de chaque plan
  const { ratioW, ratioH } = getScaleRatios();
  const ratioMin = Math.min(ratioW, ratioH);

  scene_select.children.forEach((child) => {
    if (child.isMesh && child.userData) {
      const planData = child.userData;
      // Repositionnement
      const newX = plansList[planData.index].x * ratioW;
      const newY = plansList[planData.index].y * ratioH;
      if(child.name === "retour") 
        {child.position.set(newX + camera_select.position.x, newY + camera_select.position.y, child.position.z);}
      else {child.position.set(newX, newY, child.position.z);}

      // Mise à jour de la géométrie
      child.geometry.dispose();
      let newWidth, newHeight;
      if (planData.fitByHeight) {
        newHeight = window.innerHeight;
        newWidth  = newHeight * planData.aspect;
      } else {
        newWidth  = planData.originalWidth  * planData.size * ratioMin;
        newHeight = planData.originalHeight * planData.size * ratioMin;
      }
      child.geometry = new THREE.PlaneGeometry(newWidth, newHeight);
    }
  });
  // Recalculer la position/échelle du kart (si déjà chargé)
  if (perso_1) {
    
    
    // On reprend les coordonnées de référence stockées
    const refX = perso_1.userData.refPos.x;
    const refY = perso_1.userData.refPos.y;
    const refScale = perso_1.userData.refScale;
    
    // Mise à jour de la position
    perso_1.position.set(refX * ratioW, refY * ratioH, 0);
    
    // Mise à jour de l'échelle
    perso_1.scale.set(refScale * ratioMin, refScale * ratioMin, refScale * ratioMin);
  }

  if (perso_2) {

    // On reprend les coordonnées de référence stockées
    const refX = perso_2.userData.refPos.x;
    const refY = perso_2.userData.refPos.y;
    const refScale = perso_2.userData.refScale;
    
    // Mise à jour de la position
    perso_2.position.set(refX * ratioW, refY * ratioH, 0);
    
    // Mise à jour de l'échelle
    perso_2.scale.set(refScale * ratioMin, refScale * ratioMin, refScale * ratioMin);
  }
}

const REF_WIDTH = 1280;
const REF_HEIGHT = 551;
const REF_CAMZ = 359;

function getScaleRatios() {
  const ratioW = window.innerWidth / REF_WIDTH;
  const ratioH = window.innerHeight / REF_HEIGHT;
  return { ratioW, ratioH };
}

function updateCameraZ() {
  const ratioW = window.innerWidth / REF_WIDTH;
  const ratioH = window.innerHeight / REF_HEIGHT;
  const ratioMax = Math.max(ratioW, ratioH);
  // Plus la fenêtre est grande, plus ratioMax > 1, plus on s’éloigne.
  camera_select.position.z = REF_CAMZ * ratioMax;
}

updateCameraZ();

/****************************************
 * 6) Survol de la souris & clic
 ****************************************/
document.addEventListener("mousemove", onMouseMove);
document.addEventListener("click", (ev) => onMouseClick(ev,0));
const hoveredPersos = new Set(); // contient les objets "perso" actuellement survolés

function onMouseMove(event) {
  // Convertit la position de la souris en coordonnées normalisées (-1 à +1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Raycaster depuis la caméra
  raycaster.setFromCamera(mouse, camera_select);
  const intersects = raycaster.intersectObjects(scene_select.children, true);

  // Remettre tous les plans sélectionnables à leur matériau normal
  scene_select.children.forEach((obj) => {
    if (obj.isMesh && obj.userData.selection) {
      obj.material = obj.userData.normalMaterial;
    }
  });

  // Si on survole un plan qui a selection=true, on applique le hoverMaterial
  if (intersects.length > 0) {
    const topObj = intersects[0].object;
    if (topObj.userData.selection) {
      topObj.material = topObj.userData.hoverMaterial;
    }
  }

  // Réinitialise les objets survolés
  hoveredPersos.clear();

  if (intersects.length > 0) {
    const hovered = intersects[0].object;

    scene_select.traverse((obj) => {
      if (obj.name === "perso" && (obj === hovered || obj.getObjectById(hovered.id))) {
        hoveredPersos.add(obj);
      }
    });
  }

}

function grossissmentPerso(){
  // Animation smooth des objets "perso"
  scene_select.traverse((obj) => {
    if (obj.name === "perso") {
      var targetScale = hoveredPersos.has(obj) ? 7 : 5;
      if(obj.spec == 1){
        var targetScale = hoveredPersos.has(obj) ? 7 : 5;
      }
      if(obj.spec == 2){
        var targetScale = hoveredPersos.has(obj) ? 700 : 500;
      } 
      // Lerp progressif vers l’échelle cible
      obj.scale.x = THREE.MathUtils.lerp(obj.scale.x, targetScale, 0.1);
      obj.scale.y = THREE.MathUtils.lerp(obj.scale.y, targetScale, 0.1);
      obj.scale.z = THREE.MathUtils.lerp(obj.scale.z, targetScale, 0.1);
    }
  });
}

var menu_name = "home";



function onMouseClick(event, camIndex) {
  // Même logique de raycaster
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera_select);
  const intersects = raycaster.intersectObjects(scene_select.children, true);

  if (intersects.length > 0) {
    const topObj = intersects[0].object;
    // Si l'objet est sélectionnable, on appelle la fonction selection_travel()
    if (topObj.userData.selection) {
      selection_travel(topObj.userData.name);
    }
  }

  if (intersects.length > 0) {
    const clicked = intersects[0].object;

    // Recherche du parent dont le nom est "perso"
    let perso = clicked;
    while (perso && perso.name !== "perso") {
      perso = perso.parent;
    }

    if (perso && perso.name === "perso") {
      // Vérifier si ce perso est déjà sélectionné pour la caméra actuelle
      if (selection_perso[camIndex] === perso) {
        // Dé-sélection : on retire le perso pour cette caméra
        selection_perso[camIndex] = null;
        const label = perso.getObjectByName("selection_label");
        if (label) perso.remove(label);
      } else {
        // S'il existe déjà une sélection pour cette caméra, on la dé-sélectionne d'abord
        if (selection_perso[camIndex]) {
          const oldPerso = selection_perso[camIndex];
          const oldLabel = oldPerso.getObjectByName("selection_label");
          if (oldLabel) oldPerso.remove(oldLabel);
        }
        // On ajoute le nouveau perso pour cette caméra
        selection_perso[camIndex] = perso;
        const label = createSelectionLabel();
        label.name = "selection_label";
        if(perso.spec == 1){
          label.position.set(0, 20, 0); // positionner le label au-dessus du perso
        }
        if(perso.spec == 2){
          label.position.set(0, 0.2, 0); // positionner le label au-dessus du perso
          label.scale.set(0.2, 0.05, 0.1); // adapte la taille à ta scène
        } 
        perso.add(label);
      }
    }
  }
}




function createSelectionLabel() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#007bff"; // bleu
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.font = "28px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Sélectionné", canvas.width / 2, canvas.height / 2 + 10);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(20, 5, 10); // adapte la taille à ta scène

  return sprite;
}




/****************************************
 * 7) Fonction déclenchée au clic sur une image sélectionnable
 ****************************************/
function selection_travel(imageName) {
  // Exemple de logique conditionnelle :
  //var { ratioW, ratioH } = getScaleRatios();
  var ratioW = window.innerWidth;
  var ratioH = window.innerHeight;
  if (imageName === "home") {
    console.log("home");
    menu_name = "home";
    transitionStart.copy(camera_select.position);
    transitionTarget.set(ratioW * 0, ratioH * 0, camera_select.position.z);
    transitionElapsed = 0;
    isTransitioning = true;
  } else if (imageName === "solo") {
    
    // Préparation de la transition : la caméra va vers (x, y)
    transitionStart.copy(camera_select.position);
    transitionTarget.set(ratioW * 0, ratioH * 1, camera_select.position.z);
    transitionElapsed = 0;
    isTransitioning = true;
    menu_name = "solo";
    console.log("solo", transitionTarget);
  } else if (imageName === "multi") {
    console.log("multi");
    menu_name = "multi";
    // Préparation de la transition : la caméra va vers (x, y)
    transitionStart.copy(camera_select.position);
    transitionTarget.set(ratioW * 0, ratioH * -1, camera_select.position.z);
    transitionElapsed = 0;
    isTransitioning = true;
  } 
  else if (imageName === "config") {
    console.log("config");
    menu_name = "config";
    // Préparation de la transition : la caméra va vers (x, y)
    transitionStart.copy(camera_select.position);
    transitionTarget.set(ratioW * 0, ratioH * 2, camera_select.position.z);
    transitionElapsed = 0;
    isTransitioning = true;
  }
  else if (imageName === "50cc" || imageName === "100cc" || imageName === "150cc" || imageName === "200cc" || imageName === "vitesse") {
    if(menu_name === "solo"){menu_name = "perso_solo";}
    if(menu_name === "multi"){menu_name = "nb_multi";}
    console.log(imageName);
    if(imageName === "50cc") level_cube = 1;
    if(imageName === "100cc") level_cube = 1.5;
    if(imageName === "150cc") level_cube = 2;
    if(imageName === "200cc") level_cube = 2.5;
    // Préparation de la transition : la caméra va vers (x, y)
    transitionStart.copy(camera_select.position);
    transitionTarget.set(ratioW * 1, menu_name == "perso_solo" ? ratioH * 1 : ratioH * -1, camera_select.position.z);
    transitionElapsed = 0;
    isTransitioning = true;
  }
  else if(imageName === "retour"){
    console.log("retour");
    if(menu_name == "multi" || menu_name == "solo" || menu_name == "config"){selection_travel("home")}
    if(menu_name == "nb_multi"){selection_travel("multi")}
    if(menu_name == "perso_solo"){selection_travel("solo")}
    if(menu_name == "tour_solo"){
      menu_name = "perso_solo";
      selection_travel("vitesse");
    }
  }
  else if(imageName === "ok_solo_kart"){
    console.log("ok_solo_kart");
    menu_name = "tour_solo";
    transitionStart.copy(camera_select.position);
    transitionTarget.set(ratioW * 2, ratioH * 1, camera_select.position.z);
    transitionElapsed = 0;
    isTransitioning = true;
  }
  else {
    console.log("Action par défaut pour", imageName);
  }
}

function theUpdateGame(deltaTime){
  updateDriftParticles(deltaTime);
  boostUpdate(deltaTime);
}

// =============================================================================
//
//            =================== AI ==========================
//
// =============================================================================

// Fonction modifiée pour spawn de particules pour l'IA (on accepte un paramètre particleColor)
function spawnDriftParticleIa(carMesh, direction, particleColor) {
  // Calcul d'un offset de base
  const offset = new THREE.Vector3();
  if (direction === 'left') {
    offset.set(1, 0, -3);
  } else { // direction "right"
    offset.set(-1, 0, -3);
  }
  // Appliquer la rotation du kart à l'offset
  offset.applyQuaternion(carMesh.quaternion);
  // Ajouter une variation aléatoire pour plus d'effet
  offset.x += (Math.random() - 0.5) * 2;
  offset.y += (Math.random() - 0.5) * 2;
  offset.z += (Math.random() - 0.5) * 2;
  
  const spawnPos = new THREE.Vector3().copy(carMesh.position).add(offset);
  const geometry = new THREE.SphereGeometry(0.3, 8, 8);
  const material = new THREE.MeshBasicMaterial({
    color: particleColor, 
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const particle = new THREE.Mesh(geometry, material);
  particle.position.copy(spawnPos);
  particle.userData = { lifetime: 0 };
  scene.add(particle);
  driftParticles.push(particle);
}

// Création de la voiture IA
function createAIVehicle(modelPath, startPos, scale) {
  const ai = {};

  // Création du corps physique
  ai.body = new CANNON.Body({
    mass: 200,
    shape: new CANNON.Box(new CANNON.Vec3(8, 3, 12.5)),
    position: new CANNON.Vec3(startPos.x, startPos.y, startPos.z)
  });
  ai.body.fixedRotation = true;
  ai.body.updateMassProperties();
  world.addBody(ai.body);

  // Création d'un mesh de debug (boîte rouge)
  ai.mesh = new THREE.Mesh(
    new THREE.BoxGeometry(17, 5, 25),
    new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true , visible:false})
  );
  ai.mesh.position.set(startPos.x, startPos.y, startPos.z);
  scene.add(ai.mesh);

  // Création d'un groupe pour le modèle visuel, qui permettra de conserver l'offset et la rotation
  ai.visualGroup = new THREE.Group();
  // Position initiale identique au corps physique
  ai.visualGroup.position.set(startPos.x, startPos.y, startPos.z);
  scene.add(ai.visualGroup);

  // Chargement du modèle 3D du kart
  loader.load(modelPath, (gltf) => {
    ai.model = gltf.scene;
    ai.model.scale.set(scale, scale, scale);
    // Appliquer l'offset et la rotation de correction au niveau du modèle (localement dans le groupe)
    ai.model.position.set(0, -4, 0); // décale vers le bas de 4 unités
    ai.model.rotation.y = Math.PI;    // fait pivoter de 180° autour de Y
    ai.visualGroup.add(ai.model);
  }, undefined, console.error);

  // Variables d'état de l'IA...
  ai.started = false;
  ai.startDelay = 5;
  ai.elapsedTime = 0;
  ai.tour = 0;
  ai.checkpoints = ["step_1", "step_2", "step_3", "step_4"];
  ai.tasksCompleted = {};
  ai.checkpoints.forEach(cp => { ai.tasksCompleted[cp] = false; });
  ai.phantom = false;
  ai.finished = false;
  ai.wasOnCheckpoint = false;

  return ai;
}


// Fonction utilitaire pour détecter un obstacle devant l’IA
function checkObstacleAhead(ai, distanceThreshold) {
  const forward = new THREE.Vector3(0, 0, -1)
    .applyQuaternion(ai.mesh.quaternion)
    .setY(0)
    .normalize();
  const aiPos = ai.mesh.position.clone();
  for (let cube of cubesList) {
    const toCube = cube.mesh.position.clone().sub(aiPos);
    if (toCube.length() < distanceThreshold) {
      // Si l'obstacle est dans un cône d'environ 45° devant
      if (forward.dot(toCube.normalize()) > 0.7) {
        return cube;
      }
    }
  }
  return null;
}

// Fonction d'évaluation de la surface de test sur une distance donnée
function evaluateTestSurface(ai, direction, maxDistance = 150, step = 10) {
  let score = 0;
  const samples = Math.floor(maxDistance / step);
  for (let i = 1; i <= samples; i++) {
    const d = i * step;
    const samplePos = ai.mesh.position.clone().add(direction.clone().multiplyScalar(d));
    if (isCarOnTerrain("road", { position: samplePos })) {
      score++;
    }
  }
  return score;
}

function forceKartRotation180(ai) {
  // Créer une quaternion correspondant à 180° autour de l'axe Y
  const q180 = new CANNON.Quaternion();
  q180.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI);
  
  // Multiplier la quaternion 180° par la quaternion actuelle du corps physique
  ai.body.quaternion = q180.multipliedBy(ai.body.quaternion);
  
  // Mettez à jour immédiatement les objets visuels pour éviter que la synchronisation ne les écrase
  ai.mesh.quaternion.copy(ai.body.quaternion);
  ai.visualGroup.quaternion.copy(ai.body.quaternion);
}


function updateAIVehicle(ai, deltaTime) {
  // Délai de démarrage de 5 s
  if (!ai.started) {
    ai.elapsedTime += deltaTime;
    if (ai.elapsedTime >= ai.startDelay) {
      ai.started = true;
    } else {
      return;
    }
  }
  if (ai.finished && !ai.phantom) {
    ai.body.velocity.set(0, 0, 0);
    ai.body.angularVelocity.set(0, 0, 0);
    ai.model.traverse((child) => {
      if (child.isMesh) {
        child.material.transparent = true;
        child.material.opacity = 0.5;
      }
    });
    return;
  }
  
  // Définir l'axe "avant" (axe local -Z)
  const forward = new THREE.Vector3(0, 0, -1)
    .applyQuaternion(ai.mesh.quaternion)
    .setY(0)
    .normalize();
  
  // Distance de capteur pour la vérification : 200 unités
  const sensorDistance = 200;
  
  // Vecteurs latéraux par rapport à forward
  const leftVector = new THREE.Vector3(-forward.z, 0, forward.x).normalize();
  const rightVector = leftVector.clone().negate();
  
  // Par défaut, le kart souhaite avancer tout droit
  let targetDir = forward.clone();
  
  // On évalue la couverture du road sur une surface de test dans la direction forward
  const forwardScore = evaluateTestSurface(ai, forward, sensorDistance, 10);
  const maxSamples = sensorDistance / 10; // par exemple 15 samples si step = 10 et sensorDistance = 150
  
  // Si la couverture du road devant est insuffisante, on regarde les côtés
  if (forwardScore < 0.7 * maxSamples) { // seuil de 70%
    const leftScore = evaluateTestSurface(ai, leftVector, sensorDistance, 10);
    const rightScore = evaluateTestSurface(ai, rightVector, sensorDistance, 10);
    if (leftScore > rightScore) {
      targetDir.add(leftVector.clone().multiplyScalar(0.5));
    } else {
      targetDir.add(rightVector.clone().multiplyScalar(0.5));
    }
  } else {
    // Sinon, on vérifie que le kart ne s'approche pas trop des bords
    const leftSample = ai.mesh.position.clone().add(leftVector.clone().multiplyScalar(sensorDistance));
    const rightSample = ai.mesh.position.clone().add(rightVector.clone().multiplyScalar(sensorDistance));
    if (!isCarOnTerrain("road", { position: leftSample })) {
      targetDir.add(rightVector.clone().multiplyScalar(0.4));
    }
    if (!isCarOnTerrain("road", { position: rightSample })) {
      targetDir.add(leftVector.clone().multiplyScalar(0.4));
    }
  }
  
  // Vérification d'obstacles sur 150 unités devant
  const obstacle = checkObstacleAhead(ai, sensorDistance);
  if (obstacle) {
    const toObs = obstacle.mesh.position.clone().sub(ai.mesh.position).setY(0);
    if (forward.dot(toObs.normalize()) > 0.9) { // obstacle quasiment en face
      if (leftVector.dot(toObs) > 0) {
        targetDir.add(rightVector.clone().multiplyScalar(0.4));
      } else {
        targetDir.add(leftVector.clone().multiplyScalar(0.4));
      }
    } else {
      targetDir.sub(toObs.normalize().multiplyScalar(0.8));
    }
  }
  
  // Ajout de la répulsion inter-IA : pour chaque autre IA, si trop proche (<150 unités), on ajoute une force repulsive
  // On suppose que aiVehicles est un tableau global contenant toutes les IA
  if (typeof aiVehicles !== "undefined") {
    aiVehicles.forEach(other => {
      if (other !== ai && !other.finished) {
        const diff = ai.mesh.position.clone().sub(other.mesh.position);
        const dist = diff.length();
        if (dist < 100 && dist > 0) {
          // La force repulsive peut être proportionnelle à (100 - dist)
          const repulsion = diff.normalize().multiplyScalar((100 - dist) / 100);
          // On ajoute cette composante à la direction cible avec un facteur de pondération
          targetDir.add(repulsion.multiplyScalar(0.7));
        }
      }
    });
  }
  
  targetDir.normalize();
  
  // Calcul de la différence d'angle entre forward et targetDir
  let angleDiff = forward.angleTo(targetDir);
  const cross = new THREE.Vector3().crossVectors(forward, targetDir);
  const sign = (cross.y >= 0 ? 1 : -1);
  
  // Si le score en avant est faible, limiter la rotation (virage trop serré)
  let angularMultiplier = 0.9;
  if (forwardScore < 0.7 * maxSamples) {
    angularMultiplier = 0.5; // moins agressif si le road devant est pauvre
  }
  let desiredAngular = sign * angularMultiplier * level_cube * angleDiff;
  const smoothing = 0.1; // interpolation pour rotation douce
  ai.body.angularVelocity.y = THREE.MathUtils.lerp(ai.body.angularVelocity.y, desiredAngular, smoothing);

  // --- Gestion du drift ---
  // On définit un seuil de rotation pour considérer qu'un drift est engagé
  const driftThreshold = 0.2; // en radians  
  // Initialiser les timers si non définis
  if (ai.driftTimer === undefined) ai.driftTimer = 0;
  if (ai.boostTimer === undefined) ai.boostTimer = 0;
  if (Math.abs(desiredAngular) > driftThreshold) {
    ai.driftTimer += deltaTime;
    // La voiture est en train de tourner suffisamment pour être en drift
    // Appliquer un multiplicateur de drift : 2 fois plus de rotation
    if(ai.driftTimer > 0.5){
      desiredAngular *= 2;
      // Spawn de particules : bleu si drift < 1.5s, orange sinon
      let particleColor = (ai.driftTimer < 1.5) ? 0x00aaff : 0xff8800;
      spawnDriftParticleIa(ai.mesh, sign > 0 ? "left" : "right", particleColor);
    }
  } else {
    // Le drift est terminé
    if (ai.driftTimer >= 1.5) {
      // Si le drift a duré plus de 1 sec, activer un boost de vitesse pendant 1 sec
      ai.boostTimer = 1;
    }
    ai.driftTimer = 0;
  }
  // Interpolation douce de l'angular velocity
  ai.body.angularVelocity.y = THREE.MathUtils.lerp(ai.body.angularVelocity.y, desiredAngular, smoothing);
  // Application de la vitesse
  let speedMultiplier = 1;
  if (ai.boostTimer > 0) {
    speedMultiplier = 2;
    ai.boostTimer -= deltaTime;
  }
  

  // Application de la vitesse dans la direction targetDir
  const baseSpeed = 125 * level_cube * updateCarSpeed(ai.mesh) * speedMultiplier;
  ai.body.velocity.x = targetDir.x * baseSpeed;
  ai.body.velocity.z = targetDir.z * baseSpeed;
  
  // Synchronisation du mesh de debug et du groupe visuel avec le corps physique
  ai.mesh.position.copy(ai.body.position);
  ai.mesh.quaternion.copy(ai.body.quaternion);
  
  ai.visualGroup.position.copy(ai.body.position);
  ai.visualGroup.quaternion.copy(ai.body.quaternion);

  
  // Vérification des checkpoints (steps)
  const nextIndex = ai.checkpoints.findIndex(cp => !ai.tasksCompleted[cp]);
  if (nextIndex !== -1) {
    const cpName = ai.checkpoints[nextIndex];
    const cpSensor = ai.mesh.position.clone().add(forward.clone().multiplyScalar(2));
    if (isCarOnTerrain(cpName, { position: cpSensor })) {
      if (ai.wasOnCheckpoint && ai.tasksCompleted[cpName]) {
        // Le kart était déjà sur le checkpoint, l'a quitté, et le repasse : forcez une rotation de 180°
        forceKartRotation180(ai);
      }
      ai.tasksCompleted[cpName] = true;
      ai.wasOnCheckpoint = true;
      ai.tasksCompleted[cpName] = true;
      console.log("Step", cpName, "validé");
    }
    else {
      ai.wasOnCheckpoint = false;
    }
  }
  if (ai.checkpoints.every(cp => ai.tasksCompleted[cp])) {
    console.log("Tour terminé par l'IA");
    ai.tour += 1;
    if(ai.tour >= nbTour){
      console.log("Course terminé par l'IA");
      ai.finished = true;
      ai.phantom = true;
      ai.model.traverse((child) => {
        if (child.isMesh) {
          child.material.transparent = true;
          child.material.opacity = 0.5;
        }
      });
    }
    ai.checkpoints.forEach(cp => { ai.tasksCompleted[cp] = false; });
  }
}



// =============================================================================
//
//            ================= FIN AI ========================
//
// =============================================================================

// === Boucle d'animation ===
const timeStep = 1 / 60;
const clock = new THREE.Clock();
function animate() {
  const deltaTime = clock.getDelta(); // temps écoulé depuis la dernière frame (en secondes)
  requestAnimationFrame(animate);
  commandeInterpretor();
  updateVehicleCoordinates();
  
  if(statusWolrd === "select"){
    particulesSelectMenu();
    grossissmentPerso();
    select_menu(deltaTime);
    //animateCameraSelect();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.setScissor(0, 0, window.innerWidth, window.innerHeight);
    renderer.render(scene_select, camera_select);
  }
  else if (statusWolrd === "runsolo") {
    theUpdateGame(deltaTime);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.setScissor(0, 0, window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    gameRun();
    renderer.render(scene, camera);
  }
  else if (statusWolrd === "stop") {
    renderer.render(scene, camera);
  }
  else if (statusWolrd === "rundev") {
    // Redimensionner le renderer pour couvrir toute la fenêtre
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Définir le viewport et le scissor pour l'écran entier
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.setScissor(0, 0, window.innerWidth, window.innerHeight);

    // Mettre à jour l'aspect de la caméra et recalculer la matrice de projection
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    gameRunDev();
    renderer.render(scene, camera);
  }
  else if (statusWolrd === "runsplit") {
    theUpdateGame(deltaTime);
    camera.aspect = window.innerWidth/2 / window.innerHeight;
    camera.updateProjectionMatrix();

    camera_2.aspect = window.innerWidth/2 / window.innerHeight;
    camera_2.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setScissorTest(true);

    gameRun_2();
    // Partie gauche
    renderer.setViewport(0, 0, window.innerWidth / 2, window.innerHeight);
    renderer.setScissor(0, 0, window.innerWidth / 2, window.innerHeight);
    renderer.render(scene, camera);

    // Partie droite
    renderer.setViewport(window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight);
    renderer.setScissor(window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight);
    renderer.render(scene, camera_2);
   
  }
  else if (statusWolrd === "runsplit3") {
    theUpdateGame(deltaTime);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    camera_2.aspect = window.innerWidth / window.innerHeight;
    camera_2.updateProjectionMatrix();

    camera_3.aspect = window.innerWidth / window.innerHeight;
    camera_3.updateProjectionMatrix();

    // Taille du renderer et activation du scissor test
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setScissorTest(true);

    gameRun_3(); // Run the game

    // ---------------------
    // Quadrant supérieur gauche : scene1 et camera1
    renderer.setViewport(0, window.innerHeight / 2, window.innerWidth / 2, window.innerHeight / 2);
    renderer.setScissor(0, window.innerHeight / 2, window.innerWidth / 2, window.innerHeight / 2);
    renderer.render(scene, camera);

    // ---------------------
    // Quadrant supérieur droit : scene1 et camera2
    renderer.setViewport(window.innerWidth / 2, window.innerHeight / 2, window.innerWidth / 2, window.innerHeight / 2);
    renderer.setScissor(window.innerWidth / 2, window.innerHeight / 2, window.innerWidth / 2, window.innerHeight / 2);
    renderer.render(scene, camera_2);

    // ---------------------
    // Quadrant inférieur gauche : scene1 et camera3
    renderer.setViewport(0, 0, window.innerWidth / 2, window.innerHeight / 2);
    renderer.setScissor(0, 0, window.innerWidth / 2, window.innerHeight / 2);
    renderer.render(scene, camera_3);

    // ---------------------
    // Quadrant inférieur droit : scene1 et camera4
    renderer.setViewport(window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight / 2);
    renderer.setScissor(window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight / 2);
    renderer.render(scene, camera_map);
   
  }
  else if (statusWolrd === "runsplit4") {
    theUpdateGame(deltaTime);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    camera_2.aspect = window.innerWidth / window.innerHeight;
    camera_2.updateProjectionMatrix();

    // Taille du renderer et activation du scissor test
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setScissorTest(true);

    gameRun_3(); // Run the game

    // ---------------------
    // Quadrant supérieur gauche : scene1 et camera1
    renderer.setViewport(0, window.innerHeight / 2, window.innerWidth / 2, window.innerHeight / 2);
    renderer.setScissor(0, window.innerHeight / 2, window.innerWidth / 2, window.innerHeight / 2);
    renderer.render(scene, camera);

    // ---------------------
    // Quadrant supérieur droit : scene1 et camera2
    renderer.setViewport(window.innerWidth / 2, window.innerHeight / 2, window.innerWidth / 2, window.innerHeight / 2);
    renderer.setScissor(window.innerWidth / 2, window.innerHeight / 2, window.innerWidth / 2, window.innerHeight / 2);
    renderer.render(scene, camera_2);

    // ---------------------
    // Quadrant inférieur gauche : scene1 et camera3
    renderer.setViewport(0, 0, window.innerWidth / 2, window.innerHeight / 2);
    renderer.setScissor(0, 0, window.innerWidth / 2, window.innerHeight / 2);
    renderer.render(scene, camera_3);

    // ---------------------
    // Quadrant inférieur droit : scene1 et camera4
    renderer.setViewport(window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight / 2);
    renderer.setScissor(window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight / 2);
    renderer.render(scene, camera_map);
   
  }
  
}
animate();

// === Ajustement lors du redimensionnement de la fenêtre ===
window.addEventListener('resize', () => {
  onWindowResize(window);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
