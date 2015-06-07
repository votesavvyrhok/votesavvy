var Represent = {
    boundarySets: function(boundary, callback){
        // TODO
    },
    boundaries: function(boundary, callback){
        // TODO
    },
    boundariesLatLon: function(lat, lon, callback){
        $.get('/represent/boundariesLatLon/' + lat + '/' + lon, function(data){
            console.log(data);
            callback(data.objects);
        });
    },
    postalCode: function(postalCode, candidatesCallback, boundaryCallback){
        $.get('/represent/postcode/' + postalCode.toUpperCase(), function(data){
            console.log(data);
            candidatesCallback(data.candidates_centroid);
            boundaryCallback(data.boundaries_concordance);
        });
    },
    representativesLatLon: function(lat, lon, callback){
        $.get('/represent/representativesLatLon/' + lat + '/' + lon, function(data){
            console.log(data);
            callback(data.objects);
        });
    },
    candidatesLatLon: function(lat, lon, callback){
        $.get('/represent/candidatesLatLon/' + lat + '/' + lon, function(data){
            console.log(data);
            callback(data.objects);
        });
    }
};

