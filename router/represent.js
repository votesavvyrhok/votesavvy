// For OpenNorth Represent API calls
module.exports = function (app) {
    var https = require('https');
    var represent = require('represent');

    app.get('/', function (req, res) {
        res.render('index.html');
    });

    app.get('/postcode', function (req, res) {
        res.render('opennorth-test.html');
    });

    app.get('/postcode/:code', function (req, res) {
        represent.postalCode(req.params.code, function(err, data){
            res.send(data);
        });
    });
};