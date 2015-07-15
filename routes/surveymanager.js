module.exports = function (app, db) {

    var surveydb = db[0];

    var preferencedb = db[1];

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
                        "type": "number",
                        "minimum": 0,
                        "maximum": 2
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
                        "type": "number",
                        "minimum": 0,
                        "maximum": 10
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

    var preference = require('./preferencemanager.js')(app, [preferencedb]);

    app.get('/survey', function (req, res) {

        //render the blank survey form in the case that no session has been defined
        var user_token = req.session.session_token;
        var screen_name = req.session.screen_name;

        var data = {};

        if (!user_token) {
            res.render('app/index.html', {screen_name: null});
        }
        else {
            surveydb.get(user_token, {rev_info: true}, function (err, results) {
                if (err) {
                    res.render('app/index.html', {screen_name: screen_name});
                } else {
                    results.screen_name = screen_name;

                    res.send(results);
                }
            });
        }
    });

    var storedoc = function (user_token, data, status, next) {
        var doc = data;
        doc.status = status;
        doc.token = user_token;

        //store the doc in db
        console.log('store the doc' + JSON.stringify(doc));
        console.log('at surveymanager, session_token is ' + user_token);

        surveydb.get(user_token, function (err, body) {
            if (err) {
                //There is no doc of the answer exists
                surveydb.insert(doc, user_token, function (err, body) {
                    if (!err)
                        console.log(body);
                    else
                        console.log(err);
                    next();
                });

            } else {
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
    };

    app.post('/survey/:status', function (req, res) {
        var user_token = req.session.session_token;
        var status = req.params.status;

        //not store the answer in the case the survey is inprogress and the user is not in signing in state
        if (!user_token && status == 'submit')
            user_token = uuid.v4();

        console.log('received form data is as ' + JSON.stringify(req.body));

        var data;
        for (var i in req.body) {
            data = JSON.parse(i);
        }
        var validationResults = surveySchema.validate(data);

        if (validationResults.valid) {
            if (user_token) {
                storedoc(user_token, data, status, function () {
                    if (status == 'submit') {
                        preference.generatepref(user_token, data, function (preference) {
                            if (req.session.session_token) {
                                res.send(preference);
                            }
                            else
                                res.send(preference);

                        });
                    }
                    else {
                        var results = req.body;
                        results.screen_name = req.session.screen_name;
                        res.render('app/index.html');
                    }
                });
            }
        } else {
            console.log('errors: ');
            for (var error in validationResults.errors){
                console.log(validationResults.errors[error]);
            }
        }
    });
};