const dynamoDB = require('../../config/config_dynamoDB').dynamoDB;

var params = {
    TableName: "Movies"
};

dynamoDB.deleteTable(params, function (err, data) {
    if (err) {
        console.error("Unable to delete table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Deleted table. Table description JSON:", JSON.stringify(data, null, 2));
    }
});

