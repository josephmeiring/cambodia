(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// var THREE = require('../components/three.js/build/three.js');
// var mesh_view = require('./mesh.js');
var main_view = require('./main.js');

main_view();

},{"./main.js":2}],2:[function(require,module,exports){

// var THREE = require('../components/three.js/build/three.js');
// var geotiff = require('../components/geotiff/src/geotiff.js');
var utils = require('./utils.js');
module.exports = main_view;

function main_view () {
  'use strict';
  // SCENE
  var scene, camera, renderer, 
      container, controls,
      stats,  
      customUniforms, grid, raycaster, 
      map_width, map_height, 
      terrain;

  scene = new THREE.Scene();
  // CAMERA
  var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
  var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
  camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
  scene.add(camera);
  camera.position.set(0,2000,1000);
  camera.lookAt(scene.position);  
  
  // GEO GRID

  

  // LIGHTS
  var ambient = new THREE.AmbientLight( 0xffffff );
  scene.add( ambient );
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
  directionalLight.position.set( 0, 1000, 1000 );
  scene.add( directionalLight );
  // RENDERER
  
  renderer = new THREE.WebGLRenderer( {antialias:true} );
 
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  container = document.getElementById( 'map' );
  container.appendChild( renderer.domElement );

  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.bottom = '0px';
  stats.domElement.style.zIndex = 100;
  container.appendChild( stats.domElement );

  controls = new THREE.OrbitControls( camera, renderer.domElement );
   
  function getHeightData(img) {
    var canvas = document.createElement( 'canvas' );
    canvas.width = img.width;
    canvas.height = img.height;
    var context = canvas.getContext( '2d' );

    var size = img.width * img.height, data = new Float32Array( size );

    context.drawImage(img,0,0);

    for ( var i = 0; i < size; i ++ ) {
      data[i] = 0;
    }

    var imgd = context.getImageData(0, 0, img.width, img.height);
    var pix = imgd.data;

    var j=0;
    for (var i = 0, n = pix.length; i < n; i += 4) {
      var all = (pix[i] + pix[i+1] + pix[i+2]) / 3;
      data[j++] = all/6;
    }

    return data;
  }

  // Load the DEM into a canvas
  var img = new Image();
  img.src = "images/cambodia_heightmap.sm.png";
  img.onload = function () {
    grid = new utils.grid2d(img.width, img.height, 
                [14.9082, 100.95], [10.01653529, 108.64166]);
    grid.set_scene_size(SCREEN_WIDTH, SCREEN_HEIGHT);
    var data = getHeightData(img);
    console.log(data.length, img.width, img.height);
    var geom = new THREE.PlaneGeometry(SCREEN_WIDTH, SCREEN_HEIGHT, img.width-1, img.height-1 );
    var material = new THREE.MeshPhongMaterial({color: 0x2194ce, side: THREE.DoubleSide});
    var mesh = new THREE.Mesh(geom, material);
    mesh.rotation.x = -Math.PI / 2;
    console.log(geom.vertices.length)
    for ( var i = 0; i < geom.vertices.length; i++ ) {
      geom.vertices[i].z = data[i];
    }
    geom.computeFaceNormals();
    geom.computeVertexNormals();
    geom.__dirtyNormals = true;
    // var planeMesh = addMesh( plane, 100,  0, FLOOR, 0, -1.57,0,0, getTerrainMaterial() );
    // mesh.visible = true;
    scene.add(mesh);
    add_marker(11.5449, 108.9, mesh);
  };
  
  function add_marker(lat, lon, mesh) {
    var scene_pos = grid.latlon2scene(lat, lon);
    var p1 = new THREE.Vector3(-scene_pos[0], -10, scene_pos[1]);
    var p2 = new THREE.Vector3(-scene_pos[0], 20000, scene_pos[1]);
    var arrow = new THREE.ArrowHelper(p2.clone().normalize(), p1, 150, 0xFFFFFF);
    var direction = new THREE.Vector3 (0, -1, 0);
    raycaster = new THREE.Raycaster(p1, p2);
    var intersects = raycaster.intersectObject(mesh);
    console.log(intersects)
    // if (intersects.length > 0) console.log(plane.position.copy(intersects[0].point));
    scene.add(arrow);
  }
  // // console.log(material) 

  // function add_markers() {
  //   d3.csv('data/tmp.csv', function (d) {
  //     return {
  //       datetime_utc: new Date(d.datetime_utc),
  //       lat: +d.lat,
  //       lon: +d.lon
  //     };
  //   }, function (data) {
  //     data = data.slice(0, 100);
  //     data.forEach(function (d) {
  //       add_marker(d.lat, d.lon, terrain);
  //     });
  //   });
  // }
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
      stats.update();
  };

  render();
}


},{"./utils.js":3}],3:[function(require,module,exports){
// var THREE = require('../components/three.js/build/three.js');

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

function grid2d(x_size, y_size, top_left, bottom_right) {

  /*
    x_size = int pixels
    y_size = int pixels
    top_left = [lat, lon]
    bottom_right = [lat, lon]
  */

  var self = this;
  self.x_size = x_size;
  self.y_size = y_size;
  self.top_left = top_left;
  self.bottom_right = bottom_right;
  self.scene_x_sz = null;
  self.scene_y_sz = null;

  self.dlon = +(self.bottom_right[1] - self.top_left[1] )/self.x_size;
  self.dlat = +(self.top_left[0] - self.bottom_right[0])/self.y_size;

  self.set_scene_size = function (x, y) {
    self.scene_x_sz = x;
    self.scene_y_sz = y;
  };

  self.latlon2xy = function (lat, lon) {
    var min_lat, min_lon, i, j;
    min_lat = self.bottom_right[0];
    min_lon = self.top_left[1];
    i = Math.floor(Math.abs((lon - min_lon) / self.dlon ));
    j = Math.floor(Math.abs((lat - min_lat) / self.dlat ));
    return [i, j];
  };

  self.latlon2scene = function (lat, lon) {
    var scene_x, scene_y, pos;
    pos = self.latlon2xy(lat, lon);
    // console.log(x, y)
    scene_x = (self.scene_x_sz / 2) - (self.scene_x_sz / self.x_size) * pos[0];
    scene_y = (self.scene_y_sz / 2) - (self.scene_y_sz / self.y_size) * pos[1];
    return [scene_x, scene_y];
  };

}

exports.geotiff2array = geotiff2array;
exports.grid2d = grid2d;
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9pbmRleC5qcyIsImpzL21haW4uanMiLCJqcy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIHZhciBUSFJFRSA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudHMvdGhyZWUuanMvYnVpbGQvdGhyZWUuanMnKTtcbi8vIHZhciBtZXNoX3ZpZXcgPSByZXF1aXJlKCcuL21lc2guanMnKTtcbnZhciBtYWluX3ZpZXcgPSByZXF1aXJlKCcuL21haW4uanMnKTtcblxubWFpbl92aWV3KCk7XG4iLCJcbi8vIHZhciBUSFJFRSA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudHMvdGhyZWUuanMvYnVpbGQvdGhyZWUuanMnKTtcbi8vIHZhciBnZW90aWZmID0gcmVxdWlyZSgnLi4vY29tcG9uZW50cy9nZW90aWZmL3NyYy9nZW90aWZmLmpzJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzLmpzJyk7XG5tb2R1bGUuZXhwb3J0cyA9IG1haW5fdmlldztcblxuZnVuY3Rpb24gbWFpbl92aWV3ICgpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuICAvLyBTQ0VORVxuICB2YXIgc2NlbmUsIGNhbWVyYSwgcmVuZGVyZXIsIFxuICAgICAgY29udGFpbmVyLCBjb250cm9scyxcbiAgICAgIHN0YXRzLCAgXG4gICAgICBjdXN0b21Vbmlmb3JtcywgZ3JpZCwgcmF5Y2FzdGVyLCBcbiAgICAgIG1hcF93aWR0aCwgbWFwX2hlaWdodCwgXG4gICAgICB0ZXJyYWluO1xuXG4gIHNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XG4gIC8vIENBTUVSQVxuICB2YXIgU0NSRUVOX1dJRFRIID0gd2luZG93LmlubmVyV2lkdGgsIFNDUkVFTl9IRUlHSFQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gIHZhciBWSUVXX0FOR0xFID0gNDUsIEFTUEVDVCA9IFNDUkVFTl9XSURUSCAvIFNDUkVFTl9IRUlHSFQsIE5FQVIgPSAwLjEsIEZBUiA9IDIwMDAwO1xuICBjYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoIFZJRVdfQU5HTEUsIEFTUEVDVCwgTkVBUiwgRkFSKTtcbiAgc2NlbmUuYWRkKGNhbWVyYSk7XG4gIGNhbWVyYS5wb3NpdGlvbi5zZXQoMCwyMDAwLDEwMDApO1xuICBjYW1lcmEubG9va0F0KHNjZW5lLnBvc2l0aW9uKTsgIFxuICBcbiAgLy8gR0VPIEdSSURcblxuICBcblxuICAvLyBMSUdIVFNcbiAgdmFyIGFtYmllbnQgPSBuZXcgVEhSRUUuQW1iaWVudExpZ2h0KCAweGZmZmZmZiApO1xuICBzY2VuZS5hZGQoIGFtYmllbnQgKTtcbiAgdmFyIGRpcmVjdGlvbmFsTGlnaHQgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCggMHhmZmZmZmYsIDAuNSApO1xuICBkaXJlY3Rpb25hbExpZ2h0LnBvc2l0aW9uLnNldCggMCwgMTAwMCwgMTAwMCApO1xuICBzY2VuZS5hZGQoIGRpcmVjdGlvbmFsTGlnaHQgKTtcbiAgLy8gUkVOREVSRVJcbiAgXG4gIHJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoIHthbnRpYWxpYXM6dHJ1ZX0gKTtcbiBcbiAgcmVuZGVyZXIuc2V0U2l6ZShTQ1JFRU5fV0lEVEgsIFNDUkVFTl9IRUlHSFQpO1xuICBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggJ21hcCcgKTtcbiAgY29udGFpbmVyLmFwcGVuZENoaWxkKCByZW5kZXJlci5kb21FbGVtZW50ICk7XG5cbiAgc3RhdHMgPSBuZXcgU3RhdHMoKTtcbiAgc3RhdHMuZG9tRWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gIHN0YXRzLmRvbUVsZW1lbnQuc3R5bGUuYm90dG9tID0gJzBweCc7XG4gIHN0YXRzLmRvbUVsZW1lbnQuc3R5bGUuekluZGV4ID0gMTAwO1xuICBjb250YWluZXIuYXBwZW5kQ2hpbGQoIHN0YXRzLmRvbUVsZW1lbnQgKTtcblxuICBjb250cm9scyA9IG5ldyBUSFJFRS5PcmJpdENvbnRyb2xzKCBjYW1lcmEsIHJlbmRlcmVyLmRvbUVsZW1lbnQgKTtcbiAgIFxuICBmdW5jdGlvbiBnZXRIZWlnaHREYXRhKGltZykge1xuICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApO1xuICAgIGNhbnZhcy53aWR0aCA9IGltZy53aWR0aDtcbiAgICBjYW52YXMuaGVpZ2h0ID0gaW1nLmhlaWdodDtcbiAgICB2YXIgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCAnMmQnICk7XG5cbiAgICB2YXIgc2l6ZSA9IGltZy53aWR0aCAqIGltZy5oZWlnaHQsIGRhdGEgPSBuZXcgRmxvYXQzMkFycmF5KCBzaXplICk7XG5cbiAgICBjb250ZXh0LmRyYXdJbWFnZShpbWcsMCwwKTtcblxuICAgIGZvciAoIHZhciBpID0gMDsgaSA8IHNpemU7IGkgKysgKSB7XG4gICAgICBkYXRhW2ldID0gMDtcbiAgICB9XG5cbiAgICB2YXIgaW1nZCA9IGNvbnRleHQuZ2V0SW1hZ2VEYXRhKDAsIDAsIGltZy53aWR0aCwgaW1nLmhlaWdodCk7XG4gICAgdmFyIHBpeCA9IGltZ2QuZGF0YTtcblxuICAgIHZhciBqPTA7XG4gICAgZm9yICh2YXIgaSA9IDAsIG4gPSBwaXgubGVuZ3RoOyBpIDwgbjsgaSArPSA0KSB7XG4gICAgICB2YXIgYWxsID0gKHBpeFtpXSArIHBpeFtpKzFdICsgcGl4W2krMl0pIC8gMztcbiAgICAgIGRhdGFbaisrXSA9IGFsbC82O1xuICAgIH1cblxuICAgIHJldHVybiBkYXRhO1xuICB9XG5cbiAgLy8gTG9hZCB0aGUgREVNIGludG8gYSBjYW52YXNcbiAgdmFyIGltZyA9IG5ldyBJbWFnZSgpO1xuICBpbWcuc3JjID0gXCJpbWFnZXMvY2FtYm9kaWFfaGVpZ2h0bWFwLnNtLnBuZ1wiO1xuICBpbWcub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgIGdyaWQgPSBuZXcgdXRpbHMuZ3JpZDJkKGltZy53aWR0aCwgaW1nLmhlaWdodCwgXG4gICAgICAgICAgICAgICAgWzE0LjkwODIsIDEwMC45NV0sIFsxMC4wMTY1MzUyOSwgMTA4LjY0MTY2XSk7XG4gICAgZ3JpZC5zZXRfc2NlbmVfc2l6ZShTQ1JFRU5fV0lEVEgsIFNDUkVFTl9IRUlHSFQpO1xuICAgIHZhciBkYXRhID0gZ2V0SGVpZ2h0RGF0YShpbWcpO1xuICAgIGNvbnNvbGUubG9nKGRhdGEubGVuZ3RoLCBpbWcud2lkdGgsIGltZy5oZWlnaHQpO1xuICAgIHZhciBnZW9tID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoU0NSRUVOX1dJRFRILCBTQ1JFRU5fSEVJR0hULCBpbWcud2lkdGgtMSwgaW1nLmhlaWdodC0xICk7XG4gICAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtjb2xvcjogMHgyMTk0Y2UsIHNpZGU6IFRIUkVFLkRvdWJsZVNpZGV9KTtcbiAgICB2YXIgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb20sIG1hdGVyaWFsKTtcbiAgICBtZXNoLnJvdGF0aW9uLnggPSAtTWF0aC5QSSAvIDI7XG4gICAgY29uc29sZS5sb2coZ2VvbS52ZXJ0aWNlcy5sZW5ndGgpXG4gICAgZm9yICggdmFyIGkgPSAwOyBpIDwgZ2VvbS52ZXJ0aWNlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGdlb20udmVydGljZXNbaV0ueiA9IGRhdGFbaV07XG4gICAgfVxuICAgIGdlb20uY29tcHV0ZUZhY2VOb3JtYWxzKCk7XG4gICAgZ2VvbS5jb21wdXRlVmVydGV4Tm9ybWFscygpO1xuICAgIGdlb20uX19kaXJ0eU5vcm1hbHMgPSB0cnVlO1xuICAgIC8vIHZhciBwbGFuZU1lc2ggPSBhZGRNZXNoKCBwbGFuZSwgMTAwLCAgMCwgRkxPT1IsIDAsIC0xLjU3LDAsMCwgZ2V0VGVycmFpbk1hdGVyaWFsKCkgKTtcbiAgICAvLyBtZXNoLnZpc2libGUgPSB0cnVlO1xuICAgIHNjZW5lLmFkZChtZXNoKTtcbiAgICBhZGRfbWFya2VyKDExLjU0NDksIDEwOC45LCBtZXNoKTtcbiAgfTtcbiAgXG4gIGZ1bmN0aW9uIGFkZF9tYXJrZXIobGF0LCBsb24sIG1lc2gpIHtcbiAgICB2YXIgc2NlbmVfcG9zID0gZ3JpZC5sYXRsb24yc2NlbmUobGF0LCBsb24pO1xuICAgIHZhciBwMSA9IG5ldyBUSFJFRS5WZWN0b3IzKC1zY2VuZV9wb3NbMF0sIC0xMCwgc2NlbmVfcG9zWzFdKTtcbiAgICB2YXIgcDIgPSBuZXcgVEhSRUUuVmVjdG9yMygtc2NlbmVfcG9zWzBdLCAyMDAwMCwgc2NlbmVfcG9zWzFdKTtcbiAgICB2YXIgYXJyb3cgPSBuZXcgVEhSRUUuQXJyb3dIZWxwZXIocDIuY2xvbmUoKS5ub3JtYWxpemUoKSwgcDEsIDE1MCwgMHhGRkZGRkYpO1xuICAgIHZhciBkaXJlY3Rpb24gPSBuZXcgVEhSRUUuVmVjdG9yMyAoMCwgLTEsIDApO1xuICAgIHJheWNhc3RlciA9IG5ldyBUSFJFRS5SYXljYXN0ZXIocDEsIHAyKTtcbiAgICB2YXIgaW50ZXJzZWN0cyA9IHJheWNhc3Rlci5pbnRlcnNlY3RPYmplY3QobWVzaCk7XG4gICAgY29uc29sZS5sb2coaW50ZXJzZWN0cylcbiAgICAvLyBpZiAoaW50ZXJzZWN0cy5sZW5ndGggPiAwKSBjb25zb2xlLmxvZyhwbGFuZS5wb3NpdGlvbi5jb3B5KGludGVyc2VjdHNbMF0ucG9pbnQpKTtcbiAgICBzY2VuZS5hZGQoYXJyb3cpO1xuICB9XG4gIC8vIC8vIGNvbnNvbGUubG9nKG1hdGVyaWFsKSBcblxuICAvLyBmdW5jdGlvbiBhZGRfbWFya2VycygpIHtcbiAgLy8gICBkMy5jc3YoJ2RhdGEvdG1wLmNzdicsIGZ1bmN0aW9uIChkKSB7XG4gIC8vICAgICByZXR1cm4ge1xuICAvLyAgICAgICBkYXRldGltZV91dGM6IG5ldyBEYXRlKGQuZGF0ZXRpbWVfdXRjKSxcbiAgLy8gICAgICAgbGF0OiArZC5sYXQsXG4gIC8vICAgICAgIGxvbjogK2QubG9uXG4gIC8vICAgICB9O1xuICAvLyAgIH0sIGZ1bmN0aW9uIChkYXRhKSB7XG4gIC8vICAgICBkYXRhID0gZGF0YS5zbGljZSgwLCAxMDApO1xuICAvLyAgICAgZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChkKSB7XG4gIC8vICAgICAgIGFkZF9tYXJrZXIoZC5sYXQsIGQubG9uLCB0ZXJyYWluKTtcbiAgLy8gICAgIH0pO1xuICAvLyAgIH0pO1xuICAvLyB9XG4gIC8vIGQzLmNzdignZGF0YS9wb3NpdGlvbnMuY3N2JywgZnVuY3Rpb24gKGQpIHtcbiAgLy8gICByZXR1cm4ge1xuICAvLyAgICAgZGF0ZXRpbWVfdXRjOiBuZXcgRGF0ZShkLmRhdGV0aW1lX3V0YyksXG4gIC8vICAgICBsYXQ6ICtkLmxhdCxcbiAgLy8gICAgIGxvbjogK2QubG9uXG4gIC8vICAgfVxuICAvLyB9LCBmdW5jdGlvbiAoZGF0YSkge1xuICAgXG4gIC8vICAgdmFyIGdyb3VwX2J5X2RhdGUgPSBkMy5uZXN0KClcbiAgLy8gICAgIC5rZXkoZnVuY3Rpb24gKGQpIHtyZXR1cm4gZC5kYXRldGltZV91dGMudG9EYXRlU3RyaW5nKCl9KVxuICAvLyAgICAgLmVudHJpZXMoZGF0YSk7XG5cbiAgICBcbiAgLy8gICBmdW5jdGlvbiByZW5kZXJfcG9pbnRzIChncm91cCkge1xuICAvLyAgICAgdmFyIHBjX2dlb21ldHJ5ID0gbmV3IFRIUkVFLkdlb21ldHJ5KCk7XG4gIC8vICAgICB2YXIgcGNfbWF0ZXJpYWwgPSBuZXcgVEhSRUUuUG9pbnRzTWF0ZXJpYWwoXG4gIC8vICAgICAgIHtzaXplOiAwLjMsIGNvbG9yOjB4ZmYwMDAwLCB0cmFuc3BhcmVudDp0cnVlLCBvcGFjaXR5OjAuOH1cbiAgLy8gICAgICk7XG4gIC8vICAgICB2YXIgcGFydGljbGVzID0gbmV3IFRIUkVFLlBvaW50cyggcGNfZ2VvbWV0cnksIHBjX21hdGVyaWFsKTsgXG4gIC8vICAgICB2YXIgdmVydGljYWxfbWFya2VyX2dyb3VwID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XG4gIC8vICAgICB2YXIgY2lyY2xlX21hcmtlcl9ncm91cCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xuXG4gICAgXG4gIC8vICAgICBncm91cC52YWx1ZXMuZm9yRWFjaChmdW5jdGlvbiAoZCkge1xuXG4gIC8vICAgICAgIHZhciB2ZWMgPSBsYXRsb24ydmVjdG9yKGQubGF0LCBkLmxvbiwgRUFSVEhfUkFESVVTLCAwKVxuICAvLyAgICAgICBwY19nZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKHZlYyk7XG4gIC8vICAgICAgIHZhciB2bSA9IG5ldyBUSFJFRS5NZXNoKCB2ZXJ0aWNhbF9tYXJrZXJfZ2VvbSwgdmVydGljYWxfbWFya2VyX21lc2ggKTtcbiAgLy8gICAgICAgdm0ucG9zaXRpb24uc2V0KHZlYy54LCB2ZWMueSwgdmVjLnogLSA1KVxuICAvLyAgICAgICB2ZXJ0aWNhbF9tYXJrZXJfZ3JvdXAuYWRkKHZtKTtcblxuICAvLyAgICAgICB2YXIgY20gPSBuZXcgVEhSRUUuTWVzaChjaXJjX2dlb20sIGNpcmNfbWF0KTtcbiAgLy8gICAgICAgY20ucG9zaXRpb24uc2V0KHZlYy54LCB2ZWMueSwgdmVjLnopXG4gIC8vICAgICAgIGNpcmNsZV9tYXJrZXJfZ3JvdXAuYWRkKGNtKVxuICAvLyAgICAgfSlcbiAgLy8gICAgIC8vIGNvbnNvbGUubG9nKGdyb3VwKVxuICAvLyAgICAgZWFydGguYWRkKHBhcnRpY2xlcylcbiAgLy8gICAgIGVhcnRoLmFkZCh2ZXJ0aWNhbF9tYXJrZXJfZ3JvdXApXG4gIC8vICAgICBlYXJ0aC5hZGQoY2lyY2xlX21hcmtlcl9ncm91cClcblxuICAvLyAgICAgcmV0dXJuIHNldFRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcbiAgLy8gICAgICAgZWFydGgucmVtb3ZlKHZlcnRpY2FsX21hcmtlcl9ncm91cCk7XG4gIC8vICAgICAgIGVhcnRoLnJlbW92ZShjaXJjbGVfbWFya2VyX2dyb3VwKTtcbiAgLy8gICAgIH0sIDIwKVxuICAvLyAgIH1cblxuXG4gIC8vICAgdmFyIG51bV9kYXRlcyA9IGdyb3VwX2J5X2RhdGUubGVuZ3RoO1xuICAvLyAgIHZhciBsb29wX2NvdW50ID0gMDtcbiAgLy8gICBmdW5jdGlvbiBhbmltYXRpb25fbG9vcCAoKSB7XG4gIC8vICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgLy8gICAgICAgdmFyIGdyb3VwID0gZ3JvdXBfYnlfZGF0ZVtsb29wX2NvdW50XTtcbiAgLy8gICAgICAgcmVuZGVyX3BvaW50cyhncm91cCk7XG4gIC8vICAgICAgIGxvb3BfY291bnQrKztcbiAgLy8gICAgICAgaWYgKGxvb3BfY291bnQgPCBudW1fZGF0ZXMpIHtcbiAgLy8gICAgICAgICBhbmltYXRpb25fbG9vcCgpO1xuICAvLyAgICAgICB9XG4gIC8vICAgICB9LCAyMClcbiAgLy8gICB9XG4gIC8vICAgYW5pbWF0aW9uX2xvb3AoKTtcbiAgLy8gfSlcblxuXG5cbiAgdmFyIHJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXIpO1xuICAgICAgcmVuZGVyZXIucmVuZGVyKHNjZW5lLCBjYW1lcmEpO1xuICAgICAgc3RhdHMudXBkYXRlKCk7XG4gIH07XG5cbiAgcmVuZGVyKCk7XG59XG5cbiIsIi8vIHZhciBUSFJFRSA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudHMvdGhyZWUuanMvYnVpbGQvdGhyZWUuanMnKTtcblxuZnVuY3Rpb24gZ2VvdGlmZjJhcnJheSh0aWZmKSB7XG4gIHZhciBpbWFnZSwgdywgaCwgb3V0ID0gW107XG5cbiAgaW1hZ2UgPSB0aWZmLmdldEltYWdlKCk7XG4gIHcgPSBpbWFnZS5nZXRXaWR0aCgpO1xuICBoID0gaW1hZ2UuZ2V0SGVpZ2h0KCk7XG4gIHJhc3RlciA9IGltYWdlLnJlYWRSYXN0ZXJzKClbMF07XG4gIGZvciAodmFyIGo9MCwgaz0wOyBqPGg7IGorKykge1xuICAgIG91dC5wdXNoKFtdKTtcbiAgICBmb3IgKHZhciBpPTA7IGk8dzsgaSsrKSB7XG4gICAgICBvdXRbal0ucHVzaChyYXN0ZXJba10pO1xuICAgICAgaysrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gb3V0O1xufVxuXG5mdW5jdGlvbiBncmlkMmQoeF9zaXplLCB5X3NpemUsIHRvcF9sZWZ0LCBib3R0b21fcmlnaHQpIHtcblxuICAvKlxuICAgIHhfc2l6ZSA9IGludCBwaXhlbHNcbiAgICB5X3NpemUgPSBpbnQgcGl4ZWxzXG4gICAgdG9wX2xlZnQgPSBbbGF0LCBsb25dXG4gICAgYm90dG9tX3JpZ2h0ID0gW2xhdCwgbG9uXVxuICAqL1xuXG4gIHZhciBzZWxmID0gdGhpcztcbiAgc2VsZi54X3NpemUgPSB4X3NpemU7XG4gIHNlbGYueV9zaXplID0geV9zaXplO1xuICBzZWxmLnRvcF9sZWZ0ID0gdG9wX2xlZnQ7XG4gIHNlbGYuYm90dG9tX3JpZ2h0ID0gYm90dG9tX3JpZ2h0O1xuICBzZWxmLnNjZW5lX3hfc3ogPSBudWxsO1xuICBzZWxmLnNjZW5lX3lfc3ogPSBudWxsO1xuXG4gIHNlbGYuZGxvbiA9ICsoc2VsZi5ib3R0b21fcmlnaHRbMV0gLSBzZWxmLnRvcF9sZWZ0WzFdICkvc2VsZi54X3NpemU7XG4gIHNlbGYuZGxhdCA9ICsoc2VsZi50b3BfbGVmdFswXSAtIHNlbGYuYm90dG9tX3JpZ2h0WzBdKS9zZWxmLnlfc2l6ZTtcblxuICBzZWxmLnNldF9zY2VuZV9zaXplID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgICBzZWxmLnNjZW5lX3hfc3ogPSB4O1xuICAgIHNlbGYuc2NlbmVfeV9zeiA9IHk7XG4gIH07XG5cbiAgc2VsZi5sYXRsb24yeHkgPSBmdW5jdGlvbiAobGF0LCBsb24pIHtcbiAgICB2YXIgbWluX2xhdCwgbWluX2xvbiwgaSwgajtcbiAgICBtaW5fbGF0ID0gc2VsZi5ib3R0b21fcmlnaHRbMF07XG4gICAgbWluX2xvbiA9IHNlbGYudG9wX2xlZnRbMV07XG4gICAgaSA9IE1hdGguZmxvb3IoTWF0aC5hYnMoKGxvbiAtIG1pbl9sb24pIC8gc2VsZi5kbG9uICkpO1xuICAgIGogPSBNYXRoLmZsb29yKE1hdGguYWJzKChsYXQgLSBtaW5fbGF0KSAvIHNlbGYuZGxhdCApKTtcbiAgICByZXR1cm4gW2ksIGpdO1xuICB9O1xuXG4gIHNlbGYubGF0bG9uMnNjZW5lID0gZnVuY3Rpb24gKGxhdCwgbG9uKSB7XG4gICAgdmFyIHNjZW5lX3gsIHNjZW5lX3ksIHBvcztcbiAgICBwb3MgPSBzZWxmLmxhdGxvbjJ4eShsYXQsIGxvbik7XG4gICAgLy8gY29uc29sZS5sb2coeCwgeSlcbiAgICBzY2VuZV94ID0gKHNlbGYuc2NlbmVfeF9zeiAvIDIpIC0gKHNlbGYuc2NlbmVfeF9zeiAvIHNlbGYueF9zaXplKSAqIHBvc1swXTtcbiAgICBzY2VuZV95ID0gKHNlbGYuc2NlbmVfeV9zeiAvIDIpIC0gKHNlbGYuc2NlbmVfeV9zeiAvIHNlbGYueV9zaXplKSAqIHBvc1sxXTtcbiAgICByZXR1cm4gW3NjZW5lX3gsIHNjZW5lX3ldO1xuICB9O1xuXG59XG5cbmV4cG9ydHMuZ2VvdGlmZjJhcnJheSA9IGdlb3RpZmYyYXJyYXk7XG5leHBvcnRzLmdyaWQyZCA9IGdyaWQyZDsiXX0=
