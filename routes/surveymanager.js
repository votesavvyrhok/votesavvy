module.exports = function (app, db) {

    var surveydb = db.handler;

    var indexspec = db.indexes;

    var uuid = require('node-uuid');
    var bodyParser = require('body-parser');
    var jsck = require('jsck');

    var surveySchema = new jsck.draft4({
        "type": "object",
        "properties": {
            "token": {
                "type": ["string", "null"]
            },
            "timestamp": {
                "type": "number"
            },
            "issues": {
                "properties": {
                    "Justice": {
                        "type": ["number", "null"],
                        "minimum": 1,
                        "maximum": 5
                    },
                    "Health": {
                        "type": ["number", "null"],
                        "minimum": 1,
                        "maximum": 5
                    },
                    "Welfare": {
                        "type": ["number", "null"],
                        "minimum": 1,
                        "maximum": 5
                    },
                    "Immigration": {
                        "type": ["number", "null"],
                        "minimum": 1,
                        "maximum": 5
                    },
                    "Economy": {
                        "type": ["number", "null"],
                        "minimum": 1,
                        "maximum": 5
                    },
                    "Environment": {
                        "type": ["number", "null"],
                        "minimum": 1,
                        "maximum": 5
                    },
                    "Other": {
                        "type": ["number", "null"],
                        "minimum": 1,
                        "maximum": 5
                    },
                    "Education": {
                        "type": ["number", "null"],
                        "minimum": 1,
                        "maximum": 5
                    },
                    "Defence": {
                        "type": ["number", "null"],
                        "minimum": 1,
                        "maximum": 5
                    }
                }
            },
            "sources": {
                "properties": {
                    "Television": {
                        "type": ["number", "null"],
                        "minimum": 1,
                        "maximum": 10
                    },
                    "Radio": {
                        "type": ["number", "null"],
                        "minimum": 1,
                        "maximum": 10
                    },
                    "Newspaper": {
                        "type": ["number", "null"],
                        "minimum": 1,
                        "maximum": 10
                    },
                    "Social": {
                        "type": ["number", "null"],
                        "minimum": 1,
                        "maximum": 10
                    },
                    "Online": {
                        "type": ["number", "null"],
                        "minimum": 1,
                        "maximum": 10
                    },
                    "Family": {
                        "type": ["number", "null"],
                        "minimum": 1,
                        "maximum": 10
                    },
                    "Political": {
                        "type": ["number", "null"],
                        "minimum": 1,
                        "maximum": 10
                    },
                    "Elected": {
                        "type": ["number", "null"],
                        "minimum": 1,
                        "maximum": 10
                    }
                }
            },
            "activity": {
                "properties": {
                    "face": {
                        "type": "boolean"
                    },
                    "message": {
                        "type": "boolean"
                    },
                    "social": {
                        "type": "boolean"
                    },
                    "petition": {
                        "type": "boolean"
                    },
                    "protest": {
                        "type": "boolean"
                    },
                    "volunteerPolitical": {
                        "type": "boolean"
                    },
                    "donatePolitical": {
                        "type": "boolean"
                    },
                    "volunteerCharity": {
                        "type": "boolean"
                    },
                    "donateCharity": {
                        "type": "boolean"
                    }
                }
            },
            "interest": {
                "properties": {
                    "interest": {
                        "type": "number",
                        "minimum": 1,
                        "maximum": 4
                    }
                }
            },
            "personal": {
                "properties": {
                    "gender": {
                        "enum": [ "female", "male", "other", "undisclosed" ]
                    },
                    "birthDate": {
                        "type": ["string", "null"],
                        "format": "date"
                    },
                    "postalCode": {
                        "type": ["string", "null"],
                        "pattern": "[ABCEGHJKLMNPRSTVXY][0-9][ABCEGHJKLMNPRSTVWXYZ][0-9][ABCEGHJKLMNPRSTVWXYZ][0-9]"
                    },
                    "twitter": {
                        "type": ["string", "null"],
                        "pattern": "^(\\w){1,15}$"
                    },
                    email: {
                        "type": ["string", "null"],
                        "format": "email"
                    },
                    work: {
                        "fullTime": {
                            "type": "boolean"
                        },
                        "partTime": {
                            "type": "boolean"
                        },
                        "unemployed": {
                            "type": "boolean"
                        },
                        "disabled": {
                            "type": "boolean"
                        },
                        "undergradStudent": {
                            "type": "boolean"
                        },
                        "mastersStudent": {
                            "type": "boolean"
                        },
                        "phdStudent": {
                            "type": "boolean"
                        },
                        "collegeStudentApprentice": {
                            "type": "boolean"
                        },
                        "home": {
                            "type": "boolean"
                        },
                        "retired": {
                            "type": "boolean"
                        },
                        "undisclosed": {
                            "type": "boolean"
                        }
                    },
                    "other": {
                        "type": ["string", "null"],
                        "format": "email"
                    }
                }
            }
        }
    });

// configure app to use bodyParser()
// this will let us get the data from a POST
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());


    //retrieve the indexes of surveydb

    app.get('/survey', function (req, res) {

        //render the blank survey form in the case that no session has been defined

        var user_token = req.session.session_token;
        var screen_name = req.session.screen_name;

        console.log('at survey manager, session_token is' + user_token);

        res.render('app/index.html', {screen_name: screen_name});

    });

    app.get('/survey/data', function (req, res) {

        var user_token = req.session.session_token;
        var screen_name = req.session.screen_name;

        console.log('at survey manager, session_token is' + user_token);

        var data = {};

        if (user_token) {
          //retrieved by the index
          //sort by the timestamp.end
            var query = {
                selector: {
                   "token": {
                             "$eq": user_token
                         }
                     },

                sort: [{"token":"desc"},
                    {"formdata.timestamp.end": "desc"}],
                limit: 1,
                skip:0
            };

            surveydb.find(indexspec.user, query, function (err, results) {
                if (err) {
                    console.log("retrieve error" + JSON.stringify(err));
                    res.json(null);
                } else {
                    console.log("number of document is %d, first result is %s ", results.docs.length, JSON.stringify(results.docs[0]));
                    console.log("time of the submissions")
                    /*
                    for (var doc in results.docs){
                       console.log (results.docs[doc].formdata.timestamp.end + " ");
                    }
                    */
                    if (results.docs.length)
                        res.json(results.docs[0].formdata);
                    else
                        res.json(null);
                    //res.json(results.formdata);
                }
           });
        }
    });

    var storedoc = function (user_token, data, status) {
        var doc = data;
        doc.status = status;
        doc.token = user_token;

        /*the data is stored as
        {
        token:     //token as index, for the sigined user, the token is the user_token
        status:    //submit or inprogress
        formdata: {    //the data received from client

        }
        }
        */
        //store the doc in db
        console.log('store the doc' + JSON.stringify(doc));
        console.log('at surveymanager, session_token is ' + user_token);

        //the primary key is auto generated to store multiple sets of answers of a user
        surveydb.insert(doc, null, function (err, body) {
             if (!err)
                 console.log(body);
             else
                 console.log(err);
        });

    };

    app.post('/survey/:status', function (req, res) {
        var user_token = req.session.session_token;
        var status = req.params.status;

        //not store the answer in the case the survey is inprogress and the user is not in signing in state
        if (!user_token && status == 'submit')
            user_token = uuid.v4();

        console.log('received form data is as ' + JSON.stringify(req.body));

        var data={};
        for (var i in req.body) {
            data.formdata = JSON.parse(i);
        }
        var validationResults = surveySchema.validate(data);

        //the validation function is turned off temporarily
        //will be turned on after the JSON format is determined
        validationResults.valid = true;

        if (validationResults.valid) {
            if (user_token) {
                storedoc(user_token, data, status);

                //return ok
                res.status(200).json({status:"ok"});
            }
        } else {
            console.log('errors: ');

            for (var error in validationResults.errors){
                console.log(validationResults.errors[error]);
                res.status(406).json({status:"validation error"});
            }
        }
    });
};