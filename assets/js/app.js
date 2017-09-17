(function () {
  function showUserData() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "APP_BASE_URL" + "/userData" + '?time=' + Date.now());
    xhr.withCredentials = true;
    xhr.send({});
    xhr.addEventListener("load", function reqListener() {
      if (xhr.readyState === xhr.DONE) {
        if (xhr.status === 200) {
          let container = JSON.parse(xhr.response);
          let items = container.items;
          let urlTemplate = items.map(function (item) {
            return ['<div class="item">', '<img src="' + item.itemUrl + '"/>', '</div>'].join('\n');
          });
          document.getElementById('user-items').innerHTML = urlTemplate.join('\n');
        }
      }
    });
  }

  var uploadInput = document.getElementById('upload-input');
  uploadInput.addEventListener("change", function (evt) {
    if (evt.target.files.length === 0) {
      return;
    }
    if (evt.target.files[0].size/1048576 > 100) {
      console.log('Files bigger than 100MB are not allowed!!!');
      return;
    }
    document.getElementById("upload-input").disabled = true;
    var req = new XMLHttpRequest();
    req.addEventListener("load", function reqListener() {
      if (req.readyState === req.DONE) {
        if (req.status === 200) {
          let uploadStatus = JSON.parse(req.response);
          console.log('File stored at ' + uploadStatus.Location);
          document.querySelector('#upload-progress.progress-bar-outer').classList.remove('show');
          document.getElementById("upload-input").disabled = false;
          
          if (uploadStatus.Location) {
            showUserData();            
          }
        }
      }
    });

    req.open("POST", "APP_BASE_URL" + "/upload");
    req.withCredentials = true;

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
    document.querySelector('#upload-progress .progress-bar-inner').innerHTML = '1%';
    document.querySelector('#upload-progress .progress-bar-inner').style.width = '1%';
    document.querySelector('#upload-progress.progress-bar-outer').classList.add('show');
  }, false);


  var socket = socketCluster.connect({ port: 3000 });
  socket.on('connect', function () {
    console.log('CONNECTED');

    let req = new XMLHttpRequest();
    req.open("POST", "APP_BASE_URL" + "/createUserSpace");
    req.withCredentials = true;
    req.send({});
    setTimeout(function () {
      showUserData();
    }, 5000);
  });
  socket.on('fileUploadProgress', (data) => {
    let progress = Math.floor(data) + '%';
    console.log('File upload to server progress:- ' + progress);
    document.querySelector('#upload-progress .progress-bar-inner').innerHTML = progress;
    document.querySelector('#upload-progress .progress-bar-inner').style.width = progress;
    if (progress === '100%') {
      setTimeout(function() {
        document.querySelector('#upload-progress .progress-bar-inner').innerHTML = 'Saving...';      
      }, 1000);
    }
  });

  // let createSpaceInput = document.getElementById('create-user-space');
  // createSpaceInput.addEventListener("click", function (evt) {
  //   userSpace = document.getElementById('user-space-input').value;
  //   if (userSpace) {
  //     var req = new XMLHttpRequest();
  //     req.open("POST", "http://localhost:3000" + "/createUserSpace");
  //     const formData = new FormData();
  //     formData.append("userSpaceName", userSpace);
  //     req.send(formData);
  //   } else {
  //     alert('Enter a name please!');
  //   }
  // });
})();
