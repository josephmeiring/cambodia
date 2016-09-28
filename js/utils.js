var THREE = require('../components/three.js/build/three.js');

function latlon2vector (latitude, longitude, radius) {
 
  var phi = (latitude)*Math.PI/180;
  var theta = (longitude-180)*Math.PI/180;

  var x = -(radius+10) * Math.cos(phi) * Math.cos(theta);
  var y = (radius+10) * Math.sin(phi);
  var z = (radius+10) * Math.cos(phi) * Math.sin(theta);

  return new THREE.Vector3(x,y,z);
}

module.exports = latlon2vector;
