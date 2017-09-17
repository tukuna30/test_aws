const s3 = require('../../config/config_s3').s3;

function deleteContainer(containerName) {
  var containerKey = encodeURIComponent(containerName) + '/';
  s3.listObjects({ Prefix: containerKey }, function (err, data) {
    if (err) {
      console.log('There was an error deleting your container: ', err.message);
    }
    var objects = data.Contents.map(function (object) {
      return { Key: object.Key };
    });
    s3.deleteObjects({
      Delete: { Objects: objects, Quiet: true }
    }, function (err, data) {
      if (err) {
        console.log('There was an error deleting your container: ', err.message);
      }
      console.log('Successfully deleted container.');
    });
  });
}
deleteContainer('testing_photos');
