(function () { 
  function showUserData() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "APP_BASE_URL" + "/userData");
    xhr.withCredentials = true;
    xhr.send({});
    xhr.addEventListener("load", function reqListener() {
      if (xhr.readyState === xhr.DONE) {
        if (xhr.status === 200) {
            let container = JSON.parse(xhr.response);
            console.log('total size of the container ' + container.containerSize);
            let items = container.items;
            let urlTemplate = items.map(function(item) {
              return ['<div class="item">', '<img src="' + item.itemUrl + '"/>', '</div>'].join('\n');
            });
            document.getElementById('user-items').innerHTML = urlTemplate.join('\n');
        }
    }
    });
  }
  
  var uploadInput = document.getElementById('upload-input');
  uploadInput.addEventListener("change", function (evt) {
    console.log(evt);
    var req = new XMLHttpRequest();
    req.addEventListener("load", function reqListener() {
      console.log(this.responseText);
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
  }, false);


  var socket = socketCluster.connect({ port: 3000 });
  socket.on('connect', function () {
    console.log('CONNECTED');

    let req = new XMLHttpRequest();
    req.open("POST", "APP_BASE_URL" + "/createUserSpace");
    req.withCredentials = true;
    req.send({});
    setTimeout(function() {
      showUserData();
    }, 10000);
  });
  socket.on('fileUploadProgress', (data) => {
    console.log('File upload to server progress:- ' + data + '%');
    if (data === 100) {
      setTimeout(function() {
        showUserData();
      }, 10000);
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
