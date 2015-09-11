module.exports = function (app, db) {

    var surveydb = db.handler;
    var indexspec = db.indexes;

    var logger = app.locals.log4js.getLogger('survey');

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

    //retrieve the indexes of surveydb

    app.get('/survey', function (req, res) {

        //render the blank survey form in the case that no session has been defined

        var user_token = req.session.session_token;
        var screen_name = req.session.screen_name;

        logger.debug('at survey manager, session_token is' + user_token);

        res.render('app/index.html', {screen_name: screen_name});

    });

    app.get('/survey/data', function (req, res) {

        var user_token = req.session.session_token;
        var screen_name = req.session.screen_name;

        logger.debug('at survey manager, session_token is' + user_token);

        if (user_token) {
          //retrieved by the index
          //sort by the timestamp.end
            var query = {
                selector: {
                   "token": {
                             "$exists":true,
                             "$eq": user_token
                         }
                     },
                sort: [{"token":"desc"},
                       {"recordedat": "desc"}],
                limit: 1,
                skip:0
            };

            surveydb.find(indexspec.user, query, function (err, results) {
                if (err) {
                    logger.warn("retrieve error" + JSON.stringify(err));
                    res.json(null);
                } else {
                    logger.info("number of document is %d, first result is %s ", results.docs.length, JSON.stringify(results.docs[0]));
                    logger.info("time of the submissions")
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
        if (user_token)
           doc.token = user_token;

        doc.recordedat=new Date().getTime();

        doc.formatedtime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
        /*the data is stored as
        {
        token:     //token as index, for the sigined user, the token is the user_token
        status:    //submit or inprogress
        formdata: {    //the data received from client

        }
        }
        */
        //store the doc in db
        logger.debug('store the doc' + JSON.stringify(doc));
        logger.debug('at surveymanager, session_token is ' + user_token);

        //the primary key is auto generated to store multiple sets of answers of a user
        surveydb.insert(doc, null, function (err, body) {
             if (!err)
                 logger.info('stored correctly with information as ' + body);
             else
                 logger.warn(err);
        });

    };

    app.post('/survey/:status', function (req, res) {
        var user_token = req.session.session_token;
        var status = req.params.status;

        logger.debug('received form data is as ' + JSON.stringify(req.body));

        var data={};
        for (var i in req.body) {
            data.formdata = JSON.parse(i);
        }
        var validationResults;

        validationResults = surveySchema.validate(data);

        //the validation function is turned off temporarily
        //will be turned on after the JSON format is determined
        validationResults.valid = true;

        if (validationResults.valid) {

                storedoc(user_token, data, status);

                //return ok
                res.status(200).json({status:"ok"});

        } else {
            logger.warn('errors: ');

            for (var error in validationResults.errors){
                logger.warn(validationResults.errors[error]);
                res.status(406).json({status:"validation error"});
            }
        }
    });
};