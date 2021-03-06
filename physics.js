self.addEventListener('message', function(e) {
  AmmoWorker[e.data.action](e.data.payload)
}, false);

var ammoWorld, agent;

var AmmoWorker = {

  init: function(options) {
    importScripts(options.ammo);
    debug("Ammo loaded");
    this._initWorld();
    this._initAgent();
  },

  _initWorld: function() {
    var collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    var dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
    var overlappingPairCache = new Ammo.btDbvtBroadphase();
    var solver = new Ammo.btSequentialImpulseConstraintSolver();
    ammoWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
    ammoWorld.setGravity(new Ammo.btVector3(0, -9.8, 0));
  },

  _initAgent: function() {
    var agentMass = 100;
    var startTransform = new Ammo.btTransform();
    startTransform.setIdentity();
    startTransform.setOrigin(new Ammo.btVector3(0, 20, 0)); // Set initial position

    var localInertia = new Ammo.btVector3(0, 0, 0);

    var agentHeight = 0.4;
    var agentShape = new Ammo.btCapsuleShape(1, 0.5);
    agentShape.calculateLocalInertia(agentMass, localInertia);

    var motionState = new Ammo.btDefaultMotionState(startTransform);
    var rbInfo = new Ammo.btRigidBodyConstructionInfo(agentMass, motionState, agentShape, localInertia);
    agent = new Ammo.btRigidBody(rbInfo);
    agent.setFriction(1);
    agent.setSleepingThresholds(0, 0);
    agent.setAngularFactor(new Ammo.btVector3(0, 0, 0));

    agent.halfHeight = agentHeight;
    ammoWorld.addRigidBody(agent);
  },

  buildTriangleMesh: function(options) {
    var mesh = new Ammo.btTriangleMesh;
    options.triangles.forEach(function(triangle) {
      mesh.addTriangle(arrayToVector(triangle.a), arrayToVector(triangle.b), arrayToVector(triangle.c), true);
    });

    var shape = new Ammo.btBvhTriangleMeshShape(mesh, true, true);
    var transform = new Ammo.btTransform();
    transform.setIdentity();
    var rigidBody = new Ammo.btRigidBody(
        new Ammo.btRigidBodyConstructionInfo(
            0,
            new Ammo.btDefaultMotionState(transform),
            shape,
            new Ammo.btVector3(0, 0, 0)
        )
    );
    rigidBody.setFriction(1);
    ammoWorld.addRigidBody(rigidBody);
  },

  update: function(state) {
    updateAgent(state);
    ammoWorld.stepSimulation(state.timeDelta, 5);
    send("tick", {agent: agentState()});
  }

};

function updateAgent(movement) {
  if (movement.vector) {
    var yLinearVelocity = agent.getLinearVelocity().y();
    agent.setLinearVelocity(new Ammo.btVector3(movement.vector.x, yLinearVelocity, movement.vector.z));
  }
  // TODO: Set the rotation of the capsule from the camera rotation?
}

function agentState() {
  var agentState = {};

  var agentTransform = new Ammo.btTransform();
  agent.getMotionState().getWorldTransform(agentTransform);

  // Update position
  var origin = agentTransform.getOrigin();

  agentState.x = origin.x();
  agentState.y = origin.y() + agent.halfHeight;
  agentState.z = origin.z();

  return agentState;
}

function debug(something) {
  send("debug", something);
}

function send(action, payload) {
  self.postMessage({action: action, payload: payload});
}

function arrayToVector(array) {
  return new Ammo.btVector3(array[0], array[1], array[2]);
}

/*
function updatePhysicalMeshes() {
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
*/
