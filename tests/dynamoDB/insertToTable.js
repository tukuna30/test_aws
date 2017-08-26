const docClient = require('../../config/config_dynamoDB').docClient;

console.log("Importing movies into DynamoDB. Please wait.");
let fs = require('fs');
var allMovies = JSON.parse(fs.readFileSync('tests/dynamoDB/moviedata.json', 'utf8'));
allMovies.forEach(function (movie) {
    var params = {
        TableName: "Movies",
        Item: {
            "year": movie.year,
            "title": movie.title,
            "info": movie.info
        }
    };

    docClient.put(params, function (err, data) {
        if (err) {
            console.error("Unable to add movie", movie.title, ". Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("PutItem succeeded:", movie.title);
        }
    });
});
