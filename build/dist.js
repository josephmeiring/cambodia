(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// var THREE = require('../components/three.js/build/three.js');
// var view = require('./mesh.js');
var view = require('./main.js');

view();

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
      dem,
      markers,
      mesh;

  scene = new THREE.Scene();
  // CAMERA
  var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
  var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
  camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
  scene.add(camera);
  camera.position.set(0,2000,1000);
  camera.lookAt(scene.position);  
  
  

  // LIGHTS
  // var ambient = new THREE.AmbientLight( 0xffffff );
  // scene.add( ambient );
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.9 );
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
   

  // Load the DEM into a canvas
  var img = new Image();
  img.src = "images/cambodia_heightmap.sm.png";
  img.onload = function () {
    
    dem = new utils.DigitalElevationModel(img);
    dem.set_extents(img.width, img.height, 
                [14.9082, 100.95], [10.01653529, 108.64166]);
    dem.set_scene_size(SCREEN_WIDTH, SCREEN_HEIGHT);
    var geom = new THREE.PlaneGeometry(SCREEN_WIDTH, SCREEN_HEIGHT, img.width-1, img.height-1 );
    var material = new THREE.MeshPhongMaterial({color: 0x2194ce, side: THREE.DoubleSide});
    mesh = new THREE.Mesh(geom, material);
    mesh.rotation.x = -Math.PI / 2;
    for ( var i = 0; i < dem.vertices.length; i++ ) {
      geom.vertices[i].z = dem.vertices[i]/4;
    }
    geom.computeFaceNormals();
    geom.computeVertexNormals();
    // geom.__dirtyNormals = true;
    // var planeMesh = addMesh( plane, 100,  0, FLOOR, 0, -1.57,0,0, getTerrainMaterial() );
    // mesh.visible = true;
    scene.add(mesh);
    renderer.render(scene, camera);
    // var fnh = new THREE.FaceNormalsHelper( mesh, 5 );
    // scene.add( fnh ); 
    // add_marker(11.5449, 106.9, mesh);
    add_marker(11.5449, 104.8922);
    add_markers();
  };
  
  function add_marker(lat, lon) {
    var scene_pos = dem.latlon2scene(lat, lon);
    var xy = dem.latlon2xy(lat, lon);
    var height = dem.data[xy[1]][xy[0]];
    var p1 = new THREE.Vector3(-scene_pos[0], height/4, scene_pos[1]);
    var p2 = new THREE.Vector3(-scene_pos[0], 20000, scene_pos[1]);
    var arrow = new THREE.ArrowHelper(p2.clone().normalize(), p1, 150, 0xFFFFFF);
    // var direction = new THREE.Vector3 (0, 1, 0);
    // raycaster = new THREE.Raycaster(p1, direction);
    // var intersects = raycaster.intersectObject(mesh);
    // console.log(intersects)
    // if (intersects.length > 0) console.log(plane.position.copy(intersects[0].point));
    scene.add(arrow);
  }
  // // console.log(material) 

  function add_markers(mesh) {
    d3.csv('data/positions.csv', function (d) {
      return {
        datetime_utc: new Date(d.datetime_utc),
        lat: +d.lat,
        lon: +d.lon
      };
    }, function (data) {
      data = data.slice(0, 10000);
      data.forEach(function (d) {
        add_marker(d.lat, d.lon, mesh);
      });
    });
  }
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
 
