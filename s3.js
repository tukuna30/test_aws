// Load the AWS SDK for Node.js
let AWS = require('aws-sdk');
// Load credentials and set region from config file
AWS.config.loadFromPath((process.env.HOME || process.env.USERPROFILE) + '/.ssh/aws_config.json');

// Create S3 service object
let s3 = new AWS.S3({apiVersion: '2006-03-01'});
let bucketName = 'test-bucket-tukuna';

function uploadToS3 (file, callback) {
  // call S3 to retrieve upload file to specified bucket
  let uploadParams = {Bucket: bucketName, Key: '', Body: ''};

  let fs = require('fs');
  let path = require('path');

//To-do following piece helps process/upload files in chunk, but uploaded file should be in current folder :(
  let fileStream = fs.createReadStream("./uploaded_files/" + file);
  fileStream.on('error', function(err) {
    console.log('File Error', err);
  });
  uploadParams.Body = fileStream;

  //uploadParams.Body = file;
  uploadParams.Key = path.basename(file);

  s3.upload(uploadParams, function (err, data) {
    if (err) {
      console.log("Error", err);
      callback({data: data, type: 'error'});
    } if (data) {
      console.log("Upload Success", data.Location);
      callback({data: data, type: 'success'});
    }
  });
}

exports.apis = {
  uploadToS3: uploadToS3
};
