
// ----------------------- V E C T O R  3 --------------------

function Vector3(x, y, z) 
{
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
   subtract : function(vectorFrom)
   {
    
    var tempX = this.x - vectorFrom.x;
    var tempY = this.y - vectorFrom.y;
    var tempZ = this.z - vectorFrom.z;

    var tempVec = new Vector3(tempX, tempY, tempZ);

    return tempVec;

   },

   add: function(addVec)
   {
    var tempX = this.x + addVec.x;
    var tempY = this.y + addVec.y;
    var tempZ = this.z + addVec.z;
   },

   multiplyScalar: function(scalar)
   {
    var tempX = this.x * scalar;
    var tempY = this.y * scalar;
    var tempZ = this.z * scalar;

    var tempVec = new Vector3(tempX, tempY, tempZ);

    return tempVec;
   },
}

// ----------------------- V E C T O R  4 --------------------
function Vector4(x, y, z, w) {
   this.x = 0;
   this.y = 0;
   this.z = 0;
   this.w = 0;
   this.set(x, y, z, w);
}

Vector4.prototype = {
   set : function(x, y, z, w) {
      if (x !== undefined) this.x = x;
      if (y !== undefined) this.y = y;
      if (z !== undefined) this.z = z;
      if (w !== undefined) this.w = w;
   },
   subtract : function(vectorFrom)
   {
    
    var tempX = this.x - vectorFrom.x;
    var tempY = this.y - vectorFrom.y;
    var tempZ = this.z - vectorFrom.z;
    var tempW = this.w - vectorFrom.w;

    var tempVec = new Vector4(tempX, tempY, tempZ, tempW);

    return tempVec;

   },

    add: function(addVec)
   {
    var tempX = this.x + addVec.x;
    var tempY = this.y + addVec.y;
    var tempZ = this.z + addVec.z;
    var tempW = this.w + addVec.w;

    var tempVec = new Vector4(tempX, tempY, tempZ, tempW);

    return tempVec;
   },

   multiplyScalar: function(scalar)
   {
    var tempX = this.x * scalar;
    var tempY = this.y * scalar;
    var tempZ = this.z * scalar;
    var tempW = this.w * scalar;

    var tempVec = new Vector4(tempX, tempY, tempZ, tempW);

    return tempVec;
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
         //if (counter < 2 ) canvas.update(g);
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

Matrix.prototype.identity = function()
 {

  //RESET / INITALIZE THE MATRIX TO ITS IDENTITY
      for (var i = 0; i<16 ; i++) this.elements[i] = 0;

      this.elements[0] = 1;
      this.elements[5] = 1;
      this.elements[10] = 1;
      this.elements[15] = 1;

}

Matrix.prototype.set = function(matArry)
{
  for (var i = 0; i<16 ; i++) this.elements[i] = matArry[i];
}

Matrix.prototype.scale = function(x, y, z){

   var temp = [16];

   for(var i = 0; i < 16; i ++) temp[i] = 0;

   temp[0] =  1;
   temp[5] =  1;
   temp[10]=  1;
   temp[15]=  1;

   temp[0] = x;
   temp[5] = y;
   temp[10]= z;

   this.elements = transform(this.elements, temp);
}

   //
Matrix.prototype.translate = function(x,y,z)
{

        // var tempMatrix = new Matrix();
        // tempMatrix.identity();

      var tempArray = Array(16);
      for(var i = 0; i < 16; i ++) tempArray[i] = 0;

      tempArray[0] =  1;
      tempArray[5] =  1;
      tempArray[10]=  1;
      tempArray[15]=  1;

      tempArray[0*4+0] = x;
      tempArray[1*4+1] = y;
      tempArray[2*4+2] = z;

      this.elements = transform(this.elements, tempArray);
}

Matrix.prototype.translate = function (x, y, z)
{

      //CREATE A TEMPORARY MATRIX AND SET THE RESPECTIVE ELEMENTS IN THE 4TH COLUMN
      var tempArray = new Array(16);
      for(var i = 0; i < 16; i ++) tempArray[i] = 0;

       tempArray[0] =  1;
       tempArray[5] =  1;
       tempArray[10]=  1;
       tempArray[15]=  1;

       tempArray[12] = x;
       tempArray[13] = y;
       tempArray[14] = z;

      //MULTIPLY THE TRANSFORMATION MATRIX BY THE TEMPORARY MATRIX, IE ONLY THE TRANSLATE ELEMENTS
      this.elements = transform(this.elements, tempArray);

}


Matrix.prototype.rotateX = function(theta)
{
      var cos = Math.cos(theta);
      var sin = Math.sin(theta);

      var tempArray = new Array(16);
      for(var i = 0; i < 16; i ++) tempArray[i] = 0;

     tempArray[0] =  1;
     tempArray[5] =  1;
     tempArray[10]=  1;
     tempArray[15]=  1;

     tempArray[5]  = Math.cos(theta);
     tempArray[6]  = Math.sin(theta);

     tempArray[9]  = -1 * Math.sin(theta);
     tempArray[10] = Math.cos(theta);

     this.elements = transform(this.elements, tempArray);

}


Matrix.prototype.rotateY = function(theta)
{
  var cos = Math.cos(theta);
  var sin = Math.sin(theta);

  var tempArray = new Array(16);
  for(var i = 0; i < 16; i ++) tempArray[i] = 0;

  tempArray[0] =  1;
  tempArray[5] =  1;
  tempArray[10]=  1;
  tempArray[15]=  1;

  tempArray[0*4+0] = cos;
  tempArray[0*4+2] = sin;
  tempArray[2*4+0] = -sin;
  tempArray[2*4+2] = cos;

  this.elements = transform(this.elements, tempArray);

}

Matrix.prototype.rotateZ = function(theta)
 {
    var cos = Math.cos(theta);
    var sin = Math.sin(theta);

    var tempArray = new Array(16);
    for(var i = 0; i < 16; i ++) tempArray[i] = 0;

    tempArray[0] =  1;
    tempArray[5] =  1;
    tempArray[10]=  1;
    tempArray[15]=  1;

    tempArray[0] = cos;
    tempArray[1] = -sin;
    tempArray[4] = sin;
    tempArray[5] = cos;

    this.elements =  transform(this.elements, tempArray);

 }

Matrix.prototype.setPerspective = function(f)
{
var tempArray = new Array(16);
for(var i = 0; i < 16; i ++) tempArray[i] = 0;

tempArray[0] = 1;
tempArray[5] = 1;
tempArray[11] = 1;
tempArray[14] = 1/f;

this.elements =  transform(this.elements, tempArray);
}

function transform (main, other) {

    var tempArray = Array(16);
    for(var i = 0; i < 16; i ++) tempArray[i] = 0;

    tempArray[0] = main[0]*other[0] + main[4]*other[1] + main[8]*other[2] + main[12]*other[3];
    tempArray[1] = main[0]*other[4] + main[4]*other[5] + main[8]*other[6] + main[12]*other[7];
    tempArray[2] = main[0]*other[8] + main[4]*other[9] + main[8]*other[10] + main[12]*other[11];
    tempArray[3] = main[0]*other[12] + main[4]*other[13] + main[8]*other[14] + main[12]*other[15];

    tempArray[4] = main[1]*other[0] + main[5]*other[1] + main[9]*other[2] + main[13]*other[3];
    tempArray[5] = main[1]*other[4] + main[5]*other[5] + main[9]*other[6] + main[13]*other[7];
    tempArray[6] = main[1]*other[8] + main[5]*other[9] + main[9]*other[10] + main[13]*other[11];
    tempArray[7] = main[1]*other[12] + main[5]*other[13] + main[9]*other[14] + main[13]*other[15];

    tempArray[8] = main[2]*other[0] + main[6]*other[1] + main[10]*other[2] + main[14]*other[3];
    tempArray[9] = main[2]*other[4] + main[6]*other[5] + main[10]*other[6] + main[14]*other[7];
    tempArray[10] = main[2]*other[8] + main[6]*other[9] + main[10]*other[10] + main[14]*other[11];
    tempArray[11] = main[2]*other[12] + main[6]*other[13] + main[10]*other[14] + main[14]*other[15];

    tempArray[12] = main[3]*other[0] + main[7]*other[1] + main[11]*other[2] + main[15]*other[3];
    tempArray[13] = main[3]*other[4] + main[7]*other[5] + main[11]*other[6] + main[15]*other[7];
    tempArray[14] = main[3]*other[8] + main[7]*other[9] + main[11]*other[10] + main[15]*other[11];
    tempArray[15] = main[3]*other[12] + main[7]*other[13] + main[11]*other[14] + main[15]*other[15];

   return tempArray;
}

//---------------------------- D O T  M A T R I X ----------------

function vec3DotMatrix (mat, vert)
{
   // console.log("vert:");
   // console.log(vert);
   var dest = new Vector3(0, 0, 0);
   var x, y, z;

   // console.log("matrix:");
   // console.log(mat);

   x = mat.elements[0]*vert.x + mat.elements[1]*vert.y + mat.elements[2]*vert.z + mat.elements[3]*1;
   y = mat.elements[4]*vert.x + mat.elements[5]*vert.y + mat.elements[6]*vert.z + mat.elements[8]*1;
   z = mat.elements[8]*vert.x + mat.elements[9]*vert.y + mat.elements[10]*vert.z + mat.elements[11]*1;

   dest.set(x, y, z);

   // console.log("dest:");
   // console.log(dest);

   return dest;
}

function vec4DotMatrix (mat, vert)
{
   // console.log("vert:");
   // console.log(vert);
   var dest = new Vector4(0, 0, 0, 0);
   var x, y, z, w;

   // console.log("matrix:");
   // console.log(mat);

   x = mat.elements[0]*vert.x + mat.elements[1]*vert.y + mat.elements[2]*vert.z + mat.elements[3]*vert.w;
   y = mat.elements[4]*vert.x + mat.elements[5]*vert.y + mat.elements[6]*vert.z + mat.elements[8]*vert.w;
   z = mat.elements[8]*vert.x + mat.elements[9]*vert.y + mat.elements[10]*vert.z + mat.elements[11]*vert.w;
   w = mat.elements[12]*vert.x + mat.elements[13]*vert.y + mat.elements[14]*vert.z + mat.elements[15]*vert.w;

   dest.set(x, y, z, w);

   // console.log("dest:");
   // console.log(dest);

   return dest;
}
//----------------------  M A P  -------------------------

function mapRange(oldVal, origFrom, origTo, newFrom, newTo)
{
  var mappedVal = (oldVal - origFrom) / (origTo - origFrom) * (newTo - newFrom) + newFrom;
  return mappedVal;
}
// ------------------------ C O N V E R T  C A N V A S ---------------------

function convertToCanvas(p, w , h)
{

  //CONVERT TO THE CANVAS SPACE
   var newP = new Vector3();
   newP.set(
      (w/2 + p.x * w/2),
      (h/2 - p.y * w/2),
      0);

   return newP;
}
