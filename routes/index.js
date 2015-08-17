module.exports = function (app) {
    app.get('/', function (req, res) {
        console.log("receive a get request" + JSON.stringify(req.headers));
       res.render('app/index.html', {screen_name: null});

    });
};