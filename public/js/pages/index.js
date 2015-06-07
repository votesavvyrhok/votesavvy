var Index = {
    bind: function(){
        $('#postalcode').on('click', 'input[type=button]', function() {
            var code = $(this).parent().find('input[type=text]').val();
            var callback = function(data){
                console.log(data);
                var $reps = $('#reps');
                var addToReps = '';
                var candidateList = '';
                try {
                    $.each(data.candidates_centroid, function(){
                        candidateList += '<div class=".col-xs-6 .col-md-4"><div class="thumbnail media">';
                        candidateList += '<div class="media-left"><img id="img-candidate" alt="candidate" src="' + this.photo_url + '"></div>';
                        candidateList += '<div class="media-body">Name: <strong>' + this.name + '</strong><br />'
                        candidateList += 'Party: ' + this.party_name + '<br />';
                        candidateList += 'Website: <a href="' + this.personal_url + '">' + this.personal_url + '</a></div></div>';

                        candidateList += '</div></div>';
                        
                    });
                } catch(err) {
                    candidateList = '<li>No candidates found</li>';
                }
                addToReps += candidateList;
                $reps.html(addToReps);
            };
            Represent.postalCode(code, callback);
        });
    }
};

