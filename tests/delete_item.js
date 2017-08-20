const s3 = require('../config_s3').s3;

function deleteItem(containerName, itemName) {
  let itemKey = encodeURIComponent(containerName) + '//' + itemName;
  s3.deleteObject({Key: itemKey}, function(err, data) {
    if (err) {
      console.log('There was an error deleting the item: ', err.message);
    }
    console.log('Successfully deleted item.');
  });
}
deleteItem('testing_photos', 'package.json');
