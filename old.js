var canvasImage = {

    file: "", // this will be the file
    imgHeight: "", //stores the height
    imgWidth: "", // stores the width
    scaledHeight: "",
    scaledWidth: "",
    xCoord: 0,
    yCoord: 0,
    xMiddle: 0,
    yMiddle: 0,
    rotation: 0,
    imgURL: "", // stores the source of the image
    canvas : "", 
    imgRatio: "",
    difference: {},

    init: function(img, imgURL, imgWidth, imgHeight) {

        this.file = img;
        this.imgURL = imgURL;


        // resize the image to "fit" on the canvas
        var max = 800;
        var ratio = imgWidth/imgHeight; 
        if(imgWidth > max && imgWidth > imgHeight) {
            imgWidth = max;
            imgHeight = imgWidth/ratio;
        } else if(imgHeight > max) {
            imgHeight = max;
            imgWidth = imgHeight*ratio;
        }

        this.imgWidth = imgWidth;
        this.imgHeight = imgHeight;
        this.scaledWidth = imgWidth;
        this.scaledHeight = imgHeight;
        this.imgRatio = ratio;
        this.xMiddle = imgWidth / 2;
        this.yMiddle = imgHeight / 2;
        this.xCoord = 200 - this.xMiddle;
        this.yCoord = 200 - this.yMiddle;
        this.xMiddle = (this.scaledWidth / 2) + this.xCoord
        this.yMiddle = (this.scaledHeight / 2) + this.yCoord

        // make sure it's resizing correctly 
        console.log("The width of the image is "+imgWidth);
        console.log("The height of the image is "+imgHeight);
        console.log("The aspect ratio of the image is "+ratio);

        // initialize the canvas
        var canvas = document.getElementById('panel');
        // canvas.id = "panel";
        // canvas.width = 400;
        // canvas.height = 400;
        var ctx = canvas.getContext('2d');
        this.canvas = ctx;
        this.canvas.drawImage(img, this.xCoord, this.yCoord, imgWidth, imgHeight);
        // add the image at x = 0, y = 0, image width, image width 
        this.drawBorder();
        // var container = document.getElementById('canvas-wrapper');
        // container.appendChild(canvas);

    },

    drawBorder: function() {

        this.canvas.beginPath();
        this.canvas.arc(200, 200, 250, 0, 2 * Math.PI, false);
        //this.canvas.fillStyle = "rgba(255,255,255,.0)";
        this.canvas.lineWidth=200;
        this.canvas.strokeStyle="rgba(255,255,255,.7)";
        // this.canvas.rect(0,0,400,50);
        // this.canvas.rect(0,350,400,50);
        // this.canvas.rect(0,50,50,300);
        // this.canvas.rect(350,50,50,300);
        this.canvas.stroke();

        this.canvas.beginPath();
        this.canvas.arc(200, 200, 150, 0, 2 * Math.PI, false);
        this.canvas.lineWidth=3;
        this.canvas.strokeStyle="#29ABE2";
        this.canvas.stroke();
        // this.canvas.fill();
        // this.canvas.beginPath();
        // this.canvas.rect(50, 50, 300, 300);
        // this.canvas.strokeStyle="#29ABE2";
        // this.canvas.lineWidth=3;
        // this.canvas.stroke();
        // this.canvas.beginPath();
    },

scale: function(scale) {

    // clear the canvas
    this.canvas.clearRect(0, 0, 400, 400);
    
    console.log(scale);
    
    newWidth = this.imgWidth*scale;
    newHeight = this.imgHeight*scale;
    this.scaledWidth = newWidth;
    this.scaledHeight = newHeight;
    this.xCoord = this.xMiddle - newWidth/2
    this.yCoord = this.yMiddle - newHeight/2
    this.canvas.drawImage(this.file, this.xCoord, this.yCoord, this.scaledWidth, this.scaledHeight);


    console.log("The width of the image is "+ newWidth);
    console.log("The height of the image is "+ newHeight);
    console.log("The aspect ratio of the image is "+this.imgRatio);
    console.log("The x of the image is "+ this.xCoord);
    console.log("The y of the image is "+ this.yCoord);

    this.drawBorder();

},

repaintImage: function(x, y) {
    this.canvas.clearRect(0, 0, 400, 400);
    
    this.canvas.drawImage(this.file, x, y, this.scaledWidth, this.scaledHeight);
    this.xCoord = x;
    this.yCoord = y;
    this.xMiddle = (this.scaledWidth / 2) + x
    this.yMiddle = (this.scaledHeight / 2) + y
    this.drawBorder();
},

dragPosition: function (event) {

    event = event || window.event; // IE-ism
    var rect = document.getElementById('panel').getBoundingClientRect();

    mousePosition = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
  }
  console.log('mousePosition x is ' + event.clientX + ", " + event.clientY)

  imgPosition = {
      x: canvasImage.xCoord,
      y: canvasImage.yCoord
  }

  newPosition = {
      x: mousePosition.x + canvasImage.difference.x,
      y: mousePosition.y + canvasImage.difference.y
  }

  canvasImage.repaintImage(newPosition.x, newPosition.y);

},

