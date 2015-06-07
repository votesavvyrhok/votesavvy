/**
 * Created by a on 6/6/2015.
 */

module.exports=function(app) {




    // ROUTES FOR OUR API
    // =============================================================================
    //var router = express.Router();              // get an instance of the express Router

    // test route to make sure everything is working (accessed at GET http://localhost:8080/api)
    app.get('/api/', function (req, res) {
        res.json({message: 'hooray! welcome to our api!'});
    });

    // more routes for our API will happen here

    app.post('/api/vote', function (req, res) {
        res.json(req.body);
        //res.body(req.body);
        console.log(req.body);
    });

    // REGISTER OUR ROUTES -------------------------------
    // all of our routes will be prefixed with /api


}