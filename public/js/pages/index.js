var Index = {
    bind: function(){
        $('#postalCode').on('click', 'input[type=button]', function() {
            var code = $(this).parent().find('input[type=text]').val();
            $(".useMap").click();
            var callback = function(){
                var marker = Map.marker;
                if (marker !== undefined){
                    Represent.candidatesLatLon(marker.position.lat(), marker.position.lng(), Index.addToReps);
                    Represent.boundariesLatLon(marker.position.lat(), marker.position.lng(), Index.addBoundary);
                }
            };
            Map.getPostcodeLocation(code, Map.map, callback);
        });

        $('#latLonSubmit').on('click', function() {
            var marker = Map.marker;
            if (marker !== undefined){
                Represent.candidatesLatLon(marker.position.lat(), marker.position.lng(), Index.addToReps);
                Represent.boundariesLatLon(marker.position.lat(), marker.position.lng(), Index.addBoundary);
            }
        });
        $(".useMap").click(function () {
            $("#map-canvas").css('position', 'relative');
            $("#map-canvas").css('left', '0px');
            google.maps.event.addDomListener(window, 'load', Map.init());
            $(".useMap").hide();
            $("#postalCode").hide();
            $(".dontUseMap").show();
            $("#latLonSubmit").show();
        });
        $(".dontUseMap").click(function () {
            $("#map-canvas").css('position', 'absolute');
            $("#map-canvas").css('left', '-100%');
            $(".useMap").show();
            $("#postalCode").show();
            $(".dontUseMap").hide();
            $("#latLonSubmit").hide();
        });

    },
    addToReps: function(data){
        console.log(data);
        var $reps = $('#reps');
        var candidateList = '';
        try {
            $.each(data, function(){
                candidateList += '<div class="thumbnail media .col-xs-4 .col-sm-3">';
                candidateList += '<div class="media-left"><img id="img-candidate" alt="candidate" src="' + this.photo_url + '"></div>';
                candidateList += '<div class="media-body text-candidate">Name: <strong>' + this.name + '</strong><br />'
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
        console.log(data);
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

