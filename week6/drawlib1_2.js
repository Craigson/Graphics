
var Shape = function()
{
   this.vertices = [];
   this.sideIndices = [];
   this.sides = [];
}

Shape.prototype.setVertices = function(args)
{
   for (var i = 0; i < args.length; i++)
   {
      this.vertices[i] = args[i];
      console.log(args[i]);
   }
}

Shape.prototype.setSides = function(args)
{
   for (var i = 0; i < args.length; i+=2)
   {
      this.sides.push([this.vertices[args[i]], this.vertices[args[i+1]]]);
   }
  console.log(this.sides);
}

Shape.prototype.render = function(g, w, col){
   g.lineWidth = w;
   g.strokeStyle = col;
   for (var i = 0; i < this.sides.length; i++){
      var from = convertCoord(this.sides[i][0]);
      var to = convertCoord(this.sides[i][1]);
      g.lineTo(from.x, from.y);
      g.lineTo(to.x, to.y);
   }
   g.stroke();
}

// Shape.prototype.setTranslate = function(x,y,z)
// {
//    if (x != defined && y != defined && z != defined){
//       this.translateMatrix = new Matrix();
//       this.translateMatrix.identity();
//    } else {
//       this.translateMatrix = translate(x,y,z);
//    }
// }

// Shape.prototype.setScale = function(x,y,z)
// {
//    if (x != defined && y != defined && z != defined){
//       this.scaleMatrix = new Matrix();
//       scaleMatrix.identity();
//    } else {
//       this.scaleMatrix = scale(x,y,z);
//    }
// }

// Shape.prototype.setRotate = function(x,y,z)
// {
//    if (x != defined){
//       this.rotXmatrix = new Matrix();
//       this.rotXmatrix.identity();
//    } else {
//       this.rotXmatrix = rotateX();
//    }
// }

// Shape.prototype.update = function()
// {
//    this.transformMatrix = new Matrix();
//    this.transformMatrix.identity();
//    this.transformMatrix.multiplyMatrices(scaleMatrix, rotXmatrix);

// }

var convertCoord = function(old){
   var newX = (canvas.width  / 2) + old.x * (canvas.width / 2);
   var newY = (canvas.height/ 2) - old.y * (canvas.height/ 2);
   var coord = new Vector3(newX, newY, 0);
   return coord;
}

var Matrix = function(){
   this.rows = [];

   return this;
}

Matrix.prototype.identity = function(){
   this.rows = [ [1,0,0,0], [0,1,0,0], [0,0,1,0], [0,0,0,1] ];

   return this;
}

var transform = function(mat,src,dest)
{

   var x, y, z;

   x = mat[0][0]*src.x + mat[0][1]*src.y + mat[0][2]*src.z + mat[0][3]*1;
   y = mat[1][0]*src.x + mat[1][1]*src.y + mat[1][2]*src.z + mat[1][3]*1;
   z = mat[2][0]*src.x + mat[2][1]*src.y + mat[2][2]*src.z + mat[2][3]*1;

   dest.set(x, y, z);
   
}


//BASED ON AN EXAMPLE FROM STACK OVERFLOW : http://stackoverflow.com/questions/27205018/multiply-2-matrices-in-javascript
var multiplyMatrices = function(a,b)
{

   var tempMatrix = new Matrix();
   tempMatrix.identity();

   var aNumRows = a.rows.length, aNumCols = a.rows[0].length,
   bNumRows = b.rows.length, bNumCols = b.rows[0].length,
   m = new Array(aNumRows);  // initialize array of rows
  
   console.log(aNumRows + " " + aNumCols);
   console.log(bNumRows + " " + bNumCols);
   for (var r = 0; r < aNumRows; ++r) {
   m[r] = new Array(bNumCols); // initialize the current row

   for (var c = 0; c < bNumCols; ++c) {
      m[r][c] = 0;             // initialize the current cell
      console.log(m[r][c]);
      for (var i = 0; i < aNumCols; ++i) {
        m[r][c] += a.rows[r][i] * b.rows[i][c];
      }
    }
  }
  tempMatrix = m;
  return tempMatrix;
  console.log(tempMatrix);
}

var translate = function(x, y, z)
{

   var tempMatrix = new Matrix();
   tempMatrix.identity();

   tempMatrix.rows[0] = [1,0,0,x];
   tempMatrix.rows[1] = [0,1,0,y];
   tempMatrix.rows[2] = [0,0,1,z];

   return tempMatrix;
}

var scale = function(x, y, z)
{

   var tempMatrix = new Matrix();
   tempMatrix.identity();

   tempMatrix.rows[0] = [x,0,0,0];
   tempMatrix.rows[1] = [0,y,0,0];
   tempMatrix.rows[2] = [0,0,z,0];

   return tempMatrix;
}


var rotateX = function(theta)
{

   var cos = Math.cos(theta);
   var sin = Math.sin(theta);

   var tempMatrix = new Matrix();
   tempMatrix.identity();

   tempMatrix.rows[0] = [1,0,0,0];
   tempMatrix.rows[1] = [0,cos,sin,0];
   tempMatrix.rows[2] = [0,-sin,cos,0];

   return tempMatrix;
}


var rotateY = function(theta)
{

   var cos = Math.cos(theta);
   var sin = Math.sin(theta);

   var tempMatrix = new Matrix();
   tempMatrix.identity();

   tempMatrix.rows[0] = [cos,0,-sin,0];
   tempMatrix.rows[1] = [0,1,0,0];
   tempMatrix.rows[2] = [sin,0,cos,0];

   return tempMatrix;
}


var rotateZ = function(theta)
{

   var cos = Math.cos(theta);
   var sin = Math.sin(theta);

   var tempMatrix = new Matrix();
   tempMatrix.identity();

   tempMatrix.rows[0] = [cos,sin,0,0];
   tempMatrix.rows[1] = [-sin,cos,sin,0];
   tempMatrix.rows[2] = [0,0,1,0];

   return tempMatrix;
}

var Vector3 = function(x, y, z)
{
this.x = x;
this.y = y;
this.z = z;
}

Vector3.prototype.set = function(x,y,z)
{
this.x = x;
this.y = y;
this.z = z;
}

function Vector3(x, y, z)
{
this.x = 0;
this.y = 0;
this.z = 0;
this.set(x, y, z);
}


var startTime = (new Date()).getTime() / 1000, time = startTime;
var canvases = [];

function initCanvas(id)
 {
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

function tick() 
{
   time = (new Date()).getTime() / 1000 - startTime;
   for (var i = 0 ; i < canvases.length ; i++)
      if (canvases[i].update !== undefined) {
    var canvas = canvases[i];
         var g = canvas.getContext('2d');
         g.clearRect(0, 0, canvas.width, canvas.height);
         canvas.update(g);
      }
   setTimeout(tick, 1000 / 60);
}
tick();









