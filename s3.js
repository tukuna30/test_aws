const s3 = require('./config/config_s3').s3;

function uploadFilesToContainer(file, userSpace, callback) {
  // call S3 to retrieve upload file to specified bucket
  let uploadParams = { Key: '', Body: '' };

  let fs = require('fs');
  let path = require('path');

  let fileStream = fs.createReadStream("./uploaded_files/" + file);
  fileStream.on('error', function (err) {
    console.log('File Error', err);
  });
  let filePath = path.basename(file);
  if (userSpace) {
    filePath = encodeURIComponent(userSpace) + '/' + filePath;
  }
  uploadParams.Body = fileStream;
  uploadParams.Key = filePath;

  return s3.upload(uploadParams, {partSize: 5 * 1024 * 1024, queueSize: 1}, function (err, data) {
    if (err) {
      console.log("Error", err);
      callback({ data: data, type: 'error' });
    } if (data) {
      console.log("Upload Success", data.Location);
      callback({ data: data, type: 'success' });
    }
  });
}

function createContainer(containerName, callback) {
  containerName = containerName.trim();
  if (!containerName) {
    callback({ data: 'Container names must contain at least one non-space character', type: 'error' });
    return;
  }
  if (containerName.indexOf('/') !== -1) {
    callback({data: 'Container names cannot contain slashes.', type: 'error'});
    return;
  }
  var containerKey = encodeURIComponent(containerName) + '/';
  s3.headObject({ Key: containerKey }, function (err, data) {
    if (!err) {
      console.log('Container already exists.');
      callback({ data: data, type: 'warning' });
      return;
    }
    if (err.code !== 'NotFound') {
      console.log('There was an error creating your container: ' + err.message);
      callback({ data: data, type: 'error' });
      return
    }
    s3.putObject({ Key: containerKey }, function (err, data) {
      if (err) {
        console.log('There was an error creating your container: ' + err.message);
        callback({ data: data, type: 'error' });
      }
      console.log('Successfully created container.');
      callback({ data: data, type: 'success' });
    });
  });
}

function deleteContainer(containerName, callback) {
  var containerKey = encodeURIComponent(containerName) + '/';
  s3.listObjects({ Prefix: containerKey }, function (err, data) {
    if (err) {
      console.log('There was an error deleting your container: ', err.message);
      callback({ data: err, type: 'error' });
    }
    var objects = data.Contents.map(function (object) {
      return { Key: object.Key };
    });
    s3.deleteObjects({
      Delete: { Objects: objects, Quiet: true }
    }, function (err, data) {
      if (err) {
        console.log('There was an error deleting your container: ', err.message);
        callback({ data: err, type: 'error' });
      }
      console.log('Successfully deleted container.');
      callback({ data: data, type: 'success' });
    });
  });
}

function viewContainerData(containerName, bucketName) {
  var containerItemKey = encodeURIComponent(containerName) + '/';
  return new Promise((resolve, reject) => {
    s3.listObjects({ Prefix: containerItemKey }, function (err, data) {
      if (err) {
        console.log('There was an error viewing your container: ' + err.message);
        reject({data: err, type: 'error'});
      }
      // `this` references the AWS.Response instance that represents the response
      var href = this.request.httpRequest.endpoint.href;
      var bucketUrl = href + bucketName + '/';
      var items = data.Contents.reduce(function(result, item) {
        if (item.Key !== containerItemKey) { 
          item.itemUrl = bucketUrl + encodeURIComponent(item.Key);
          result.totalSize = (result.totalSize ? result.totalSize : 0 ) + item.Size;
          result.push(item);
        } 
        return result;
      }, []);
      resolve({data: {containerId: containerName, containerSize: items.totalSize, items: items}, type: 'success'});
    });
  }
  );
}

function listContainers() {
  return new Promise((resolve, reject) => {
    s3.listObjects({ Delimiter: '/' }, function (err, data) {
      if (err) {
        console.log('There was an error listing your containers: ' + err.message);
        reject(err);
      } else {
        let containers = data.CommonPrefixes.map(function (commonPrefix) {
          let prefix = commonPrefix.Prefix;
          let containerName = decodeURIComponent(prefix.replace('/', ''));
          return containerName;
        });
        console.log(containers);
        resolve(containers);
      }
    });
  });
}

function deleteFile(containerName, fileName) {
  let itemKey = encodeURIComponent(containerName) + '//' + fileName;
  return new Promise((resolve, reject) => {
    s3.deleteObject({ Key: itemKey }, function (err, data) {
      if (err) {
        console.log('There was an error deleting the item: ', err.message);
        reject(err);
      }
      console.log('Successfully deleted item.');
      resolve();
    });
  });
}

exports.apis = {
  uploadFilesToContainer: uploadFilesToContainer,
  createContainer: createContainer,
  deleteContainer: deleteContainer,
  viewContainerData: viewContainerData,
  listContainers: listContainers,
  deleteFile: deleteFile
};
