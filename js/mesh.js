
// var THREE = require('../components/three.js/build/three.js');
// var geotiff = require('../components/geotiff/src/geotiff.js');
var utils = require('./utils.js');
module.exports = mesh_view;

function mesh_view () {
  'use strict';

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 1000 );
  scene.add(camera);

  var light = new THREE.DirectionalLight( 0xffffff, 1.5 );
  var light2 = new THREE.AmbientLight( 0xffffff, 0.5);
  light.position.set( 1, 1, 3 ).normalize();
  scene.add(light);
  var renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize( window.innerWidth/2, window.innerHeight/2 );
  document.getElementById('globe').appendChild(renderer.domElement);
  

  var controls = new THREE.OrbitControls( camera );
  controls.enableDamping = true;
  controls.dampingFactor = 0.5;
  controls.zoomSpeed = 1;
  controls.rotateSpeed = 1;
  controls.minDistance = 10 * 1.1;
  controls.maxDistance = 1000 * 2;

  // controls.update();
  // controls.addEventListener( 'change', render );
  // var material  = new THREE.MeshPhongMaterial();

  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/images/test.tif', true);
  xhr.responseType = 'arraybuffer';
  xhr.onerror = function (e) {
    console.log(e)
  };
  xhr.onload = function(e) {
    var tiff = GeoTIFF.parse(this.response);
    console.log(tiff.getImage().getWidth());
    var terrain = utils.geotiff2array(tiff);
    console.log(terrain)

    var geom = new THREE.Geometry();
    var width = terrain[0].length - 1;
    var height = terrain.length - 1;
    var w = 3;
    var counter = 0;
    for(var i = 0; i < width; i++){
      for(var j = 0; j < height; j++){
      var faceIndexBace = counter * 6;
      var y = [
        terrain[j  ][i  ] * w / 3,
        terrain[j  ][i+1] * w / 3,
        terrain[j+1][i  ] * w / 3,
        terrain[j+1][i+1] * w / 3
      ];
      //square : triangle1 + triangle2
        // triangle1
        (function(){
          var v1 = new THREE.Vector3(      i * w, y[0],        (-1 * j) * w);
          var v2 = new THREE.Vector3((1 + i) * w, y[1],        (-1 * j) * w);
          var v3 = new THREE.Vector3(      i * w, y[2], (-1 + (-1 * j)) * w);
          if (counter % 100) console.log(v1, v2, v3)
          geom.vertices.push(v1);
          geom.vertices.push(v2);
          geom.vertices.push(v3);
          
          var face = new THREE.Face3( faceIndexBace , faceIndexBace + 1, faceIndexBace + 2 );
          face.normal = (function (){
            var vx = (v1.y - v3.y) * (v2.z - v3.z) - (v1.z - v3.z) * (v2.y - v3.y);
            var vy = (v1.z - v3.z) * (v2.x - v3.x) - (v1.x - v3.x) * (v2.z - v3.z);
            var vz = (v1.x - v3.x) * (v2.y - v3.y) - (v1.y - v3.y) * (v2.x - v3.x);
            var va = Math.sqrt( Math.pow(vx,2) +Math.pow(vy,2)+Math.pow(vz,2));
            return new THREE.Vector3( vx/va, vy/va, vz/va);
          })();
          geom.faces.push( face );
        })();
        
        // triangle2
        (function(){
          var v1 = new THREE.Vector3( (1 + i) * w, y[1],        (-1 * j) * w);
          var v2 = new THREE.Vector3( (1 + i) * w, y[3], (-1 + (-1 * j)) * w);
          var v3 = new THREE.Vector3(       i * w, y[2], (-1 + (-1 * j)) * w);
          geom.vertices.push(v1);
          geom.vertices.push(v2);
          geom.vertices.push(v3);
          
          var face = new THREE.Face3( faceIndexBace + 3, faceIndexBace + 4, faceIndexBace + 5 );
          face.normal = (function (){
            var vx = (v1.y - v3.y) * (v2.z - v3.z) - (v1.z - v3.z) * (v2.y - v3.y);
            var vy = (v1.z - v3.z) * (v2.x - v3.x) - (v1.x - v3.x) * (v2.z - v3.z);
            var vz = (v1.x - v3.x) * (v2.y - v3.y) - (v1.y - v3.y) * (v2.x - v3.x);
            var va = Math.sqrt( Math.pow(vx,2) +Math.pow(vy,2)+Math.pow(vz,2));
            return new THREE.Vector3( vx/va, vy/va, vz/va);
          })();
          geom.faces.push( face );
        })();
        
        
        counter++;
      }
    }
  
    var mesh= new THREE.Mesh(
      geom,
      //new THREE.MeshLambertMaterial( { color: 0xCCCCCC, shading: THREE.SmoothShading } )
      new THREE.MeshLambertMaterial( { color: 0xCCCCCC, shading: THREE.FlatShading } )
    );
    mesh.position.x = -1 * width / 2 * w;
    mesh.position.z = height / 2  * w;
    scene.add(mesh);

  };
  xhr.send();
  // console.log(material) 

  // d3.csv('data/positions.csv', function (d) {
  //   return {
  //     datetime_utc: new Date(d.datetime_utc),
  //     lat: +d.lat,
  //     lon: +d.lon
  //   }
  // }, function (data) {
   
  //   var group_by_date = d3.nest()
  //     .key(function (d) {return d.datetime_utc.toDateString()})
  //     .entries(data);

    
  //   function render_points (group) {
  //     var pc_geometry = new THREE.Geometry();
  //     var pc_material = new THREE.PointsMaterial(
  //       {size: 0.3, color:0xff0000, transparent:true, opacity:0.8}
  //     );
  //     var particles = new THREE.Points( pc_geometry, pc_material); 
  //     var vertical_marker_group = new THREE.Object3D();
  //     var circle_marker_group = new THREE.Object3D();

    
  //     group.values.forEach(function (d) {

  //       var vec = latlon2vector(d.lat, d.lon, EARTH_RADIUS, 0)
  //       pc_geometry.vertices.push(vec);
  //       var vm = new THREE.Mesh( vertical_marker_geom, vertical_marker_mesh );
  //       vm.position.set(vec.x, vec.y, vec.z - 5)
  //       vertical_marker_group.add(vm);

  //       var cm = new THREE.Mesh(circ_geom, circ_mat);
  //       cm.position.set(vec.x, vec.y, vec.z)
  //       circle_marker_group.add(cm)
  //     })
  //     // console.log(group)
  //     earth.add(particles)
  //     earth.add(vertical_marker_group)
  //     earth.add(circle_marker_group)

  //     return setTimeout( function () {
  //       earth.remove(vertical_marker_group);
  //       earth.remove(circle_marker_group);
  //     }, 20)
  //   }


  //   var num_dates = group_by_date.length;
  //   var loop_count = 0;
  //   function animation_loop () {
  //     setTimeout(function () {
  //       var group = group_by_date[loop_count];
  //       render_points(group);
  //       loop_count++;
  //       if (loop_count < num_dates) {
  //         animation_loop();
  //       }
  //     }, 20)
  //   }
  //   animation_loop();
  // })



  var render = function () {
      requestAnimationFrame(render);
      renderer.render(scene, camera);
  };

  render();
}

