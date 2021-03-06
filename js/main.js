
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

