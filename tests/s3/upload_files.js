const s3 = require('../../config/config_s3').s3;

// call S3 to retrieve upload file to specified bucket
var uploadParams = { Key: '', Body: '' };
var file = process.argv[2];

var fs = require('fs');
var fileStream = fs.createReadStream(file);
fileStream.on('error', function (err) {
  console.log('File Error', err);
});
uploadParams.Body = fileStream;

var path = require('path');
uploadParams.Key = path.basename(file);

//to upload to a container
var albumPhotosKey = encodeURIComponent('testing_photos') + '//';
var fileName = albumPhotosKey + file;
uploadParams.Key = fileName;

// call S3 to retrieve upload file to specified bucket
s3.upload(uploadParams, function (err, data) {
  if (err) {
    console.log("Error", err);
  } if (data) {
    console.log("Upload Success", data.Location);
  }
}).on('httpUploadProgress', function (progress) {
  console.log('Upload progress:- ' + (progress.loaded / progress.total * 100) + '%');
});
