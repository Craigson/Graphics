
/////// HTML5 MODELER FOR CHALKTALK ///////////////////////////////////////////////////////////////

if (! window.CT) CT = { REVISION: "0" };

CT.def = function(a, b) { return a !== undefined ? a : b !== undefined ? b : 0; }
CT.fovToFL = function(fov) { return 1 / Math.tan(fov / 2); }

CT.vectorCross     = function(a, b) { return [ a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0] ]; }
CT.vectorDot       = function(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
CT.vectorNormalize = function(v)    { var d = Math.sqrt(CT.vectorDot(v,v)); v[0]/=d; v[1]/=d; v[2]/=d; return v; }

CT.matrixCopy       = function(s,d)   { for (var i = 0 ; i < 16 ; i++) d[i] = s[i]; }
CT.matrixIdentity   = function()      { return [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]; }
CT.matrixRotatedX   = function(a)     { return [1,0,0,0, 0,Math.cos(a),Math.sin(a),0, 0,-Math.sin(a),Math.cos(a),0, 0,0,0,1]; }
CT.matrixRotatedY   = function(a)     { return [Math.cos(a),0,-Math.sin(a),0, 0,1,0,0, Math.sin(a),0,Math.cos(a),0, 0,0,0,1]; }
CT.matrixRotatedZ   = function(a)     { return [Math.cos(a),Math.sin(a),0,0, -Math.sin(a),Math.cos(a),0,0, 0,0,1,0, 0,0,0,1]; }
CT.matrixScaled     = function(x,y,z) { return [x,0,0,0, 0,CT.def(y,x),0,0, 0,0,CT.def(z,x),0, 0,0,0,1]; }
CT.matrixTranslated = function(x,y,z) { return [1,0,0,0, 0,1,0,0, 0,0,1,0, x,y,z,1]; }

CT.matrixMultiply = function(a, b, dst) {                       // MULTIPLY TWO 4x4 MATRICES.  IF THERE IS A THIRD
   var tmp = [], n;                                             // ARGUMENT, THEN PUT THE RESULT INTO THAT MATRIX.
   for (n = 0 ; n < 16 ; n++)
      tmp.push(a[n&3] * b[n&12] + a[n&3 | 4] * b[1 | n&12] + a[n&3 | 8] * b[2 | n&12] + a[n&3 | 12] * b[3 | n&12]);
   if (dst)
      CT.matrixCopy(tmp, dst);                                  // IN ANY CASE, RETURN THE RESULT AS THE VALUE OF THE FUNCTION.
   return CT.def(dst, tmp);
}
CT.matrixInverse = function(src) {                              // RETURNS THE INVERSE OF A 4x4 MATRIX.
  function s(col, row) { return src[col & 3 | (row & 3) << 2]; }
  function cofactor(c0, r0) {
     var c1 = c0+1, c2 = c0+2, c3 = c0+3, r1 = r0+1, r2 = r0+2, r3 = r0+3;
     return (c0 + r0 & 1 ? -1 : 1) * ( (s(c1, r1) * (s(c2, r2) * s(c3, r3) - s(c3, r2) * s(c2, r3)))
                                     - (s(c2, r1) * (s(c1, r2) * s(c3, r3) - s(c3, r2) * s(c1, r3)))
                                     + (s(c3, r1) * (s(c1, r2) * s(c2, r3) - s(c2, r2) * s(c1, r3))) );
  }
  var n, dst = [], det = 0;
  for (n = 0 ; n < 16 ; n++) dst.push(cofactor(n >> 2, n & 3));
  for (n = 0 ; n <  4 ; n++) det += src[n] * dst[n << 2];
  for (n = 0 ; n < 16 ; n++) dst[n] /= det;
  return dst;
}
CT.matrixTransform = function(m, v)  {                          // USE A 4x4 MATRIX TO TRANSFORM A 1x4 VECTOR.
    var x = v[0], y = v[1], z = v[2], w = CT.def(v[3], 1);      // IF THE VECTOR IS ONLY OF LENGTH THREE,
    return [ x*m[0] + y*m[4] + z*m[ 8] + w*m[12],               // THEN AUTOMATICALLY ADD A HOMOGENEOUS
             x*m[1] + y*m[5] + z*m[ 9] + w*m[13],               // COORDINATE VALUE OF 1.
             x*m[2] + y*m[6] + z*m[10] + w*m[14],
             x*m[3] + y*m[7] + z*m[11] + w*m[15] ]; }

CT.Scene = function(canvas) {                                   // THE SCENE CONTAINS VIEW, CAMERA AND LIGHTING INFO
   this._fov = 0.35;                                            // AS WELL AS A LIST OF TOP LEVEL OBJECTS.
   this._gl = canvas.getContext('experimental-webgl');
   this._lColor = [0,0,0, 0,0,0, 0,0,0];
   this._lDirInfo = [0,0,0, 0,0,0, 0,0,0];
   this._objects = [];
   this._viewMatrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,this.getFL(),1];
}
CT.Scene.prototype = {
   add      (obj)   { this._objects.push(obj); return obj._scene = this; },
   getFL    ()      { return CT.fovToFL(this._fov); },
   getFOV   ()      { return this._fov; },
   getHDir  ()      { this._updateLightVectors(); return this._hDir; },
   getLDir  ()      { this._updateLightVectors(); return this._lDir; },
   setFOV   (fov)   { this._fov = fov; return this; },

   doDepthTest(yes) {                                           // TOGGLE WHETHER TO DO A DEPTH TEST WHEN DRAWING
      var gl = this._gl;
      if (yes) {
         gl.enable(gl.DEPTH_TEST);
         gl.depthFunc(gl.LEQUAL);
      }
      else
         gl.disable(gl.DEPTH_TEST);
   },
   getViewMatrixInverse() {                                     // RETURN INVERSE OF VIEW MATRIX, RECOMPUTING IT AS NEEDED.
      if (! this._viewMatrixInverse)
         this._viewMatrixInverse = CT.matrixInverse(this._viewMatrix);
      return this._viewMatrixInverse;
   },
   remove(obj) {                                                // REMOVE ONE OF THIS SCENE'S TOP LEVEL OBJECTS.
      for (var i = 0 ; i < this._objects.length ; i++)
         if (obj == this._objects[i]) {
	    this._objects.splice(i, 1);
	    break;
	 }
   },
   setCanvas(canvas) {                                          // CHANGE TO A NEW HTML5 CANVAS.
      this._gl = canvas.getContext('experimental-webgl');
      for (var i = 0 ; i < this._objects.length ; i++)
         this._objects[i].setGL(this._gl);
   },
   setLight(n, lDir, lColor) {                                  // SPECIFY ONE LIGHT: DIRECTION VECTOR AND OPTIONAL COLOR.
      CT.vectorNormalize(lDir);
      for (var i = 0 ; i < 3 ; i++) {
	 this._lDirInfo[3 * n + i] = lDir[i];
         this._lColor  [3 * n + i] = lColor ? lColor[i] : 1;
      }
      delete this._lDir;
      return this;
   },
   setViewMatrix(matrix) {                                      // SET THE VIEW MATRIX, AND THEN INTERNALLY DELETE THINGS
      CT.matrixCopy(matrix, this._viewMatrix);                  // THAT DEPEND ON THE VIEW MATRIX, TO FORCE THEM TO BE
      delete this._viewMatrixInverse;                           // RECOMPUTED WHEN THEY ARE NEXT NEEDED.
      delete this._lDir;
      return this;
   },
   _updateLightVectors() {                                      // COMPUTE LIGHT DIRECTION AND HIGHLIGHT DIRECTION VECTORS.
      if (! this._lDir) {
         var m = this.getViewMatrixInverse(), v = this._lDirInfo, dir, i;
         this._lDir = [];
         this._hDir = [];
         for (i = 0 ; i < v.length ; i += 3) {
            dir = CT.vectorNormalize(CT.matrixTransform(m, [ v[i], v[i+1], v[i+2], 0 ]));
	    this._lDir.push(dir[0], dir[1], dir[2]);
            dir = CT.vectorNormalize([dir[0], dir[1], dir[2] + 1]);
	    this._hDir.push(dir[0], dir[1], dir[2]);
         }
      }
   },
}