dragStart: function (event) {
    // get mouse coordinates (x,y)
    // get image offsets (x,y)
    // get the difference and apply to image offsets?
    event = event || window.event; // IE-ism
    var rect = document.getElementById('panel').getBoundingClientRect();

    mousePosition = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
  }

  imgPosition = {
      x: this.xCoord,
      y: this.yCoord
  }

  this.difference = {
      x: imgPosition.x - mousePosition.x,
      y: imgPosition.y - mousePosition.y
  }

  window.addEventListener('mousemove', this.dragPosition);

},

dragStop: function() {
    window.removeEventListener('mousemove', this.dragPosition);
    // this.save();
}, 

store: function() {
    var dataURL = document.getElementById('panel').toDataURL();
    $("#uploaded-image").val(dataURL);
    console.log($("#uploaded-image").val(dataURL)); 
},

rotate: function() {
    this.canvas.clearRect(0,0,400,400);
    this.canvas.translate(this.xCoord, this.yCoord)
    var radians = 90 * (Math.PI/180)
    this.canvas.rotate(radians);
    console.log("hey");
    this.repaintImage(0, 0);
},

save: function() {
    // var newCanvas = $('canvas').attr('id','saved-image').height(500).width(500);
    // var newCtx = newCanvas.getContext('2d');
    // var dataURL = document.getElementById('panel').toDataURL();
    var newCanvas = document.createElement('canvas');
    var newCtx = newCanvas.getContext("2d");
    newCtx.canvas.width = 300;
    newCtx.canvas.height = 300;
    newCtx.drawImage(this.file, this.xCoord-50, this.yCoord-50, this.scaledWidth,this.scaledHeight);
    var dataURL = newCanvas.toDataURL();
    $("#uploaded-image").val(dataURL);
    console.log($("#uploaded-image").val()); 
}
}








function NewImage () {

}

NewImage.prototype.load = function() {

  var fileInput = document.getElementById('files');
  var file = fileInput.files[0];
  var imageType = /image.*/;

  if (file.type.match(imageType)) {

    var reader = new FileReader();

    reader.onloadend = function(e) {

        //  Create a new image.
        var img = new Image();
        // Set the img src property using the data URL.
        img.src = reader.result;
        img.onload = function() {
          var imgWidth = img.width;
          var imgHeight = img.height;
          canvasImage.init(img, img.src, imgWidth, imgHeight);
      }



  }

  reader.readAsDataURL(file); 
  
} else {
    fileDisplayArea.innerHTML = "File not supported!";
}

}



window.onload = function() {
    var fileInput = document.getElementById('files');
    fileInput.addEventListener('change', function(e) {
        var userImage = new NewImage();
        userImage.load();
    });


    var canvas = document.getElementById('panel');

    canvas.addEventListener('mousedown', function(event) {
        canvasImage.dragStart(event);
    });

    window.addEventListener('mouseup', function() {
        canvasImage.dragStop();
    });



    var rotate = document.querySelector('.rotate-canvas');

    // rotate.addEventListener( {

    // });
    // $(document).on('click', '.rotate-canvas', function(e) {
    //     canvasImage.rotate();
    // });

    var scale = document.querySelector('#scale');

    scale.addEventListener('input', function(event) {
        var scale = this.value / 100;
        canvasImage.scale(scale);
    });

    // $(document).on('input','#scale' , function() {
    //     // the scale is on 50 to 200 range
    //     // normalize to a 100% scale
    //     var scale = this.value / 100;
    //     canvasImage.scale(scale);
    // });

}


