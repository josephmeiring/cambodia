
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 2000 );
var EARTH_RADIUS = 100;
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.getElementById('globe').appendChild(renderer.domElement);


var controls = new THREE.OrbitControls( camera );
controls.addEventListener( 'change', render );
var geometry = new THREE.SphereGeometry(EARTH_RADIUS, 50, 50);
var material  = new THREE.MeshPhongMaterial()
material.map    = THREE.ImageUtils.loadTexture('images/3_no_ice_clouds_8k.jpg')
material.specularMap    = THREE.ImageUtils.loadTexture('images/elev_bump_4k.jpg')

var earth = new THREE.Mesh(geometry, material);
scene.add(earth);

// rotate above SE asia
earth.rotateY(170 * Math.PI / 180)
earth.rotateX(-10 * Math.PI / 180)

var geometry = new THREE.BoxGeometry( 10, 1, 1);
var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
var cube = new THREE.Mesh( geometry, material );
cube.position.set(1, 1, 100)
scene.add( cube );

// add lighting
scene.add(new THREE.AmbientLight(0x333333));
var light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5,3,5);
scene.add(light);

// camera.position.set(30,0,10);
camera.position.z = 200;
//camera.position.set(5,5,10);


function add_sphere(lat, lon) {
  var geometry = new THREE.SphereGeometry(1, 50, 50);
  var material  = new THREE.MeshPhongMaterial()
}


v = latlon2vector( 24, 40, EARTH_RADIUS)

var render = function () {
    requestAnimationFrame(render);

    // earth.rotation.y += 0.001;
    // camera.lookAt(new THREE.Vector3(0,0,0));
    // camera.lookAt( scene.position );
    renderer.render(scene, camera);
};

render();

function latlon2vector (lat, lon, radius) {

  var phi   = (90-lat)*(Math.PI/180),
  theta = (lon+180)*(Math.PI/180),
  x = -((radius) * Math.sin(phi)*Math.cos(theta)),
  z = ((radius) * Math.sin(phi)*Math.sin(theta)),
  y = ((radius) * Math.cos(phi));
  return new THREE.Vector3(x,y,z);
}