function DigitalElevationModel(img) {
  this.img = img;
  this.data = [];
  this.vertices = [];
  this.x_size = null;
  this.y_size = null;
  this.top_left = null;
  this.bottom_right = null;
  this.scene_x_sz = null;
  this.scene_y_sz = null;
  this.dlon = null;
  this.dlat = null;

  var canvas = document.createElement( 'canvas' );
  canvas.width = this.img.width;
  canvas.height = this.img.height;
  var context = canvas.getContext( '2d' );
  context.drawImage(img,0,0);
  var imgd = context.getImageData(0, 0, this.img.width, this.img.height);
  var pix = imgd.data;

  var counter =0;
  for (var i=0; i<this.img.height; i++) {
    var row = new Float32Array(this.img.width);
    for (var j=0; j<img.width; j++) {
      row[j] = pix[counter];
      counter += 4;
      this.vertices.push(pix[counter]);
    }
    this.data.push(row);
  }

  this.set_extents = function (x_size, y_size, top_left, bottom_right) {
    this.x_size = x_size;
    this.y_size = y_size;
    this.top_left = top_left;
    this.bottom_right = bottom_right;
    this.dlat = (this.top_left[0] - this.bottom_right[0]) / this.y_size;
    this.dlon = (this.bottom_right[1] - this.top_left[1]) / this.x_size;

  };

  this.set_scene_size = function (x, y) {
    this.scene_x_sz = x;
    this.scene_y_sz = y;
  };

  this.latlon2xy = function (lat, lon) {
    var min_lat, min_lon, i, j;
    min_lat = this.bottom_right[0];
    min_lon = this.top_left[1];
    i = Math.floor(Math.abs((lon - min_lon) / this.dlon ));
    j = Math.floor(Math.abs((lat - min_lat) / this.dlat ));
    return [i, j];
  };

  this.latlon2scene = function (lat, lon) {
    var scene_x, scene_y, pos;
    pos = this.latlon2xy(lat, lon);
    // console.log(x, y)
    scene_x = (this.scene_x_sz / 2) - (this.scene_x_sz / this.x_size) * pos[0];
    scene_y = (this.scene_y_sz / 2) - (this.scene_y_sz / this.y_size) * pos[1];
    return [scene_x, scene_y];
  };

}

