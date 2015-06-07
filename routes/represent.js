// For OpenNorth Represent API calls
module.exports = function (app) {
    var represent = require('represent');

    app.get('/represent', function (req, res) {
        res.render('index.html');
    });

    app.get('/represent/postcode/:code', function (req, res) {
        represent.postalCode(req.params.code, function(err, data){
            res.send(data);
        });
    });

    app.get('/represent/boundariesLatLon/:lat/:lon', function (req, res) {
        represent.boundariesLatLon(req.params.lat, req.params.lon, function(err, data){
            res.send(data);
        });
    });

    app.get('/represent/representativesLatLon/:lat/:lon', function (req, res) {
        represent.representativesLatLon(req.params.lat, req.params.lon, function(err, data){
            res.send(data);
        });
    });

    app.get('/represent/candidatesLatLon/:lat/:lon', function (req, res) {
        represent.candidatesLatLon(req.params.lat, req.params.lon, function(err, data){
            res.send(data);
        });
    });

    represent.candidatesLatLon = function(lat, lon, callback){
        represent.get("/candidates/?point=" + lat + "," + lon, callback);
    }
};