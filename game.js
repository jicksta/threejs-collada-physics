function PhysicsEngine(options) {
  var self = this;

  self.worker = new Worker("physics.js");
  self.worker.addEventListener("message", function() {
    self._messageReceived.apply(self, arguments);
  });
  self._send("init", {ammo: "/lib/ammo.36200f52b3383deba7f3a4d7f57ac5870d0e1895.js"});
  self.state = null;
  self.ontick = options.ontick;
}

PhysicsEngine.prototype._send = function(action, payload) {
  this.worker.postMessage({action: action, payload: payload});
};

PhysicsEngine.prototype._messageReceived = function(e) {
  if (e.data.action == "debug") {
    console.debug("(WORKER)", e.data.payload);
  } else if (e.data.action === "tick") {
    this.state = e.data.payload;
    if (typeof this.ontick === "function") this.ontick();
  }
};

PhysicsEngine.prototype.buildTriangleMesh = function(triangles) {
  this._send("buildTriangleMesh", {triangles: triangles});
};

PhysicsEngine.prototype.update = function(state) {
  this.state = null;
  this._send("update", state);
};

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////


var WIDTH = document.body.clientWidth,
    HEIGHT = document.body.clientHeight;

var domElement = document.getElementById("container");

var scene = new THREE.Scene;

var camera = createCamera();
var physics = setupPhysics();

setupLighting();
setupControls();

var renderer = createRenderer();

loadCollada("models/building.dae", 0.002, function() {
  physics.update(viewState());
});

// Drop cubes onto the collada meshes
for (var i = 0; i < 25; i++) {
//  setTimeout(createCubeExperiment, 500 * i);
}

// The physics engine was created with an ontick callback that automatically calls requestAnimationFrame with render.
function render() {
  updatePhysicalMeshes();
  moveCamera();
  renderer.render(scene, camera);
  physics.update(viewState());
}

function createCamera() {
  var camera = new THREE.PerspectiveCamera(camera, WIDTH / HEIGHT, 0.1, 20000);
  camera.position.set(-10, 1, 0);
  scene.add(camera);
  return camera;
}

function setupPhysics() {
  var engine = new PhysicsEngine({
    ontick: function() {
      requestAnimationFrame(render);
    }
  });
  return engine;

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

    recursivelyPhysicalizeMeshes(collada.scene);
    function recursivelyPhysicalizeMeshes(obj) {
      if ("geometry" in obj) {
        // We use this array to create the triangles with actual vectors instead of indices
        var physicalMeshVertices = [];
        obj.geometry.vertices.forEach(function(meshVertex) {
          // Have to find the absolute position of each vertex irrespective of their parents' transformations.
          var worldVertex = obj.matrixWorld.multiplyVector3(meshVertex.position.clone());
          var physicalVertex = [worldVertex.x * scale, worldVertex.y * scale, worldVertex.z * scale];
          physicalMeshVertices.push(physicalVertex);
        });

        var triangles = [];
        obj.geometry.faces.forEach(function(face) {
          if (face instanceof THREE.Face3) {
            triangles.push({
              a: physicalMeshVertices[face.a],
              b: physicalMeshVertices[face.b],
              c: physicalMeshVertices[face.c]
            });
          } else if (face instanceof THREE.Face4) {
            // Must convert a four-vertex face into two three-vertex faces.
            triangles.push({
              a: physicalMeshVertices[face.a],
              b: physicalMeshVertices[face.b],
              c: physicalMeshVertices[face.d]
            });
            triangles.push({
              a: physicalMeshVertices[face.b],
              b: physicalMeshVertices[face.c],
              c: physicalMeshVertices[face.d]
            });
          }
        });
        physics.buildTriangleMesh(triangles);
      }
      obj.children.forEach(recursivelyPhysicalizeMeshes);
    }

    callback();
  });
}

function viewState() {
  var movement = {rotation: camera.rotation.y};

  var left, forward, right, backward;
  if (37 in ACTIVE_KEYS) left = true;
  if (38 in ACTIVE_KEYS) forward = true;
  if (39 in ACTIVE_KEYS) right = true;
  if (40 in ACTIVE_KEYS) backward = true;

  if (right) {
    camera.rotation.y -= 0.07;
  } else if (left) {
    camera.rotation.y += 0.07;
  } else if (forward || backward) {
    var movementSpeeds = forward ? -8 : 6;
    var cameraRotation = new THREE.Matrix4().extractRotation(camera.matrixWorld);
    var velocityVector = new THREE.Vector3(0, 0, movementSpeeds);
    cameraRotation.multiplyVector3(velocityVector);

    movement.vector = {x: velocityVector.x, y: velocityVector.y, z: velocityVector.z};
  }

  return movement;
}

function updatePhysicalMeshes() {
  return;
  physicsState.rigidBodies.forEach(function(rigidBody) {
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
  var position = physics.state.agent;
  camera.position.set(position.x, position.y, position.z);
}
