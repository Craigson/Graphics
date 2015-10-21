
// ----------------------- V E C T O R --------------------

function Vector3(x, y, z) {
   this.x = 0;
   this.y = 0;
   this.z = 0;
   this.set(x, y, z);
}

Vector3.prototype = {
   set : function(x, y, z) {
      if (x !== undefined) this.x = x;
      if (y !== undefined) this.y = y;
      if (z !== undefined) this.z = z;
   },
}

//------------------------- C A N V A S -----------------

var startTime = (new Date()).getTime() / 1000, time = startTime;
var canvases = [];
function initCanvas(id) {
   var canvas = document.getElementById(id);
   canvas.setCursor = function(x, y, z) {
      var r = this.getBoundingClientRect();
 this.cursor.set(x - r.left, y - r.top, z);
   }
   canvas.cursor = new Vector3(0, 0, 0);
   canvas.onmousedown = function(e) { this.setCursor(e.clientX, e.clientY, 1); }
   canvas.onmousemove = function(e) { this.setCursor(e.clientX, e.clientY   ); }
   canvas.onmouseup   = function(e) { this.setCursor(e.clientX, e.clientY, 0); }
   canvases.push(canvas);
   return canvas;
}
var counter = 0;
function tick() {
   time = (new Date()).getTime() / 1000 - startTime;
   for (var i = 0 ; i < canvases.length ; i++)
      if (canvases[i].update !== undefined) {
    var canvas = canvases[i];
         var g = canvas.getContext('2d');
         g.clearRect(0, 0, canvas.width, canvas.height);
         // if (counter < 1 ) canvas.update(g);
         canvas.update(g);
      }
   setTimeout(tick, 1000 / 60);
   counter++;
}
tick();

//------------------------ M A T R I X -------------------

function Matrix()
{  
   this.elements = Array(16);
   this.identity();
}

Matrix.prototype = {

  //RESET / INITALIZE THE MATRIX TO ITS IDENTITY
   identity: function () {
      for (var i = 0; i < 16; i++) this.elements[i] = 0;
      this.elements[0*4+0] = 1.0;
      this.elements[1*4+1] = 1.0;
      this.elements[2*4+2] = 1.0;
      this.elements[3*4+3] = 1.0;

   },

   //
   scale: function(_x, _y, _z)
   {

      var x = _x;
      var y = _y;
      var z = _z;

      var tempMatrix = new Matrix();
      tempMatrix.identity();

      tempMatrix.elements[0*4+0] = x;
      tempMatrix.elements[1*4+1] = y;
      tempMatrix.elements[2*4+2] = z;

      this.multiply(tempMatrix);

   },

   translate: function (x, y, z) {

      //CREATE A TEMPORARY MATRIX AND SET THE RESPECTIVE ELEMENTS IN THE 4TH COLUMN
      var tempMatrix = new Matrix();
      tempMatrix.identity();

      tempMatrix.elements[0*4+3] = x;
      tempMatrix.elements[1*4+3] = y;
      tempMatrix.elements[2*4+3] = z;

      //MULTIPLY THE TRANSFORMATION MATRIX BY THE TEMPORARY MATRIX, IE ONLY THE TRANSLATE ELEMENTS
      this.multiply(tempMatrix);


   },


   rotateX: function(theta)
   {
      var cos = Math.cos(theta);
      var sin = Math.sin(theta);

      var tempMatrix = new Matrix();
      tempMatrix.identity();

      tempMatrix.elements[1*4+1] = cos;
      tempMatrix.elements[1*4+2] = -sin;
      tempMatrix.elements[2*4+1] = sin;
      tempMatrix.elements[2*4+2] = cos;

      this.multiply(tempMatrix);

   },


   rotateY: function(theta)
   {
      var cos = Math.cos(theta);
      var sin = Math.sin(theta);

      var tempMatrix = new Matrix();
      tempMatrix.identity();

      tempMatrix.elements[0*4+0] = cos;
      tempMatrix.elements[0*4+2] = sin;
      tempMatrix.elements[2*4+0] = -sin;
      tempMatrix.elements[2*4+2] = cos;

      this.multiply(tempMatrix);

   },

   rotateZ: function(theta)
   {
      var cos = Math.cos(theta);
      var sin = Math.sin(theta);

      var tempMatrix = new Matrix();
      tempMatrix.identity();

      tempMatrix.elements[0*4+0] = cos;
      tempMatrix.elements[0*4+1] = -sin;
      tempMatrix.elements[1*4+0] = sin;
      tempMatrix.elements[1*4+1] = cos;

      this.multiply(tempMatrix);


   },


   transform: function(point)
   {

      var dest = new Vector3();
      var source = new Vector3();

      source.set(point.x, point.y, point.z);

      var x = this.elements[0]*source.x + this.elements[1]*source.y + this.elements[2]*source.z + this.elements[3]*1;
      var y = this.elements[4]*source.x + this.elements[5]*source.y + this.elements[6]*source.z + this.elements[7]*1;
      var z = this.elements[8]*source.x + this.elements[9]*source.y + this.elements[10]*source.z + this.elements[11]*1
      var w = 1;


      dest.set(x,y,z);

      return dest;
    },


   multiply: function (other) {
  

    for (var i = 0; i < 4; i++) {
      this.elements[i*4+0] =

        (this.elements[0*4+i] * other.elements[0]) +
        (this.elements[1*4+i] * other.elements[1]) +
        (this.elements[2*4+i] * other.elements[2]) +
        (this.elements[3*4+i] * other.elements[3]);

      this.elements[i*4+1] =

        (this.elements[0*4+i] * other.elements[4]) +
        (this.elements[1*4+i] * other.elements[5]) +
        (this.elements[2*4+i] * other.elements[6]) +
        (this.elements[3*4+i] * other.elements[7]);

      this.elements[i*4+2] =

        (this.elements[0*4+i] * other.elements[8]) +
        (this.elements[1*4+i] * other.elements[9]) +
        (this.elements[2*4+i] * other.elements[10]) +
        (this.elements[3*4+i] * other.elements[11]);

      this.elements[i*4+3] =

        (this.elements[0*4+i] * other.elements[12]) +
        (this.elements[1*4+i] * other.elements[13]) +
        (this.elements[2*4+i] * other.elements[14]) +
        (this.elements[3*4+i] * other.elements[15]);
    }

   }

}

