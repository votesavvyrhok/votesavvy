/**
 * Created by a on 6/6/2015.
 */

module.exports=function(app,cloudant) {

    var bodyParser = require('body-parser');

// configure app to use bodyParser()
// this will let us get the data from a POST
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    // ROUTES FOR OUR API
    // =============================================================================
    //var router = express.Router();              // get an instance of the express Router

    // test route to make sure everything is working (accessed at GET http://localhost:8080/api)
    app.get('/api/', function (req, res) {
        res.json({message: 'hooray! welcome to our api!'});
    });

    // more routes for our API will happen here

    app.post('/api/vote', function (req, res) {

        console.log(req.body);

        var voters =cloudant.use('voters');


        voters.insert(req.body, req.body[0], function(err, body){

            if (!err)
                console.log(body);
        });

        res.json(req.body);



    });

    // REGISTER OUR ROUTES -------------------------------
    // all of our routes will be prefixed with /api


}