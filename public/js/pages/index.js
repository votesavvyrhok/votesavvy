var Index = {
    bind: function(){
        $('#postalcode').on('click', 'input[type=button]', function() {
            var code = $(this).parent().find('input[type=text]').val();
            var callback = function(data){
                console.log(data);
                var $reps = $('#reps');
                var candidateList = '';
                $.each(data.candidates_centroid, function(){
                    candidateList += 'Name: ' + this.name + '<br />';
                });

                $reps.html(candidateList);
            };
            Represent.postalCode(code, callback);
        });
    }
};