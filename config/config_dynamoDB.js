let AWS = require('aws-sdk');

AWS.config.update({
    region: "ap-south-1",
    endpoint: "https://dynamodb.ap-south-1.amazonaws.com"
});

exports.docClient = new AWS.DynamoDB.DocumentClient();
exports.dynamoDB = new AWS.DynamoDB();
