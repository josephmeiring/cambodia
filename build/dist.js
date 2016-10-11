(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// var THREE = require('../components/three.js/build/three.js');
var mesh_view = require('./mesh.js');

mesh_view();

},{"./mesh.js":2}],2:[function(require,module,exports){

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


},{"./utils.js":3}],3:[function(require,module,exports){
// var THREE = require('../components/three.js/build/three.js');

function latlon2vector (latitude, longitude, radius) {
 
  var phi = (latitude)*Math.PI/180;
  var theta = (longitude-180)*Math.PI/180;

  var x = -(radius+10) * Math.cos(phi) * Math.cos(theta);
  var y = (radius+10) * Math.sin(phi);
  var z = (radius+10) * Math.cos(phi) * Math.sin(theta);

  return new THREE.Vector3(x,y,z);
}

function geotiff2array(tiff) {
  var image, w, h, out = [];

  image = tiff.getImage();
  w = image.getWidth();
  h = image.getHeight();
  raster = image.readRasters()[0];
  for (var j=0, k=0; j<h; j++) {
    out.push([]);
    for (var i=0; i<w; i++) {
      out[j].push(raster[k]);
      k++;
    }
  }
  return out;
}

exports.latlon2vector = latlon2vector;
exports.geotiff2array = geotiff2array;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9pbmRleC5qcyIsImpzL21lc2guanMiLCJqcy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIHZhciBUSFJFRSA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudHMvdGhyZWUuanMvYnVpbGQvdGhyZWUuanMnKTtcbnZhciBtZXNoX3ZpZXcgPSByZXF1aXJlKCcuL21lc2guanMnKTtcblxubWVzaF92aWV3KCk7XG4iLCJcbi8vIHZhciBUSFJFRSA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudHMvdGhyZWUuanMvYnVpbGQvdGhyZWUuanMnKTtcbi8vIHZhciBnZW90aWZmID0gcmVxdWlyZSgnLi4vY29tcG9uZW50cy9nZW90aWZmL3NyYy9nZW90aWZmLmpzJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzLmpzJyk7XG5tb2R1bGUuZXhwb3J0cyA9IG1lc2hfdmlldztcblxuZnVuY3Rpb24gbWVzaF92aWV3ICgpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciBzY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xuICB2YXIgY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKCA0MCwgd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQsIDEsIDEwMDAgKTtcbiAgc2NlbmUuYWRkKGNhbWVyYSk7XG5cbiAgdmFyIGxpZ2h0ID0gbmV3IFRIUkVFLkRpcmVjdGlvbmFsTGlnaHQoIDB4ZmZmZmZmLCAxLjUgKTtcbiAgdmFyIGxpZ2h0MiA9IG5ldyBUSFJFRS5BbWJpZW50TGlnaHQoIDB4ZmZmZmZmLCAwLjUpO1xuICBsaWdodC5wb3NpdGlvbi5zZXQoIDEsIDEsIDMgKS5ub3JtYWxpemUoKTtcbiAgc2NlbmUuYWRkKGxpZ2h0KTtcbiAgdmFyIHJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoe2FudGlhbGlhczogdHJ1ZX0pO1xuICByZW5kZXJlci5zZXRTaXplKCB3aW5kb3cuaW5uZXJXaWR0aC8yLCB3aW5kb3cuaW5uZXJIZWlnaHQvMiApO1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2xvYmUnKS5hcHBlbmRDaGlsZChyZW5kZXJlci5kb21FbGVtZW50KTtcbiAgXG5cbiAgdmFyIGNvbnRyb2xzID0gbmV3IFRIUkVFLk9yYml0Q29udHJvbHMoIGNhbWVyYSApO1xuICBjb250cm9scy5lbmFibGVEYW1waW5nID0gdHJ1ZTtcbiAgY29udHJvbHMuZGFtcGluZ0ZhY3RvciA9IDAuNTtcbiAgY29udHJvbHMuem9vbVNwZWVkID0gMTtcbiAgY29udHJvbHMucm90YXRlU3BlZWQgPSAxO1xuICBjb250cm9scy5taW5EaXN0YW5jZSA9IDEwICogMS4xO1xuICBjb250cm9scy5tYXhEaXN0YW5jZSA9IDEwMDAgKiAyO1xuXG4gIC8vIGNvbnRyb2xzLnVwZGF0ZSgpO1xuICAvLyBjb250cm9scy5hZGRFdmVudExpc3RlbmVyKCAnY2hhbmdlJywgcmVuZGVyICk7XG4gIC8vIHZhciBtYXRlcmlhbCAgPSBuZXcgVEhSRUUuTWVzaFBob25nTWF0ZXJpYWwoKTtcblxuICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gIHhoci5vcGVuKCdHRVQnLCAnL2ltYWdlcy90ZXN0LnRpZicsIHRydWUpO1xuICB4aHIucmVzcG9uc2VUeXBlID0gJ2FycmF5YnVmZmVyJztcbiAgeGhyLm9uZXJyb3IgPSBmdW5jdGlvbiAoZSkge1xuICAgIGNvbnNvbGUubG9nKGUpXG4gIH07XG4gIHhoci5vbmxvYWQgPSBmdW5jdGlvbihlKSB7XG4gICAgdmFyIHRpZmYgPSBHZW9USUZGLnBhcnNlKHRoaXMucmVzcG9uc2UpO1xuICAgIGNvbnNvbGUubG9nKHRpZmYuZ2V0SW1hZ2UoKS5nZXRXaWR0aCgpKTtcbiAgICB2YXIgdGVycmFpbiA9IHV0aWxzLmdlb3RpZmYyYXJyYXkodGlmZik7XG4gICAgY29uc29sZS5sb2codGVycmFpbilcblxuICAgIHZhciBnZW9tID0gbmV3IFRIUkVFLkdlb21ldHJ5KCk7XG4gICAgdmFyIHdpZHRoID0gdGVycmFpblswXS5sZW5ndGggLSAxO1xuICAgIHZhciBoZWlnaHQgPSB0ZXJyYWluLmxlbmd0aCAtIDE7XG4gICAgdmFyIHcgPSAzO1xuICAgIHZhciBjb3VudGVyID0gMDtcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgd2lkdGg7IGkrKyl7XG4gICAgICBmb3IodmFyIGogPSAwOyBqIDwgaGVpZ2h0OyBqKyspe1xuICAgICAgdmFyIGZhY2VJbmRleEJhY2UgPSBjb3VudGVyICogNjtcbiAgICAgIHZhciB5ID0gW1xuICAgICAgICB0ZXJyYWluW2ogIF1baSAgXSAqIHcgLyAzLFxuICAgICAgICB0ZXJyYWluW2ogIF1baSsxXSAqIHcgLyAzLFxuICAgICAgICB0ZXJyYWluW2orMV1baSAgXSAqIHcgLyAzLFxuICAgICAgICB0ZXJyYWluW2orMV1baSsxXSAqIHcgLyAzXG4gICAgICBdO1xuICAgICAgLy9zcXVhcmUgOiB0cmlhbmdsZTEgKyB0cmlhbmdsZTJcbiAgICAgICAgLy8gdHJpYW5nbGUxXG4gICAgICAgIChmdW5jdGlvbigpe1xuICAgICAgICAgIHZhciB2MSA9IG5ldyBUSFJFRS5WZWN0b3IzKCAgICAgIGkgKiB3LCB5WzBdLCAgICAgICAgKC0xICogaikgKiB3KTtcbiAgICAgICAgICB2YXIgdjIgPSBuZXcgVEhSRUUuVmVjdG9yMygoMSArIGkpICogdywgeVsxXSwgICAgICAgICgtMSAqIGopICogdyk7XG4gICAgICAgICAgdmFyIHYzID0gbmV3IFRIUkVFLlZlY3RvcjMoICAgICAgaSAqIHcsIHlbMl0sICgtMSArICgtMSAqIGopKSAqIHcpO1xuICAgICAgICAgIGlmIChjb3VudGVyICUgMTAwKSBjb25zb2xlLmxvZyh2MSwgdjIsIHYzKVxuICAgICAgICAgIGdlb20udmVydGljZXMucHVzaCh2MSk7XG4gICAgICAgICAgZ2VvbS52ZXJ0aWNlcy5wdXNoKHYyKTtcbiAgICAgICAgICBnZW9tLnZlcnRpY2VzLnB1c2godjMpO1xuICAgICAgICAgIFxuICAgICAgICAgIHZhciBmYWNlID0gbmV3IFRIUkVFLkZhY2UzKCBmYWNlSW5kZXhCYWNlICwgZmFjZUluZGV4QmFjZSArIDEsIGZhY2VJbmRleEJhY2UgKyAyICk7XG4gICAgICAgICAgZmFjZS5ub3JtYWwgPSAoZnVuY3Rpb24gKCl7XG4gICAgICAgICAgICB2YXIgdnggPSAodjEueSAtIHYzLnkpICogKHYyLnogLSB2My56KSAtICh2MS56IC0gdjMueikgKiAodjIueSAtIHYzLnkpO1xuICAgICAgICAgICAgdmFyIHZ5ID0gKHYxLnogLSB2My56KSAqICh2Mi54IC0gdjMueCkgLSAodjEueCAtIHYzLngpICogKHYyLnogLSB2My56KTtcbiAgICAgICAgICAgIHZhciB2eiA9ICh2MS54IC0gdjMueCkgKiAodjIueSAtIHYzLnkpIC0gKHYxLnkgLSB2My55KSAqICh2Mi54IC0gdjMueCk7XG4gICAgICAgICAgICB2YXIgdmEgPSBNYXRoLnNxcnQoIE1hdGgucG93KHZ4LDIpICtNYXRoLnBvdyh2eSwyKStNYXRoLnBvdyh2eiwyKSk7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFRIUkVFLlZlY3RvcjMoIHZ4L3ZhLCB2eS92YSwgdnovdmEpO1xuICAgICAgICAgIH0pKCk7XG4gICAgICAgICAgZ2VvbS5mYWNlcy5wdXNoKCBmYWNlICk7XG4gICAgICAgIH0pKCk7XG4gICAgICAgIFxuICAgICAgICAvLyB0cmlhbmdsZTJcbiAgICAgICAgKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgdmFyIHYxID0gbmV3IFRIUkVFLlZlY3RvcjMoICgxICsgaSkgKiB3LCB5WzFdLCAgICAgICAgKC0xICogaikgKiB3KTtcbiAgICAgICAgICB2YXIgdjIgPSBuZXcgVEhSRUUuVmVjdG9yMyggKDEgKyBpKSAqIHcsIHlbM10sICgtMSArICgtMSAqIGopKSAqIHcpO1xuICAgICAgICAgIHZhciB2MyA9IG5ldyBUSFJFRS5WZWN0b3IzKCAgICAgICBpICogdywgeVsyXSwgKC0xICsgKC0xICogaikpICogdyk7XG4gICAgICAgICAgZ2VvbS52ZXJ0aWNlcy5wdXNoKHYxKTtcbiAgICAgICAgICBnZW9tLnZlcnRpY2VzLnB1c2godjIpO1xuICAgICAgICAgIGdlb20udmVydGljZXMucHVzaCh2Myk7XG4gICAgICAgICAgXG4gICAgICAgICAgdmFyIGZhY2UgPSBuZXcgVEhSRUUuRmFjZTMoIGZhY2VJbmRleEJhY2UgKyAzLCBmYWNlSW5kZXhCYWNlICsgNCwgZmFjZUluZGV4QmFjZSArIDUgKTtcbiAgICAgICAgICBmYWNlLm5vcm1hbCA9IChmdW5jdGlvbiAoKXtcbiAgICAgICAgICAgIHZhciB2eCA9ICh2MS55IC0gdjMueSkgKiAodjIueiAtIHYzLnopIC0gKHYxLnogLSB2My56KSAqICh2Mi55IC0gdjMueSk7XG4gICAgICAgICAgICB2YXIgdnkgPSAodjEueiAtIHYzLnopICogKHYyLnggLSB2My54KSAtICh2MS54IC0gdjMueCkgKiAodjIueiAtIHYzLnopO1xuICAgICAgICAgICAgdmFyIHZ6ID0gKHYxLnggLSB2My54KSAqICh2Mi55IC0gdjMueSkgLSAodjEueSAtIHYzLnkpICogKHYyLnggLSB2My54KTtcbiAgICAgICAgICAgIHZhciB2YSA9IE1hdGguc3FydCggTWF0aC5wb3codngsMikgK01hdGgucG93KHZ5LDIpK01hdGgucG93KHZ6LDIpKTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgVEhSRUUuVmVjdG9yMyggdngvdmEsIHZ5L3ZhLCB2ei92YSk7XG4gICAgICAgICAgfSkoKTtcbiAgICAgICAgICBnZW9tLmZhY2VzLnB1c2goIGZhY2UgKTtcbiAgICAgICAgfSkoKTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBjb3VudGVyKys7XG4gICAgICB9XG4gICAgfVxuICBcbiAgICB2YXIgbWVzaD0gbmV3IFRIUkVFLk1lc2goXG4gICAgICBnZW9tLFxuICAgICAgLy9uZXcgVEhSRUUuTWVzaExhbWJlcnRNYXRlcmlhbCggeyBjb2xvcjogMHhDQ0NDQ0MsIHNoYWRpbmc6IFRIUkVFLlNtb290aFNoYWRpbmcgfSApXG4gICAgICBuZXcgVEhSRUUuTWVzaExhbWJlcnRNYXRlcmlhbCggeyBjb2xvcjogMHhDQ0NDQ0MsIHNoYWRpbmc6IFRIUkVFLkZsYXRTaGFkaW5nIH0gKVxuICAgICk7XG4gICAgbWVzaC5wb3NpdGlvbi54ID0gLTEgKiB3aWR0aCAvIDIgKiB3O1xuICAgIG1lc2gucG9zaXRpb24ueiA9IGhlaWdodCAvIDIgICogdztcbiAgICBzY2VuZS5hZGQobWVzaCk7XG5cbiAgfTtcbiAgeGhyLnNlbmQoKTtcbiAgLy8gY29uc29sZS5sb2cobWF0ZXJpYWwpIFxuXG4gIC8vIGQzLmNzdignZGF0YS9wb3NpdGlvbnMuY3N2JywgZnVuY3Rpb24gKGQpIHtcbiAgLy8gICByZXR1cm4ge1xuICAvLyAgICAgZGF0ZXRpbWVfdXRjOiBuZXcgRGF0ZShkLmRhdGV0aW1lX3V0YyksXG4gIC8vICAgICBsYXQ6ICtkLmxhdCxcbiAgLy8gICAgIGxvbjogK2QubG9uXG4gIC8vICAgfVxuICAvLyB9LCBmdW5jdGlvbiAoZGF0YSkge1xuICAgXG4gIC8vICAgdmFyIGdyb3VwX2J5X2RhdGUgPSBkMy5uZXN0KClcbiAgLy8gICAgIC5rZXkoZnVuY3Rpb24gKGQpIHtyZXR1cm4gZC5kYXRldGltZV91dGMudG9EYXRlU3RyaW5nKCl9KVxuICAvLyAgICAgLmVudHJpZXMoZGF0YSk7XG5cbiAgICBcbiAgLy8gICBmdW5jdGlvbiByZW5kZXJfcG9pbnRzIChncm91cCkge1xuICAvLyAgICAgdmFyIHBjX2dlb21ldHJ5ID0gbmV3IFRIUkVFLkdlb21ldHJ5KCk7XG4gIC8vICAgICB2YXIgcGNfbWF0ZXJpYWwgPSBuZXcgVEhSRUUuUG9pbnRzTWF0ZXJpYWwoXG4gIC8vICAgICAgIHtzaXplOiAwLjMsIGNvbG9yOjB4ZmYwMDAwLCB0cmFuc3BhcmVudDp0cnVlLCBvcGFjaXR5OjAuOH1cbiAgLy8gICAgICk7XG4gIC8vICAgICB2YXIgcGFydGljbGVzID0gbmV3IFRIUkVFLlBvaW50cyggcGNfZ2VvbWV0cnksIHBjX21hdGVyaWFsKTsgXG4gIC8vICAgICB2YXIgdmVydGljYWxfbWFya2VyX2dyb3VwID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XG4gIC8vICAgICB2YXIgY2lyY2xlX21hcmtlcl9ncm91cCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xuXG4gICAgXG4gIC8vICAgICBncm91cC52YWx1ZXMuZm9yRWFjaChmdW5jdGlvbiAoZCkge1xuXG4gIC8vICAgICAgIHZhciB2ZWMgPSBsYXRsb24ydmVjdG9yKGQubGF0LCBkLmxvbiwgRUFSVEhfUkFESVVTLCAwKVxuICAvLyAgICAgICBwY19nZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKHZlYyk7XG4gIC8vICAgICAgIHZhciB2bSA9IG5ldyBUSFJFRS5NZXNoKCB2ZXJ0aWNhbF9tYXJrZXJfZ2VvbSwgdmVydGljYWxfbWFya2VyX21lc2ggKTtcbiAgLy8gICAgICAgdm0ucG9zaXRpb24uc2V0KHZlYy54LCB2ZWMueSwgdmVjLnogLSA1KVxuICAvLyAgICAgICB2ZXJ0aWNhbF9tYXJrZXJfZ3JvdXAuYWRkKHZtKTtcblxuICAvLyAgICAgICB2YXIgY20gPSBuZXcgVEhSRUUuTWVzaChjaXJjX2dlb20sIGNpcmNfbWF0KTtcbiAgLy8gICAgICAgY20ucG9zaXRpb24uc2V0KHZlYy54LCB2ZWMueSwgdmVjLnopXG4gIC8vICAgICAgIGNpcmNsZV9tYXJrZXJfZ3JvdXAuYWRkKGNtKVxuICAvLyAgICAgfSlcbiAgLy8gICAgIC8vIGNvbnNvbGUubG9nKGdyb3VwKVxuICAvLyAgICAgZWFydGguYWRkKHBhcnRpY2xlcylcbiAgLy8gICAgIGVhcnRoLmFkZCh2ZXJ0aWNhbF9tYXJrZXJfZ3JvdXApXG4gIC8vICAgICBlYXJ0aC5hZGQoY2lyY2xlX21hcmtlcl9ncm91cClcblxuICAvLyAgICAgcmV0dXJuIHNldFRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcbiAgLy8gICAgICAgZWFydGgucmVtb3ZlKHZlcnRpY2FsX21hcmtlcl9ncm91cCk7XG4gIC8vICAgICAgIGVhcnRoLnJlbW92ZShjaXJjbGVfbWFya2VyX2dyb3VwKTtcbiAgLy8gICAgIH0sIDIwKVxuICAvLyAgIH1cblxuXG4gIC8vICAgdmFyIG51bV9kYXRlcyA9IGdyb3VwX2J5X2RhdGUubGVuZ3RoO1xuICAvLyAgIHZhciBsb29wX2NvdW50ID0gMDtcbiAgLy8gICBmdW5jdGlvbiBhbmltYXRpb25fbG9vcCAoKSB7XG4gIC8vICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgLy8gICAgICAgdmFyIGdyb3VwID0gZ3JvdXBfYnlfZGF0ZVtsb29wX2NvdW50XTtcbiAgLy8gICAgICAgcmVuZGVyX3BvaW50cyhncm91cCk7XG4gIC8vICAgICAgIGxvb3BfY291bnQrKztcbiAgLy8gICAgICAgaWYgKGxvb3BfY291bnQgPCBudW1fZGF0ZXMpIHtcbiAgLy8gICAgICAgICBhbmltYXRpb25fbG9vcCgpO1xuICAvLyAgICAgICB9XG4gIC8vICAgICB9LCAyMClcbiAgLy8gICB9XG4gIC8vICAgYW5pbWF0aW9uX2xvb3AoKTtcbiAgLy8gfSlcblxuXG5cbiAgdmFyIHJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXIpO1xuICAgICAgcmVuZGVyZXIucmVuZGVyKHNjZW5lLCBjYW1lcmEpO1xuICB9O1xuXG4gIHJlbmRlcigpO1xufVxuXG4iLCIvLyB2YXIgVEhSRUUgPSByZXF1aXJlKCcuLi9jb21wb25lbnRzL3RocmVlLmpzL2J1aWxkL3RocmVlLmpzJyk7XG5cbmZ1bmN0aW9uIGxhdGxvbjJ2ZWN0b3IgKGxhdGl0dWRlLCBsb25naXR1ZGUsIHJhZGl1cykge1xuIFxuICB2YXIgcGhpID0gKGxhdGl0dWRlKSpNYXRoLlBJLzE4MDtcbiAgdmFyIHRoZXRhID0gKGxvbmdpdHVkZS0xODApKk1hdGguUEkvMTgwO1xuXG4gIHZhciB4ID0gLShyYWRpdXMrMTApICogTWF0aC5jb3MocGhpKSAqIE1hdGguY29zKHRoZXRhKTtcbiAgdmFyIHkgPSAocmFkaXVzKzEwKSAqIE1hdGguc2luKHBoaSk7XG4gIHZhciB6ID0gKHJhZGl1cysxMCkgKiBNYXRoLmNvcyhwaGkpICogTWF0aC5zaW4odGhldGEpO1xuXG4gIHJldHVybiBuZXcgVEhSRUUuVmVjdG9yMyh4LHkseik7XG59XG5cbmZ1bmN0aW9uIGdlb3RpZmYyYXJyYXkodGlmZikge1xuICB2YXIgaW1hZ2UsIHcsIGgsIG91dCA9IFtdO1xuXG4gIGltYWdlID0gdGlmZi5nZXRJbWFnZSgpO1xuICB3ID0gaW1hZ2UuZ2V0V2lkdGgoKTtcbiAgaCA9IGltYWdlLmdldEhlaWdodCgpO1xuICByYXN0ZXIgPSBpbWFnZS5yZWFkUmFzdGVycygpWzBdO1xuICBmb3IgKHZhciBqPTAsIGs9MDsgajxoOyBqKyspIHtcbiAgICBvdXQucHVzaChbXSk7XG4gICAgZm9yICh2YXIgaT0wOyBpPHc7IGkrKykge1xuICAgICAgb3V0W2pdLnB1c2gocmFzdGVyW2tdKTtcbiAgICAgIGsrKztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG91dDtcbn1cblxuZXhwb3J0cy5sYXRsb24ydmVjdG9yID0gbGF0bG9uMnZlY3RvcjtcbmV4cG9ydHMuZ2VvdGlmZjJhcnJheSA9IGdlb3RpZmYyYXJyYXk7XG4iXX0=