exports.DigitalElevationModel = DigitalElevationModel;
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9pbmRleC5qcyIsImpzL21haW4uanMiLCJqcy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyB2YXIgVEhSRUUgPSByZXF1aXJlKCcuLi9jb21wb25lbnRzL3RocmVlLmpzL2J1aWxkL3RocmVlLmpzJyk7XG4vLyB2YXIgdmlldyA9IHJlcXVpcmUoJy4vbWVzaC5qcycpO1xudmFyIHZpZXcgPSByZXF1aXJlKCcuL21haW4uanMnKTtcblxudmlldygpO1xuIiwiXG4vLyB2YXIgVEhSRUUgPSByZXF1aXJlKCcuLi9jb21wb25lbnRzL3RocmVlLmpzL2J1aWxkL3RocmVlLmpzJyk7XG4vLyB2YXIgZ2VvdGlmZiA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudHMvZ2VvdGlmZi9zcmMvZ2VvdGlmZi5qcycpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscy5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG1haW5fdmlldztcblxuZnVuY3Rpb24gbWFpbl92aWV3ICgpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuICAvLyBTQ0VORVxuICB2YXIgc2NlbmUsIGNhbWVyYSwgcmVuZGVyZXIsIFxuICAgICAgY29udGFpbmVyLCBjb250cm9scyxcbiAgICAgIHN0YXRzLCAgXG4gICAgICBkZW0sXG4gICAgICBtYXJrZXJzLFxuICAgICAgbWVzaDtcblxuICBzY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xuICAvLyBDQU1FUkFcbiAgdmFyIFNDUkVFTl9XSURUSCA9IHdpbmRvdy5pbm5lcldpZHRoLCBTQ1JFRU5fSEVJR0hUID0gd2luZG93LmlubmVySGVpZ2h0O1xuICB2YXIgVklFV19BTkdMRSA9IDQ1LCBBU1BFQ1QgPSBTQ1JFRU5fV0lEVEggLyBTQ1JFRU5fSEVJR0hULCBORUFSID0gMC4xLCBGQVIgPSAyMDAwMDtcbiAgY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKCBWSUVXX0FOR0xFLCBBU1BFQ1QsIE5FQVIsIEZBUik7XG4gIHNjZW5lLmFkZChjYW1lcmEpO1xuICBjYW1lcmEucG9zaXRpb24uc2V0KDAsMjAwMCwxMDAwKTtcbiAgY2FtZXJhLmxvb2tBdChzY2VuZS5wb3NpdGlvbik7ICBcbiAgXG4gIFxuXG4gIC8vIExJR0hUU1xuICAvLyB2YXIgYW1iaWVudCA9IG5ldyBUSFJFRS5BbWJpZW50TGlnaHQoIDB4ZmZmZmZmICk7XG4gIC8vIHNjZW5lLmFkZCggYW1iaWVudCApO1xuICB2YXIgZGlyZWN0aW9uYWxMaWdodCA9IG5ldyBUSFJFRS5EaXJlY3Rpb25hbExpZ2h0KCAweGZmZmZmZiwgMC45ICk7XG4gIGRpcmVjdGlvbmFsTGlnaHQucG9zaXRpb24uc2V0KCAwLCAxMDAwLCAxMDAwICk7XG4gIHNjZW5lLmFkZCggZGlyZWN0aW9uYWxMaWdodCApO1xuICAvLyBSRU5ERVJFUlxuICBcbiAgcmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcigge2FudGlhbGlhczp0cnVlfSApO1xuIFxuICByZW5kZXJlci5zZXRTaXplKFNDUkVFTl9XSURUSCwgU0NSRUVOX0hFSUdIVCk7XG4gIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCAnbWFwJyApO1xuICBjb250YWluZXIuYXBwZW5kQ2hpbGQoIHJlbmRlcmVyLmRvbUVsZW1lbnQgKTtcblxuICBzdGF0cyA9IG5ldyBTdGF0cygpO1xuICBzdGF0cy5kb21FbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgc3RhdHMuZG9tRWxlbWVudC5zdHlsZS5ib3R0b20gPSAnMHB4JztcbiAgc3RhdHMuZG9tRWxlbWVudC5zdHlsZS56SW5kZXggPSAxMDA7XG4gIGNvbnRhaW5lci5hcHBlbmRDaGlsZCggc3RhdHMuZG9tRWxlbWVudCApO1xuXG4gIGNvbnRyb2xzID0gbmV3IFRIUkVFLk9yYml0Q29udHJvbHMoIGNhbWVyYSwgcmVuZGVyZXIuZG9tRWxlbWVudCApO1xuICAgXG5cbiAgLy8gTG9hZCB0aGUgREVNIGludG8gYSBjYW52YXNcbiAgdmFyIGltZyA9IG5ldyBJbWFnZSgpO1xuICBpbWcuc3JjID0gXCJpbWFnZXMvY2FtYm9kaWFfaGVpZ2h0bWFwLnNtLnBuZ1wiO1xuICBpbWcub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgIFxuICAgIGRlbSA9IG5ldyB1dGlscy5EaWdpdGFsRWxldmF0aW9uTW9kZWwoaW1nKTtcbiAgICBkZW0uc2V0X2V4dGVudHMoaW1nLndpZHRoLCBpbWcuaGVpZ2h0LCBcbiAgICAgICAgICAgICAgICBbMTQuOTA4MiwgMTAwLjk1XSwgWzEwLjAxNjUzNTI5LCAxMDguNjQxNjZdKTtcbiAgICBkZW0uc2V0X3NjZW5lX3NpemUoU0NSRUVOX1dJRFRILCBTQ1JFRU5fSEVJR0hUKTtcbiAgICB2YXIgZ2VvbSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KFNDUkVFTl9XSURUSCwgU0NSRUVOX0hFSUdIVCwgaW1nLndpZHRoLTEsIGltZy5oZWlnaHQtMSApO1xuICAgIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7Y29sb3I6IDB4MjE5NGNlLCBzaWRlOiBUSFJFRS5Eb3VibGVTaWRlfSk7XG4gICAgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb20sIG1hdGVyaWFsKTtcbiAgICBtZXNoLnJvdGF0aW9uLnggPSAtTWF0aC5QSSAvIDI7XG4gICAgZm9yICggdmFyIGkgPSAwOyBpIDwgZGVtLnZlcnRpY2VzLmxlbmd0aDsgaSsrICkge1xuICAgICAgZ2VvbS52ZXJ0aWNlc1tpXS56ID0gZGVtLnZlcnRpY2VzW2ldLzQ7XG4gICAgfVxuICAgIGdlb20uY29tcHV0ZUZhY2VOb3JtYWxzKCk7XG4gICAgZ2VvbS5jb21wdXRlVmVydGV4Tm9ybWFscygpO1xuICAgIC8vIGdlb20uX19kaXJ0eU5vcm1hbHMgPSB0cnVlO1xuICAgIC8vIHZhciBwbGFuZU1lc2ggPSBhZGRNZXNoKCBwbGFuZSwgMTAwLCAgMCwgRkxPT1IsIDAsIC0xLjU3LDAsMCwgZ2V0VGVycmFpbk1hdGVyaWFsKCkgKTtcbiAgICAvLyBtZXNoLnZpc2libGUgPSB0cnVlO1xuICAgIHNjZW5lLmFkZChtZXNoKTtcbiAgICByZW5kZXJlci5yZW5kZXIoc2NlbmUsIGNhbWVyYSk7XG4gICAgLy8gdmFyIGZuaCA9IG5ldyBUSFJFRS5GYWNlTm9ybWFsc0hlbHBlciggbWVzaCwgNSApO1xuICAgIC8vIHNjZW5lLmFkZCggZm5oICk7IFxuICAgIC8vIGFkZF9tYXJrZXIoMTEuNTQ0OSwgMTA2LjksIG1lc2gpO1xuICAgIGFkZF9tYXJrZXIoMTEuNTQ0OSwgMTA0Ljg5MjIpO1xuICAgIGFkZF9tYXJrZXJzKCk7XG4gIH07XG4gIFxuICBmdW5jdGlvbiBhZGRfbWFya2VyKGxhdCwgbG9uKSB7XG4gICAgdmFyIHNjZW5lX3BvcyA9IGRlbS5sYXRsb24yc2NlbmUobGF0LCBsb24pO1xuICAgIHZhciB4eSA9IGRlbS5sYXRsb24yeHkobGF0LCBsb24pO1xuICAgIHZhciBoZWlnaHQgPSBkZW0uZGF0YVt4eVsxXV1beHlbMF1dO1xuICAgIHZhciBwMSA9IG5ldyBUSFJFRS5WZWN0b3IzKC1zY2VuZV9wb3NbMF0sIGhlaWdodC80LCBzY2VuZV9wb3NbMV0pO1xuICAgIHZhciBwMiA9IG5ldyBUSFJFRS5WZWN0b3IzKC1zY2VuZV9wb3NbMF0sIDIwMDAwLCBzY2VuZV9wb3NbMV0pO1xuICAgIHZhciBhcnJvdyA9IG5ldyBUSFJFRS5BcnJvd0hlbHBlcihwMi5jbG9uZSgpLm5vcm1hbGl6ZSgpLCBwMSwgMTUwLCAweEZGRkZGRik7XG4gICAgLy8gdmFyIGRpcmVjdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzICgwLCAxLCAwKTtcbiAgICAvLyByYXljYXN0ZXIgPSBuZXcgVEhSRUUuUmF5Y2FzdGVyKHAxLCBkaXJlY3Rpb24pO1xuICAgIC8vIHZhciBpbnRlcnNlY3RzID0gcmF5Y2FzdGVyLmludGVyc2VjdE9iamVjdChtZXNoKTtcbiAgICAvLyBjb25zb2xlLmxvZyhpbnRlcnNlY3RzKVxuICAgIC8vIGlmIChpbnRlcnNlY3RzLmxlbmd0aCA+IDApIGNvbnNvbGUubG9nKHBsYW5lLnBvc2l0aW9uLmNvcHkoaW50ZXJzZWN0c1swXS5wb2ludCkpO1xuICAgIHNjZW5lLmFkZChhcnJvdyk7XG4gIH1cbiAgLy8gLy8gY29uc29sZS5sb2cobWF0ZXJpYWwpIFxuXG4gIGZ1bmN0aW9uIGFkZF9tYXJrZXJzKG1lc2gpIHtcbiAgICBkMy5jc3YoJ2RhdGEvcG9zaXRpb25zLmNzdicsIGZ1bmN0aW9uIChkKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBkYXRldGltZV91dGM6IG5ldyBEYXRlKGQuZGF0ZXRpbWVfdXRjKSxcbiAgICAgICAgbGF0OiArZC5sYXQsXG4gICAgICAgIGxvbjogK2QubG9uXG4gICAgICB9O1xuICAgIH0sIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICBkYXRhID0gZGF0YS5zbGljZSgwLCAxMDAwMCk7XG4gICAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgYWRkX21hcmtlcihkLmxhdCwgZC5sb24sIG1lc2gpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbiAgLy8gZDMuY3N2KCdkYXRhL3Bvc2l0aW9ucy5jc3YnLCBmdW5jdGlvbiAoZCkge1xuICAvLyAgIHJldHVybiB7XG4gIC8vICAgICBkYXRldGltZV91dGM6IG5ldyBEYXRlKGQuZGF0ZXRpbWVfdXRjKSxcbiAgLy8gICAgIGxhdDogK2QubGF0LFxuICAvLyAgICAgbG9uOiArZC5sb25cbiAgLy8gICB9XG4gIC8vIH0sIGZ1bmN0aW9uIChkYXRhKSB7XG4gICBcbiAgLy8gICB2YXIgZ3JvdXBfYnlfZGF0ZSA9IGQzLm5lc3QoKVxuICAvLyAgICAgLmtleShmdW5jdGlvbiAoZCkge3JldHVybiBkLmRhdGV0aW1lX3V0Yy50b0RhdGVTdHJpbmcoKX0pXG4gIC8vICAgICAuZW50cmllcyhkYXRhKTtcblxuICAgIFxuICAvLyAgIGZ1bmN0aW9uIHJlbmRlcl9wb2ludHMgKGdyb3VwKSB7XG4gIC8vICAgICB2YXIgcGNfZ2VvbWV0cnkgPSBuZXcgVEhSRUUuR2VvbWV0cnkoKTtcbiAgLy8gICAgIHZhciBwY19tYXRlcmlhbCA9IG5ldyBUSFJFRS5Qb2ludHNNYXRlcmlhbChcbiAgLy8gICAgICAge3NpemU6IDAuMywgY29sb3I6MHhmZjAwMDAsIHRyYW5zcGFyZW50OnRydWUsIG9wYWNpdHk6MC44fVxuICAvLyAgICAgKTtcbiAgLy8gICAgIHZhciBwYXJ0aWNsZXMgPSBuZXcgVEhSRUUuUG9pbnRzKCBwY19nZW9tZXRyeSwgcGNfbWF0ZXJpYWwpOyBcbiAgLy8gICAgIHZhciB2ZXJ0aWNhbF9tYXJrZXJfZ3JvdXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcbiAgLy8gICAgIHZhciBjaXJjbGVfbWFya2VyX2dyb3VwID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XG5cbiAgICBcbiAgLy8gICAgIGdyb3VwLnZhbHVlcy5mb3JFYWNoKGZ1bmN0aW9uIChkKSB7XG5cbiAgLy8gICAgICAgdmFyIHZlYyA9IGxhdGxvbjJ2ZWN0b3IoZC5sYXQsIGQubG9uLCBFQVJUSF9SQURJVVMsIDApXG4gIC8vICAgICAgIHBjX2dlb21ldHJ5LnZlcnRpY2VzLnB1c2godmVjKTtcbiAgLy8gICAgICAgdmFyIHZtID0gbmV3IFRIUkVFLk1lc2goIHZlcnRpY2FsX21hcmtlcl9nZW9tLCB2ZXJ0aWNhbF9tYXJrZXJfbWVzaCApO1xuICAvLyAgICAgICB2bS5wb3NpdGlvbi5zZXQodmVjLngsIHZlYy55LCB2ZWMueiAtIDUpXG4gIC8vICAgICAgIHZlcnRpY2FsX21hcmtlcl9ncm91cC5hZGQodm0pO1xuXG4gIC8vICAgICAgIHZhciBjbSA9IG5ldyBUSFJFRS5NZXNoKGNpcmNfZ2VvbSwgY2lyY19tYXQpO1xuICAvLyAgICAgICBjbS5wb3NpdGlvbi5zZXQodmVjLngsIHZlYy55LCB2ZWMueilcbiAgLy8gICAgICAgY2lyY2xlX21hcmtlcl9ncm91cC5hZGQoY20pXG4gIC8vICAgICB9KVxuICAvLyAgICAgLy8gY29uc29sZS5sb2coZ3JvdXApXG4gIC8vICAgICBlYXJ0aC5hZGQocGFydGljbGVzKVxuICAvLyAgICAgZWFydGguYWRkKHZlcnRpY2FsX21hcmtlcl9ncm91cClcbiAgLy8gICAgIGVhcnRoLmFkZChjaXJjbGVfbWFya2VyX2dyb3VwKVxuXG4gIC8vICAgICByZXR1cm4gc2V0VGltZW91dCggZnVuY3Rpb24gKCkge1xuICAvLyAgICAgICBlYXJ0aC5yZW1vdmUodmVydGljYWxfbWFya2VyX2dyb3VwKTtcbiAgLy8gICAgICAgZWFydGgucmVtb3ZlKGNpcmNsZV9tYXJrZXJfZ3JvdXApO1xuICAvLyAgICAgfSwgMjApXG4gIC8vICAgfVxuXG5cbiAgLy8gICB2YXIgbnVtX2RhdGVzID0gZ3JvdXBfYnlfZGF0ZS5sZW5ndGg7XG4gIC8vICAgdmFyIGxvb3BfY291bnQgPSAwO1xuICAvLyAgIGZ1bmN0aW9uIGFuaW1hdGlvbl9sb29wICgpIHtcbiAgLy8gICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAvLyAgICAgICB2YXIgZ3JvdXAgPSBncm91cF9ieV9kYXRlW2xvb3BfY291bnRdO1xuICAvLyAgICAgICByZW5kZXJfcG9pbnRzKGdyb3VwKTtcbiAgLy8gICAgICAgbG9vcF9jb3VudCsrO1xuICAvLyAgICAgICBpZiAobG9vcF9jb3VudCA8IG51bV9kYXRlcykge1xuICAvLyAgICAgICAgIGFuaW1hdGlvbl9sb29wKCk7XG4gIC8vICAgICAgIH1cbiAgLy8gICAgIH0sIDIwKVxuICAvLyAgIH1cbiAgLy8gICBhbmltYXRpb25fbG9vcCgpO1xuICAvLyB9KVxuXG5cblxuICB2YXIgcmVuZGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlcik7XG4gICAgICByZW5kZXJlci5yZW5kZXIoc2NlbmUsIGNhbWVyYSk7XG4gICAgICBzdGF0cy51cGRhdGUoKTtcbiAgfTtcblxuICByZW5kZXIoKTtcbn1cblxuIiwiLy8gdmFyIFRIUkVFID0gcmVxdWlyZSgnLi4vY29tcG9uZW50cy90aHJlZS5qcy9idWlsZC90aHJlZS5qcycpO1xuIFxuZnVuY3Rpb24gRGlnaXRhbEVsZXZhdGlvbk1vZGVsKGltZykge1xuICB0aGlzLmltZyA9IGltZztcbiAgdGhpcy5kYXRhID0gW107XG4gIHRoaXMudmVydGljZXMgPSBbXTtcbiAgdGhpcy54X3NpemUgPSBudWxsO1xuICB0aGlzLnlfc2l6ZSA9IG51bGw7XG4gIHRoaXMudG9wX2xlZnQgPSBudWxsO1xuICB0aGlzLmJvdHRvbV9yaWdodCA9IG51bGw7XG4gIHRoaXMuc2NlbmVfeF9zeiA9IG51bGw7XG4gIHRoaXMuc2NlbmVfeV9zeiA9IG51bGw7XG4gIHRoaXMuZGxvbiA9IG51bGw7XG4gIHRoaXMuZGxhdCA9IG51bGw7XG5cbiAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdjYW52YXMnICk7XG4gIGNhbnZhcy53aWR0aCA9IHRoaXMuaW1nLndpZHRoO1xuICBjYW52YXMuaGVpZ2h0ID0gdGhpcy5pbWcuaGVpZ2h0O1xuICB2YXIgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCAnMmQnICk7XG4gIGNvbnRleHQuZHJhd0ltYWdlKGltZywwLDApO1xuICB2YXIgaW1nZCA9IGNvbnRleHQuZ2V0SW1hZ2VEYXRhKDAsIDAsIHRoaXMuaW1nLndpZHRoLCB0aGlzLmltZy5oZWlnaHQpO1xuICB2YXIgcGl4ID0gaW1nZC5kYXRhO1xuXG4gIHZhciBjb3VudGVyID0wO1xuICBmb3IgKHZhciBpPTA7IGk8dGhpcy5pbWcuaGVpZ2h0OyBpKyspIHtcbiAgICB2YXIgcm93ID0gbmV3IEZsb2F0MzJBcnJheSh0aGlzLmltZy53aWR0aCk7XG4gICAgZm9yICh2YXIgaj0wOyBqPGltZy53aWR0aDsgaisrKSB7XG4gICAgICByb3dbal0gPSBwaXhbY291bnRlcl07XG4gICAgICBjb3VudGVyICs9IDQ7XG4gICAgICB0aGlzLnZlcnRpY2VzLnB1c2gocGl4W2NvdW50ZXJdKTtcbiAgICB9XG4gICAgdGhpcy5kYXRhLnB1c2gocm93KTtcbiAgfVxuXG4gIHRoaXMuc2V0X2V4dGVudHMgPSBmdW5jdGlvbiAoeF9zaXplLCB5X3NpemUsIHRvcF9sZWZ0LCBib3R0b21fcmlnaHQpIHtcbiAgICB0aGlzLnhfc2l6ZSA9IHhfc2l6ZTtcbiAgICB0aGlzLnlfc2l6ZSA9IHlfc2l6ZTtcbiAgICB0aGlzLnRvcF9sZWZ0ID0gdG9wX2xlZnQ7XG4gICAgdGhpcy5ib3R0b21fcmlnaHQgPSBib3R0b21fcmlnaHQ7XG4gICAgdGhpcy5kbGF0ID0gKHRoaXMudG9wX2xlZnRbMF0gLSB0aGlzLmJvdHRvbV9yaWdodFswXSkgLyB0aGlzLnlfc2l6ZTtcbiAgICB0aGlzLmRsb24gPSAodGhpcy5ib3R0b21fcmlnaHRbMV0gLSB0aGlzLnRvcF9sZWZ0WzFdKSAvIHRoaXMueF9zaXplO1xuXG4gIH07XG5cbiAgdGhpcy5zZXRfc2NlbmVfc2l6ZSA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gICAgdGhpcy5zY2VuZV94X3N6ID0geDtcbiAgICB0aGlzLnNjZW5lX3lfc3ogPSB5O1xuICB9O1xuXG4gIHRoaXMubGF0bG9uMnh5ID0gZnVuY3Rpb24gKGxhdCwgbG9uKSB7XG4gICAgdmFyIG1pbl9sYXQsIG1pbl9sb24sIGksIGo7XG4gICAgbWluX2xhdCA9IHRoaXMuYm90dG9tX3JpZ2h0WzBdO1xuICAgIG1pbl9sb24gPSB0aGlzLnRvcF9sZWZ0WzFdO1xuICAgIGkgPSBNYXRoLmZsb29yKE1hdGguYWJzKChsb24gLSBtaW5fbG9uKSAvIHRoaXMuZGxvbiApKTtcbiAgICBqID0gTWF0aC5mbG9vcihNYXRoLmFicygobGF0IC0gbWluX2xhdCkgLyB0aGlzLmRsYXQgKSk7XG4gICAgcmV0dXJuIFtpLCBqXTtcbiAgfTtcblxuICB0aGlzLmxhdGxvbjJzY2VuZSA9IGZ1bmN0aW9uIChsYXQsIGxvbikge1xuICAgIHZhciBzY2VuZV94LCBzY2VuZV95LCBwb3M7XG4gICAgcG9zID0gdGhpcy5sYXRsb24yeHkobGF0LCBsb24pO1xuICAgIC8vIGNvbnNvbGUubG9nKHgsIHkpXG4gICAgc2NlbmVfeCA9ICh0aGlzLnNjZW5lX3hfc3ogLyAyKSAtICh0aGlzLnNjZW5lX3hfc3ogLyB0aGlzLnhfc2l6ZSkgKiBwb3NbMF07XG4gICAgc2NlbmVfeSA9ICh0aGlzLnNjZW5lX3lfc3ogLyAyKSAtICh0aGlzLnNjZW5lX3lfc3ogLyB0aGlzLnlfc2l6ZSkgKiBwb3NbMV07XG4gICAgcmV0dXJuIFtzY2VuZV94LCBzY2VuZV95XTtcbiAgfTtcblxufVxuXG5leHBvcnRzLkRpZ2l0YWxFbGV2YXRpb25Nb2RlbCA9IERpZ2l0YWxFbGV2YXRpb25Nb2RlbDsiXX0=
