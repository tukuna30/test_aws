let AWS = require('aws-sdk');
AWS.config.loadFromPath((process.env.HOME || process.env.USERPROFILE) + '/.ssh/aws_config.json');

exports.s3 = new AWS.S3({apiVersion: '2006-03-01',  params: {Bucket: 'test-bucket-tukuna'}});
