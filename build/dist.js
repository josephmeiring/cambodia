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

    // the extents are hard coded from the geoTIFF header info. Probably could load the geoTiff itself
    // to be more robust, but this is one-off. 
    grid = new utils.grid2d(bumpTexture.image.width, bumpTexture.image.height, 
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
    }   );
    
    var planeGeo = new THREE.PlaneGeometry( bumpTexture.image.width, bumpTexture.image.height, 400, 300 );
    var plane = new THREE.Mesh( planeGeo, customMaterial );
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = 0;
    scene.add( plane );
    

    var cube = new THREE.Mesh( new THREE.CubeGeometry( 20, 20, 20 ), new THREE.MeshNormalMaterial() );
    cube.position.x = 640;
    cube.position.y = 0;
    cube.position.z = 480;
    scene.add(cube);
    raycaster.setFromCamera(cube, camera );
    var intersects = raycaster.intersectObject(plane);
    console.log(raycaster, intersects);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9pbmRleC5qcyIsImpzL21lc2guanMiLCJqcy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIHZhciBUSFJFRSA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudHMvdGhyZWUuanMvYnVpbGQvdGhyZWUuanMnKTtcbnZhciBtZXNoX3ZpZXcgPSByZXF1aXJlKCcuL21lc2guanMnKTtcblxubWVzaF92aWV3KCk7XG4iLCJcbi8vIHZhciBUSFJFRSA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudHMvdGhyZWUuanMvYnVpbGQvdGhyZWUuanMnKTtcbi8vIHZhciBnZW90aWZmID0gcmVxdWlyZSgnLi4vY29tcG9uZW50cy9nZW90aWZmL3NyYy9nZW90aWZmLmpzJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzLmpzJyk7XG5tb2R1bGUuZXhwb3J0cyA9IG1lc2hfdmlldztcblxuZnVuY3Rpb24gbWVzaF92aWV3ICgpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuICAvLyBTQ0VORVxuICB2YXIgc2NlbmUsIGNhbWVyYSwgcmVuZGVyZXIsIFxuICAgICAgY29udGFpbmVyLCBjb250cm9scywgXG4gICAgICBjdXN0b21Vbmlmb3JtcywgZ3JpZCwgcmF5Y2FzdGVyLCBcbiAgICAgIG1vdXNlID0gbmV3IFRIUkVFLlZlY3RvcjIoKTtcblxuICBmdW5jdGlvbiBvbkRvY3VtZW50TW91c2VNb3ZlKCBldmVudCApIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIG1vdXNlLnggPSAoIGV2ZW50LmNsaWVudFggLyB3aW5kb3cuaW5uZXJXaWR0aCApICogMiAtIDE7XG4gICAgbW91c2UueSA9IC0gKCBldmVudC5jbGllbnRZIC8gd2luZG93LmlubmVySGVpZ2h0ICkgKiAyICsgMTtcbiAgfVxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAnbW91c2Vtb3ZlJywgb25Eb2N1bWVudE1vdXNlTW92ZSwgZmFsc2UgKTtcblxuXG4gIHJheWNhc3RlciA9IG5ldyBUSFJFRS5SYXljYXN0ZXIoKTtcbiAgc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcbiAgLy8gQ0FNRVJBXG4gIHZhciBTQ1JFRU5fV0lEVEggPSB3aW5kb3cuaW5uZXJXaWR0aCwgU0NSRUVOX0hFSUdIVCA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgdmFyIFZJRVdfQU5HTEUgPSA0NSwgQVNQRUNUID0gU0NSRUVOX1dJRFRIIC8gU0NSRUVOX0hFSUdIVCwgTkVBUiA9IDAuMSwgRkFSID0gMjAwMDA7XG4gIGNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSggVklFV19BTkdMRSwgQVNQRUNULCBORUFSLCBGQVIpO1xuICBzY2VuZS5hZGQoY2FtZXJhKTtcbiAgY2FtZXJhLnBvc2l0aW9uLnNldCgwLDIwMDAsMTAwMCk7XG4gIGNhbWVyYS5sb29rQXQoc2NlbmUucG9zaXRpb24pOyAgXG4gIC8vIFJFTkRFUkVSXG4gIFxuICByZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKCB7YW50aWFsaWFzOnRydWV9ICk7XG4gXG4gIHJlbmRlcmVyLnNldFNpemUoU0NSRUVOX1dJRFRILCBTQ1JFRU5fSEVJR0hUKTtcbiAgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoICdtYXAnICk7XG4gIGNvbnRhaW5lci5hcHBlbmRDaGlsZCggcmVuZGVyZXIuZG9tRWxlbWVudCApO1xuICAvLyBFVkVOVFNcbiAgLy8gVEhSRUV4LldpbmRvd1Jlc2l6ZShyZW5kZXJlciwgY2FtZXJhKTtcbiAgLy8gVEhSRUV4LkZ1bGxTY3JlZW4uYmluZEtleSh7IGNoYXJDb2RlIDogJ20nLmNoYXJDb2RlQXQoMCkgfSk7XG4gIC8vIENPTlRST0xTXG4gIGNvbnRyb2xzID0gbmV3IFRIUkVFLk9yYml0Q29udHJvbHMoIGNhbWVyYSwgcmVuZGVyZXIuZG9tRWxlbWVudCApO1xuICBcbiAgLy8gTElHSFRcbiAgdmFyIGxpZ2h0ID0gbmV3IFRIUkVFLkFtYmllbnRMaWdodCgweGZmZmZmZik7XG4gIGxpZ2h0LnBvc2l0aW9uLnNldCgwLDEwMDAsMCk7XG4gIHNjZW5lLmFkZChsaWdodCk7XG4gIFxuICAgLy8gLy8gTElHSFRcbiAgLy8gdmFyIGxpZ2h0MiA9IG5ldyBUSFJFRS5Qb2ludExpZ2h0KDB4ZmZmZmZmKTtcbiAgLy8gbGlnaHQyLnBvc2l0aW9uLnNldCgxMDAwLDEwMDAsMTAwMCk7XG4gIC8vIHNjZW5lLmFkZChsaWdodDIpO1xuICAvLyBGTE9PUlxuICAvLyB2YXIgZmxvb3JUZXh0dXJlID0gbmV3IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoICdpbWFnZXMvY2hlY2tlcmJvYXJkLmpwZycgKTtcbiAgLy8gZmxvb3JUZXh0dXJlLndyYXBTID0gZmxvb3JUZXh0dXJlLndyYXBUID0gVEhSRUUuUmVwZWF0V3JhcHBpbmc7IFxuICAvLyBmbG9vclRleHR1cmUucmVwZWF0LnNldCggMTAsIDEwICk7XG4gIC8vIHZhciBmbG9vck1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKCB7IG1hcDogZmxvb3JUZXh0dXJlLCBzaWRlOiBUSFJFRS5Eb3VibGVTaWRlIH0gKTtcbiAgLy8gdmFyIGZsb29yR2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSgxMDAwLCAxMDAwLCAxMCwgMTApO1xuICAvLyB2YXIgZmxvb3IgPSBuZXcgVEhSRUUuTWVzaChmbG9vckdlb21ldHJ5LCBmbG9vck1hdGVyaWFsKTtcbiAgLy8gZmxvb3IucG9zaXRpb24ueSA9IC0wLjU7XG4gIC8vIGZsb29yLnJvdGF0aW9uLnggPSBNYXRoLlBJIC8gMjtcbiAgLy8gc2NlbmUuYWRkKGZsb29yKTtcbiAgLy8gU0tZQk9YXG4gIHZhciBza3lCb3hHZW9tZXRyeSA9IG5ldyBUSFJFRS5DdWJlR2VvbWV0cnkoIDEwMDAwLCAxMDAwMCwgMTAwMDAgKTtcbiAgdmFyIHNreUJveE1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKCB7IGNvbG9yOiAweDk5OTlmZiwgc2lkZTogVEhSRUUuQmFja1NpZGUgfSApO1xuICB2YXIgc2t5Qm94ID0gbmV3IFRIUkVFLk1lc2goIHNreUJveEdlb21ldHJ5LCBza3lCb3hNYXRlcmlhbCApO1xuICBzY2VuZS5hZGQoc2t5Qm94KTtcbiAgXG4gIC8vLy8vLy8vLy8vL1xuICAvLyBDVVNUT00gLy9cbiAgLy8vLy8vLy8vLy8vXG4gIFxuICAvLyB0ZXh0dXJlIHVzZWQgdG8gZ2VuZXJhdGUgXCJidW1waW5lc3NcIlxuICB2YXIgbG9hZGVyID0gbmV3IFRIUkVFLlRleHR1cmVMb2FkZXIoKTtcbiAgbG9hZGVyLmxvYWQoJ2ltYWdlcy9jYW1ib2RpYV9oZWlnaHRtYXAucG5nJywgZnVuY3Rpb24gKGJ1bXBUZXh0dXJlKSB7XG5cbiAgICAvLyB0aGUgZXh0ZW50cyBhcmUgaGFyZCBjb2RlZCBmcm9tIHRoZSBnZW9USUZGIGhlYWRlciBpbmZvLiBQcm9iYWJseSBjb3VsZCBsb2FkIHRoZSBnZW9UaWZmIGl0c2VsZlxuICAgIC8vIHRvIGJlIG1vcmUgcm9idXN0LCBidXQgdGhpcyBpcyBvbmUtb2ZmLiBcbiAgICBncmlkID0gbmV3IHV0aWxzLmdyaWQyZChidW1wVGV4dHVyZS5pbWFnZS53aWR0aCwgYnVtcFRleHR1cmUuaW1hZ2UuaGVpZ2h0LCBcbiAgICAgICAgICAgICAgICBbMTQuOTA4MiwgMTAwLjk1XSwgWzEwLjAxNjUzNTI5LCAxMDguNjQxNjZdKTtcbiAgICBjb25zb2xlLmxvZyhncmlkLmxhdGxvbjJ4eSgxMS41NDQ5LCAxMDQuODkyMikpO1xuICAgIGJ1bXBUZXh0dXJlLm1pbkZpbHRlciA9IFRIUkVFLkxpbmVhckZpbHRlcjtcbiAgICAvLyBidW1wVGV4dHVyZS53cmFwUyA9IGJ1bXBUZXh0dXJlLndyYXBUID0gVEhSRUUuUmVwZWF0V3JhcHBpbmc7IFxuICAgIC8vIG1hZ25pdHVkZSBvZiBub3JtYWwgZGlzcGxhY2VtZW50XG4gICAgdmFyIGJ1bXBTY2FsZSAgID0gNjAuMDtcbiAgICBcbiAgICAvLyB1c2UgXCJ0aGlzLlwiIHRvIGNyZWF0ZSBnbG9iYWwgb2JqZWN0XG4gICAgY3VzdG9tVW5pZm9ybXMgPSB7XG4gICAgICBidW1wVGV4dHVyZTogIHsgdHlwZTogXCJ0XCIsIHZhbHVlOiBidW1wVGV4dHVyZSB9LFxuICAgICAgYnVtcFNjYWxlOiAgICAgIHsgdHlwZTogXCJmXCIsIHZhbHVlOiBidW1wU2NhbGUgfSxcbiAgICB9O1xuICAgIFxuICAgIC8vIGNyZWF0ZSBjdXN0b20gbWF0ZXJpYWwgZnJvbSB0aGUgc2hhZGVyIGNvZGUgYWJvdmVcbiAgICAvLyAgIHRoYXQgaXMgd2l0aGluIHNwZWNpYWxseSBsYWJlbGxlZCBzY3JpcHQgdGFnc1xuICAgIHZhciBjdXN0b21NYXRlcmlhbCA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCggXG4gICAge1xuICAgICAgICB1bmlmb3JtczogY3VzdG9tVW5pZm9ybXMsXG4gICAgICB2ZXJ0ZXhTaGFkZXI6ICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoICd2ZXJ0ZXhTaGFkZXInICAgKS50ZXh0Q29udGVudCxcbiAgICAgIGZyYWdtZW50U2hhZGVyOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggJ2ZyYWdtZW50U2hhZGVyJyApLnRleHRDb250ZW50LFxuICAgICAgc2lkZTogVEhSRUUuRG91YmxlU2lkZVxuICAgIH0gICApO1xuICAgIFxuICAgIHZhciBwbGFuZUdlbyA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KCBidW1wVGV4dHVyZS5pbWFnZS53aWR0aCwgYnVtcFRleHR1cmUuaW1hZ2UuaGVpZ2h0LCA0MDAsIDMwMCApO1xuICAgIHZhciBwbGFuZSA9IG5ldyBUSFJFRS5NZXNoKCBwbGFuZUdlbywgY3VzdG9tTWF0ZXJpYWwgKTtcbiAgICBwbGFuZS5yb3RhdGlvbi54ID0gLU1hdGguUEkgLyAyO1xuICAgIHBsYW5lLnBvc2l0aW9uLnkgPSAwO1xuICAgIHNjZW5lLmFkZCggcGxhbmUgKTtcbiAgICBcblxuICAgIHZhciBjdWJlID0gbmV3IFRIUkVFLk1lc2goIG5ldyBUSFJFRS5DdWJlR2VvbWV0cnkoIDIwLCAyMCwgMjAgKSwgbmV3IFRIUkVFLk1lc2hOb3JtYWxNYXRlcmlhbCgpICk7XG4gICAgY3ViZS5wb3NpdGlvbi54ID0gNjQwO1xuICAgIGN1YmUucG9zaXRpb24ueSA9IDA7XG4gICAgY3ViZS5wb3NpdGlvbi56ID0gNDgwO1xuICAgIHNjZW5lLmFkZChjdWJlKTtcbiAgICByYXljYXN0ZXIuc2V0RnJvbUNhbWVyYShjdWJlLCBjYW1lcmEgKTtcbiAgICB2YXIgaW50ZXJzZWN0cyA9IHJheWNhc3Rlci5pbnRlcnNlY3RPYmplY3QocGxhbmUpO1xuICAgIGNvbnNvbGUubG9nKHJheWNhc3RlciwgaW50ZXJzZWN0cyk7XG4gIH0pO1xuICAvLyBjb25zb2xlLmxvZyhtYXRlcmlhbCkgXG5cbiAgLy8gZDMuY3N2KCdkYXRhL3Bvc2l0aW9ucy5jc3YnLCBmdW5jdGlvbiAoZCkge1xuICAvLyAgIHJldHVybiB7XG4gIC8vICAgICBkYXRldGltZV91dGM6IG5ldyBEYXRlKGQuZGF0ZXRpbWVfdXRjKSxcbiAgLy8gICAgIGxhdDogK2QubGF0LFxuICAvLyAgICAgbG9uOiArZC5sb25cbiAgLy8gICB9XG4gIC8vIH0sIGZ1bmN0aW9uIChkYXRhKSB7XG4gICBcbiAgLy8gICB2YXIgZ3JvdXBfYnlfZGF0ZSA9IGQzLm5lc3QoKVxuICAvLyAgICAgLmtleShmdW5jdGlvbiAoZCkge3JldHVybiBkLmRhdGV0aW1lX3V0Yy50b0RhdGVTdHJpbmcoKX0pXG4gIC8vICAgICAuZW50cmllcyhkYXRhKTtcblxuICAgIFxuICAvLyAgIGZ1bmN0aW9uIHJlbmRlcl9wb2ludHMgKGdyb3VwKSB7XG4gIC8vICAgICB2YXIgcGNfZ2VvbWV0cnkgPSBuZXcgVEhSRUUuR2VvbWV0cnkoKTtcbiAgLy8gICAgIHZhciBwY19tYXRlcmlhbCA9IG5ldyBUSFJFRS5Qb2ludHNNYXRlcmlhbChcbiAgLy8gICAgICAge3NpemU6IDAuMywgY29sb3I6MHhmZjAwMDAsIHRyYW5zcGFyZW50OnRydWUsIG9wYWNpdHk6MC44fVxuICAvLyAgICAgKTtcbiAgLy8gICAgIHZhciBwYXJ0aWNsZXMgPSBuZXcgVEhSRUUuUG9pbnRzKCBwY19nZW9tZXRyeSwgcGNfbWF0ZXJpYWwpOyBcbiAgLy8gICAgIHZhciB2ZXJ0aWNhbF9tYXJrZXJfZ3JvdXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcbiAgLy8gICAgIHZhciBjaXJjbGVfbWFya2VyX2dyb3VwID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XG5cbiAgICBcbiAgLy8gICAgIGdyb3VwLnZhbHVlcy5mb3JFYWNoKGZ1bmN0aW9uIChkKSB7XG5cbiAgLy8gICAgICAgdmFyIHZlYyA9IGxhdGxvbjJ2ZWN0b3IoZC5sYXQsIGQubG9uLCBFQVJUSF9SQURJVVMsIDApXG4gIC8vICAgICAgIHBjX2dlb21ldHJ5LnZlcnRpY2VzLnB1c2godmVjKTtcbiAgLy8gICAgICAgdmFyIHZtID0gbmV3IFRIUkVFLk1lc2goIHZlcnRpY2FsX21hcmtlcl9nZW9tLCB2ZXJ0aWNhbF9tYXJrZXJfbWVzaCApO1xuICAvLyAgICAgICB2bS5wb3NpdGlvbi5zZXQodmVjLngsIHZlYy55LCB2ZWMueiAtIDUpXG4gIC8vICAgICAgIHZlcnRpY2FsX21hcmtlcl9ncm91cC5hZGQodm0pO1xuXG4gIC8vICAgICAgIHZhciBjbSA9IG5ldyBUSFJFRS5NZXNoKGNpcmNfZ2VvbSwgY2lyY19tYXQpO1xuICAvLyAgICAgICBjbS5wb3NpdGlvbi5zZXQodmVjLngsIHZlYy55LCB2ZWMueilcbiAgLy8gICAgICAgY2lyY2xlX21hcmtlcl9ncm91cC5hZGQoY20pXG4gIC8vICAgICB9KVxuICAvLyAgICAgLy8gY29uc29sZS5sb2coZ3JvdXApXG4gIC8vICAgICBlYXJ0aC5hZGQocGFydGljbGVzKVxuICAvLyAgICAgZWFydGguYWRkKHZlcnRpY2FsX21hcmtlcl9ncm91cClcbiAgLy8gICAgIGVhcnRoLmFkZChjaXJjbGVfbWFya2VyX2dyb3VwKVxuXG4gIC8vICAgICByZXR1cm4gc2V0VGltZW91dCggZnVuY3Rpb24gKCkge1xuICAvLyAgICAgICBlYXJ0aC5yZW1vdmUodmVydGljYWxfbWFya2VyX2dyb3VwKTtcbiAgLy8gICAgICAgZWFydGgucmVtb3ZlKGNpcmNsZV9tYXJrZXJfZ3JvdXApO1xuICAvLyAgICAgfSwgMjApXG4gIC8vICAgfVxuXG5cbiAgLy8gICB2YXIgbnVtX2RhdGVzID0gZ3JvdXBfYnlfZGF0ZS5sZW5ndGg7XG4gIC8vICAgdmFyIGxvb3BfY291bnQgPSAwO1xuICAvLyAgIGZ1bmN0aW9uIGFuaW1hdGlvbl9sb29wICgpIHtcbiAgLy8gICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAvLyAgICAgICB2YXIgZ3JvdXAgPSBncm91cF9ieV9kYXRlW2xvb3BfY291bnRdO1xuICAvLyAgICAgICByZW5kZXJfcG9pbnRzKGdyb3VwKTtcbiAgLy8gICAgICAgbG9vcF9jb3VudCsrO1xuICAvLyAgICAgICBpZiAobG9vcF9jb3VudCA8IG51bV9kYXRlcykge1xuICAvLyAgICAgICAgIGFuaW1hdGlvbl9sb29wKCk7XG4gIC8vICAgICAgIH1cbiAgLy8gICAgIH0sIDIwKVxuICAvLyAgIH1cbiAgLy8gICBhbmltYXRpb25fbG9vcCgpO1xuICAvLyB9KVxuXG5cblxuICB2YXIgcmVuZGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlcik7XG4gICAgICByZW5kZXJlci5yZW5kZXIoc2NlbmUsIGNhbWVyYSk7XG4gIH07XG5cbiAgcmVuZGVyKCk7XG59XG5cbiIsIi8vIHZhciBUSFJFRSA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudHMvdGhyZWUuanMvYnVpbGQvdGhyZWUuanMnKTtcblxuZnVuY3Rpb24gbGF0bG9uMnZlY3RvciAobGF0aXR1ZGUsIGxvbmdpdHVkZSwgcmFkaXVzKSB7XG4gXG4gIHZhciBwaGkgPSAobGF0aXR1ZGUpKk1hdGguUEkvMTgwO1xuICB2YXIgdGhldGEgPSAobG9uZ2l0dWRlLTE4MCkqTWF0aC5QSS8xODA7XG5cbiAgdmFyIHggPSAtKHJhZGl1cysxMCkgKiBNYXRoLmNvcyhwaGkpICogTWF0aC5jb3ModGhldGEpO1xuICB2YXIgeSA9IChyYWRpdXMrMTApICogTWF0aC5zaW4ocGhpKTtcbiAgdmFyIHogPSAocmFkaXVzKzEwKSAqIE1hdGguY29zKHBoaSkgKiBNYXRoLnNpbih0aGV0YSk7XG5cbiAgcmV0dXJuIG5ldyBUSFJFRS5WZWN0b3IzKHgseSx6KTtcbn1cblxuZnVuY3Rpb24gZ2VvdGlmZjJhcnJheSh0aWZmKSB7XG4gIHZhciBpbWFnZSwgdywgaCwgb3V0ID0gW107XG5cbiAgaW1hZ2UgPSB0aWZmLmdldEltYWdlKCk7XG4gIHcgPSBpbWFnZS5nZXRXaWR0aCgpO1xuICBoID0gaW1hZ2UuZ2V0SGVpZ2h0KCk7XG4gIHJhc3RlciA9IGltYWdlLnJlYWRSYXN0ZXJzKClbMF07XG4gIGZvciAodmFyIGo9MCwgaz0wOyBqPGg7IGorKykge1xuICAgIG91dC5wdXNoKFtdKTtcbiAgICBmb3IgKHZhciBpPTA7IGk8dzsgaSsrKSB7XG4gICAgICBvdXRbal0ucHVzaChyYXN0ZXJba10pO1xuICAgICAgaysrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gb3V0O1xufVxuXG5mdW5jdGlvbiBncmlkMmQoeF9zaXplLCB5X3NpemUsIHRvcF9sZWZ0LCBib3R0b21fcmlnaHQpIHtcblxuICAvKlxuICAgIHhfc2l6ZSA9IGludCBwaXhlbHNcbiAgICB5X3NpemUgPSBpbnQgcGl4ZWxzXG4gICAgdG9wX2xlZnQgPSBbbGF0LCBsb25dXG4gICAgYm90dG9tX3JpZ2h0ID0gW2xhdCwgbG9uXVxuICAqL1xuXG4gIHZhciBzZWxmID0gdGhpcztcbiAgc2VsZi54X3NpemUgPSB4X3NpemU7XG4gIHNlbGYueV9zaXplID0geV9zaXplO1xuICBzZWxmLnRvcF9sZWZ0ID0gdG9wX2xlZnQ7XG4gIHNlbGYuYm90dG9tX3JpZ2h0ID0gYm90dG9tX3JpZ2h0O1xuXG4gIHNlbGYuZGxvbiA9ICsoc2VsZi50b3BfbGVmdFsxXSAtIHNlbGYuYm90dG9tX3JpZ2h0WzFdKS9zZWxmLnlfc2l6ZTtcbiAgc2VsZi5kbGF0ID0gKyhzZWxmLnRvcF9sZWZ0WzBdIC0gc2VsZi5ib3R0b21fcmlnaHRbMF0pL3NlbGYueF9zaXplO1xuXG4gIHNlbGYubGF0bG9uMnh5ID0gZnVuY3Rpb24gKGxhdCwgbG9uKSB7XG4gICAgdmFyIG1pbl9sYXQsIG1pbl9sb24sIGksIGo7XG4gICAgbWluX2xhdCA9IHNlbGYuYm90dG9tX3JpZ2h0WzBdO1xuICAgIG1pbl9sb24gPSBzZWxmLnRvcF9sZWZ0WzFdO1xuICAgIGkgPSBNYXRoLmZsb29yKE1hdGguYWJzKChsb24gLSBtaW5fbG9uKSAvIHNlbGYuZGxvbiApKTtcbiAgICBqID0gTWF0aC5mbG9vcihNYXRoLmFicygobGF0IC0gbWluX2xhdCkgLyBzZWxmLmRsYXQgKSk7XG4gICAgcmV0dXJuIFtpLCBqXTtcbiAgfTtcblxufVxuXG5leHBvcnRzLmxhdGxvbjJ2ZWN0b3IgPSBsYXRsb24ydmVjdG9yO1xuZXhwb3J0cy5nZW90aWZmMmFycmF5ID0gZ2VvdGlmZjJhcnJheTtcbmV4cG9ydHMuZ3JpZDJkID0gZ3JpZDJkOyJdfQ==
