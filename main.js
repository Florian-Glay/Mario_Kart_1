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
  if (ai.finished) {
    ai.body.velocity.set(0, 0, 0);
    ai.body.angularVelocity.set(0, 0, 0);
    return;
  }
  
  // Axe "avant" (axe local -Z)
  const forward = new THREE.Vector3(0, 0, -1)
    .applyQuaternion(ai.mesh.quaternion)
    .setY(0)
    .normalize();
  
  // Distance de capteur pour la vérification : 150 unités
  const sensorDistance = 150;
  
  // Vecteurs latéraux par rapport à forward
  const leftVector = new THREE.Vector3(-forward.z, 0, forward.x).normalize();
  const rightVector = leftVector.clone().negate();
  
  // Par défaut, le kart souhaite avancer tout droit
  let targetDir = forward.clone();
  
  // Vérification de la surface de test (déjà présente dans votre code précédent)
  // (On conserve ici la logique existante pour déterminer targetDir en fonction de la présence de road)
  const frontSensor = ai.mesh.position.clone().add(forward.clone().multiplyScalar(sensorDistance));
  const leftSensor = ai.mesh.position.clone().add(leftVector.clone().multiplyScalar(sensorDistance));
  const rightSensor = ai.mesh.position.clone().add(rightVector.clone().multiplyScalar(sensorDistance));
  
  if (!isCarOnTerrain("road", { position: frontSensor })) {
    const leftOnRoad = isCarOnTerrain("road", { position: leftSensor });
    const rightOnRoad = isCarOnTerrain("road", { position: rightSensor });
    if (!leftOnRoad && rightOnRoad) {
      targetDir.add(rightVector.clone().multiplyScalar(0.8));
    } else if (!rightOnRoad && leftOnRoad) {
      targetDir.add(leftVector.clone().multiplyScalar(0.8));
    } else if (!leftOnRoad && !rightOnRoad) {
      let leftScore = evaluateRoadCoverage(ai, leftVector);
      let rightScore = evaluateRoadCoverage(ai, rightVector);
      if (rightScore > leftScore) {
        targetDir.add(rightVector.clone().multiplyScalar(0.3));
      } else {
        targetDir.add(leftVector.clone().multiplyScalar(0.3));
      }
    }
  } else {
    if (!isCarOnTerrain("road", { position: leftSensor })) {
      targetDir.add(rightVector.clone().multiplyScalar(0.2));
    }
    if (!isCarOnTerrain("road", { position: rightSensor })) {
      targetDir.add(leftVector.clone().multiplyScalar(0.2));
    }
  }
  
  // Vérification d'obstacles sur 150 unités devant
  const obstacle = checkObstacleAhead(ai, sensorDistance);
  if (obstacle) {
    const toObs = obstacle.mesh.position.clone().sub(ai.mesh.position).setY(0);
    if (forward.dot(toObs.normalize()) > 0.9) {
      if (leftVector.dot(toObs) > 0) {
        targetDir.add(rightVector.clone().multiplyScalar(0.5));
      } else {
        targetDir.add(leftVector.clone().multiplyScalar(0.5));
      }
    } else {
      targetDir.sub(toObs.normalize().multiplyScalar(0.5));
    }
  }
  
  targetDir.normalize();
  
  // Calcul de la différence d'angle entre forward et targetDir
  const angleDiff = forward.angleTo(targetDir);
  const cross = new THREE.Vector3().crossVectors(forward, targetDir);
  const sign = (cross.y >= 0 ? 1 : -1);
  
  // --- Gestion du drift ---
  // On définit un seuil de rotation pour considérer qu'un drift est engagé
  const driftThreshold = 0.1; // en radians
  // Base angular velocity désirée
  let desiredAngular = sign * 0.9 * level_cube * angleDiff;
  const smoothing = 0.1;
  
  // Initialiser les timers si non définis
  if (ai.driftTimer === undefined) ai.driftTimer = 0;
  if (ai.boostTimer === undefined) ai.boostTimer = 0;
  
  if (Math.abs(desiredAngular) > driftThreshold) {
    // La voiture est en train de tourner suffisamment pour être en drift
    ai.driftTimer += deltaTime;
    // Appliquer un multiplicateur de drift : 1.2 fois plus de rotation
    desiredAngular *= 1.5;
    // Spawn de particules : bleu si drift < 1s, orange sinon
    let particleColor = (ai.driftTimer < 1) ? 0x00aaff : 0xff8800;
    spawnDriftParticleIa(ai.mesh, sign > 0 ? "left" : "right", particleColor);
  } else {
    // Le drift est terminé
    if (ai.driftTimer >= 1) {
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
    const cpSensor = ai.mesh.position.clone().add(forward.clone().multiplyScalar(sensorDistance));
    if (isCarOnTerrain(cpName, { position: cpSensor })) {
      ai.tasksCompleted[cpName] = true;
      console.log("Step", cpName, "validé");
    }
  }
  if (ai.checkpoints.every(cp => ai.tasksCompleted[cp])) {
    console.log("Tour terminé par l'IA");
    ai.finished = true;
  }
}