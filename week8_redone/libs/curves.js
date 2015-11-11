
//-------------------- K N O T -------------------
function Knot(loc)
{
  this.position = loc;
  this.controlPointFront = new Vector3();
  this.controlPointBack = new Vector3();
  this.moving = false;
  this.held = false;
  //this.controlLength = 0;
  this.isBeginning = false;
  this.isEndPoint = false;
  this.curvatureContinuous = true;
  this.index = 0;
  
}

Knot.prototype.setIndex = function(_index)
{
  this.index = _index;
}

Knot.prototype.setPosition = function(_mouseLoc)
{
  var tempLoc = _mouseLoc;
  this.position = tempLoc;

}


//-------------------- S P L I N E S -------------------

function Spline(type, _steps)
{

  this.knots = [];

  this.steps = _steps;
  this.matrix = new Matrix();

  this.points = [];

  this.showControls = true;

  var hermiteMatrix = [  2 , -2 ,  1 ,  1 ,
                        -3 ,  3 , -2 , -1 ,
                         0 ,  0 ,  1 ,  0 ,
                         1 ,  0 ,  0 ,  0   ];

  var bezierMatrix = [  -1 ,  3 , -3 ,  1 ,
                         3 , -6 ,  3 ,  0 ,
                        -3 ,  3 ,  0 ,  0 ,
                         1 ,  0 ,  0 ,  0   ];

  if (type == 'hermite'){
    this.isHermite = true;
    this.isBezier = false;
    this.matrix.set(hermiteMatrix);
  } else if (type == 'bezier'){
    this.isHermite = false;
    this.isBezier = true;
    this.matrix.set(bezierMatrix);
  }

}

Spline.prototype.addKnot = function(_knot)
{
  console.log("eaddingKnot");
  this.knots.push(_knot);
  this.computePoints();
}

Spline.prototype.computePoints = function ()
{
  this.points.clear;

  console.log("computing pointd");
  console.log(this.knots.length);

  if (this.knots.length > 0)
  {
    console.log("running here");
     for (var i = 0; i < this.knots.length-1; i++)
    {

      var A = this.knots[i].position;
      var B = this.knots[i+1].position;
      var C = this.knots[i].controlPoint.subtract(this.knots[i].position);
      var D = this.knots[i+1].controlPoint.subtract(this.knots[i+1].position);

      console.log(C);
      var ABCDx = new Vector4(A.x, B.x, C.x, D.x);
      var ABCDy = new Vector4(A.y, B.y, C.y, D.y);

      if (this.isHermite == true)
      {
        console.log("calling vec4dotmatrix");
        console.log(this.matrix);
        var abcdX = vec4DotMatrix(this.matrix, ABCDx);
        var abcdY = vec4DotMatrix(this.matrix, ABCDy);

        console.log(abcdX);

        for (var t = 0; t < this.steps; t++)
        {
          var s = t / this.steps; //VALUES FROM 0.0 TO 1.0
       //   console.log(s);
          var x = ( abcdX.x * Math.pow(s,3) ) + ( abcdX.y * Math.pow(s,2) ) + ( abcdX.z * s) + abcdX.w;
          var y = ( abcdY.x * Math.pow(s,3) ) + ( abcdY.y * Math.pow(s,2) ) + ( abcdY.z * s) + abcdY.w;
        // console.log("xPoints:");
        // console.log(x);
        // console.log("yPoints:");
        // console.log(y);

         var xyVec = new Vector3(x,y,0);
         // console.log(xyVec);
         this.points.push(xyVec);
        }
      }
    }
  }
}

Spline.prototype.removeKnot = function(_index)
{
  this.knots.splice(_index,1);
}

Spline.prototype.updateKnots = function( _mouseLoc)
{
  for (var i = 0; i < this.knots.length; i++)
  {
    if (this.knots[i].held == true)
    { this.knots[i].position.x = _mouseLoc.x;
      this.knots[i].position.y = _mouseLoc.y;
    }

  }
}

