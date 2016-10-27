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
      map_width, map_height, plane,
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
  var axisHelper = new THREE.AxisHelper( 20 );
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
    grid.set_scene_size(SCREEN_WIDTH, SCREEN_HEIGHT);
    

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
    
    var planeGeo = new THREE.PlaneGeometry( bumpTexture.image.width, bumpTexture.image.height, 500, 400 );
    plane = new THREE.Mesh( planeGeo, customMaterial );
    console.log(plane)
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = 0;
    plane.position.x = 0;
    scene.add( plane );
    
    add_markers(scene);
    
    add_marker(11.5449, 104.8922, plane);
  });

  function add_marker(lat, lon, plane) {
    var scene_pos = grid.latlon2scene(lat, lon);
    var p1 = new THREE.Vector3(-scene_pos[0], 0, scene_pos[1]);
    var p2 = new THREE.Vector3(-scene_pos[0], 20000, scene_pos[1]);
    var arrow = new THREE.ArrowHelper(p2.clone().normalize(), p1, 100, 0xFFFFFF);
    var direction = new THREE.Vector3 (0, -1, 0);
    raycaster = new THREE.Raycaster(p1, direction);
    var myIntersects = raycaster.intersectObject(plane);
    console.log(myIntersects);
    scene.add(arrow);
  }
  // console.log(material) 

  function add_markers() {
    d3.csv('data/positions.csv', function (d) {
      return {
        datetime_utc: new Date(d.datetime_utc),
        lat: +d.lat,
        lon: +d.lon
      };
    }, function (data) {
      data = data.slice(0, 100);
      console.log(data)
      data.forEach(function (d) {
        add_marker(d.lat, d.lon, plane);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9pbmRleC5qcyIsImpzL21lc2guanMiLCJqcy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gdmFyIFRIUkVFID0gcmVxdWlyZSgnLi4vY29tcG9uZW50cy90aHJlZS5qcy9idWlsZC90aHJlZS5qcycpO1xudmFyIG1lc2hfdmlldyA9IHJlcXVpcmUoJy4vbWVzaC5qcycpO1xuXG5tZXNoX3ZpZXcoKTtcbiIsIlxuLy8gdmFyIFRIUkVFID0gcmVxdWlyZSgnLi4vY29tcG9uZW50cy90aHJlZS5qcy9idWlsZC90aHJlZS5qcycpO1xuLy8gdmFyIGdlb3RpZmYgPSByZXF1aXJlKCcuLi9jb21wb25lbnRzL2dlb3RpZmYvc3JjL2dlb3RpZmYuanMnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMuanMnKTtcbm1vZHVsZS5leHBvcnRzID0gbWVzaF92aWV3O1xuXG5mdW5jdGlvbiBtZXNoX3ZpZXcgKCkge1xuICAndXNlIHN0cmljdCc7XG4gIC8vIFNDRU5FXG4gIHZhciBzY2VuZSwgY2FtZXJhLCByZW5kZXJlciwgXG4gICAgICBjb250YWluZXIsIGNvbnRyb2xzLCBcbiAgICAgIGN1c3RvbVVuaWZvcm1zLCBncmlkLCByYXljYXN0ZXIsIFxuICAgICAgbWFwX3dpZHRoLCBtYXBfaGVpZ2h0LCBwbGFuZSxcbiAgICAgIG1vdXNlID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcblxuICBmdW5jdGlvbiBvbkRvY3VtZW50TW91c2VNb3ZlKCBldmVudCApIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIG1vdXNlLnggPSAoIGV2ZW50LmNsaWVudFggLyB3aW5kb3cuaW5uZXJXaWR0aCApICogMiAtIDE7XG4gICAgbW91c2UueSA9IC0gKCBldmVudC5jbGllbnRZIC8gd2luZG93LmlubmVySGVpZ2h0ICkgKiAyICsgMTtcbiAgfVxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAnbW91c2Vtb3ZlJywgb25Eb2N1bWVudE1vdXNlTW92ZSwgZmFsc2UgKTtcblxuXG4gIHJheWNhc3RlciA9IG5ldyBUSFJFRS5SYXljYXN0ZXIoKTtcbiAgc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcbiAgLy8gQ0FNRVJBXG4gIHZhciBTQ1JFRU5fV0lEVEggPSB3aW5kb3cuaW5uZXJXaWR0aCwgU0NSRUVOX0hFSUdIVCA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgdmFyIFZJRVdfQU5HTEUgPSA0NSwgQVNQRUNUID0gU0NSRUVOX1dJRFRIIC8gU0NSRUVOX0hFSUdIVCwgTkVBUiA9IDAuMSwgRkFSID0gMjAwMDA7XG4gIGNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSggVklFV19BTkdMRSwgQVNQRUNULCBORUFSLCBGQVIpO1xuICBzY2VuZS5hZGQoY2FtZXJhKTtcbiAgY2FtZXJhLnBvc2l0aW9uLnNldCgwLDIwMDAsMTAwMCk7XG4gIGNhbWVyYS5sb29rQXQoc2NlbmUucG9zaXRpb24pOyAgXG4gIC8vIFJFTkRFUkVSXG4gIFxuICByZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKCB7YW50aWFsaWFzOnRydWV9ICk7XG4gXG4gIHJlbmRlcmVyLnNldFNpemUoU0NSRUVOX1dJRFRILCBTQ1JFRU5fSEVJR0hUKTtcbiAgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoICdtYXAnICk7XG4gIGNvbnRhaW5lci5hcHBlbmRDaGlsZCggcmVuZGVyZXIuZG9tRWxlbWVudCApO1xuICAvLyBFVkVOVFNcbiAgLy8gVEhSRUV4LldpbmRvd1Jlc2l6ZShyZW5kZXJlciwgY2FtZXJhKTtcbiAgLy8gVEhSRUV4LkZ1bGxTY3JlZW4uYmluZEtleSh7IGNoYXJDb2RlIDogJ20nLmNoYXJDb2RlQXQoMCkgfSk7XG4gIC8vIENPTlRST0xTXG4gIGNvbnRyb2xzID0gbmV3IFRIUkVFLk9yYml0Q29udHJvbHMoIGNhbWVyYSwgcmVuZGVyZXIuZG9tRWxlbWVudCApO1xuICBcbiAgLy8gTElHSFRcbiAgdmFyIGxpZ2h0ID0gbmV3IFRIUkVFLkFtYmllbnRMaWdodCgweGZmZmZmZik7XG4gIGxpZ2h0LnBvc2l0aW9uLnNldCgwLDEwMDAsMCk7XG4gIHNjZW5lLmFkZChsaWdodCk7XG4gIFxuICAgLy8gLy8gTElHSFRcbiAgLy8gdmFyIGxpZ2h0MiA9IG5ldyBUSFJFRS5Qb2ludExpZ2h0KDB4ZmZmZmZmKTtcbiAgLy8gbGlnaHQyLnBvc2l0aW9uLnNldCgxMDAwLDEwMDAsMTAwMCk7XG4gIC8vIHNjZW5lLmFkZChsaWdodDIpO1xuICAvLyBGTE9PUlxuICAvLyB2YXIgZmxvb3JUZXh0dXJlID0gbmV3IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoICdpbWFnZXMvY2hlY2tlcmJvYXJkLmpwZycgKTtcbiAgLy8gZmxvb3JUZXh0dXJlLndyYXBTID0gZmxvb3JUZXh0dXJlLndyYXBUID0gVEhSRUUuUmVwZWF0V3JhcHBpbmc7IFxuICAvLyBmbG9vclRleHR1cmUucmVwZWF0LnNldCggMTAsIDEwICk7XG4gIC8vIHZhciBmbG9vck1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKCB7IG1hcDogZmxvb3JUZXh0dXJlLCBzaWRlOiBUSFJFRS5Eb3VibGVTaWRlIH0gKTtcbiAgLy8gdmFyIGZsb29yR2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSgxMDAwLCAxMDAwLCAxMCwgMTApO1xuICAvLyB2YXIgZmxvb3IgPSBuZXcgVEhSRUUuTWVzaChmbG9vckdlb21ldHJ5LCBmbG9vck1hdGVyaWFsKTtcbiAgLy8gZmxvb3IucG9zaXRpb24ueSA9IC0wLjU7XG4gIC8vIGZsb29yLnJvdGF0aW9uLnggPSBNYXRoLlBJIC8gMjtcbiAgLy8gc2NlbmUuYWRkKGZsb29yKTtcbiAgLy8gU0tZQk9YXG4gIC8vIHZhciBza3lCb3hHZW9tZXRyeSA9IG5ldyBUSFJFRS5DdWJlR2VvbWV0cnkoIDEwMDAwLCAxMDAwMCwgMTAwMDAgKTtcbiAgLy8gdmFyIHNreUJveE1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKCB7IGNvbG9yOiAweDk5OTlmZiwgc2lkZTogVEhSRUUuQmFja1NpZGUgfSApO1xuICAvLyB2YXIgc2t5Qm94ID0gbmV3IFRIUkVFLk1lc2goIHNreUJveEdlb21ldHJ5LCBza3lCb3hNYXRlcmlhbCApO1xuICAvLyBzY2VuZS5hZGQoc2t5Qm94KTtcbiAgdmFyIGF4aXNIZWxwZXIgPSBuZXcgVEhSRUUuQXhpc0hlbHBlciggMjAgKTtcbiAgc2NlbmUuYWRkKCBheGlzSGVscGVyICk7XG4gIC8vLy8vLy8vLy8vL1xuICAvLyBDVVNUT00gLy9cbiAgLy8vLy8vLy8vLy8vXG4gIFxuICAvLyB0ZXh0dXJlIHVzZWQgdG8gZ2VuZXJhdGUgXCJidW1waW5lc3NcIlxuICB2YXIgbG9hZGVyID0gbmV3IFRIUkVFLlRleHR1cmVMb2FkZXIoKTtcbiAgbG9hZGVyLmxvYWQoJ2ltYWdlcy9jYW1ib2RpYV9oZWlnaHRtYXAucG5nJywgZnVuY3Rpb24gKGJ1bXBUZXh0dXJlKSB7XG4gICAgbWFwX3dpZHRoID0gYnVtcFRleHR1cmUuaW1hZ2Uud2lkdGg7XG4gICAgbWFwX2hlaWdodCA9IGJ1bXBUZXh0dXJlLmltYWdlLmhlaWdodDtcbiAgICAvLyB0aGUgZXh0ZW50cyBhcmUgaGFyZCBjb2RlZCBmcm9tIHRoZSBnZW9USUZGIGhlYWRlciBpbmZvLiBQcm9iYWJseSBjb3VsZCBsb2FkIHRoZSBnZW9UaWZmIGl0c2VsZlxuICAgIC8vIHRvIGJlIG1vcmUgcm9idXN0LCBidXQgdGhpcyBpcyBvbmUtb2ZmLiBcbiAgICBncmlkID0gbmV3IHV0aWxzLmdyaWQyZChtYXBfd2lkdGgsIG1hcF9oZWlnaHQsIFxuICAgICAgICAgICAgICAgIFsxNC45MDgyLCAxMDAuOTVdLCBbMTAuMDE2NTM1MjksIDEwOC42NDE2Nl0pO1xuICAgIGdyaWQuc2V0X3NjZW5lX3NpemUoU0NSRUVOX1dJRFRILCBTQ1JFRU5fSEVJR0hUKTtcbiAgICBcblxuICAgIGJ1bXBUZXh0dXJlLm1pbkZpbHRlciA9IFRIUkVFLkxpbmVhckZpbHRlcjtcbiAgICAvLyBidW1wVGV4dHVyZS53cmFwUyA9IGJ1bXBUZXh0dXJlLndyYXBUID0gVEhSRUUuUmVwZWF0V3JhcHBpbmc7IFxuICAgIC8vIG1hZ25pdHVkZSBvZiBub3JtYWwgZGlzcGxhY2VtZW50XG4gICAgdmFyIGJ1bXBTY2FsZSAgID0gNjAuMDtcbiAgICBcbiAgICAvLyB1c2UgXCJ0aGlzLlwiIHRvIGNyZWF0ZSBnbG9iYWwgb2JqZWN0XG4gICAgY3VzdG9tVW5pZm9ybXMgPSB7XG4gICAgICBidW1wVGV4dHVyZTogIHsgdHlwZTogXCJ0XCIsIHZhbHVlOiBidW1wVGV4dHVyZSB9LFxuICAgICAgYnVtcFNjYWxlOiAgICAgIHsgdHlwZTogXCJmXCIsIHZhbHVlOiBidW1wU2NhbGUgfSxcbiAgICB9O1xuICAgIFxuICAgIC8vIGNyZWF0ZSBjdXN0b20gbWF0ZXJpYWwgZnJvbSB0aGUgc2hhZGVyIGNvZGUgYWJvdmVcbiAgICAvLyAgIHRoYXQgaXMgd2l0aGluIHNwZWNpYWxseSBsYWJlbGxlZCBzY3JpcHQgdGFnc1xuICAgIHZhciBjdXN0b21NYXRlcmlhbCA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCggXG4gICAge1xuICAgICAgdW5pZm9ybXM6IGN1c3RvbVVuaWZvcm1zLFxuICAgICAgdmVydGV4U2hhZGVyOiAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCAndmVydGV4U2hhZGVyJyAgICkudGV4dENvbnRlbnQsXG4gICAgICBmcmFnbWVudFNoYWRlcjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoICdmcmFnbWVudFNoYWRlcicgKS50ZXh0Q29udGVudCxcbiAgICAgIHNpZGU6IFRIUkVFLkRvdWJsZVNpZGVcbiAgICB9KTtcbiAgICBcbiAgICB2YXIgcGxhbmVHZW8gPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSggYnVtcFRleHR1cmUuaW1hZ2Uud2lkdGgsIGJ1bXBUZXh0dXJlLmltYWdlLmhlaWdodCwgNTAwLCA0MDAgKTtcbiAgICBwbGFuZSA9IG5ldyBUSFJFRS5NZXNoKCBwbGFuZUdlbywgY3VzdG9tTWF0ZXJpYWwgKTtcbiAgICBjb25zb2xlLmxvZyhwbGFuZSlcbiAgICBwbGFuZS5yb3RhdGlvbi54ID0gLU1hdGguUEkgLyAyO1xuICAgIHBsYW5lLnBvc2l0aW9uLnkgPSAwO1xuICAgIHBsYW5lLnBvc2l0aW9uLnggPSAwO1xuICAgIHNjZW5lLmFkZCggcGxhbmUgKTtcbiAgICBcbiAgICBhZGRfbWFya2VycyhzY2VuZSk7XG4gICAgXG4gICAgYWRkX21hcmtlcigxMS41NDQ5LCAxMDQuODkyMiwgcGxhbmUpO1xuICB9KTtcblxuICBmdW5jdGlvbiBhZGRfbWFya2VyKGxhdCwgbG9uLCBwbGFuZSkge1xuICAgIHZhciBzY2VuZV9wb3MgPSBncmlkLmxhdGxvbjJzY2VuZShsYXQsIGxvbik7XG4gICAgdmFyIHAxID0gbmV3IFRIUkVFLlZlY3RvcjMoLXNjZW5lX3Bvc1swXSwgMCwgc2NlbmVfcG9zWzFdKTtcbiAgICB2YXIgcDIgPSBuZXcgVEhSRUUuVmVjdG9yMygtc2NlbmVfcG9zWzBdLCAyMDAwMCwgc2NlbmVfcG9zWzFdKTtcbiAgICB2YXIgYXJyb3cgPSBuZXcgVEhSRUUuQXJyb3dIZWxwZXIocDIuY2xvbmUoKS5ub3JtYWxpemUoKSwgcDEsIDEwMCwgMHhGRkZGRkYpO1xuICAgIHZhciBkaXJlY3Rpb24gPSBuZXcgVEhSRUUuVmVjdG9yMyAoMCwgLTEsIDApO1xuICAgIHJheWNhc3RlciA9IG5ldyBUSFJFRS5SYXljYXN0ZXIocDEsIGRpcmVjdGlvbik7XG4gICAgdmFyIG15SW50ZXJzZWN0cyA9IHJheWNhc3Rlci5pbnRlcnNlY3RPYmplY3QocGxhbmUpO1xuICAgIGNvbnNvbGUubG9nKG15SW50ZXJzZWN0cyk7XG4gICAgc2NlbmUuYWRkKGFycm93KTtcbiAgfVxuICAvLyBjb25zb2xlLmxvZyhtYXRlcmlhbCkgXG5cbiAgZnVuY3Rpb24gYWRkX21hcmtlcnMoKSB7XG4gICAgZDMuY3N2KCdkYXRhL3Bvc2l0aW9ucy5jc3YnLCBmdW5jdGlvbiAoZCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZGF0ZXRpbWVfdXRjOiBuZXcgRGF0ZShkLmRhdGV0aW1lX3V0YyksXG4gICAgICAgIGxhdDogK2QubGF0LFxuICAgICAgICBsb246ICtkLmxvblxuICAgICAgfTtcbiAgICB9LCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgZGF0YSA9IGRhdGEuc2xpY2UoMCwgMTAwKTtcbiAgICAgIGNvbnNvbGUubG9nKGRhdGEpXG4gICAgICBkYXRhLmZvckVhY2goZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgYWRkX21hcmtlcihkLmxhdCwgZC5sb24sIHBsYW5lKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG4gIC8vIGQzLmNzdignZGF0YS9wb3NpdGlvbnMuY3N2JywgZnVuY3Rpb24gKGQpIHtcbiAgLy8gICByZXR1cm4ge1xuICAvLyAgICAgZGF0ZXRpbWVfdXRjOiBuZXcgRGF0ZShkLmRhdGV0aW1lX3V0YyksXG4gIC8vICAgICBsYXQ6ICtkLmxhdCxcbiAgLy8gICAgIGxvbjogK2QubG9uXG4gIC8vICAgfVxuICAvLyB9LCBmdW5jdGlvbiAoZGF0YSkge1xuICAgXG4gIC8vICAgdmFyIGdyb3VwX2J5X2RhdGUgPSBkMy5uZXN0KClcbiAgLy8gICAgIC5rZXkoZnVuY3Rpb24gKGQpIHtyZXR1cm4gZC5kYXRldGltZV91dGMudG9EYXRlU3RyaW5nKCl9KVxuICAvLyAgICAgLmVudHJpZXMoZGF0YSk7XG5cbiAgICBcbiAgLy8gICBmdW5jdGlvbiByZW5kZXJfcG9pbnRzIChncm91cCkge1xuICAvLyAgICAgdmFyIHBjX2dlb21ldHJ5ID0gbmV3IFRIUkVFLkdlb21ldHJ5KCk7XG4gIC8vICAgICB2YXIgcGNfbWF0ZXJpYWwgPSBuZXcgVEhSRUUuUG9pbnRzTWF0ZXJpYWwoXG4gIC8vICAgICAgIHtzaXplOiAwLjMsIGNvbG9yOjB4ZmYwMDAwLCB0cmFuc3BhcmVudDp0cnVlLCBvcGFjaXR5OjAuOH1cbiAgLy8gICAgICk7XG4gIC8vICAgICB2YXIgcGFydGljbGVzID0gbmV3IFRIUkVFLlBvaW50cyggcGNfZ2VvbWV0cnksIHBjX21hdGVyaWFsKTsgXG4gIC8vICAgICB2YXIgdmVydGljYWxfbWFya2VyX2dyb3VwID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XG4gIC8vICAgICB2YXIgY2lyY2xlX21hcmtlcl9ncm91cCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xuXG4gICAgXG4gIC8vICAgICBncm91cC52YWx1ZXMuZm9yRWFjaChmdW5jdGlvbiAoZCkge1xuXG4gIC8vICAgICAgIHZhciB2ZWMgPSBsYXRsb24ydmVjdG9yKGQubGF0LCBkLmxvbiwgRUFSVEhfUkFESVVTLCAwKVxuICAvLyAgICAgICBwY19nZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKHZlYyk7XG4gIC8vICAgICAgIHZhciB2bSA9IG5ldyBUSFJFRS5NZXNoKCB2ZXJ0aWNhbF9tYXJrZXJfZ2VvbSwgdmVydGljYWxfbWFya2VyX21lc2ggKTtcbiAgLy8gICAgICAgdm0ucG9zaXRpb24uc2V0KHZlYy54LCB2ZWMueSwgdmVjLnogLSA1KVxuICAvLyAgICAgICB2ZXJ0aWNhbF9tYXJrZXJfZ3JvdXAuYWRkKHZtKTtcblxuICAvLyAgICAgICB2YXIgY20gPSBuZXcgVEhSRUUuTWVzaChjaXJjX2dlb20sIGNpcmNfbWF0KTtcbiAgLy8gICAgICAgY20ucG9zaXRpb24uc2V0KHZlYy54LCB2ZWMueSwgdmVjLnopXG4gIC8vICAgICAgIGNpcmNsZV9tYXJrZXJfZ3JvdXAuYWRkKGNtKVxuICAvLyAgICAgfSlcbiAgLy8gICAgIC8vIGNvbnNvbGUubG9nKGdyb3VwKVxuICAvLyAgICAgZWFydGguYWRkKHBhcnRpY2xlcylcbiAgLy8gICAgIGVhcnRoLmFkZCh2ZXJ0aWNhbF9tYXJrZXJfZ3JvdXApXG4gIC8vICAgICBlYXJ0aC5hZGQoY2lyY2xlX21hcmtlcl9ncm91cClcblxuICAvLyAgICAgcmV0dXJuIHNldFRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcbiAgLy8gICAgICAgZWFydGgucmVtb3ZlKHZlcnRpY2FsX21hcmtlcl9ncm91cCk7XG4gIC8vICAgICAgIGVhcnRoLnJlbW92ZShjaXJjbGVfbWFya2VyX2dyb3VwKTtcbiAgLy8gICAgIH0sIDIwKVxuICAvLyAgIH1cblxuXG4gIC8vICAgdmFyIG51bV9kYXRlcyA9IGdyb3VwX2J5X2RhdGUubGVuZ3RoO1xuICAvLyAgIHZhciBsb29wX2NvdW50ID0gMDtcbiAgLy8gICBmdW5jdGlvbiBhbmltYXRpb25fbG9vcCAoKSB7XG4gIC8vICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgLy8gICAgICAgdmFyIGdyb3VwID0gZ3JvdXBfYnlfZGF0ZVtsb29wX2NvdW50XTtcbiAgLy8gICAgICAgcmVuZGVyX3BvaW50cyhncm91cCk7XG4gIC8vICAgICAgIGxvb3BfY291bnQrKztcbiAgLy8gICAgICAgaWYgKGxvb3BfY291bnQgPCBudW1fZGF0ZXMpIHtcbiAgLy8gICAgICAgICBhbmltYXRpb25fbG9vcCgpO1xuICAvLyAgICAgICB9XG4gIC8vICAgICB9LCAyMClcbiAgLy8gICB9XG4gIC8vICAgYW5pbWF0aW9uX2xvb3AoKTtcbiAgLy8gfSlcblxuXG5cbiAgdmFyIHJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXIpO1xuICAgICAgcmVuZGVyZXIucmVuZGVyKHNjZW5lLCBjYW1lcmEpO1xuICB9O1xuXG4gIHJlbmRlcigpO1xufVxuXG4iLCIvLyB2YXIgVEhSRUUgPSByZXF1aXJlKCcuLi9jb21wb25lbnRzL3RocmVlLmpzL2J1aWxkL3RocmVlLmpzJyk7XG5cbmZ1bmN0aW9uIGdlb3RpZmYyYXJyYXkodGlmZikge1xuICB2YXIgaW1hZ2UsIHcsIGgsIG91dCA9IFtdO1xuXG4gIGltYWdlID0gdGlmZi5nZXRJbWFnZSgpO1xuICB3ID0gaW1hZ2UuZ2V0V2lkdGgoKTtcbiAgaCA9IGltYWdlLmdldEhlaWdodCgpO1xuICByYXN0ZXIgPSBpbWFnZS5yZWFkUmFzdGVycygpWzBdO1xuICBmb3IgKHZhciBqPTAsIGs9MDsgajxoOyBqKyspIHtcbiAgICBvdXQucHVzaChbXSk7XG4gICAgZm9yICh2YXIgaT0wOyBpPHc7IGkrKykge1xuICAgICAgb3V0W2pdLnB1c2gocmFzdGVyW2tdKTtcbiAgICAgIGsrKztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG91dDtcbn1cblxuZnVuY3Rpb24gZ3JpZDJkKHhfc2l6ZSwgeV9zaXplLCB0b3BfbGVmdCwgYm90dG9tX3JpZ2h0KSB7XG5cbiAgLypcbiAgICB4X3NpemUgPSBpbnQgcGl4ZWxzXG4gICAgeV9zaXplID0gaW50IHBpeGVsc1xuICAgIHRvcF9sZWZ0ID0gW2xhdCwgbG9uXVxuICAgIGJvdHRvbV9yaWdodCA9IFtsYXQsIGxvbl1cbiAgKi9cblxuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHNlbGYueF9zaXplID0geF9zaXplO1xuICBzZWxmLnlfc2l6ZSA9IHlfc2l6ZTtcbiAgc2VsZi50b3BfbGVmdCA9IHRvcF9sZWZ0O1xuICBzZWxmLmJvdHRvbV9yaWdodCA9IGJvdHRvbV9yaWdodDtcbiAgc2VsZi5zY2VuZV94X3N6ID0gbnVsbDtcbiAgc2VsZi5zY2VuZV95X3N6ID0gbnVsbDtcblxuICBzZWxmLmRsb24gPSArKHNlbGYuYm90dG9tX3JpZ2h0WzFdIC0gc2VsZi50b3BfbGVmdFsxXSApL3NlbGYueF9zaXplO1xuICBzZWxmLmRsYXQgPSArKHNlbGYudG9wX2xlZnRbMF0gLSBzZWxmLmJvdHRvbV9yaWdodFswXSkvc2VsZi55X3NpemU7XG5cbiAgc2VsZi5zZXRfc2NlbmVfc2l6ZSA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gICAgc2VsZi5zY2VuZV94X3N6ID0geDtcbiAgICBzZWxmLnNjZW5lX3lfc3ogPSB5O1xuICB9O1xuXG4gIHNlbGYubGF0bG9uMnh5ID0gZnVuY3Rpb24gKGxhdCwgbG9uKSB7XG4gICAgdmFyIG1pbl9sYXQsIG1pbl9sb24sIGksIGo7XG4gICAgbWluX2xhdCA9IHNlbGYuYm90dG9tX3JpZ2h0WzBdO1xuICAgIG1pbl9sb24gPSBzZWxmLnRvcF9sZWZ0WzFdO1xuICAgIGkgPSBNYXRoLmZsb29yKE1hdGguYWJzKChsb24gLSBtaW5fbG9uKSAvIHNlbGYuZGxvbiApKTtcbiAgICBqID0gTWF0aC5mbG9vcihNYXRoLmFicygobGF0IC0gbWluX2xhdCkgLyBzZWxmLmRsYXQgKSk7XG4gICAgcmV0dXJuIFtpLCBqXTtcbiAgfTtcblxuICBzZWxmLmxhdGxvbjJzY2VuZSA9IGZ1bmN0aW9uIChsYXQsIGxvbikge1xuICAgIHZhciBzY2VuZV94LCBzY2VuZV95LCBwb3M7XG4gICAgcG9zID0gc2VsZi5sYXRsb24yeHkobGF0LCBsb24pO1xuICAgIC8vIGNvbnNvbGUubG9nKHgsIHkpXG4gICAgc2NlbmVfeCA9IChzZWxmLnNjZW5lX3hfc3ogLyAyKSAtIChzZWxmLnNjZW5lX3hfc3ogLyBzZWxmLnhfc2l6ZSkgKiBwb3NbMF07XG4gICAgc2NlbmVfeSA9IChzZWxmLnNjZW5lX3lfc3ogLyAyKSAtIChzZWxmLnNjZW5lX3lfc3ogLyBzZWxmLnlfc2l6ZSkgKiBwb3NbMV07XG4gICAgcmV0dXJuIFtzY2VuZV94LCBzY2VuZV95XTtcbiAgfTtcblxufVxuXG5leHBvcnRzLmdlb3RpZmYyYXJyYXkgPSBnZW90aWZmMmFycmF5O1xuZXhwb3J0cy5ncmlkMmQgPSBncmlkMmQ7Il19
