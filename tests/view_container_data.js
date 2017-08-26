const s3 = require('../config/config_s3').s3;

function viewContainerData(containerName, bucketName) {
  var containerItemKey = encodeURIComponent(containerName) + '//';
  return new Promise((resolve, reject) => {
    s3.listObjects({ Prefix: containerItemKey }, function (err, data) {
      if (err) {
        console.log('There was an error viewing your container: ' + err.message);
        reject(err);
      }
      // `this` references the AWS.Response instance that represents the response
      var href = this.request.httpRequest.endpoint.href;
      var bucketUrl = href + bucketName + '/';
      console.log(data);
      var items = data.Contents.map(function (item) {
        var itemKey = item.Key;
        var itemUrl = bucketUrl + encodeURIComponent(itemKey);
        console.log(itemUrl);
        console.log(itemKey);
        return item;
      });
      resolve(items);
    });
  }
  );
}

viewContainerData('testing_photos', 'test-bucket-tukuna').then((items) => {
  console.log(items);
})
  .catch((reason) => {
    console.log('Handle rejected promise (' + reason + ') here.');
  });
