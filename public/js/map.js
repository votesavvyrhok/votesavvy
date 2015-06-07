var Map = {
    map: undefined,
    marker: undefined,
    init: function(){
        var mapOptions = {
            center: { lat: 45.2501566, lng: -75.8002568},
            zoom: 10,
            scrollwheel: false
        };
        Map.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
        $('#map-canvas').hide();

        google.maps.event.addListener(Map.map, 'click', function(event) {
            Map.placeMarker(event.latLng, Map.map);
        });
    },
    show: function(){
        $('#map-canvas').show();
        google.maps.event.trigger(Map.map, 'resize');
    },
    hide: function(){
        $('#map-canvas').hide();
    },
    placeMarker: function(location, map) {
        if (Map.marker !== undefined){
            Map.marker.setMap(null);
        }
        Map.marker = new google.maps.Marker({
            position: location,
            map: map
        });
    },
    goToAddress: function(postcode, map, callback) {
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode( { 'address': postcode }, function(results, status) {
            if (status == 'OK') {
                Map.placeMarker(results[0].geometry.location, map);
                Map.show();
                map.setCenter(Map.marker.getPosition());
                callback();
            } else {
                console.log('Geocode was not successful for the following reason: ' + status);
            }
        });
    }
};