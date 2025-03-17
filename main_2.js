// app.js

// ---------------------------
// IMPORTS EXTERNES
// ---------------------------
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


// ---------------------------
// INITIALISATION DE LA SCÈNE (anciennement scene.js)
// ---------------------------
function initScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb); // Couleur de ciel

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 5, 10);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('game-container').appendChild(renderer.domElement);

  // Ajout des lumières
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 10, 5);
  scene.add(directionalLight);

  // Gestion du redimensionnement
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { scene, camera, renderer };
}


// ---------------------------
// INTERFACE UTILISATEUR (anciennement ui.js)
// ---------------------------
function initUI() {
  // Création du menu principal
  const menu = document.createElement('div');
  menu.id = 'menu';
  menu.innerHTML = `<button id="startButton">Commencer la course</button>`;
  document.body.appendChild(menu);

  document.getElementById('startButton').addEventListener('click', () => {
    menu.style.display = 'none';
    initHUD();
    // Vous pouvez déclencher ici le démarrage effectif de la course
  });
}

function initHUD() {
  // Création d'un HUD simple avec un compteur de tours et une indication de vitesse
  const hud = document.createElement('div');
  hud.id = 'hud';
  hud.innerHTML = `
    <div id="lapCounter">Tour : 0/3</div>
    <div id="speed">Vitesse : 0 km/h</div>
  `;
  document.body.appendChild(hud);
}


// ---------------------------
// GESTION AUDIO (anciennement audio.js)
// ---------------------------
function initAudio() {
  const audio = new Audio('assets/sounds/engine.mp3');
  audio.loop = true;
  audio.volume = 0.5;
  audio.play().catch((error) => {
    console.error("Erreur lors de la lecture de l'audio :", error);
  });
}


// ---------------------------
// GESTION DES ENTRÉES CLAVIER (anciennement controls.js)
// ---------------------------
class KeyboardController {
  constructor() {
    this.keys = {};
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  getInput() {
    return {
      forward: this.keys['ArrowUp'] || this.keys['KeyW'],
      backward: this.keys['ArrowDown'] || this.keys['KeyS'],
      left: this.keys['ArrowLeft'] || this.keys['KeyA'],
      right: this.keys['ArrowRight'] || this.keys['KeyD'],
    };
  }
}


// ---------------------------
// CLASSE DU KART (anciennement kart.js)
// ---------------------------
class Kart {
  constructor(modelUrl, initialPosition = new THREE.Vector3()) {
    this.modelUrl = modelUrl;
    this.position = initialPosition;
    this.velocity = new THREE.Vector3();
    this.acceleration = new THREE.Vector3();
    this.mesh = null;
    this.loadModel();
  }

  loadModel() {
    const loader = new GLTFLoader();
    loader.load(
      this.modelUrl,
      (gltf) => {
        this.mesh = gltf.scene;
        this.mesh.position.copy(this.position);
      },
      undefined,
      (error) => {
        console.error('Erreur lors du chargement du modèle:', error);
      }
    );
  }

  update(delta) {
    // Mise à jour de la position selon la vélocité
    if (this.mesh) {
      this.position.add(this.velocity.clone().multiplyScalar(delta));
      this.mesh.position.copy(this.position);
    }
  }

  applyInput(input) {
    // Exemple simple : modification de la vélocité selon l'entrée
    const accelerationForce = 5;
    if (input.forward) {
      this.acceleration.z = -accelerationForce;
    } else if (input.backward) {
      this.acceleration.z = accelerationForce;
    } else {
      this.acceleration.z = 0;
    }

    // Mise à jour simplifiée de la vitesse
    this.velocity.add(this.acceleration.clone().multiplyScalar(0.1));

    // À compléter : gestion de la rotation, dérapage, saut, etc.
  }
}


// ---------------------------
// INTELLIGENCE ARTIFICIELLE (anciennement ai.js)
// ---------------------------
class AIKart extends Kart {
  constructor(modelUrl, waypoints, initialPosition = new THREE.Vector3()) {
    super(modelUrl, initialPosition);
    this.waypoints = waypoints; // Tableau de positions THREE.Vector3
    this.currentWaypointIndex = 0;
  }

  update(delta) {
    if (this.mesh && this.waypoints.length > 0) {
      const target = this.waypoints[this.currentWaypointIndex];
      const direction = new THREE.Vector3().subVectors(target, this.position).normalize();
      // Mouvement basique vers le waypoint
      this.velocity.copy(direction.multiplyScalar(3));
      // Passage au waypoint suivant si le point est atteint
      if (this.position.distanceTo(target) < 1) {
        this.currentWaypointIndex = (this.currentWaypointIndex + 1) % this.waypoints.length;
      }
      super.update(delta);
    }
  }
}


// ---------------------------
// GESTION DES COLLISIONS (anciennement physics.js)
// ---------------------------
function checkCollision(object1, object2) {
  // Calculer la bounding box pour chaque objet
  object1.geometry.computeBoundingBox();
  object2.geometry.computeBoundingBox();

  const box1 = object1.geometry.boundingBox.clone().applyMatrix4(object1.matrixWorld);
  const box2 = object2.geometry.boundingBox.clone().applyMatrix4(object2.matrixWorld);

  return box1.intersectsBox(box2);
}


// ---------------------------
// BOUCLE DE JEU ET MISES À JOUR (anciennement game.js)
// ---------------------------
let lastTime = 0;
const keyboard = new KeyboardController();
const playerKart = new Kart('models/kart1.gltf');

function startGameLoop(scene, camera, renderer) {
  // Ajout du kart à la scène dès que le modèle est chargé
  function tryAddKart() {
    if (playerKart.mesh) {
      scene.add(playerKart.mesh);
    } else {
      setTimeout(tryAddKart, 100);
    }
  }
  tryAddKart();

  function animate(time) {
    const delta = (time - lastTime) / 1000;
    lastTime = time;

    // Récupérer l'état des touches et mettre à jour le kart
    const input = keyboard.getInput();
    playerKart.applyInput(input);
    playerKart.update(delta);

    // Ici, vous pouvez ajouter la mise à jour des adversaires, de la caméra, etc.

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}


// ---------------------------
// POINT D'ENTRÉE PRINCIPAL (anciennement main.js)
// ---------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Initialisation de la scène et des assets 3D
  const { scene, camera, renderer } = initScene();

  // Initialisation de l'interface utilisateur
  initUI();

  // Démarrer la musique d'ambiance (optionnel)
  initAudio();

  // Lancer la boucle de jeu
  startGameLoop(scene, camera, renderer);
});
