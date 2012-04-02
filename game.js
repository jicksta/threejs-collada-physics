var WIDTH = document.body.clientWidth,
    HEIGHT = document.body.clientHeight;

var domElement = document.getElementById("container");

var scene = new THREE.Scene;

var camera = createCamera();
var physics = setupPhysics();
var player = setupPlayer();

setupLighting();

var renderer = createRenderer();

//// Choose one of these to uncomment. Each one is a different test. Note: the scale is different between them.
// loadCollada("models/box.dae", 0.02, render);
// loadCollada("models/box-shaped.dae", 0.02, render);
// loadCollada("models/many-meshes.dae", 0.02, render);
loadCollada("models/building.dae", 0.002, delayRenderFn(500));

//Drop cubes onto the collada meshes

for (var i = 0; i < 25; i++) {
  setTimeout(createCubeExperiment, 500 * i);
}

function render() {
  requestAnimationFrame(render);
  physics.stepSimulation(1 / 60, 5);
  updatePhysicalMeshes();
  moveCamera();
  renderer.render(scene, camera);
}

// This is useful for passing the returned function as a callback that will start the render loop at a certain number
// of milliseconds in the future. This might be useful or even necessary if you depend on physics immediately.
// Browsers tend to be briefly laggy immediately after page load while it JITs all the JavaScript. Collision
// detection may fail during this laggy period if the lag lasts longer than the time it takes the object to fall/move
// through another.
function delayRenderFn(ms) {
  return function() {
    setTimeout(render, ms);
  }
}

function createCamera() {
  var camera = new THREE.PerspectiveCamera(camera, WIDTH / HEIGHT, 1, 20000);
  camera.position.set(-10, 1, 0);
  scene.add(camera);
  return camera;
}

function setupPhysics() {
  var collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
  var dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
  var overlappingPairCache = new Ammo.btDbvtBroadphase();
  var solver = new Ammo.btSequentialImpulseConstraintSolver();
  var ammoWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
  ammoWorld.setGravity(new Ammo.btVector3(0, -9.8, 0));


  var groundShape = new Ammo.btBoxShape(new Ammo.btVector3(25, 1, 25)); // Create block 50x2x50
  var groundTransform = new Ammo.btTransform();
  groundTransform.setIdentity();
  groundTransform.setOrigin(new Ammo.btVector3(0, -1, 0)); // Set initial position

  var groundMass = 0; // Mass of 0 means ground won't move from gravity or collisions
  var localInertia = new Ammo.btVector3(0, 0, 0);
  var motionState = new Ammo.btDefaultMotionState(groundTransform);
  var rbInfo = new Ammo.btRigidBodyConstructionInfo(groundMass, motionState, groundShape, localInertia);
  var groundAmmo = new Ammo.btRigidBody(rbInfo);
  ammoWorld.addRigidBody(groundAmmo);

  ammoWorld.rigidBodies = [];

  return ammoWorld;
}

function setupLighting() {
  var light = new THREE.PointLight(0x0020BB, 10, 50);
  light.position.set(5, 5, 5);
  scene.add(light);
}

function createCubeExperiment() {
  var width = 1, height = 1, depth = 1;
  var mass = width * height * depth;
  var cubeMesh, cubePhysical;

  cubeMesh = new THREE.Mesh(
      new THREE.CubeGeometry(width, height, depth),
      new THREE.MeshLambertMaterial({color: 0xFFFFFF})
  );
  cubeMesh.useQuaternion = true; // Bullet uses Quaternions
  scene.add(cubeMesh);

  var startTransform = new Ammo.btTransform();
  startTransform.setIdentity();
  startTransform.setOrigin(new Ammo.btVector3(0, 20, 0)); // Set initial position

  var localInertia = new Ammo.btVector3(0, 0, 0);

  var boxShape = new Ammo.btBoxShape(new Ammo.btVector3(0.5, 0.5, 0.5));
  boxShape.calculateLocalInertia(mass, localInertia);

  var motionState = new Ammo.btDefaultMotionState(startTransform);
  var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, boxShape, localInertia);
  cubePhysical = new Ammo.btRigidBody(rbInfo);
  physics.addRigidBody(cubePhysical);

  cubePhysical.mesh = cubeMesh;
  physics.rigidBodies.push(cubePhysical);
}

function createRenderer() {
  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize(WIDTH, HEIGHT);
  domElement.appendChild(renderer.domElement);
  return renderer;
}

