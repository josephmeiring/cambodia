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
  // SCENE
  var scene, camera, renderer, 
      container, controls, 
      customUniforms, grid, raycaster, 
      map_width, map_height,
      mouse = new THREE.Vector2();

  function onDocumentMouseMove( event ) {
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  }
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );


  raycaster = new THREE.Raycaster();
  scene = new THREE.Scene();
  // CAMERA
  var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
  var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
  camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
  scene.add(camera);
  camera.position.set(0,2000,1000);
  camera.lookAt(scene.position);  
  // RENDERER
  
  renderer = new THREE.WebGLRenderer( {antialias:true} );
 
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  container = document.getElementById( 'map' );
  container.appendChild( renderer.domElement );
  // EVENTS
  // THREEx.WindowResize(renderer, camera);
  // THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });
  // CONTROLS
  controls = new THREE.OrbitControls( camera, renderer.domElement );
  
  // LIGHT
  var light = new THREE.AmbientLight(0xffffff);
  light.position.set(0,1000,0);
  scene.add(light);
  
   // // LIGHT
  // var light2 = new THREE.PointLight(0xffffff);
  // light2.position.set(1000,1000,1000);
  // scene.add(light2);
  // FLOOR
  // var floorTexture = new THREE.ImageUtils.loadTexture( 'images/checkerboard.jpg' );
  // floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
  // floorTexture.repeat.set( 10, 10 );
  // var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
  // var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
  // var floor = new THREE.Mesh(floorGeometry, floorMaterial);
  // floor.position.y = -0.5;
  // floor.rotation.x = Math.PI / 2;
  // scene.add(floor);
  // SKYBOX
  // var skyBoxGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );
  // var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );
  // var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
  // scene.add(skyBox);
  var axisHelper = new THREE.AxisHelper( 5 );
  scene.add( axisHelper );
  ////////////
  // CUSTOM //
  ////////////
  
  // texture used to generate "bumpiness"
  var loader = new THREE.TextureLoader();
  loader.load('images/cambodia_heightmap.png', function (bumpTexture) {
    map_width = bumpTexture.image.width;
    map_height = bumpTexture.image.height;
    // the extents are hard coded from the geoTIFF header info. Probably could load the geoTiff itself
    // to be more robust, but this is one-off. 
    grid = new utils.grid2d(map_width, map_height, 
                [14.9082, 100.95], [10.01653529, 108.64166]);
    console.log(grid.latlon2xy(11.5449, 104.8922));
    bumpTexture.minFilter = THREE.LinearFilter;
    // bumpTexture.wrapS = bumpTexture.wrapT = THREE.RepeatWrapping; 
    // magnitude of normal displacement
    var bumpScale   = 60.0;
    
    // use "this." to create global object
    customUniforms = {
      bumpTexture:  { type: "t", value: bumpTexture },
      bumpScale:      { type: "f", value: bumpScale },
    };
    
    // create custom material from the shader code above
    //   that is within specially labelled script tags
    var customMaterial = new THREE.ShaderMaterial( 
    {
      uniforms: customUniforms,
      vertexShader:   document.getElementById( 'vertexShader'   ).textContent,
      fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
      side: THREE.DoubleSide
    });
    
    var planeGeo = new THREE.PlaneGeometry( bumpTexture.image.width, bumpTexture.image.height, 600, 400 );
    var plane = new THREE.Mesh( planeGeo, customMaterial );
    console.log(plane.geometry.vertices)
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = 0;
    plane.position.x = 0;
    scene.add( plane );
    
    console.log(map_width/2, map_height/2)

    var cube = new THREE.Mesh( new THREE.CubeGeometry( 20, 20, 20 ), new THREE.MeshNormalMaterial() );
    cube.position.x = 0;
    cube.position.y = 15;
    cube.position.z = 0;

    
    scene.add(cube);
    // var ray = new THREE.Ray(new THREE.Vector3(640, 0, 480), new THREE.Vector3(0, 1, 0));
    // scene.updateMatrixWorld();
    // console.log(ray.intersectPlane(plane));
  });
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

  self.dlon = +(self.top_left[1] - self.bottom_right[1])/self.y_size;
  self.dlat = +(self.top_left[0] - self.bottom_right[0])/self.x_size;

  self.latlon2xy = function (lat, lon) {
    var min_lat, min_lon, i, j;
    min_lat = self.bottom_right[0];
    min_lon = self.top_left[1];
    i = Math.floor(Math.abs((lon - min_lon) / self.dlon ));
    j = Math.floor(Math.abs((lat - min_lat) / self.dlat ));
    return [i, j];
  };

}

