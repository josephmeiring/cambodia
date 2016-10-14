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