function loadCollada(file, scale, callback) {
  var loader = new THREE.ColladaLoader();
  loader.options.convertUpAxis = true;
  loader.load(file, function(collada) {
    collada.scene.scale.set(scale, scale, scale);
    collada.scene.updateMatrix();
    scene.add(collada.scene);

    recursivelyImportMeshes(collada.scene);
    function recursivelyImportMeshes(obj) {
      if ("geometry" in obj) {
        var skin = {vertices: [], indices: []};

        obj.geometry.vertices.forEach(function(meshVertex) {
          // Have to find the absolute position of each vertex irrespective of their parents' transformations.
          var worldVertex = obj.matrixWorld.multiplyVector3(meshVertex.position.clone());
//          var physicalVert = new Vector3D(worldVertex.x, worldVertex.y, worldVertex.z, 0).scaleBy(scale);
//          skin.vertices.push(physicalVert);
        });
        obj.geometry.faces.forEach(function(face) {
          if (face instanceof THREE.Face3) {
            skin.indices.push({i0: face.a, i1: face.b, i2: face.c});
          } else if (face instanceof THREE.Face4) {
            // Must convert a four-vertex face into two three-vertex faces.
            skin.indices.push({i0: face.a, i1: face.b, i2: face.d});
            skin.indices.push({i0: face.b, i1: face.c, i2: face.d});
          }
        });

//        var position = new Vector3D(obj.position.x, obj.position.y, obj.position.z, 0);
//        var rotation = new jiglib.Matrix3D;
//        obj.rigidBody = new jiglib.JTriangleMesh(skin, position, rotation, 200, 5);
//        obj.rigidBody.set_friction(1);
//        physics.addBody(obj.rigidBody);
//        physics.rigidBodies.push({body: obj.rigidBody, mesh: obj});
      }
      obj.children.forEach(recursivelyImportMeshes);
    }

    callback();
  });
}

function updatePhysicalMeshes() {
  physics.rigidBodies.forEach(function(rigidBody) {
    var origin, rotation, transform = new Ammo.btTransform();
    rigidBody.getMotionState().getWorldTransform(transform); // Retrieve box position & rotation from Ammo

    origin = transform.getOrigin();
    rigidBody.mesh.position.x = origin.x();
    rigidBody.mesh.position.y = origin.y();
    rigidBody.mesh.position.z = origin.z();

    rotation = transform.getRotation();
    rigidBody.mesh.quaternion.x = rotation.x();
    rigidBody.mesh.quaternion.y = rotation.y();
    rigidBody.mesh.quaternion.z = rotation.z();
    rigidBody.mesh.quaternion.w = rotation.w();
  });
}

function setupPlayer() {
  var playerMass = 100;
  var startTransform = new Ammo.btTransform();
  startTransform.setIdentity();
  startTransform.setOrigin(new Ammo.btVector3(0, 10, 0)); // Set initial position

  var localInertia = new Ammo.btVector3(0, 0, 0);

  var playerShape = new Ammo.btCapsuleShape(0.75, 1.5);
  playerShape.calculateLocalInertia(playerMass, localInertia);

  var motionState = new Ammo.btDefaultMotionState(startTransform);
  var rbInfo = new Ammo.btRigidBodyConstructionInfo(playerMass, motionState, playerShape, localInertia);
  var player = new Ammo.btRigidBody(rbInfo);
  player.setSleepingThresholds(0, 0);
  player.setAngularFactor(new Ammo.btVector3(0,0,0));
  physics.addRigidBody(player);

  setupControls();

  return player
}

var ACTIVE_KEYS = {};
function setupControls() {
  document.addEventListener('keydown', function(e) {
    ACTIVE_KEYS[e.which] = true;
  }, false);
  document.addEventListener('keyup', function(e) {
    delete ACTIVE_KEYS[e.which]
  }, false);
}


function moveCamera() {
  var playerState = new Ammo.btTransform();
  player.getMotionState().getWorldTransform(playerState); // Retrieve box position & rotation from Ammo

  // Update position
  var origin = playerState.getOrigin();
  camera.position.x = origin.x();
  camera.position.y = origin.y();
  camera.position.z = origin.z();

  if (39 in ACTIVE_KEYS) { // right
    camera.rotation.y -= 0.07;
  } else if (37 in ACTIVE_KEYS) { // left
    camera.rotation.y += 0.07;
  } else if ((38 in ACTIVE_KEYS) || (40 in ACTIVE_KEYS)) { // forward & back
    var movingForward = 38 in ACTIVE_KEYS;
    var movementSpeeds = movingForward ? -4 : 3
    var cameraRotation = new THREE.Matrix4().extractRotation(camera.matrixWorld);
    var velocityVector = new THREE.Vector3(0, 0, movementSpeeds);
    cameraRotation.multiplyVector3(velocityVector);

    player.setLinearVelocity(new Ammo.btVector3(velocityVector.x, velocityVector.y, velocityVector.z));
    // TODO: Set the rotation of the capsule from the camera rotation?
  }
}
