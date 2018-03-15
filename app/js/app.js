import Router from './router';
import './components/game';

(function () {
  function clearNotification() {
    document.querySelector('#notification').classList.remove('show');
    document.querySelector('#notification').classList.remove('error');
    document.querySelector('#notification').classList.remove('success');
    document.querySelector('#notification').classList.remove('warning');
  }
  function showNotification(message, type) {
    clearNotification()
    document.querySelector('#notification').classList.add(type);
    document.querySelector('#notification .message').innerHTML = message;
    document.querySelector('#notification').classList.add('show');

    setTimeout(function () {
      clearNotification();
    }, 10000);
  }

  function showUserData() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", APP_HOST_URL + "/userData" + '?time=' + Date.now());
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
    if (evt.target.files[0].size / 1048576 > 100) {
      showNotification('Files bigger than 100MB are not allowed!!!', 'error');
      return;
    }
    document.getElementById("upload-input").disabled = true;
    var req = new XMLHttpRequest();
    req.addEventListener("load", function reqListener() {
      if (req.readyState === req.DONE) {
        if (req.status === 200) {
          let uploadStatus = JSON.parse(req.response);
          document.querySelector('#upload-progress.progress-bar-outer').classList.remove('show');
          document.getElementById("upload-input").disabled = false;
          if (uploadStatus.type === 'error') {
            showNotification(uploadStatus.data, 'error');
          }
          if (uploadStatus.Location) {
            showNotification('File upload success!!!', 'success');
            showUserData();
          }
        }
      }
    });

    req.open("POST", APP_HOST_URL + "/upload");
    req.withCredentials = true;

    req.upload.onprogress = function (e) {
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

  var createUserSpace = function () {
    let req = new XMLHttpRequest();
    req.open("POST", APP_HOST_URL + "/createUserSpace");
    req.withCredentials = true;
    req.send({});
    setTimeout(function () {
      showUserData();
    }, 5000);
  }

  createUserSpace(); 

  var socket = socketCluster.connect();
  socket.on('connect', function () {
    console.log('CONNECTED');
  });
  socket.on('fileUploadProgress', (data) => {
    let progress = Math.floor(data) + '%';
    console.log('File upload to server progress:- ' + progress);
    document.querySelector('#upload-progress .progress-bar-inner').innerHTML = progress;
    document.querySelector('#upload-progress .progress-bar-inner').style.width = progress;
    if (progress === '100%') {
      document.querySelector('#upload-progress .progress-bar-inner').innerHTML = '100% Saving...';
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
  document.querySelector('#notification .close').addEventListener('click', function (evt) {
    document.querySelector('#notification').classList.remove('show');
  });

  document.querySelector('.user-profile img').src = window.trythings.currentUser.photoUrl;
  document.querySelector('.user-profile .name').innerHTML = window.trythings.currentUser.displayName;

  document.querySelector('.things li#recipes span').addEventListener('click', function (event) {
    document.querySelector('.modal-overlay').classList.add('show');
  });
  document.querySelector('.modal-overlay .close').addEventListener('click', function (event) {
    document.querySelector('.modal-overlay').classList.remove('show');
  });
  
  Router.configure({appBaseUrl: APP_HOST_URL}).init(); 
})();
