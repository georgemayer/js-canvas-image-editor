window.onload = function() {
  var fileInput = document.querySelector('#files');
  fileInput.addEventListener('change', function(e) {    
    userImage = new UserImage({
      wrapperSelector: ".canvas-wrapper",
      borderStyle: "square",
      borderWidth: 50,
      borderStroke: "#29ABE2",
      borderShade: "rgba(255,255,255,.7)",
      cropWidth: 300,
      cropHeight: 300
    });
  });
};
/* accepts an image oject (should have a file, source, height and width) 
   and a canvas object (should have a document selector, height and width) */

function ImageManipulator(imgObj, canvasObj, options) {
  // set a max image size to be twice the size of the canvas

  this.settings = {
      canvasId: "",
      wrapperSelector: "",
      borderStyle: "none",
      borderWidth: 0,
      borderStroke: "rgba(255,255,255,0)",
      borderShade: "rgba(255,255,255,.7)",
      cropWidth: null,
      cropHeight: null
  };

  for(var key in options) {
    if (options.hasOwnProperty(key)) {
      this.settings[key] = options[key];
    }  
  }

  var max       = canvasObj.width*2;
    // create the aspect ratio 
  var ratio     = imgObj.width / imgObj.height; 
  // understand the orientation of the photo 
  if(imgObj.width > max && imgObj.width > imgObj.height) {
      imgWidth  = max;
      imgHeight = imgWidth/ratio; // e.g., given 1200 x 600, ratio = 2/1, imgW = 800 & imgH = 400 ( 800 / 2 )
  } else if(imgObj.height > max) {
      imgHeight = max;
      imgWidth  = imgHeight*ratio;
  } else {
    imgHeight   = imgObj.height;
    imgWidth    = imgObj.width;
  }

  // establishing the data
  this.image = {
      file: imgObj.file,
       URL: imgObj.src,
     width: imgWidth,
    height: imgHeight,
     ratio: ratio, 
     scale: 1
  };

  this.coord = {
    x: (canvasObj.width / 2) - (imgWidth / 2), 
    y: (canvasObj.height / 2) - (imgHeight / 2)
  };

  this.middleCoord = { // the middle of the image
    x: this.coord.x + (imgWidth / 2), 
    y: this.coord.y + (imgHeight / 2)
  }; 

  this.canvas = {
    element: canvasObj.element,
     height: canvasObj.height,
      width: canvasObj.width,
          x: 0,
          y: 0,
      angle: 0
  };

  this.init();
}

