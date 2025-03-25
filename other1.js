import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as CANNON from 'cannon-es';

// === CHAT ===
// Variable pour stocker la valeur du chat
let chatValue = "";
var statusWolrd = "select";

var level_cube = 1;

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
  position: new CANNON.Vec3(-1950, 0, 65)
});
boxBody_2.quaternion.setFromEuler(0,-Math.PI, 0);
boxBody_2.fixedRotation = true;
boxBody_2.updateMassProperties();
world.addBody(boxBody_2);

// === Chargement du modèle de la voiture (kart) ===
let kart_2;
loader.load(
  '3D_Model/car_1.glb',
  (gltf) => {
    kart_2 = gltf.scene;
    kart_2.scale.set(50, 50, 50);
    // Position initiale (sera remplacée dans l'animation)
    kart_2.position.set(-1950, 0, 65);
    // Orientation initiale
    kart_2.rotation.y = Math.PI;
    kart_2.traverse((child) => {
      if (child.isMesh) child.frustumCulled = false;
    });
    scene.add(kart_2);
  },
  undefined,
  console.error
);


// === Vitesse voiture ===

// Variable globale indiquant le terrain sur lequel se trouve la voiture
let currentTerrainType = "road"; // par défaut

// À chaque collision, mettre à jour currentTerrainType
boxBody.addEventListener("collide", (event) => {
  const otherBody = event.body;
  if (otherBody.terrainType) {
    currentTerrainType = otherBody.terrainType;
    // Vous pouvez afficher dans la console pour tester :
    console.log("Collision avec terrain:", currentTerrainType);
  }
});

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
    console.log("Texture", name, "chargée avec dimensions", image.width, image.height);
    
    // Appeler la fonction de débogage pour afficher les zones actives
    // Vous pouvez définir la couleur différemment pour "road" et "dirt"
    if (draw) {
      if(name === "road") {
        debugDisplayTerrain(name, 0xff0000); // par exemple en rouge pour la route
      } else if(name === "dirt") {
        debugDisplayTerrain(name, 0x00ff00); // en vert pour le terrain dirt
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
    console.log("Véhicule sur road",boxCar);
  } else if (isCarOnTerrain("dirt",boxCar)) {
    speedMultiplier = 0.5;
    console.log("Véhicule sur dirt");
  }
  return speedMultiplier;
}



// === Gestion des contrôles clavier (Z, Q, S, D) ===
const keys = { z: false, s: false, q: false, d: false , o:false, l:false, k:false, m:false};
window.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

