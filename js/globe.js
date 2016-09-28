'use strict';
// var THREE = require('../components/three.js/build/three.js');

function globe_view () {
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 2000 );
  var EARTH_RADIUS = 1000;
  var renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize( window.innerWidth/2, window.innerHeight/2 );
  document.getElementById('globe').appendChild(renderer.domElement);


  var controls = new THREE.OrbitControls( camera );
  controls.enableDamping = true;
  controls.dampingFactor = 0.5;
  controls.zoomSpeed = 0.15;
  controls.rotateSpeed = 0.25;
  controls.minDistance = EARTH_RADIUS * 1.1;
  controls.maxDistance = EARTH_RADIUS * 2;

  // controls.update();
  // controls.addEventListener( 'change', render );


  var geometry = new THREE.SphereGeometry(EARTH_RADIUS, 50, 50);
  var material  = new THREE.MeshPhongMaterial();
  material.map    = THREE.ImageUtils.loadTexture('images/3_no_ice_clouds_8k.jpg');
  material.specularMap    = THREE.ImageUtils.loadTexture('images/elev_bump_4k.jpg');

  var earth = new THREE.Mesh(geometry, material);
  scene.add(earth);

  var axisHelper = new THREE.AxisHelper( 100 );
  scene.add( axisHelper );
  // add lighting
  scene.add(new THREE.AmbientLight(0xffffff));
  // var light = new THREE.DirectionalLight(0xffffff, 1);
  // light.position.set(0,3,5);
  // scene.add(light);

  // camera.position.set(30,0,10);
  camera.position.z = EARTH_RADIUS * 1.5;
  
  // rotate above SE asia
  var rot_earth_phi = 165 * Math.PI / 180,
      rot_earth_theta = -12 * Math.PI / 180;
  earth.rotateY(rot_earth_phi);
  earth.rotateX(rot_earth_theta);





  var circ_geom = new THREE.CircleGeometry(1.0, 32);
  var circ_mat = new THREE.MeshBasicMaterial({color: 0xffff00, opacity: true});
  circ_mat.side = THREE.DoubleSide;


  var vertical_marker_geom = new THREE.CubeGeometry(1, 1, 10);
  var vertical_marker_mesh = new THREE.MeshBasicMaterial({color: 0xb7f4f7, opacity: true});


  d3.csv('data/positions.csv', function (d) {
    return {
      datetime_utc: new Date(d.datetime_utc),
      lat: +d.lat,
      lon: +d.lon
    };
  }, function (data) {
   
    var group_by_date = d3.nest()
      .key(function (d) {return d.datetime_utc.toDateString();})
      .entries(data);

    
    function render_points (group) {
      var pc_geometry = new THREE.Geometry();
      var pc_material = new THREE.PointsMaterial(
        {size: 0.3, color:0xff0000, transparent:true, opacity:0.8}
      );
      var particles = new THREE.Points( pc_geometry, pc_material); 
      var vertical_marker_group = new THREE.Object3D();
      var circle_marker_group = new THREE.Object3D();

    
      group.values.forEach(function (d) {

        var vec = latlon2vector(d.lat, d.lon, EARTH_RADIUS, 0);
        pc_geometry.vertices.push(vec);
        var vm = new THREE.Mesh( vertical_marker_geom, vertical_marker_mesh );
        vm.position.set(vec.x, vec.y, vec.z - 5);
        vertical_marker_group.add(vm);

        var cm = new THREE.Mesh(circ_geom, circ_mat);
        cm.position.set(vec.x, vec.y, vec.z);
        circle_marker_group.add(cm);
      });
      // console.log(group)
      earth.add(particles);
      earth.add(vertical_marker_group);
      earth.add(circle_marker_group);

      return setTimeout( function () {
        earth.remove(vertical_marker_group);
        earth.remove(circle_marker_group);
      }, 20);
    }


    var num_dates = group_by_date.length;
    var loop_count = 0;
    function animation_loop () {
      setTimeout(function () {
        var group = group_by_date[loop_count];
        render_points(group);
        loop_count++;
        if (loop_count < num_dates) {
          animation_loop();
        }
      }, 20);
    }
    animation_loop();
  });



  var render = function () {
      requestAnimationFrame(render);
      renderer.render(scene, camera);
  };

  render();
}



function random_lat_lon () {
  var min_lat = 9,
      max_lat = 15, 
      min_lon = 102, 
      max_lon = 108;

  return [Math.random() * (max_lon - min_lon) + min_lon, Math.random() * (max_lat - min_lat) + min_lat];
}

module.exports = globe_view;