ImageManipulator.prototype = {

    init: function() {
      var wrapper     = document.querySelector(this.settings.wrapperSelector);
      console.log(wrapper);
      var canvas      = this.canvas.element; 
      var ctx         = canvas.getContext('2d');
      
      // add the canvas to the object
      this.canvas.ctx = ctx;
      
      // do the drawing
      this.canvas.ctx.drawImage(this.image.file, this.coord.x, this.coord.y, this.image.width, this.image.height);
      this.drawBorder();

      var self = this;

      window.addEventListener("mouseup", function(event) {
        window.removeEventListener('mousemove', self.boundDrag, false);
      });

      var button = wrapper.querySelector('.rotate-canvas');
      button.addEventListener("click", function(event) {
        self.rotate();
      });

      var save = wrapper.querySelector('.save');
      save.addEventListener("click", function(event) {
        self.save();
        console.log('saved');
      });

      canvas.addEventListener("mousedown", function(event) {
        self.dragStart(event);
      });

      var scale = document.querySelector("#scale");
      
      scale.addEventListener('input', function(event) {
         value = document.querySelector("#scale").value;
         value = value / 100;
         self.scale(value); 
      });
    },

    save: function() {
      var newCanvas        = document.createElement('canvas');
      var newCtx           = newCanvas.getContext("2d");
      var borderWidth      = this.settings.borderWidth*2; // mutliplied by two to account for larger canvas size
      newCtx.canvas.width  = (this.canvas.width - borderWidth)*2;
      newCtx.canvas.height = (this.canvas.height - borderWidth)*2;

      // this saves and image onto a new canvas at a double the resolution (for retina)
      console.log(borderWidth);
      newCtx.drawImage(
        this.image.file, 
        (this.coord.x - borderWidth/2)*2,
        (this.coord.y - borderWidth/2)*2,
        ((this.image.width*this.image.scale))*2, 
        ((this.image.height*this.image.scale))*2
      );
      // comment out for debugging
      // var dataURL = newCanvas.toDataURL('image/jpeg');
      // var input   = document.querySelector("#uploaded-image");
      // input.value = dataURL;
      // sendAjaxRequest(); uncomment if you have this function
      // uncomment for debugging
      var body = document.querySelector("body");
      newCanvas.style.border = '1px solid black';
      body.appendChild(newCanvas);
    }, 

    repaint: function() {
      // clear the canvas for the repaint
      var x, y;
      var width = this.image.width*this.image.scale;
      var height = this.image.height*this.image.scale;
      
      var angle = this.canvas.angle;

      switch(angle)
      {
        case 90:
          x =  this.coord.y;
          y = -this.coord.x; 
          break;
        case 180: 
          x = -this.coord.x;
          y = -this.coord.y; 
          break;
        case 270:   
          x = -this.coord.y;
          y =  this.coord.x; 
          break;
        default: 
          x =  this.coord.x;
          y =  this.coord.y; 
          break; 
      }

      this.canvas.ctx.clearRect(this.canvas.x, this.canvas.y, this.canvas.width, this.canvas.height);
      
      this.canvas.ctx.drawImage(
          this.image.file, 
          x, 
          y, 
          width, 
          height); 

      this.drawBorder();
    }, 

    drawBorder: function() {
      var style = this.settings.borderStyle;

      if (style === "circle") {
        this.circleBorder();
      } else if (style === "square") {
        this.squareBorder();
      } else if (style === "none") {
        // don't draw a border
      }

    }, 

    circleBorder: function() {
      // should accept border options -- that will be version one
      var ctx          = this.canvas.ctx;
      var borderWidth  = this.settings.borderWidth;
      var center       = { 
        x: this.canvas.width / 2, 
        y: this.canvas.height / 2 
      };
      var radiusBig    = (this.canvas.width / 2) + borderWidth;   
      var radiusSmall  = (this.canvas.width / 2) - borderWidth; 
      
      ctx.beginPath();
      ctx.arc(center.x, center.y, radiusBig, 0, 2 * Math.PI, false);
      ctx.lineWidth    = borderWidth * 4; // borders are drawn on both sides of the arc, and must be large enough to cover the corners of the canvas
      ctx.strokeStyle  = this.settings.borderShade;
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(center.x, center.y, radiusSmall, 0, 2 * Math.PI, false);
      ctx.lineWidth    = 3;
      ctx.strokeStyle  = this.settings.borderStroke;
      ctx.stroke();
    }, 

    squareBorder: function() {
      // should accept border options -- that will be version one
      var ctx         = this.canvas.ctx;
      var borderWidth = this.settings.borderWidth;
      var height      = (this.canvas.height) + borderWidth*2; 
      var width       = (this.canvas.width) + borderWidth*2;
      var sHeight     = (this.canvas.height) - borderWidth*2; 
      var sWidth      = (this.canvas.width) - borderWidth*2;

      ctx.beginPath();
      ctx.rect(-borderWidth, -borderWidth, width, height);
      ctx.lineWidth   = borderWidth * 4;
      ctx.strokeStyle = "rgba(255,255,255,.7)";
      ctx.stroke();
      
      ctx.beginPath(); 
      ctx.rect(borderWidth, borderWidth, sWidth, sHeight);
      ctx.lineWidth   = 3;  
      ctx.strokeStyle = this.settings.borderStroke;
      ctx.stroke();
    }, 

    scale: function(scale) {
      // scale takes a scale between 50 and 200 and converts it to a decimal .5 = 50%, 2 = 200%

      this.image.scale = scale;
      var newW         = this.image.width*scale;
      var newH         = this.image.height*scale;
      var newXcoord    = this.middleCoord.x - (newW/2); 
      var newYcoord    = this.middleCoord.y - (newH/2); 
      this.coord.x     = newXcoord; 
      this.coord.y     = newYcoord;
      this.repaint();
    }, 

    dragStart: function(event) {  

      mousePosition = this.getMousePosition(event);
      
      this.difference = {
        x: this.coord.x - mousePosition.x,
        y: this.coord.y - mousePosition.y
      };

      this.boundDrag = this.dragPosition.bind(this);

      window.addEventListener("mousemove", this.boundDrag, false);
    },

    getMousePosition: function(event) {

      var canvasElement = this.canvas.element.getBoundingClientRect();
      
      var mousePosition = {
        x: event.clientX - canvasElement.left,
        y: event.clientY - canvasElement.top
      };
      
      return mousePosition;
    
    }, 

    dragPosition: function(event) {
  
      mousePosition = this.getMousePosition(event);

      this.coord.x = mousePosition.x + this.difference.x;
      this.coord.y = mousePosition.y + this.difference.y;
      
      this.repaint();

      this.middleCoord = { // the middle of the image
        x: this.coord.x + ((this.image.width*this.image.scale) / 2), 
        y: this.coord.y + ((this.image.height*this.image.scale) / 2)
      };
    }, 

    rotate: function() {
  
      this.canvas.angle = this.canvas.angle + 90;
      var angle         = 90;
      var ctx           = this.canvas.ctx;

      if (angle === 90) {
         ctx.translate(this.canvas.width/2 + this.canvas.height/2, 0);
      } else if (angle === 180) {
         ctx.translate(this.canvas.width, this.canvas.height);
      } else if (angle === 270) {
         ctx.translate(0, this.canvas.height);
      } else {
         ctx.translate(0, 0);
      }
      ctx.rotate(angle*Math.PI/180);

      if (this.canvas.angle === 360) {
        this.canvas.angle = 0;
      }
      
      this.repaint(); 
    }
};
function UserImage (options) {
  // also must accept a canvas by query selector
  // must prepare a canvas and image object for the image manipulator 
  var wrapper       = document.querySelector(options.wrapperSelector);
  var canvas        = wrapper.getElementsByTagName('canvas')[0];
  var imgObj        = {};
  var canvasObj     = {}; // must have element, element height and width 
  var fileInput     = wrapper.querySelector('.files');
  var file          = fileInput.files[0];
  canvasObj.element = canvas;
  canvasObj.height  = canvas.height;
  canvasObj.width   = canvas.width;
  var imageType     = /image.*/; // regex to make sure it's an image

  if (file.type.match(imageType)) {
    
    var reader = new FileReader();
    reader.onloadend = function(e) {
      // Create a new image.
      var img = new Image();
      img.src = reader.result;
      img.onload = function() {
        imgObj.file     = img;
        imgObj.src      = img.src;
        imgObj.width    = img.width;
        imgObj.height   = img.height; 
        myEditableImage = new ImageManipulator(imgObj, canvasObj, options);
      };
    };
    reader.readAsDataURL(file); 
  } else {
    console.log('oops... something when wrong');
  }
}