Spline.prototype.drawControlPoints = function(g,w,h)
{

  for (var i = 0; i < this.knots.length; i++)
  {
    var center = convertToCanvas(this.knots[i].position,w,h);
   //var center = knot.position;

    //DRAW THE SPLINE POINT
    g.beginPath();
    g.arc(center.x, center.y, 2, 0, 2 * Math.PI, false);
    g.fillStyle = 'green';
    g.fill();
    g.lineWidth = 1;
    g.stroke();

    var converted = convertToCanvas(this.knots[i].controlPoint,w,h);
    //var converted = knot.controlPoint;
    
    //DRAW CONTROL POINT
    g.beginPath();
    g.arc(converted.x, converted.y, 1, 0, 2 * Math.PI, false);
    g.fillStyle = 'red';
    g.fill();
    g.lineWidth = 1;
    g.stroke();

    //DRAW THE TANGENT LINE
    g.beginPath();
    g.moveTo(center.x, center.y);
    g.lineTo(converted.x, converted.y);
    g.stroke();
  }
}


Spline.prototype.render = function(g, w, h)
{

  if (this.showControls) this.drawControlPoints(g, w, h);
  
  g.strokeStyle = 'black';
  g.beginPath();

 

  if (this.knots.length > 1)
  {
    var pointTo = new Vector3(0,0,0);
    var start = convertToCanvas(this.knots[0].position,w,h);
    
    g.moveTo(start.x, start.y);

    if (this.isHermite == true)
    {

      for (var i = 0; i < this.knots.length-1; i++)
      {
        //DEFINE THE START AND END POINTS, AS WELL AS CONTROL
        var begin  = this.knots[i].position;
        var end = this.knots[i+1].position;
        var controlBegin = this.knots[i].controlPoint.subtract(this.knots[i].position);
        var controlEnd = this.knots[i+1].controlPoint.subtract(this.knots[i+1].position);



        for (var t = 0; t < this.steps; t++)
          {
            var s = t / this.steps; //VALUES FROM 0.0 TO 1.0

                  var A = 2.0 * Math.pow(s, 3) - 3.0 * Math.pow(s, 2) + 1.0;
                  var B = Math.pow(s, 3) - 2.0 * Math.pow(s, 2) + s;
                  var C = -2.0 * Math.pow(s, 3) + 3.0 * Math.pow(s, 2);
                  var D = Math.pow(s, 3) - Math.pow(s, 2);

                  pointTo.x = A * begin.x + B * controlBegin.x + C * end.x + D * controlEnd.x;
                  pointTo.y = A * begin.y + B * controlBegin.y + C * end.y + D * controlEnd.y;
                  pointTo.z = A * begin.z + B * controlBegin.z + C * end.z + D * controlEnd.z;

                  var segment = convertToCanvas(pointTo, w, h);
                  
                  g.lineTo(segment.x, segment.y);
          }

      }
    } else if (this.isBezier == true) {
      for (var i = 0; i < this.knots.length-1; i++)
    {

      var A = this.knots[i].position;
      var B = this.knots[i+1].position;
      var C = this.knots[i].controlPoint.subtract(this.knots[i].position);
      var D = this.knots[i+1].controlPoint.subtract(this.knots[i+1].position);

      var ABCDx = new Vector4(A.x, B.x, C.x, D.x);
      var ABCDy = new Vector4(A.y, B.y, C.y, D.y);

      var abcdX = vec4DotMatrix(this.matrix, ABCDx);
      var abcdY = vec4DotMatrix(this.matrix, ABCDy);

      console.log(abcdX);

        for (var s = 0; s < 1; s += 0.1)
        {
         // var s = t / this.steps; //VALUES FROM 0.0 TO 1.0
       //   console.log(s);
          var x = ( abcdX.x * Math.pow(s,3) ) + ( abcdX.y * Math.pow(s,2) ) + ( abcdX.z * s) + abcdX.w;
          var y = ( abcdY.x * Math.pow(s,3) ) + ( abcdY.y * Math.pow(s,2) ) + ( abcdY.z * s) + abcdY.w;

          var temp = new Vector3(x,y,0);

          var pt = convertToCanvas(temp, w, h);
          g.lineTo(pt.x, pt.y, 0);
        } 
    }
  }
    g.stroke();
  }

}




