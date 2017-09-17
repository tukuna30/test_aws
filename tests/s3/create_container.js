const s3 = require('../../config/config_s3').s3;

function createContainer(containerName) {
  containerName = containerName.trim();
  if (!containerName) {
    console.log('container names must contain at least one non-space character.');
  }
  if (containerName.indexOf('/') !== -1) {
    console.log('container names cannot contain slashes.');
  }
  var containerKey = encodeURIComponent(containerName) + '/';
  s3.headObject({ Key: containerKey }, function (err, data) {
    if (!err) {
      console.log('container already exists.');
      return;
    }
    if (err.code !== 'NotFound') {
      console.log('There was an error creating your container: ' + err.message);
      return
    }
    s3.putObject({ Key: containerKey }, function (err, data) {
      if (err) {
        console.log('There was an error creating your container: ' + err.message);
      }
      console.log('Successfully created container.');
    });
  });
}
createContainer('testing_photos');