// ------------------------ C O N V E R T  C A N V A S ---------------------

function convertToCanvas(p, w , h)
{
   var newP = new Vector3();
   newP.set(
      (w/2 + p.x * w/2),
      (h/2 - p.y * w/2),
      0);

   return newP;
}


//------------------------- S H A P E ------------------

function Shape(verts, indices)
   {
      this.vertices = verts; //VECTORS
      this.sides = indices;  //ARRAY OF TWO INDICES
      this.numVerts = this.vertices.length;
      this.numSides = this.sides.length;

      this.p0 = new Vector3();
      this.p1 = new Vector3();

      this.updatedVertices = [];

      this.r = Math.floor(Math.random*255);
      this.g = Math.floor(Math.random*255);
      this.b = Math.floor(Math.random*255);
      
      this.col = toString('rgb(' + this.r +',' + this.g + ',' + this.b + ')');

   }

Shape.prototype = {
   render: function(g,mat,w,h)
   {

      g.beginPath();

      for (var i = 0; i < this.numSides; i++)
      { 
         this.p0.set(
            this.vertices[this.sides[i][0]].x,
            this.vertices[this.sides[i][0]].y,
            0);
            
         this.p1.set(
            this.vertices[this.sides[i][1]].x,
            this.vertices[this.sides[i][1]].y,
            0);

         //APPLY THE TRANSFORMATION MATRIX TO THE CURRENT
         //VERTICES
         var newP0 = mat.transform(this.p0);
         var newP1 = mat.transform(this.p1);

         //SET THE VERTICES' VALUES TO THE UPDATED POSITION
         //FOR THE NEXT FRAME

         newP0 = convertToCanvas(newP0,w,h);
         newP1 = convertToCanvas(newP1,w,h);

         g.moveTo(newP0.x, newP0.y);
         g.lineTo(newP1.x, newP1.y);
      }

      g.stroke();
      g.closePath();
   },
}