// === Mise à jour des contrôles de la boîte ===
// Avec Z et S, la boîte est déplacée selon la direction de la caméra.
// Avec Q et D, une rotation est appliquée.
function updateBoxControl(boxCarMesh, boxCarBody, cam, keyMove, keyBack, keyLeft, keyRight) {
  
  const speed = 200 * level_cube;
  const rotationSpeed = 1.5 * level_cube;

  let camDirection = new THREE.Vector3();
  cam.getWorldDirection(camDirection);
  camDirection.y = 0;
  camDirection.normalize();
  
  let movement = new THREE.Vector3(0, 0, 0);
  
  if (keyMove) {
    movement.add(camDirection.clone().multiplyScalar(speed*updateCarSpeed(boxCarMesh)));
  }
  if (keyBack) {
    movement.add(camDirection.clone().multiplyScalar(-speed*updateCarSpeed(boxCarMesh)));
  }
  
  // Mise à jour de la vitesse du corps sur les axes X et Z
  boxCarBody.velocity.x = movement.x;
  boxCarBody.velocity.z = movement.z;
  
  if (keyMove || keyBack || keyLeft || keyRight) {
    boxCarBody.wakeUp();
  }
  
  
  if (keyLeft) {
    boxCarBody.angularVelocity.y = rotationSpeed;
  } else if (keyRight) {
    boxCarBody.angularVelocity.y = -rotationSpeed;
  } else {
    boxCarBody.angularVelocity.y *= 0.9;
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
//createOverlay();


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
  
  // Si la commande commence par "c", on passe par cubeLevelCreator
  if(commande.trim().toLowerCase().startsWith("c")){
    cubeLevelCreator(commande);
  }
}


// === Fonction du Jeu en Run ===
function gameRun(){
  // Mise à jour du monde physique
  world.step(timeStep);
  updateBoxControl(boxMesh,boxBody,camera,keys.z,keys.s,keys.q,keys.d);
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
  
  // Mise à jour de la caméra
  updateCamera(boxMesh, camera, level_cube);
  //updateVehicleCoordinates()
}

// === Fonction du Jeu en Run ===
function gameRun_2(){
  // Mise à jour du monde physique
  world.step(timeStep);
  updateBoxControl(boxMesh,boxBody,camera,keys.z,keys.s,keys.q,keys.d);
  updateBoxControl(boxMesh_2,boxBody_2,camera_2,keys.o,keys.l,keys.k,keys.m);
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


// === SELECT BUTTONS ===

// === Variables globales minimales ===
let buttonMesh;
let normalMaterial, hoverMaterial;
let raycaster, mouse;

init();

function init() {
  // 4) Création du raycaster et du vecteur souris
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  // 5) Création des deux textures (normal et hover) et de leurs matériaux
  normalMaterial = new THREE.MeshBasicMaterial({
    map: createButtonTexture("Single Player", false),
    transparent: true
  });
  hoverMaterial = new THREE.MeshBasicMaterial({
    map: createButtonTexture("Multiplayer\n2p   3p   4p", true),
    transparent: true
  });

  // 6) Création du plane (bouton)
  //    Largeur = 500, hauteur = 100 => déjà grand.
  //    Vous pouvez augmenter ces valeurs ou rapprocher la caméra pour le rendre encore plus gros.
  const geometry = new THREE.PlaneGeometry(500, 100);
  buttonMesh = new THREE.Mesh(geometry, normalMaterial);

  // On place le bouton au centre de la scène (x=0, y=0, z=0)
  buttonMesh.position.set(-250, 0, 0);
  scene_select.add(buttonMesh);
  camera

  // 7) Écouteurs d’événements
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("resize", onWindowResize_2);
}

// === Création d'une texture pour le bouton ===
//  - text : le texte à afficher
//  - isHover : si true => dégradé jaune, sinon gris
function createButtonTexture(text, isHover) {
  const width = 512;
  const height = 128;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // Couleurs pour le dégradé
  let colorStart, colorEnd;
  if (isHover) {
    colorStart = "#fff47a";  // jaune clair
    colorEnd   = "#ffd700";  // jaune plus soutenu
  } else {
    colorStart = "#cccccc";  // gris clair
    colorEnd   = "#999999";  // gris plus foncé
  }

  // Création d'un dégradé horizontal
  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, colorStart);
  gradient.addColorStop(1, colorEnd);

  // Remplissage du fond
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Dessin du texte
  ctx.fillStyle = "#000000";
  ctx.font = "bold 48px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // On split le texte s'il y a des retours à la ligne \n
  const lines = text.split("\n");
  const lineHeight = 52; // espace entre les lignes

  lines.forEach((line, i) => {
    ctx.fillText(
      line,
      width / 2,
      height / 2 + (i - (lines.length - 1) / 2) * lineHeight
    );
  });

  // Création d'une texture Three.js
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// === Gestion du mouvement de la souris (pour changer l'état du bouton) ===
function onMouseMove(event) {
  // Convertit la position de la souris en coordonnées normalisées (-1 à +1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Met à jour le raycaster
  raycaster.setFromCamera(mouse, camera_select);

  // Vérifie l'intersection avec le bouton
  const intersects = raycaster.intersectObject(buttonMesh);
  if (intersects.length > 0) {
    // Survol => on passe au material hover
    buttonMesh.material = hoverMaterial;
  } else {
    // Pas survol => on repasse au material normal
    buttonMesh.material = normalMaterial;
  }
}

// === Gestion du redimensionnement de la fenêtre ===
function onWindowResize_2() {
  camera_select.aspect = window.innerWidth / window.innerHeight;
  camera_select.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
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

// === Définition de la liste des plans ===
const plansList = [
  { name: "home", image: "Image/mario_2.png",fitByHeight: true , alignment: "right" }, 
  { name: "vitesse", image: "Image/mario_2.png",fitByHeight: true  ,alignment: "custom", customOffset: -window.innerWidth / 4 },
  { name: "personnage", image: "Image/mario_2.png",fitByHeight: true , alignment: "left"  },
  { name: "kart", image: "Image/mario_2.png",fitByHeight: true , alignment: "center"  },
  { name: "course", image: "Image/mario_2.png",fitByHeight: true, alignment: "right"   },
  { name: "go", image: "Image/mario_2.png",fitByHeight: true, alignment: "right"   }
  // alignement could be "left" or "right" or "center" or "100" "custom"
];

// Texture loader
const textureLoader = new THREE.TextureLoader();

let planIndex = 0;
let selection_var = "";
let currentPlan = plansList[planIndex].name;  // plan actuel

// Pour chaque plan, charger la texture, calculer ses dimensions cibles et positionner le mesh
plansList.forEach((plan, index) => {
  textureLoader.load(plan.image, (texture) => {
    // Amélioration de la qualité de la texture
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    texture.magFilter = THREE.LinearFilter;

    // Rapport largeur/hauteur de l'image
    const aspect = texture.image.width / texture.image.height;
    let targetWidth, targetHeight;

    // Calcul en fonction de l'option fitByHeight
    if (plan.fitByHeight) {
      targetHeight = window.innerHeight;
      targetWidth = window.innerHeight * aspect;
    } else {
      targetWidth = window.innerWidth;
      targetHeight = window.innerWidth / aspect;
    }

    // Création de la géométrie avec les dimensions calculées
    const geometry = new THREE.PlaneGeometry(targetWidth, targetHeight);

    // Création du matériau avec gestion de la transparence
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.01,
      side: THREE.DoubleSide
    });

    const planeMesh = new THREE.Mesh(geometry, material);

    // On stocke dans userData des infos utiles pour le redimensionnement
    planeMesh.userData = {
      fitByHeight: plan.fitByHeight,
      aspect: aspect,
      alignment: plan.alignment || "center",
      customOffset: plan.customOffset || 0,
      index: index
    };

    // Calcul de la position sur l'axe X selon l'alignement.
    // La "cellule" de chaque plan est de largeur window.innerWidth et son centre est à : baseX = index * window.innerWidth
    const baseX = index * window.innerWidth;
    let posX = baseX; // par défaut, center
    switch (planeMesh.userData.alignment) {
      case "left":
        // Pour aligner à gauche, on veut que le bord gauche de l'image
        // (posX - targetWidth/2) coïncide avec le bord gauche de la cellule (baseX - window.innerWidth/2)
        posX = baseX - window.innerWidth/2 + targetWidth / 2;
        break;
      case "right":
        // Pour aligner à droite, on veut que le bord droit de l'image
        // (posX + targetWidth/2) coïncide avec le bord droit de la cellule (baseX + window.innerWidth/2)
        posX = baseX + window.innerWidth / 2 - targetWidth / 2;
        break;
      case "custom":
        // Position personnalisée, le décalage est ajouté par rapport au centre de la cellule
        posX = baseX + planeMesh.userData.customOffset;
        break;
      // "center" ou défaut : pas de modification
    }
    planeMesh.position.set(posX, 0, 0);
    scene_select.add(planeMesh);
  });
});

function onWindowResize() {
  // Mise à jour du renderer et de la caméra (si vous utilisez la même pour scene_select)
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera_select.aspect = window.innerWidth / window.innerHeight;
  camera_select.updateProjectionMatrix();

  // Mise à jour des géométries des plans en fonction du mode de redimensionnement
  scene_select.children.forEach((mesh) => {
    if (mesh.isMesh && mesh.userData && mesh.userData.aspect) {
      const aspect = mesh.userData.aspect;
      let newWidth, newHeight;
      if (mesh.userData.fitByHeight) {
        newHeight = window.innerHeight;
        newWidth = window.innerHeight * aspect;
      } else {
        newWidth = window.innerWidth;
        newHeight = window.innerWidth / aspect;
      }
      // Dispose de l'ancienne géométrie et crée-en une nouvelle
      mesh.geometry.dispose();
      mesh.geometry = new THREE.PlaneGeometry(newWidth, newHeight);
    }
  });
}

// Gestion du redimensionnement de la fenêtre
window.addEventListener("resize", onWindowResize());

// === Variables pour la transition fluide ===
let isTransitioning = false;
let transitionStart = 0;
let transitionTarget = 0;
const transitionDuration = 1.0;  // Durée de la transition en secondes
let transitionElapsed = 0;

// Fonction d'easing (easeInOutQuad)
function easeInOutQuad(t) {
  return t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t;
}



// === Gestion des événements clavier ===
document.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    if (event.shiftKey) {
      selection_var = 'précédent';
      planIndex = (planIndex - 1 + plansList.length) % plansList.length;
    } else {
      selection_var = 'suivant';
      planIndex = (planIndex + 1) % plansList.length;
    }
    currentPlan = plansList[planIndex].name;
    
    // Préparation de la transition :
    // La position de départ est la position X actuelle de la caméra.
    // La position cible est index * window.innerWidth (puisque chaque plan est espacé d'une largeur d'écran).
    transitionStart = camera_select.position.x;
    transitionTarget = planIndex * window.innerWidth;
    transitionElapsed = 0;
    isTransitioning = true;
  }
});


