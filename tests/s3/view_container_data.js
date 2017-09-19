const s3 = require('../../config/config_s3').s3;

function viewContainerData(containerName, bucketName) {
  var containerItemKey = encodeURIComponent(containerName) + '/';
  return new Promise((resolve, reject) => {
    s3.listObjects({ Prefix: containerItemKey }, function (err, data) {
      if (err) {
        console.log('There was an error viewing your container: ' + err.message);
        reject(err);
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
      resolve({data: {containerId: containerName, containerSize: items.totalSize ? items.totalSize : 0, items: items}, type: 'success'});
    });
  });
}

viewContainerData('Shahnawaz%20Ahmed_10214022191252853', 'test-bucket-tukuna').then((items) => {
  console.log(items);
})
  .catch((reason) => {
    console.log('Handle rejected promise (' + reason + ') here.');
  });
