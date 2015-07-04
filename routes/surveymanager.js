/**
 * Created by a on 6/28/2015.
 */

module.exports=function(app,db){

    var surveydb = db[0];

    var preferencedb = db[1];

    var uuid = require('node-uuid');
    var bodyParser = require('body-parser');

// configure app to use bodyParser()
// this will let us get the data from a POST
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    //a function to retrieve survey data
    //the format of survey data is as :
    /*
    {
     user_token: uuid     //primary key, the user identifier in votesavvyrhok
     status:  "inprogress"|"submitted"   //the status of the answers of the user
     data: surveydata
    }

    surveydata: {
        "token": "hash",
        "timestamp": "YYYY-MM-DD'T'HH-MM-SS",
        "issues":{
            "Justice":0,
            "Health":1,
            "Welfare":2,
            "Immigration":3,
            "Economy":4,
            "Environment":5,
            "Other":6,
            "Education":7,
            "Defence":8
        },
        "sources":{
            "Television":0,
            "Radio":1,
            "Newspaper":2,
            "Social":0,
            "Online":1,
            "Family":2,
            "Political":1,
            "Elected":2
        },
        "activity":{
            "face":0,
            "message":0,
            "social":0,
            "petition":0,
            "protest":1,
            "volunteerPolitical":0,
            "donatePolitical":0,
            "volunteerCharity":1,
            "donateCharity":1
        },
        "gender":"male/female/other",
        "birthDate":"YYYY-MM-DD",
        "work":"fullTime/partTime/student/etc..",
        "postalCode":"A1A1A1",
        "twitter":"",
        "email":"",
        "other":""}
    }
    */

    var preference = require('./preferencemanager.js')(app,[preferencedb]);

    app.get('/survey', function(req, res){

        //render the blank survey form in the case that no session has been defined
        var user_token = req.session.session_token;
        var screen_name = req.session.screen_name;
        console.log("at survey manager, session_token is" + user_token)

        var data = {};

        if (!user_token)
        {
            res.render('/app/index.html');
        }
        else
        {
          surveydb.get(user_token,{rev_info:true},function(err,results){
                if (err)
                {
                    res.render('/app/index.html');
                }
                else
                {
                    if (results.status == "inprogress"){
                        data = results.data;

                        data.screen_name = screen_name;

                        console.log("the survey results are " + JSON.stringify(data));

                        res.send(data);
                    }
                    else
                    {
                        res.send(results);
                    }
                }
          });
        }
    });

    var storedoc = function(user_token, data, status,next){

        var doc = data;
        doc.status = status;
        doc.token = user_token;

        //store the doc in db
        console.log('store the doc'+ JSON.stringify(doc));
        console.log("at surveymanager, session_token is "+ user_token);

        surveydb.get(user_token,function(err,body) {
            if (err) {
                //There is no doc of the answer exists
                surveydb.insert(doc, user_token, function (err, body) {
                    if (!err)
                        console.log(body);
                    else
                        console.log(err);
                    next();
                });

            }
            else {
                doc._id = body._id;
                doc._rev = body._rev;
                surveydb.insert(doc, function (err, body) {
                    if (err)
                        console.log(err);
                    else
                        console.log(body);
                    next();
                });
            }
        });

    }

    app.post('/survey/:status',function(req,res){

        var user_token = req.session.session_token;
        var status = req.params.status;

        //not store the answer in the case the survey is inprogress and the user is not in signing in state
        if (!user_token && status == 'submit')
            user_token = uuid.v4();

        console.log("received form data is as " + JSON.stringify(req.body));

        var data;
        for (i in req.body)
        {
            data = JSON.parse(i);
        }

        if (user_token)
            storedoc(user_token, data, status,function(){
                if (status == "submit") {
                    preference.generatepref(user_token, data,function(preference){
                        if (req.session.session_token) {
                            res.send(preference);
                        }
                        else
                            res.send(preference);

                    });
                }
                else
                {
                    var results = req.body;
                    results.screen_name = req.session.screen_name;
                    res.render('/app/index.html');
                }

        });

    });
}