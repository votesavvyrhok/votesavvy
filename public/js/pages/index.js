var Index = {
    bind: function(){
        $('#postalcode').on('click', 'input[type=button]', function() {
            var code = $(this).parent().find('input[type=text]').val();
            var callback = function(data){
                console.log(data);
                var $reps = $('#reps');
                var addToReps = '<div class="media">';
                var candidateList = '<div class="reps">';
                try {
                    $.each(data.candidates_centroid, function(){
                        candidateList = '<div class="media">';
                        candidateList += '<div class="media-left"><img id="img-candidate" alt="candidate" src="' + this.photo_url + '"></div>';
                        candidateList += '<div class="media-body">Name: <strong>' + this.name + '</strong><br />'
                        candidateList += 'Party: ' + this.party_name + '</div>';
                        candidateList += '</div>';
                        addToReps += candidateList;
                    });
                } catch(err) {
                    candidateList = '<li>No candidates found</li>';
                    addToReps += candidateList;
                }
                addToReps += '</div>';

                $reps.html(addToReps);
            };
            Represent.postalCode(code, callback);
        });
    }
};

