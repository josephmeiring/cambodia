(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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


},{}],2:[function(require,module,exports){
// var THREE = require('../components/three.js/build/three.js');
var globe_view = require('./globe.js');

globe_view();

},{"./globe.js":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9nbG9iZS5qcyIsImpzL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIHZhciBUSFJFRSA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudHMvdGhyZWUuanMvYnVpbGQvdGhyZWUuanMnKTtcblxuZnVuY3Rpb24gZ2xvYmVfdmlldyAoKSB7XG4gIHZhciBzY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xuICB2YXIgY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKCA3NSwgd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQsIDAuMSwgMjAwMCApO1xuICB2YXIgRUFSVEhfUkFESVVTID0gMTAwMDtcbiAgdmFyIHJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoe2FudGlhbGlhczogdHJ1ZX0pO1xuICByZW5kZXJlci5zZXRTaXplKCB3aW5kb3cuaW5uZXJXaWR0aC8yLCB3aW5kb3cuaW5uZXJIZWlnaHQvMiApO1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2xvYmUnKS5hcHBlbmRDaGlsZChyZW5kZXJlci5kb21FbGVtZW50KTtcblxuXG4gIHZhciBjb250cm9scyA9IG5ldyBUSFJFRS5PcmJpdENvbnRyb2xzKCBjYW1lcmEgKTtcbiAgY29udHJvbHMuZW5hYmxlRGFtcGluZyA9IHRydWU7XG4gIGNvbnRyb2xzLmRhbXBpbmdGYWN0b3IgPSAwLjU7XG4gIGNvbnRyb2xzLnpvb21TcGVlZCA9IDAuMTU7XG4gIGNvbnRyb2xzLnJvdGF0ZVNwZWVkID0gMC4yNTtcbiAgY29udHJvbHMubWluRGlzdGFuY2UgPSBFQVJUSF9SQURJVVMgKiAxLjE7XG4gIGNvbnRyb2xzLm1heERpc3RhbmNlID0gRUFSVEhfUkFESVVTICogMjtcblxuICAvLyBjb250cm9scy51cGRhdGUoKTtcbiAgLy8gY29udHJvbHMuYWRkRXZlbnRMaXN0ZW5lciggJ2NoYW5nZScsIHJlbmRlciApO1xuXG5cbiAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KEVBUlRIX1JBRElVUywgNTAsIDUwKTtcbiAgdmFyIG1hdGVyaWFsICA9IG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCgpO1xuICBtYXRlcmlhbC5tYXAgICAgPSBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKCdpbWFnZXMvM19ub19pY2VfY2xvdWRzXzhrLmpwZycpO1xuICBtYXRlcmlhbC5zcGVjdWxhck1hcCAgICA9IFRIUkVFLkltYWdlVXRpbHMubG9hZFRleHR1cmUoJ2ltYWdlcy9lbGV2X2J1bXBfNGsuanBnJyk7XG5cbiAgdmFyIGVhcnRoID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcbiAgc2NlbmUuYWRkKGVhcnRoKTtcblxuICB2YXIgYXhpc0hlbHBlciA9IG5ldyBUSFJFRS5BeGlzSGVscGVyKCAxMDAgKTtcbiAgc2NlbmUuYWRkKCBheGlzSGVscGVyICk7XG4gIC8vIGFkZCBsaWdodGluZ1xuICBzY2VuZS5hZGQobmV3IFRIUkVFLkFtYmllbnRMaWdodCgweGZmZmZmZikpO1xuICAvLyB2YXIgbGlnaHQgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCgweGZmZmZmZiwgMSk7XG4gIC8vIGxpZ2h0LnBvc2l0aW9uLnNldCgwLDMsNSk7XG4gIC8vIHNjZW5lLmFkZChsaWdodCk7XG5cbiAgLy8gY2FtZXJhLnBvc2l0aW9uLnNldCgzMCwwLDEwKTtcbiAgY2FtZXJhLnBvc2l0aW9uLnogPSBFQVJUSF9SQURJVVMgKiAxLjU7XG4gIFxuICAvLyByb3RhdGUgYWJvdmUgU0UgYXNpYVxuICB2YXIgcm90X2VhcnRoX3BoaSA9IDE2NSAqIE1hdGguUEkgLyAxODAsXG4gICAgICByb3RfZWFydGhfdGhldGEgPSAtMTIgKiBNYXRoLlBJIC8gMTgwO1xuICBlYXJ0aC5yb3RhdGVZKHJvdF9lYXJ0aF9waGkpO1xuICBlYXJ0aC5yb3RhdGVYKHJvdF9lYXJ0aF90aGV0YSk7XG5cblxuXG5cblxuICB2YXIgY2lyY19nZW9tID0gbmV3IFRIUkVFLkNpcmNsZUdlb21ldHJ5KDEuMCwgMzIpO1xuICB2YXIgY2lyY19tYXQgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoe2NvbG9yOiAweGZmZmYwMCwgb3BhY2l0eTogdHJ1ZX0pO1xuICBjaXJjX21hdC5zaWRlID0gVEhSRUUuRG91YmxlU2lkZTtcblxuXG4gIHZhciB2ZXJ0aWNhbF9tYXJrZXJfZ2VvbSA9IG5ldyBUSFJFRS5DdWJlR2VvbWV0cnkoMSwgMSwgMTApO1xuICB2YXIgdmVydGljYWxfbWFya2VyX21lc2ggPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoe2NvbG9yOiAweGI3ZjRmNywgb3BhY2l0eTogdHJ1ZX0pO1xuXG5cbiAgZDMuY3N2KCdkYXRhL3Bvc2l0aW9ucy5jc3YnLCBmdW5jdGlvbiAoZCkge1xuICAgIHJldHVybiB7XG4gICAgICBkYXRldGltZV91dGM6IG5ldyBEYXRlKGQuZGF0ZXRpbWVfdXRjKSxcbiAgICAgIGxhdDogK2QubGF0LFxuICAgICAgbG9uOiArZC5sb25cbiAgICB9O1xuICB9LCBmdW5jdGlvbiAoZGF0YSkge1xuICAgXG4gICAgdmFyIGdyb3VwX2J5X2RhdGUgPSBkMy5uZXN0KClcbiAgICAgIC5rZXkoZnVuY3Rpb24gKGQpIHtyZXR1cm4gZC5kYXRldGltZV91dGMudG9EYXRlU3RyaW5nKCk7fSlcbiAgICAgIC5lbnRyaWVzKGRhdGEpO1xuXG4gICAgXG4gICAgZnVuY3Rpb24gcmVuZGVyX3BvaW50cyAoZ3JvdXApIHtcbiAgICAgIHZhciBwY19nZW9tZXRyeSA9IG5ldyBUSFJFRS5HZW9tZXRyeSgpO1xuICAgICAgdmFyIHBjX21hdGVyaWFsID0gbmV3IFRIUkVFLlBvaW50c01hdGVyaWFsKFxuICAgICAgICB7c2l6ZTogMC4zLCBjb2xvcjoweGZmMDAwMCwgdHJhbnNwYXJlbnQ6dHJ1ZSwgb3BhY2l0eTowLjh9XG4gICAgICApO1xuICAgICAgdmFyIHBhcnRpY2xlcyA9IG5ldyBUSFJFRS5Qb2ludHMoIHBjX2dlb21ldHJ5LCBwY19tYXRlcmlhbCk7IFxuICAgICAgdmFyIHZlcnRpY2FsX21hcmtlcl9ncm91cCA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xuICAgICAgdmFyIGNpcmNsZV9tYXJrZXJfZ3JvdXAgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcblxuICAgIFxuICAgICAgZ3JvdXAudmFsdWVzLmZvckVhY2goZnVuY3Rpb24gKGQpIHtcblxuICAgICAgICB2YXIgdmVjID0gbGF0bG9uMnZlY3RvcihkLmxhdCwgZC5sb24sIEVBUlRIX1JBRElVUywgMCk7XG4gICAgICAgIHBjX2dlb21ldHJ5LnZlcnRpY2VzLnB1c2godmVjKTtcbiAgICAgICAgdmFyIHZtID0gbmV3IFRIUkVFLk1lc2goIHZlcnRpY2FsX21hcmtlcl9nZW9tLCB2ZXJ0aWNhbF9tYXJrZXJfbWVzaCApO1xuICAgICAgICB2bS5wb3NpdGlvbi5zZXQodmVjLngsIHZlYy55LCB2ZWMueiAtIDUpO1xuICAgICAgICB2ZXJ0aWNhbF9tYXJrZXJfZ3JvdXAuYWRkKHZtKTtcblxuICAgICAgICB2YXIgY20gPSBuZXcgVEhSRUUuTWVzaChjaXJjX2dlb20sIGNpcmNfbWF0KTtcbiAgICAgICAgY20ucG9zaXRpb24uc2V0KHZlYy54LCB2ZWMueSwgdmVjLnopO1xuICAgICAgICBjaXJjbGVfbWFya2VyX2dyb3VwLmFkZChjbSk7XG4gICAgICB9KTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKGdyb3VwKVxuICAgICAgZWFydGguYWRkKHBhcnRpY2xlcyk7XG4gICAgICBlYXJ0aC5hZGQodmVydGljYWxfbWFya2VyX2dyb3VwKTtcbiAgICAgIGVhcnRoLmFkZChjaXJjbGVfbWFya2VyX2dyb3VwKTtcblxuICAgICAgcmV0dXJuIHNldFRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZWFydGgucmVtb3ZlKHZlcnRpY2FsX21hcmtlcl9ncm91cCk7XG4gICAgICAgIGVhcnRoLnJlbW92ZShjaXJjbGVfbWFya2VyX2dyb3VwKTtcbiAgICAgIH0sIDIwKTtcbiAgICB9XG5cblxuICAgIHZhciBudW1fZGF0ZXMgPSBncm91cF9ieV9kYXRlLmxlbmd0aDtcbiAgICB2YXIgbG9vcF9jb3VudCA9IDA7XG4gICAgZnVuY3Rpb24gYW5pbWF0aW9uX2xvb3AgKCkge1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBncm91cCA9IGdyb3VwX2J5X2RhdGVbbG9vcF9jb3VudF07XG4gICAgICAgIHJlbmRlcl9wb2ludHMoZ3JvdXApO1xuICAgICAgICBsb29wX2NvdW50Kys7XG4gICAgICAgIGlmIChsb29wX2NvdW50IDwgbnVtX2RhdGVzKSB7XG4gICAgICAgICAgYW5pbWF0aW9uX2xvb3AoKTtcbiAgICAgICAgfVxuICAgICAgfSwgMjApO1xuICAgIH1cbiAgICBhbmltYXRpb25fbG9vcCgpO1xuICB9KTtcblxuXG5cbiAgdmFyIHJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXIpO1xuICAgICAgcmVuZGVyZXIucmVuZGVyKHNjZW5lLCBjYW1lcmEpO1xuICB9O1xuXG4gIHJlbmRlcigpO1xufVxuXG5cblxuZnVuY3Rpb24gcmFuZG9tX2xhdF9sb24gKCkge1xuICB2YXIgbWluX2xhdCA9IDksXG4gICAgICBtYXhfbGF0ID0gMTUsIFxuICAgICAgbWluX2xvbiA9IDEwMiwgXG4gICAgICBtYXhfbG9uID0gMTA4O1xuXG4gIHJldHVybiBbTWF0aC5yYW5kb20oKSAqIChtYXhfbG9uIC0gbWluX2xvbikgKyBtaW5fbG9uLCBNYXRoLnJhbmRvbSgpICogKG1heF9sYXQgLSBtaW5fbGF0KSArIG1pbl9sYXRdO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdsb2JlX3ZpZXc7XG5cbiIsIi8vIHZhciBUSFJFRSA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudHMvdGhyZWUuanMvYnVpbGQvdGhyZWUuanMnKTtcbnZhciBnbG9iZV92aWV3ID0gcmVxdWlyZSgnLi9nbG9iZS5qcycpO1xuXG5nbG9iZV92aWV3KCk7XG4iXX0=