CT.Object = function() { } // BASE CLASS FOR 3D OBJECTS, WHICH CAN RECURSIVELY CONTAIN OTHER 3D OBJECTS.

CT.Object.prototype = {
   clear            ()         { this._children = []; return this; },
   getChild         (i)        { return this._children[i]; },
   getProperty      (p, dflt)  { return this[p] ? this[p] : this._parent ? this._parent.getProperty(p,dflt) : dflt; },
   getScene         ()         { return this._scene = this.getProperty('_scene'); },
   getShape         ()         { return this._shape; },
   identity         ()         { this._matrix = CT.matrixIdentity(); return this; },
   numChildren      ()         { return this._children.length; },
   rotateX          (a)        { CT.matrixMultiply(this._matrix, CT.matrixRotatedX(a), this._matrix); return this; },
   rotateY          (a)        { CT.matrixMultiply(this._matrix, CT.matrixRotatedY(a), this._matrix); return this; },
   rotateZ          (a)        { CT.matrixMultiply(this._matrix, CT.matrixRotatedZ(a), this._matrix); return this; },
   scale            (x, y, z)  { CT.matrixMultiply(this._matrix, CT.matrixScaled(x,y,z), this._matrix); return this; },
   setColor         (c)        { return this.setPhong([.1*c[0],.1*c[1],.1*c[2], .9*c[0],.9*c[1],.9*c[2], 1,1,1,10]); },
   setFragmentShader(str)      { this._fragmentShader = str; return this; },
   setMatrix        (matrix)   { CT.matrixCopy(matrix, this._matrix); return this; },
   setNormalMap     (fileName) { this._textureFile1 = fileName; return this; },
   setPhong         (phong)    { this._phong = phong; return this; },
   setTexture       (fileName) { this._textureFile0 = fileName; return this; },
   setVertexShader  (str)      { this._vertexShader = str; return this; },
   translate        (x, y, z)  { CT.matrixMultiply(this._matrix, CT.matrixTranslated(x,y,z), this._matrix); return this; },

   addChild(child) {
      this._children.push(child);
      child._parent = this;
      return child;
   },
   draw(globalMatrix) {                                         // DRAW CALLS ITSELF RECURSIVELY FOR ALL CHILD OBJECTS.
      if (! globalMatrix) { 
	 var scene = this.getScene();
         if (this._gl != scene._gl)                             //    THE TOP LEVEL CALL HAS NO ARGUMENT.  FOR THAT CALL,
	    this.setGL(scene._gl);                              //    USE THE INVERSE VIEW MATRIX AS THE GLOBAL MATRIX.
         globalMatrix = scene.getViewMatrixInverse();
      }
      CT.matrixMultiply(globalMatrix, this._matrix, this._globalMatrix);
      this._drawShape(this._shape, this._globalMatrix);
      for (var i = 0 ; i < this._children.length ; i++) 
          this._children[i].draw(this._globalMatrix);
   },
   init(shape) {                                                // INITIALIZE ALL DATA FIELDS, AND ALSO
      this._children = [];                                      // INITIALIZE SHAPE, IF ONE WAS SPECIFIED.
      this.identity();
      this._globalMatrix = CT.matrixIdentity();
      this._shape = shape;
      if (shape)
         shape._object = this;
      return this;
   },
   setGL(gl) {                                                  // ATTACH THE GL RENDERING CONTEXT, AND
      this._gl = gl;                                            // ALSO LOAD TEXTURE IMAGES, IF ANY HAVE
      if (this._shape && this._shape._gl != gl)                 // BEEN SPECIFIED,
         this._shape._initGL(gl);
      this._loadTexture(this._textureFile0, '_texture0');
      this._loadTexture(this._textureFile1, '_texture1');
      for (var i = 0 ; i < this._children.length ; i++)         // THEN RECURSIVELY CALL THIS
         this._children[i].setGL(gl);                           // METHOD FOR CHILD OBJECTS.
   },
   _drawShape(shape, globalMatrix) {        
      if (shape) {                                              // IF OBJECT HAS A SHAPE TO RENDER,
         shape._renderMatrix = globalMatrix;                    // THEN SET THE SHAPE'S RENDER MATRIX,
         shape._useProgram();                                   // LOAD ITS GPU PROGRAM, AND
         shape._draw();                                         // DRAW THAT SHAPE.
      }
   },
   _loadTexture(fileName, textureId) {                          // BOILERPLATE TO ASYNCHRONOUSLY LOAD A TEXTURE IMAGE.
      if (fileName && ! this[textureId]) {
         var that = this, gl = this._gl, image = new Image(), texture = gl.createTexture();
         image.onload = function() {
            gl.activeTexture (gl.TEXTURE0);
            gl.bindTexture   (gl.TEXTURE_2D, texture);
            gl.pixelStorei   (gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D    (gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri (gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
            gl.generateMipmap(gl.TEXTURE_2D);
            that[textureId] = texture;
         };
         image.src = fileName;
      }
   },
}

CT.Shape = function() { } // A SHAPE IS THE OBJECT THAT HANDLES RENDERING OF A SINGLE TRIANGLE STRIP.

CT.Shape.prototype = {
   getProperty     (p,dflt) { return this._object.getProperty(p, dflt); },
   getScene        ()       { return this._object.getScene(); },
   getSceneProperty(p)      { return (this.getScene())[p]; },
   _address        (name)   { return this._gl.getUniformLocation(this._program, name); },

   surfaceExtruded(nu, nv, fu, fv) {                                           // PARAMETRIC SURFACE DEFINED BY
      this.surfaceParametric(nu, nv, function(u, v) {                          // DRAGGING FUNCTIONALLY DESCRIBED
         var xy = fu(u, v), x = xy[0], y = xy[1], p = fv(v), p1 = fv(v+.001);  // CROSS SECTION SHAPE fu(u,v)
	 var dz = CT.vectorNormalize([ p1[0]-p[0], p1[1]-p[1], p1[2]-p[2] ]);  // ALONG FUNCTIONALLY DESCRIBED
	 var dx = [1, 0, 0];                                                   // 3D PATH fv(v).
	 var dy = CT.vectorNormalize(CT.vectorCross(dz, dx));
         return [ p[0] + x*dx[0] + y*dy[0]  ,  p[1] + x*dx[1] + y*dy[1]  ,  p[2] + x*dx[2] + y*dy[2] ];
      });
   },
   surfaceRevolved(nu, nv, f) {                                                // PARAMETRIC SURFACE DEFINED BY
      this.surfaceParametric(nu, nv, function(u, v) {                          // FUNCTION f(v) THAT RETURNS A
         var theta = 2 * Math.PI * u, xz = f(v);                               // [radius, z] PROFILE SHAPE.
         return [ xz[0] * Math.cos(theta), xz[0] * Math.sin(theta), xz[1] ];
      });
   },
   surfaceParametric(nu, nv, f) {              // CONVERT USER FUNCTION TO A PARAMETRIC SURFACE.
      var du = 1 / nu, dv = 1 / nv;
      var vertices = [], s;
      function addVertex(u, v) {                                                // COMPUTE PARAMETRIC VERTEX.
         var p = f( Math.max(0, Math.min(1, u)), Math.max(0, Math.min(1, v)) ), //    f MUST EVAL TO A POINT.
             pu = f(u+du/100, v),                                               //    APPROXIMATE TANGENTS BY
             pv = f(u, v+dv/100);                                               //    FINITE DIFFERENCING.
         var uu = CT.vectorNormalize([ pu[0] - p[0], pu[1] - p[1], pu[2] - p[2] ]);
         var vv = CT.vectorNormalize([ pv[0] - p[0], pv[1] - p[1], pv[2] - p[2] ]);
         var ww = CT.vectorCross(uu, vv);
         vertices.push(p[0],p[1],p[2],  uu[0],uu[1],uu[2],  vv[0],vv[1],vv[2],  ww[0],ww[1],ww[2],  u,v,  0,0);
      }
      var u = 0, d = du;
      for (var v = 0 ; v < 1 ; v += dv, d = -d)                  // ZIGZAG ACROSS ROWS TO FORM A TRIANGLE STRIP,
         for (var i = 0 ; i < nu ; i++) {
            addVertex(u   , v); addVertex(u, v+dv);              //    LEFT-TO-RIGHT ACROSS EVEN ROWS, THEN
            addVertex(u+=d, v); addVertex(u, v+dv);              //    RIGHT-TO-LEFT ACROSS ODD ROWS.
         }
      this._vertices = new Float32Array(vertices);
   },
   _addShader(type, str) {                                       // BOILERPLATE CODE TO COMPILE EITHER A VERTEX
      var gl = this._gl;                                         // OR A FRAGMENT SHADER.  IF THERE ARE ANY
      var s = gl.createShader(type);                             // COMPILE ERRORS, PRINT TO CONSOLE, OTHERWISE
      gl.shaderSource(s, str);                                   // ATTACH COMPILED SHADER TO THE GPU PROGRAM.
      gl.compileShader(s);
      if (! gl.getShaderParameter(s, gl.COMPILE_STATUS))
        console.log("shader compiler error: " + gl.getShaderInfoLog(s));
      gl.attachShader(this._program, s);
   },
   _attrib(name, size, loc, stride) {                            // ASSIGN A VERTEX ATTRIBUTE TO THE LOCATION OF
      var gl = this._gl, bpe = Float32Array.BYTES_PER_ELEMENT;   // AN ATTRIBUTE VARIABLE IN THE GPU PROGRAM.
      gl.enableVertexAttribArray(this[name]);
      gl.vertexAttribPointer(this[name], size, gl.FLOAT, false, stride * bpe,  loc * bpe);
   },
   _cameraMatrix(fl) {                                           // ADJUST FOR PERSPECTIVE AND NON-SQUARE CANVAS.
      var canvas = this._gl.canvas, sy = canvas.width / canvas.height;
      return CT.matrixMultiply( [ 1,0,0,0,  0,1,0,0,   0,0,-1,-1/fl,  0,0,0,1  ] ,
	                        [ 1,0,0,0,  0,sy,0,0,  0,0,1,0,       0,0,fl,1 ] );
   },
   _draw() {                                                     // SET ALL UNIFORMS AND THEN DO THE DRAW CALL.
      var gl = this._gl, program = this._program, scene = this.getScene();
      gl.uniform3fv      (this._address('uLColor'     ), this._lColor);
      gl.uniform3fv      (this._address('uLDir'       ), scene.getLDir());
      gl.uniform3fv      (this._address('uHDir'       ), scene.getHDir());
      gl.uniform1fv      (this._address('uPhong'      ), this.getProperty('_phong', [.05,.05,.05, .5,.5,.5, 1,1,1, 20]));
      gl.uniform1fv      (this._address('uTexture'    ), [this.getProperty('_texture0') ? 1 : 0 ,
                                                          this.getProperty('_texture1') ? 1 : 0 ] );
      gl.uniformMatrix4fv(this._address('uPosMatrix'  ), false, this._renderMatrix);
      gl.uniformMatrix4fv(this._address('uNorMatrix'  ), false,
         (function(m) { var x = m[0] * m[0] + m[1] * m[1] + m[ 2] * m[ 2],   // THE NORMAL MATRIX
                            y = m[4] * m[4] + m[5] * m[5] + m[ 6] * m[ 6],   // IS THE INVERSE
                            z = m[8] * m[8] + m[9] * m[9] + m[10] * m[10];   // TRANSPOSE OF THE
                        return [ m[0]/x, m[1]/x, m[ 2]/x, 0,                 // POSITION MATRIX.
                                 m[4]/y, m[5]/y, m[ 6]/y, 0,
                                 m[8]/z, m[9]/z, m[10]/z, 0,  0,0,0,1 ]; })(this._renderMatrix));
      this._drawArrays(this._vertices.length / 16);
   },
   _drawArrays(len) {                                            // BEFORE DOING THE DRAW CALL, SET THE CAMERA MATRIX.
      var gl = this._gl;
      gl.uniformMatrix4fv(this._address('uCamMatrix'), false, this._cameraMatrix(this.getScene().getFL()));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, len);
   },
   _initGL(gl) {                                                 // INITIALIZE GL RELATED VALUES FOR THIS SHAPE.
      this._gl           = gl;                                   // INCLUDING ALL PROPERTIES FROM THE SCENE
      this._lColor       = this.getSceneProperty('_lColor');
      this._lDir         = this.getSceneProperty('_lDir');
      this._hDir         = this.getSceneProperty('_hDir');
      this._renderMatrix = CT.matrixIdentity();

      gl.enable    (gl.DEPTH_TEST);                              // MAKE SURE GPU DEPTH TEST IS TURNED ON.
      gl.depthFunc (gl.LEQUAL);
      gl.enable    (gl.BLEND);
      gl.blendFunc (gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      this._program = gl.createProgram();                        // COMPILE AND LINK THE GPU PROGRAM.
      this._addShader(gl.VERTEX_SHADER  , this.getProperty('_vertexShader'  , this._defaultVertexShader  ));
      this._addShader(gl.FRAGMENT_SHADER, this.getProperty('_fragmentShader', this._defaultFragmentShader));
      gl.linkProgram(this._program);
      this._buffer  = gl.createBuffer();

      this._aPos      = gl.getAttribLocation(this._program, 'aPos');         // FIND OUT THE GPU MEMORY ADDRESS
      this._aTangent  = gl.getAttribLocation(this._program, 'aTangent');     // FOR ALL ATTRIBUTE VARIABLES IN
      this._aBinormal = gl.getAttribLocation(this._program, 'aBinormal');    // THE GPU PROGRAM, SO THAT WHEN
      this._aNormal   = gl.getAttribLocation(this._program, 'aNormal');      // RENDERING LATER, WE WILL BE ABLE
      this._aUV       = gl.getAttribLocation(this._program, 'aUV');          // TO CONNECT THEM TO VERTEX DATA.
   },
   _isLoaded() {
      var gl = this._gl, texture, i;                             // IF PROGRAM IS ALREADY LOADED, DON'T DO ANYTHING.
      if (gl._program == this._program)
         return true;
      gl._program = this._program;                               // OTHERWISE, LOAD PROGRAM AND ITS DATA BUFFERS
      gl.useProgram(this._program);                              // AND ALL OF ITS TEXTURES.
      gl.bindBuffer(gl.ARRAY_BUFFER, this._buffer);
      gl.bufferData(gl.ARRAY_BUFFER, this._vertices, gl.STATIC_DRAW);
      gl.uniform1iv(this._address('uSampler'), [0,1,2,3,4,5,6,7]);
      for (i = 0 ; i < 8 ; i++)
         if (texture = this.getProperty('_texture' + i)) {
            gl.activeTexture(gl.TEXTURE0 + i);
            gl.bindTexture  (gl.TEXTURE_2D, texture);
         }
      return false;
   },
   _useProgram() {                                               // ATTACH ALL OF THE SECTIONS OF EACH VERTEX
      if (! this._isLoaded()) {                                  // IN THE TRIANGLE STRIP TO SPECIFIC ATTRIBUTE
         this._attrib('_aPos'     , 3,  0, 16);                  // VARIABLES IN THE GPU SHADER PROGRAM.
         this._attrib('_aTangent' , 3,  3, 16);
         this._attrib('_aBinormal', 3,  6, 16);
         this._attrib('_aNormal'  , 3,  9, 16);
         this._attrib('_aUV'      , 2, 12, 16);
      }
   },
   _defaultVertexShader :                                        // DEFAULT VERTEX SHADER MAINLY TRANSFORMS
      ['precision highp float;'                                  // POSITION, TANGENT, BINORMAL AND NORMAL,
      ,'attribute vec3 aPos, aTangent, aBinormal, aNormal;'      // AND THEN SETS VARYING VARIABLES TO THOSE
      ,'attribute vec2 aUV;'                                     // TRANSFORMED VALUES, AS WELL AS SETTING
      ,'uniform mat4   uNorMatrix, uCamMatrix, uPosMatrix;'      // VARYING VARIABLE OF UV FOR THIS VERTEXX.
      ,'varying vec3   vTangent, vBinormal, vNormal;'
      ,'varying vec2   vUV;'
      ,'void main() {'
      ,'   vTangent  = normalize(uNorMatrix * vec4(aTangent ,0.)).xyz;'
      ,'   vBinormal = normalize(uNorMatrix * vec4(aBinormal,0.)).xyz;'
      ,'   vNormal   = normalize(uNorMatrix * vec4(aNormal  ,0.)).xyz;'
      ,'   vUV = aUV;'
      ,'   vec4 pos = uCamMatrix * uPosMatrix * vec4(aPos, 1.);'
      ,'   gl_Position = vec4(pos.xy, pos.z / 20. + .2, pos.w);' // TEMPORARY HACK TO INCREASE NON-CLIPPED DEPTH RANGE.
      ,'}'
      ].join('\n'),

   _defaultFragmentShader :                                      // DEFAULT FRAGMENT SHADER DOES THREE THINGS:
      ['precision highp float;'                                 
      ,'uniform sampler2D uSampler[8];'                          // (1) OPTIONAL TEXTURE MAP-BASED NORMAL DISPLACEMENT;
      ,'uniform vec3  uLColor[3], uLDir[3], uHDir[3];'           // (2) BLINN-PHONG SHADING;
      ,'uniform float uPhong[10], uTexture[2];'                  // (3) OPTIONAL TEXTURE MAPPING OF COLOR.
      ,'varying vec3  vTangent, vBinormal, vNormal;'
      ,'varying vec2  vUV;'
      ,'void main(void) {'
      ,'   vec4 b = texture2D(uSampler[1], vUV);'
      ,'   vec3 normal = normalize(mix(vNormal, b.r * vTangent + b.g * vBinormal + b.b * vNormal, b.a * uTexture[1]));'
      ,'   vec3 rgb = vec3(uPhong[0], uPhong[1], uPhong[2]);'
      ,'   for (int i = 0 ; i < 3 ; i++) {'
      ,'      float d = max(0., dot(uLDir[i], normal));'
      ,'      float s = max(0., dot(uHDir[i], normal));'
      ,'      rgb += uLColor[i] * (vec3(uPhong[3], uPhong[4], uPhong[5]) * d +'
      ,'                           vec3(uPhong[6], uPhong[7], uPhong[8]) * pow(s, 4. * uPhong[9]));'
      ,'   }'
      ,'   vec4 texture = texture2D(uSampler[0], vUV);'
      ,'   rgb = mix(rgb, rgb * texture.rgb, texture.a * uTexture[0]);'
      ,'   gl_FragColor = vec4(pow(rgb, vec3(.45,.45,.45)), 1.);'
      ,'}'
      ].join('\n'),
}

CT.ShapeCube = function() {                                      // CREATE A CUBE SHAPE AS A SINGLE TRIANGLE STRIP.
   this._vertices = (function() {
      function addFace(x,y,z, ax,ay,az, bx,by,bz) {
         vertices.push(x-ax-bx, y-ay-by, z-az-bz,  ax,ay,az, bx,by,bz,  x,y,z,  0,0, 0,0);
         vertices.push(x+ax-bx, y+ay-by, z+az-bz,  ax,ay,az, bx,by,bz,  x,y,z,  1,0, 0,0);
         vertices.push(x+ax+bx, y+ay+by, z+az+bz,  ax,ay,az, bx,by,bz,  x,y,z,  1,1, 0,0);
         vertices.push(x-ax+bx, y-ay+by, z-az+bz,  ax,ay,az, bx,by,bz,  x,y,z,  0,1, 0,0);
         vertices.push(x-ax-bx, y-ay-by, z-az-bz,  ax,ay,az, bx,by,bz,  x,y,z,  0,0, 0,0);
      }
      var vertices = [];
      addFace( 1, 0, 0,   0, 1, 0,   0, 0, 1);                   // THE ENTIRE CUBE IS ACTUAL ONE TRIANGLE STRIP.
      addFace( 0, 1, 0,   0, 0, 1,   1, 0, 0);                   // EACH FACE OF THE CUBE IS TWO TRIANGLE, AND
      addFace( 0, 0, 1,   1, 0, 0,   0, 1, 0);                   // THE FACES END UP BEING CONNECTED BY HIDDEN
      addFace( 0, 0,-1,  -1, 0, 0,   0, 1, 0);                   // TRIANGLES INSIDE THE CUBE.
      addFace( 0,-1, 0,   0, 0,-1,   1, 0, 0);
      addFace(-1, 0, 0,   0,-1, 0,   0, 0, 1);
      return new Float32Array(vertices);
   })();
}
CT.ShapeCube.prototype = new CT.Shape;

(CT.ShapeDisk         = function(n)       { this.surfaceRevolved(n,1,function(t) { return [t+.001,0]; }); }).prototype = new CT.Shape;
(CT.ShapeExtruded     = function(nu,nv,fu,fv) { this.surfaceExtruded(nu, nv, fu, fv); }).prototype = new CT.Shape;
(CT.ShapeOpenCylinder = function(n)       { this.surfaceRevolved(n, 2, function(t) { return [1, 2*t-1] }); }).prototype = new CT.Shape;
(CT.ShapeParametric   = function(nu,nv,f) { this.surfaceParametric(nu, nv, f); }).prototype = new CT.Shape;
(CT.ShapeRevolved     = function(nu,nv,f) { this.surfaceRevolved(nu, nv, f); }).prototype = new CT.Shape;

(CT.ShapeSphere = function(nu, nv) {
   this.surfaceRevolved(nu, nv, function(t) { var phi = Math.PI*t - Math.PI/2; return [ Math.cos(phi), Math.sin(phi) ]; });
}).prototype = new CT.Shape;

(CT.ShapeSquare = function(nu, nv) {
   this.surfaceParametric(1, 1, function(u, v) { return [2*u-1, 2*v-1, 0]; });
}).prototype = new CT.Shape;

(CT.ShapeTorus = function(nu, nv, r) {
   if (! r) r = 0.3;
   this.surfaceRevolved(nu, nv, function(t) { var phi = 2*Math.PI*t; return [ 1 - r * Math.cos(phi), -r * Math.sin(phi) ]; });
}).prototype = new CT.Shape;

// HERE ARE THE TYPES OF OBJECTS THAT THE MODELER CURRENTLY SUPPORTS.

CT.Cube         = function()        { this.init(new CT.ShapeCube());          }; CT.Cube.prototype         = new CT.Object;
CT.Cylinder     = function(n)       { this.init();
                                      this.addChild(new CT.OpenCylinder(n));
                                      this.addChild(new CT.Disk(n)).translate(0,0,-1);
                                      this.addChild(new CT.Disk(n)).translate(0,0, 1);
                                                                                   }; CT.Cylinder.prototype     = new CT.Object;
CT.Disk         = function(n)       { this.init(new CT.ShapeDisk(n));              }; CT.Disk.prototype         = new CT.Object;
CT.Extruded = function(nu,nv,fu,fv) { this.init(new CT.ShapeExtruded(nu,nv,fu,fv));}; CT.Extruded.prototype     = new CT.Object;
CT.Node         = function()        { this.init();                                 }; CT.Node.prototype         = new CT.Object;
CT.OpenCylinder = function(n)       { this.init(new CT.ShapeOpenCylinder(n));      }; CT.OpenCylinder.prototype = new CT.Object;
CT.Parametric   = function(nu,nv,f) { this.init(new CT.ShapeParametric(nu,nv,f));  }; CT.Parametric.prototype   = new CT.Object;
CT.Revolved     = function(nu,nv,f) { this.init(new CT.ShapeRevolved(nu,nv,f));    }; CT.Revolved.prototype     = new CT.Object;
CT.Sphere       = function(m,n)     { this.init(new CT.ShapeSphere(m,n));          }; CT.Sphere.prototype       = new CT.Object;
CT.Square       = function()        { this.init(new CT.ShapeSquare());             }; CT.Square.prototype       = new CT.Object;
CT.Torus        = function(m,n,r)   { this.init(new CT.ShapeTorus(m,n,r));         }; CT.Torus.prototype        = new CT.Object;

