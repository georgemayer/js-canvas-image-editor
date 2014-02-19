window.onload = function() {
  var fileInput = document.querySelector('#files');
  fileInput.addEventListener('change', function(e) {
     
     userImage = new UserImage("#panel", {
      style: "none",
      width: 0
     });
  });


  // $(document).on("click", "#save-canvas", function(e) {
  //       e.preventDefault();
  //       myEditableImage.save();
  //       var link = window.location
  //       $(".spinner").show();
  //       $.ajax({
  //           type:'POST', 
  //           url: $('#profile-photo-upload-form').attr('action'), 
  //           data:$('#profile-photo-upload-form').serialize(), 
  //           success: function(response) {                   
  //              $(".spinner").hide();
  //              $(".photo-upload").css("top", "-1000px");
  //              $("#profile-info").load(link+ " #profile-info > .info-container");
  //              $(".reminder").fadeOut();
  //          }           
  //      });
  //   });
}

function UserImage (canvasId, borderStyle) {
  // also must accept a canvas by query selector
  // must prepare a canvas and image object for the image manipulator 
  var canvas        = document.querySelector(canvasId);
  var imgObj        = {};
  var canvasObj     = {}; // must have element, element height and width 
  var fileInput     = document.querySelector('#files');
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
        myEditableImage = new ImageManipulator(imgObj, canvasObj, borderStyle);
      }
    }
    reader.readAsDataURL(file); 
  } else {
    console.log('oops... something when wrong');
  }
}

/* accepts an image oject (should have a file, source, height and width) 
   and a canvas object (should have a document selector, height and width) */

function ImageManipulator(imgObj, canvasObj, borderStyle) {
  // set a max image size to be twice the size of the canvas
  var defaultBorder = {
    style: "circle",
    width: 50
  }

  this.border   = borderStyle || defaultBorder;

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
  }

  this.init();
  
}

ImageManipulator.prototype.init = function() {
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

  var button = document.querySelector('.rotate-canvas');
  button.addEventListener("click", function(event) {
    self.rotate();
  });

  var save = document.querySelector('.save');
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
}

ImageManipulator.prototype.save = function() {
  var newCanvas        = document.createElement('canvas');
  var newCtx           = newCanvas.getContext("2d");
  var borderWidth      = this.border.width*2; // mutliplied by two to account for larger canvas size
  newCtx.canvas.width  = (this.canvas.width - borderWidth)*2;
  newCtx.canvas.height = (this.canvas.height - borderWidth)*2;

  // these hard coded numbers will be affected by the border options, but are static for now
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
  // uncomment for debugging
  var body = document.querySelector("body");
  newCanvas.style.border = '1px solid black';
  body.appendChild(newCanvas); 

}


ImageManipulator.prototype.repaint = function() {
  // clear the canvas for the repaint

  this.canvas.ctx.clearRect(this.canvas.x, this.canvas.y, this.canvas.width, this.canvas.height);

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
      break
    default: 
      x =  this.coord.x;
      y =  this.coord.y; 
      break; 
  }
  
  this.canvas.ctx.drawImage(
      this.image.file, 
      x, 
      y, 
      width, 
      height); 

  this.drawBorder();
  
}

ImageManipulator.prototype.drawBorder = function() {
  // should accept border options -- that will be version one
  if (this.border.style === "circle") {
    this.circleBorder();
  } else if (this.border.style === "square") {
    this.squareBorder();
  } else if (this.border.style === "none") {
    // don't draw a border
  }
}

ImageManipulator.prototype.circleBorder = function() {
  // should accept border options -- that will be version one
  var ctx          = this.canvas.ctx
  
  ctx.beginPath();
  ctx.arc(200, 200, 250, 0, 2 * Math.PI, false);
  ctx.lineWidth    = 200;
  ctx.strokeStyle  = "rgba(255,255,255,.7)";
  ctx.stroke();
  
  ctx.beginPath();
  ctx.arc(200, 200, 150, 0, 2 * Math.PI, false);
  ctx.lineWidth    = 3;
  ctx.strokeStyle  = "#29ABE2";
  ctx.stroke();
}

ImageManipulator.prototype.squareBorder = function() {
  // should accept border options -- that will be version one
  var ctx         = this.canvas.ctx
  
  ctx.beginPath();
  ctx.rect(-50, -50, 500, 500);
  ctx.lineWidth   = 200;
  ctx.strokeStyle = "rgba(255,255,255,.7)";
  ctx.stroke();
  
  ctx.beginPath(); 
  ctx.rect(50, 50, 300, 300);
  ctx.lineWidth   = 3;  
  ctx.strokeStyle = "#29ABE2";
  ctx.stroke();
}

ImageManipulator.prototype.scale = function(scale) {
  // scale takes a scale between 50 and 200 and converts it to a decimal .5 = 50%, 2 = 200%

  this.image.scale = scale;
  var newW         = this.image.width*scale;
  var newH         = this.image.height*scale;
  var newXcoord    = this.middleCoord.x - (newW/2); 
  var newYcoord    = this.middleCoord.y - (newH/2); 
  this.coord.x     = newXcoord; 
  this.coord.y     = newYcoord;
  this.repaint();
}

ImageManipulator.prototype.dragStart = function(event) {
  
  event = event || window.event; // IE-ism
  var canvasElement = this.canvas.element.getBoundingClientRect();
  
  var mousePosition = {
    x: event.clientX - canvasElement.left,
    y: event.clientY - canvasElement.top
  }

  var imgPosition = {
    x: this.coord.x,
    y: this.coord.y
  }

  this.difference = {
    x: imgPosition.x - mousePosition.x,
    y: imgPosition.y - mousePosition.y
  }

  this.boundDrag = this.dragPosition.bind(this);

  window.addEventListener("mousemove", this.boundDrag, false);
}

ImageManipulator.prototype.dragPosition = function(event) {
  
  event = event || window.event; // IE-ism
  var canvasElement = this.canvas.element.getBoundingClientRect();
  
  var mousePosition = {
    x: event.clientX - canvasElement.left,
    y: event.clientY - canvasElement.top
  }
  
  var imgPosition = {
    x: this.coord.x,
    y: this.coord.y
  }
  
  this.coord.x = mousePosition.x + this.difference.x;
  this.coord.y = mousePosition.y + this.difference.y;
  
  this.repaint();
  this.middleCoord = { // the middle of the image
    x: this.coord.x + ((this.image.width*this.image.scale) / 2), 
    y: this.coord.y + ((this.image.height*this.image.scale) / 2)
  };
}

ImageManipulator.prototype.rotate = function() {
  
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
    this.canvas.angle = 0
  }
  
  this.repaint(); 

}