exports.latlon2vector = latlon2vector;
exports.geotiff2array = geotiff2array;
exports.grid2d = grid2d;
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9pbmRleC5qcyIsImpzL21lc2guanMiLCJqcy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDek1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyB2YXIgVEhSRUUgPSByZXF1aXJlKCcuLi9jb21wb25lbnRzL3RocmVlLmpzL2J1aWxkL3RocmVlLmpzJyk7XG52YXIgbWVzaF92aWV3ID0gcmVxdWlyZSgnLi9tZXNoLmpzJyk7XG5cbm1lc2hfdmlldygpO1xuIiwiXG4vLyB2YXIgVEhSRUUgPSByZXF1aXJlKCcuLi9jb21wb25lbnRzL3RocmVlLmpzL2J1aWxkL3RocmVlLmpzJyk7XG4vLyB2YXIgZ2VvdGlmZiA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudHMvZ2VvdGlmZi9zcmMvZ2VvdGlmZi5qcycpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscy5qcycpO1xubW9kdWxlLmV4cG9ydHMgPSBtZXNoX3ZpZXc7XG5cbmZ1bmN0aW9uIG1lc2hfdmlldyAoKSB7XG4gICd1c2Ugc3RyaWN0JztcbiAgLy8gU0NFTkVcbiAgdmFyIHNjZW5lLCBjYW1lcmEsIHJlbmRlcmVyLCBcbiAgICAgIGNvbnRhaW5lciwgY29udHJvbHMsIFxuICAgICAgY3VzdG9tVW5pZm9ybXMsIGdyaWQsIHJheWNhc3RlciwgXG4gICAgICBtYXBfd2lkdGgsIG1hcF9oZWlnaHQsXG4gICAgICBtb3VzZSA9IG5ldyBUSFJFRS5WZWN0b3IyKCk7XG5cbiAgZnVuY3Rpb24gb25Eb2N1bWVudE1vdXNlTW92ZSggZXZlbnQgKSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBtb3VzZS54ID0gKCBldmVudC5jbGllbnRYIC8gd2luZG93LmlubmVyV2lkdGggKSAqIDIgLSAxO1xuICAgIG1vdXNlLnkgPSAtICggZXZlbnQuY2xpZW50WSAvIHdpbmRvdy5pbm5lckhlaWdodCApICogMiArIDE7XG4gIH1cbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlbW92ZScsIG9uRG9jdW1lbnRNb3VzZU1vdmUsIGZhbHNlICk7XG5cblxuICByYXljYXN0ZXIgPSBuZXcgVEhSRUUuUmF5Y2FzdGVyKCk7XG4gIHNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XG4gIC8vIENBTUVSQVxuICB2YXIgU0NSRUVOX1dJRFRIID0gd2luZG93LmlubmVyV2lkdGgsIFNDUkVFTl9IRUlHSFQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gIHZhciBWSUVXX0FOR0xFID0gNDUsIEFTUEVDVCA9IFNDUkVFTl9XSURUSCAvIFNDUkVFTl9IRUlHSFQsIE5FQVIgPSAwLjEsIEZBUiA9IDIwMDAwO1xuICBjYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoIFZJRVdfQU5HTEUsIEFTUEVDVCwgTkVBUiwgRkFSKTtcbiAgc2NlbmUuYWRkKGNhbWVyYSk7XG4gIGNhbWVyYS5wb3NpdGlvbi5zZXQoMCwyMDAwLDEwMDApO1xuICBjYW1lcmEubG9va0F0KHNjZW5lLnBvc2l0aW9uKTsgIFxuICAvLyBSRU5ERVJFUlxuICBcbiAgcmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcigge2FudGlhbGlhczp0cnVlfSApO1xuIFxuICByZW5kZXJlci5zZXRTaXplKFNDUkVFTl9XSURUSCwgU0NSRUVOX0hFSUdIVCk7XG4gIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCAnbWFwJyApO1xuICBjb250YWluZXIuYXBwZW5kQ2hpbGQoIHJlbmRlcmVyLmRvbUVsZW1lbnQgKTtcbiAgLy8gRVZFTlRTXG4gIC8vIFRIUkVFeC5XaW5kb3dSZXNpemUocmVuZGVyZXIsIGNhbWVyYSk7XG4gIC8vIFRIUkVFeC5GdWxsU2NyZWVuLmJpbmRLZXkoeyBjaGFyQ29kZSA6ICdtJy5jaGFyQ29kZUF0KDApIH0pO1xuICAvLyBDT05UUk9MU1xuICBjb250cm9scyA9IG5ldyBUSFJFRS5PcmJpdENvbnRyb2xzKCBjYW1lcmEsIHJlbmRlcmVyLmRvbUVsZW1lbnQgKTtcbiAgXG4gIC8vIExJR0hUXG4gIHZhciBsaWdodCA9IG5ldyBUSFJFRS5BbWJpZW50TGlnaHQoMHhmZmZmZmYpO1xuICBsaWdodC5wb3NpdGlvbi5zZXQoMCwxMDAwLDApO1xuICBzY2VuZS5hZGQobGlnaHQpO1xuICBcbiAgIC8vIC8vIExJR0hUXG4gIC8vIHZhciBsaWdodDIgPSBuZXcgVEhSRUUuUG9pbnRMaWdodCgweGZmZmZmZik7XG4gIC8vIGxpZ2h0Mi5wb3NpdGlvbi5zZXQoMTAwMCwxMDAwLDEwMDApO1xuICAvLyBzY2VuZS5hZGQobGlnaHQyKTtcbiAgLy8gRkxPT1JcbiAgLy8gdmFyIGZsb29yVGV4dHVyZSA9IG5ldyBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKCAnaW1hZ2VzL2NoZWNrZXJib2FyZC5qcGcnICk7XG4gIC8vIGZsb29yVGV4dHVyZS53cmFwUyA9IGZsb29yVGV4dHVyZS53cmFwVCA9IFRIUkVFLlJlcGVhdFdyYXBwaW5nOyBcbiAgLy8gZmxvb3JUZXh0dXJlLnJlcGVhdC5zZXQoIDEwLCAxMCApO1xuICAvLyB2YXIgZmxvb3JNYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCggeyBtYXA6IGZsb29yVGV4dHVyZSwgc2lkZTogVEhSRUUuRG91YmxlU2lkZSB9ICk7XG4gIC8vIHZhciBmbG9vckdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoMTAwMCwgMTAwMCwgMTAsIDEwKTtcbiAgLy8gdmFyIGZsb29yID0gbmV3IFRIUkVFLk1lc2goZmxvb3JHZW9tZXRyeSwgZmxvb3JNYXRlcmlhbCk7XG4gIC8vIGZsb29yLnBvc2l0aW9uLnkgPSAtMC41O1xuICAvLyBmbG9vci5yb3RhdGlvbi54ID0gTWF0aC5QSSAvIDI7XG4gIC8vIHNjZW5lLmFkZChmbG9vcik7XG4gIC8vIFNLWUJPWFxuICAvLyB2YXIgc2t5Qm94R2VvbWV0cnkgPSBuZXcgVEhSRUUuQ3ViZUdlb21ldHJ5KCAxMDAwMCwgMTAwMDAsIDEwMDAwICk7XG4gIC8vIHZhciBza3lCb3hNYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCggeyBjb2xvcjogMHg5OTk5ZmYsIHNpZGU6IFRIUkVFLkJhY2tTaWRlIH0gKTtcbiAgLy8gdmFyIHNreUJveCA9IG5ldyBUSFJFRS5NZXNoKCBza3lCb3hHZW9tZXRyeSwgc2t5Qm94TWF0ZXJpYWwgKTtcbiAgLy8gc2NlbmUuYWRkKHNreUJveCk7XG4gIHZhciBheGlzSGVscGVyID0gbmV3IFRIUkVFLkF4aXNIZWxwZXIoIDUgKTtcbiAgc2NlbmUuYWRkKCBheGlzSGVscGVyICk7XG4gIC8vLy8vLy8vLy8vL1xuICAvLyBDVVNUT00gLy9cbiAgLy8vLy8vLy8vLy8vXG4gIFxuICAvLyB0ZXh0dXJlIHVzZWQgdG8gZ2VuZXJhdGUgXCJidW1waW5lc3NcIlxuICB2YXIgbG9hZGVyID0gbmV3IFRIUkVFLlRleHR1cmVMb2FkZXIoKTtcbiAgbG9hZGVyLmxvYWQoJ2ltYWdlcy9jYW1ib2RpYV9oZWlnaHRtYXAucG5nJywgZnVuY3Rpb24gKGJ1bXBUZXh0dXJlKSB7XG4gICAgbWFwX3dpZHRoID0gYnVtcFRleHR1cmUuaW1hZ2Uud2lkdGg7XG4gICAgbWFwX2hlaWdodCA9IGJ1bXBUZXh0dXJlLmltYWdlLmhlaWdodDtcbiAgICAvLyB0aGUgZXh0ZW50cyBhcmUgaGFyZCBjb2RlZCBmcm9tIHRoZSBnZW9USUZGIGhlYWRlciBpbmZvLiBQcm9iYWJseSBjb3VsZCBsb2FkIHRoZSBnZW9UaWZmIGl0c2VsZlxuICAgIC8vIHRvIGJlIG1vcmUgcm9idXN0LCBidXQgdGhpcyBpcyBvbmUtb2ZmLiBcbiAgICBncmlkID0gbmV3IHV0aWxzLmdyaWQyZChtYXBfd2lkdGgsIG1hcF9oZWlnaHQsIFxuICAgICAgICAgICAgICAgIFsxNC45MDgyLCAxMDAuOTVdLCBbMTAuMDE2NTM1MjksIDEwOC42NDE2Nl0pO1xuICAgIGNvbnNvbGUubG9nKGdyaWQubGF0bG9uMnh5KDExLjU0NDksIDEwNC44OTIyKSk7XG4gICAgYnVtcFRleHR1cmUubWluRmlsdGVyID0gVEhSRUUuTGluZWFyRmlsdGVyO1xuICAgIC8vIGJ1bXBUZXh0dXJlLndyYXBTID0gYnVtcFRleHR1cmUud3JhcFQgPSBUSFJFRS5SZXBlYXRXcmFwcGluZzsgXG4gICAgLy8gbWFnbml0dWRlIG9mIG5vcm1hbCBkaXNwbGFjZW1lbnRcbiAgICB2YXIgYnVtcFNjYWxlICAgPSA2MC4wO1xuICAgIFxuICAgIC8vIHVzZSBcInRoaXMuXCIgdG8gY3JlYXRlIGdsb2JhbCBvYmplY3RcbiAgICBjdXN0b21Vbmlmb3JtcyA9IHtcbiAgICAgIGJ1bXBUZXh0dXJlOiAgeyB0eXBlOiBcInRcIiwgdmFsdWU6IGJ1bXBUZXh0dXJlIH0sXG4gICAgICBidW1wU2NhbGU6ICAgICAgeyB0eXBlOiBcImZcIiwgdmFsdWU6IGJ1bXBTY2FsZSB9LFxuICAgIH07XG4gICAgXG4gICAgLy8gY3JlYXRlIGN1c3RvbSBtYXRlcmlhbCBmcm9tIHRoZSBzaGFkZXIgY29kZSBhYm92ZVxuICAgIC8vICAgdGhhdCBpcyB3aXRoaW4gc3BlY2lhbGx5IGxhYmVsbGVkIHNjcmlwdCB0YWdzXG4gICAgdmFyIGN1c3RvbU1hdGVyaWFsID0gbmV3IFRIUkVFLlNoYWRlck1hdGVyaWFsKCBcbiAgICB7XG4gICAgICB1bmlmb3JtczogY3VzdG9tVW5pZm9ybXMsXG4gICAgICB2ZXJ0ZXhTaGFkZXI6ICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoICd2ZXJ0ZXhTaGFkZXInICAgKS50ZXh0Q29udGVudCxcbiAgICAgIGZyYWdtZW50U2hhZGVyOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggJ2ZyYWdtZW50U2hhZGVyJyApLnRleHRDb250ZW50LFxuICAgICAgc2lkZTogVEhSRUUuRG91YmxlU2lkZVxuICAgIH0pO1xuICAgIFxuICAgIHZhciBwbGFuZUdlbyA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCBidW1wVGV4dHVyZS5pbWFnZS53aWR0aCwgYnVtcFRleHR1cmUuaW1hZ2UuaGVpZ2h0LCA2MDAsIDQwMCApO1xuICAgIHZhciBwbGFuZSA9IG5ldyBUSFJFRS5NZXNoKCBwbGFuZUdlbywgY3VzdG9tTWF0ZXJpYWwgKTtcbiAgICBjb25zb2xlLmxvZyhwbGFuZS5nZW9tZXRyeS52ZXJ0aWNlcylcbiAgICBwbGFuZS5yb3RhdGlvbi54ID0gLU1hdGguUEkgLyAyO1xuICAgIHBsYW5lLnBvc2l0aW9uLnkgPSAwO1xuICAgIHBsYW5lLnBvc2l0aW9uLnggPSAwO1xuICAgIHNjZW5lLmFkZCggcGxhbmUgKTtcbiAgICBcbiAgICBjb25zb2xlLmxvZyhtYXBfd2lkdGgvMiwgbWFwX2hlaWdodC8yKVxuXG4gICAgdmFyIGN1YmUgPSBuZXcgVEhSRUUuTWVzaCggbmV3IFRIUkVFLkN1YmVHZW9tZXRyeSggMjAsIDIwLCAyMCApLCBuZXcgVEhSRUUuTWVzaE5vcm1hbE1hdGVyaWFsKCkgKTtcbiAgICBjdWJlLnBvc2l0aW9uLnggPSAwO1xuICAgIGN1YmUucG9zaXRpb24ueSA9IDE1O1xuICAgIGN1YmUucG9zaXRpb24ueiA9IDA7XG5cbiAgICBcbiAgICBzY2VuZS5hZGQoY3ViZSk7XG4gICAgLy8gdmFyIHJheSA9IG5ldyBUSFJFRS5SYXkobmV3IFRIUkVFLlZlY3RvcjMoNjQwLCAwLCA0ODApLCBuZXcgVEhSRUUuVmVjdG9yMygwLCAxLCAwKSk7XG4gICAgLy8gc2NlbmUudXBkYXRlTWF0cml4V29ybGQoKTtcbiAgICAvLyBjb25zb2xlLmxvZyhyYXkuaW50ZXJzZWN0UGxhbmUocGxhbmUpKTtcbiAgfSk7XG4gIC8vIGNvbnNvbGUubG9nKG1hdGVyaWFsKSBcblxuICAvLyBkMy5jc3YoJ2RhdGEvcG9zaXRpb25zLmNzdicsIGZ1bmN0aW9uIChkKSB7XG4gIC8vICAgcmV0dXJuIHtcbiAgLy8gICAgIGRhdGV0aW1lX3V0YzogbmV3IERhdGUoZC5kYXRldGltZV91dGMpLFxuICAvLyAgICAgbGF0OiArZC5sYXQsXG4gIC8vICAgICBsb246ICtkLmxvblxuICAvLyAgIH1cbiAgLy8gfSwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgIFxuICAvLyAgIHZhciBncm91cF9ieV9kYXRlID0gZDMubmVzdCgpXG4gIC8vICAgICAua2V5KGZ1bmN0aW9uIChkKSB7cmV0dXJuIGQuZGF0ZXRpbWVfdXRjLnRvRGF0ZVN0cmluZygpfSlcbiAgLy8gICAgIC5lbnRyaWVzKGRhdGEpO1xuXG4gICAgXG4gIC8vICAgZnVuY3Rpb24gcmVuZGVyX3BvaW50cyAoZ3JvdXApIHtcbiAgLy8gICAgIHZhciBwY19nZW9tZXRyeSA9IG5ldyBUSFJFRS5HZW9tZXRyeSgpO1xuICAvLyAgICAgdmFyIHBjX21hdGVyaWFsID0gbmV3IFRIUkVFLlBvaW50c01hdGVyaWFsKFxuICAvLyAgICAgICB7c2l6ZTogMC4zLCBjb2xvcjoweGZmMDAwMCwgdHJhbnNwYXJlbnQ6dHJ1ZSwgb3BhY2l0eTowLjh9XG4gIC8vICAgICApO1xuICAvLyAgICAgdmFyIHBhcnRpY2xlcyA9IG5ldyBUSFJFRS5Qb2ludHMoIHBjX2dlb21ldHJ5LCBwY19tYXRlcmlhbCk7IFxuICAvLyAgICAgdmFyIHZlcnRpY2FsX21hcmtlcl9ncm91cCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xuICAvLyAgICAgdmFyIGNpcmNsZV9tYXJrZXJfZ3JvdXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcblxuICAgIFxuICAvLyAgICAgZ3JvdXAudmFsdWVzLmZvckVhY2goZnVuY3Rpb24gKGQpIHtcblxuICAvLyAgICAgICB2YXIgdmVjID0gbGF0bG9uMnZlY3RvcihkLmxhdCwgZC5sb24sIEVBUlRIX1JBRElVUywgMClcbiAgLy8gICAgICAgcGNfZ2VvbWV0cnkudmVydGljZXMucHVzaCh2ZWMpO1xuICAvLyAgICAgICB2YXIgdm0gPSBuZXcgVEhSRUUuTWVzaCggdmVydGljYWxfbWFya2VyX2dlb20sIHZlcnRpY2FsX21hcmtlcl9tZXNoICk7XG4gIC8vICAgICAgIHZtLnBvc2l0aW9uLnNldCh2ZWMueCwgdmVjLnksIHZlYy56IC0gNSlcbiAgLy8gICAgICAgdmVydGljYWxfbWFya2VyX2dyb3VwLmFkZCh2bSk7XG5cbiAgLy8gICAgICAgdmFyIGNtID0gbmV3IFRIUkVFLk1lc2goY2lyY19nZW9tLCBjaXJjX21hdCk7XG4gIC8vICAgICAgIGNtLnBvc2l0aW9uLnNldCh2ZWMueCwgdmVjLnksIHZlYy56KVxuICAvLyAgICAgICBjaXJjbGVfbWFya2VyX2dyb3VwLmFkZChjbSlcbiAgLy8gICAgIH0pXG4gIC8vICAgICAvLyBjb25zb2xlLmxvZyhncm91cClcbiAgLy8gICAgIGVhcnRoLmFkZChwYXJ0aWNsZXMpXG4gIC8vICAgICBlYXJ0aC5hZGQodmVydGljYWxfbWFya2VyX2dyb3VwKVxuICAvLyAgICAgZWFydGguYWRkKGNpcmNsZV9tYXJrZXJfZ3JvdXApXG5cbiAgLy8gICAgIHJldHVybiBzZXRUaW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4gIC8vICAgICAgIGVhcnRoLnJlbW92ZSh2ZXJ0aWNhbF9tYXJrZXJfZ3JvdXApO1xuICAvLyAgICAgICBlYXJ0aC5yZW1vdmUoY2lyY2xlX21hcmtlcl9ncm91cCk7XG4gIC8vICAgICB9LCAyMClcbiAgLy8gICB9XG5cblxuICAvLyAgIHZhciBudW1fZGF0ZXMgPSBncm91cF9ieV9kYXRlLmxlbmd0aDtcbiAgLy8gICB2YXIgbG9vcF9jb3VudCA9IDA7XG4gIC8vICAgZnVuY3Rpb24gYW5pbWF0aW9uX2xvb3AgKCkge1xuICAvLyAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gIC8vICAgICAgIHZhciBncm91cCA9IGdyb3VwX2J5X2RhdGVbbG9vcF9jb3VudF07XG4gIC8vICAgICAgIHJlbmRlcl9wb2ludHMoZ3JvdXApO1xuICAvLyAgICAgICBsb29wX2NvdW50Kys7XG4gIC8vICAgICAgIGlmIChsb29wX2NvdW50IDwgbnVtX2RhdGVzKSB7XG4gIC8vICAgICAgICAgYW5pbWF0aW9uX2xvb3AoKTtcbiAgLy8gICAgICAgfVxuICAvLyAgICAgfSwgMjApXG4gIC8vICAgfVxuICAvLyAgIGFuaW1hdGlvbl9sb29wKCk7XG4gIC8vIH0pXG5cblxuXG4gIHZhciByZW5kZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVuZGVyKTtcbiAgICAgIHJlbmRlcmVyLnJlbmRlcihzY2VuZSwgY2FtZXJhKTtcbiAgfTtcblxuICByZW5kZXIoKTtcbn1cblxuIiwiLy8gdmFyIFRIUkVFID0gcmVxdWlyZSgnLi4vY29tcG9uZW50cy90aHJlZS5qcy9idWlsZC90aHJlZS5qcycpO1xuXG5mdW5jdGlvbiBsYXRsb24ydmVjdG9yIChsYXRpdHVkZSwgbG9uZ2l0dWRlLCByYWRpdXMpIHtcbiBcbiAgdmFyIHBoaSA9IChsYXRpdHVkZSkqTWF0aC5QSS8xODA7XG4gIHZhciB0aGV0YSA9IChsb25naXR1ZGUtMTgwKSpNYXRoLlBJLzE4MDtcblxuICB2YXIgeCA9IC0ocmFkaXVzKzEwKSAqIE1hdGguY29zKHBoaSkgKiBNYXRoLmNvcyh0aGV0YSk7XG4gIHZhciB5ID0gKHJhZGl1cysxMCkgKiBNYXRoLnNpbihwaGkpO1xuICB2YXIgeiA9IChyYWRpdXMrMTApICogTWF0aC5jb3MocGhpKSAqIE1hdGguc2luKHRoZXRhKTtcblxuICByZXR1cm4gbmV3IFRIUkVFLlZlY3RvcjMoeCx5LHopO1xufVxuXG5mdW5jdGlvbiBnZW90aWZmMmFycmF5KHRpZmYpIHtcbiAgdmFyIGltYWdlLCB3LCBoLCBvdXQgPSBbXTtcblxuICBpbWFnZSA9IHRpZmYuZ2V0SW1hZ2UoKTtcbiAgdyA9IGltYWdlLmdldFdpZHRoKCk7XG4gIGggPSBpbWFnZS5nZXRIZWlnaHQoKTtcbiAgcmFzdGVyID0gaW1hZ2UucmVhZFJhc3RlcnMoKVswXTtcbiAgZm9yICh2YXIgaj0wLCBrPTA7IGo8aDsgaisrKSB7XG4gICAgb3V0LnB1c2goW10pO1xuICAgIGZvciAodmFyIGk9MDsgaTx3OyBpKyspIHtcbiAgICAgIG91dFtqXS5wdXNoKHJhc3RlcltrXSk7XG4gICAgICBrKys7XG4gICAgfVxuICB9XG4gIHJldHVybiBvdXQ7XG59XG5cbmZ1bmN0aW9uIGdyaWQyZCh4X3NpemUsIHlfc2l6ZSwgdG9wX2xlZnQsIGJvdHRvbV9yaWdodCkge1xuXG4gIC8qXG4gICAgeF9zaXplID0gaW50IHBpeGVsc1xuICAgIHlfc2l6ZSA9IGludCBwaXhlbHNcbiAgICB0b3BfbGVmdCA9IFtsYXQsIGxvbl1cbiAgICBib3R0b21fcmlnaHQgPSBbbGF0LCBsb25dXG4gICovXG5cbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBzZWxmLnhfc2l6ZSA9IHhfc2l6ZTtcbiAgc2VsZi55X3NpemUgPSB5X3NpemU7XG4gIHNlbGYudG9wX2xlZnQgPSB0b3BfbGVmdDtcbiAgc2VsZi5ib3R0b21fcmlnaHQgPSBib3R0b21fcmlnaHQ7XG5cbiAgc2VsZi5kbG9uID0gKyhzZWxmLnRvcF9sZWZ0WzFdIC0gc2VsZi5ib3R0b21fcmlnaHRbMV0pL3NlbGYueV9zaXplO1xuICBzZWxmLmRsYXQgPSArKHNlbGYudG9wX2xlZnRbMF0gLSBzZWxmLmJvdHRvbV9yaWdodFswXSkvc2VsZi54X3NpemU7XG5cbiAgc2VsZi5sYXRsb24yeHkgPSBmdW5jdGlvbiAobGF0LCBsb24pIHtcbiAgICB2YXIgbWluX2xhdCwgbWluX2xvbiwgaSwgajtcbiAgICBtaW5fbGF0ID0gc2VsZi5ib3R0b21fcmlnaHRbMF07XG4gICAgbWluX2xvbiA9IHNlbGYudG9wX2xlZnRbMV07XG4gICAgaSA9IE1hdGguZmxvb3IoTWF0aC5hYnMoKGxvbiAtIG1pbl9sb24pIC8gc2VsZi5kbG9uICkpO1xuICAgIGogPSBNYXRoLmZsb29yKE1hdGguYWJzKChsYXQgLSBtaW5fbGF0KSAvIHNlbGYuZGxhdCApKTtcbiAgICByZXR1cm4gW2ksIGpdO1xuICB9O1xuXG59XG5cbmV4cG9ydHMubGF0bG9uMnZlY3RvciA9IGxhdGxvbjJ2ZWN0b3I7XG5leHBvcnRzLmdlb3RpZmYyYXJyYXkgPSBnZW90aWZmMmFycmF5O1xuZXhwb3J0cy5ncmlkMmQgPSBncmlkMmQ7Il19
