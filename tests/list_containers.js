const s3 = require('../config_s3').s3;

function listContainers() {
  s3.listObjects({Delimiter: '/'}, function(err, data) {
    if (err) {
      return alert('There was an error listing your containers: ' + err.message);
    } else {
      let containers = data.CommonPrefixes.map(function(commonPrefix) {
        let prefix = commonPrefix.Prefix;
        let containerName = decodeURIComponent(prefix.replace('/', ''));
        return containerName;
      });
      console.log(containers);
    }
  });
}
listContainers();
