/*jshint node:true*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as it's web server
// for more info, see: http://expressjs.com
var express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

require('dotenv').load();

// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, appEnv.bind, function() {

	// print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});


var hostname = process.env.cloudant_hostname;
var me = process.env.cloudant_username;
var password = process.env.cloudant_password;

var cloudant = require('cloudant')({hostname: hostname, account: me, password: password});

cloudant.db.list(function (err, all_dbs) {
    console.log('All my databases: %s', all_dbs.join(', '))
});