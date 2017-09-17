const dynamoDb = require('../database/dynamo');
const tableName = 'Users';
let User = {};
let createUser = function (profile) {
    let params = {
        TableName: tableName,
        Item: {
            "id": profile.id,
            "provider": profile.provider,
            "name": profile.name,
            "displayName": profile.name.givenName + ' ' + profile.name.familyName,
            "email": profile.emails ? profile.emails[0].value : "NA",
            "photoUrl": profile.photos ? profile.photos[0].value : "NA"
        }
    }
    return dynamoDb.apis.insertRecord(params);
};


User.findOrCreate = function (userProfile) {
    return new Promise((resolve, reject) => {
        dynamoDb.apis.readRecord({ TableName: tableName, Key: { "id": userProfile.id, "provider": userProfile.provider } }).then(function (profileData) {
            let profile = profileData.Item;
            console.log('profileData ')
            console.log(JSON.stringify(profileData));
            if (!profile || !profile.id) {
                console.log('Storing a user ');
                createUser(userProfile).then(function (data) {
                    console.log('User data from db ' + JSON.stringify(data));
                    resolve(userProfile);
                });
                return;
            }
            if (profile.id) {
                resolve(profile);
            }
        }, function (error) {
            createUser(userProfile).then(function (data) {
                //TODO:- dynamo is not returning the record which is added, a read required? :(
                console.log('User data from db ' + data);
                resolve(userProfile);
            });
        });

    });
};
exports.User = User;