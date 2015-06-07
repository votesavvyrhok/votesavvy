var Index = {
    init: function(){
        $('#address').on('click', 'input[type=button]', function() {
            var code = $(this).parent().find('input[type=text]').val();
            Map.goToAddress(code, Map.map, Index.loadFromMarker);
        });

        $('#mapButton').on('click', function() {
            $(this).val('Submit Map');
            Map.show();
            $(this).off('click').on('click', Index.loadFromMarker);
        });

        google.maps.event.addDomListener(window, 'load', Map.init());
    },
    loadFromMarker: function(){
        var marker = Map.marker;
        if (marker !== undefined){
            Represent.candidatesLatLon(marker.position.lat(), marker.position.lng(), Index.addToReps);
            Represent.boundariesLatLon(marker.position.lat(), marker.position.lng(), Index.addBoundary);
        }
    },
    addToReps: function(data){
        var $reps = $('#reps');
        var candidateList = '';
        try {
            $.each(data, function(){
                candidateList += '<div class="thumbnail media .col-xs-4 .col-sm-3">';
                candidateList += '<div class="media-left"><img id="img-candidate" alt="candidate" src="' + this.photo_url + '"></div>';
                candidateList += '<div class="media-body text-candidate"><h2><strong>' + this.name + '</strong></h2>'
                candidateList += 'Party: ' + this.party_name + '<br />';
                candidateList += 'Website: <a href="' + this.personal_url + '">' + this.personal_url + '</a></div></div>';

                candidateList += '</div>';

            });
        } catch(err) {
            candidateList += '<div class=".col-xs-6 .col-md-4"><div class="thumbnail media">';
            candidateList += '<div class="media-body text-candidate">No candidates found<br />'
            candidateList += '</div></div>';
        }
        $reps.html(candidateList);
    },
    addBoundary: function(data){
        var $boundary = $('#boundary');
        var boundaryContent = '';
        try {
            $.each(data, function(){
                boundaryContent += '</div></div>';
            });
        } catch(err) {
            boundaryContent = '<li>No boundary</li>';
        }
        $boundary.html(boundaryContent);
    }
};

