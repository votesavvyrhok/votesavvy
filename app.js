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

var async = require('async');

var database;

// create a new express server
var app = express();

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

var dbCredentials = {
    dbNames: {
        //   voters: "voters",  //store the original answers of samplers in a survey
        survey: "answers",
        signintwitters: "twitterusers", //store the samplers' information collected from twitter
        //tweets: 'tweets'            //store the tweets collected from twitter
        preferences:"preferences"

    },
    dbs: {},
};

var cloudant;


function useDatabase(next) {

    /*
    cloudant.db.create(dbCredentials.databaseName, function (err, res) {
        if (err) {
            console.log('database already created');
        }

    });

    cloudant.db.list(function (err, all_dbs) {
        console.log('All my databases: %s', all_dbs.join(', '))
    });

    database = cloudant.use(dbCredentials.databaseName);

    callback();
    */

    async.forEach(Object.keys(dbCredentials.dbNames), function (name, callback) {

        cloudant.db.create(dbCredentials.dbNames[name], function (err, res) {
            if (err) {
                console.log('database ' + dbCredentials.dbNames[name] + ' already created');
            } else {
                console.log('database ' + dbCredentials.dbNames[name] + ' is created');
            }
            dbCredentials.dbs[name] = cloudant.use(dbCredentials.dbNames[name]);

            callback();
        });
    }, function (err) {

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
            dbs: [dbCredentials.dbs.survey,dbCredentials.dbs.preferences]
        },
        signintwitters:{
            name:"signintwitters.js",
            dbs:[dbCredentials.dbs.signintwitters]

        },
        preferences:{
            name:"preferencemanager.js",
            dbs:[dbCredentials.dbs.preferences]
        }
    }


    for (api in apis)
    {
        require('./routes/' + apis[api].name)(app, apis[api].dbs);
    }
}

initializeDatabase(apiMapping);

console.log('votesavvy application running');