// === Fonction d'animation de la caméra pour la sélection de menu ===
function animateCameraSelect() {
  // Calcul du delta pour un update indépendant du framerate
  const delta = clock.getDelta();
  
  if (isTransitioning) {
    transitionElapsed += delta;
    let progress = transitionElapsed / transitionDuration;
    if (progress >= 1) {
      progress = 1;
      isTransitioning = false;
    }
    // Application d'une fonction d'easing pour adoucir le mouvement
    const easedProgress = easeInOutQuad(progress);
    // Interpolation linéaire entre la position de départ et la position cible
    const newX = THREE.MathUtils.lerp(transitionStart, transitionTarget, easedProgress);
    camera_select.position.x = newX;
  }
}


// === Boucle d'animation ===
const timeStep = 1 / 60;
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  commandeInterpretor();
  if(statusWolrd === "select"){
    particulesSelectMenu();
    animateCameraSelect();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.setScissor(0, 0, window.innerWidth, window.innerHeight);
    renderer.render(scene_select, camera_select);
  }
  else if (statusWolrd === "runsolo") {
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
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    camera_2.aspect = window.innerWidth / window.innerHeight;
    camera_2.updateProjectionMatrix();

    // Taille du renderer et activation du scissor test
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setScissorTest(true);

    gameRun_2(); // Run the game

    // ---------------------
    // Quadrant supérieur gauche : scene1 et camera1
    renderer.setViewport(0, window.innerHeight / 2, window.innerWidth / 2, window.innerHeight / 2);
    renderer.setScissor(0, window.innerHeight / 2, window.innerWidth / 2, window.innerHeight / 2);
    renderer.render(scene, camera);

    // ---------------------
    // Quadrant supérieur droit : scene1 et camera2
    renderer.setViewport(window.innerWidth / 2, window.innerHeight / 2, window.innerWidth / 2, window.innerHeight / 2);
    renderer.setScissor(window.innerWidth / 2, window.innerHeight / 2, window.innerWidth / 2, window.innerHeight / 2);
    renderer.render(scene, camera);

    // ---------------------
    // Quadrant inférieur gauche : scene1 et camera3
    renderer.setViewport(0, 0, window.innerWidth / 2, window.innerHeight / 2);
    renderer.setScissor(0, 0, window.innerWidth / 2, window.innerHeight / 2);
    renderer.render(scene, camera_2);

    // ---------------------
    // Quadrant inférieur droit : scene1 et camera4
    renderer.setViewport(window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight / 2);
    renderer.setScissor(window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight / 2);
    renderer.render(scene, camera_map);
   
  }
  else if (statusWolrd === "runsplit4") {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    camera_2.aspect = window.innerWidth / window.innerHeight;
    camera_2.updateProjectionMatrix();

    // Taille du renderer et activation du scissor test
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setScissorTest(true);

    gameRun_2(); // Run the game

    // ---------------------
    // Quadrant supérieur gauche : scene1 et camera1
    renderer.setViewport(0, window.innerHeight / 2, window.innerWidth / 2, window.innerHeight / 2);
    renderer.setScissor(0, window.innerHeight / 2, window.innerWidth / 2, window.innerHeight / 2);
    renderer.render(scene, camera);

    // ---------------------
    // Quadrant supérieur droit : scene1 et camera2
    renderer.setViewport(window.innerWidth / 2, window.innerHeight / 2, window.innerWidth / 2, window.innerHeight / 2);
    renderer.setScissor(window.innerWidth / 2, window.innerHeight / 2, window.innerWidth / 2, window.innerHeight / 2);
    renderer.render(scene, camera);

    // ---------------------
    // Quadrant inférieur gauche : scene1 et camera3
    renderer.setViewport(0, 0, window.innerWidth / 2, window.innerHeight / 2);
    renderer.setScissor(0, 0, window.innerWidth / 2, window.innerHeight / 2);
    renderer.render(scene, camera_2);

    // ---------------------
    // Quadrant inférieur droit : scene1 et camera4
    renderer.setViewport(window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight / 2);
    renderer.setScissor(window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight / 2);
    renderer.render(scene, camera_2);
   
  }
  
}
animate();

// === Ajustement lors du redimensionnement de la fenêtre ===
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
