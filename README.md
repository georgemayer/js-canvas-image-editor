#Image Editor

The image editor is a javascript plugin that allows users to upload a photo, drag it around and save it. It takes advantage of the canvas element to create this functionality. It also takes the image cropping, etc away from the server and brings it onto the client. 

a simple config looks something like this:

```javascript
// view in the config.js file

window.onload = function() {
  var fileInput = document.querySelector('#files');
  fileInput.addEventListener('change', function(e) {    
    userImage = new UserImage({
      wrapperSelector: ".canvas-wrapper",
      borderStyle: "square",
      borderWidth: 50,
      borderStroke: "#29ABE2",
      borderShade: "rgba(255,255,255,.7)"
    });
  });
};

```