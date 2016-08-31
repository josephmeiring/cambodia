"use strict";

/* 
globals window,THREE 
*/


var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 2000 );
var EARTH_RADIUS = 1000;
var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
document.getElementById('globe').appendChild(renderer.domElement);


var controls = new THREE.OrbitControls( camera );
controls.enableDamping = true;
controls.dampingFactor = 0.5;
controls.zoomSpeed = 0.15;
controls.rotateSpeed = 0.25;
controls.minDistance = EARTH_RADIUS * 1.1;
controls.maxDistance = EARTH_RADIUS * 2;

// controls.update();
controls.addEventListener( 'change', render );


var geometry = new THREE.SphereGeometry(EARTH_RADIUS, 50, 50);
var material  = new THREE.MeshPhongMaterial();
material.map    = THREE.ImageUtils.loadTexture('images/3_no_ice_clouds_8k.jpg');
material.specularMap    = THREE.ImageUtils.loadTexture('images/elev_bump_4k.jpg');

var earth = new THREE.Mesh(geometry, material);
scene.add(earth);

var axisHelper = new THREE.AxisHelper( 100 );
scene.add( axisHelper );
// add lighting
scene.add(new THREE.AmbientLight(0xffffff));
// var light = new THREE.DirectionalLight(0xffffff, 1);
// light.position.set(0,3,5);
// scene.add(light);

// camera.position.set(30,0,10);
camera.position.z = EARTH_RADIUS * 1.1;
// camera.position.y = EARTH_RADIUS * 2;
// camera.position.x = EARTH_RADIUS * 2;
// camera.up.set( 0, 1, 0 );
//camera.position.set(5,5,10);
// camera.rotateX(-10 * Math.PI / 180)
// camera.rotateY(170 * Math.PI / 180)

// rotate above SE asia
var rot_earth_phi = 165 * Math.PI / 180,
    rot_earth_theta = -12 * Math.PI / 180;
earth.rotateY(rot_earth_phi)
earth.rotateX(rot_earth_theta)

//testing
// var circ_geom = new THREE.CircleGeometry(0.2, 32);
// var mat = new THREE.MeshBasicMaterial({color: 0xffff00, opacity: true});
// mat.side = THREE.DoubleSide;
// mat.opacity = 0.3;
// for (var i=0; i<10000; i++) {
//   var circle = new THREE.Mesh( circ_geom, mat );
//   var coords = random_lat_lon()
//   var vec = latlon2vector(coords[1], coords[0], EARTH_RADIUS, 0)

//   circle.position.set(vec.x, vec.y, vec.z);
//   // circle.rotation.x = rot_earth_theta;
//   // circle.rotation.y = rot_earth_phi;
//   earth.add(circle)
// }

d3.csv('data/positions.csv', function (d) {
  return {
    datetime_utc: new Date(d.datetime_utc),
    lat: +d.lat,
    lon: +d.lon
  }
}, function (data) {
  // data.forEach(function (d) {
  //   var circle = new THREE.Mesh( circ_geom, mat );
  //   var vec = latlon2vector(d.lat, d.lon, EARTH_RADIUS, 0)

  //   pc_geometry.vertices.push(vec);
  //   // circle.rotation.x = rot_earth_theta;
  //   // circle.rotation.y = rot_earth_phi;
  // })
  var group_by_date = d3.nest()
    .key(function (d) {return d.datetime_utc.toDateString()})
    .entries(data);
  console.log(group_by_date)

  group_by_date.forEach(function (group, i) {
    var pc_geometry = new THREE.Geometry();
    var pc_material = new THREE.PointsMaterial(
      {size: 0.2, color:0xff0000, transparent:true, opacity:0.8}
    );
    var particles = new THREE.Points( pc_geometry, pc_material);
    // particles.scale.x = 5.0;
    // particles.scale.y = 5.0;
    // particles.scale.z = 5.0;

    setTimeout( function () {
      group.values.forEach(function (d) {
          var vec = latlon2vector(d.lat, d.lon, EARTH_RADIUS, 0)
          pc_geometry.vertices.push(vec);
      })
      // console.log(group)
      earth.add(particles)

    },10 * i)
  })

})

for (var i=0; i<100; i++) {
  setTimeout(function () {console.log("hello")}, 1000)
}


// camera.lookAt(new THREE.Vector3(0, 0, 3000))


var render = function () {
    requestAnimationFrame(render);
    // controls.update()
    // earth.rotation.y += 0.001;
    // camera.lookAt(new THREE.Vector3(0,0,0));
    // camera.lookAt( scene.position );
    renderer.render(scene, camera);
};

render();

function latlon2vector (latitude, longitude, radius) {
 
  var phi = (latitude)*Math.PI/180;
  var theta = (longitude-180)*Math.PI/180;

  var x = -(radius+10) * Math.cos(phi) * Math.cos(theta);
  var y = (radius+10) * Math.sin(phi);
  var z = (radius+10) * Math.cos(phi) * Math.sin(theta);

  return new THREE.Vector3(x,y,z);
}

function random_lat_lon () {
  var min_lat = 9,
      max_lat = 15, 
      min_lon = 102, 
      max_lon = 108;

  return [Math.random() * (max_lon - min_lon) + min_lon, Math.random() * (max_lat - min_lat) + min_lat]
}


function grid2d(min_lon, lax_lon, min_lat, max_lat, dx, dy) {

  var self = this;

  this.grid = [];

  this.add


}