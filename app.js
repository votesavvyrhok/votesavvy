/*jshint node:true*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

require('dotenv').load();

// This application uses express as it's web server
// for more info, see: http://expressjs.com
var express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');
var https = require('https');
var JSON = require('JSON');

var datacache = require('./bluemix_datacache.js');

var async = require('async');

// create a new express server
var app = express();

require('./routes/index')(app);
// routing
require('./routes/represent')(app);

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/public');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, appEnv.bind, function () {

    // print a message when the server starts listening
    console.log('server starting on ' + appEnv.url);
});

//for session management
var session = require('express-session');

app.use(session({
    secret: "thisisasecret",
    name: "votesavvycookie",
    resave: true,
    saveUninitialized: true
}));

//DataCache
app.locals.datacache = datacache;


var dbCredentials = {
    dbs: {
        survey: {
            name: "answers",
            handler: null,
            indexes: {}
        },
        signintwitters: {
            name: "twitterusers",
            handler: null
        }

    }
};

var cloudant;

function useDatabase(next) {
    async.forEach(Object.keys(dbCredentials.dbs), function (db, callback) {
        cloudant.db.create(dbCredentials.dbs[db].name, function (err, res) {
            if (err) {
                console.log('database ' + dbCredentials.dbs[db].name + ' already created');
            } else {
                console.log('database ' + dbCredentials.dbs[db].name + ' is created');
            }
            dbCredentials.dbs[db].handler = cloudant.use(dbCredentials.dbs[db].name);

            callback();
        });
    }, function (err) {

        //create the index on answers db here,
        //the index is upon the field of user_token;
        var answersdb = dbCredentials.dbs.survey.handler;
        var user = {
            name: 'user',
            type: 'json',
            index: {
                selector:{
                    "token": {
                        "$exists":true
                    }
                },
                fields: [
                    {"token": "desc"},
                    {"recordedat": "desc"}
                ]
            }
        };

        answersdb.index(user, function(err, response) {
                if (err)
                    console.log("create index error" + JSON.stringify(err));
                else
                    dbCredentials.dbs.survey.indexes.user=response;

             console.log('Index creation result: ', JSON.stringify(response));

        });

        next();

        cloudant.db.list(function (err, all_dbs) {
            console.log('All my databases: %s', all_dbs.join(', '));
        });
    });
}

function initializeDatabase(callback) {

    if (process.env.VCAP_SERVICES) {
        var vcapServices = JSON.parse(process.env.VCAP_SERVICES);

        if (vcapServices.cloudantNoSQLDB) {

            var credentials = vcapServices.cloudantNoSQLDB[0].credentials;

            dbCredentials.host = credentials.host;
            dbCredentials.port = credentials.port;
            dbCredentials.user = credentials.username;
            dbCredentials.password = credentials.password;
            dbCredentials.url = credentials.url;
        }

        cloudant = require('cloudant')(dbCredentials.url);

        useDatabase(callback);
    } else {

        if (process.env.cloudant_hostname && process.env.cloudant_username && process.env.cloudant_password) {
            dbCredentials.host = process.env.cloudant_hostname;
            dbCredentials.user = process.env.cloudant_username;
            dbCredentials.password = process.env.cloudant_password;

            cloudant = require('cloudant')({
                hostname: dbCredentials.host,
                account: dbCredentials.user,
                password: dbCredentials.password
            });

            useDatabase(callback);
        }
    }

}

function apiMapping() {

    var apis={
        survey:{
            name: "surveymanager.js",
            db: dbCredentials.dbs.survey
        },
        signintwitters:{
            name:"signintwitters.js",
            db:dbCredentials.dbs.signintwitters

        }
    };


    for (var api in apis)
    {
        require('./routes/' + apis[api].name)(app, apis[api].db);
    }
}

initializeDatabase(apiMapping);

console.log('votesavvy application running');