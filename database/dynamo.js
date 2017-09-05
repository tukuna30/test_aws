const docClient = require('../config/config_dynamoDB').docClient;

function insertRecord(params) {
    return new Promise((resolve, reject) => {
        console.log("Adding a new item...");
        docClient.put(params, function (err, data) {
            if (err) {
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                reject(err);
            } else {
                console.log("Added item:", JSON.stringify(data, null, 2));
                resolve(data);
            }
        });
    });
}

function readRecord(params) {
    return new Promise((resolve, reject) => {
        console.log("reading record ...");
        docClient.get(params, function (err, data) {
            if (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                reject(err);
            } else {
                console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
                resolve(data);
            }
        });
    });
}

function updateRecord(params) {
    return new Promise((resolve, reject) => {
        console.log("Updating record ...");
        docClient.update(params, function (err, data) {
            if (err) {
                console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                reject(err);
            } else {
                console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
                resolve(data);
            }
        });
    });
}
function deleteRecord(params) {
    return new Promise((resolve, reject) => {
        console.log("Attempting a conditional delete...");
        docClient.delete(params, function (err, data) {
            if (err) {
                console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
                reject(err);
            } else {
                console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
                resolve(data);
            }
        });
    });
}

function queryTable(params) {
    return new Promise((resolve, reject) => {
        docClient.query(params, function (err, data) {
            if (err) {
                console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
                reject(err);
            } else {
                console.log("Query succeeded.");
                data.Items.forEach(function (item) {
                    resolve(data);
                });
            }
        });
    });
}
exports.apis = {
    insertRecord: insertRecord,
    readRecord: readRecord,
    updateRecord: updateRecord,
    deleteRecord: deleteRecord,
    queryTable: queryTable
};