var Represent = {
    boundarySets: function(boundary){
        // TODO
    },
    boundaries: function(boundary){
        // TODO
    },
    boundariesLatLon: function(lat, lon){
        // TODO
    },
    postalCode: function(postalCode){
        $.get('/represent/postcode/' + postalCode.toUpperCase(), function(data){
            console.log(data);
        });
    },
    representativesLatLon: function(lat, lon){
        // TODO
    }
};

