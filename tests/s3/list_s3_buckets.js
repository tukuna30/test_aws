const s3 = require('../../config/config_s3').s3;

// Call S3 to list current buckets
s3.listBuckets(function (err, data) {
    if (err) {
        console.log("Error", err);
    } else {
        console.log("Bucket List", data.Buckets);
    }
});
