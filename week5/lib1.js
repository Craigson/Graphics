/*
   This file contains all the support routines and convenience functions.
   You won't need to make any changes to this file for this assignment.
*/

// Define a general purpose 3D vector object.

function Vector3() {
   this.x = 0;
   this.y = 0;
   this.z = 0;
}
Vector3.prototype = {
   set : function(x,y,z) {
      this.x = x;
      this.y = y;
      this.z = z;
   },
}

// Convenience function to get a string from contents of an HTML Script.

function getStringFromScript(id) {
   var str = '';
   var scriptNode = document.getElementById(id);
   for (var child = scriptNode.firstChild ; child ; child = child.nextSibling)
      if (child.nodeType == 3)
         str += child.textContent;
   return str;
}

function start_gl(canvas_id, vertexShader, fragmentShader) {
   setTimeout(function() {

      // Make sure the browser supports WebGL.

      try {
         var canvas = document.getElementById(canvas_id);
         var gl = canvas.getContext("experimental-webgl");
      } catch (e) { throw "Sorry, your browser does not support WebGL."; }

      // Catch mouse events that go to the canvas.

      function setMouse(z) {
         var r = event.target.getBoundingClientRect();
         gl.cursor.x = (event.clientX - r.left  ) / (r.right - r.left) * 2 - 1;
         gl.cursor.y = (event.clientY - r.bottom) / (r.top - r.bottom) * 2 - 1;
         if (z !== undefined)
	    gl.cursor.z = z;
      }
      canvas.onmousedown = function(event) { setMouse(1); } // On mouse down, set z to 1.
      canvas.onmousemove = function(event) { setMouse() ; }
      canvas.onmouseup   = function(event) { setMouse(0); } // On mouse up  , set z to 0.
      gl.cursor = new Vector3();

      // Initialize gl. Then start the frame loop.

      gl_init(gl, vertexShader, fragmentShader);
      gl_update(gl);

   }, 100); // Wait 100 milliseconds after page has loaded, before starting gl.
}

// Function to create and attach a shader to a gl program.

function addshader(gl, program, type, src) {
   var shader = gl.createShader(type);
   gl.shaderSource(shader, src);
   gl.compileShader(shader);
   if (! gl.getShaderParameter(shader, gl.COMPILE_STATUS))
      throw "Cannot compile shader:\n\n" + gl.getShaderInfoLog(shader);
   gl.attachShader(program, shader);
};

// Initialize gl and create a square, given vertex and fragment shader defs.

function gl_init(gl, vertexShader, fragmentShader) {

   // Create and link the gl program, using the application's vertex and fragment shaders.

   var program = gl.createProgram();
   addshader(gl, program, gl.VERTEX_SHADER  , vertexShader  );
   addshader(gl, program, gl.FRAGMENT_SHADER, fragmentShader);
   gl.linkProgram(program);
   if (! gl.getProgramParameter(program, gl.LINK_STATUS))
      throw "Could not link the shader program!";
   gl.useProgram(program);

   // Create a square as a strip of two triangles.

   gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ -1,1,0, 1,1,0, -1,-1,0, 1,-1,0 ]), gl.STATIC_DRAW);

   // Assign attribute aPosition to each of the square's vertices.

   gl.aPosition = gl.getAttribLocation(program, "aPosition");
   gl.enableVertexAttribArray(gl.aPosition);
   gl.vertexAttribPointer(gl.aPosition, 3, gl.FLOAT, false, 0, 0);

   // Remember the address within the fragment shader of each of my uniform variables.

   gl.uTime   = gl.getUniformLocation(program, "uTime"  );
   gl.uCursor = gl.getUniformLocation(program, "uCursor");
}

// Update is called once per animation frame.

function gl_update(gl) {
   gl.uniform1f(gl.uTime  , (new Date()).getTime() / 1000 - time0); // Set time uniform variable.
   gl.uniform3f(gl.uCursor, gl.cursor.x, gl.cursor.y, gl.cursor.z); // Set cursor uniform variable.
   gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);                          // Render the square.
   requestAnimFrame(function() { gl_update(gl); });                 // Start the next frame.
}

// A browser-independent way to call a function after 1/60 second.

requestAnimFrame = (function(callback) {
      return requestAnimationFrame
          || webkitRequestAnimationFrame
          || mozRequestAnimationFrame
          || oRequestAnimationFrame
          || msRequestAnimationFrame
          || function(callback) { setTimeout(callback, 1000 / 60); }; })();

var time0 = (new Date()).getTime() / 1000;                          // Record the start time.

