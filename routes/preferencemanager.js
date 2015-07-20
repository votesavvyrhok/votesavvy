/**
 * Created by a on 6/28/2015.
 */


module.exports=function(app,dbarray){

    var preferencedb = dbarray[0];

    var generatepref= function(user_token, surveydata){

        var pref = {};

        var issues = surveydata.issues;

        var prefissue  = Object.keys(issues).reduce(function(previous,current){
            return issues[previous] > issues[current] ? previous:current
        });

        pref.issue = prefissue;

        console.log("preference: " + JSON.stringify(pref));

        store(user_token,pref);

        return pref;

    }


    var store= function(user_token, doc){

        preferencedb.insert(doc, user_token,function(err,body){
            if (!err)
            {
                console.log("preference is stored for " + user_token);

            }
        });
    }


    app.get("/preference", function(req, res){

        var user_token = req.session.session_token;

        var screen_name = req.session.screen_name;

        var pref_token=req.query.token;

        console.log("preference token "+ pref_token);

        console.log("user token " + user_token);

        var key;
        if (user_token)
        {
            //retrieve the preference from the dbarray
            key = user_token;
        }
        else
            if (pref_token)
                key = pref_token;
            else
            {
                res.status(404);
                res.send('error');
            }

        //retrieve preference from dbarray
        var results={};
        preferencedb.get(key, {revs_info: true}, function(err,body){
            if (!err) {
                results.issue = body.issue;

                if(screen_name)
                    results.token = screen_name;
                else
                    results.token = key;

                console.log("the preference is " + JSON.stringify(results));
                res.render('preference.html', results);
            }
            else
            {
                res.status(404);
                res.send('error');
            }
        });
    }) ;

    return{
        generatepref:generatepref,
        store:store
    }
}