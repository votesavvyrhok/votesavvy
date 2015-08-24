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

//using a different twitter library
var Twitter = require('twitter');

var twitterHdl = new Twitter({
    consumer_key: 'vf1TA6dx62BgDVIskWmILJKmb',
    consumer_secret: 'j54aUNcQWiWye5uR0QC6KfcTS3LNdDmj9PEfdQp9XwCIiO3tF5',
    access_token_key: '3252950317-fD19eCuzop2soZtO9ZjE47sGxJxCxreMvdfIN5G',
    access_token_secret: 'yHQgYCvz3P3L3ckfJFZBFaro5mGfMPxYf5Hyiw6ZHyggt'
});

//setting the timer for checking the memory usage with a period of 1 hour
//
var init="init";
/*
var memStateTypes={
    init:{
        key: "INIT",
        range: [0]
    },
    normal:{
        key: "NORMAL",
        range: [0,750]
    },
    warning: {
        key : "WARNING",
        range: [750, 950]
    },
    alarm1:{
        key : "ALARM-1",
        range: [950, 1050]
    },
    alarm2:{
        key : "ALARM-2",
        range: [1050, 1150]
    }
}
*/
//testing
var memStateTypes={
    init:{
        key: "INIT",
        range: [0]
    },
    normal:{
        key: "NORMAL",
        range: [0,140]
    },
    warning: {
        key : "WARNING",
        range: [140, 180]
    },
    alarm1:{
        key : "ALARM-1",
        range: [180, 220]
    },
    alarm2:{
        key : "ALARM-2",
        range: [220, 250]
    }
}

var memMonitor={
    state: memStateTypes.init,
    messages: 0,
    recordedusage: 0,
    increasedtimes:0
};

var updateMonitorState = function(previous, current, frequency){

    //progress the status first
    if (memMonitor.state === previous) {
        memMonitor.state = current;
        memMonitor.messages = frequency;
    }

    memMonitor.messages--;

    //send a message if the memory usage keeps increasing in the last 10 periods
    if (memMonitor.messages == 0) {
        var message = memMonitor.state.key + ": memory has increaed "+ memMonitor.increasedtimes
            + " times since the latest message sent at " + memMonitor.state.key
            + ", and the memory usage is " + memMonitor.recordedusage + "MB";
        twitterHdl.post('statuses/update', {status: message},  function(error, body, response){
            if(error)
                logger.error("tweet message error + " + JSON.stringify(body));
            else
                logger.info("tweet message success " + JSON.stringify(body));

        });

        memMonitor.messages = frequency;
        memMonitor.increasedtimes = 0;
    }
}

if (memMonitor.state === memStateTypes.init){

    var initmem = process.memoryUsage();
    memMonitor.recordedusage = Math.ceil(initmem.rss/1000/1000);
    updateMonitorState(memStateTypes.init,memStateTypes.normal, 1);
}

setInterval(function(){

    var mem = process.memoryUsage();

    //no need to handle the situation in the case
    //that the memory usage is lower than 700MB
    if (mem.rss <= memStateTypes.normal.range[1]) {
        //test sending
        return;
    }

    if (mem.rss > memMonitor.recordedusage ){
        memMonitor.increasedtimes++ ;
    }else
        memMonitor.imcreasedtimes=0;

    memMonitor.recordedusage = mem.rss;

    var memInt = Math.ceil(memMonitor.recordedusage/1000/1000);

    //if the memory usage is in the range of warning
    //send a warning message through twitter @votesavvyrhok
    if (memInt > memStateTypes.warning.range[0] &&
        memInt <= memStateTypes.warning.range[1])
    {
        updateMonitorState(memStateTypes.normal,memStateTypes.warning, 10);
        return;
    }

    //if the memory usage is in the range of alarm1
    //send a alarm1 message through twitter @votesavvyrhok
    if (memInt > memStateTypes.alarm1.range[0] &&
        memInt <= memStateTypes.alarm1.range[1])
    {
        updateMonitorState(memStateTypes.warning,memStateTypes.alarm1, 5);
        return;
    }

    //if the memory usage is in the range of alarm2
    //send a alarm1 message through twitter @votesavvyrhok
    if (memInt > memStateTypes.alarm2.range[0] &&
        memInt <= memStateTypes.alarm2.range[1])
    {
        updateMonitorState(memStateTypes.alarm1,memStateTypes.alarm2, 2);
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