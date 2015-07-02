/**
 * Created by a on 6/21/2015.
 */

module.exports= function(app,db) {

    var signindb=db[0];

    // get the app environment from Cloud Foundry
    var cfenv = require('cfenv');
    var appEnv = cfenv.getAppEnv();

    var uuid = require('node-uuid');

    var survey = require('./surveymanager.js');
    var preference = require('./preferencemanager.js');

    //JSON structure of the documents in twitterusers signindb
    /*
    {
        user_id: 1123213    //twitter user_id as the primary key
        screen_name: votesavvyrhok  //the screen_name of the user
        user_tokem: uuid    // the user identifier in votesavvyrhok
    }
    */
    //the key of votesavvyrhok app under twitter account votesavvyrhok
    //in twitter application management


    var myConfig = {
        "consumerKey": "vf1TA6dx62BgDVIskWmILJKmb",
        "consumerSecret": "j54aUNcQWiWye5uR0QC6KfcTS3LNdDmj9PEfdQp9XwCIiO3tF5",
        "accessToken": "3252950317-fD19eCuzop2soZtO9ZjE47sGxJxCxreMvdfIN5G",
        "accessTokenSecret": "yHQgYCvz3P3L3ckfJFZBFaro5mGfMPxYf5Hyiw6ZHyggt",
        "callBackUrl": appEnv.url + "/signintwitters/step2"
    };

    //stores the temporarily information of a user during the signing in procedure
    //for each sign in user, it stores the request token secret and generates a client token
    //the client token is a random number
    var oauthStore = {};

    var twitterLibrary = require('twitter-node-client');

    var twitterHdl = new twitterLibrary.Twitter(myConfig);

    app.get('/signintwitters/step1', function (req, res) {

        var signinUrl = 'https://api.twitter.com/oauth/authenticate?oauth_token=';

        console.log("you are at step 1 now");

        var usertoken={};

        //retrieve the oauth request token
        twitterHdl.getOAuthRequestToken(function (oauth) {
            if (oauth != null) {
                console.log(oauth);

                //store the user tokens in the oauthStore temporarily
                usertoken.token_secret = oauth.token_secret;
                //the client token is a uuid
                usertoken.client_token = uuid.v4();
                oauthStore[oauth.token] = usertoken;

                //redirect to the Twitter sign in URL
                signinUrl = signinUrl + oauth.token;
                console.log('sign in url: ' + signinUrl);
                console.log('oauthStore: ' + JSON.stringify(oauthStore));
                res.redirect(signinUrl);
            }
            else {
                console.log("error on retrieving request token");
                res.status(500).send("error on retrieving request token");

            }
        });
    });

    app.get('/signintwitters/user/:username', function (req, res) {

            var username = req.params.username;

            var user = twitterHdl.getUser({screen_name: username}, function (error) {
                res.status(500).send("error on retrieving user:" + username);
            }, function (body) {
                console.log(body);
                res.send(body);

            });
        }
    )

    var getOAuthAccessToken = function (oauth, next) {
        twitterHdl.oauth.getOAuthAccessToken(oauth.token, oauth.token_secret, oauth.verifier,
            function (error, oauth_access_token, oauth_access_token_secret, results) {
                if (error) {
                    console.log('ERROR: ' + error);
                    next();
                } else {
                    oauth.access_token = oauth_access_token;
                    oauth.access_token_secret = oauth_access_token_secret;

                    console.log('oauth.token: ' + oauth.token);
                    console.log('oauth.token_secret: ' + oauth.token_secret);
                    console.log('oauth.access_token: ' + oauth.access_token);
                    console.log('oauth.access_token_secret: ' + oauth.access_token_secret);
                    next(oauth,results);
                }
            }
        );
    };

    app.get('/signintwitters/step2', function (req, res) {
        var oauth_token = req.query.oauth_token;

        var oauth_verifier = req.query.oauth_verifier;

        console.log("you are at step 2 now");

        console.log("oauthStore: " + JSON.stringify(oauthStore));

        var oauthStep2 = {
            "token": oauth_token,
            "token_secret": oauthStore[oauth_token].token_secret,
            "verifier": oauth_verifier
        }

        console.log("oauthStep2: " + JSON.stringify(oauthStep2));

        getOAuthAccessToken(oauthStep2, function (oauth, results) {
            if (oauth == null) {
                console.log("error on retrieving access token");
                res.status(500).send("error on retrieving request token");
            }
            else {

                var twitteruserinfo = {
                    user_id: results.user_id,
                    screen_name: results.screen_name,
                    user_token: oauthStore[oauth_token].client_token,
                }

                delete  oauthStore[oauth_token];
                console.log('oauthStore' + JSON.stringify(oauthStore));
                console.log('twitteruserinfo' + JSON.stringify(twitteruserinfo));

                //if the document of the user is not in the signindb then write it in to the signindb
                //verify if the user exists in the db or not

                signindb.get(twitteruserinfo.user_id, function (err, body) {
                    if (!err)
                    //the user exists
                        res.redirect("/signintwitters/step3?session=" + body.user_token
                            + "&screen_name=" + body.screen_name
                            + "&new=false");

                    else {
                        //new user
                        signindb.insert(twitteruserinfo, twitteruserinfo.user_id, function (err, body) {
                            if (!err)
                                console.log(body);
                        });
                        res.redirect("/signintwitters/step3?session=" + twitteruserinfo.user_token
                            + "&screen_name=" + twitteruserinfo.screen_name
                            + "&new=true");
                    }

                });
            }
        });
    });

    app.get('/signintwitters/step3', function (req, res) {

        var sess = req.session;

        //add session management here:
        //currently the session id is the user's user_token
        //session id and user token will be separated eventually
        req.session.session_token = req.query.session;
        req.session.screen_name = req.query.screen_name;

        console.log("at siginstep3, user's session_token is" + sess.session_token);
        console.log("at siginstep3, user's screen_name is" + sess.screen_name);
        //if there is no survey data

        //if the user signning up just now
        res.redirect("/");


    });

    app.get('/signintwitters/logout', function (req, res) {

        req.session.destroy(function(err){
            if(err){
                console.log(err);
            }
            else
            {
                res.redirect('/');
            }
        });

    });

}