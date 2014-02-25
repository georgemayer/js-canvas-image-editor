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