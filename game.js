var WIDTH = document.body.clientWidth,
    HEIGHT = document.body.clientHeight;

var domElement = document.getElementById("container");

var clock = new THREE.Clock;
var scene = new THREE.Scene;

var camera = createCamera();
var physics = setupPhysics();
//var firstPersonControls = createThreeJSFirstPersonControls();
var player = setupPlayer();

setupLighting();

var renderer = createRenderer();

//// Choose one of these to uncomment. Each one is a different test. Note: the scale is different between them.
// loadCollada("models/box.dae", 0.02, render);
// loadCollada("models/box-shaped.dae", 0.02, render);
// loadCollada("models/many-meshes.dae", 0.02, render);
loadCollada("models/building.dae", 0.002, delayRenderFn(500));

// Drop cubes onto the collada meshes
for (var i = 0; i < 25; i++) {
  setTimeout(createCubeExperiment, 1000 * i);
}

function render() {
  requestAnimationFrame(render);
  var timeDelta = clock.getDelta();
  physics.integrate(timeDelta);
//  firstPersonControls.update(timeDelta);
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
  camera.position.set(-4, 1, 0);
  scene.add(camera);
  return camera;
}

function setupPhysics() {
  physics = jiglib.PhysicsSystem.getInstance();
  physics.rigidBodies = [];
  physics.setCollisionSystem(true);
  physics.setSolverType("FAST");
  physics.setGravity(new Vector3D(0, -9.8, 0, 0));
  return physics;
}

function setupLighting() {
  var light = new THREE.PointLight(0x0020BB, 10, 50);
  light.position.set(5, 5, 5);
  scene.add(light);
}

function createCubeExperiment() {
  var width = 1, height = 1, depth = 1;
  var cubeMesh, cubePhysical;

  cubeMesh = new THREE.Mesh(
      new THREE.CubeGeometry(width, height, depth),
      new THREE.MeshLambertMaterial({color: 0xFFFFFF})
  );
  cubeMesh.position.y = 10;
  cubeMesh.matrixAutoUpdate = false;
  scene.add(cubeMesh);

  var physicalCube = new jiglib.JBox(null, width, height, depth);
  physicalCube.set_mass(1);
  physicalCube.set_friction(1);
  physicalCube.moveTo(new Vector3D(cubeMesh.position.x, cubeMesh.position.y, cubeMesh.position.z, 0));

  physics.addBody(physicalCube);
  physics.rigidBodies.push({body: physicalCube, mesh: cubeMesh});
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
          var physicalVert = new Vector3D(worldVertex.x, worldVertex.y, worldVertex.z, 0).scaleBy(scale);
          skin.vertices.push(physicalVert);
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

        var position = new Vector3D(obj.position.x, obj.position.y, obj.position.z, 0);
        var rotation = new jiglib.Matrix3D;
        obj.rigidBody = new jiglib.JTriangleMesh(skin, position, rotation, 200, 5);
        obj.rigidBody.set_friction(1);
        physics.addBody(obj.rigidBody);
        physics.rigidBodies.push({body: obj.rigidBody, mesh: obj});
      }
      obj.children.forEach(recursivelyImportMeshes);
    }

    callback();
  });
}

function updatePhysicalMeshes() {
  physics.rigidBodies.forEach(function(obj) {
    var currentState = obj.body.get_currentState();
    var currentPosition = currentState.position;
    var currentOrientation = currentState.orientation.get_rawData();

    var transformation = new THREE.Matrix4;
    transformation.setTranslation(currentPosition.x, currentPosition.y, currentPosition.z);
    var rotation = THREE.Matrix4.prototype.set.apply(new THREE.Matrix4, currentOrientation);
    transformation.multiplySelf(rotation);

    obj.mesh.matrix = transformation;
    obj.mesh.matrixWorldNeedsUpdate = true;
  });
}

function createThreeJSFirstPersonControls() {
  var controls = new THREE.FirstPersonControls(camera);
  controls.movementSpeed = 30;
  controls.lookSpeed = 0.125;
  return controls;
}

var activeKeys = {};

function setupPlayer() {
  // Create the JCapsule that will represent the player in the physics engine.

  var player = new jiglib.JSphere(null, 1);
  player.moveTo(new Vector3D(0, 20, 0, 0));
  player.set_mass(10);
  physics.addBody(player);

  document.addEventListener('keydown', function(e) {
    activeKeys[e.which] = true;
  }, false);
  document.addEventListener('keyup', function(e) {
    delete activeKeys[e.which]
  }, false);

  return player
}

function moveCamera() {

  camera.position.set(player.get_x(), player.get_y(), player.get_z());
  if (39 in activeKeys) { // right
    camera.rotation.y -= 0.1;
  } else if(37 in activeKeys) { // left
    camera.rotation.y += 0.1;
  } else if((38 in activeKeys) || (40 in activeKeys)) { // forward
    var matrix = new THREE.Matrix4;
    matrix.extractRotation(camera.matrixWorld);

    var forwardOrBackward = (38 in activeKeys) ? -1: 1;
    var direction = new THREE.Vector3(0, 0, forwardOrBackward);
    matrix.multiplyVector3(direction);

    player.applyWorldImpulse(new Vector3D(direction.x, direction.y, direction.z, 0), player.get_currentState().position);
  } else if(40 in activeKeys) { // back

  }
}
