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