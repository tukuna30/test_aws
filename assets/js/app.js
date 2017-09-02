(function () {  
  var uploadInput = document.getElementById('upload-input');
  uploadInput.addEventListener("change", function (evt) {
    console.log(evt);
    var req = new XMLHttpRequest();
    req.addEventListener("load", function reqListener() {
      console.log(this.responseText);
    });

    req.open("POST", "APP_BASE_URL" + "/upload");

    req.upload.onprogress = function (e) {
      console.log('Tracking upload progress');
      if (e.lengthComputable) {
        var percentage = (e.loaded / e.total) * 100;
        console.log('File upload status from browser:- ' + percentage);
      }
    };

    const formData = new FormData();
    formData.append("imageFiles", evt.target.files[0]);
    formData.append("content-type", "multipart/form-data");
    req.send(formData);
  }, false);


  var socket = socketCluster.connect({ port: 3000 });
  socket.on('connect', function () {
    console.log('CONNECTED');
  });
  socket.on('fileUploadProgress', (data) => {
    console.log('File upload to server progress:- ' + data + '%');
  });
})();
