const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const path = require('path');
const s3 = require('./s3');
const fs = require('fs');
let socketConnection = null;

let http = require('http').Server(app);

let socketClusterServer = require('socketcluster-server');
let scServer = socketClusterServer.attach(http);

scServer.on('connection', function (socket) {
  console.log('a user connected');
  socketConnection = socket;
});

let bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '100mb'}));
app.use(fileUpload());
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname, 'public')));

http.listen(3000, () => console.log('Server running on port 3000'));

app.post('/upload', function handleUpload(req, response) {
  req.setTimeout(10*60*1000);
  if (!req.files) {
    return response.status(400).send('No files were uploaded.');
  }
  console.log('upload in progress!!!');
  let file = req.files.imageFiles;
  console.log(file);
  file.mv("./uploaded_files/" + file.name, function(err) {
    if (err)
    return res.status(500).send(err);

    let awsUpload = s3.apis.uploadToS3(file.name, function (uploadStatus) {
      if (uploadStatus.type === 'error') {
        return response.status(400).send(uploadStatus.data);
      }
      else {
        fs.unlink("./uploaded_files/" + file.name, function(err){
          if(err) {
            return console.log(err);
          }
          console.log('file deleted successfully');
        });
        return response.status(200).send(uploadStatus.data);
      }
    });
    awsUpload.on('httpUploadProgress', function(progress) {
      let progressVal = progress.loaded / progress.total * 100;
      console.log('Upload progress:- ' + progressVal + '%');
      socketConnection.emit('fileUploadProgress', progressVal);
    });
  });
})
