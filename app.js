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

app.get('/survey', function (req, res) {
    res.render('app/index.html');
});

var dbCredentials = {
    dbNames: {
        //   voters: "voters",  //store the original answers of samplers in a survey
        signintwitters: "signintwitters", //store the samplers' information collected from twitter
        //tweets: 'tweets'            //store the tweets collected from twitter
    },
    dbs: {},
    dbAPIs: {}
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
            callback();
        });
    }, function (err) {

        for (i in dbCredentials.dbNames)
            next(dbCredentials.dbNames[i]);

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

function apiMappingDB(dbName) {

    dbCredentials.dbs[dbName] = cloudant.use(dbName);

    dbCredentials.dbAPIs[dbName] = require('./routes/' + dbName)(app, dbCredentials.dbs[dbName]);

    dbCredentials.dbAPIs[dbName];

}

initializeDatabase(apiMappingDB);

console.log('votesavvy application running');