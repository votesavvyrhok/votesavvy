/**
 * Created by a on 6/21/2015.
 */

module.exports= function(app,db) {

    var cfenv = require('cfenv');

// get the app environment from Cloud Foundry
    var appEnv = cfenv.getAppEnv();

//the key of votetweetanalysis in twitter application management
//this is under twitter account of Ying Qiao
//will be removed later
    var myConfig = {
        "consumerKey": "vf1TA6dx62BgDVIskWmILJKmb",
        "consumerSecret": "j54aUNcQWiWye5uR0QC6KfcTS3LNdDmj9PEfdQp9XwCIiO3tF5",
        "accessToken": "3252950317-fD19eCuzop2soZtO9ZjE47sGxJxCxreMvdfIN5G",
        "accessTokenSecret": "yHQgYCvz3P3L3ckfJFZBFaro5mGfMPxYf5Hyiw6ZHyggt",
        "callBackUrl": appEnv.url + "/signintwitters/step2"
    };

    var oauthStore = {};

    var twitterLibrary = require('twitter-node-client');

    var twitterHdl = new twitterLibrary.Twitter(myConfig);

    app.get('/signintwitters/step1', function (req, res) {

        var signinUrl = 'https://api.twitter.com/oauth/authenticate?oauth_token=';

        console.log("you are at step 1 now");

        //retrieve the oauth request token
        twitterHdl.getOAuthRequestToken(function (oauth) {
            if (oauth != null) {
                console.log(oauth);
                oauthStore[oauth.token] = oauth.token_secret;
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
                    next(oauth);
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
            "token_secret": oauthStore[oauth_token],
            "verifier": oauth_verifier
        }

        console.log("oauthStep2: " + JSON.stringify(oauthStep2));

        getOAuthAccessToken(oauthStep2, function (oauth) {
            if (oauth == null) {
                console.log("error on retrieving access token");
                res.status(500).send("error on retrieving request token");
            }
            else {
                oauthStore[oauth.access_token] = oauth.access_token_secret;
                console.log(oauthStore);
                delete  oauthStore[oauth_token];
                console.log(JSON.stringify(oauthStore));
                db.insert(oauth, null, function(err, body){
                    if (!err)
                        console.log(body);
                });
                res.redirect("/signintwitters/step3");
            }
        });

    });

    app.get('/signintwitters/step3', function (req, res) {

        console.log("you are at step3 now");

        res.redirect("/");
    });
}