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

var app = express();

var mongoDBuri;

var initialMongoDBuri = function(){

    var vcapServices;
    if (process.env.VCAP_SERVICES)
        vcapServices = JSON.parse(process.env.VCAP_SERVICES);

    if (vcapServices && vcapServices.mongolab){
        mongoDBuri= vcapServices.mongolab[0].credentials.uri;
    }else{

        if (process.env.mongodb_uri)
            mongoDBuri = process.env.mongodb_uri;
    }
}

initialMongoDBuri();

var log4js = require('log4js');
var mongoAppender = require('log4js-node-mongodb');

var categories = ['index','signin','survey','represent','application'];

categories.forEach(function(category){
    log4js.addAppender(
        mongoAppender.appender({connectionString: mongoDBuri}),
        category);
});

app.locals.log4js = log4js;

var logger = log4js.getLogger('application');

//for the memory watch;
var memwatch = require('memwatch-next');

memwatch.on('leak', function(info){
    logger.error("leak:" + JSON.stringify(info));
});

memwatch.on('stats', function(stats){
    logger.info("stats:" + JSON.stringify(stats));
});

var async = require('async');

// create a new express server

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
    logger.info('server starting on ' + appEnv.url);
});

//for session management
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

app.use(session({
    secret: "thisisasecret",
    saveUninitialized: false,
    resave: false,
    store: new MongoStore({url:mongoDBuri}),
    ttl:5*24*60*60 //5 days expiration
}));

//set up logging for the request
var mongoMorgan = require('mongo-morgan');

app.use(mongoMorgan(mongoDBuri,'combined',{immediate: true,
                                           collection:'morganlogs'}));

//DataCache
var datacache = require('./bluemix_datacache.js');
app.locals.datacache = datacache;

//twitter handler is moved here

var twitterLibrary = require('twitter-node-client').Twitter;

var myConfig = {
    "consumerKey": "vf1TA6dx62BgDVIskWmILJKmb",
    "consumerSecret": "j54aUNcQWiWye5uR0QC6KfcTS3LNdDmj9PEfdQp9XwCIiO3tF5",
    "accessToken": "3252950317-fD19eCuzop2soZtO9ZjE47sGxJxCxreMvdfIN5G",
    "accessTokenSecret": "yHQgYCvz3P3L3ckfJFZBFaro5mGfMPxYf5Hyiw6ZHyggt",
    "callBackUrl": appEnv.url + "/signintwitters/step2"
};

var twitterHdl = new Twitter(myConfig);

app.locals.twitterHdl = twitterHdl;

//setting the timer for checking the memory usage with a period of 1 hour
//
var init="init";
var normal = "NORMAL";
var warning = "WARNING";
var alarm1 = "ALARM-1";
var alarm2 = "ALARM-2";

var memMonitor={
    staus: init,
    messages: 0,
    recordedusage: 0,
    increasedtimes:0
};

var updateMonitorStatus = function(previous, current, frequency){

    //progress the status first
    if (memMonitor.status === previous) {
        memMonitor.status = current;
        memMonitor.messages = frequency;
    }

    memMonitor.messages--;

    //send a message if the memory usage keeps increasing in the last 10 periods
    if (memMonitor.messages == 0) {
        var message = current + ": memory has increaed "+ memMonitor.increasedtimes + " times since the latest message of " + memMonitor.status +", and the memory usage is at " + JSON.stringify(res);

        twitterHdl.postTweet(message,function(err, response, body){
            logger.error("tweet message error + " + JSON.stringify(body));
        }, function(success){
            logger.info("tweet message success " + JSON.stringfy(success));
        })

        memMonitor.messages = frequency;
        memMonito.increasedtimes = 0;
    }
}

setInterval(function(){

    var mem = process.memoryUsage();

    if (memMonitor.status === init)
        updateMonitorStatus(init,normal, 1);

    //no need to handle the situation in the case
    //that the memory usage is lower than 700MB
    if (mem.res <= 700*1000*1000) {
        //test sending
        return;
    }

    if (mem.res > recordedusage ){
        increasedtimes++ ;
    }else
        imcreasedtimes=0;

    recordedusage = mem.res;

    //if the memory usage is hight than 1.1G
    //send an alarm2 message through twitter @votesavvyrhok
    if (mem.res > 1050*1000*1000)
    {
        updateMonitorStatus(alarm1, alarm2, 2);
        return;
    }

    //if the memory usage is higher than 900MB
    //send a alarm1 message through twitter @votesavvyrhok
    if (mem.res > 950*1000*1000)
    {
        updateMonitorStatus(warning, alarm1, 5);
        return;
    }

    //if the memory usage is higher than 700MB
    //send a warning message through twitter @votesavvyrhok
    if (mem.res > 700*1000*1000)
    {
        updateMonitorStatus(normal,warning, 10);
        return;
    }
}, 60*60*1000);

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
                logger.warn('database ' + dbCredentials.dbs[db].name + ' already created');
            } else {
                logger.info('database ' + dbCredentials.dbs[db].name + ' is created');
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
                fields: [
                    {"token": "desc"},
                    {"recordedat": "desc"}
                ]
            }
        };

        answersdb.index(user, function(err, response) {
                if (err)
                    logger.warn("create index error" + JSON.stringify(err));
                else
                    dbCredentials.dbs.survey.indexes.user=response;

            logger.info('Index creation result: ', JSON.stringify(response));

        });

        next();

        cloudant.db.list(function (err, all_dbs) {
            logger.info('All my databases: %s', all_dbs.join(', '));
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

logger.info('votesavvy application running');