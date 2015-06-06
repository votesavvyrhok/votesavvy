var Index = {
    bind: function(){
        $('#postalcode').on('click', 'input[type=button]', function() {
            var code = $(this).parent().find('input[type=text]').val();
            var callback = function(data){
                console.log(data);
                var $reps = $('#reps');
                var addToReps = '<ul>';
                var candidateList = '';
                try {
                    $.each(data.candidates_centroid, function(){
                        candidateList += '<li>Name: ' + this.name + '</li>';
                    });
                } catch(err) {
                    candidateList = '<li>No candidates found</li>';
                }
                    
                addToReps += candidateList
                addToReps += '</ul>';

                $reps.html(addToReps);
            };
            Represent.postalCode(code, callback);
        });
    }
};