(function() {
  'use strict'
  var uploadInput = document.getElementById('upload-input');
  uploadInput.addEventListener("change", function (evt) {
    console.log(evt);
    var req = new XMLHttpRequest();
    req.addEventListener("load", function reqListener () {
      console.log(this.responseText);
    });

    req.open("POST", "/upload");
    //req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    const formData = new FormData();
    formData.append("imageFiles", evt.target.files[0]);
    formData.append("content-type", "multipart/form-data");
    req.send(formData);
  }, false);
})();
