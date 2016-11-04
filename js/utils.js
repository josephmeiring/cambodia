// var THREE = require('../components/three.js/build/three.js');
 
function DigitalElevationModel(img) {
  this.img = img;
  this.data = [];
  this.vertices = [];
  this.x_size = null;
  this.y_size = null;
  this.top_left = null;
  this.bottom_right = null;
  this.scene_x_sz = null;
  this.scene_y_sz = null;
  this.dlon = null;
  this.dlat = null;

  var canvas = document.createElement( 'canvas' );
  canvas.width = this.img.width;
  canvas.height = this.img.height;
  var context = canvas.getContext( '2d' );
  context.drawImage(img,0,0);
  var imgd = context.getImageData(0, 0, this.img.width, this.img.height);
  var pix = imgd.data;

  var counter =0;
  for (var i=0; i<this.img.height; i++) {
    var row = new Float32Array(this.img.width);
    for (var j=0; j<img.width; j++) {
      row[j] = pix[counter];
      counter += 4;
      this.vertices.push(pix[counter]);
    }
    this.data.push(row);
  }

  this.set_extents = function (x_size, y_size, top_left, bottom_right) {
    this.x_size = x_size;
    this.y_size = y_size;
    this.top_left = top_left;
    this.bottom_right = bottom_right;
    this.dlat = (this.top_left[0] - this.bottom_right[0]) / this.y_size;
    this.dlon = (this.bottom_right[1] - this.top_left[1]) / this.x_size;

  };

  this.set_scene_size = function (x, y) {
    this.scene_x_sz = x;
    this.scene_y_sz = y;
  };

  this.latlon2xy = function (lat, lon) {
    var min_lat, min_lon, i, j;
    min_lat = this.bottom_right[0];
    min_lon = this.top_left[1];
    i = Math.floor(Math.abs((lon - min_lon) / this.dlon ));
    j = Math.floor(Math.abs((lat - min_lat) / this.dlat ));
    return [i, j];
  };

  this.latlon2scene = function (lat, lon) {
    var scene_x, scene_y, pos;
    pos = this.latlon2xy(lat, lon);
    // console.log(x, y)
    scene_x = (this.scene_x_sz / 2) - (this.scene_x_sz / this.x_size) * pos[0];
    scene_y = (this.scene_y_sz / 2) - (this.scene_y_sz / this.y_size) * pos[1];
    return [scene_x, scene_y];
  };

}

exports.DigitalElevationModel = DigitalElevationModel;