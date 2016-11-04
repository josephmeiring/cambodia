
// var THREE = require('../components/three.js/build/three.js');
// var geotiff = require('../components/geotiff/src/geotiff.js');
var utils = require('./utils.js');
module.exports = mesh_view;

function mesh_view () {
  'use strict';
  // SCENE
  var scene, camera, renderer, 
      container, controls,
      stats,  
      grid,
      map_width, map_height, 
      data_array, 
      bumpScale = 60.0,
      terrain;

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

  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.bottom = '0px';
  stats.domElement.style.zIndex = 100;
  container.appendChild( stats.domElement );

  controls = new THREE.OrbitControls( camera, renderer.domElement );
   
  var loader = new THREE.TextureLoader();
  loader.load('images/cambodia_heightmap.png', function (bumpTexture) {
    data_array = image2array(bumpTexture.image);
    map_width = bumpTexture.image.width;
    map_height = bumpTexture.image.height;
    // the extents are hard coded from the geoTIFF header info. Probably could load the geoTiff itself
    // to be more robust, but this is one-off. 
    grid = new utils.grid2d(map_width, map_height, 
                [14.9082, 100.95], [10.01653529, 108.64166]);
    grid.set_scene_size(SCREEN_WIDTH, SCREEN_HEIGHT);
    

    bumpTexture.minFilter = THREE.LinearFilter;
    // magnitude of normal displacement
    var customUniforms = {
      bumpTexture:  { type: 't', value: bumpTexture },
      bumpScale:      { type: 'f', value: bumpScale },
    };
    
    // create custom material from the shader code above
    //   that is within specially labelled script tags
    var customMaterial = new THREE.ShaderMaterial( 
    {
      uniforms: customUniforms,
      vertexShader:   document.getElementById( 'vertexShader'   ).textContent,
      fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
      side: THREE.DoubleSide, 
      wireframe: false, 
      // shading: THREE.FlatShading,
    });
    
    // var planeGeo = new THREE.PlaneGeometry( bumpTexture.image.width, bumpTexture.image.height, 500, 400 );
    var planeGeo = new THREE.PlaneGeometry( bumpTexture.image.width, bumpTexture.image.height, 300, 200 );
    planeGeo.computeFaceNormals();
    planeGeo.computeVertexNormals();
    planeGeo.computeTangents();
    terrain = new THREE.Mesh( planeGeo, customMaterial );
    terrain.rotation.x = -Math.PI / 2;
    scene.add( terrain );
    // fnh = new THREE.FaceNormalsHelper( terrain, 50 );
    // scene.add( fnh );

    renderer.render(scene, camera); 
    add_markers(scene);
    
    // add_marker(11.5449, 104.8922, plane);
    // add_marker(11.5449, 108.9, terrain);
  });

  function add_marker(lat, lon, terrain) {
    var scene_pos = grid.latlon2scene(lat, lon);
    // console.log(scene_pos)
    
    var xy = grid.latlon2xy(lat, lon);
    var height = data_array[xy[1]][xy[0]];
    console.log(height/bumpScale)
    var p1 = new THREE.Vector3(-scene_pos[0], height/bumpScale, scene_pos[1]);
    var p2 = new THREE.Vector3(-scene_pos[0], 20000, scene_pos[1]);
    var arrow = new THREE.ArrowHelper(p2.clone().normalize(), p1, 150, 0xFFFFFF);
    // if (intersects.length > 0) console.log(plane.position.copy(intersects[0].point));
    scene.add(arrow);
  }
  // console.log(material) 

  function add_markers() {
    d3.csv('data/tmp.csv', function (d) {
      return {
        datetime_utc: new Date(d.datetime_utc),
        lat: +d.lat,
        lon: +d.lon
      };
    }, function (data) {
      data = data.slice(0, 100);
      data.forEach(function (d) {
        add_marker(d.lat, d.lon, terrain);
      });
    });
  }

  function image2array(img) {
    var canvas = document.createElement( 'canvas' );
    canvas.width = img.width;
    canvas.height = img.height;
    var context = canvas.getContext( '2d' );
    var data = [];
    context.drawImage(img,0,0);
    var imgd = context.getImageData(0, 0, img.width, img.height);
    var pix = imgd.data;
  
    var counter =0;
    for (var i=0; i<img.height; i++) {
      var row = new Float32Array(img.width);
      for (var j=0; j<img.width; j++) {
        row[j] = pix[counter];
        counter += 4;
      }
      data.push(row);
    }

    return data; 
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

