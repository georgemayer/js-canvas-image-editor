#Image Editor

The image editor is a javascript plugin that allows users to upload a photo, drag it around and save it. It takes advantage of the canvas element to create this functionality. It also takes the image cropping, etc away from the server and brings it onto the client. This is not jquery dependent, but also causes no conflicts. 

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

With the HTML looking like this

```html

<div class="canvas-wrapper">
  <canvas style="margin:auto;border: 1px solid black;" width="400" height="400" ></canvas>
  <input type="range" name="size" min="50" max="200" id="scale" value="100">
  <button class="rotate-canvas">rotate</button>
  <button class="save">save</button>
  <input class="files" id="files" type="file" /> 
</div>

```