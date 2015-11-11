
//------------------------- G E O M E T R Y ------------------

function Geometry3D()
   {
      this.vertices = [];
      this.indices = [];
      this.radialSegs = 0;
      this.verticalSegs = 0;
      this.theta = 0;
      this.phi = 0;
      this.u = 0;
      this.v = 0;
      console.log(this.kind);
   }

Geometry3D.prototype = {

  initCube: function (verts, sides)
  {
    this.vertices = verts;
    this.indices = sides;
  },

  initSphere: function(rads, vers)
  {
    this.radialSegs = rads;
    this.verticalSegs = vers;

      for (var v = 0; v < this.radialSegs; v++)
      {
        for (var u = 0; u < this.verticalSegs; u++)
        {
          this.theta = 2 * Math.PI * u/this.verticalSegs;
          this.phi = Math.PI * v / (this.radialSegs - 1) - Math.PI / 2;

          var x = Math.cos(this.phi) * Math.cos(this.theta);
          var y = Math.cos(this.phi) * Math.sin(this.theta);
          var z = Math.sin(this.phi);

          this.vertices.push(new Vector3(x, y, z));

          var i = u + v * this.verticalSegs;

          if( i % this.verticalSegs == this.verticalSegs - 1) {
            this.indices.push( [i, i - (this.verticalSegs - 1) ]);
          } else {
            this.indices.push( [i, i+1] );
          }
          if( i >= this.verticalSegs){
            this.indices.push( [i, i - this.verticalSegs] );
          }
        }
      }
  },

  initCylinder: function(rads, vers)
  {
    this.radialSegs = rads;
    this.verticalSegs = vers;

      for (var v = 0; v < this.radialSegs; v++)
      {
        for (var u = 0; u < this.verticalSegs; u++)
        {
          this.theta = 2 * Math.PI * u/this.verticalSegs;

          var x = Math.cos(this.theta);
          var y = Math.sin(this.theta);
          var z = 2 * v/this.radialSegs - 1;

          this.vertices.push(new Vector3(x, y, z));

          var i = u + v * this.verticalSegs;

          if( i % this.verticalSegs == this.verticalSegs - 1) {
            this.indices.push( [i, i - (this.verticalSegs - 1) ]);
          } else {
            this.indices.push( [i, i+1] );
          }
          if( i >= this.verticalSegs){
            this.indices.push( [i, i - this.verticalSegs] );
          }
        }
      }
  },

  initTorus: function(rads, vers, r)
  {
    this.radialSegs = rads;
    this.verticalSegs = vers;

      for (var v = 0; v < this.radialSegs; v++)
      {
        for (var u = 0; u < this.verticalSegs; u++)
        {
          this.theta = 2 * Math.PI * u/this.verticalSegs;
          this.phi = 2 * Math.PI * v/this.radialSegs;

          var x = (1 + r * Math.cos(this.phi)) * Math.cos(this.theta);
          var y = (1 + r * Math.cos(this.phi)) * Math.sin(this.theta);
          var z = r * Math.sin(this.phi);

          this.vertices.push(new Vector3(x, y, z));

          var i = u + v * this.verticalSegs;

          if( i % this.verticalSegs == this.verticalSegs - 1) {
            this.indices.push( [i, i - (this.verticalSegs - 1) ]);
          } else {
            this.indices.push( [i, i+1] );
          }
          if( i >= this.verticalSegs){
            this.indices.push( [i, i - this.verticalSegs] );
          }
        }
      }
  },

  render: function(g, mat, w, h)
  {
   var p0    = new Vector3(0, 0, 0);
   var p1    = new Vector3(0, 0, 0);

   g.strokeStyle = 'black';

   g.beginPath();
   
   // console.log("calling rneder");

   for(var i = 0; i < this.indices.length; i++){
      var i0 = this.indices[i][0];
      var i1 = this.indices[i][1];

      // console.log(i0 + " " + i1);
      // console.log("matrix:");
      // console.log(mat);

      p0 = vertexDotMatrix(mat, this.vertices[i0]);
      p1 = vertexDotMatrix(mat, this.vertices[i1]);


      // console.log("p0:");
      // console.log(p0);
      // console.log(p1);


      //CONVERT TO CANVAS COORDINATES
      var newP0 = convertToCanvas(p0,w,h);
      var newP1 = convertToCanvas(p1,w,h);

      // console.log("newP0:");
      // console.log(newP0);

      // console.log("newP1:");
      // console.log(newP1);

        g.moveTo(newP0.x, newP0.y);
        g.lineTo(newP1.x, newP1.y);
     }
     g.stroke();
  }
}