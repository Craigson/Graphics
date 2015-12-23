Skip to content
This repository  
Search
Pull requests
Issues
Gist
 @Craigson
 Watch 1
  Star 0
 Fork 0 hobogenized/hobogenized.github.io
 Code  Issues 0  Pull requests 0  Wiki  Pulse  Graphs
Branch: master Find file Copy pathhobogenized.github.io/Assignment-09/drawlib1.js
38a7898  on Nov 11
@hobogenized hobogenized Just missing differentials
1 contributor
RawBlameHistory     365 lines (335 sloc)  11.2 KB

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
        add : function(someVec) {
            return new Vector3(this.x + someVec.x,
                               this.y + someVec.y,
                               this.z + someVec.z);
        },
        sub : function(someVec) {
            return new Vector3(this.x - someVec.x,
                               this.y - someVec.y,
                               this.z - someVec.z);
        },
        multS : function(scalar) {
            return new Vector3(this.x * scalar,
                               this.y * scalar,
                               this.z * scalar);
        }
    }

    function Vector4(x, y, z, t) {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.t = 0;
        this.set(x, y, z, t);
    }
    Vector4.prototype = {
        set : function(x, y, z, t) {
            if (x !== undefined) this.x = x;
            if (y !== undefined) this.y = y;
            if (z !== undefined) this.z = z;
            if (t !== undefined) this.t = t;
        },
        dot : function(otherVec) {
            var dotProduct = this.x * otherVec.x +
                             this.y * otherVec.y +
                             this.z * otherVec.z +
                             this.t * otherVec.t;
            return dotProduct;
        }
    }

    function multV(vec, mat) {
       x  = vec.x * mat.v0.x + 
            vec.y * mat.v1.x +
            vec.z * mat.v2.x +
            vec.t * mat.v3.x;
       y  = vec.x * mat.v0.y +
            vec.y * mat.v1.y +
            vec.z * mat.v2.y +
            vec.t * mat.v3.y;
       z  = vec.x * mat.v0.z +
            vec.y * mat.v1.z +
            vec.z * mat.v2.z +
            vec.t * mat.v3.z;
       t = vec.x * mat.v1.t +
            vec.y * mat.v1.t +
            vec.z * mat.v2.t +
            vec.t * mat.v3.t;
       return new Vector4(x, y, z, t);
    }

    function Matrix() {
       this.v0 = new Vector4(0,0,0,0);
       this.v1 = new Vector4(0,0,0,0);
       this.v2 = new Vector4(0,0,0,0);
       this.v3 = new Vector4(0,0,0,0);
       return this;
    }

    Matrix.prototype = {
       set : function(v0, v1, v2, v3) {
         if (v0 !== undefined) this.v0 = v0;
         if (v1 !== undefined) this.v1 = v1;
         if (v2 !== undefined) this.v2 = v2;
         if (v3 !== undefined) this.v3 = v3;
         return this;
       },
       identity : function() {
           (this.v0).set(1, 0, 0, 0);
           (this.v1).set(0, 1, 0, 0);
           (this.v2).set(0, 0, 1, 0);
           (this.v3).set(0, 0, 0, 1);
           return this;
       },
       combine : function(mat2) {
           v0 = multV(this.v0, mat2);
           v1 = multV(this.v1, mat2);
           v2 = multV(this.v2, mat2);
           v3 = multV(this.v3, mat2);
           this.set(v0, v1, v2, v3);
           return this;
       },
       translate : function(x, y, z) {
           var i = new Matrix();
           i.identity();
           i.v0.t = x;
           i.v1.t = y;
           i.v2.t = z;
           this.combine(i);
           return this;
       },
       rotateX : function(theta) {
           var i = new Matrix();
           i.identity();
           i.v1.y =  Math.cos(theta);
           i.v1.z = -Math.sin(theta);
           i.v2.y =  Math.sin(theta);
           i.v2.z =  Math.cos(theta);
           this.combine(i);
           return this;
       },
       rotateY : function(theta) {
           var i = new Matrix();
           i.identity();
           i.v0.x =  Math.cos(theta);
           i.v0.z = -Math.sin(theta);
           i.v2.x =  Math.sin(theta); 
           i.v2.z =  Math.cos(theta);
           this.combine(i);
           return this;
       },
       rotateZ : function(theta) {
           var i = new Matrix();
           i.identity();
           i.v0.x =  Math.cos(theta);
           i.v0.y = -Math.sin(theta);
           i.v1.x =  Math.sin(theta);
           i.v1.y =  Math.cos(theta);
           this.combine(i);
           return this;
       },
       scale  : function(x, y, z) {
           var i = new Matrix();
           i.identity();
           i.v0.x = x;
           i.v1.y = y;
           i.v2.z = z;
           this.combine(i);
           return this;
       },
       transform: function(src, dst) {
           var x = this.v0.dot(src);
           var y = this.v1.dot(src);
           var z = this.v2.dot(src);
           var t = this.v3.dot(src);
           dst.set(x, y, z, t);
           return this;
       }
    }
          
    function viewPortX(w, h, vX) {
        return (w / 2) + vX * (w / 2);
    }

    function viewPortY(w, h, vY) {
        return (h / 2) - vY * (h / 2);
    }
    
    function toModelSpaceX(w, h, x) {
        return x * 1.0 /(w / 2) - 1.0;
    }
    
    function toModelSpaceY(w, h, y) {
        return 1.0 - y * 1.0/(h / 2.0);
    }

    function HSpline(){;
    };
    
    var w = 300., h = 200.;

    HSpline.prototype = {
        transform : function(g, positions) {
            var r = 20;
            var pos = positions;
            
            var p0, p1, t0, t1, 
                startX, startY,
                curX, curY;
                
            var size = pos.push();
            
            for(var i = 0; i < size; ++i){
                g.beginPath();
                var posX = pos[i].x,
                    posY = pos[i].y; 

                g.stroke();
                g.closePath();
            }
            
            g.beginPath();

            if(size > 0){
                
                var toPlot = new Vector3(0, 0, 0);
                startX = pos[0].x;
                startY = pos[0].y;
                g.moveTo(startX, startY);
                for(var i = 1; i < size; ++i){
                    p0 = pos[i-1];
                    p1 = pos[i];
                    
                    if(i > 1){
                        t0 = p1.sub(pos[i-2]);
                        t0 = t0.multS(0.7);
                    } else {
                        t0 = p0.sub(p0);
                    }
                    
                    if(i < size-1){
                        t1 = pos[i+1].sub(p0);
                        t1 = t1.multS(0.7);
                    } else {
                        t1 = p1.sub(p1);
                    }
                    for(var j = 0; j < r; ++j){
                        var t = j / (r - 1.0);
                        var A = 2.0 * t * t * t - 
                                3.0 * t * t     + 
                                1.0;
                        var B =       t * t * t - 
                                2.0 * t * t     + 
                                      t;
                        var C = -2.0 * t * t * t + 
                                 3.0 * t * t;
                        var D =        t * t * t - 
                                       t * t;
                        toPlot.x = A * p0.x +
                                   B * t0.x +
                                   C * p1.x +
                                   D * t1.x;
                        toPlot.y = A * p0.y +
                                   B * t0.y +
                                   C * p1.y +
                                   D * t1.y;
                        toPlot.z = A * p0.z +
                                   B * t0.z +
                                   C * p1.z +
                                   D * t1.z;
                        curX = toPlot.x;
                        curY = toPlot.y;
                        g.lineTo(curX, curY);
                    }
                }
            }
            g.stroke();
        },
    };
    
    var drawCircle = function (context, x, y/*, fillcolor, radius, linewidth, strokestyle, fontcolor, textalign, fonttype, filltext*/) {
        context.beginPath();
        context.arc(x, y, 2, 0, 2 * Math.PI, false);
        context.fillStyle = 'black';
        context.fill();
        context.lineWidth = 1;
        context.strokeStyle = 'black';
        context.stroke();
    };
    
    var drawLine = function (context, p1, p2) {
        context.beginPath();
        context.moveTo(p1.x, p1.y);
        context.lineWidth = 0.5;
        context.strokeStyle = 'black';
        context.lineTo(p2.x, p2.y);
        context.stroke();
    };
    
    var detectPoint = function(cursor, points){
        var size = points.push();
        var offset = 3;
        for(var i = 0; i < size; i++){
            var index = i;
            var coordX = points[i].x;
            var coordY = points[i].y;
            var distX = Math.abs(coordX - cursor.x);
            var distY = Math.abs(coordY - cursor.y);
            if(distX < offset && distY < offset){
                return index;
            }
        }
        return -1;
    };

    var startTime = (new Date()).getTime() / 1000, time = startTime;
    var canvases = [];
    
    function initCanvas(id) {
      var canvas = document.getElementById(id);
      canvas.setCursor = function(x, y, z) {
         var r = this.getBoundingClientRect();
         this.cursor.set(x - r.left, y - r.top, z);
      }
      canvas.clicked = false;
      canvas.newspline = false;
      canvas.prevspline = false;
      canvas.nextspline = false;
      canvas.mode = "Add";
      canvas.cursor = new Vector3(0, 0, 0);
      canvas.onmousedown = function(e) { this.setCursor(e.clientX, e.clientY, 1); }
      canvas.onmousemove = function(e) { this.setCursor(e.clientX, e.clientY   ); }
      
      canvas.onmouseup   = function(e) { this.setCursor(e.clientX, e.clientY, 0); 
                                         this.clicked = true;}
      canvas.addEventListener('keydown', function(e){
            var key = e.keyCode;;
            switch(key){
                case 65: // 'A' key
                    canvas.mode = "Add";
                    break;
                case 83: // 'S' key
                    canvas.mode = "Move";
                    break;
                case 68: // 'D' key
                    canvas.mode = "Delete";
                    break;
                case 87: // 'W' key
                    canvas.newspline = true;
                    break;
                case 81: // 'Q' key
                    canvas.prevspline = true;
                    break;
                case 69: // 'E' key
                    canvas.nextspline = true;
                    break;
            }
            console.log(canvas.mode);
      }, false);
      var context = canvas.getContext('2d');
      context.globalCompositeOperation = "source-over";
      context.lineWidth = 2;
      context.strokeStyle = "black";
      context.rect(0, 0, canvas.width - 1, canvas.height - 1);
      context.stroke();
      
      canvases.push(canvas);
      return canvas;
    }
    function tick() {
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
Status API Training Shop Blog About Pricing
© 2015 GitHub, Inc. Terms Privacy Security Contact Help