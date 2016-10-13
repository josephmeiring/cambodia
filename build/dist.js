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
      customUniforms;
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
  var skyBoxGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );
  var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );
  var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
  scene.add(skyBox);
  
  ////////////
  // CUSTOM //
  ////////////
  
  // texture used to generate "bumpiness"
  var loader = new THREE.TextureLoader();
  loader.load('images/cambodia_heightmap.png', function (bumpTexture) {
    console.log(bumpTexture)
    bumpTexture.minFilter = THREE.NearestFilter;
    // bumpTexture.wrapS = bumpTexture.wrapT = THREE.RepeatWrapping; 
    // magnitude of normal displacement
    var bumpScale   = 50.0;
    
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
    }   );
      
    var planeGeo = new THREE.PlaneGeometry( bumpTexture.image.width, bumpTexture.image.height, 500, 500 );
    var plane = new THREE.Mesh( planeGeo, customMaterial );
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = 0;
    scene.add( plane );
  })
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9pbmRleC5qcyIsImpzL21lc2guanMiLCJqcy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyB2YXIgVEhSRUUgPSByZXF1aXJlKCcuLi9jb21wb25lbnRzL3RocmVlLmpzL2J1aWxkL3RocmVlLmpzJyk7XG52YXIgbWVzaF92aWV3ID0gcmVxdWlyZSgnLi9tZXNoLmpzJyk7XG5cbm1lc2hfdmlldygpO1xuIiwiXG4vLyB2YXIgVEhSRUUgPSByZXF1aXJlKCcuLi9jb21wb25lbnRzL3RocmVlLmpzL2J1aWxkL3RocmVlLmpzJyk7XG4vLyB2YXIgZ2VvdGlmZiA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudHMvZ2VvdGlmZi9zcmMvZ2VvdGlmZi5qcycpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscy5qcycpO1xubW9kdWxlLmV4cG9ydHMgPSBtZXNoX3ZpZXc7XG5cbmZ1bmN0aW9uIG1lc2hfdmlldyAoKSB7XG4gICd1c2Ugc3RyaWN0JztcbiAgLy8gU0NFTkVcbiAgdmFyIHNjZW5lLCBjYW1lcmEsIHJlbmRlcmVyLCBcbiAgICAgIGNvbnRhaW5lciwgY29udHJvbHMsIFxuICAgICAgY3VzdG9tVW5pZm9ybXM7XG4gIHNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XG4gIC8vIENBTUVSQVxuICB2YXIgU0NSRUVOX1dJRFRIID0gd2luZG93LmlubmVyV2lkdGgsIFNDUkVFTl9IRUlHSFQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gIHZhciBWSUVXX0FOR0xFID0gNDUsIEFTUEVDVCA9IFNDUkVFTl9XSURUSCAvIFNDUkVFTl9IRUlHSFQsIE5FQVIgPSAwLjEsIEZBUiA9IDIwMDAwO1xuICBjYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoIFZJRVdfQU5HTEUsIEFTUEVDVCwgTkVBUiwgRkFSKTtcbiAgc2NlbmUuYWRkKGNhbWVyYSk7XG4gIGNhbWVyYS5wb3NpdGlvbi5zZXQoMCwyMDAwLDEwMDApO1xuICBjYW1lcmEubG9va0F0KHNjZW5lLnBvc2l0aW9uKTsgIFxuICAvLyBSRU5ERVJFUlxuICBcbiAgcmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcigge2FudGlhbGlhczp0cnVlfSApO1xuIFxuICByZW5kZXJlci5zZXRTaXplKFNDUkVFTl9XSURUSCwgU0NSRUVOX0hFSUdIVCk7XG4gIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCAnbWFwJyApO1xuICBjb250YWluZXIuYXBwZW5kQ2hpbGQoIHJlbmRlcmVyLmRvbUVsZW1lbnQgKTtcbiAgLy8gRVZFTlRTXG4gIC8vIFRIUkVFeC5XaW5kb3dSZXNpemUocmVuZGVyZXIsIGNhbWVyYSk7XG4gIC8vIFRIUkVFeC5GdWxsU2NyZWVuLmJpbmRLZXkoeyBjaGFyQ29kZSA6ICdtJy5jaGFyQ29kZUF0KDApIH0pO1xuICAvLyBDT05UUk9MU1xuICBjb250cm9scyA9IG5ldyBUSFJFRS5PcmJpdENvbnRyb2xzKCBjYW1lcmEsIHJlbmRlcmVyLmRvbUVsZW1lbnQgKTtcbiAgXG4gIC8vIExJR0hUXG4gIHZhciBsaWdodCA9IG5ldyBUSFJFRS5BbWJpZW50TGlnaHQoMHhmZmZmZmYpO1xuICBsaWdodC5wb3NpdGlvbi5zZXQoMCwxMDAwLDApO1xuICBzY2VuZS5hZGQobGlnaHQpO1xuICBcbiAgIC8vIC8vIExJR0hUXG4gIC8vIHZhciBsaWdodDIgPSBuZXcgVEhSRUUuUG9pbnRMaWdodCgweGZmZmZmZik7XG4gIC8vIGxpZ2h0Mi5wb3NpdGlvbi5zZXQoMTAwMCwxMDAwLDEwMDApO1xuICAvLyBzY2VuZS5hZGQobGlnaHQyKTtcbiAgLy8gRkxPT1JcbiAgLy8gdmFyIGZsb29yVGV4dHVyZSA9IG5ldyBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKCAnaW1hZ2VzL2NoZWNrZXJib2FyZC5qcGcnICk7XG4gIC8vIGZsb29yVGV4dHVyZS53cmFwUyA9IGZsb29yVGV4dHVyZS53cmFwVCA9IFRIUkVFLlJlcGVhdFdyYXBwaW5nOyBcbiAgLy8gZmxvb3JUZXh0dXJlLnJlcGVhdC5zZXQoIDEwLCAxMCApO1xuICAvLyB2YXIgZmxvb3JNYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCggeyBtYXA6IGZsb29yVGV4dHVyZSwgc2lkZTogVEhSRUUuRG91YmxlU2lkZSB9ICk7XG4gIC8vIHZhciBmbG9vckdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoMTAwMCwgMTAwMCwgMTAsIDEwKTtcbiAgLy8gdmFyIGZsb29yID0gbmV3IFRIUkVFLk1lc2goZmxvb3JHZW9tZXRyeSwgZmxvb3JNYXRlcmlhbCk7XG4gIC8vIGZsb29yLnBvc2l0aW9uLnkgPSAtMC41O1xuICAvLyBmbG9vci5yb3RhdGlvbi54ID0gTWF0aC5QSSAvIDI7XG4gIC8vIHNjZW5lLmFkZChmbG9vcik7XG4gIC8vIFNLWUJPWFxuICB2YXIgc2t5Qm94R2VvbWV0cnkgPSBuZXcgVEhSRUUuQ3ViZUdlb21ldHJ5KCAxMDAwMCwgMTAwMDAsIDEwMDAwICk7XG4gIHZhciBza3lCb3hNYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCggeyBjb2xvcjogMHg5OTk5ZmYsIHNpZGU6IFRIUkVFLkJhY2tTaWRlIH0gKTtcbiAgdmFyIHNreUJveCA9IG5ldyBUSFJFRS5NZXNoKCBza3lCb3hHZW9tZXRyeSwgc2t5Qm94TWF0ZXJpYWwgKTtcbiAgc2NlbmUuYWRkKHNreUJveCk7XG4gIFxuICAvLy8vLy8vLy8vLy9cbiAgLy8gQ1VTVE9NIC8vXG4gIC8vLy8vLy8vLy8vL1xuICBcbiAgLy8gdGV4dHVyZSB1c2VkIHRvIGdlbmVyYXRlIFwiYnVtcGluZXNzXCJcbiAgdmFyIGxvYWRlciA9IG5ldyBUSFJFRS5UZXh0dXJlTG9hZGVyKCk7XG4gIGxvYWRlci5sb2FkKCdpbWFnZXMvY2FtYm9kaWFfaGVpZ2h0bWFwLnBuZycsIGZ1bmN0aW9uIChidW1wVGV4dHVyZSkge1xuICAgIGNvbnNvbGUubG9nKGJ1bXBUZXh0dXJlKVxuICAgIGJ1bXBUZXh0dXJlLm1pbkZpbHRlciA9IFRIUkVFLk5lYXJlc3RGaWx0ZXI7XG4gICAgLy8gYnVtcFRleHR1cmUud3JhcFMgPSBidW1wVGV4dHVyZS53cmFwVCA9IFRIUkVFLlJlcGVhdFdyYXBwaW5nOyBcbiAgICAvLyBtYWduaXR1ZGUgb2Ygbm9ybWFsIGRpc3BsYWNlbWVudFxuICAgIHZhciBidW1wU2NhbGUgICA9IDUwLjA7XG4gICAgXG4gICAgLy8gdXNlIFwidGhpcy5cIiB0byBjcmVhdGUgZ2xvYmFsIG9iamVjdFxuICAgIGN1c3RvbVVuaWZvcm1zID0ge1xuICAgICAgYnVtcFRleHR1cmU6ICB7IHR5cGU6IFwidFwiLCB2YWx1ZTogYnVtcFRleHR1cmUgfSxcbiAgICAgIGJ1bXBTY2FsZTogICAgICB7IHR5cGU6IFwiZlwiLCB2YWx1ZTogYnVtcFNjYWxlIH0sXG4gICAgfTtcbiAgICBcbiAgICAvLyBjcmVhdGUgY3VzdG9tIG1hdGVyaWFsIGZyb20gdGhlIHNoYWRlciBjb2RlIGFib3ZlXG4gICAgLy8gICB0aGF0IGlzIHdpdGhpbiBzcGVjaWFsbHkgbGFiZWxsZWQgc2NyaXB0IHRhZ3NcbiAgICB2YXIgY3VzdG9tTWF0ZXJpYWwgPSBuZXcgVEhSRUUuU2hhZGVyTWF0ZXJpYWwoIFxuICAgIHtcbiAgICAgICAgdW5pZm9ybXM6IGN1c3RvbVVuaWZvcm1zLFxuICAgICAgdmVydGV4U2hhZGVyOiAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCAndmVydGV4U2hhZGVyJyAgICkudGV4dENvbnRlbnQsXG4gICAgICBmcmFnbWVudFNoYWRlcjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoICdmcmFnbWVudFNoYWRlcicgKS50ZXh0Q29udGVudCxcbiAgICAgIHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcbiAgICB9ICAgKTtcbiAgICAgIFxuICAgIHZhciBwbGFuZUdlbyA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCBidW1wVGV4dHVyZS5pbWFnZS53aWR0aCwgYnVtcFRleHR1cmUuaW1hZ2UuaGVpZ2h0LCA1MDAsIDUwMCApO1xuICAgIHZhciBwbGFuZSA9IG5ldyBUSFJFRS5NZXNoKCBwbGFuZUdlbywgY3VzdG9tTWF0ZXJpYWwgKTtcbiAgICBwbGFuZS5yb3RhdGlvbi54ID0gLU1hdGguUEkgLyAyO1xuICAgIHBsYW5lLnBvc2l0aW9uLnkgPSAwO1xuICAgIHNjZW5lLmFkZCggcGxhbmUgKTtcbiAgfSlcbiAgLy8gY29uc29sZS5sb2cobWF0ZXJpYWwpIFxuXG4gIC8vIGQzLmNzdignZGF0YS9wb3NpdGlvbnMuY3N2JywgZnVuY3Rpb24gKGQpIHtcbiAgLy8gICByZXR1cm4ge1xuICAvLyAgICAgZGF0ZXRpbWVfdXRjOiBuZXcgRGF0ZShkLmRhdGV0aW1lX3V0YyksXG4gIC8vICAgICBsYXQ6ICtkLmxhdCxcbiAgLy8gICAgIGxvbjogK2QubG9uXG4gIC8vICAgfVxuICAvLyB9LCBmdW5jdGlvbiAoZGF0YSkge1xuICAgXG4gIC8vICAgdmFyIGdyb3VwX2J5X2RhdGUgPSBkMy5uZXN0KClcbiAgLy8gICAgIC5rZXkoZnVuY3Rpb24gKGQpIHtyZXR1cm4gZC5kYXRldGltZV91dGMudG9EYXRlU3RyaW5nKCl9KVxuICAvLyAgICAgLmVudHJpZXMoZGF0YSk7XG5cbiAgICBcbiAgLy8gICBmdW5jdGlvbiByZW5kZXJfcG9pbnRzIChncm91cCkge1xuICAvLyAgICAgdmFyIHBjX2dlb21ldHJ5ID0gbmV3IFRIUkVFLkdlb21ldHJ5KCk7XG4gIC8vICAgICB2YXIgcGNfbWF0ZXJpYWwgPSBuZXcgVEhSRUUuUG9pbnRzTWF0ZXJpYWwoXG4gIC8vICAgICAgIHtzaXplOiAwLjMsIGNvbG9yOjB4ZmYwMDAwLCB0cmFuc3BhcmVudDp0cnVlLCBvcGFjaXR5OjAuOH1cbiAgLy8gICAgICk7XG4gIC8vICAgICB2YXIgcGFydGljbGVzID0gbmV3IFRIUkVFLlBvaW50cyggcGNfZ2VvbWV0cnksIHBjX21hdGVyaWFsKTsgXG4gIC8vICAgICB2YXIgdmVydGljYWxfbWFya2VyX2dyb3VwID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XG4gIC8vICAgICB2YXIgY2lyY2xlX21hcmtlcl9ncm91cCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xuXG4gICAgXG4gIC8vICAgICBncm91cC52YWx1ZXMuZm9yRWFjaChmdW5jdGlvbiAoZCkge1xuXG4gIC8vICAgICAgIHZhciB2ZWMgPSBsYXRsb24ydmVjdG9yKGQubGF0LCBkLmxvbiwgRUFSVEhfUkFESVVTLCAwKVxuICAvLyAgICAgICBwY19nZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKHZlYyk7XG4gIC8vICAgICAgIHZhciB2bSA9IG5ldyBUSFJFRS5NZXNoKCB2ZXJ0aWNhbF9tYXJrZXJfZ2VvbSwgdmVydGljYWxfbWFya2VyX21lc2ggKTtcbiAgLy8gICAgICAgdm0ucG9zaXRpb24uc2V0KHZlYy54LCB2ZWMueSwgdmVjLnogLSA1KVxuICAvLyAgICAgICB2ZXJ0aWNhbF9tYXJrZXJfZ3JvdXAuYWRkKHZtKTtcblxuICAvLyAgICAgICB2YXIgY20gPSBuZXcgVEhSRUUuTWVzaChjaXJjX2dlb20sIGNpcmNfbWF0KTtcbiAgLy8gICAgICAgY20ucG9zaXRpb24uc2V0KHZlYy54LCB2ZWMueSwgdmVjLnopXG4gIC8vICAgICAgIGNpcmNsZV9tYXJrZXJfZ3JvdXAuYWRkKGNtKVxuICAvLyAgICAgfSlcbiAgLy8gICAgIC8vIGNvbnNvbGUubG9nKGdyb3VwKVxuICAvLyAgICAgZWFydGguYWRkKHBhcnRpY2xlcylcbiAgLy8gICAgIGVhcnRoLmFkZCh2ZXJ0aWNhbF9tYXJrZXJfZ3JvdXApXG4gIC8vICAgICBlYXJ0aC5hZGQoY2lyY2xlX21hcmtlcl9ncm91cClcblxuICAvLyAgICAgcmV0dXJuIHNldFRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcbiAgLy8gICAgICAgZWFydGgucmVtb3ZlKHZlcnRpY2FsX21hcmtlcl9ncm91cCk7XG4gIC8vICAgICAgIGVhcnRoLnJlbW92ZShjaXJjbGVfbWFya2VyX2dyb3VwKTtcbiAgLy8gICAgIH0sIDIwKVxuICAvLyAgIH1cblxuXG4gIC8vICAgdmFyIG51bV9kYXRlcyA9IGdyb3VwX2J5X2RhdGUubGVuZ3RoO1xuICAvLyAgIHZhciBsb29wX2NvdW50ID0gMDtcbiAgLy8gICBmdW5jdGlvbiBhbmltYXRpb25fbG9vcCAoKSB7XG4gIC8vICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgLy8gICAgICAgdmFyIGdyb3VwID0gZ3JvdXBfYnlfZGF0ZVtsb29wX2NvdW50XTtcbiAgLy8gICAgICAgcmVuZGVyX3BvaW50cyhncm91cCk7XG4gIC8vICAgICAgIGxvb3BfY291bnQrKztcbiAgLy8gICAgICAgaWYgKGxvb3BfY291bnQgPCBudW1fZGF0ZXMpIHtcbiAgLy8gICAgICAgICBhbmltYXRpb25fbG9vcCgpO1xuICAvLyAgICAgICB9XG4gIC8vICAgICB9LCAyMClcbiAgLy8gICB9XG4gIC8vICAgYW5pbWF0aW9uX2xvb3AoKTtcbiAgLy8gfSlcblxuXG5cbiAgdmFyIHJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXIpO1xuICAgICAgcmVuZGVyZXIucmVuZGVyKHNjZW5lLCBjYW1lcmEpO1xuICB9O1xuXG4gIHJlbmRlcigpO1xufVxuXG4iLCIvLyB2YXIgVEhSRUUgPSByZXF1aXJlKCcuLi9jb21wb25lbnRzL3RocmVlLmpzL2J1aWxkL3RocmVlLmpzJyk7XG5cbmZ1bmN0aW9uIGxhdGxvbjJ2ZWN0b3IgKGxhdGl0dWRlLCBsb25naXR1ZGUsIHJhZGl1cykge1xuIFxuICB2YXIgcGhpID0gKGxhdGl0dWRlKSpNYXRoLlBJLzE4MDtcbiAgdmFyIHRoZXRhID0gKGxvbmdpdHVkZS0xODApKk1hdGguUEkvMTgwO1xuXG4gIHZhciB4ID0gLShyYWRpdXMrMTApICogTWF0aC5jb3MocGhpKSAqIE1hdGguY29zKHRoZXRhKTtcbiAgdmFyIHkgPSAocmFkaXVzKzEwKSAqIE1hdGguc2luKHBoaSk7XG4gIHZhciB6ID0gKHJhZGl1cysxMCkgKiBNYXRoLmNvcyhwaGkpICogTWF0aC5zaW4odGhldGEpO1xuXG4gIHJldHVybiBuZXcgVEhSRUUuVmVjdG9yMyh4LHkseik7XG59XG5cbmZ1bmN0aW9uIGdlb3RpZmYyYXJyYXkodGlmZikge1xuICB2YXIgaW1hZ2UsIHcsIGgsIG91dCA9IFtdO1xuXG4gIGltYWdlID0gdGlmZi5nZXRJbWFnZSgpO1xuICB3ID0gaW1hZ2UuZ2V0V2lkdGgoKTtcbiAgaCA9IGltYWdlLmdldEhlaWdodCgpO1xuICByYXN0ZXIgPSBpbWFnZS5yZWFkUmFzdGVycygpWzBdO1xuICBmb3IgKHZhciBqPTAsIGs9MDsgajxoOyBqKyspIHtcbiAgICBvdXQucHVzaChbXSk7XG4gICAgZm9yICh2YXIgaT0wOyBpPHc7IGkrKykge1xuICAgICAgb3V0W2pdLnB1c2gocmFzdGVyW2tdKTtcbiAgICAgIGsrKztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG91dDtcbn1cblxuZXhwb3J0cy5sYXRsb24ydmVjdG9yID0gbGF0bG9uMnZlY3RvcjtcbmV4cG9ydHMuZ2VvdGlmZjJhcnJheSA9IGdlb3RpZmYyYXJyYXk7XG4iXX0=
