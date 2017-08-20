const s3 = require('./config_s3').s3;

function uploadToS3 (file, callback) {
  // call S3 to retrieve upload file to specified bucket
  let uploadParams = {Key: '', Body: ''};

  let fs = require('fs');
  let path = require('path');

  let fileStream = fs.createReadStream("./uploaded_files/" + file);
  fileStream.on('error', function(err) {
    console.log('File Error', err);
  });
  uploadParams.Body = fileStream;
  uploadParams.Key = path.basename(file);

  return s3.upload(uploadParams, function (err, data) {
    if (err) {
      console.log("Error", err);
      callback({data: data, type: 'error'});
    } if (data) {
      console.log("Upload Success", data.Location);
      callback({data: data, type: 'success'});
    }
  });
}

function createContainer(containerName, callback) {
  containerName = containerName.trim();
  if (!containerName) {
    console.log('Container names must contain at least one non-space character.');
    return;
  }
  if (containerName.indexOf('/') !== -1) {
    console.log('Container names cannot contain slashes.');
    return;
  }
  var containerKey = encodeURIComponent(containerName) + '/';
  s3.headObject({Key: containerKey}, function(err, data) {
    if (!err) {
      console.log('Container already exists.');
      callback({data: data, type: 'error'});
      return;
    }
    if (err.code !== 'NotFound') {
      console.log('There was an error creating your container: ' + err.message);
      callback({data: data, type: 'error'});
      return
    }
    s3.putObject({Key: containerKey}, function(err, data) {
      if (err) {
        console.log('There was an error creating your container: ' + err.message);
        callback({data: data, type: 'error'});
      }
      console.log('Successfully created container.');
      callback({data: data, type: 'success'});
    });
  });
}

function deleteContainer(containerName, callback) {
  var containerKey = encodeURIComponent(containerName) + '/';
  s3.listObjects({Prefix: containerKey}, function(err, data) {
    if (err) {
      console.log('There was an error deleting your container: ', err.message);
      callback({data: err, type: 'error'});
    }
    var objects = data.Contents.map(function(object) {
      return {Key: object.Key};
    });
    s3.deleteObjects({
      Delete: {Objects: objects, Quiet: true}
    }, function(err, data) {
      if (err) {
        console.log('There was an error deleting your container: ', err.message);
        callback({data: err, type: 'error'});
      }
      console.log('Successfully deleted container.');
      callback({data: data, type: 'success'});
    });
  });
}

exports.apis = {
  uploadToS3: uploadToS3,
  createContainer: createContainer,
  deleteContainer: deleteContainer
};
