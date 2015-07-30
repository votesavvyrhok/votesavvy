// For OpenNorth Represent API calls

module.exports = function (app) {
    var represent = require('represent');

    app.get('/represent', function (req, res) {
        res.render('index.html');
    });

    app.get('/represent/postcode/:code', function (req, res) {

        //retrieve the datacache first
        var cacheKey = req.params.code;

        app.locals.datacache.get(cacheKey, function (err, data) {
            if (!err) {
                //in the cache
                console.log("cache retrieved");
                res.send(data);
            }
            else{

                represent.postalCode(req.params.code, function (err, data) {
                if (err) {
                    console.log("represent error" + JSON.stringify(err));
                    res.send(err);
                }
                else {
                    //store in the cache
                    app.locals.datacache.put(cacheKey, data, function (err, body) {
                        if (err) {
                            console.log("cache error" + JSON.stringify(err));
                        }
                        else {
                              console.log("cache stored: " + JSON.stringify(body));
                        }
                    });
                    res.send(data);
                }
                });
            }
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