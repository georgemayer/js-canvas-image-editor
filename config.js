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