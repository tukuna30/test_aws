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
  
    var uploadInput = document.getElementById('upload-input');
    uploadInput.addEventListener("change", function (evt) {
        showNotification('You need to create an account to upload!!!', 'error');
    }, false);

    document.querySelector('#notification .close').addEventListener('click', function (evt) {
      document.querySelector('#notification').classList.remove('show');
    });
  
    document.querySelector('.user-profile .name').innerHTML = window.trythings.currentUser.displayName;
  
    document.querySelector('.things li#recipes span').addEventListener('click', function (event) {
      document.querySelector('.modal-overlay').classList.add('show');
    });
    document.querySelector('.modal-overlay .close').addEventListener('click', function (event) {
      document.querySelector('.modal-overlay').classList.remove('show');
    });
    
    window.trythings.Router.configure({appBaseUrl: "APP_BASE_URL"}).init(); 
  })();
  