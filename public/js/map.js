var Map = {
    init: function(){
        var mapOptions = {
            center: { lat: 45.2501566, lng: -75.8002568},
            zoom: 8
        };
        var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

        google.maps.event.addListener(map, 'click', function(event) {
            Map.placeMarker(event.latLng, map);
        });
    },
    placeMarker: function(location, map) {
        var marker = new google.maps.Marker({
            position: location,
            map: map
        });

        map.setCenter(location);
    }
};