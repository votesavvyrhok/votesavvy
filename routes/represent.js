// For OpenNorth Represent API calls

module.exports = function (app) {

    var represent = require('represent');

    var logger = app.locals.log4js.getLogger('represent');

    app.get('/represent', function (req, res) {
        res.render('index.html');
    });

    app.get('/represent/postcode/:code', function (req, res) {

        //retrieve the datacache first
        var cacheKey = req.params.code;

        app.locals.datacache.get(cacheKey, function (err, data) {
            if (!err) {
                //in the cache
                logger.info("cache retrieved");
                res.status(200).json(data);
            }
            else{

                represent.postalCode(req.params.code, function (err, data) {
                if (err) {
                    logger.error("represent error" + err);
                    res.status(400).json({status:err});
                }
                else {
                    //store the candidate information in the cache only
                    var candidates=[];

                    data["candidates_centroid"].forEach(function(candidate){
                        var storedCandidate = {
                            name: null,
                            party_name:null,
                            personal_url: null,
                            photo_url: null
                        };

                        for (var key in storedCandidate){
                                storedCandidate[key] = candidate[key];
                        }
                        candidates.push(storedCandidate);
                    });

                    var usedInfo = {candidates_centroid:candidates};

                    app.locals.datacache.put(cacheKey,usedInfo , function (err, body) {
                        if (err) {
                            logger.info("cache error" + JSON.stringify(err));
                        }
                        else {
                            logger.info("cache stored: " + JSON.stringify(body));
                        }
                    });
                   res.status(200).json(usedInfo);
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